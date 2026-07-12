"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Play, Trophy, Calendar, Shuffle, Pause, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "ring-tower";
const BEST_KEY = "gm_ring_tower_best_level";
const STEPS_KEY = "gm_ring_tower_best_steps";
const MAX_LEVEL = 5; // 5 levels: 3,4,5,6,7 rings

/* ===== Ring colors (index = ring size, 1-based) ===== */
const RING_COLORS = [
  { bg: "linear-gradient(180deg, #fca5a5, #ef4444, #b91c1c)", border: "#ef4444", glow: "rgba(239,68,68,0.5)" },
  { bg: "linear-gradient(180deg, #fdba74, #f97316, #c2410c)", border: "#f97316", glow: "rgba(249,115,22,0.5)" },
  { bg: "linear-gradient(180deg, #fde68a, #eab308, #a16207)", border: "#eab308", glow: "rgba(234,179,8,0.5)" },
  { bg: "linear-gradient(180deg, #86efac, #22c55e, #15803d)", border: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  { bg: "linear-gradient(180deg, #67e8f9, #06b6d4, #0e7490)", border: "#06b6d4", glow: "rgba(6,182,212,0.5)" },
  { bg: "linear-gradient(180deg, #93c5fd, #3b82f6, #1d4ed8)", border: "#3b82f6", glow: "rgba(59,130,246,0.5)" },
  { bg: "linear-gradient(180deg, #d8b4fe, #a855f7, #7e22ce)", border: "#a855f7", glow: "rgba(168,85,247,0.5)" },
];

const RING_COUNTS = [3, 4, 5, 6, 7]; // rings per level

/* ===== Seeded RNG ===== */
function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailySeed(): number {
  const today = new Date().toISOString().slice(0, 10);
  return parseInt(today.replace(/-/g, ""), 10);
}

function getDailyLevel(): number {
  const seed = getDailySeed();
  const rng = mulberry32(seed);
  return Math.floor(rng() * MAX_LEVEL) + 1;
}

/* ===== Game logic ===== */
function initPegs(ringCount: number): number[][] {
  const peg: number[] = [];
  for (let i = ringCount; i >= 1; i--) peg.push(i); // bottom = largest
  return [peg, [], []];
}

function checkWin(pegs: number[][], ringCount: number): boolean {
  return pegs[2].length === ringCount;
}

function canPlace(pegs: number[][], from: number, to: number): boolean {
  if (from === to) return false;
  const src = pegs[from];
  if (src.length === 0) return false;
  const ring = src[src.length - 1];
  const dst = pegs[to];
  if (dst.length === 0) return true;
  return dst[dst.length - 1] > ring;
}

function move(pegs: number[][], from: number, to: number): number[][] {
  const np = pegs.map((p) => [...p]);
  np[to].push(np[from].pop()!);
  return np;
}

/* ===== Component ===== */
export default function RingTowerPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing" | "won">("idle");
  const [level, setLevel] = useState(1);
  const [pegs, setPegs] = useState<number[][]>([[], [], []]);
  const [selected, setSelected] = useState<number | null>(null);
  const [steps, setSteps] = useState(0);
  const [bestLevel, setBestLevel] = useState(0);
  const [bestSteps, setBestSteps] = useState<Record<number, number>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [dailyMode, setDailyMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [movingRing, setMovingRing] = useState<{ from: number; to: number; ring: number } | null>(null);

  // Refs
  const pegsRef = useRef<number[][]>([[], [], []]);
  const levelRef = useRef(1);
  const stepsRef = useRef(0);
  const selectedRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const ringCount = RING_COUNTS[level - 1] ?? 3;
  const optimalSteps = Math.pow(2, ringCount) - 1;

  /* ===== Mount: load best ===== */
  useEffect(() => {
    setMounted(true);
    try {
      const bl = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (bl > 0) setBestLevel(bl);
      const raw = localStorage.getItem(STEPS_KEY);
      if (raw) setBestSteps(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  /* ===== Cleanup on unmount ===== */
  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
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

  /* ===== Load level ===== */
  const loadLevel = useCallback((lvl: number) => {
    const rc = RING_COUNTS[lvl - 1];
    const newPegs = initPegs(rc);
    pegsRef.current = newPegs;
    levelRef.current = lvl;
    stepsRef.current = 0;
    selectedRef.current = null;
    setPegs(newPegs);
    setLevel(lvl);
    setSteps(0);
    setSelected(null);
    setMovingRing(null);
    setPaused(false);
    pausedRef.current = false;
    setPhase("playing");
  }, []);

  /* ===== Start ===== */
  const start = useCallback((lvl: number) => {
    loadLevel(lvl);
  }, [loadLevel]);

  /* ===== Handle peg click ===== */
  const handlePegClick = useCallback((idx: number) => {
    if (pausedRef.current) return;
    const sel = selectedRef.current;
    if (sel === null) {
      if (pegsRef.current[idx].length === 0) return;
      selectedRef.current = idx;
      setSelected(idx);
      return;
    }
    if (sel === idx) {
      selectedRef.current = null;
      setSelected(null);
      return;
    }
    // Attempt move
    if (!canPlace(pegsRef.current, sel, idx)) {
      // Invalid move - flash or just reselect
      selectedRef.current = idx;
      setSelected(idx);
      return;
    }
    // Valid move
    const ring = pegsRef.current[sel][pegsRef.current[sel].length - 1];
    const newPegs = move(pegsRef.current, sel, idx);
    pegsRef.current = newPegs;
    stepsRef.current += 1;
    setPegs(newPegs);
    setSteps(stepsRef.current);
    setMovingRing({ from: sel, to: idx, ring });
    selectedRef.current = null;
    setSelected(null);

    const t = setTimeout(() => setMovingRing(null), 400);
    timersRef.current.push(t);

    // Check win
    const rc = RING_COUNTS[levelRef.current - 1];
    if (checkWin(newPegs, rc)) {
      const t2 = setTimeout(() => {
        setPhase("won");
        const lvl = levelRef.current;
        const s = stepsRef.current;
        const opt = Math.pow(2, rc) - 1;
        const score = lvl * 1000 + Math.max(0, (opt * 2 - s) * 10);
        void submitScore(GAME_ID, score);
        setRefreshKey((k) => k + 1);
        if (lvl > bestLevel) {
          setBestLevel(lvl);
          try { localStorage.setItem(BEST_KEY, String(lvl)); } catch { /* ignore */ }
        }
        const prev = bestSteps[lvl] ?? Infinity;
        if (s < prev) {
          const newBest = { ...bestSteps, [lvl]: s };
          setBestSteps(newBest);
          try { localStorage.setItem(STEPS_KEY, JSON.stringify(newBest)); } catch { /* ignore */ }
        }
      }, 500);
      timersRef.current.push(t2);
    }
  }, [bestLevel, bestSteps]);

  /* ===== Reset level ===== */
  const resetLevel = useCallback(() => {
    loadLevel(levelRef.current);
  }, [loadLevel]);

  /* ===== Next level ===== */
  const nextLevel = useCallback(() => {
    const next = Math.min(MAX_LEVEL, levelRef.current + 1);
    loadLevel(next);
  }, [loadLevel]);

  /* ===== Restart ===== */
  const restart = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("idle");
    setSteps(0);
    setSelected(null);
    setPaused(false);
    pausedRef.current = false;
  }, []);

  const isWon = checkWin(pegs, ringCount);
  const dailyLevel = getDailyLevel();

  const stats: GameStat[] = [
    { label: "关卡", value: `${level}/${MAX_LEVEL}`, icon: "🎯" },
    { label: "圆环数", value: ringCount, icon: "⭕" },
    { label: "步数", value: steps, icon: "👣" },
    { label: "最优步数", value: optimalSteps, icon: "🏆" },
  ];

  if (!mounted) {
    return (
      <GameShell gameId={GAME_ID} title="圆环塔" iconEmoji="🗼" iconGradient="from-amber-500 to-orange-600"
        stats={stats} shareScore={0} refreshKey={0}>
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId={GAME_ID} title="圆环塔" iconEmoji="🗼" iconGradient="from-amber-500 to-orange-600"
      stats={stats} shareScore={level * 1000 + Math.max(0, (optimalSteps * 2 - steps) * 10)} refreshKey={refreshKey}>
      <style>{`
        @keyframes rt-ring-drop { 0% { transform: translateY(-60px) scale(1.1); opacity: 0.5; } 60% { transform: translateY(4px) scale(1); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        .rt-drop { animation: rt-ring-drop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes rt-selected-bounce { 0%, 100% { transform: translateY(-12px); } 50% { transform: translateY(-18px); } }
        .rt-bounce { animation: rt-selected-bounce 0.6s ease-in-out infinite; }
        @keyframes rt-win-glow { 0%, 100% { filter: brightness(1) drop-shadow(0 0 8px rgba(251,191,36,0.4)); } 50% { filter: brightness(1.3) drop-shadow(0 0 20px rgba(251,191,36,0.8)); } }
        .rt-win-glow { animation: rt-win-glow 1s ease-in-out infinite; }
        @keyframes rt-celebrate { 0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.2) rotate(5deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        .rt-celebrate { animation: rt-celebrate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      <div className="flex flex-col items-center p-4 min-h-[500px]">
        {/* Level indicator */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => level > 1 && loadLevel(level - 1)}
            disabled={level <= 1 || phase !== "playing"}
            aria-label="上一关"
            className="flex items-center justify-center h-11 w-11 rounded-lg bg-[#18181b] border border-[#27272a] text-slate-400 hover:text-amber-400 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-xs text-slate-500">{ringCount} 个圆环</div>
            <div className="text-2xl font-bold text-amber-400">{level} / {MAX_LEVEL}</div>
          </div>
          <button
            onClick={() => level < MAX_LEVEL && loadLevel(level + 1)}
            disabled={level >= MAX_LEVEL || phase !== "playing"}
            aria-label="下一关"
            className="flex items-center justify-center h-11 w-11 rounded-lg bg-[#18181b] border border-[#27272a] text-slate-400 hover:text-amber-400 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Game area */}
        <div className="relative flex-1 flex items-end justify-center w-full" style={{ minHeight: "360px" }}>
          <div className="flex items-end justify-around w-full max-w-[480px] gap-4 pb-2">
            {pegs.map((peg, pegIdx) => {
              const isSelected = selected === pegIdx;
              const isTarget = movingRing?.to === pegIdx;
              return (
                <button
                  key={pegIdx}
                  onClick={() => handlePegClick(pegIdx)}
                  disabled={phase !== "playing" || paused}
                  aria-label={`柱子${pegIdx + 1} ${peg.length > 0 ? `含${peg.length}个圆环` : "空"}`}
                  className="relative flex flex-col items-center justify-end flex-1 transition-all"
                  style={{ height: "340px", cursor: phase === "playing" && !paused ? "pointer" : "default" }}
                >
                  {/* Peg base */}
                  <div
                    className="absolute bottom-0 w-full h-3 rounded-lg"
                    style={{
                      background: isSelected
                        ? "linear-gradient(180deg, #fbbf24, #f59e0b)"
                        : isWon && pegIdx === 2
                          ? "linear-gradient(180deg, #fbbf24, #f59e0b)"
                          : "linear-gradient(180deg, #3f3f46, #27272a)",
                      boxShadow: isSelected ? "0 0 12px rgba(251,191,36,0.4)" : "none",
                    }}
                  />
                  {/* Peg pole */}
                  <div
                    className="absolute bottom-3 w-2 rounded-t-full"
                    style={{
                      height: "300px",
                      background: isSelected
                        ? "linear-gradient(180deg, #fbbf24, #92400e)"
                        : "linear-gradient(180deg, #52525b, #3f3f46)",
                      boxShadow: isSelected ? "0 0 8px rgba(251,191,36,0.3)" : "none",
                    }}
                  />
                  {/* Peg label */}
                  <div className="absolute -bottom-6 text-xs text-slate-500 font-medium">
                    {pegIdx === 0 ? "A" : pegIdx === 1 ? "B" : "C"}
                    {pegIdx === 2 && <span className="ml-1 text-amber-500/60">目标</span>}
                  </div>
                  {/* Rings */}
                  <div className="relative flex flex-col-reverse items-center justify-start mb-3 z-10" style={{ height: "300px", justifyContent: "flex-end" }}>
                    {peg.map((ringSize, ri) => {
                      const isTop = ri === peg.length - 1;
                      const rc = RING_COLORS[ringSize - 1];
                      const widthPct = 30 + (ringSize / 7) * 65; // 30% to 95%
                      const isMovingRing = movingRing && movingRing.to === pegIdx && isTop;
                      const isWonRing = isWon && pegIdx === 2;
                      return (
                        <div
                          key={ri}
                          className={`rounded-full flex items-center justify-center text-[10px] font-bold text-white/80 ${
                            isMovingRing ? "rt-drop" : ""
                          } ${isWonRing ? "rt-win-glow" : ""}`}
                          style={{
                            width: `${widthPct}%`,
                            height: "26px",
                            background: rc.bg,
                            border: `1px solid ${rc.border}`,
                            boxShadow: isTop && isSelected
                              ? `0 0 12px ${rc.glow}, 0 -4px 8px rgba(0,0,0,0.3)`
                              : `0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
                            marginBottom: "1px",
                            transform: isTop && isSelected ? "translateY(-14px)" : "none",
                            transition: isTop && isSelected ? "transform 0.2s" : "none",
                          }}
                        >
                          {ringSize}
                        </div>
                      );
                    })}
                    {/* Floating selected ring indicator */}
                    {isSelected && peg.length > 0 && (
                      <div
                        className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-400 text-xs animate-pulse"
                      >
                        ⬆
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-5xl mb-3">🗼</div>
              <h3 className="text-xl font-bold mb-2 text-white">圆环塔</h3>
              <p className="text-sm text-slate-400 mb-4 text-center px-4 max-w-[320px]">
                经典汉诺塔！将所有圆环从A柱移到C柱。大盘不能放小盘上。用最少步数完成挑战！
              </p>
              <div className="flex gap-2 mb-4">
                <button onClick={() => setDailyMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!dailyMode ? "bg-amber-500/20 border border-amber-500/40 text-amber-300" : "bg-[#27272a] border border-[#3f3f46] text-slate-400"}`}>
                  <Shuffle className="w-3 h-3 inline mr-1" /> 自由模式
                </button>
                <button onClick={() => setDailyMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dailyMode ? "bg-amber-500/20 border border-amber-500/40 text-amber-300" : "bg-[#27272a] border border-[#3f3f46] text-slate-400"}`}>
                  <Calendar className="w-3 h-3 inline mr-1" /> 每日挑战 ({RING_COUNTS[dailyLevel - 1]}环)
                </button>
              </div>
              {/* Level select */}
              <div className="flex gap-2 mb-4">
                {RING_COUNTS.map((rc, i) => {
                  const lvl = i + 1;
                  const unlocked = lvl <= bestLevel + 1;
                  return (
                    <button
                      key={lvl}
                      onClick={() => !dailyMode && unlocked && start(lvl)}
                      disabled={dailyMode || !unlocked}
                      className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-all ${
                        !unlocked || dailyMode
                          ? "bg-[#18181b] border border-[#27272a] text-slate-700 cursor-not-allowed"
                          : lvl <= bestLevel
                            ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25"
                            : "bg-[#18181b] border border-[#3f3f46] text-slate-300 hover:border-amber-500/40"
                      }`}
                    >
                      <span className="text-lg font-bold">{rc}</span>
                      <span className="text-[9px]">环</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => start(dailyMode ? dailyLevel : 1)}
                aria-label="开始游戏"
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all shadow-lg shadow-amber-500/30 active:scale-95"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              {bestLevel > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Trophy className="w-3 h-3 text-amber-400" /> 已通关: <span className="text-amber-400 font-bold">{bestLevel}</span> 关
                </div>
              )}
            </div>
          )}

          {/* Win overlay */}
          {phase === "won" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center rt-celebrate">
              <Crown className="w-12 h-12 text-amber-400 mb-2" />
              <h3 className="text-xl font-bold mb-1 text-white">{level >= MAX_LEVEL ? "全部通关！" : "过关！"}</h3>
              <p className="text-sm text-slate-400 mb-2">{ringCount} 个圆环 - 第 {level} 关</p>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs w-full max-w-[300px]">
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">用时步数</div>
                  <div className="text-lg font-bold text-amber-400">{steps}</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最优步数</div>
                  <div className="text-lg font-bold text-cyan-400">{optimalSteps}</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最佳记录</div>
                  <div className="text-lg font-bold text-green-400">{bestSteps[level] ?? steps}</div>
                </div>
              </div>
              {steps === optimalSteps && (
                <p className="text-sm text-green-400 mb-3 font-bold">完美！最优解！</p>
              )}
              <div className="flex gap-2">
                {level < MAX_LEVEL && (
                  <button onClick={nextLevel} aria-label="下一关"
                    className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all shadow-lg shadow-amber-500/30 active:scale-95">
                    下一关 <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button onClick={resetLevel} aria-label="重玩本关"
                  className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] hover:border-amber-500/30 rounded-xl transition-all active:scale-95">
                  <RotateCcw className="w-4 h-4" /> 重玩
                </button>
                <button onClick={restart} aria-label="返回菜单"
                  className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-xl transition-all active:scale-95">
                  菜单
                </button>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {phase === "playing" && paused && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Pause className="w-12 h-12 text-amber-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">已暂停</h3>
              <p className="text-sm text-slate-400 mb-4">按 P 键或点击按钮继续</p>
              <button onClick={() => { pausedRef.current = false; setPaused(false); }} aria-label="继续游戏"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all shadow-lg shadow-amber-500/30 active:scale-95">
                <Play className="w-4 h-4" /> 继续游戏
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        {phase === "playing" && !paused && (
          <div className="mt-6 flex items-center gap-2">
            <button onClick={resetLevel} aria-label="重置本关"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-amber-400 bg-[#18181b] border border-[#27272a] hover:border-amber-500/30 rounded-lg transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> 重置
            </button>
            <button onClick={() => { pausedRef.current = true; setPaused(true); }} aria-label="暂停游戏"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-amber-400 bg-[#18181b] border border-[#27272a] hover:border-amber-500/30 rounded-lg transition-colors">
              <Pause className="w-3.5 h-3.5" /> 暂停
            </button>
            <button onClick={restart} aria-label="返回菜单"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors">
              菜单
            </button>
          </div>
        )}

        {/* Hint */}
        {phase === "playing" && !paused && (
          <div className="mt-2 text-xs text-slate-500 text-center">
            {selected !== null ? `已选择柱子 ${selected === 0 ? "A" : selected === 1 ? "B" : "C"}，点击目标柱子放置` : "点击柱子选择最顶层圆环，再点击目标柱子放置"}
            <span className="ml-2 text-amber-500/60">大盘不能放小盘上</span>
          </div>
        )}
      </div>
    </GameShell>
  );
}
