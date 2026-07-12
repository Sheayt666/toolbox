"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cookie, RotateCcw, Sparkles, TrendingUp, ArrowUpCircle, Clock, Zap } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore, recordGamePlay } from "@/lib/gamification";

const GAME_ID = "cookie-empire";
const SAVE_KEY = "gm_cookie_empire_save";

/* ===== Buildings ===== */
interface BuildingDef {
  name: string;
  emoji: string;
  basePrice: number;
  cps: number;
  desc: string;
}

const BUILDINGS: BuildingDef[] = [
  { name: "光标", emoji: "🖱️", basePrice: 15, cps: 0.1, desc: "自动点击饼干" },
  { name: "奶奶", emoji: "👵", basePrice: 100, cps: 1, desc: "勤劳的烘焙奶奶" },
  { name: "农场", emoji: "🌾", basePrice: 1100, cps: 8, desc: "种植饼干作物" },
  { name: "矿场", emoji: "⛏️", basePrice: 12000, cps: 47, desc: "挖掘巧克力矿" },
  { name: "工厂", emoji: "🏭", basePrice: 130000, cps: 260, desc: "工业化饼干生产" },
  { name: "银行", emoji: "🏦", basePrice: 1.4e6, cps: 1400, desc: "饼干金融衍生品" },
  { name: "神殿", emoji: "🛕", basePrice: 2e7, cps: 7800, desc: "供奉饼干之神" },
  { name: "传送门", emoji: "🌀", basePrice: 3.3e8, cps: 44000, desc: "从异次元获取饼干" },
];

/* ===== Upgrades ===== */
interface UpgradeDef {
  name: string;
  emoji: string;
  buildingIdx: number;
  cost: number;
  desc: string;
}

const UPGRADES: UpgradeDef[] = [
  { name: "强化光标", emoji: "🔧", buildingIdx: 0, cost: 100, desc: "光标产量 ×2" },
  { name: "奶奶秘方", emoji: "📜", buildingIdx: 1, cost: 500, desc: "奶奶产量 ×2" },
  { name: "新型犁刀", emoji: "🪓", buildingIdx: 2, cost: 5000, desc: "农场产量 ×2" },
  { name: "糖浆燃料", emoji: "⛽", buildingIdx: 3, cost: 50000, desc: "矿场产量 ×2" },
  { name: "工厂机器人", emoji: "🤖", buildingIdx: 4, cost: 500000, desc: "工厂产量 ×2" },
  { name: "随机 fortune", emoji: "📈", buildingIdx: 5, cost: 5000000, desc: "银行产量 ×2" },
];

/* ===== Save data ===== */
interface SaveData {
  v: number;
  cookies: number;
  totalEarned: number;
  buildings: number[];
  upgrades: boolean[];
  sugarCrystals: number;
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

function buildingPrice(base: number, owned: number): number {
  return Math.ceil(base * Math.pow(1.15, owned));
}

function calcCPS(buildings: number[], upgrades: boolean[], crystals: number): number {
  let cps = 0;
  for (let i = 0; i < BUILDINGS.length; i++) {
    let bCps = BUILDINGS[i].cps * buildings[i];
    if (i < UPGRADES.length && upgrades[i]) bCps *= 2;
    cps += bCps;
  }
  cps *= 1 + crystals * 0.01;
  return cps;
}

function calcCrystals(totalEarned: number): number {
  return Math.floor(Math.sqrt(totalEarned / 1e9));
}

function defaultSave(): SaveData {
  return {
    v: 1,
    cookies: 0,
    totalEarned: 0,
    buildings: Array(BUILDINGS.length).fill(0),
    upgrades: Array(UPGRADES.length).fill(false),
    sugarCrystals: 0,
    lastSave: Date.now(),
    clickCount: 0,
  };
}

/* ===== Component ===== */
export default function CookieEmpirePage() {
  const [mounted, setMounted] = useState(false);
  const [cookies, setCookies] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [buildings, setBuildings] = useState<number[]>(Array(BUILDINGS.length).fill(0));
  const [upgrades, setUpgrades] = useState<boolean[]>(Array(UPGRADES.length).fill(false));
  const [sugarCrystals, setSugarCrystals] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [cps, setCps] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPrestige, setShowPrestige] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const [clickAnim, setClickAnim] = useState<{ id: number; x: number; y: number } | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);

  // Refs
  const stateRef = useRef<SaveData>(defaultSave());
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const saveRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const animIdRef = useRef(0);

  /* ===== Mount: load save ===== */
  useEffect(() => {
    setMounted(true);
    let loaded = false;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as SaveData;
        if (data && typeof data.cookies === "number") {
          // Migrate / validate
          const save: SaveData = {
            ...defaultSave(),
            ...data,
            buildings: Array.isArray(data.buildings) && data.buildings.length === BUILDINGS.length
              ? data.buildings
              : Array(BUILDINGS.length).fill(0),
            upgrades: Array.isArray(data.upgrades) && data.upgrades.length === UPGRADES.length
              ? data.upgrades
              : Array(UPGRADES.length).fill(false),
          };

          // Offline earnings
          const now = Date.now();
          const elapsed = Math.min((now - (save.lastSave || now)) / 1000, 86400); // max 24h
          if (elapsed > 5 && save.totalEarned > 0) {
            const rate = calcCPS(save.buildings, save.upgrades, save.sugarCrystals);
            const earned = elapsed * rate * 0.5;
            if (earned > 0) {
              save.cookies += earned;
              save.totalEarned += earned;
              setOfflineEarnings(earned);
            }
          }

          save.lastSave = now;
          stateRef.current = save;
          setCookies(save.cookies);
          setTotalEarned(save.totalEarned);
          setBuildings([...save.buildings]);
          setUpgrades([...save.upgrades]);
          setSugarCrystals(save.sugarCrystals);
          setClickCount(save.clickCount);
          setCps(calcCPS(save.buildings, save.upgrades, save.sugarCrystals));
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
      const rate = calcCPS(s.buildings, s.upgrades, s.sugarCrystals);
      const gain = rate * 0.1;
      s.cookies += gain;
      s.totalEarned += gain;
      setCookies(s.cookies);
      setTotalEarned(s.totalEarned);
      setCps(rate);
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
    }, 5000);

    // Save on unmount
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

  /* ===== Click cookie ===== */
  const clickCookie = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const s = stateRef.current;
    const clickPower = 1 + Math.floor(s.sugarCrystals * 0.01);
    s.cookies += clickPower;
    s.totalEarned += clickPower;
    s.clickCount += 1;
    setCookies(s.cookies);
    setTotalEarned(s.totalEarned);
    setClickCount(s.clickCount);

    // Click animation
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = animIdRef.current++;
    setClickAnim({ id, x, y });
    setTimeout(() => {
      setClickAnim((prev) => (prev?.id === id ? null : prev));
    }, 600);
  }, []);

  /* ===== Buy building ===== */
  const buyBuilding = useCallback((idx: number) => {
    const s = stateRef.current;
    const owned = s.buildings[idx];
    const price = buildingPrice(BUILDINGS[idx].basePrice, owned);
    if (s.cookies < price) return;
    s.cookies -= price;
    s.buildings[idx] = owned + 1;
    setCookies(s.cookies);
    setBuildings([...s.buildings]);
    setCps(calcCPS(s.buildings, s.upgrades, s.sugarCrystals));
  }, []);

  /* ===== Buy upgrade ===== */
  const buyUpgrade = useCallback((idx: number) => {
    const s = stateRef.current;
    if (s.upgrades[idx]) return;
    const cost = UPGRADES[idx].cost;
    if (s.cookies < cost) return;
    s.cookies -= cost;
    s.upgrades[idx] = true;
    setCookies(s.cookies);
    setUpgrades([...s.upgrades]);
    setCps(calcCPS(s.buildings, s.upgrades, s.sugarCrystals));
  }, []);

  /* ===== Prestige ===== */
  const doPrestige = useCallback(() => {
    const s = stateRef.current;
    const newCrystals = calcCrystals(s.totalEarned);
    if (newCrystals <= s.sugarCrystals) return;

    const saved = {
      ...defaultSave(),
      sugarCrystals: newCrystals,
      lastSave: Date.now(),
    };
    stateRef.current = saved;
    setCookies(0);
    setTotalEarned(0);
    setBuildings(Array(BUILDINGS.length).fill(0));
    setUpgrades(Array(UPGRADES.length).fill(false));
    setSugarCrystals(newCrystals);
    setClickCount(0);
    setCps(0);
    setShowPrestige(false);

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== Hard reset ===== */
  const hardReset = useCallback(() => {
    const saved = defaultSave();
    stateRef.current = saved;
    setCookies(0);
    setTotalEarned(0);
    setBuildings(Array(BUILDINGS.length).fill(0));
    setUpgrades(Array(UPGRADES.length).fill(false));
    setSugarCrystals(0);
    setClickCount(0);
    setCps(0);
    setShowPrestige(false);
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const potentialCrystals = calcCrystals(totalEarned);
  const crystalGain = potentialCrystals - sugarCrystals;
  const crystalBonus = sugarCrystals * 1;

  const stats: GameStat[] = [
    { label: "饼干", value: formatNum(cookies) },
    { label: "每秒", value: formatNum(cps) + "/s" },
    { label: "总产出", value: formatNum(totalEarned) },
    { label: "糖晶", value: sugarCrystals.toString() },
  ];

  /* ===== Loading state ===== */
  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="饼干帝国"
        description="点击大饼干开始你的饼干帝国！购买建筑自动生产，升级提升效率，转生获得糖晶永久加成。"
        instructions="点击大饼干获得饼干。购买建筑自动生产饼干，价格随购买数量递增（×1.15）。购买升级使对应建筑产量翻倍。转生重置进度但获得糖晶，每个糖晶永久+1%产量。离线时仍可获得50%产出（最多24小时）。"
        icon={Cookie}
        iconEmoji="🍪"
        iconGradient="from-amber-400 to-orange-500"
        stats={stats}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="饼干帝国"
      description="点击大饼干开始你的饼干帝国！购买建筑自动生产，升级提升效率，转生获得糖晶永久加成。"
      instructions={`点击大饼干获得饼干 🍪
购买建筑自动生产，价格 = 基础 × 1.15^已拥有
6种升级使对应建筑产量翻倍
转生重置进度，获得糖晶（每个+1%全局产量）
离线收益 = 经过时间 × 产出 × 50%（上限24小时）
每5秒自动保存`}
      icon={Cookie}
      iconEmoji="🍪"
      iconGradient="from-amber-400 to-orange-500"
      stats={stats}
      shareScore={Math.floor(totalEarned)}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes cookie-bounce {
          0% { transform: scale(1); }
          50% { transform: scale(0.92); }
          100% { transform: scale(1); }
        }
        .cookie-bounce { animation: cookie-bounce 0.15s ease-out; }
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
        }
        .float-up { animation: float-up 0.6s ease-out forwards; }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(251, 146, 60, 0.3)); }
          50% { filter: drop-shadow(0 0 25px rgba(251, 146, 60, 0.6)); }
        }
        .glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fbbf24, #f97316, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        @keyframes save-flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .save-flash { animation: save-flash 0.5s ease-out; }
      `}</style>

      <div className="max-w-[640px] mx-auto">
        {/* Offline earnings notification */}
        {offlineEarnings !== null && offlineEarnings > 0 && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="text-amber-300">离线收益！</span>
              <span className="text-slate-300"> 离开期间获得了 </span>
              <span className="font-bold text-amber-400">{formatNum(offlineEarnings)}</span>
              <span className="text-slate-300"> 饼干</span>
            </div>
            <button
              onClick={() => setOfflineEarnings(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#27272a]"
            >
              收取
            </button>
          </div>
        )}

        {/* Cookie counter */}
        <div className="text-center mb-4 relative">
          <div className="text-4xl sm:text-5xl font-bold shimmer-text tabular-nums">
            {formatNum(cookies)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            每秒 {formatNum(cps)} 饼干
            {saveFlash && (
              <span className="save-flash ml-2 text-emerald-400 text-xs">已保存</span>
            )}
          </div>
        </div>

        {/* Big cookie */}
        <div className="flex justify-center mb-6">
          <button
            onClick={clickCookie}
            className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center glow-pulse active:cookie-bounce hover:scale-105 transition-transform shadow-2xl shadow-orange-900/50 border-4 border-amber-600/30"
          >
            <span className="text-6xl sm:text-7xl select-none">🍪</span>
            {clickAnim && (
              <span
                className="absolute pointer-events-none float-up text-lg font-bold text-amber-200"
                style={{ left: clickAnim.x, top: clickAnim.y }}
              >
                +{1 + Math.floor(sugarCrystals * 0.01)}
              </span>
            )}
            {/* Cookie chips */}
            <span className="absolute top-4 left-6 w-2 h-2 rounded-full bg-amber-900/40" />
            <span className="absolute bottom-6 right-8 w-3 h-3 rounded-full bg-amber-900/40" />
            <span className="absolute top-10 right-6 w-1.5 h-1.5 rounded-full bg-amber-900/40" />
          </button>
        </div>

        {/* Sugar crystals & Prestige */}
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm text-pink-300">糖晶: {sugarCrystals}</span>
              <span className="text-xs text-pink-400/60">(+{crystalBonus}% 产量)</span>
            </div>
            {crystalGain > 0 && (
              <button
                onClick={() => setShowPrestige(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-lg transition-all active:scale-95"
              >
                <ArrowUpCircle className="w-3.5 h-3.5" />
                转生 +{crystalGain}
              </button>
            )}
          </div>
        </div>

        {/* Upgrades */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> 升级
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {UPGRADES.map((up, i) => {
              const owned = upgrades[i];
              const canAfford = cookies >= up.cost;
              return (
                <button
                  key={i}
                  onClick={() => buyUpgrade(i)}
                  disabled={owned || !canAfford}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    owned
                      ? "bg-emerald-500/10 border-emerald-500/30 opacity-60"
                      : canAfford
                        ? "bg-[#18181b] border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5 cursor-pointer active:scale-95"
                        : "bg-[#18181b] border-[#27272a] opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base">{up.emoji}</span>
                    <span className="text-xs font-medium text-slate-200 truncate">{up.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{up.desc}</div>
                  <div className={`text-xs font-bold mt-0.5 ${owned ? "text-emerald-400" : canAfford ? "text-amber-400" : "text-slate-600"}`}>
                    {owned ? "已拥有" : formatNum(up.cost)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buildings */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> 建筑
          </h3>
          <div className="space-y-1.5">
            {BUILDINGS.map((b, i) => {
              const owned = buildings[i];
              const price = buildingPrice(b.basePrice, owned);
              const canAfford = cookies >= price;
              const buildingCps = b.cps * owned * (i < UPGRADES.length && upgrades[i] ? 2 : 1);
              return (
                <button
                  key={i}
                  onClick={() => buyBuilding(i)}
                  disabled={!canAfford}
                  className={`w-full p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                    canAfford
                      ? "bg-[#18181b] border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5 cursor-pointer active:scale-[0.98]"
                      : "bg-[#18181b]/50 border-[#27272a] opacity-60 cursor-not-allowed"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{b.emoji}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-200">{b.name}</span>
                      <span className="text-xs text-slate-500">×{owned}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{b.desc}</div>
                    {buildingCps > 0 && (
                      <div className="text-[10px] text-emerald-500/70">{formatNum(buildingCps)}/s</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${canAfford ? "text-amber-400" : "text-slate-600"}`}>
                      {formatNum(price)}
                    </div>
                    <div className="text-[10px] text-slate-600">🍪</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">总点击</div>
            <div className="text-sm font-bold text-slate-300">{formatNum(clickCount)}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">总产出</div>
            <div className="text-sm font-bold text-slate-300">{formatNum(totalEarned)}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">糖晶</div>
            <div className="text-sm font-bold text-pink-400">{sugarCrystals}</div>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={hardReset}
          className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-medium text-slate-500 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 重置全部进度
        </button>

        {/* Prestige modal */}
        {showPrestige && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="max-w-sm w-full bg-[#18181b] rounded-2xl border border-pink-500/30 p-5 text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-lg font-bold text-white mb-2">转生为糖晶</h3>
              <p className="text-sm text-slate-400 mb-4">
                重置所有饼干、建筑和升级，但获得 <span className="font-bold text-pink-400">{crystalGain}</span> 个糖晶。
                每个糖晶永久增加 <span className="text-pink-400">+1%</span> 全局产量。
              </p>
              <div className="bg-[#09090b] rounded-lg p-3 mb-4 text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">当前糖晶</span>
                  <span className="text-slate-300">{sugarCrystals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">转生后糖晶</span>
                  <span className="text-pink-400 font-bold">{potentialCrystals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">当前加成</span>
                  <span className="text-slate-300">+{crystalBonus}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">转生后加成</span>
                  <span className="text-pink-400 font-bold">+{potentialCrystals}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrestige(false)}
                  className="flex-1 h-10 text-sm font-medium text-slate-400 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={doPrestige}
                  className="flex-1 h-10 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-lg transition-all active:scale-95"
                >
                  确认转生
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
