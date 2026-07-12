"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Bomb, Flag, RefreshCw, Trophy, Share2, ArrowLeft, Clock, Home } from "lucide-react";
import {
  submitScore,
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

/* ============ 常量 ============ */
const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = {
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

type GameStatus = "ready" | "playing" | "won" | "lost";

const NUMBER_COLORS = [
  "",
  "text-blue-400",
  "text-green-400",
  "text-red-400",
  "text-purple-400",
  "text-yellow-400",
  "text-cyan-400",
  "text-pink-400",
  "text-zinc-400",
];

/* ============ 工具函数 ============ */

function createEmptyBoard(): CellState[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      isMine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );
}

function plantMines(board: CellState[][], safeRow: number, safeCol: number): CellState[][] {
  const newBoard = board.map((row) => row.map((c) => ({ ...c })));
  const forbidden = new Set<string>();
  // 首次点击的格子及其周围八格不放雷
  for (let r = safeRow - 1; r <= safeRow + 1; r++) {
    for (let c = safeCol - 1; c <= safeCol + 1; c++) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) forbidden.add(`${r}-${c}`);
    }
  }
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!newBoard[r][c].isMine && !forbidden.has(`${r}-${c}`)) {
      newBoard[r][c].isMine = true;
      placed++;
    }
  }
  // 计算相邻雷数
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (newBoard[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].isMine) count++;
        }
      }
      newBoard[r][c].adjacent = count;
    }
  }
  return newBoard;
}

function floodReveal(board: CellState[][], row: number, col: number): CellState[][] {
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const stack: [number, number][] = [[row, col]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    const cell = newBoard[r][c];
    if (cell.revealed || cell.flagged || cell.isMine) continue;
    cell.revealed = true;
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) stack.push([r + dr, c + dc]);
        }
      }
    }
  }
  return newBoard;
}

function checkWin(board: CellState[][]): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell.isMine && !cell.revealed) return false;
    }
  }
  return true;
}

/* ============ 组件 ============ */

export default function MinesweeperPage() {
  const [board, setBoard] = useState<CellState[][]>(createEmptyBoard);
  const [status, setStatus] = useState<GameStatus>("ready");
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [time, setTime] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const GAME_ID = "minesweeper";

  useEffect(() => {
    setLeaderboard(getLeaderboard(GAME_ID));
    const stats = JSON.parse(localStorage.getItem("gm_stats") || "{}");
    if (stats.highScores?.[GAME_ID]) setBestScore(stats.highScores[GAME_ID]);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
  }, [stopTimer]);

  const reset = useCallback(() => {
    setBoard(createEmptyBoard());
    setStatus("ready");
    setFlagsUsed(0);
    setTime(0);
    setSubmitted(false);
    stopTimer();
  }, [stopTimer]);

  const reveal = (row: number, col: number) => {
    if (status === "won" || status === "lost") return;
    const current = board[row][col];
    if (current.flagged || current.revealed) return;

    let working = board;
    let newStatus: GameStatus = status;

    if (status === "ready") {
      working = plantMines(board, row, col);
      newStatus = "playing";
      startTimer();
    }

    if (working[row][col].isMine) {
      // 踩雷
      const lost = working.map((r) => r.map((c) => ({ ...c, revealed: c.isMine ? true : c.revealed })));
      setBoard(lost);
      setStatus("lost");
      stopTimer();
      return;
    }

    working = floodReveal(working, row, col);
    setBoard(working);

    if (checkWin(working)) {
      newStatus = "won";
      stopTimer();
      // 分数 = 剩余时间奖励 + 基础分
      const score = Math.max(100, 1000 - time * 5);
      if (!submitted) {
        submitScore(GAME_ID, score, `${time}秒通关`);
        setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
        setLeaderboard(getLeaderboard(GAME_ID));
        setSubmitted(true);
      }
    }
    setStatus(newStatus);
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (status === "won" || status === "lost" || status === "ready") return;
    const cell = board[row][col];
    if (cell.revealed) return;
    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].flagged = !newBoard[row][col].flagged;
    setBoard(newBoard);
    setFlagsUsed(newBoard.flat().filter((c) => c.flagged).length);
  };

  const handleShare = () => {
    const score = bestScore ?? 0;
    const result = createDiss(GAME_ID, score, "排行榜上的各位");
    setShareMsg(result.message);
    setTimeout(() => setShareMsg(null), 4000);
  };

  const minesLeft = MINES - flagsUsed;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#8b5cf6] transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            返回游戏大厅
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#8b5cf6] transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            首页
          </Link>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] mb-4 shadow-lg shadow-[#8b5cf6]/30">
            <Bomb className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">扫雷</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            经典 9×9 扫雷，10 个雷。左键挖开格子，右键标记旗。踩到雷游戏结束，挖开所有非雷格子获胜。
          </p>
        </div>

        {/* 状态栏 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <Flag className="w-4 h-4 text-[#8b5cf6]" />
            <span className="font-mono text-lg font-bold">{minesLeft}</span>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 hover:border-[#8b5cf6] transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm font-medium">
              {status === "won" ? "😎" : status === "lost" ? "💣" : "🙂"}
            </span>
          </button>
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <Clock className="w-4 h-4 text-[#8b5cf6]" />
            <span className="font-mono text-lg font-bold">{time}</span>
          </div>
        </div>

        {/* 游戏区域 */}
        <div className="flex justify-center mb-8">
          <div className="inline-block bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-xl">
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => reveal(r, c)}
                    onContextMenu={(e) => toggleFlag(e, r, c)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md text-sm font-bold transition-all select-none ${
                      cell.revealed
                        ? cell.isMine
                          ? "bg-red-500/80 text-white"
                          : "bg-zinc-800/60 text-zinc-200"
                        : "bg-gradient-to-br from-zinc-700 to-zinc-800 hover:from-[#8b5cf6]/40 hover:to-[#6d28d9]/40 active:scale-95"
                    }`}
                  >
                    {cell.revealed ? (
                      cell.isMine ? (
                        <Bomb className="w-4 h-4" />
                      ) : cell.adjacent > 0 ? (
                        <span className={NUMBER_COLORS[cell.adjacent]}>{cell.adjacent}</span>
                      ) : null
                    ) : cell.flagged ? (
                      <Flag className="w-4 h-4 text-[#8b5cf6]" />
                    ) : null}
                  </button>
                )),
              )}
            </div>
          </div>
        </div>

        {/* 结果提示 */}
        {status === "won" && (
          <div className="text-center mb-6">
            <div className="inline-block bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-3">
              <p className="text-green-400 font-bold text-lg">🎉 恭喜通关！用时 {time} 秒</p>
            </div>
          </div>
        )}
        {status === "lost" && (
          <div className="text-center mb-6">
            <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-3">
              <p className="text-red-400 font-bold text-lg">💥 踩到雷了！再来一局吧</p>
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
                <span className="font-mono font-bold text-[#8b5cf6]">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
