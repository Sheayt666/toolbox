"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Globe2, RotateCcw, Lock, Rocket, Zap, Star, Clock, Sparkles } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore, recordGamePlay } from "@/lib/gamification";

const GAME_ID = "space-idle";
const SAVE_KEY = "gm_space_idle_save";

/* ===== Planets ===== */
interface PlanetDef {
  name: string;
  emoji: string;
  baseCost: number;
  energy: number;
  unlockAt: number; // total energy required to unlock
  desc: string;
  color: string;
}

const PLANETS: PlanetDef[] = [
  { name: "地球", emoji: "🌍", baseCost: 0, energy: 1, unlockAt: 0, desc: "人类的摇篮", color: "text-blue-400" },
  { name: "火星", emoji: "🔴", baseCost: 50, energy: 5, unlockAt: 0, desc: "红色殖民 frontier", color: "text-red-400" },
  { name: "木星", emoji: "🟠", baseCost: 500, energy: 50, unlockAt: 500, desc: "气态巨行星基地", color: "text-orange-400" },
  { name: "土星", emoji: "🪐", baseCost: 5000, energy: 300, unlockAt: 5000, desc: "环带能源站", color: "text-amber-400" },
  { name: "海王星", emoji: "💠", baseCost: 50000, energy: 2000, unlockAt: 50000, desc: "冰巨星前哨", color: "text-cyan-400" },
  { name: "系外行星", emoji: "🌏", baseCost: 500000, energy: 15000, unlockAt: 500000, desc: "深空殖民地", color: "text-emerald-400" },
  { name: "银河系", emoji: "🌌", baseCost: 5000000, energy: 100000, unlockAt: 5000000, desc: "星系级文明", color: "text-violet-400" },
  { name: "宇宙", emoji: "🌠", baseCost: 50000000, energy: 750000, unlockAt: 50000000, desc: "终极能源", color: "text-fuchsia-400" },
];

/* ===== Upgrades ===== */
interface UpgradeDef {
  name: string;
  emoji: string;
  multiplier: number;
  cost: number;
  desc: string;
}

const UPGRADES: UpgradeDef[] = [
  { name: "太阳能板", emoji: "☀️", multiplier: 2, cost: 1000, desc: "全局产能 ×2" },
  { name: "核聚变堆", emoji: "⚛️", multiplier: 3, cost: 50000, desc: "全局产能 ×3" },
  { name: "反物质", emoji: "🔬", multiplier: 5, cost: 5000000, desc: "全局产能 ×5" },
  { name: "暗物质", emoji: "🕳️", multiplier: 10, cost: 500000000, desc: "全局产能 ×10" },
];

/* ===== Save data ===== */
interface SaveData {
  v: number;
  energy: number;
  totalEnergy: number;
  planets: number[];
  upgrades: boolean[];
  lastSave: number;
  clickCount: number;
}

/* ===== Helpers ===== */
function formatNum(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(2) + "K";
  if (n < 1e9) return (n / 1e6).toFixed(2) + "M";
  if (n < 1e12) return (n / 1e9).toFixed(2) + "B";
  if (n < 1e15) return (n / 1e12).toFixed(2) + "T";
  if (n < 1e18) return (n / 1e15).toFixed(2) + "Qa";
  return n.toExponential(2);
}

function planetPrice(base: number, owned: number): number {
  return Math.ceil(base * Math.pow(1.15, owned));
}

function calcEPS(planets: number[], upgrades: boolean[]): number {
  let eps = 0;
  for (let i = 0; i < PLANETS.length; i++) {
    eps += PLANETS[i].energy * planets[i];
  }
  let mult = 1;
  for (let i = 0; i < UPGRADES.length; i++) {
    if (upgrades[i]) mult *= UPGRADES[i].multiplier;
  }
  return eps * mult;
}

function calcMult(upgrades: boolean[]): number {
  let mult = 1;
  for (let i = 0; i < UPGRADES.length; i++) {
    if (upgrades[i]) mult *= UPGRADES[i].multiplier;
  }
  return mult;
}

function defaultSave(): SaveData {
  return {
    v: 1,
    energy: 0,
    totalEnergy: 0,
    planets: Array(PLANETS.length).fill(0),
    upgrades: Array(UPGRADES.length).fill(false),
    lastSave: Date.now(),
    clickCount: 0,
  };
}

/* ===== Component ===== */
export default function SpaceIdlePage() {
  const [mounted, setMounted] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [totalEnergy, setTotalEnergy] = useState(0);
  const [planets, setPlanets] = useState<number[]>(Array(PLANETS.length).fill(0));
  const [upgrades, setUpgrades] = useState<boolean[]>(Array(UPGRADES.length).fill(false));
  const [eps, setEps] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const [clickAnim, setClickAnim] = useState<{ id: number; x: number; y: number } | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);

  const stateRef = useRef<SaveData>(defaultSave());
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const saveRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const animIdRef = useRef(0);
  const autoSubmitCounterRef = useRef(0);

  /* ===== Mount: load save ===== */
  useEffect(() => {
    setMounted(true);
    let loaded = false;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as SaveData;
        if (data && typeof data.energy === "number") {
          const save: SaveData = {
            ...defaultSave(),
            ...data,
            planets: Array.isArray(data.planets) && data.planets.length === PLANETS.length
              ? data.planets
              : Array(PLANETS.length).fill(0),
            upgrades: Array.isArray(data.upgrades) && data.upgrades.length === UPGRADES.length
              ? data.upgrades
              : Array(UPGRADES.length).fill(false),
          };

          // Offline earnings
          const now = Date.now();
          const elapsed = Math.min((now - (save.lastSave || now)) / 1000, 86400);
          if (elapsed > 5 && save.totalEnergy > 0) {
            const rate = calcEPS(save.planets, save.upgrades);
            const earned = elapsed * rate * 0.5;
            if (earned > 0) {
              save.energy += earned;
              save.totalEnergy += earned;
              setOfflineEarnings(earned);
            }
          }

          save.lastSave = now;
          stateRef.current = save;
          setEnergy(save.energy);
          setTotalEnergy(save.totalEnergy);
          setPlanets([...save.planets]);
          setUpgrades([...save.upgrades]);
          setClickCount(save.clickCount);
          setEps(calcEPS(save.planets, save.upgrades));
          loaded = true;
        }
      }
    } catch {
      /* ignore */
    }
    if (!loaded) {
      stateRef.current = defaultSave();
    }
    recordGamePlay(GAME_ID, 0);
    setRefreshKey((k) => k + 1);
  }, []);

  /* ===== Game tick (100ms) ===== */
  useEffect(() => {
    if (!mounted) return;
    tickRef.current = setInterval(() => {
      const s = stateRef.current;
      const rate = calcEPS(s.planets, s.upgrades);
      const gain = rate * 0.1;
      s.energy += gain;
      s.totalEnergy += gain;
      setEnergy(s.energy);
      setTotalEnergy(s.totalEnergy);
      setEps(rate);
    }, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [mounted]);

  /* ===== Auto-save (5s) ===== */
  useEffect(() => {
    if (!mounted) return;
    saveRef.current = setInterval(() => {
      const s = stateRef.current;
      s.lastSave = Date.now();
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(s));
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 500);
      } catch {
        /* ignore */
      }
      // Periodically submit score to leaderboard (every ~30s = 6 auto-saves)
      autoSubmitCounterRef.current += 1;
      if (autoSubmitCounterRef.current >= 6) {
        autoSubmitCounterRef.current = 0;
        const score = Math.floor(s.totalEnergy);
        if (score > 0) submitScore(GAME_ID, score, "自动");
      }
    }, 5000);
    return () => {
      if (saveRef.current) clearInterval(saveRef.current);
      const s = stateRef.current;
      s.lastSave = Date.now();
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(s));
      } catch {
        /* ignore */
      }
    };
  }, [mounted]);

  /* ===== Click energy core ===== */
  const clickCore = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const s = stateRef.current;
    const clickPower = 1 + Math.floor(s.totalEnergy / 1000);
    s.energy += clickPower;
    s.totalEnergy += clickPower;
    s.clickCount += 1;
    setEnergy(s.energy);
    setTotalEnergy(s.totalEnergy);
    setClickCount(s.clickCount);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = animIdRef.current++;
    setClickAnim({ id, x, y });
    setTimeout(() => {
      setClickAnim((prev) => (prev?.id === id ? null : prev));
    }, 600);
  }, []);

  /* ===== Buy planet ===== */
  const buyPlanet = useCallback((idx: number) => {
    const s = stateRef.current;
    const p = PLANETS[idx];
    if (s.totalEnergy < p.unlockAt) return;
    const owned = s.planets[idx];
    const price = planetPrice(p.baseCost, owned);
    if (s.energy < price) return;
    s.energy -= price;
    s.planets[idx] = owned + 1;
    setEnergy(s.energy);
    setPlanets([...s.planets]);
    setEps(calcEPS(s.planets, s.upgrades));
  }, []);

  /* ===== Buy upgrade ===== */
  const buyUpgrade = useCallback((idx: number) => {
    const s = stateRef.current;
    if (s.upgrades[idx]) return;
    const cost = UPGRADES[idx].cost;
    if (s.energy < cost) return;
    s.energy -= cost;
    s.upgrades[idx] = true;
    setEnergy(s.energy);
    setUpgrades([...s.upgrades]);
    setEps(calcEPS(s.planets, s.upgrades));
  }, []);

  /* ===== Hard reset ===== */
  const hardReset = useCallback(() => {
    // Submit score to leaderboard before resetting progress
    const prevScore = Math.floor(stateRef.current.totalEnergy);
    if (prevScore > 0) submitScore(GAME_ID, prevScore, "重置");

    const saved = defaultSave();
    stateRef.current = saved;
    setEnergy(0);
    setTotalEnergy(0);
    setPlanets(Array(PLANETS.length).fill(0));
    setUpgrades(Array(UPGRADES.length).fill(false));
    setClickCount(0);
    setEps(0);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const mult = calcMult(upgrades);
  const clickPower = 1 + Math.floor(totalEnergy / 1000);

  const stats: GameStat[] = [
    { label: "能量", value: formatNum(energy) },
    { label: "每秒", value: formatNum(eps) + "/s" },
    { label: "总量", value: formatNum(totalEnergy) },
    { label: "倍率", value: mult + "x" },
  ];

  /* ===== Loading state ===== */
  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="星际放置"
        description="殖民星球，采集能量，解锁科技树，向宇宙进发！从地球起步，最终掌控整个宇宙的能量。"
        instructions="点击能量核心获得能量。殖民星球自动产能，价格随数量递增。升级科技获得全局倍率加成。达到总能量里程碑解锁新星球。离线时仍可获得50%产能（最多24小时）。"
        icon={Globe2}
        iconEmoji="🪐"
        iconGradient="from-indigo-500 to-purple-600"
        stats={stats}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="星际放置"
      description="殖民星球，采集能量，解锁科技树，向宇宙进发！从地球起步，最终掌控整个宇宙的能量。"
      instructions={`点击能量核心获得能量 ⚡
殖民星球自动产能，价格 = 基础 × 1.15^已拥有
4种科技升级提供全局倍率：×2 ×3 ×5 ×10
达到总能量里程碑解锁新星球（科技树）
离线收益 = 经过时间 × 产能 × 50%（上限24小时）
每5秒自动保存`}
      icon={Globe2}
      iconEmoji="🪐"
      iconGradient="from-indigo-500 to-purple-600"
      stats={stats}
      shareScore={Math.floor(totalEnergy)}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes core-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.4)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 30px rgba(99, 102, 241, 0.7)); }
        }
        .core-pulse { animation: core-pulse 2.5s ease-in-out infinite; }
        @keyframes core-click {
          0% { transform: scale(1); }
          50% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        .core-click { animation: core-click 0.15s ease-out; }
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
        }
        .float-up { animation: float-up 0.6s ease-out forwards; }
        @keyframes starfield {
          from { background-position: 0 0; }
          to { background-position: 0 200px; }
        }
        .starfield {
          background-image:
            radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 60px 70px, rgba(255,255,255,0.2), transparent),
            radial-gradient(2px 2px at 100px 40px, rgba(255,255,255,0.25), transparent),
            radial-gradient(1px 1px at 150px 90px, rgba(255,255,255,0.15), transparent),
            radial-gradient(1.5px 1.5px at 80px 120px, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 180px 20px, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 220px 100px, rgba(255,255,255,0.15), transparent),
            radial-gradient(2px 2px at 260px 60px, rgba(255,255,255,0.2), transparent);
          background-size: 300px 200px;
          animation: starfield 30s linear infinite;
        }
        @keyframes energy-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .energy-text {
          background: linear-gradient(90deg, #818cf8, #c084fc, #818cf8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: energy-shimmer 3s linear infinite;
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        .orbit-1 { animation: orbit 8s linear infinite; }
        .orbit-2 { animation: orbit 12s linear infinite reverse; }
        @keyframes save-flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .save-flash { animation: save-flash 0.5s ease-out; }
      `}</style>

      <div className="max-w-[640px] mx-auto relative">
        {/* Starfield background */}
        <div className="absolute inset-0 starfield opacity-30 pointer-events-none rounded-xl" />

        {/* Offline earnings notification */}
        {offlineEarnings !== null && offlineEarnings > 0 && (
          <div className="relative mb-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="text-indigo-300">离线收益！</span>
              <span className="text-slate-300"> 离开期间获得了 </span>
              <span className="font-bold text-indigo-400">{formatNum(offlineEarnings)}</span>
              <span className="text-slate-300"> 能量</span>
            </div>
            <button
              onClick={() => setOfflineEarnings(null)}
              aria-label="收取离线收益"
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded bg-[#27272a]"
            >
              收取
            </button>
          </div>
        )}

        {/* Energy counter */}
        <div className="relative text-center mb-4">
          <div className="text-4xl sm:text-5xl font-bold energy-text tabular-nums">
            {formatNum(energy)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            每秒 {formatNum(eps)} 能量
            <span className="ml-2 text-indigo-400/70">{mult}x 倍率</span>
            {saveFlash && (
              <span className="save-flash ml-2 text-emerald-400 text-xs">已保存</span>
            )}
          </div>
        </div>

        {/* Energy core (clickable) */}
        <div className="relative flex justify-center mb-6 h-40">
          <button
            onClick={clickCore}
            aria-label="点击能量核心获得能量"
            className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center core-pulse active:core-click border-4 border-indigo-400/30 shadow-2xl shadow-indigo-900/50"
          >
            <span className="text-5xl sm:text-6xl select-none">⚡</span>
            {clickAnim && (
              <span
                className="absolute pointer-events-none float-up text-lg font-bold text-indigo-200"
                style={{ left: clickAnim.x, top: clickAnim.y }}
              >
                +{clickPower}
              </span>
            )}
            {/* Orbital particles */}
            <span className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-cyan-400/60 orbit-1" style={{ marginLeft: '-4px', marginTop: '-4px' }} />
            <span className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-purple-300/60 orbit-2" style={{ marginLeft: '-3px', marginTop: '-3px' }} />
          </button>
        </div>

        {/* Tech upgrades */}
        <div className="relative mb-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> 科技升级
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {UPGRADES.map((up, i) => {
              const owned = upgrades[i];
              const canAfford = energy >= up.cost;
              return (
                <button
                  key={i}
                  onClick={() => buyUpgrade(i)}
                  disabled={owned || !canAfford}
                  aria-label={`${up.name} - ${up.desc}${owned ? " 已激活" : canAfford ? "" : " 余额不足"}`}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    owned
                      ? "bg-indigo-500/10 border-indigo-500/30 opacity-60"
                      : canAfford
                        ? "bg-[#18181b] border-indigo-500/30 hover:border-indigo-500/60 hover:bg-indigo-500/5 cursor-pointer active:scale-95"
                        : "bg-[#18181b] border-[#27272a] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-xl mb-0.5">{up.emoji}</div>
                  <div className="text-[10px] font-medium text-slate-200 truncate">{up.name}</div>
                  <div className="text-[9px] text-slate-500">{up.desc}</div>
                  <div className={`text-xs font-bold mt-0.5 ${owned ? "text-indigo-400" : canAfford ? "text-indigo-400" : "text-slate-600"}`}>
                    {owned ? "已激活" : formatNum(up.cost)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Planets (tech tree) */}
        <div className="relative mb-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5" /> 殖民星球
          </h3>
          <div className="space-y-1.5">
            {PLANETS.map((p, i) => {
              const owned = planets[i];
              const price = planetPrice(p.baseCost, owned);
              const unlocked = totalEnergy >= p.unlockAt;
              const canAfford = energy >= price;
              const planetEps = p.energy * owned * mult;

              if (!unlocked) {
                return (
                  <div
                    key={i}
                    className="w-full p-2.5 rounded-lg border border-[#27272a] bg-[#18181b]/30 flex items-center gap-3 opacity-50"
                  >
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-500">{p.name}</div>
                      <div className="text-[10px] text-slate-600">
                        需总能量 {formatNum(p.unlockAt)} 解锁
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-600">
                      {formatNum(Math.max(0, p.unlockAt - totalEnergy))} 剩余
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={i}
                  onClick={() => buyPlanet(i)}
                  disabled={!canAfford}
                  aria-label={`殖民${p.name} - 当前${owned}个 - 价格${p.baseCost === 0 ? "免费" : formatNum(price) + "能量"}`}
                  className={`w-full p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                    canAfford
                      ? "bg-[#18181b] border-indigo-500/20 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer active:scale-[0.98]"
                      : "bg-[#18181b]/50 border-[#27272a] opacity-70 cursor-not-allowed"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${p.color}`}>{p.name}</span>
                      <span className="text-xs text-slate-500">×{owned}</span>
                      {i > 0 && owned === 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">NEW</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{p.desc}</div>
                    {planetEps > 0 && (
                      <div className="text-[10px] text-emerald-500/70">{formatNum(planetEps)}/s</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${canAfford ? "text-indigo-400" : "text-slate-600"}`}>
                      {p.baseCost === 0 ? "免费" : formatNum(price)}
                    </div>
                    <div className="text-[10px] text-slate-600">⚡</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats footer */}
        <div className="relative grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">总点击</div>
            <div className="text-sm font-bold text-slate-300">{formatNum(clickCount)}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">总能量</div>
            <div className="text-sm font-bold text-slate-300">{formatNum(totalEnergy)}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">倍率</div>
            <div className="text-sm font-bold text-indigo-400">{mult}x</div>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={hardReset}
          aria-label="重置全部进度"
          className="relative w-full inline-flex items-center justify-center gap-2 h-11 px-4 text-xs font-medium text-slate-500 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 重置全部进度
        </button>
      </div>
    </GameShell>
  );
}
