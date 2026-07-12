"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ------------------------------------------------------------------ */
/*  Mineral tiers                                                      */
/* ------------------------------------------------------------------ */
interface Mineral {
  name: string;
  emoji: string;
  value: number;
  minDepth: number;
  color: string;
  bg: string;
}

const MINERALS: Mineral[] = [
  { name: "石头",   emoji: "🪨", value: 1,   minDepth: 0,   color: "text-stone-300",   bg: "from-stone-700 to-stone-900" },
  { name: "铜矿",   emoji: "🟤", value: 5,   minDepth: 10,  color: "text-amber-600",   bg: "from-amber-800 to-amber-950" },
  { name: "铁矿",   emoji: "⛓️", value: 15,  minDepth: 25,  color: "text-slate-300",   bg: "from-slate-600 to-slate-800" },
  { name: "银矿",   emoji: "🥄", value: 40,  minDepth: 50,  color: "text-slate-100",   bg: "from-slate-400 to-slate-600" },
  { name: "金矿",   emoji: "🟡", value: 100, minDepth: 100, color: "text-yellow-400",  bg: "from-yellow-600 to-yellow-800" },
  { name: "钻石",   emoji: "💎", value: 300, minDepth: 200, color: "text-cyan-300",    bg: "from-cyan-600 to-blue-900" },
];

function getMineralIndex(depth: number): number {
  let idx = 0;
  for (let i = 0; i < MINERALS.length; i++) {
    if (depth >= MINERALS[i].minDepth) idx = i;
  }
  return idx;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmt(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9)  return (n / 1e9).toFixed(2)  + "B";
  if (n >= 1e6)  return (n / 1e6).toFixed(2)  + "M";
  if (n >= 1e3)  return (n / 1e3).toFixed(1)  + "K";
  return Math.floor(n).toString();
}

const SAVE_KEY = "mine-tycoon-save-v1";

interface SaveData {
  ore: number;
  totalOre: number;
  depthLevel: number;
  drillLevel: number;
  minerCount: number;
  cartLevel: number;
  prestigeCount: number;
  lastSave: number;
}

interface FloatText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function MineTycoonPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"start" | "playing" | "paused">("start");

  /* ---- display state (synced from ref) ---- */
  const [ore, setOre] = useState(0);
  const [totalOre, setTotalOre] = useState(0);
  const [depthLevel, setDepthLevel] = useState(0);
  const [drillLevel, setDrillLevel] = useState(1);
  const [minerCount, setMinerCount] = useState(0);
  const [cartLevel, setCartLevel] = useState(0);
  const [prestigeCount, setPrestigeCount] = useState(0);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [offlineMsg, setOfflineMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [clickPulse, setClickPulse] = useState(0);

  /* ---- refs ---- */
  const gsRef = useRef<SaveData>({
    ore: 0, totalOre: 0, depthLevel: 0, drillLevel: 1,
    minerCount: 0, cartLevel: 0, prestigeCount: 0, lastSave: Date.now(),
  });
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastUiSyncRef = useRef(0);
  const lastScoreRef = useRef(0);
  const lastSaveRef = useRef(0);
  const floatIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ---- derived values ---- */
  const depth = depthLevel * 5;
  const mineralIdx = getMineralIndex(depth);
  const mineral = MINERALS[mineralIdx];
  const nextMineral = mineralIdx < MINERALS.length - 1 ? MINERALS[mineralIdx + 1] : null;
  const cartMult = 1 + cartLevel * 0.1;
  const prestigeMult = 1 + prestigeCount * 0.15;
  const manualOutput = drillLevel * mineral.value * cartMult * prestigeMult;
  const autoOutput = minerCount * 0.5 * mineral.value * cartMult * prestigeMult;

  const drillCost = Math.floor(10 * Math.pow(1.5, drillLevel));
  const minerCost = Math.floor(25 * Math.pow(1.3, minerCount));
  const cartCost  = Math.floor(50 * Math.pow(2, cartLevel));
  const depthCost = Math.floor(20 * Math.pow(1.8, depthLevel));

  const canPrestige = depth >= 100;
  const prestigeGain = canPrestige ? Math.max(1, Math.floor(Math.sqrt(gsRef.current.totalOre / 5000))) : 0;

  /* ---- mount: load save + offline earnings ---- */
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data: SaveData = JSON.parse(raw);
        const now = Date.now();
        const awaySec = Math.min((now - data.lastSave) / 1000, 28800); // cap 8h
        if (awaySec > 10 && data.minerCount > 0) {
          const mIdx = getMineralIndex(data.depthLevel * 5);
          const cMult = 1 + data.cartLevel * 0.1;
          const pMult = 1 + data.prestigeCount * 0.15;
          const auto = data.minerCount * 0.5 * MINERALS[mIdx].value * cMult * pMult;
          const earned = auto * awaySec;
          data.ore += earned;
          data.totalOre += earned;
          const mins = Math.floor(awaySec / 60);
          setOfflineMsg(`欢迎回来！离线 ${mins} 分钟，获得 ${fmt(earned)} 矿石`);
          const t = setTimeout(() => setOfflineMsg(""), 5000);
          timersRef.current.push(t);
        }
        gsRef.current = { ...data, lastSave: now };
        syncUi();
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- sync ref -> state ---- */
  const syncUi = useCallback(() => {
    const g = gsRef.current;
    setOre(g.ore);
    setTotalOre(g.totalOre);
    setDepthLevel(g.depthLevel);
    setDrillLevel(g.drillLevel);
    setMinerCount(g.minerCount);
    setCartLevel(g.cartLevel);
    setPrestigeCount(g.prestigeCount);
  }, []);

  /* ---- game loop ---- */
  useEffect(() => {
    if (phase !== "playing") return;

    const loop = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = Math.min((ts - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = ts;

      const g = gsRef.current;
      const mIdx = getMineralIndex(g.depthLevel * 5);
      const cMult = 1 + g.cartLevel * 0.1;
      const pMult = 1 + g.prestigeCount * 0.15;
      const auto = g.minerCount * 0.5 * MINERALS[mIdx].value * cMult * pMult;
      const gain = auto * dt;
      g.ore += gain;
      g.totalOre += gain;

      // UI sync every 100ms
      if (ts - lastUiSyncRef.current > 100) {
        lastUiSyncRef.current = ts;
        syncUi();
      }
      // Score submit every 30s
      if (ts - lastScoreRef.current > 30000) {
        lastScoreRef.current = ts;
        submitScore("mine-tycoon", Math.floor(g.totalOre));
        setRefreshKey(k => k + 1);
      }
      // Save every 5s
      if (ts - lastSaveRef.current > 5000) {
        lastSaveRef.current = ts;
        g.lastSave = Date.now();
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(g)); } catch { /* ignore */ }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = 0;
    lastUiSyncRef.current = 0;
    lastScoreRef.current = 0;
    lastSaveRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, syncUi]);

  /* ---- save on unmount ---- */
  useEffect(() => {
    return () => {
      const g = gsRef.current;
      g.lastSave = Date.now();
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(g)); } catch { /* ignore */ }
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  /* ---- pause hotkey ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phaseRef.current === "playing") setPhase("paused");
        else if (phaseRef.current === "paused") setPhase("playing");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---- actions ---- */
  const handleMine = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const g = gsRef.current;
    const mIdx = getMineralIndex(g.depthLevel * 5);
    const cMult = 1 + g.cartLevel * 0.1;
    const pMult = 1 + g.prestigeCount * 0.15;
    const gain = g.drillLevel * MINERALS[mIdx].value * cMult * pMult;
    g.ore += gain;
    g.totalOre += gain;

    // float text
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++floatIdRef.current;
    const ft: FloatText = { id, x, y, text: "+" + fmt(gain), color: MINERALS[mIdx].color };
    setFloatTexts(prev => [...prev, ft]);
    const t = setTimeout(() => {
      setFloatTexts(prev => prev.filter(f => f.id !== id));
    }, 1000);
    timersRef.current.push(t);

    setClickPulse(p => p + 1);
    setOre(g.ore);
    setTotalOre(g.totalOre);
  }, []);

  const buyDrill = () => {
    const g = gsRef.current;
    const cost = Math.floor(10 * Math.pow(1.5, g.drillLevel));
    if (g.ore >= cost) {
      g.ore -= cost;
      g.drillLevel++;
      syncUi();
    }
  };
  const buyMiner = () => {
    const g = gsRef.current;
    const cost = Math.floor(25 * Math.pow(1.3, g.minerCount));
    if (g.ore >= cost) {
      g.ore -= cost;
      g.minerCount++;
      syncUi();
    }
  };
  const buyCart = () => {
    const g = gsRef.current;
    const cost = Math.floor(50 * Math.pow(2, g.cartLevel));
    if (g.ore >= cost) {
      g.ore -= cost;
      g.cartLevel++;
      syncUi();
    }
  };
  const buyDepth = () => {
    const g = gsRef.current;
    const cost = Math.floor(20 * Math.pow(1.8, g.depthLevel));
    if (g.ore >= cost) {
      g.ore -= cost;
      g.depthLevel++;
      syncUi();
    }
  };
  const doPrestige = () => {
    const g = gsRef.current;
    if (g.depthLevel * 5 < 100) return;
    const gain = Math.max(1, Math.floor(Math.sqrt(g.totalOre / 5000)));
    g.prestigeCount += gain;
    g.ore = 0;
    g.totalOre = 0;
    g.depthLevel = 0;
    g.drillLevel = 1;
    g.minerCount = 0;
    g.cartLevel = 0;
    syncUi();
  };

  const startGame = () => {
    setPhase("playing");
    syncUi();
  };

  /* ---- stats for shell ---- */
  const stats: GameStat[] = [
    { label: "矿石", value: fmt(ore), icon: "⛏️" },
    { label: "深度", value: depth + "m", icon: "📉" },
    { label: "矿工", value: minerCount, icon: "👷" },
    { label: "转生", value: prestigeCount, icon: "✨" },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <GameShell
      gameId="mine-tycoon"
      title="矿业大亨"
      iconEmoji="⛏️"
      iconGradient="from-amber-500 to-orange-700"
      stats={stats}
      shareScore={Math.floor(totalOre)}
      refreshKey={refreshKey}
    >
      <div className="relative min-h-[600px] p-4">
        {/* ---------- START SCREEN ---------- */}
        {phase === "start" && (
          <div className="flex min-h-[600px] flex-col items-center justify-center gap-6 p-8 text-center">
            <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${mineral.bg} text-6xl shadow-2xl`}>
              {mineral.emoji}
            </div>
            <h2 className="text-3xl font-bold text-white">矿业大亨</h2>
            <p className="max-w-md text-gray-400">
              点击矿洞手动挖矿，雇佣矿工自动产出，升级钻头和矿车提升效率。
              向深挖掘解锁更珍贵的矿物，转生获得永久加速！
            </p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {MINERALS.map(m => (
                <div key={m.name} className={`rounded-xl bg-gray-800/60 px-3 py-2 ${m.color}`}>
                  <div className="text-2xl">{m.emoji}</div>
                  <div>{m.name}</div>
                  <div className="text-xs text-gray-500">值 {m.value}</div>
                </div>
              ))}
            </div>
            <button
              onClick={startGame}
              aria-label="开始挖矿"
              className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            >
              开始挖矿
            </button>
            {offlineMsg && (
              <div className="rounded-xl bg-green-900/60 px-4 py-2 text-sm text-green-300">
                {offlineMsg}
              </div>
            )}
          </div>
        )}

        {/* ---------- PLAYING / PAUSED ---------- */}
        {(phase === "playing" || phase === "paused") && (
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            {/* Mine area */}
            <div className="flex flex-col items-center gap-4">
              {/* ore counter */}
              <div className="w-full rounded-2xl bg-gray-800/60 p-4 text-center">
                <div className="text-sm text-gray-400">当前矿石</div>
                <div className="text-4xl font-bold text-amber-400">{fmt(ore)}</div>
                <div className="mt-1 text-xs text-gray-500">
                  自动产出: {fmt(autoOutput)}/秒 | 手动产出: +{fmt(manualOutput)}/次
                </div>
              </div>

              {/* mine button */}
              <div className="relative">
                <button
                  onClick={handleMine}
                  aria-label="挖矿"
                  className={`relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br ${mineral.bg} shadow-2xl transition active:scale-95`}
                  style={{ animation: clickPulse ? "minePulse 0.2s" : undefined }}
                >
                  <span className="text-7xl drop-shadow-lg">{mineral.emoji}</span>
                  {/* depth rings */}
                  <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1 text-sm text-white">
                    深度 {depth}m · {mineral.name}
                  </div>
                </button>
                {/* float texts */}
                {floatTexts.map(ft => (
                  <span
                    key={ft.id}
                    className={`pointer-events-none absolute text-lg font-bold ${ft.color}`}
                    style={{
                      left: ft.x, top: ft.y,
                      animation: "floatUp 1s ease-out forwards",
                    }}
                  >
                    {ft.text}
                  </span>
                ))}
              </div>

              {/* depth progress to next mineral */}
              {nextMineral && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>距 {nextMineral.name}</span>
                    <span>{nextMineral.minDepth - depth}m</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                      style={{
                        width: `${Math.min(100, ((depth - mineral.minDepth) / (nextMineral.minDepth - mineral.minDepth)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* prestige panel */}
              <div className="w-full rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-purple-300">转生系统</div>
                    <div className="text-xs text-gray-400">
                      当前加成: +{(prestigeCount * 15).toFixed(0)}% | 可获得: +{prestigeGain} 点
                    </div>
                  </div>
                  <button
                    onClick={doPrestige}
                    disabled={!canPrestige}
                    aria-label="转生重置"
                    className="flex h-11 items-center rounded-xl bg-purple-600 px-4 text-sm font-medium text-white transition hover:bg-purple-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {canPrestige ? "转生" : `需深度100m`}
                  </button>
                </div>
              </div>
            </div>

            {/* Upgrades panel */}
            <div className="flex flex-col gap-3">
              <UpgradeCard
                icon="🔩"
                name="升级钻头"
                desc={`手动产出 +1 (当前 Lv.${drillLevel})`}
                cost={drillCost}
                affordable={ore >= drillCost}
                onClick={buyDrill}
              />
              <UpgradeCard
                icon="👷"
                name="雇佣矿工"
                desc={`自动产出 +0.5/s (当前 ${minerCount}人)`}
                cost={minerCost}
                affordable={ore >= minerCost}
                onClick={buyMiner}
              />
              <UpgradeCard
                icon="🛒"
                name="升级矿车"
                desc={`全产出 +10% (当前 Lv.${cartLevel})`}
                cost={cartCost}
                affordable={ore >= cartCost}
                onClick={buyCart}
              />
              <UpgradeCard
                icon="📉"
                name="加深矿坑"
                desc={`深度 +5m (当前 ${depth}m)`}
                cost={depthCost}
                affordable={ore >= depthCost}
                onClick={buyDepth}
                highlight
              />

              <button
                onClick={() => setPhase("paused")}
                aria-label="暂停游戏"
                className="mt-2 flex h-11 items-center justify-center rounded-xl bg-gray-700 text-sm text-white transition hover:bg-gray-600 active:scale-95"
              >
                暂停 (P)
              </button>
            </div>
          </div>
        )}

        {/* ---------- PAUSE OVERLAY ---------- */}
        {phase === "paused" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/80 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white">已暂停</h3>
            <div className="text-center text-gray-400">
              <div>总矿石: {fmt(totalOre)}</div>
              <div>深度: {depth}m | 矿工: {minerCount} | 转生: {prestigeCount}</div>
            </div>
            <button
              onClick={() => setPhase("playing")}
              aria-label="继续游戏"
              className="flex h-14 items-center justify-center rounded-2xl bg-indigo-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            >
              继续 (P)
            </button>
          </div>
        )}

        {offlineMsg && phase === "playing" && (
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-xl bg-green-900/80 px-4 py-2 text-sm text-green-300">
            {offlineMsg}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.3); }
        }
        @keyframes minePulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(0.93); }
          100% { transform: scale(1); }
        }
      `}</style>
    </GameShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Upgrade card sub-component                                         */
/* ------------------------------------------------------------------ */
function UpgradeCard({
  icon, name, desc, cost, affordable, onClick, highlight,
}: {
  icon: string;
  name: string;
  desc: string;
  cost: number;
  affordable: boolean;
  onClick: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!affordable}
      aria-label={name}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        highlight
          ? "border-amber-600/40 bg-amber-900/20 hover:bg-amber-900/30"
          : "border-gray-700 bg-gray-800/60 hover:bg-gray-700/60"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-900/60 text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white">{name}</div>
        <div className="truncate text-xs text-gray-400">{desc}</div>
      </div>
      <div className={`shrink-0 text-sm font-bold ${affordable ? "text-amber-400" : "text-gray-500"}`}>
        {fmt(cost)}
      </div>
    </button>
  );
}
