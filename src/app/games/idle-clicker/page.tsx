"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cookie, RotateCcw, Zap, Clock, Cpu, Sparkles, Gauge } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { recordGamePlay, submitScore } from "@/lib/gamification";

const GAME_ID = "idle-clicker";
const SAVE_KEY = "gm_idle_clicker_save";

/* ===== Upgrade definitions ===== */
interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  icon: typeof Cookie;
  basePrice: number;
  maxLevel: number;
}

const UPGRADES: UpgradeDef[] = [
  {
    id: "clickPower",
    name: "点击倍率",
    description: "每级 +1 点击力",
    icon: Zap,
    basePrice: 10,
    maxLevel: 100,
  },
  {
    id: "autoClick",
    name: "自动点击器",
    description: "每级 +1 次自动点击/秒",
    icon: Gauge,
    basePrice: 50,
    maxLevel: 100,
  },
  {
    id: "multiEngine",
    name: "倍率引擎",
    description: "每级全局产出 ×1.5",
    icon: Sparkles,
    basePrice: 200,
    maxLevel: 20,
  },
  {
    id: "overclock",
    name: "超频器",
    description: "每级自动点击速度 ×2",
    icon: Cpu,
    basePrice: 500,
    maxLevel: 10,
  },
  {
    id: "quantumCore",
    name: "量子核心",
    description: "每级 +5 固定产出/秒",
    icon: Cpu,
    basePrice: 1000,
    maxLevel: 50,
  },
  {
    id: "timeWarp",
    name: "时间扭曲",
    description: "每级全局产出 ×3",
    icon: Clock,
    basePrice: 5000,
    maxLevel: 10,
  },
];

interface SaveData {
  score: number;
  totalEarned: number;
  levels: Record<string, number>;
  lastSave: number;
  clickCount: number;
}

function defaultSave(): SaveData {
  return {
    score: 0,
    totalEarned: 0,
    levels: {},
    lastSave: Date.now(),
    clickCount: 0,
  };
}

function upgradePrice(def: UpgradeDef, level: number): number {
  return Math.floor(def.basePrice * Math.pow(1.15, level));
}

function calcClickPower(levels: Record<string, number>): number {
  return 1 + (levels.clickPower || 0);
}

function calcAutoClickRate(levels: Record<string, number>): number {
  const base = levels.autoClick || 0;
  const overclock = levels.overclock || 0;
  return base * Math.pow(2, overclock);
}

function calcFixedRate(levels: Record<string, number>): number {
  return (levels.quantumCore || 0) * 5;
}

function calcGlobalMultiplier(levels: Record<string, number>): number {
  const engine = levels.multiEngine || 0;
  const warp = levels.timeWarp || 0;
  return Math.pow(1.5, engine) * Math.pow(3, warp);
}

function calcTotalRate(levels: Record<string, number>): number {
  const autoRate = calcAutoClickRate(levels) * calcClickPower(levels);
  const fixed = calcFixedRate(levels);
  return (autoRate + fixed) * calcGlobalMultiplier(levels);
}

/* ===== Number formatting ===== */
function formatNum(n: number): string {
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(2) + "K";
  if (n < 1e9) return (n / 1e6).toFixed(2) + "M";
  if (n < 1e12) return (n / 1e9).toFixed(2) + "B";
  if (n < 1e15) return (n / 1e12).toFixed(2) + "T";
  return n.toExponential(2);
}

interface FloatNum {
  id: number;
  value: number;
  x: number;
  y: number;
}

export default function IdleClickerPage() {
  /* ===== mounted mode ===== */
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [clickCount, setClickCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [floats, setFloats] = useState<FloatNum[]>([]);
  const [offlineEarned, setOfflineEarned] = useState(0);
  const [showOffline, setShowOffline] = useState(false);
  const [cookieScale, setCookieScale] = useState(1);
  const [cookieRotate, setCookieRotate] = useState(0);

  const scoreRef = useRef(0);
  const totalRef = useRef(0);
  const levelsRef = useRef<Record<string, number>>({});
  const floatIdRef = useRef(0);
  const saveTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const clickCountRef = useRef(0);

  /* ===== load save (mounted) ===== */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let data: SaveData = defaultSave();
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SaveData;
        if (parsed && typeof parsed.score === "number") {
          data = { ...defaultSave(), ...parsed };
        }
      }
    } catch {
      /* ignore */
    }

    // Calculate offline earnings
    const now = Date.now();
    const elapsed = Math.min((now - data.lastSave) / 1000, 86400); // max 24h
    const rate = calcTotalRate(data.levels);
    const earned = Math.floor(rate * elapsed * 0.5); // 50% efficiency offline

    if (earned > 0) {
      data.score += earned;
      data.totalEarned += earned;
      setOfflineEarned(earned);
      setShowOffline(true);
      setTimeout(() => setShowOffline(false), 5000);
    }

    scoreRef.current = data.score;
    totalRef.current = data.totalEarned;
    levelsRef.current = data.levels;
    clickCountRef.current = data.clickCount;

    setScore(data.score);
    setTotalEarned(data.totalEarned);
    setLevels(data.levels);
    setClickCount(data.clickCount);
    setMounted(true);
    recordGamePlay(GAME_ID, Math.floor(data.totalEarned));
    setRefreshKey((k) => k + 1);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ===== auto production loop ===== */
  useEffect(() => {
    if (!mounted) return;

    const tick = () => {
      const rate = calcTotalRate(levelsRef.current);
      if (rate > 0) {
        const gain = rate / 10; // 10 ticks per second
        scoreRef.current += gain;
        totalRef.current += gain;
        setScore(scoreRef.current);
        setTotalEarned(totalRef.current);
      }
    };

    const interval = setInterval(tick, 100);

    // Submit score to leaderboard every 30 seconds
    const submitInterval = setInterval(() => {
      submitScore(GAME_ID, Math.floor(scoreRef.current), `总产出 ${formatNum(totalRef.current)}`);
    }, 30000);

    // Auto-save every 5 seconds
    saveTimerRef.current = setInterval(() => {
      const save: SaveData = {
        score: scoreRef.current,
        totalEarned: totalRef.current,
        levels: levelsRef.current,
        lastSave: Date.now(),
        clickCount: clickCountRef.current,
      };
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      } catch {
        /* ignore */
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(submitInterval);
      clearInterval(saveTimerRef.current);
      // Submit final score on unmount
      submitScore(GAME_ID, Math.floor(scoreRef.current), `总产出 ${formatNum(totalRef.current)}`);
      // Save on unmount
      const save: SaveData = {
        score: scoreRef.current,
        totalEarned: totalRef.current,
        levels: levelsRef.current,
        lastSave: Date.now(),
        clickCount: clickCountRef.current,
      };
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(save));
      } catch {
        /* ignore */
      }
    };
  }, [mounted]);

  /* ===== click handler ===== */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const power = calcClickPower(levelsRef.current);
      const multiplier = calcGlobalMultiplier(levelsRef.current);
      const gain = power * multiplier;
      scoreRef.current += gain;
      totalRef.current += gain;
      clickCountRef.current += 1;
      setScore(scoreRef.current);
      setTotalEarned(totalRef.current);
      setClickCount(clickCountRef.current);

      // Float number animation
      const rect = e.currentTarget.getBoundingClientRect();
      const id = floatIdRef.current++;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setFloats((prev) => [...prev, { id, value: gain, x, y }]);
      setTimeout(() => {
        setFloats((prev) => prev.filter((f) => f.id !== id));
      }, 1000);

      // Cookie animation
      setCookieScale(0.92);
      setCookieRotate((r) => r + 15);
      setTimeout(() => setCookieScale(1), 100);
    },
    []
  );

  /* ===== buy upgrade ===== */
  const buyUpgrade = useCallback((def: UpgradeDef) => {
    const currentLevel = levelsRef.current[def.id] || 0;
    if (currentLevel >= def.maxLevel) return;
    const price = upgradePrice(def, currentLevel);
    if (scoreRef.current < price) return;

    scoreRef.current -= price;
    setScore(scoreRef.current);

    const newLevels = { ...levelsRef.current, [def.id]: currentLevel + 1 };
    levelsRef.current = newLevels;
    setLevels(newLevels);
  }, []);

  /* ===== reset ===== */
  const handleReset = () => {
    const fresh = defaultSave();
    scoreRef.current = 0;
    totalRef.current = 0;
    levelsRef.current = {};
    clickCountRef.current = 0;
    setScore(0);
    setTotalEarned(0);
    setLevels({});
    setClickCount(0);
    setOfflineEarned(0);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
  };

  const clickPower = calcClickPower(levels);
  const autoRate = calcAutoClickRate(levels);
  const multiplier = calcGlobalMultiplier(levels);
  const totalRate = calcTotalRate(levels);

  const stats: GameStat[] = [
    { label: "积分", value: formatNum(score) },
    { label: "每秒", value: formatNum(totalRate) },
    { label: "总产出", value: formatNum(totalEarned) },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="放置点击"
        description="点击大饼干获得积分，购买升级实现自动产出"
        instructions="点击大饼干获得积分。购买升级提升点击力和自动产出。关闭页面后也会继续产出（50%效率），重新打开时会结算离线收益。"
        icon={Cookie}
        iconEmoji="🍪"
        iconGradient="from-amber-400 to-orange-600"
        stats={stats}
        shareScore={Math.floor(totalEarned)}
        refreshKey={refreshKey}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-slate-500">加载中...</div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="放置点击"
      description="点击大饼干获得积分，购买升级实现自动产出"
      instructions="点击大饼干获得积分。购买升级提升点击力和自动产出。关闭页面后也会继续产出（50%效率），重新打开时会结算离线收益。"
      icon={Cookie}
      iconEmoji="🍪"
      iconGradient="from-amber-400 to-orange-600"
      stats={stats}
      shareScore={Math.floor(totalEarned)}
      refreshKey={refreshKey}
    >
      <div className="max-w-[600px] mx-auto">
        {/* Offline earnings popup */}
        {showOffline && (
          <div className="mb-4 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-center animate-pulse">
            <div className="text-sm text-amber-300">离线收益</div>
            <div className="text-2xl font-bold text-amber-200">
              +{formatNum(offlineEarned)} 积分
            </div>
          </div>
        )}

        {/* Score display */}
        <div className="text-center mb-6">
          <div className="text-4xl sm:text-5xl font-bold text-white tabular-nums">
            {formatNum(score)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            每秒 +{formatNum(totalRate)} · 每次点击 +{formatNum(clickPower * multiplier)}
          </div>
        </div>

        {/* Cookie clicker */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <button
              onClick={handleClick}
              className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full flex items-center justify-center transition-transform duration-100 hover:scale-105 active:scale-95"
              style={{
                transform: `scale(${cookieScale}) rotate(${cookieRotate}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl" />
              {/* Cookie body */}
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border-4 border-amber-500/50 shadow-2xl shadow-amber-900/50 flex items-center justify-center">
                <span className="text-7xl sm:text-8xl lg:text-9xl select-none">
                  🍪
                </span>
                {/* Chocolate chips */}
                <div className="absolute top-1/4 left-1/3 w-4 h-4 rounded-full bg-amber-950/60" />
                <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-amber-950/60" />
                <div className="absolute bottom-1/4 left-1/2 w-4 h-4 rounded-full bg-amber-950/60" />
              </div>
            </button>

            {/* Floating numbers */}
            {floats.map((f) => (
              <div
                key={f.id}
                className="absolute pointer-events-none text-lg font-bold text-amber-300"
                style={{
                  left: f.x,
                  top: f.y,
                  animation: "floatUp 1s ease-out forwards",
                }}
              >
                +{formatNum(f.value)}
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">点击力</div>
            <div className="text-lg font-bold text-white">{formatNum(clickPower)}</div>
          </div>
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">自动/秒</div>
            <div className="text-lg font-bold text-white">{formatNum(autoRate)}</div>
          </div>
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">倍率</div>
            <div className="text-lg font-bold text-white">{multiplier.toFixed(1)}x</div>
          </div>
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500">点击次数</div>
            <div className="text-lg font-bold text-white">{formatNum(clickCount)}</div>
          </div>
        </div>

        {/* Upgrades list */}
        <div className="space-y-2 mb-4">
          {UPGRADES.map((def) => {
            const level = levels[def.id] || 0;
            const price = upgradePrice(def, level);
            const canAfford = score >= price;
            const maxed = level >= def.maxLevel;
            const Icon = def.icon;

            return (
              <button
                key={def.id}
                onClick={() => buyUpgrade(def)}
                disabled={!canAfford || maxed}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  maxed
                    ? "bg-[#18181b] border-[#27272a] opacity-50"
                    : canAfford
                      ? "bg-[#18181b] border-[#8b5cf6]/30 hover:border-[#8b5cf6]/60 hover:bg-[#1c1c1f] cursor-pointer"
                      : "bg-[#18181b] border-[#27272a] opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    canAfford && !maxed
                      ? "bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9]"
                      : "bg-[#27272a]"
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {def.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      Lv.{level}/{def.maxLevel}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {def.description}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {maxed ? (
                    <span className="text-sm font-bold text-amber-400">MAX</span>
                  ) : (
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        canAfford ? "text-[#a78bfa]" : "text-slate-600"
                      }`}
                    >
                      {formatNum(price)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset button */}
        <div className="flex justify-center">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置进度
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-60px) scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </GameShell>
  );
}
