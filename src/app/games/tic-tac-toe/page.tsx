"use client";

import { useState, useEffect, useCallback } from "react";
import { Grid3x3, RefreshCw, Brain, Zap, Sparkles, RotateCcw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
type Player = "X" | "O" | null;
type Difficulty = "easy" | "medium" | "hard";
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
const STATS_KEY = "gm_ttt_stats";

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
  let bestMoves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, false, 0);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [i];
      } else if (score === bestScore) {
        bestMoves.push(i);
      }
    }
  }
  // 从最优走法中随机选一个，增加变化性
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function getRandomMove(board: Player[]): number {
  const available: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (!board[i]) available.push(i);
  }
  return available[Math.floor(Math.random() * available.length)];
}

// 中等难度：50% 最优 + 50% 随机
function getMediumMove(board: Player[]): number {
  return Math.random() < 0.5 ? getBestMove(board) : getRandomMove(board);
}

/* ============ 组件 ============ */

interface SavedStats {
  wins: number;
  losses: number;
  draws: number;
  bestScore: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; icon: typeof Zap; color: string; desc: string }> = {
  easy: { label: "简单", icon: Zap, color: "from-[#22c55e] to-[#16a34a]", desc: "AI 随机下棋，适合新手" },
  medium: { label: "中等", icon: Sparkles, color: "from-[#f59e0b] to-[#d97706]", desc: "AI 半智半随机，有挑战性" },
  hard: { label: "困难", icon: Brain, color: "from-[#8b5cf6] to-[#6d28d9]", desc: "Minimax 算法，不可战胜" },
};

export default function TicTacToePage() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [result, setResult] = useState<GameResult>("playing");
  const [winLine, setWinLine] = useState<number[] | null>(null);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [lastMove, setLastMove] = useState<number | null>(null);
  const [stats, setStats] = useState<SavedStats>({ wins: 0, losses: 0, draws: 0, bestScore: 0 });
  const [submitted, setSubmitted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [resultData, setResultData] = useState<Result | null>(null);
  const [showResultOverlay, setShowResultOverlay] = useState(false);

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setResult("playing");
    setWinLine(null);
    setIsAiTurn(false);
    setSubmitted(false);
    setLastMove(null);
    setShowResultOverlay(false);
    setResultData(null);
  }, []);

  const handleEnd = useCallback(
    (newResult: GameResult, line: number[] | null) => {
      setResult(newResult);
      setWinLine(line);
      setIsAiTurn(false);

      let score = 0;
      if (newResult === "win") score = difficulty === "hard" ? 100 : difficulty === "medium" ? 70 : 50;
      else if (newResult === "draw") score = difficulty === "hard" ? 30 : difficulty === "medium" ? 20 : 15;
      else score = 5;

      setStats((prev) => {
        const next: SavedStats = {
          wins: prev.wins + (newResult === "win" ? 1 : 0),
          losses: prev.losses + (newResult === "lose" ? 1 : 0),
          draws: prev.draws + (newResult === "draw" ? 1 : 0),
          bestScore: Math.max(prev.bestScore, score),
        };
        try {
          localStorage.setItem(STATS_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      // 提交分数
      if (!submitted) {
        const detail = `${DIFFICULTY_CONFIG[difficulty].label}模式 ${newResult === "win" ? "胜" : newResult === "draw" ? "平" : "负"}`;
        const r = submitScore(GAME_ID, score, detail);
        setResultData(r);
        setRefreshKey((k) => k + 1);
        setSubmitted(true);
      }

      // 延迟显示结果覆盖层，让落子动画完成
      setTimeout(() => setShowResultOverlay(true), 500);
    },
    [difficulty, submitted],
  );

  // 读取本地存储的战绩（mounted后读取避免水合不匹配）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STATS_KEY);
      if (raw) setStats(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

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
      const move =
        difficulty === "hard"
          ? getBestMove([...board])
          : difficulty === "medium"
            ? getMediumMove([...board])
            : getRandomMove(board);
      if (move < 0 || move === undefined) return;
      const newBoard = [...board];
      newBoard[move] = "O";
      setBoard(newBoard);
      setLastMove(move);
      const { winner: w, line } = checkWinner(newBoard);
      if (w === "O") {
        handleEnd("lose", line);
      } else if (isBoardFull(newBoard)) {
        handleEnd("draw", null);
      }
      setIsAiTurn(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [isAiTurn, board, result, difficulty, handleEnd]);

  const handleClick = (index: number) => {
    if (board[index] || result !== "playing" || isAiTurn) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setLastMove(index);
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

  const switchDifficulty = (d: Difficulty) => {
    if (d === difficulty) return;
    setDifficulty(d);
    reset();
  };

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  const statsDisplay: GameStat[] = [
    { label: "胜场", value: stats.wins },
    { label: "平局", value: stats.draws },
    { label: "负场", value: stats.losses },
    { label: "胜率", value: `${winRate}%` },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="井字棋 AI 对战"
      description="与 AI 对战的经典井字棋，三种难度可选，困难模式使用 Minimax 算法不可战胜"
      instructions={`你是 X，AI 是 O。点击空格落子，三连即胜。
简单模式：AI 随机下棋，适合新手练手。
中等模式：AI 50% 最优 + 50% 随机，有一定挑战。
困难模式：AI 使用 Minimax 算法，不可战胜，最多只能打平。
你的胜负记录和最佳分数会自动保存在本地。`}
      icon={Grid3x3}
      iconEmoji="⭕"
      iconGradient="from-indigo-500 to-blue-500"
      stats={statsDisplay}
      shareScore={stats.bestScore}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 难度选择 */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => {
            const cfg = DIFFICULTY_CONFIG[d];
            const Icon = cfg.icon;
            const isActive = difficulty === d;
            return (
              <button
                key={d}
                onClick={() => switchDifficulty(d)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${cfg.color} text-white shadow-lg`
                    : "bg-[#09090b] border border-[#27272a] text-slate-400 hover:border-[#8b5cf6] hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* 当前难度说明 + AI 思考状态 */}
        <div className="flex items-center justify-center gap-2 mb-4 h-6">
          {isAiTurn ? (
            <div className="flex items-center gap-2 text-sm text-[#c4b5fd]">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd] animate-ai-thinking" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd] animate-ai-thinking" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd] animate-ai-thinking" style={{ animationDelay: "300ms" }} />
              </div>
              AI 思考中...
            </div>
          ) : (
            <p className="text-xs text-slate-500">{DIFFICULTY_CONFIG[difficulty].desc}</p>
          )}
        </div>

        {/* 棋盘 */}
        <div className="relative">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-3 sm:p-4 shadow-xl shadow-[#8b5cf6]/10">
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {board.map((cell, i) => {
                const isWinCell = winLine?.includes(i);
                const isLastMove = lastMove === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleClick(i)}
                    disabled={!!cell || result !== "playing" || isAiTurn}
                    className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center rounded-xl text-4xl sm:text-5xl lg:text-6xl font-bold transition-all duration-200 ${
                      isWinCell
                        ? "animate-win-glow border border-[#8b5cf6]"
                        : cell
                          ? "bg-[#18181b] border border-[#27272a]"
                          : "bg-[#18181b]/60 border border-[#27272a]/50 hover:bg-[#8b5cf6]/15 hover:border-[#8b5cf6]/50 active:scale-95"
                    } ${!cell && result === "playing" && !isAiTurn ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {cell === "X" && (
                      <span
                        key={`x-${i}-${isLastMove ? "new" : "old"}`}
                        className={`text-[#a78bfa] ${isLastMove ? "animate-piece-drop" : ""} drop-shadow-lg`}
                        style={{ filter: "drop-shadow(0 0 8px rgba(167,139,250,0.5))" }}
                      >
                        ✕
                      </span>
                    )}
                    {cell === "O" && (
                      <span
                        key={`o-${i}-${isLastMove ? "new" : "old"}`}
                        className={`text-slate-300 ${isLastMove ? "animate-piece-drop" : ""} drop-shadow-lg`}
                        style={{ filter: "drop-shadow(0 0 8px rgba(255,255,255,0.2))" }}
                      >
                        ○
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 结果覆盖层 */}
          {showResultOverlay && result !== "playing" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">
                {result === "win" ? "🎉" : result === "lose" ? "🤖" : "🤝"}
              </div>
              <h3
                className={`text-2xl font-bold mb-2 ${
                  result === "win"
                    ? "text-[#22c55e]"
                    : result === "lose"
                      ? "text-red-400"
                      : "text-yellow-400"
                }`}
              >
                {result === "win" ? "你赢了！" : result === "lose" ? "AI 获胜" : "平局！"}
              </h3>
              {result === "win" && difficulty === "hard" && (
                <p className="text-xs text-[#22c55e] mb-2 font-medium">简直不可思议！</p>
              )}
              {resultData && (
                <p className="text-xs text-slate-400 mb-3 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-[#c4b5fd] font-bold">{resultData.rank}</span>/{resultData.total}
                  ，超越 <span className="text-[#c4b5fd] font-bold">{resultData.beatPercent}%</span> 玩家
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
                >
                  <RotateCcw className="w-4 h-4" /> 再来一局
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 详细统计 */}
        <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-center">
            <p className="text-xs text-slate-500 mb-1">胜</p>
            <p className="text-xl font-bold text-[#22c55e]">{stats.wins}</p>
          </div>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-center">
            <p className="text-xs text-slate-500 mb-1">平</p>
            <p className="text-xl font-bold text-yellow-400">{stats.draws}</p>
          </div>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2.5 text-center">
            <p className="text-xs text-slate-500 mb-1">负</p>
            <p className="text-xl font-bold text-red-400">{stats.losses}</p>
          </div>
        </div>

        {/* 重开按钮 */}
        <button
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
        >
          <RefreshCw className="w-4 h-4 text-[#a78bfa]" /> 重新开始
        </button>
      </div>
    </GameShell>
  );
}
