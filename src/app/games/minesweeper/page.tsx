"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bomb, Flag, RefreshCw, Pickaxe } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const ROWS = 9;
const COLS = 9;
const MINES = 10;

type CellState = {
  isMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
  justRevealed: boolean;
  justFlagged: boolean;
};

type GameStatus = "ready" | "playing" | "won" | "lost";
type InteractionMode = "dig" | "flag";

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
      justRevealed: false,
      justFlagged: false,
    })),
  );
}

function plantMines(board: CellState[][], safeRow: number, safeCol: number): CellState[][] {
  const newBoard = board.map((row) => row.map((c) => ({ ...c })));
  const forbidden = new Set<string>();
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
    cell.justRevealed = true;
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
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState<InteractionMode>("dig");
  const [scoreAnim, setScoreAnim] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const GAME_ID = "minesweeper";

  useEffect(() => {
    try {
      const stats = JSON.parse(localStorage.getItem("gm_stats") || "{}");
      if (stats.highScores?.[GAME_ID]) setBestScore(stats.highScores[GAME_ID]);
    } catch {
      /* ignore */
    }
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
      const lost = working.map((r) =>
        r.map((c) => ({ ...c, revealed: c.isMine ? true : c.revealed, justRevealed: c.isMine ? true : c.justRevealed })),
      );
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
      const score = Math.max(100, 1000 - time * 5);
      if (!submitted) {
        submitScore(GAME_ID, score, `${time}秒通关`);
        setScoreAnim((n) => n + 1);
        setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
        setRefreshKey((k) => k + 1);
        setSubmitted(true);
      }
    }
    setStatus(newStatus);
  };

  const toggleFlag = (row: number, col: number) => {
    if (status === "won" || status === "lost" || status === "ready") return;
    const cell = board[row][col];
    if (cell.revealed) return;
    const newBoard = board.map((r) => r.map((c) => ({ ...c })));
    newBoard[row][col].flagged = !newBoard[row][col].flagged;
    newBoard[row][col].justFlagged = true;
    setBoard(newBoard);
    setFlagsUsed(newBoard.flat().filter((c) => c.flagged).length);
  };

  // Unified click handler: respects mode on mobile, right-click always flags
  const handleCellClick = (row: number, col: number) => {
    if (mode === "flag") {
      toggleFlag(row, col);
    } else {
      reveal(row, col);
    }
  };

  const handleCellContextMenu = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    toggleFlag(row, col);
  };

  // Long-press to flag on mobile
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handleTouchStart = (row: number, col: number) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      toggleFlag(row, col);
    }, 500);
  };

  const handleTouchEnd = (row: number, col: number) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!longPressTriggered.current) {
      handleCellClick(row, col);
    }
  };

  const minesLeft = MINES - flagsUsed;

  const stats: GameStat[] = [
    { label: "剩余雷", value: minesLeft },
    { label: "时间", value: time },
    { label: "最佳", value: bestScore ?? "—" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="扫雷"
      description="经典 9×9 扫雷，10 个雷。点击挖开格子，长按或切换旗子模式标记。踩到雷游戏结束，挖开所有非雷格子获胜。"
      instructions={`经典 9×9 扫雷，共 10 个雷。
点击格子挖开，长按或切换到标旗模式来标记可疑的雷。
首次点击保证安全，挖到空白区域会自动展开相邻格子。
数字表示周围 8 格中的雷数。
挖开所有非雷格子即获胜，用时越短分数越高。
踩到雷则游戏结束。`}
      icon={Bomb}
      iconEmoji="💣"
      iconGradient="from-gray-500 to-slate-500"
      stats={stats}
      shareScore={bestScore ?? 0}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 控制条：重置 + 模式切换 */}
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 hover:border-[#8b5cf6] transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4 text-[#8b5cf6]" />
            <span className="text-sm font-medium">
              {status === "won" ? "😎" : status === "lost" ? "💀" : "🙂"}
            </span>
          </button>
          <button
            onClick={() => setMode("dig")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              mode === "dig"
                ? "bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30"
                : "bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Pickaxe className="w-4 h-4" />
            挖掘
          </button>
          <button
            onClick={() => setMode("flag")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
              mode === "flag"
                ? "bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30"
                : "bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Flag className="w-4 h-4" />
            标旗
          </button>
        </div>

        {/* 游戏网格 */}
        <div className="flex justify-center mb-4">
          <div className="inline-block bg-[#18181b] border border-[#27272a] rounded-xl p-3 shadow-xl">
            <div
              className="grid gap-0.5 sm:gap-1"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {board.map((row, r) =>
                row.map((cell, c) => (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onContextMenu={(e) => handleCellContextMenu(e, r, c)}
                    onTouchStart={() => handleTouchStart(r, c)}
                    onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd(r, c); }}
                    onTouchMove={() => {
                      if (longPressTimer.current) {
                        clearTimeout(longPressTimer.current);
                        longPressTimer.current = null;
                      }
                    }}
                    className={`w-7 h-7 sm:w-9 sm:h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-md text-sm sm:text-base lg:text-lg font-bold transition-all select-none ${
                      cell.revealed
                        ? cell.isMine
                          ? "bg-red-500/80 text-white animate-cell-flip"
                          : `bg-[#27272a]/60 ${cell.justRevealed ? "animate-cell-flip" : ""}`
                        : "bg-gradient-to-br from-zinc-700 to-zinc-800 hover:from-[#8b5cf6]/40 hover:to-[#6d28d9]/40 active:scale-95"
                    } ${mode === "flag" && !cell.revealed ? "ring-1 ring-[#8b5cf6]/30" : ""}`}
                  >
                    {cell.revealed ? (
                      cell.isMine ? (
                        <Bomb className="w-4 h-4" />
                      ) : cell.adjacent > 0 ? (
                        <span className={NUMBER_COLORS[cell.adjacent]}>{cell.adjacent}</span>
                      ) : null
                    ) : cell.flagged ? (
                      <span className={cell.justFlagged ? "animate-flag-pop" : ""}>
                        <Flag className="w-4 h-4 text-[#c084fc]" />
                      </span>
                    ) : null}
                  </button>
                )),
              )}
            </div>
          </div>
        </div>

        {/* 结果提示 */}
        {status === "won" && (
          <div className="text-center mb-4 animate-bounce-in">
            <div className="inline-block bg-green-500/10 border border-green-500/30 rounded-xl px-6 py-4">
              <p key={scoreAnim} className="text-green-400 font-bold text-xl mb-1 animate-score-pop">🎉 恭喜通关！</p>
              <p className="text-zinc-400 text-sm">用时 {time} 秒</p>
            </div>
          </div>
        )}
        {status === "lost" && (
          <div className="text-center mb-4 animate-shake">
            <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4">
              <p className="text-red-400 font-bold text-xl mb-1">💥 踩到雷了！</p>
              <p className="text-zinc-400 text-sm">再来一局吧</p>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
