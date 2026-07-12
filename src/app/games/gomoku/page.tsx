"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid3x3, RotateCcw, Brain, Zap, Sparkles, Trophy } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "gomoku";
const BOARD_SIZE = 15;
const STATS_KEY = "gm_gomoku_stats";
const BEST_SCORE_KEY = "gm_gomoku_best_score";

type Stone = 0 | 1 | 2; // 0=空, 1=黑(玩家), 2=白(AI)
type Difficulty = "easy" | "medium" | "hard";
type GameResult = "playing" | "win" | "lose" | "draw";

interface Pos {
  r: number;
  c: number;
}

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

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; icon: typeof Brain; color: string; bg: string }
> = {
  easy: { label: "简单", icon: Sparkles, color: "text-green-400", bg: "bg-green-500/20 border-green-500/40" },
  medium: { label: "中等", icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40" },
  hard: { label: "困难", icon: Brain, color: "text-red-400", bg: "bg-red-500/20 border-red-500/40" },
};

// 星位（天元和星位）
const STAR_POINTS = new Set(["3,3", "3,11", "7,7", "11,3", "11,11"]);

/* ============ 纯函数：棋盘逻辑 ============ */

function createEmptyBoard(): Stone[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array<Stone>(BOARD_SIZE).fill(0),
  );
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function isBoardFull(board: Stone[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return false;
    }
  }
  return true;
}

// 胜负判定：检查最后一步落子的4个方向
function checkWin(board: Stone[][], r: number, c: number): Pos[] | null {
  const color = board[r][c];
  if (!color) return null;
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of dirs) {
    const line: Pos[] = [{ r, c }];
    // 正方向
    let i = r + dr;
    let j = c + dc;
    while (inBounds(i, j) && board[i][j] === color) {
      line.push({ r: i, c: j });
      i += dr;
      j += dc;
    }
    // 反方向
    i = r - dr;
    j = c - dc;
    while (inBounds(i, j) && board[i][j] === color) {
      line.unshift({ r: i, c: j });
      i -= dr;
      j -= dc;
    }
    if (line.length >= 5) return line;
  }
  return null;
}

function hasNeighbor(board: Stone[][], r: number, c: number, dist: number): boolean {
  for (let dr = -dist; dr <= dist; dr++) {
    for (let dc = -dist; dc <= dist; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc] !== 0) return true;
    }
  }
  return false;
}

/* ============ AI 算法：模式识别 + 威胁评估 ============ */

// 评估某方向上的棋型得分
function evaluateDirection(
  board: Stone[][],
  r: number,
  c: number,
  dr: number,
  dc: number,
  color: Stone,
): number {
  let count = 1; // 假设在此位置放棋
  let openPos = false;
  let openNeg = false;

  // 正方向连续同色
  let i = r + dr;
  let j = c + dc;
  while (inBounds(i, j) && board[i][j] === color) {
    count++;
    i += dr;
    j += dc;
  }
  if (inBounds(i, j) && board[i][j] === 0) openPos = true;

  // 反方向连续同色
  i = r - dr;
  j = c - dc;
  while (inBounds(i, j) && board[i][j] === color) {
    count++;
    i -= dr;
    j -= dc;
  }
  if (inBounds(i, j) && board[i][j] === 0) openNeg = true;

  if (count >= 5) return 100000; // 五连
  const openCount = (openPos ? 1 : 0) + (openNeg ? 1 : 0);

  if (count === 4) {
    if (openCount === 2) return 10000; // 活四
    if (openCount === 1) return 1000; // 冲四
    return 0;
  }
  if (count === 3) {
    if (openCount === 2) return 1000; // 活三
    if (openCount === 1) return 100; // 眠三
    return 0;
  }
  if (count === 2) {
    if (openCount === 2) return 100; // 活二
    if (openCount === 1) return 10; // 眠二
    return 0;
  }
  if (count === 1) {
    if (openCount === 2) return 10; // 活一
    if (openCount === 1) return 1;
    return 0;
  }
  return 0;
}

// 评估某位置放某色棋的综合得分（4个方向之和）
function evaluatePosition(
  board: Stone[][],
  r: number,
  c: number,
  color: Stone,
): number {
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  let total = 0;
  for (const [dr, dc] of dirs) {
    total += evaluateDirection(board, r, c, dr, dc, color);
  }
  return total;
}

// AI 选择落子位置
function getAIMove(board: Stone[][], difficulty: Difficulty): Pos {
  const candidates: { r: number; c: number; score: number }[] = [];
  let hasAnyStone = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) {
        hasAnyStone = true;
        continue;
      }
      // 优化：只考虑有邻居的空位
      if (!hasNeighbor(board, r, c, 2)) continue;

      const offense = evaluatePosition(board, r, c, 2); // AI(白)进攻分
      const defense = evaluatePosition(board, r, c, 1); // 玩家(黑)威胁分
      const score = offense + defense * 0.8; // 最大化进攻 + 0.8×防守
      candidates.push({ r, c, score });
    }
  }

  // 空棋盘下天元
  if (!hasAnyStone || candidates.length === 0) {
    return { r: 7, c: 7 };
  }

  candidates.sort((a, b) => b.score - a.score);

  if (difficulty === "hard") {
    // 困难：选择最佳位置（确定性）
    return { r: candidates[0].r, c: candidates[0].c };
  } else if (difficulty === "medium") {
    // 中等：从前3名中随机选
    const top = candidates.slice(0, Math.min(3, candidates.length));
    const pick = top[Math.floor(Math.random() * top.length)];
    return { r: pick.r, c: pick.c };
  } else {
    // 简单：从前10名中随机选
    const top = candidates.slice(0, Math.min(10, candidates.length));
    const pick = top[Math.floor(Math.random() * top.length)];
    return { r: pick.r, c: pick.c };
  }
}

/* ============ 组件 ============ */

export default function GomokuPage() {
  const [board, setBoard] = useState<Stone[][]>(createEmptyBoard);
  const [result, setResult] = useState<GameResult>("playing");
  const [winLine, setWinLine] = useState<Pos[] | null>(null);
  const [lastMove, setLastMove] = useState<Pos | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [stats, setStats] = useState<SavedStats>({
    wins: 0,
    losses: 0,
    draws: 0,
    bestScore: 0,
  });
  const [resultData, setResultData] = useState<Result | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [hoverPos, setHoverPos] = useState<Pos | null>(null);

  const canPlay = result === "playing" && !isAiThinking;

  /* ----- 游戏结束处理 ----- */
  const handleEnd = useCallback(
    (newResult: GameResult, line: Pos[] | null, diff: Difficulty) => {
      setResult(newResult);
      setWinLine(line);
      setIsAiThinking(false);

      let score = 0;
      if (newResult === "win")
        score = diff === "hard" ? 100 : diff === "medium" ? 70 : 50;
      else if (newResult === "draw")
        score = diff === "hard" ? 30 : diff === "medium" ? 20 : 15;
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
          /* ignore */
        }
        if (score > prev.bestScore) {
          try {
            localStorage.setItem(BEST_SCORE_KEY, String(score));
          } catch {
            /* ignore */
          }
        }
        return next;
      });

      if (!submitted) {
        const detail = `${DIFFICULTY_CONFIG[diff].label} · ${newResult === "win" ? "胜" : newResult === "draw" ? "平" : "负"}`;
        const r = submitScore(GAME_ID, score, detail);
        setResultData(r);
        setRefreshKey((k) => k + 1);
        setSubmitted(true);
      }

      setTimeout(() => setShowOverlay(true), 700);
    },
    [submitted],
  );

  /* ----- 玩家落子 ----- */
  const handleClick = useCallback(
    (r: number, c: number) => {
      if (!canPlay || board[r][c] !== 0) return;
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = 1;
      setBoard(newBoard);
      setLastMove({ r, c });
      setHoverPos(null);

      const line = checkWin(newBoard, r, c);
      if (line) {
        handleEnd("win", line, difficulty);
        return;
      }
      if (isBoardFull(newBoard)) {
        handleEnd("draw", null, difficulty);
        return;
      }
      setIsAiThinking(true);
    },
    [board, canPlay, difficulty, handleEnd],
  );

  /* ----- AI 落子（延迟模拟思考）----- */
  useEffect(() => {
    if (!isAiThinking || result !== "playing") return;
    const timer = setTimeout(() => {
      const move = getAIMove(board, difficulty);
      const newBoard = board.map((row) => [...row]);
      newBoard[move.r][move.c] = 2;
      setBoard(newBoard);
      setLastMove({ r: move.r, c: move.c });

      const line = checkWin(newBoard, move.r, move.c);
      if (line) {
        handleEnd("lose", line, difficulty);
        return;
      }
      if (isBoardFull(newBoard)) {
        handleEnd("draw", null, difficulty);
        return;
      }
      setIsAiThinking(false);
    }, 500 + Math.random() * 300);
    return () => clearTimeout(timer);
  }, [isAiThinking, board, result, difficulty, handleEnd]);

  /* ----- 重新开始 ----- */
  const reset = useCallback(() => {
    setBoard(createEmptyBoard());
    setResult("playing");
    setWinLine(null);
    setLastMove(null);
    setIsAiThinking(false);
    setSubmitted(false);
    setResultData(null);
    setShowOverlay(false);
    setHoverPos(null);
  }, []);

  /* ----- 切换难度 ----- */
  const changeDifficulty = useCallback(
    (d: Difficulty) => {
      if (d === difficulty) return;
      setDifficulty(d);
      reset();
    },
    [difficulty, reset],
  );

  /* ----- 初始化（mounted 模式：读取 localStorage）----- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedStats;
        if (
          typeof parsed.wins === "number" &&
          typeof parsed.losses === "number" &&
          typeof parsed.draws === "number"
        ) {
          setStats(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const totalGames = stats.wins + stats.losses + stats.draws;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

  const statsDisplay: GameStat[] = [
    { label: "胜场", value: stats.wins },
    { label: "负场", value: stats.losses },
    { label: "平局", value: stats.draws },
    { label: "胜率", value: `${winRate}%` },
  ];

  const resultText =
    result === "win" ? "你赢了！" : result === "lose" ? "AI 获胜" : "平局";
  const resultEmoji = result === "win" ? "🎉" : result === "lose" ? "🤖" : "🤝";
  const resultColor =
    result === "win"
      ? "text-emerald-400"
      : result === "lose"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <GameShell
      gameId={GAME_ID}
      title="五子棋AI"
      description="15×15棋盘经典五子棋对战。AI采用模式识别+威胁评估算法，支持三档难度。黑棋先手，五子连珠获胜！"
      instructions={`黑棋（你）先手，点击棋盘空位落子。
目标：横、竖、正斜、反斜任意方向连成5子即胜。
AI算法：评估每个空位的进攻得分与防守威胁，选择最大化（己方得分 + 对手威胁×0.8）的位置。
难度说明：
  简单：从前10名候选位置随机选择
  中等：从前3名候选位置随机选择
  困难：始终选择最佳位置（确定性）
你的战绩会自动保存在本地。`}
      icon={Grid3x3}
      iconEmoji="♟️"
      iconGradient="from-amber-400 to-orange-500"
      stats={statsDisplay}
      shareScore={stats.bestScore}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center gap-4">
        {/* 难度选择 */}
        <div className="flex items-center gap-2">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => {
            const cfg = DIFFICULTY_CONFIG[d];
            const Icon = cfg.icon;
            const active = difficulty === d;
            return (
              <button
                key={d}
                onClick={() => changeDifficulty(d)}
                className={`inline-flex items-center gap-1.5 h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-lg border transition-all ${
                  active
                    ? `${cfg.bg} ${cfg.color}`
                    : "bg-[#27272a] text-slate-400 border-[#3f3f46] hover:bg-[#3f3f46]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </button>
            );
          })}
        </div>

        {/* 状态栏 */}
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-gray-600 to-black border border-gray-500" />
            <span className="text-slate-400">你（黑）</span>
          </span>
          <span className="text-slate-600">vs</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-white to-gray-400 border border-gray-300" />
            <span className="text-slate-400">AI（白）</span>
          </span>
          {isAiThinking && (
            <span className="flex items-center gap-1 text-xs text-amber-400 animate-ai-thinking">
              <Brain className="w-3.5 h-3.5" />
              AI思考中...
            </span>
          )}
        </div>

        {/* 棋盘 */}
        <div className="overflow-x-auto w-full max-w-[560px] flex justify-center">
          <div
            className="inline-grid border-l border-t border-[#8b6f47] rounded-sm shadow-2xl shadow-amber-900/20"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, auto)`,
              background: "linear-gradient(135deg, #e8c89a 0%, #deb887 50%, #d4a960 100%)",
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isStar = STAR_POINTS.has(`${r},${c}`);
                const isLast =
                  lastMove !== null && lastMove.r === r && lastMove.c === c;
                const isWin = winLine?.some(
                  (p) => p.r === r && p.c === c,
                );
                const isHover =
                  hoverPos?.r === r &&
                  hoverPos?.c === c &&
                  cell === 0 &&
                  canPlay;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    onMouseEnter={() => canPlay && cell === 0 && setHoverPos({ r, c })}
                    onMouseLeave={() => setHoverPos(null)}
                    className={`relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 border-r border-b border-[#8b6f47] flex items-center justify-center ${
                      canPlay && cell === 0
                        ? "cursor-pointer hover:bg-amber-700/10"
                        : "cursor-default"
                    }`}
                  >
                    {/* 星位标记 */}
                    {isStar && cell === 0 && (
                      <span className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8b6f47] opacity-70 pointer-events-none" />
                    )}

                    {/* 悬停预览 */}
                    {isHover && (
                      <span className="absolute inset-1 rounded-full bg-black/20 pointer-events-none" />
                    )}

                    {/* 黑棋 */}
                    {cell === 1 && (
                      <span
                        className={`absolute inset-1 rounded-full shadow-md pointer-events-none transition-transform ${
                          isLast ? "animate-piece-drop" : ""
                        }`}
                        style={{
                          background:
                            "radial-gradient(circle at 30% 30%, #5a5a5a, #1a1a1a 50%, #000)",
                        }}
                      />
                    )}

                    {/* 白棋 */}
                    {cell === 2 && (
                      <span
                        className={`absolute inset-1 rounded-full shadow-md pointer-events-none transition-transform ${
                          isLast ? "animate-piece-drop" : ""
                        }`}
                        style={{
                          background:
                            "radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0 50%, #b8b8b8)",
                        }}
                      />
                    )}

                    {/* 最后一步红点标记 */}
                    {isLast && cell !== 0 && (
                      <span className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 z-10 pointer-events-none shadow-glow" />
                    )}

                    {/* 获胜连线高亮 */}
                    {isWin && (
                      <span className="absolute inset-0.5 rounded-full ring-2 ring-[#a78bfa] ring-offset-0 animate-win-glow pointer-events-none" />
                    )}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>

        {/* 战绩简览 */}
        {totalGames > 0 && (
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              最高分 {stats.bestScore}
            </span>
            <span>·</span>
            <span>共 {totalGames} 局</span>
          </div>
        )}
      </div>

      {/* 结果覆盖层 */}
      {showOverlay && result !== "playing" && (
        <div className="mt-4 rounded-xl bg-[#18181b] border border-[#27272a] p-6 text-center animate-overlay-in">
          <div className="text-5xl mb-2">{resultEmoji}</div>
          <h3 className={`text-2xl font-bold mb-3 ${resultColor}`}>
            {resultText}
          </h3>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-400 mb-3">
            <span>胜 {stats.wins}</span>
            <span>平 {stats.draws}</span>
            <span>负 {stats.losses}</span>
          </div>
          {resultData && (
            <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2 inline-block">
              排名第{" "}
              <span className="text-amber-400 font-bold">
                {resultData.rank}
              </span>
              /{resultData.total}，超越了{" "}
              <span className="text-amber-400 font-bold">
                {resultData.beatPercent}%
              </span>{" "}
              的玩家
            </p>
          )}
          <div>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-lg shadow-amber-500/30"
            >
              <RotateCcw className="w-4 h-4" /> 再来一局
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
