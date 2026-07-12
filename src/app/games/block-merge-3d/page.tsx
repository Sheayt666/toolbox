"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "block-merge-3d";
const SIZE = 4;
const BEST_SCORE_KEY = "gm_block_merge_3d_best";

type Grid = (number | null)[][];
interface MoveResult { grid: Grid; moved: boolean; scoreGain: number; mergedCells: Set<string>; }
type Phase = "idle" | "playing" | "paused" | "over" | "won";

function makeEmpty(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function clone(g: Grid): Grid { return g.map((r) => [...r]); }

function spawnTile(g: Grid): { grid: Grid; row: number; col: number } {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (g[r][c] === null) empty.push([r, c]);
  if (!empty.length) return { grid: g, row: -1, col: -1 };
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const ng = clone(g);
  ng[r][c] = Math.random() < 0.9 ? 2 : 4;
  return { grid: ng, row: r, col: c };
}

function initGrid(): { grid: Grid; newCells: Set<string> } {
  let g = makeEmpty();
  const newCells = new Set<string>();
  for (let i = 0; i < 2; i++) {
    const res = spawnTile(g);
    g = res.grid;
    if (res.row >= 0) newCells.add(`${res.row}-${res.col}`);
  }
  return { grid: g, newCells };
}

function canMove(g: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === null) return true;
      if (c < SIZE - 1 && g[r][c] === g[r][c + 1]) return true;
      if (r < SIZE - 1 && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
}

function maxTile(g: Grid): number {
  let m = 0;
  for (const row of g) for (const v of row) if (v && v > m) m = v;
  return m;
}

function slideLine(line: (number | null)[]): { line: (number | null)[]; gain: number; mergedIdx: number[] } {
  const vals = line.filter((v) => v !== null) as number[];
  const merged: (number | null)[] = [];
  const mergedIdx: number[] = [];
  let gain = 0;
  let i = 0;
  while (i < vals.length) {
    if (i < vals.length - 1 && vals[i] === vals[i + 1]) {
      const v = vals[i] * 2;
      merged.push(v);
      gain += v;
      mergedIdx.push(merged.length - 1);
      i += 2;
    } else {
      merged.push(vals[i]);
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(null);
  return { line: merged, gain, mergedIdx };
}

function move(g: Grid, dir: "up" | "down" | "left" | "right"): MoveResult {
  const ng = clone(g);
  let moved = false;
  let scoreGain = 0;
  const mergedCells = new Set<string>();

  for (let i = 0; i < SIZE; i++) {
    let line: (number | null)[];
    if (dir === "left") line = ng[i].slice();
    else if (dir === "right") line = ng[i].slice().reverse();
    else if (dir === "up") line = ng.map((r) => r[i]);
    else line = ng.map((r) => r[i]).reverse();

    const oldLine = line.slice();
    const res = slideLine(line);

    if (oldLine.some((v, k) => v !== res.line[k])) moved = true;

    if (dir === "left") ng[i] = res.line;
    else if (dir === "right") ng[i] = res.line.reverse();
    else if (dir === "up") res.line.forEach((v, k) => (ng[k][i] = v));
    else res.line.forEach((v, k) => (ng[SIZE - 1 - k][i] = v));

    for (const mi of res.mergedIdx) {
      let r: number, c: number;
      if (dir === "left") { r = i; c = mi; }
      else if (dir === "right") { r = i; c = SIZE - 1 - mi; }
      else if (dir === "up") { r = mi; c = i; }
      else { r = SIZE - 1 - mi; c = i; }
      mergedCells.add(`${r}-${c}`);
    }
    scoreGain += res.gain;
  }
  return { grid: ng, moved, scoreGain, mergedCells };
}

const TILE_COLORS: Record<number, string> = {
  2: "from-slate-200 to-slate-300 text-slate-800",
  4: "from-blue-200 to-blue-300 text-blue-900",
  8: "from-cyan-300 to-cyan-400 text-white",
  16: "from-teal-300 to-teal-400 text-white",
  32: "from-green-300 to-green-400 text-white",
  64: "from-lime-300 to-lime-400 text-white",
  128: "from-yellow-300 to-yellow-400 text-yellow-900",
  256: "from-orange-300 to-orange-400 text-white",
  512: "from-red-400 to-red-500 text-white",
  1024: "from-pink-400 to-pink-500 text-white",
  2048: "from-purple-400 to-purple-500 text-white",
};

function tileDepth(val: number): number {
  if (val <= 2) return 6;
  if (val <= 4) return 10;
  if (val <= 8) return 14;
  if (val <= 16) return 18;
  if (val <= 32) return 22;
  if (val <= 64) return 26;
  if (val <= 128) return 30;
  if (val <= 256) return 34;
  if (val <= 512) return 38;
  if (val <= 1024) return 42;
  return 48;
}

export default function BlockMerge3DPage() {
  const [mounted, setMounted] = useState(false);
  const [grid, setGrid] = useState<Grid>(() => makeEmpty());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [maxVal, setMaxVal] = useState(0);
  const [mergedCells, setMergedCells] = useState<Set<string>>(new Set());
  const [newCells, setNewCells] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);

  const gridRef = useRef<Grid>(grid);
  const phaseRef = useRef<Phase>("idle");
  const bestScoreRef = useRef(0);
  const submittedRef = useRef(false);
  const scoreRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const s = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10);
      if (s > 0) { setBestScore(s); bestScoreRef.current = s; }
    } catch { /* ignore */ }
    const init = initGrid();
    gridRef.current = init.grid;
    setGrid(init.grid);
    setNewCells(init.newCells);
  }, []);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitScore(GAME_ID, scoreRef.current);
    setRefreshKey((k) => k + 1);
    if (scoreRef.current > bestScoreRef.current) {
      bestScoreRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
      try { localStorage.setItem(BEST_SCORE_KEY, String(scoreRef.current)); } catch { /* ignore */ }
    }
  }, []);

  const startGame = useCallback(() => {
    const init = initGrid();
    gridRef.current = init.grid;
    setGrid(init.grid);
    scoreRef.current = 0;
    setScore(0);
    setMaxVal(maxTile(init.grid));
    setMergedCells(new Set());
    setNewCells(init.newCells);
    submittedRef.current = false;
    setPhase("playing");
  }, []);

  const doMove = useCallback((dir: "up" | "down" | "left" | "right") => {
    if (phaseRef.current !== "playing") return;
    const res = move(gridRef.current, dir);
    if (!res.moved) return;

    let finalGrid = res.grid;
    const spawn = spawnTile(res.grid);
    finalGrid = spawn.grid;
    const allNew = new Set(spawn.row >= 0 ? [`${spawn.row}-${spawn.col}`] : []);

    gridRef.current = finalGrid;
    setGrid(finalGrid);
    setMergedCells(res.mergedCells);
    setNewCells(allNew);
    scoreRef.current += res.scoreGain;
    setScore(scoreRef.current);
    setMaxVal(maxTile(finalGrid));

    // Clear animation flags after a short delay
    timersRef.current.push(setTimeout(() => {
      setMergedCells(new Set());
      setNewCells(new Set());
    }, 200));

    // Check win
    if (maxTile(finalGrid) >= 2048 && phaseRef.current === "playing") {
      setPhase("won");
      timersRef.current.push(setTimeout(() => finish(), 200));
      return;
    }

    // Check game over
    if (!canMove(finalGrid)) {
      setPhase("over");
      timersRef.current.push(setTimeout(() => finish(), 200));
    }
  }, [finish]);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") setPhase("paused");
    else if (phaseRef.current === "paused") setPhase("playing");
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "p") { e.preventDefault(); togglePause(); return; }
      if (phaseRef.current !== "playing") return;
      if (k === "arrowup" || k === "w") { e.preventDefault(); doMove("up"); }
      else if (k === "arrowdown" || k === "s") { e.preventDefault(); doMove("down"); }
      else if (k === "arrowleft" || k === "a") { e.preventDefault(); doMove("left"); }
      else if (k === "arrowright" || k === "d") { e.preventDefault(); doMove("right"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove, togglePause]);

  // Touch swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 30) return;
    if (absDx > absDy) doMove(dx > 0 ? "right" : "left");
    else doMove(dy > 0 ? "down" : "up");
    touchStartRef.current = null;
  }, [doMove]);

  const stats: GameStat[] = [
    { label: "最大方块", value: maxVal || 0, icon: "🔥" },
    { label: "分数", value: score, icon: "⭐" },
    { label: "最高分", value: bestScore, icon: "🏆" },
  ];

  if (!mounted) {
    return (
      <GameShell gameId={GAME_ID} title="立体合成" iconEmoji="🧊" iconGradient="from-cyan-500 to-blue-500"
        stats={[{ label: "最大方块", value: 0 }, { label: "分数", value: 0 }, { label: "最高分", value: 0 }]}
        shareScore={0} refreshKey={0}>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId={GAME_ID} title="立体合成" iconEmoji="🧊" iconGradient="from-cyan-500 to-blue-500"
      stats={stats} shareScore={score} refreshKey={refreshKey}>
      <div className="flex flex-col items-center p-4 sm:p-6">
        {/* Score bar */}
        <div className="flex gap-3 mb-4">
          <div className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-center">
            <div className="text-xs text-gray-400">分数</div>
            <div className="text-xl font-bold text-cyan-400">{score}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-center">
            <div className="text-xs text-gray-400">最高分</div>
            <div className="text-xl font-bold text-yellow-400">{bestScore}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-center">
            <div className="text-xs text-gray-400">最大</div>
            <div className="text-xl font-bold text-purple-400">{maxVal}</div>
          </div>
        </div>

        {/* 3D Board */}
        <div
          className="relative"
          style={{ perspective: "1000px", perspectiveOrigin: "50% 20%" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="relative p-3 rounded-2xl bg-gray-900/80 border border-gray-700"
            style={{
              transform: "rotateX(28deg)",
              transformStyle: "preserve-3d",
              transition: "transform 0.3s ease",
            }}
          >
            <div className="grid grid-cols-4 gap-2" style={{ transformStyle: "preserve-3d" }}>
              {grid.map((row, ri) =>
                row.map((val, ci) => {
                  const key = `${ri}-${ci}`;
                  const isMerged = mergedCells.has(key);
                  const isNew = newCells.has(key);
                  const depth = val ? tileDepth(val) : 0;
                  const colorClass = val ? (TILE_COLORS[val] || "from-amber-400 to-amber-600 text-white") : "";
                  const fontSize = val && val >= 1024 ? "text-lg sm:text-xl" : val && val >= 128 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";

                  return (
                    <div
                      key={key}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Empty slot background */}
                      <div
                        className="absolute inset-0 rounded-xl bg-gray-800/50 border border-gray-700/50"
                      />
                      {/* Tile */}
                      {val !== null && (
                        <div
                          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center font-bold ${fontSize} shadow-lg`}
                          style={{
                            transform: `translateZ(${depth}px)`,
                            transition: "transform 0.15s ease, opacity 0.15s ease",
                            animation: isMerged
                              ? "mergePop3d 0.2s ease"
                              : isNew
                              ? "spawnIn3d 0.2s ease"
                              : undefined,
                            boxShadow: `0 ${depth / 2}px ${depth}px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)`,
                          }}
                        >
                          {val}
                        </div>
                      )}
                    </div>
                  );
                }),
              )}
            </div>
          </div>

          {/* Keyframes */}
          <style>{`
            @keyframes mergePop3d {
              0% { transform: translateZ(var(--d, 20px)) scale(1); }
              50% { transform: translateZ(calc(var(--d, 20px) + 15px)) scale(1.2); }
              100% { transform: translateZ(var(--d, 20px)) scale(1); }
            }
            @keyframes spawnIn3d {
              0% { transform: translateZ(0) scale(0); opacity: 0; }
              100% { transform: translateZ(var(--d, 20px)) scale(1); opacity: 1; }
            }
          `}</style>

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-2xl bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-4 text-center">
              <div className="text-5xl">🧊</div>
              <h3 className="text-2xl font-bold text-white">立体合成</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                滑动方向合并相同数字的方块！2→4→8→16→...→2048。方块越高，数字越大，立体感越强！
              </p>
              <button onClick={startGame} aria-label="开始游戏"
                className="inline-flex items-center justify-center min-h-[44px] px-8 text-base font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-lg shadow-cyan-600/30">
                开始游戏
              </button>
            </div>
          )}

          {/* Paused overlay */}
          {phase === "paused" && (
            <div className="absolute inset-0 rounded-2xl bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-4">
              <div className="text-4xl">⏸️</div>
              <h3 className="text-xl font-bold text-white">已暂停</h3>
              <div className="flex gap-3">
                <button onClick={togglePause} aria-label="继续游戏"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors">
                  继续 (P)
                </button>
                <button onClick={startGame} aria-label="重新开始"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  重新开始
                </button>
              </div>
            </div>
          )}

          {/* Won overlay */}
          {phase === "won" && (
            <div className="absolute inset-0 rounded-2xl bg-gray-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="text-5xl">🎉</div>
              <h3 className="text-2xl font-bold text-purple-400">达成2048！</h3>
              <p className="text-sm text-gray-400">当前分数: {score}</p>
              <div className="flex gap-3">
                <button onClick={() => setPhase("playing")} aria-label="继续游戏"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors">
                  继续挑战
                </button>
                <button onClick={startGame} aria-label="重新开始"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  重新开始
                </button>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {phase === "over" && (
            <div className="absolute inset-0 rounded-2xl bg-gray-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="text-5xl">💀</div>
              <h3 className="text-2xl font-bold text-white">游戏结束</h3>
              <p className="text-sm text-gray-400">无法移动了！</p>
              <p className="text-4xl font-bold text-cyan-400">{score}</p>
              <p className="text-xs text-gray-500">
                {score >= bestScore ? "新纪录！" : `最高分: ${bestScore}`} · 最大方块: {maxVal}
              </p>
              <button onClick={startGame} aria-label="再来一局"
                className="mt-4 inline-flex items-center justify-center min-h-[44px] px-8 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-colors shadow-lg shadow-cyan-600/30">
                再来一局
              </button>
            </div>
          )}
        </div>

        {/* Mobile direction buttons */}
        {phase === "playing" && (
          <div className="mt-6 sm:hidden">
            <div className="grid grid-cols-3 gap-2 w-48">
              <div />
              <button onClick={() => doMove("up")} aria-label="向上移动"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-cyan-600 border border-gray-700">↑</button>
              <div />
              <button onClick={() => doMove("left")} aria-label="向左移动"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-cyan-600 border border-gray-700">←</button>
              <button onClick={() => doMove("down")} aria-label="向下移动"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-cyan-600 border border-gray-700">↓</button>
              <button onClick={() => doMove("right")} aria-label="向右移动"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-cyan-600 border border-gray-700">→</button>
            </div>
          </div>
        )}

        {/* Desktop hint */}
        {phase === "playing" && (
          <div className="mt-4 hidden sm:flex gap-4 text-xs text-gray-500 items-center">
            <span>方向键 / WASD 移动</span><span>P 暂停</span>
            <button onClick={togglePause} aria-label="暂停"
              className="inline-flex items-center justify-center min-h-[44px] px-4 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg">
              暂停 (P)
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
