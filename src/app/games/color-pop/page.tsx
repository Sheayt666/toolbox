"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Play, Trophy, Calendar, Shuffle, Pause, Bomb } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "color-pop";
const BEST_KEY = "gm_color_pop_best";
const GAME_DURATION = 60;
const ROWS = 10;
const COLS = 10;
const NUM_COLORS = 6;

/* ===== Color definitions ===== */
interface ColorDef {
  bg: string;
  glow: string;
  border: string;
}

const COLOR_DEFS: ColorDef[] = [
  { bg: "radial-gradient(circle at 35% 30%, #fca5a5 0%, #ef4444 55%, #991b1b 100%)", glow: "rgba(239,68,68,0.6)", border: "#ef4444" },
  { bg: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 55%, #1e3a8a 100%)", glow: "rgba(59,130,246,0.6)", border: "#3b82f6" },
  { bg: "radial-gradient(circle at 35% 30%, #86efac 0%, #22c55e 55%, #14532d 100%)", glow: "rgba(34,197,94,0.6)", border: "#22c55e" },
  { bg: "radial-gradient(circle at 35% 30%, #fde68a 0%, #eab308 55%, #713f12 100%)", glow: "rgba(234,179,8,0.6)", border: "#eab308" },
  { bg: "radial-gradient(circle at 35% 30%, #d8b4fe 0%, #a855f7 55%, #581c87 100%)", glow: "rgba(168,85,247,0.6)", border: "#a855f7" },
  { bg: "radial-gradient(circle at 35% 30%, #fdba74 0%, #f97316 55%, #7c2d12 100%)", glow: "rgba(249,115,22,0.6)", border: "#f97316" },
];

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

/* ===== Grid types ===== */
type Grid = (number | null)[][];

function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<number | null>(COLS).fill(null));
}

function generateGrid(rng: () => number = Math.random): Grid {
  const grid: Grid = Array.from({ length: ROWS }, () =>
    Array<number | null>(COLS).fill(null),
  );
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = Math.floor(rng() * NUM_COLORS);
    }
  }
  return grid;
}

/* ===== Flood fill to find connected same-color group ===== */
function findGroup(grid: Grid, sr: number, sc: number): [number, number][] {
  const color = grid[sr][sc];
  if (color === null) return [];
  const visited = new Set<string>();
  const queue: [number, number][] = [[sr, sc]];
  const group: [number, number][] = [];
  while (queue.length > 0) {
    const [r, c] = queue.shift()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    if (grid[r][c] !== color) continue;
    visited.add(key);
    group.push([r, c]);
    queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return group;
}

/* ===== Remove group and apply gravity ===== */
function removeAndGravity(grid: Grid, group: [number, number][], rng: () => number = Math.random): Grid {
  const nb: Grid = grid.map((row) => [...row]);
  for (const [r, c] of group) {
    nb[r][c] = null;
  }
  // Apply gravity per column: collect non-null from bottom, fill top with new
  for (let c = 0; c < COLS; c++) {
    const stack: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (nb[r][c] !== null) stack.push(nb[r][c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      const idx = ROWS - 1 - r;
      if (idx < stack.length) {
        nb[r][c] = stack[idx];
      } else {
        nb[r][c] = Math.floor(rng() * NUM_COLORS);
      }
    }
  }
  return nb;
}

function countRemaining(grid: Grid): number {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== null) count++;
    }
  }
  return count;
}

function hasAnyGroup(grid: Grid): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === null) continue;
      if (findGroup(grid, r, c).length >= 2) return true;
    }
  }
  return false;
}

/* ===== Component ===== */
export default function ColorPopPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [score, setScore] = useState(0);
  const [clears, setClears] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bestScore, setBestScore] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [poppingCells, setPoppingCells] = useState<Set<string>>(new Set());
  const [hoverGroup, setHoverGroup] = useState<Set<string>>(new Set());
  const [floatScore, setFloatScore] = useState<{ id: number; value: number; r: number; c: number } | null>(null);
  const [dailyMode, setDailyMode] = useState(false);
  const [paused, setPaused] = useState(false);

  // Refs
  const gridRef = useRef<Grid>(grid);
  const scoreRef = useRef(0);
  const clearsRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const rngRef = useRef<(() => number) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const floatIdRef = useRef(0);
  const pausedRef = useRef(false);

  /* ===== Mount: load best score ===== */
  useEffect(() => {
    setMounted(true);
    try {
      const b = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (b > 0) {
        bestRef.current = b;
        setBestScore(b);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== Cleanup on unmount ===== */
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ===== Pause hotkey (P) ===== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") {
          setPaused((p) => {
            pausedRef.current = !p;
            return !p;
          });
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase]);

  /* ===== Timer ===== */
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        doGameOver();
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ===== Game over ===== */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("over");
    setHoverGroup(new Set());

    if (!submittedRef.current) {
      submittedRef.current = true;
      const s = Math.floor(scoreRef.current);
      void submitScore(GAME_ID, s);
      setRefreshKey((k) => k + 1);
      if (s > bestRef.current) {
        bestRef.current = s;
        setBestScore(s);
        try {
          localStorage.setItem(BEST_KEY, String(s));
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  /* ===== Handle cell click ===== */
  const handleClick = useCallback(
    (r: number, c: number) => {
      if (!runningRef.current || overRef.current || pausedRef.current) return;
      const group = findGroup(gridRef.current, r, c);
      if (group.length < 2) return;

      // Score: n*(n-1)*10
      const n = group.length;
      const points = n * (n - 1) * 10;
      scoreRef.current += points;
      clearsRef.current += 1;
      setScore(scoreRef.current);
      setClears(clearsRef.current);

      // Show popping animation
      const popSet = new Set<string>();
      for (const [gr, gc] of group) popSet.add(`${gr},${gc}`);
      setPoppingCells(popSet);
      setHoverGroup(new Set());

      // Floating score
      const fid = floatIdRef.current++;
      setFloatScore({ id: fid, value: points, r, c });
      const ft = setTimeout(() => {
        setFloatScore((prev) => (prev?.id === fid ? null : prev));
      }, 900);
      timersRef.current.push(ft);

      // After pop animation, apply gravity
      const t = setTimeout(() => {
        if (!runningRef.current || overRef.current) return;
        const rng = rngRef.current || Math.random;
        const newGrid = removeAndGravity(gridRef.current, group, rng);
        gridRef.current = newGrid;
        setGrid(newGrid);
        setPoppingCells(new Set());

        // Check for board clear bonus
        const remaining = countRemaining(newGrid);
        if (remaining < 10) {
          const bonus = (10 - remaining) * 100;
          scoreRef.current += bonus;
          setScore(scoreRef.current);
          const bid = floatIdRef.current++;
          setFloatScore({ id: bid, value: bonus, r: 0, c: Math.floor(COLS / 2) });
          const bt = setTimeout(() => {
            setFloatScore((prev) => (prev?.id === bid ? null : prev));
          }, 900);
          timersRef.current.push(bt);
        }

        // If no groups remain, reshuffle
        if (!hasAnyGroup(newGrid)) {
          const rng2 = rngRef.current || Math.random;
          const reshuffled = generateGrid(rng2);
          gridRef.current = reshuffled;
          setGrid(reshuffled);
        }
      }, 300);
      timersRef.current.push(t);
    },
    [],
  );

  /* ===== Handle cell hover ===== */
  const handleHover = useCallback(
    (r: number, c: number) => {
      if (!runningRef.current || overRef.current || pausedRef.current) return;
      const group = findGroup(gridRef.current, r, c);
      if (group.length >= 2) {
        setHoverGroup(new Set(group.map(([gr, gc]) => `${gr},${gc}`)));
      } else {
        setHoverGroup(new Set());
      }
    },
    [],
  );

  /* ===== Start game ===== */
  const start = useCallback(() => {
    if (dailyMode) {
      rngRef.current = mulberry32(getDailySeed());
    } else {
      rngRef.current = null;
    }
    const rng = rngRef.current || Math.random;
    const g = generateGrid(rng);
    // Ensure starting board has groups
    let attempts = 0;
    while (!hasAnyGroup(g) && attempts < 10) {
      const g2 = generateGrid(rng);
      g.splice(0, g.length, ...g2);
      attempts++;
    }
    gridRef.current = g;
    scoreRef.current = 0;
    clearsRef.current = 0;
    timeLeftRef.current = GAME_DURATION;
    overRef.current = false;
    runningRef.current = true;
    submittedRef.current = false;
    pausedRef.current = false;

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setGrid(g);
    setScore(0);
    setClears(0);
    setTimeLeft(GAME_DURATION);
    setPoppingCells(new Set());
    setHoverGroup(new Set());
    setFloatScore(null);
    setPaused(false);
    setPhase("playing");
  }, [dailyMode]);

  /* ===== Restart ===== */
  const restart = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    pausedRef.current = false;
    setPhase("idle");
    setScore(0);
    setClears(0);
    setTimeLeft(GAME_DURATION);
    setPoppingCells(new Set());
    setHoverGroup(new Set());
    setFloatScore(null);
    setPaused(false);
  }, []);

  const timePercent = (timeLeft / GAME_DURATION) * 100;
  const remaining = countRemaining(grid);

  const stats: GameStat[] = [
    { label: "分数", value: score, icon: "🎯" },
    { label: "消除", value: clears, icon: "💥" },
    { label: "剩余", value: remaining, icon: "🧩" },
    { label: "倒计时", value: `${timeLeft}s`, icon: "⏱️" },
  ];

  /* ===== Loading state ===== */
  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="色彩爆破"
        iconEmoji="🎨"
        iconGradient="from-pink-500 to-rose-600"
        stats={stats}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="色彩爆破"
      iconEmoji="🎨"
      iconGradient="from-pink-500 to-rose-600"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes cp-pop {
          0% { opacity: 1; transform: scale(1); filter: brightness(1); }
          40% { opacity: 0.9; transform: scale(1.4); filter: brightness(2.5); }
          100% { opacity: 0; transform: scale(0); filter: brightness(3); }
        }
        .cp-pop { animation: cp-pop 0.3s ease-out forwards; }
        @keyframes cp-drop {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cp-drop { animation: cp-drop 0.3s ease-out forwards; }
        @keyframes cp-float {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.4); }
        }
        .cp-float { animation: cp-float 0.9s ease-out forwards; }
        @keyframes cp-hover-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .cp-hover { animation: cp-hover-pulse 0.6s ease-in-out infinite; }
      `}</style>

      <div className="flex flex-col items-center max-w-[480px] mx-auto p-4">
        {/* Timer bar */}
        <div className="w-full h-2.5 bg-[#27272a] rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${timePercent}%`,
              background:
                timePercent > 33
                  ? "linear-gradient(90deg, #ec4899, #f43f5e)"
                  : "linear-gradient(90deg, #ef4444, #f59e0b)",
              boxShadow: "0 0 10px rgba(236, 72, 153, 0.4)",
            }}
          />
        </div>

        {/* Score row */}
        <div className="flex items-center justify-between w-full mb-3 relative">
          <div className="text-left">
            <div className="text-xs text-slate-500">分数</div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            {floatScore && (
              <div
                key={floatScore.id}
                className="cp-float text-lg font-bold text-pink-300 pointer-events-none"
              >
                +{floatScore.value}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">最佳</div>
            <div className="text-lg font-bold text-amber-400 tabular-nums">{bestScore}</div>
          </div>
        </div>

        {/* Game board */}
        <div className="relative w-full">
          <div
            className="grid gap-0.5 sm:gap-1 p-2 sm:p-3 rounded-xl bg-[#18181b] border border-[#27272a]"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            onMouseLeave={() => setHoverGroup(new Set())}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r},${c}`;
                const isPopping = poppingCells.has(key);
                const isHover = hoverGroup.has(key);
                const cd = cell !== null ? COLOR_DEFS[cell] : null;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    onMouseEnter={() => handleHover(r, c)}
                    disabled={phase !== "playing" || paused}
                    aria-label={`方块 行${r + 1}列${c + 1}`}
                    className={`relative aspect-square rounded-md transition-all duration-100 ${
                      isPopping ? "cp-pop" : "cp-drop"
                    } ${isHover ? "cp-hover z-10" : ""} ${
                      phase === "playing" && !paused ? "cursor-pointer" : "cursor-default"
                    }`}
                    style={
                      cell !== null && cd
                        ? {
                            background: cd.bg,
                            boxShadow: isHover
                              ? `0 0 10px ${cd.glow}, inset 0 0 8px rgba(255,255,255,0.3)`
                              : `inset 0 0 6px rgba(255,255,255,0.15), 0 1px 2px rgba(0,0,0,0.3)`,
                            border: isHover
                              ? `2px solid rgba(255,255,255,0.6)`
                              : "1px solid rgba(255,255,255,0.08)",
                          }
                        : {
                            background: "rgba(9,9,11,0.3)",
                            border: "1px solid rgba(39,39,42,0.3)",
                          }
                    }
                  >
                    {cell !== null && (
                      <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/40 blur-[0.5px] pointer-events-none" />
                    )}
                  </button>
                );
              }),
            )}
          </div>

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-5xl mb-3">🎨</div>
              <h3 className="text-xl font-bold mb-2 text-white">色彩爆破</h3>
              <p className="text-sm text-slate-400 mb-4 text-center px-4 max-w-[300px]">
                点击同色相连的方块群进行爆破，群越大得分越高！60秒限时挑战。
              </p>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setDailyMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !dailyMode
                      ? "bg-pink-500/20 border border-pink-500/40 text-pink-300"
                      : "bg-[#27272a] border border-[#3f3f46] text-slate-400"
                  }`}
                >
                  <Shuffle className="w-3 h-3 inline mr-1" /> 随机模式
                </button>
                <button
                  onClick={() => setDailyMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    dailyMode
                      ? "bg-pink-500/20 border border-pink-500/40 text-pink-300"
                      : "bg-[#27272a] border border-[#3f3f46] text-slate-400"
                  }`}
                >
                  <Calendar className="w-3 h-3 inline mr-1" /> 每日挑战
                </button>
              </div>
              <button
                onClick={start}
                aria-label="开始游戏"
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-xl transition-all shadow-lg shadow-pink-500/30 active:scale-95"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              {bestScore > 0 && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  最佳: <span className="text-amber-400 font-bold">{bestScore}</span>
                </div>
              )}
            </div>
          )}

          {/* Game over overlay */}
          {phase === "over" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
              <div className="text-5xl mb-3">{score >= bestScore && score > 0 ? "🏆" : "🎨"}</div>
              <h3 className="text-xl font-bold mb-1 text-white">
                {score >= bestScore && score > 0 ? "新纪录！" : "游戏结束"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-pink-400 mb-3">{score}</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs w-full max-w-[240px]">
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">消除次数</div>
                  <div className="text-lg font-bold text-amber-400">{clears}</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最佳分</div>
                  <div className="text-lg font-bold text-pink-400">{bestScore}</div>
                </div>
              </div>
              <button
                onClick={restart}
                aria-label="再来一局"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-xl transition-all shadow-lg shadow-pink-500/30 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}

          {/* Pause overlay */}
          {phase === "playing" && paused && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Pause className="w-12 h-12 text-pink-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">已暂停</h3>
              <p className="text-sm text-slate-400 mb-4">按 P 键或点击按钮继续</p>
              <button
                onClick={() => {
                  pausedRef.current = false;
                  setPaused(false);
                }}
                aria-label="继续游戏"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-xl transition-all shadow-lg shadow-pink-500/30 active:scale-95"
              >
                <Play className="w-4 h-4" /> 继续游戏
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        {phase === "playing" && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                pausedRef.current = true;
                setPaused(true);
              }}
              aria-label="暂停游戏"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-pink-400 bg-[#18181b] border border-[#27272a] hover:border-pink-500/30 rounded-lg transition-colors"
            >
              <Pause className="w-3.5 h-3.5" /> 暂停
            </button>
            <button
              onClick={restart}
              aria-label="结束游戏"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 结束游戏
            </button>
          </div>
        )}

        {/* Legend */}
        {phase === "playing" && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Bomb className="w-3 h-3 text-pink-400" /> 点击2+同色方块群消除
            </span>
            <span className="text-slate-600">|</span>
            <span>得分 = n×(n-1)×10</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400">剩余&lt;10 额外奖励</span>
          </div>
        )}
      </div>
    </GameShell>
  );
}
