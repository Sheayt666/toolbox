"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, RotateCcw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

type Grid = number[][];
type Dir = "up" | "down" | "left" | "right";

const SIZE = 4;
const GAME_ID = "2048";

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
}
function cloneGrid(g: Grid): Grid {
  return g.map((r) => r.slice());
}
function addRandom(g: Grid): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (g[r][c] === 0) empties.push([r, c]);
  if (empties.length === 0) return g;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}
function slideRow(row: number[]): { row: number[]; gained: number } {
  const nz = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let gained = 0;
  for (let i = 0; i < nz.length; i++) {
    if (i + 1 < nz.length && nz[i] === nz[i + 1]) {
      const v = nz[i] * 2;
      merged.push(v);
      gained += v;
      i++;
    } else {
      merged.push(nz[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, gained };
}
function transpose(g: Grid): Grid {
  const res = emptyGrid();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) res[c][r] = g[r][c];
  return res;
}
function move(g: Grid, dir: Dir) {
  const work = cloneGrid(g);
  const tr = dir === "up" || dir === "down" ? transpose(work) : work;
  const arr =
    dir === "right" || dir === "down" ? tr.map((r) => r.slice().reverse()) : tr;
  let gained = 0;
  const slid = arr.map((r) => {
    const { row, gained: gg } = slideRow(r);
    gained += gg;
    return row;
  });
  const inv1 =
    dir === "right" || dir === "down" ? slid.map((r) => r.slice().reverse()) : slid;
  const res = dir === "up" || dir === "down" ? transpose(inv1) : inv1;
  let moved = false;
  for (let r = 0; r < SIZE && !moved; r++)
    for (let c = 0; c < SIZE && !moved; c++) if (res[r][c] !== g[r][c]) moved = true;
  return { grid: res, gained, moved };
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
  0: "bg-[#27272a]/60 text-transparent",
  2: "bg-[#3f3f46] text-slate-100",
  4: "bg-[#52525b] text-slate-100",
  8: "bg-[#8b5cf6] text-white",
  16: "bg-[#7c3aed] text-white",
  32: "bg-[#6d28d9] text-white",
  64: "bg-[#a855f7] text-white",
  128: "bg-[#c084fc] text-white",
  256: "bg-[#d8b4fe] text-[#3b0764]",
  512: "bg-[#f59e0b] text-white",
  1024: "bg-[#fb923c] text-white",
  2048: "bg-[#22c55e] text-white",
};

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

export default function Game2048Page() {
  const [grid, setGrid] = useState<Grid>(() => newGrid());
  const gridRef = useRef<Grid>(grid);
  const scoreRef = useRef(0);
  const submittedRef = useRef(false);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => maxTile(grid));
  const [over, setOver] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const finish = useCallback((g: Grid) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const mt = maxTile(g);
    const r = submitScore(GAME_ID, scoreRef.current, `最高方块 ${mt}`);
    setResult(r);
    setRefreshKey((k) => k + 1);
  }, []);

  const doMove = useCallback(
    (dir: Dir) => {
      if (submittedRef.current) return;
      const { grid: ng, gained, moved } = move(gridRef.current, dir);
      if (!moved) return;
      addRandom(ng);
      gridRef.current = ng;
      setGrid(ng.map((r) => r.slice()));
      if (gained > 0) {
        scoreRef.current += gained;
        setScore(scoreRef.current);
      }
      const mt = maxTile(ng);
      setBest((b) => Math.max(b, mt));
      if (isGameOver(ng)) {
        setOver(true);
        finish(ng);
      }
    },
    [finish],
  );

  const restart = () => {
    const g = newGrid();
    gridRef.current = g;
    scoreRef.current = 0;
    submittedRef.current = false;
    setGrid(g);
    setScore(0);
    setBest(maxTile(g));
    setOver(false);
    setResult(null);
  };

  // 键盘控制
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

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
    { label: "最高方块", value: best },
    { label: "游戏状态", value: over ? "已结束" : "进行中" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="2048"
      description="经典 4×4 数字合并游戏，滑动方块合成更大的数字，挑战 2048 甚至更高"
      instructions={`使用键盘方向键 ↑ ↓ ← → 或在屏幕上滑动来移动所有方块。
两个相同的数字相撞时会合并为它们的和，同时获得相应分数。
每次有效移动后会随机出现一个新方块（2 或 4）。
当所有格子被填满且无法再合并时游戏结束，分数将自动提交到排行榜。`}
      icon={Gamepad2}
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div
          className="relative touch-none select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="grid grid-cols-4 gap-2.5 bg-[#09090b] p-2.5 rounded-xl">
            {grid.flat().map((v, i) => (
              <div
                key={i}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all duration-150 ${TILE_STYLES[v] ?? "bg-[#22c55e] text-white"}`}
              >
                {v !== 0 ? v : ""}
              </div>
            ))}
          </div>

          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
              <div className="text-4xl mb-2">🎮</div>
              <h3 className="text-xl font-bold mb-1">游戏结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终分数</p>
              <p className="text-3xl font-bold text-[#a78bfa] mb-3">{score}</p>
              {result && (
                <p className="text-xs text-slate-400 mb-4">
                  排名第 {result.rank}/{result.total}，超越了 {result.beatPercent}% 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* 移动端方向按钮 */}
        <div className="mt-5 grid grid-cols-3 gap-2 sm:hidden w-44">
          <div />
          <button
            onClick={() => doMove("up")}
            className="h-11 rounded-lg bg-[#27272a] text-white text-lg active:bg-[#8b5cf6]"
          >
            ↑
          </button>
          <div />
          <button
            onClick={() => doMove("left")}
            className="h-11 rounded-lg bg-[#27272a] text-white text-lg active:bg-[#8b5cf6]"
          >
            ←
          </button>
          <button
            onClick={() => doMove("down")}
            className="h-11 rounded-lg bg-[#27272a] text-white text-lg active:bg-[#8b5cf6]"
          >
            ↓
          </button>
          <button
            onClick={() => doMove("right")}
            className="h-11 rounded-lg bg-[#27272a] text-white text-lg active:bg-[#8b5cf6]"
          >
            →
          </button>
        </div>

        <button
          onClick={restart}
          className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> 重新开始
        </button>
      </div>
    </GameShell>
  );
}
