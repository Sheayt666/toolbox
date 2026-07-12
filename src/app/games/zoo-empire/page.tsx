"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Play, Pause, Lock, Coins, Users, Sparkles, Clock, Star, ChevronUp } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "zoo-empire";
const SAVE_KEY = "gm_zoo_empire_save";

/* ===== Animals ===== */
interface AnimalDef {
  name: string;
  emoji: string;
  baseCost: number;
  output: number; // coins per second per animal
  unlockAt: number; // total earned required to unlock
  color: string;
}

const ANIMALS: AnimalDef[] = [
  { name: "狮子", emoji: "🦁", baseCost: 0, output: 1, unlockAt: 0, color: "text-amber-400" },
  { name: "大象", emoji: "🐘", baseCost: 80, output: 8, unlockAt: 50, color: "text-gray-300" },
  { name: "长颈鹿", emoji: "🦒", baseCost: 900, output: 50, unlockAt: 500, color: "text-yellow-500" },
  { name: "熊猫", emoji: "🐼", baseCost: 12000, output: 300, unlockAt: 5000, color: "text-green-400" },
  { name: "企鹅", emoji: "🐧", baseCost: 150000, output: 2000, unlockAt: 50000, color: "text-blue-300" },
  { name: "考拉", emoji: "🐨", baseCost: 2000000, output: 15000, unlockAt: 500000, color: "text-slate-400" },
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
  { name: "饲料改良", emoji: "🌽", multiplier: 2, cost: 500, desc: "全局产出 ×2" },
  { name: "栖息地扩建", emoji: "🏗️", multiplier: 3, cost: 40000, desc: "全局产出 ×3" },
  { name: "导游培训", emoji: "📢", multiplier: 5, cost: 4000000, desc: "全局产出 ×5" },
  { name: "生态保护", emoji: "🌱", multiplier: 10, cost: 400000000, desc: "全局产出 ×10" },
];

/* ===== Save data ===== */
interface SaveData {
  v: number;
  coins: number;
  totalEarned: number;
  animals: number[];
  upgrades: boolean[];
  lastSave: number;
  clickCount: number;
  fame: number;
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

function animalPrice(base: number, owned: number): number {
  return Math.ceil(base * Math.pow(1.15, owned));
}

function calcAnimalIncome(animals: number[], upgrades: boolean[], fame: number): number {
  let income = 0;
  for (let i = 0; i < ANIMALS.length; i++) {
    income += ANIMALS[i].output * animals[i];
  }
  let mult = 1;
  for (let i = 0; i < UPGRADES.length; i++) {
    if (upgrades[i]) mult *= UPGRADES[i].multiplier;
  }
  const fameMult = 1 + fame * 0.1;
  return income * mult * fameMult;
}

function calcUpgradeMult(upgrades: boolean[]): number {
  let mult = 1;
  for (let i = 0; i < UPGRADES.length; i++) {
    if (upgrades[i]) mult *= UPGRADES[i].multiplier;
  }
  return mult;
}

function calcVisitors(animals: number[]): number {
  let variety = 0;
  let total = 0;
  for (let i = 0; i < ANIMALS.length; i++) {
    if (animals[i] > 0) variety++;
    total += animals[i];
  }
  return variety * 10 + Math.floor(total * 0.5);
}

function calcVisitorIncome(animals: number[], fame: number): number {
  const visitors = calcVisitors(animals);
  return visitors * 0.5 * (1 + fame * 0.1);
}

function calcTotalIncome(animals: number[], upgrades: boolean[], fame: number): number {
  return calcAnimalIncome(animals, upgrades, fame) + calcVisitorIncome(animals, fame);
}

function calcPrestigeGain(totalEarned: number): number {
  if (totalEarned < 1000000) return 0;
  return Math.floor(Math.sqrt(totalEarned / 1000000));
}

function defaultSave(): SaveData {
  return {
    v: 1,
    coins: 0,
    totalEarned: 0,
    animals: Array(ANIMALS.length).fill(0),
    upgrades: Array(UPGRADES.length).fill(false),
    lastSave: Date.now(),
    clickCount: 0,
    fame: 0,
  };
}

/* ===== Component ===== */
export default function ZooEmpirePage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing">("idle");
  const [coins, setCoins] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [animals, setAnimals] = useState<number[]>(Array(ANIMALS.length).fill(0));
  const [upgrades, setUpgrades] = useState<boolean[]>(Array(UPGRADES.length).fill(false));
  const [fame, setFame] = useState(0);
  const [income, setIncome] = useState(0);
  const [visitors, setVisitors] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const [clickAnim, setClickAnim] = useState<{ id: number; x: number; y: number } | null>(null);
  const [saveFlash, setSaveFlash] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);

  const stateRef = useRef<SaveData>(defaultSave());
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const saveRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const animIdRef = useRef(0);
  const autoSubmitCounterRef = useRef(0);
  const pausedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mult = calcUpgradeMult(upgrades);
  const fameMult = 1 + fame * 0.1;
  const clickPower = 1 + Math.floor(totalEarned / 500);
  const prestigeGain = calcPrestigeGain(totalEarned);
  const animalVariety = animals.filter((a) => a > 0).length;

  /* ===== Mount: load save ===== */
  useEffect(() => {
    setMounted(true);
    let loaded = false;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as SaveData;
        if (data && typeof data.coins === "number") {
          const save: SaveData = {
            ...defaultSave(),
            ...data,
            animals: Array.isArray(data.animals) && data.animals.length === ANIMALS.length
              ? data.animals : Array(ANIMALS.length).fill(0),
            upgrades: Array.isArray(data.upgrades) && data.upgrades.length === UPGRADES.length
              ? data.upgrades : Array(UPGRADES.length).fill(false),
          };
          // Offline earnings
          const now = Date.now();
          const elapsed = Math.min((now - (save.lastSave || now)) / 1000, 86400);
          if (elapsed > 5 && save.totalEarned > 0) {
            const rate = calcTotalIncome(save.animals, save.upgrades, save.fame);
            const earned = elapsed * rate * 0.5;
            if (earned > 0) {
              save.coins += earned;
              save.totalEarned += earned;
              setOfflineEarnings(earned);
            }
          }
          save.lastSave = now;
          stateRef.current = save;
          setCoins(save.coins);
          setTotalEarned(save.totalEarned);
          setAnimals([...save.animals]);
          setUpgrades([...save.upgrades]);
          setFame(save.fame);
          setClickCount(save.clickCount);
          setIncome(calcTotalIncome(save.animals, save.upgrades, save.fame));
          setVisitors(calcVisitors(save.animals));
          loaded = true;
        }
      }
    } catch { /* ignore */ }
    if (!loaded) {
      stateRef.current = defaultSave();
      // Start with 1 lion
      stateRef.current.animals[0] = 1;
      setAnimals([...stateRef.current.animals]);
    }
    setPhase("playing");
    setRefreshKey((k) => k + 1);
  }, []);

  /* ===== Game tick (100ms) ===== */
  useEffect(() => {
    if (!mounted || phase !== "playing") return;
    tickRef.current = setInterval(() => {
      if (pausedRef.current) return;
      const s = stateRef.current;
      const rate = calcTotalIncome(s.animals, s.upgrades, s.fame);
      const gain = rate * 0.1;
      s.coins += gain;
      s.totalEarned += gain;
      setCoins(s.coins);
      setTotalEarned(s.totalEarned);
      setIncome(rate);
      setVisitors(calcVisitors(s.animals));
    }, 100);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [mounted, phase]);

  /* ===== Auto-save (5s) + submit score (30s) ===== */
  useEffect(() => {
    if (!mounted || phase !== "playing") return;
    saveRef.current = setInterval(() => {
      const s = stateRef.current;
      s.lastSave = Date.now();
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(s));
        setSaveFlash(true);
        const t = setTimeout(() => setSaveFlash(false), 500);
        timersRef.current.push(t);
      } catch { /* ignore */ }
      autoSubmitCounterRef.current += 1;
      if (autoSubmitCounterRef.current >= 6) {
        autoSubmitCounterRef.current = 0;
        const score = Math.floor(s.totalEarned);
        if (score > 0) void submitScore(GAME_ID, score);
      }
    }, 5000);
    return () => {
      if (saveRef.current) clearInterval(saveRef.current);
      const s = stateRef.current;
      s.lastSave = Date.now();
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
    };
  }, [mounted, phase]);

  /* ===== Cleanup on unmount ===== */
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (tickRef.current) clearInterval(tickRef.current);
      if (saveRef.current) clearInterval(saveRef.current);
    };
  }, []);

  /* ===== Pause hotkey (P) ===== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") {
          setPaused((p) => { pausedRef.current = !p; return !p; });
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase]);

  /* ===== Click enclosure ===== */
  const clickEnclosure = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (pausedRef.current) return;
    const s = stateRef.current;
    const power = 1 + Math.floor(s.totalEarned / 500);
    s.coins += power;
    s.totalEarned += power;
    s.clickCount += 1;
    setCoins(s.coins);
    setTotalEarned(s.totalEarned);
    setClickCount(s.clickCount);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = animIdRef.current++;
    setClickAnim({ id, x, y });
    const t = setTimeout(() => setClickAnim((prev) => (prev?.id === id ? null : prev)), 600);
    timersRef.current.push(t);
  }, []);

  /* ===== Buy animal ===== */
  const buyAnimal = useCallback((idx: number) => {
    const s = stateRef.current;
    const a = ANIMALS[idx];
    if (s.totalEarned < a.unlockAt) return;
    const owned = s.animals[idx];
    const price = animalPrice(a.baseCost, owned);
    if (s.coins < price) return;
    s.coins -= price;
    s.animals[idx] = owned + 1;
    setCoins(s.coins);
    setAnimals([...s.animals]);
    setIncome(calcTotalIncome(s.animals, s.upgrades, s.fame));
    setVisitors(calcVisitors(s.animals));
  }, []);

  /* ===== Buy upgrade ===== */
  const buyUpgrade = useCallback((idx: number) => {
    const s = stateRef.current;
    if (s.upgrades[idx]) return;
    const cost = UPGRADES[idx].cost;
    if (s.coins < cost) return;
    s.coins -= cost;
    s.upgrades[idx] = true;
    setCoins(s.coins);
    setUpgrades([...s.upgrades]);
    setIncome(calcTotalIncome(s.animals, s.upgrades, s.fame));
  }, []);

  /* ===== Prestige ===== */
  const doPrestige = useCallback(() => {
    const s = stateRef.current;
    const gain = calcPrestigeGain(s.totalEarned);
    if (gain <= 0) return;
    // Submit score before resetting
    const prevScore = Math.floor(s.totalEarned);
    if (prevScore > 0) void submitScore(GAME_ID, prevScore);
    const newSave = defaultSave();
    newSave.fame = s.fame + gain;
    newSave.animals[0] = 1; // start with 1 lion
    stateRef.current = newSave;
    setCoins(0);
    setTotalEarned(0);
    setAnimals([...newSave.animals]);
    setUpgrades([...newSave.upgrades]);
    setFame(newSave.fame);
    setClickCount(0);
    setIncome(calcTotalIncome(newSave.animals, newSave.upgrades, newSave.fame));
    setVisitors(calcVisitors(newSave.animals));
    setShowPrestige(false);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(newSave)); } catch { /* ignore */ }
  }, []);

  /* ===== Hard reset ===== */
  const hardReset = useCallback(() => {
    const prevScore = Math.floor(stateRef.current.totalEarned);
    if (prevScore > 0) void submitScore(GAME_ID, prevScore);
    const saved = defaultSave();
    saved.animals[0] = 1;
    stateRef.current = saved;
    setCoins(0); setTotalEarned(0);
    setAnimals([...saved.animals]); setUpgrades([...saved.upgrades]);
    setFame(0); setClickCount(0); setIncome(0); setVisitors(1);
    setShowPrestige(false);
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
  }, []);

  /* ===== Start (from intro) ===== */
  const start = useCallback(() => {
    setPhase("playing");
  }, []);

  const stats: GameStat[] = [
    { label: "金币", value: formatNum(coins), icon: "💰" },
    { label: "游客", value: formatNum(visitors), icon: "👥" },
    { label: "每秒", value: formatNum(income) + "/s", icon: "⚡" },
    { label: "声望", value: fame, icon: "⭐" },
  ];

  if (!mounted) {
    return (
      <GameShell gameId={GAME_ID} title="动物园帝国" iconEmoji="🦁" iconGradient="from-green-500 to-emerald-600"
        stats={stats} shareScore={0} refreshKey={0}>
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId={GAME_ID} title="动物园帝国" iconEmoji="🦁" iconGradient="from-green-500 to-emerald-600"
      stats={stats} shareScore={Math.floor(totalEarned)} refreshKey={refreshKey}>
      <style>{`
        @keyframes zoo-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(34,197,94,0.4)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 25px rgba(34,197,94,0.7)); }
        }
        .zoo-pulse { animation: zoo-pulse 2.5s ease-in-out infinite; }
        @keyframes zoo-click { 0% { transform: scale(1); } 50% { transform: scale(0.9); } 100% { transform: scale(1); } }
        .zoo-click { animation: zoo-click 0.15s ease-out; }
        @keyframes zoo-float { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(1.5); } }
        .zoo-float { animation: zoo-float 0.6s ease-out forwards; }
        @keyframes zoo-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .zoo-coin-text {
          background: linear-gradient(90deg, #fbbf24, #fcd34d, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: zoo-shimmer 3s linear infinite;
        }
        @keyframes zoo-save { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .zoo-save { animation: zoo-save 0.5s ease-out; }
        @keyframes zoo-grass { 0% { background-position: 0 0; } 100% { background-position: 64px 0; } }
        .zoo-grass {
          background-image: radial-gradient(2px 2px at 10px 10px, rgba(34,197,94,0.15), transparent),
            radial-gradient(1px 1px at 30px 20px, rgba(34,197,94,0.1), transparent),
            radial-gradient(2px 2px at 50px 15px, rgba(22,163,74,0.1), transparent);
          background-size: 64px 32px;
          animation: zoo-grass 20s linear infinite;
        }
      `}</style>

      <div className="max-w-[640px] mx-auto relative">
        {/* Grass background */}
        <div className="absolute inset-0 zoo-grass opacity-30 pointer-events-none rounded-xl" />

        {/* Offline earnings */}
        {offlineEarnings !== null && offlineEarnings > 0 && (
          <div className="relative mb-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="text-green-300">离线收益！</span>
              <span className="text-slate-300"> 离开期间获得了 </span>
              <span className="font-bold text-green-400">{formatNum(offlineEarnings)}</span>
              <span className="text-slate-300"> 金币</span>
            </div>
            <button onClick={() => setOfflineEarnings(null)} aria-label="收取离线收益"
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded bg-[#27272a] h-9 flex items-center">
              收取
            </button>
          </div>
        )}

        {/* Coins counter */}
        <div className="relative text-center mb-4">
          <div className="text-4xl sm:text-5xl font-bold zoo-coin-text tabular-nums">
            {formatNum(coins)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            每秒 {formatNum(income)} 金币
            <span className="ml-2 text-green-400/70">{mult}x 倍率</span>
            {fame > 0 && <span className="ml-2 text-amber-400/70">声望 {fameMult.toFixed(1)}x</span>}
            {saveFlash && <span className="zoo-save ml-2 text-emerald-400 text-xs">已保存</span>}
          </div>
        </div>

        {/* Zoo entrance (clickable) */}
        <div className="relative flex justify-center mb-6 h-36">
          <button
            onClick={clickEnclosure}
            aria-label="点击动物园获得金币"
            className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-green-500 via-emerald-600 to-green-800 flex items-center justify-center zoo-pulse active:zoo-click border-4 border-green-400/30 shadow-2xl shadow-green-900/50"
          >
            <span className="text-5xl sm:text-6xl select-none">🦁</span>
            {clickAnim && (
              <span className="absolute pointer-events-none zoo-float text-lg font-bold text-green-200"
                style={{ left: clickAnim.x, top: clickAnim.y }}>
                +{clickPower}
              </span>
            )}
          </button>
        </div>

        {/* Visitor stats */}
        <div className="relative grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><Users className="w-3 h-3" />游客</div>
            <div className="text-sm font-bold text-green-400">{formatNum(visitors)}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><Coins className="w-3 h-3" />门票/s</div>
            <div className="text-sm font-bold text-amber-400">{formatNum(calcVisitorIncome(animals, fame))}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1"><Star className="w-3 h-3" />种类</div>
            <div className="text-sm font-bold text-cyan-400">{animalVariety}/{ANIMALS.length}</div>
          </div>
        </div>

        {/* Upgrades */}
        <div className="relative mb-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 设施升级
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {UPGRADES.map((up, i) => {
              const owned = upgrades[i];
              const canAfford = coins >= up.cost;
              return (
                <button key={i} onClick={() => buyUpgrade(i)} disabled={owned || !canAfford}
                  aria-label={`${up.name} - ${up.desc}${owned ? " 已激活" : canAfford ? "" : " 余额不足"}`}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    owned ? "bg-green-500/10 border-green-500/30 opacity-60"
                      : canAfford ? "bg-[#18181b] border-green-500/30 hover:border-green-500/60 hover:bg-green-500/5 cursor-pointer active:scale-95"
                      : "bg-[#18181b] border-[#27272a] opacity-50 cursor-not-allowed"
                  }`}>
                  <div className="text-xl mb-0.5">{up.emoji}</div>
                  <div className="text-[10px] font-medium text-slate-200 truncate">{up.name}</div>
                  <div className="text-[9px] text-slate-500">{up.desc}</div>
                  <div className={`text-xs font-bold mt-0.5 ${owned ? "text-green-400" : canAfford ? "text-green-400" : "text-slate-600"}`}>
                    {owned ? "已激活" : formatNum(up.cost)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animals */}
        <div className="relative mb-4">
          <h3 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
            <span>🐾</span> 动物围栏
          </h3>
          <div className="space-y-1.5">
            {ANIMALS.map((a, i) => {
              const owned = animals[i];
              const price = animalPrice(a.baseCost, owned);
              const unlocked = totalEarned >= a.unlockAt;
              const canAfford = coins >= price;
              const animalIncome = a.output * owned * mult * fameMult;
              const ticketIncome = calcVisitorIncome(animals, fame) * (owned > 0 ? 1 : 0) / Math.max(1, animalVariety);

              if (!unlocked) {
                return (
                  <div key={i} className="w-full p-2.5 rounded-lg border border-[#27272a] bg-[#18181b]/30 flex items-center gap-3 opacity-50">
                    <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-500">{a.name}</div>
                      <div className="text-[10px] text-slate-600">需累计赚得 {formatNum(a.unlockAt)} 解锁</div>
                    </div>
                    <div className="text-right text-[10px] text-slate-600">{formatNum(Math.max(0, a.unlockAt - totalEarned))} 剩余</div>
                  </div>
                );
              }
              return (
                <button key={i} onClick={() => buyAnimal(i)} disabled={!canAfford}
                  aria-label={`购买${a.name} - 当前${owned}个 - 价格${a.baseCost === 0 ? "免费" : formatNum(price) + "金币"}`}
                  className={`w-full p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                    canAfford ? "bg-[#18181b] border-green-500/20 hover:border-green-500/50 hover:bg-green-500/5 cursor-pointer active:scale-[0.98]"
                      : "bg-[#18181b]/50 border-[#27272a] opacity-70 cursor-not-allowed"
                  }`}>
                  <span className="text-2xl flex-shrink-0">{a.emoji}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${a.color}`}>{a.name}</span>
                      <span className="text-xs text-slate-500">×{owned}</span>
                      {i > 0 && owned === 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">NEW</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">产出 {a.output}/s 每只</div>
                    {animalIncome > 0 && <div className="text-[10px] text-emerald-500/70">{formatNum(animalIncome)}/s</div>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${canAfford ? "text-green-400" : "text-slate-600"}`}>
                      {a.baseCost === 0 && owned === 0 ? "免费" : formatNum(price)}
                    </div>
                    <div className="text-[10px] text-slate-600">💰</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prestige section */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowPrestige(true)}
            disabled={prestigeGain <= 0}
            aria-label="转生系统"
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all ${
              prestigeGain > 0
                ? "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 cursor-pointer active:scale-[0.98]"
                : "bg-[#18181b]/50 border-[#27272a] opacity-50 cursor-not-allowed"
            }`}
          >
            <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-amber-300">转生系统</div>
              <div className="text-[10px] text-slate-500">
                {prestigeGain > 0
                  ? `可获得 ${prestigeGain} 声望 (当前 ${fame})，每点 +10% 产出`
                  : `累计赚得 1M 金币可转生 (当前 ${formatNum(totalEarned)})`}
              </div>
            </div>
            {prestigeGain > 0 && <ChevronUp className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        {/* Stats footer */}
        <div className="relative grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">总点击</div>
            <div className="text-sm font-bold text-slate-300">{formatNum(clickCount)}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">累计赚得</div>
            <div className="text-sm font-bold text-slate-300">{formatNum(totalEarned)}</div>
          </div>
          <div className="bg-[#18181b] rounded-lg p-2 border border-[#27272a]">
            <div className="text-[10px] text-slate-500">声望倍率</div>
            <div className="text-sm font-bold text-amber-400">{fameMult.toFixed(1)}x</div>
          </div>
        </div>

        {/* Controls */}
        <div className="relative flex items-center gap-2 mb-2">
          <button onClick={() => { pausedRef.current = true; setPaused(true); }} aria-label="暂停游戏"
            className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-green-400 bg-[#18181b] border border-[#27272a] hover:border-green-500/30 rounded-lg transition-colors">
            <Pause className="w-3.5 h-3.5" /> 暂停
          </button>
          <button onClick={hardReset} aria-label="重置全部进度"
            className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-500 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> 重置进度
          </button>
        </div>

        {/* Pause overlay */}
        {paused && (
          <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <Pause className="w-12 h-12 text-green-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">已暂停</h3>
            <p className="text-sm text-slate-400 mb-4">按 P 键或点击按钮继续</p>
            <button onClick={() => { pausedRef.current = false; setPaused(false); }} aria-label="继续游戏"
              className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl transition-all shadow-lg shadow-green-500/30 active:scale-95">
              <Play className="w-4 h-4" /> 继续游戏
            </button>
          </div>
        )}

        {/* Prestige confirm modal */}
        {showPrestige && (
          <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-20">
            <Star className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">转生确认</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-[300px]">
              重置所有动物、金币和升级，获得 <span className="font-bold text-amber-400">{prestigeGain}</span> 点声望。
              当前 {fame} → {fame + prestigeGain} 点，产出倍率 {fameMult.toFixed(1)}x → {(1 + (fame + prestigeGain) * 0.1).toFixed(1)}x
            </p>
            <div className="flex gap-2">
              <button onClick={doPrestige} aria-label="确认转生"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all shadow-lg shadow-amber-500/30 active:scale-95">
                <Star className="w-4 h-4" /> 确认转生
              </button>
              <button onClick={() => setShowPrestige(false)} aria-label="取消"
                className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-400 bg-[#18181b] border border-[#27272a] hover:border-slate-500 rounded-xl transition-all active:scale-95">
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
