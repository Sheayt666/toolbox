"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, RotateCcw, Trophy } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

type Grid = number[][];
type Dir = "up" | "down" | "left" | "right";

const SIZE = 4;
const GAME_ID = "2048";
const BEST_SCORE_KEY = "gm_2048_best_score";

/* ============ 确定性辅助函数 ============ */

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
}
function cloneGrid(g: Grid): Grid {
  return g.map((r) => r.slice());
}
function addRandom(g: Grid): [number, number] | null {
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (g[r][c] === 0) empties.push([r, c]);
  if (empties.length === 0) return null;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return [r, c];
}
function slideRow(row: number[]): { row: number[]; gained: number; merges: number[] } {
  const nz = row.filter((v) => v !== 0);
  const merged: number[] = [];
  const mergeFlags: number[] = [];
  let gained = 0;
  for (let i = 0; i < nz.length; i++) {
    if (i + 1 < nz.length && nz[i] === nz[i + 1]) {
      const v = nz[i] * 2;
      merged.push(v);
      mergeFlags.push(merged.length - 1);
      gained += v;
      i++;
    } else {
      merged.push(nz[i]);
      mergeFlags.push(-1);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained, merges: mergeFlags };
}
function transpose(g: Grid): Grid {
  const res = emptyGrid();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) res[c][r] = g[r][c];
  return res;
}

interface MoveResult {
  grid: Grid;
  gained: number;
  moved: boolean;
  spawned: [number, number] | null;
  mergedCells: Set<string>;
}

function move(g: Grid, dir: Dir): MoveResult {
  const work = cloneGrid(g);
  const tr = dir === "up" || dir === "down" ? transpose(work) : work;
  const arr =
    dir === "right" || dir === "down" ? tr.map((r) => r.slice().reverse()) : tr;
  let gained = 0;
  const mergedCells = new Set<string>();
  const slid = arr.map((r, rowIdx) => {
    const { row, gained: gg, merges } = slideRow(r);
    gained += gg;
    // Track merged cell positions in final grid coordinates
    merges.forEach((flag, colIdx) => {
      if (flag >= 0) {
        let actualCol = colIdx;
        let actualRow = rowIdx;
        if (dir === "right" || dir === "down") actualCol = SIZE - 1 - colIdx;
        if (dir === "up" || dir === "down") {
          const tmp = actualRow;
          actualRow = actualCol;
          actualCol = tmp;
        }
        mergedCells.add(`${actualRow},${actualCol}`);
      }
    });
    return row;
  });
  const inv1 =
    dir === "right" || dir === "down" ? slid.map((r) => r.slice().reverse()) : slid;
  const res = dir === "up" || dir === "down" ? transpose(inv1) : inv1;
  let moved = false;
  for (let r = 0; r < SIZE && !moved; r++)
    for (let c = 0; c < SIZE && !moved; c++) if (res[r][c] !== g[r][c]) moved = true;
  if (!moved) return { grid: g, gained: 0, moved: false, spawned: null, mergedCells: new Set() };
  const spawned = addRandom(res);
  return { grid: res, gained, moved: true, spawned, mergedCells };
}
function isGameOver(g: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === 0) return false;
      if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return false;
      if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return false;
    }
  return true;
}
function maxTile(g: Grid): number {
  let m = 0;
  for (const row of g) for (const v of row) if (v > m) m = v;
  return m;
}
function newGrid(): Grid {
  const g = emptyGrid();
  addRandom(g);
  addRandom(g);
  return g;
}

const TILE_STYLES: Record<number, string> = {
  0: "bg-[#27272a]/50",
  2: "bg-gradient-to-br from-[#3f3f46] to-[#52525b] text-slate-100",
  4: "bg-gradient-to-br from-[#52525b] to-[#71717a] text-slate-100",
  8: "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white",
  16: "bg-gradient-to-br from-[#7c3aed] to-[#6d28d9] text-white",
  32: "bg-gradient-to-br from-[#a855f7] to-[#9333ea] text-white",
  64: "bg-gradient-to-br from-[#c084fc] to-[#a855f7] text-white",
  128: "bg-gradient-to-br from-[#d8b4fe] to-[#c084fc] text-[#3b0764]",
  256: "bg-gradient-to-br from-[#e9d5ff] to-[#d8b4fe] text-[#3b0764]",
  512: "bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white",
  1024: "bg-gradient-to-br from-[#fb923c] to-[#ea580c] text-white",
  2048: "bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white",
};

function tileFontSize(v: number): string {
  if (v >= 1024) return "text-3xl sm:text-4xl lg:text-5xl";
  if (v >= 128) return "text-4xl sm:text-5xl lg:text-6xl";
  return "text-5xl sm:text-6xl lg:text-7xl";
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

export default function Game2048Page() {
  // === 水合修复：mounted 模式 ===
  const [mounted, setMounted] = useState(false);
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const gridRef = useRef<Grid>(emptyGrid());
  const scoreRef = useRef(0);
  const submittedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [bestTile, setBestTile] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scorePopups, setScorePopups] = useState<{ id: number; value: number }[]>([]);
  const [spawnedCells, setSpawnedCells] = useState<Set<string>>(new Set());
  const [mergedCells, setMergedCells] = useState<Set<string>>(new Set());
  const popupIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 卸载时清理所有定时器
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  // 挂载后初始化游戏（mounted 模式修复水合错误 #418）
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // 读取本地存储的最高分（mounted后读取避免水合不匹配）
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (saved > 0) setBestScore(saved);
    } catch { /* ignore */ }
    const g = newGrid();
    gridRef.current = g;
    setGrid(g.map((r) => r.slice()));
    setBestTile(maxTile(g));
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const triggerScorePopup = useCallback((value: number) => {
    const id = popupIdRef.current++;
    setScorePopups((prev) => [...prev, { id, value }]);
    timersRef.current.push(setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 800));
  }, []);

  const finish = useCallback((g: Grid) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const mt = maxTile(g);
    const r = submitScore(GAME_ID, scoreRef.current, `最高方块 ${mt}`);
    setResult(r);
    setRefreshKey((k) => k + 1);
    // 保存最高分到 localStorage
    if (scoreRef.current > bestScore) {
      setBestScore(scoreRef.current);
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(scoreRef.current));
      } catch {
        // ignore
      }
    }
  }, [bestScore]);

  const doMove = useCallback(
    (dir: Dir) => {
      if (submittedRef.current || !mounted) return;
      const res = move(gridRef.current, dir);
      if (!res.moved) return;
      gridRef.current = res.grid;
      setGrid(res.grid.map((r) => r.slice()));

      // 设置动画状态
      const newSpawned = new Set<string>();
      if (res.spawned) newSpawned.add(`${res.spawned[0]},${res.spawned[1]}`);
      setSpawnedCells(newSpawned);
      setMergedCells(res.mergedCells);

      // 清除动画标记
      timersRef.current.push(setTimeout(() => {
        setSpawnedCells(new Set());
        setMergedCells(new Set());
      }, 260));

      if (res.gained > 0) {
        scoreRef.current += res.gained;
        setScore(scoreRef.current);
        triggerScorePopup(res.gained);
      }
      const mt = maxTile(res.grid);
      setBestTile((b) => Math.max(b, mt));
      if (mt >= 2048 && !won) setWon(true);
      if (isGameOver(res.grid)) {
        setOver(true);
        finish(res.grid);
      }
    },
    [finish, mounted, won, triggerScorePopup],
  );

  const restart = useCallback(() => {
    const g = newGrid();
    gridRef.current = g;
    scoreRef.current = 0;
    submittedRef.current = false;
    setGrid(g.map((r) => r.slice()));
    setScore(0);
    setBestTile(maxTile(g));
    setOver(false);
    setWon(false);
    setResult(null);
    setSpawnedCells(new Set());
    setMergedCells(new Set());
  }, []);

  // 键盘控制
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up", W: "up",
        s: "down", S: "down",
        a: "left", A: "left",
        d: "right", D: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove, mounted]);

  // 触屏滑动
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < 24) return;
    if (ax > ay) doMove(dx > 0 ? "right" : "left");
    else doMove(dy > 0 ? "down" : "up");
    touchStart.current = null;
  };

  const stats: GameStat[] = [
    { label: "当前分数", value: score },
    { label: "最高方块", value: bestTile },
    { label: "历史最高分", value: bestScore },
    { label: "游戏状态", value: over ? "已结束" : won ? "已胜利" : "进行中" },
  ];

  // === 加载状态（水合修复） ===
  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="2048"
        description="经典 4×4 数字合并游戏，滑动方块合成更大的数字，挑战 2048 甚至更高"
        instructions="加载中..."
        icon={Gamepad2}
        iconEmoji="🔢"
        iconGradient="from-amber-500 to-orange-500"
        stats={[
          { label: "当前分数", value: 0 },
          { label: "最高方块", value: 0 },
          { label: "历史最高分", value: 0 },
          { label: "游戏状态", value: "加载中" },
        ]}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="2048"
      description="经典 4×4 数字合并游戏，滑动方块合成更大的数字，挑战 2048 甚至更高"
      instructions={`使用键盘方向键 ↑ ↓ ← → 或 WASD，也可在屏幕上滑动来移动所有方块。
两个相同的数字相撞时会合并为它们的和，同时获得相应分数。
每次有效移动后会随机出现一个新方块（2 或 4）。
当所有格子被填满且无法再合并时游戏结束，分数将自动提交到排行榜。
你的历史最高分会自动保存在本地。`}
      icon={Gamepad2}
      iconEmoji="🔢"
      iconGradient="from-amber-500 to-orange-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 分数弹出动画层 */}
        <div className="relative">
          {scorePopups.map((p) => (
            <div
              key={p.id}
              className="absolute left-1/2 -translate-x-1/2 -top-2 z-20 pointer-events-none animate-score-pop text-2xl font-bold text-[#c4b5fd]"
            >
              +{p.value}
            </div>
          ))}
        </div>

        <div
          className="relative touch-none select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 bg-[#09090b] p-3 sm:p-4 lg:p-5 rounded-xl border border-[#27272a]">
            {grid.flat().map((v, i) => {
              const row = Math.floor(i / SIZE);
              const col = i % SIZE;
              const key = `${row},${col}`;
              const isSpawned = spawnedCells.has(key);
              const isMerged = mergedCells.has(key);
              const animClass = isSpawned
                ? "animate-tile-spawn"
                : isMerged
                  ? "animate-tile-merge"
                  : "";
              return (
                <div
                  key={i}
                  className={`w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg flex items-center justify-center font-bold transition-colors duration-150 ${TILE_STYLES[v] ?? "bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white"} ${animClass} ${v >= 128 ? "shadow-lg shadow-[#8b5cf6]/20" : ""}`}
                >
                  <span className={`${tileFontSize(v)} ${v !== 0 ? "opacity-100" : "opacity-0"}`}>
                    {v !== 0 ? v : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 胜利覆盖层 */}
          {won && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <Trophy className="w-12 h-12 text-[#22c55e] mb-3 animate-glow-pulse" />
              <h3 className="text-2xl font-bold mb-1 text-[#22c55e]">达成 2048!</h3>
              <p className="text-sm text-slate-400 mb-4">你赢了！可以继续挑战更高分数</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setWon(false)}
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#22c55e] hover:bg-[#16a34a] rounded-xl transition-colors"
                >
                  继续游戏
                </button>
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> 重新开始
                </button>
              </div>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🎮</div>
              <h3 className="text-2xl font-bold mb-2">游戏结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终分数</p>
              <p className="text-4xl font-bold text-[#a78bfa] mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">最高方块: {bestTile}</p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-[#c4b5fd] font-bold">{result.rank}</span>/{result.total}
                  ，超越了 <span className="text-[#c4b5fd] font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* 移动端方向按钮 */}
        <div className="mt-6 grid grid-cols-3 gap-2 sm:hidden w-48">
          <div />
          <button
            onClick={() => doMove("up")}
            className="h-12 rounded-xl bg-[#27272a] text-white text-xl font-bold active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
          >
            ↑
          </button>
          <div />
          <button
            onClick={() => doMove("left")}
            className="h-12 rounded-xl bg-[#27272a] text-white text-xl font-bold active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
          >
            ←
          </button>
          <button
            onClick={() => doMove("down")}
            className="h-12 rounded-xl bg-[#27272a] text-white text-xl font-bold active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
          >
            ↓
          </button>
          <button
            onClick={() => doMove("right")}
            className="h-12 rounded-xl bg-[#27272a] text-white text-xl font-bold active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
          >
            →
          </button>
        </div>

        <button
          onClick={restart}
          className="mt-6 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
        >
          <RotateCcw className="w-4 h-4" /> 重新开始
        </button>
      </div>
    </GameShell>
  );
}
