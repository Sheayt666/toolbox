"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Grid3x3, Trophy, Share2, ArrowLeft, Home, Clock, Check, Eraser, Calendar } from "lucide-react";
import {
  submitScore,
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

/* ============ 类型 ============ */
type Grid = number[][]; // 0 表示空

const GAME_ID = "daily-sudoku";

/* ============ 确定性随机数生成器（基于种子） ============ */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateToSeed(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ""), 10);
}

/* ============ 数独生成 ============ */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function solveSudoku(grid: Grid, rng: () => number): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid, rng)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolved(seed: number): Grid {
  const rng = mulberry32(seed);
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(grid, rng);
  return grid;
}

function generatePuzzle(seed: number): { puzzle: Grid; solution: Grid } {
  const solution = generateSolved(seed);
  const puzzle = solution.map((r) => [...r]);
  const rng = mulberry32(seed + 99999);
  // 移除约 40 个格子（中等难度）
  let removed = 0;
  const target = 40;
  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => i),
    rng,
  );
  for (const pos of positions) {
    if (removed >= target) break;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0;
      removed++;
    }
  }
  return { puzzle, solution };
}

/* ============ 冲突检测 ============ */
function findConflicts(grid: Grid): Set<string> {
  const conflicts = new Set<string>();
  // 行
  for (let r = 0; r < 9; r++) {
    const seen: Record<number, number[]> = {};
    for (let c = 0; c < 9; c++) {
      const v = grid[r][c];
      if (v !== 0) {
        if (!seen[v]) seen[v] = [];
        seen[v].push(c);
      }
    }
    for (const v in seen) {
      if (seen[v].length > 1) seen[v].forEach((c) => conflicts.add(`${r}-${c}`));
    }
  }
  // 列
  for (let c = 0; c < 9; c++) {
    const seen: Record<number, number[]> = {};
    for (let r = 0; r < 9; r++) {
      const v = grid[r][c];
      if (v !== 0) {
        if (!seen[v]) seen[v] = [];
        seen[v].push(r);
      }
    }
    for (const v in seen) {
      if (seen[v].length > 1) seen[v].forEach((r) => conflicts.add(`${r}-${c}`));
    }
  }
  // 宫
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const seen: Record<number, [number, number][]> = {};
      for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          const v = grid[r][c];
          if (v !== 0) {
            if (!seen[v]) seen[v] = [];
            seen[v].push([r, c]);
          }
        }
      }
      for (const v in seen) {
        if (seen[v].length > 1) seen[v].forEach(([r, c]) => conflicts.add(`${r}-${c}`));
      }
    }
  }
  return conflicts;
}

function isComplete(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  return true;
}

/* ============ 组件 ============ */

export default function DailySudokuPage() {
  const [puzzle, setPuzzle] = useState<Grid | null>(null);
  const [solution, setSolution] = useState<Grid | null>(null);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [given, setGiven] = useState<boolean[][] | null>(null);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [time, setTime] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const today = getTodayStr();
    setTodayStr(today);
    const seed = dateToSeed(today);
    const { puzzle: p, solution: s } = generatePuzzle(seed);
    setPuzzle(p);
    setSolution(s);
    setGrid(p.map((r) => [...r]));
    setGiven(p.map((r) => r.map((v) => v !== 0)));

    setLeaderboard(getLeaderboard(GAME_ID));
    const statsRaw = JSON.parse(localStorage.getItem("gm_stats") || "{}");
    if (statsRaw.highScores?.[GAME_ID]) setBestScore(statsRaw.highScores[GAME_ID]);

    // 检查今日是否已完成
    const doneKey = `sudoku_done_${today}`;
    if (localStorage.getItem(doneKey)) {
      setAlreadyDone(true);
    }

    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const conflicts = grid ? findConflicts(grid) : new Set<string>();

  const handleInput = (num: number) => {
    if (!grid || !given || !selected || completed) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = newGrid[r][c] === num ? 0 : num;
    setGrid(newGrid);

    // 检查完成
    if (isComplete(newGrid) && solution) {
      const noConflicts = findConflicts(newGrid).size === 0;
      const correct = newGrid.every((row, r) => row.every((v, c) => v === solution[r][c]));
      if (noConflicts && correct) {
        setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        if (!submittedRef.current) {
          // 分数 = 用时越短分越高
          const score = Math.max(100, 3000 - time * 5);
          submitScore(GAME_ID, score, `${time}秒完成`);
          setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
          setLeaderboard(getLeaderboard(GAME_ID));
          submittedRef.current = true;
          localStorage.setItem(`sudoku_done_${todayStr}`, "1");
          setAlreadyDone(true);
        }
      }
    }
  };

  const handleErase = () => {
    if (!grid || !given || !selected || completed) return;
    const [r, c] = selected;
    if (given[r][c]) return;
    const newGrid = grid.map((row) => [...row]);
    newGrid[r][c] = 0;
    setGrid(newGrid);
  };

  // 键盘输入
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selected) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        handleInput(num);
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        handleErase();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, grid, given, completed]);

  const handleShare = () => {
    const score = bestScore ?? 0;
    const r = createDiss(GAME_ID, score, "排行榜上的各位");
    setShareMsg(r.message);
    setTimeout(() => setShareMsg(null), 4000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!grid || !given) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#8b5cf6] transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            返回游戏大厅
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#8b5cf6] transition-colors text-sm">
            <Home className="w-4 h-4" />
            首页
          </Link>
        </div>

        {/* 标题 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] mb-4 shadow-lg shadow-[#8b5cf6]/30">
            <Grid3x3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">每日数独</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            每天一题，基于日期生成。点击格子选中后用数字键盘或键盘 1-9 输入。红色高亮表示冲突。
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-zinc-500">
            <Calendar className="w-4 h-4" />
            {todayStr}
          </div>
        </div>

        {/* 状态栏 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <Clock className="w-4 h-4 text-[#8b5cf6]" />
            <span className="font-mono text-lg font-bold">{formatTime(time)}</span>
          </div>
          {alreadyDone && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">今日已完成</span>
            </div>
          )}
        </div>

        {/* 数独网格 */}
        <div className="flex justify-center mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 shadow-xl">
            <div className="grid grid-cols-9 gap-0">
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const key = `${r}-${c}`;
                  const isConflict = conflicts.has(key);
                  const isSelected = selected && selected[0] === r && selected[1] === c;
                  const isSameNum = selected && grid[selected[0]][selected[1]] !== 0 && cell === grid[selected[0]][selected[1]];
                  const borderRight = (c + 1) % 3 === 0 && c !== 8;
                  const borderBottom = (r + 1) % 3 === 0 && r !== 8;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelected([r, c])}
                      className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-lg font-bold transition-all ${
                        isSelected ? "bg-[#8b5cf6]/40" : isSameNum ? "bg-[#8b5cf6]/15" : ""
                      } ${
                        borderRight ? "border-r-2 border-r-[#8b5cf6]/40" : ""
                      } ${
                        borderBottom ? "border-b-2 border-b-[#8b5cf6]/40" : ""
                      } ${
                        isConflict ? "text-red-400 bg-red-500/15" : given[r][c] ? "text-zinc-200" : "text-[#a78bfa]"
                      }`}
                    >
                      {cell !== 0 ? cell : ""}
                    </button>
                  );
                }),
              )}
            </div>
          </div>
        </div>

        {/* 数字键盘 */}
        {!completed && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => handleInput(n)}
                className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-all text-lg font-bold text-[#a78bfa] active:scale-95"
              >
                {n}
              </button>
            ))}
            <button
              onClick={handleErase}
              className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center active:scale-95"
            >
              <Eraser className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        )}

        {/* 完成提示 */}
        {completed && (
          <div className="text-center mb-6">
            <div className="inline-block bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-3">
              <p className="text-green-400 font-bold text-lg">🎉 恭喜完成今日数独！用时 {formatTime(time)}</p>
            </div>
          </div>
        )}

        {/* 分数 + 分享 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-xs text-zinc-500">最佳分数</p>
              <p className="text-xl font-bold">{bestScore ?? "—"}</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl p-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white font-medium"
          >
            <Share2 className="w-5 h-5" />
            分享挑战
          </button>
        </div>

        {shareMsg && (
          <div className="mb-6 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-xl p-3 text-center text-sm text-[#c4b5fd]">
            {shareMsg}
          </div>
        )}

        {/* 排行榜 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="font-bold text-lg">排行榜</h2>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  entry.name.includes("(你)") ? "bg-[#8b5cf6]/10 border border-[#8b5cf6]/30" : "bg-zinc-800/40"
                }`}
              >
                <span className={`w-7 text-center font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-500"}`}>
                  {i + 1}
                </span>
                <span className="text-xl">{entry.avatar}</span>
                <span className="flex-1 text-sm truncate">{entry.name}</span>
                <span className="text-xs text-zinc-500">{entry.detail}</span>
                <span className="font-mono font-bold text-[#8b5cf6]">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
