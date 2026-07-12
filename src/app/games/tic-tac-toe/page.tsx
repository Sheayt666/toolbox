"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Grid3x3, RefreshCw, Trophy, Share2, ArrowLeft, Home, Brain, Zap } from "lucide-react";
import {
  submitScore,
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

/* ============ 常量 ============ */
type Player = "X" | "O" | null;
type Difficulty = "easy" | "hard";
type GameResult = "playing" | "win" | "lose" | "draw";

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const GAME_ID = "tic-tac-toe";

/* ============ 游戏逻辑 ============ */

function checkWinner(board: Player[]): { winner: Player; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function isBoardFull(board: Player[]): boolean {
  return board.every((c) => c !== null);
}

// Minimax 算法 — AI 是 O（最大化），玩家是 X（最小化）
function minimax(
  board: Player[],
  isMaximizing: boolean,
  depth: number,
): number {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false, depth + 1));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true, depth + 1));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board: Player[]): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, false, 0);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function getRandomMove(board: Player[]): number {
  const available: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) available.push(i);
  }
  return available[Math.floor(Math.random() * available.length)];
}

/* ============ 组件 ============ */

export default function TicTacToePage() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [result, setResult] = useState<GameResult>("playing");
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    setLeaderboard(getLeaderboard(GAME_ID));
    const statsRaw = JSON.parse(localStorage.getItem("gm_stats") || "{}");
    if (statsRaw.highScores?.[GAME_ID]) setBestScore(statsRaw.highScores[GAME_ID]);
  }, []);

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setResult("playing");
    setWinLine(null);
    setIsAiTurn(false);
    setSubmitted(false);
  }, []);

  const handleEnd = useCallback(
    (newResult: GameResult, line: number[] | null) => {
      setResult(newResult);
      setWinLine(line);
      setIsAiTurn(false);
      setStats((prev) => {
        const next = { ...prev };
        if (newResult === "win") next.wins++;
        else if (newResult === "lose") next.losses++;
        else if (newResult === "draw") next.draws++;
        return next;
      });
      // 提交分数
      if (!submitted) {
        let score = 0;
        if (newResult === "win") score = difficulty === "hard" ? 100 : 50;
        else if (newResult === "draw") score = difficulty === "hard" ? 30 : 15;
        else score = 5;
        submitScore(GAME_ID, score, `${difficulty === "hard" ? "困难" : "简单"}模式 ${newResult === "win" ? "胜" : newResult === "draw" ? "平" : "负"}`);
        setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
        setLeaderboard(getLeaderboard(GAME_ID));
        setSubmitted(true);
      }
    },
    [difficulty, submitted],
  );

  // AI 回合
  useEffect(() => {
    if (!isAiTurn || result !== "playing") return;
    const timer = setTimeout(() => {
      const { winner } = checkWinner(board);
      if (winner) return;
      if (isBoardFull(board)) {
        handleEnd("draw", null);
        return;
      }
      const move = difficulty === "hard" ? getBestMove([...board]) : getRandomMove(board);
      if (move < 0) return;
      const newBoard = [...board];
      newBoard[move] = "O";
      setBoard(newBoard);
      const { winner: w, line } = checkWinner(newBoard);
      if (w === "O") {
        handleEnd("lose", line);
      } else if (isBoardFull(newBoard)) {
        handleEnd("draw", null);
      }
      setIsAiTurn(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [isAiTurn, board, result, difficulty, handleEnd]);

  const handleClick = (index: number) => {
    if (board[index] || result !== "playing" || isAiTurn) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    const { winner, line } = checkWinner(newBoard);
    if (winner === "X") {
      handleEnd("win", line);
      return;
    }
    if (isBoardFull(newBoard)) {
      handleEnd("draw", null);
      return;
    }
    setIsAiTurn(true);
  };

  const handleShare = () => {
    const score = bestScore ?? 0;
    const r = createDiss(GAME_ID, score, "排行榜上的各位");
    setShareMsg(r.message);
    setTimeout(() => setShareMsg(null), 4000);
  };

  const totalGames = stats.wins + stats.losses + stats.draws;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] mb-4 shadow-lg shadow-[#8b5cf6]/30">
            <Grid3x3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">井字棋 AI 对战</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            你是 X，AI 是 O。困难模式使用 Minimax 算法，不可战胜，最多只能打平。简单模式 AI 随机下棋。
          </p>
        </div>

        {/* 难度选择 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => { setDifficulty("easy"); reset(); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              difficulty === "easy"
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-[#8b5cf6]"
            }`}
          >
            <Zap className="w-4 h-4" />
            简单（随机）
          </button>
          <button
            onClick={() => { setDifficulty("hard"); reset(); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
              difficulty === "hard"
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-[#8b5cf6]"
            }`}
          >
            <Brain className="w-4 h-4" />
            困难（Minimax）
          </button>
        </div>

        {/* 统计 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-zinc-500">胜</p>
            <p className="text-lg font-bold text-green-400">{stats.wins}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-zinc-500">平</p>
            <p className="text-lg font-bold text-yellow-400">{stats.draws}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-center">
            <p className="text-xs text-zinc-500">负</p>
            <p className="text-lg font-bold text-red-400">{stats.losses}</p>
          </div>
        </div>

        {/* 棋盘 */}
        <div className="flex justify-center mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-xl">
            <div className="grid grid-cols-3 gap-2">
              {board.map((cell, i) => {
                const isWinCell = winLine?.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    disabled={!!cell || result !== "playing" || isAiTurn}
                    className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-xl text-4xl font-bold transition-all ${
                      isWinCell
                        ? "bg-[#8b5cf6]/30 border border-[#8b5cf6]"
                        : cell
                          ? "bg-zinc-800/60"
                          : "bg-zinc-800/40 hover:bg-[#8b5cf6]/20 active:scale-95"
                    } ${!cell && result === "playing" && !isAiTurn ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {cell === "X" && <span className="text-[#8b5cf6]">✕</span>}
                    {cell === "O" && <span className="text-zinc-300">○</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 结果 */}
        {result !== "playing" && (
          <div className="text-center mb-6">
            <div
              className={`inline-block rounded-xl px-6 py-3 ${
                result === "win"
                  ? "bg-green-500/10 border border-green-500/30"
                  : result === "lose"
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-yellow-500/10 border border-yellow-500/30"
              }`}
            >
              <p
                className={`font-bold text-lg ${
                  result === "win" ? "text-green-400" : result === "lose" ? "text-red-400" : "text-yellow-400"
                }`}
              >
                {result === "win" ? "🎉 你赢了！" : result === "lose" ? "🤖 AI 获胜" : "🤝 平局！"}
                {result === "win" && difficulty === "hard" && " 简直不可思议！"}
              </p>
            </div>
          </div>
        )}

        {/* 重开按钮 */}
        <div className="flex justify-center mb-8">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-2.5 hover:border-[#8b5cf6] transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4 text-[#8b5cf6]" />
            重新开始
          </button>
        </div>

        {/* 分数 + 分享 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-xs text-zinc-500">最佳分数 / 总场次</p>
              <p className="text-xl font-bold">{bestScore ?? "—"} <span className="text-sm text-zinc-500">/ {totalGames}</span></p>
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
