"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Grid3x3, RotateCcw, Calendar, Shuffle } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "sliding-puzzle";
const BEST_KEY = "gm_sliding_puzzle_best";
const BEST_TIME_KEY = "gm_sliding_puzzle_best_time";

const SIZE = 4;
const TOTAL = SIZE * SIZE;

/* ===== Seeded RNG (mulberry32) ===== */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(): number {
  const d = new Date();
  return (
    d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  );
}

/* ===== Puzzle logic ===== */
function solvedState(): number[] {
  return Array.from({ length: TOTAL - 1 }, (_, i) => i + 1).concat(0);
}

function findEmpty(board: number[]): number {
  return board.indexOf(0);
}

function getNeighbors(pos: number): number[] {
  const row = Math.floor(pos / SIZE);
  const col = pos % SIZE;
  const result: number[] = [];
  if (row > 0) result.push(pos - SIZE);
  if (row < SIZE - 1) result.push(pos + SIZE);
  if (col > 0) result.push(pos - 1);
  if (col < SIZE - 1) result.push(pos + 1);
  return result;
}

function shuffleBoard(seed: number): number[] {
  const board = solvedState();
  const rng = mulberry32(seed);
  let emptyPos = findEmpty(board);
  let lastMove = -1;

  for (let i = 0; i < 200; i++) {
    const neighbors = getNeighbors(emptyPos).filter((n) => n !== lastMove);
    const move = neighbors[Math.floor(rng() * neighbors.length)];
    // Swap
    board[emptyPos] = board[move];
    board[move] = 0;
    lastMove = emptyPos;
    emptyPos = move;
  }

  // Ensure not already solved
  if (isSolved(board)) {
    const n = getNeighbors(emptyPos)[0];
    board[emptyPos] = board[n];
    board[n] = 0;
  }

  return board;
}

function isSolved(board: number[]): boolean {
  for (let i = 0; i < TOTAL - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[TOTAL - 1] === 0;
}

function canMove(board: number[], pos: number): boolean {
  const emptyPos = findEmpty(board);
  return getNeighbors(emptyPos).includes(pos);
}

function moveTile(board: number[], pos: number): number[] {
  if (!canMove(board, pos)) return board;
  const emptyPos = findEmpty(board);
  const newBoard = board.slice();
  newBoard[emptyPos] = newBoard[pos];
  newBoard[pos] = 0;
  return newBoard;
}

/* ===== Swipe direction ===== */
type SwipeDir = "up" | "down" | "left" | "right" | null;

function getSwipeDir(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): SwipeDir {
  const dx = endX - startX;
  const dy = endY - startY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  if (Math.max(absDx, absDy) < 30) return null;
  if (absDx > absDy) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}

function swipeMove(board: number[], dir: SwipeDir): number[] {
  if (!dir) return board;
  const emptyPos = findEmpty(board);
  const row = Math.floor(emptyPos / SIZE);
  const col = emptyPos % SIZE;
  let targetPos = -1;

  // The tile that moves into the empty space is in the opposite direction of the swipe
  switch (dir) {
    case "up":
      // Tile below empty moves up
      if (row < SIZE - 1) targetPos = emptyPos + SIZE;
      break;
    case "down":
      // Tile above empty moves down
      if (row > 0) targetPos = emptyPos - SIZE;
      break;
    case "left":
      // Tile to the right of empty moves left
      if (col < SIZE - 1) targetPos = emptyPos + 1;
      break;
    case "right":
      // Tile to the left of empty moves right
      if (col > 0) targetPos = emptyPos - 1;
      break;
  }

  if (targetPos >= 0) return moveTile(board, targetPos);
  return board;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ===== Tile colors (gradient based on number) ===== */
function tileGradient(num: number): string {
  const hue = ((num - 1) * 23) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 65%, 50%), hsl(${(hue + 30) % 360}, 70%, 35%))`;
}

export default function SlidingPuzzlePage() {
  /* ===== mounted mode ===== */
  const [mounted, setMounted] = useState(false);
  const [board, setBoard] = useState<number[]>(solvedState);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [solved, setSolved] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bestMoves, setBestMoves] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [isDaily, setIsDaily] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const boardRef = useRef<number[]>(solvedState());
  const movesRef = useRef(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const submittedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSeconds(elapsed);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  /* ===== init (mounted) ===== */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const bm = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      const bt = parseInt(localStorage.getItem(BEST_TIME_KEY) || "0", 10) || 0;
      if (bm > 0) setBestMoves(bm);
      if (bt > 0) setBestTime(bt);
    } catch {
      /* ignore */
    }
    // Start with a random shuffle (not daily by default)
    const seed = Math.floor(Math.random() * 1000000);
    const b = shuffleBoard(seed);
    boardRef.current = b;
    setBoard(b);
    setMounted(true);
    startTimer();
  }, [startTimer]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ===== handle tile click ===== */
  const handleTileClick = useCallback(
    (pos: number) => {
      if (submittedRef.current) return;
      if (!canMove(boardRef.current, pos)) return;

      const newBoard = moveTile(boardRef.current, pos);
      boardRef.current = newBoard;
      setBoard(newBoard);
      movesRef.current += 1;
      setMoves(movesRef.current);

      if (isSolved(newBoard)) {
        stopTimer();
        setSolved(true);
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 3000);

        if (!submittedRef.current) {
          submittedRef.current = true;
          const elapsed = Math.floor(
            (Date.now() - startTimeRef.current) / 1000
          );
          // Score = based on moves and time (lower is better, so invert)
          const score = Math.max(
            100,
            10000 - movesRef.current * 10 - elapsed * 5
          );
          const r = submitScore(
            GAME_ID,
            score,
            `${movesRef.current}步 / ${elapsed}秒`
          );
          setResult(r);
          setRefreshKey((k) => k + 1);

          // Save best
          try {
            if (movesRef.current < bestMoves || bestMoves === 0) {
              setBestMoves(movesRef.current);
              localStorage.setItem(BEST_KEY, String(movesRef.current));
            }
            if (elapsed < bestTime || bestTime === 0) {
              setBestTime(elapsed);
              localStorage.setItem(BEST_TIME_KEY, String(elapsed));
            }
          } catch {
            /* ignore */
          }
        }
      }
    },
    [bestMoves, bestTime, stopTimer]
  );

  /* ===== swipe handlers ===== */
  const handleTouchStart = (e: React.TouchEvent) => {
    if (submittedRef.current) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (submittedRef.current || !touchStartRef.current) return;
    const dir = getSwipeDir(
      touchStartRef.current.x,
      touchStartRef.current.y,
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    );
    if (dir) {
      const newBoard = swipeMove(boardRef.current, dir);
      if (newBoard !== boardRef.current) {
        boardRef.current = newBoard;
        setBoard(newBoard);
        movesRef.current += 1;
        setMoves(movesRef.current);

        if (isSolved(newBoard)) {
          stopTimer();
          setSolved(true);
          setCelebrate(true);
          setTimeout(() => setCelebrate(false), 3000);

          if (!submittedRef.current) {
            submittedRef.current = true;
            const elapsed = Math.floor(
              (Date.now() - startTimeRef.current) / 1000
            );
            const score = Math.max(
              100,
              10000 - movesRef.current * 10 - elapsed * 5
            );
            const r = submitScore(
              GAME_ID,
              score,
              `${movesRef.current}步 / ${elapsed}秒`
            );
            setResult(r);
            setRefreshKey((k) => k + 1);

            try {
              if (movesRef.current < bestMoves || bestMoves === 0) {
                setBestMoves(movesRef.current);
                localStorage.setItem(BEST_KEY, String(movesRef.current));
              }
              if (elapsed < bestTime || bestTime === 0) {
                setBestTime(elapsed);
                localStorage.setItem(BEST_TIME_KEY, String(elapsed));
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
    }
    touchStartRef.current = null;
  };

  /* ===== new game ===== */
  const newGame = (daily: boolean = false) => {
    const seed = daily ? dateSeed() : Math.floor(Math.random() * 1000000);
    const b = shuffleBoard(seed);
    boardRef.current = b;
    setBoard(b);
    movesRef.current = 0;
    setMoves(0);
    setSolved(false);
    setResult(null);
    setCelebrate(false);
    submittedRef.current = false;
    setIsDaily(daily);
    startTimer();
  };

  /* ===== cleanup ===== */
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const stats: GameStat[] = [
    { label: "步数", value: moves },
    { label: "时间", value: formatTime(seconds) },
    { label: "最少步", value: bestMoves || "-" },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="数字华容道"
        description="滑动数字方块，将1-15按顺序排列"
        instructions="点击与空位相邻的数字方块，方块会滑入空位。在移动端可以滑动屏幕来移动方块。将所有数字按1-15顺序排列即可完成。每日一题使用日期作为种子，每天生成相同的打乱序列。"
        icon={Grid3x3}
        iconEmoji="🔢"
        iconGradient="from-emerald-400 to-teal-600"
        stats={stats}
        shareScore={Math.max(100, 10000 - moves * 10 - seconds * 5)}
        refreshKey={refreshKey}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-slate-500">加载中...</div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="数字华容道"
      description="滑动数字方块，将1-15按顺序排列"
      instructions="点击与空位相邻的数字方块，方块会滑入空位。在移动端可以滑动屏幕来移动方块。将所有数字按1-15顺序排列即可完成。每日一题使用日期作为种子，每天生成相同的打乱序列。"
      icon={Grid3x3}
      iconEmoji="🔢"
      iconGradient="from-emerald-400 to-teal-600"
      stats={stats}
      shareScore={Math.max(100, 10000 - moves * 10 - seconds * 5)}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => newGame(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" />
            随机打乱
          </button>
          <button
            onClick={() => newGame(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isDaily
                ? "text-white bg-[#8b5cf6]"
                : "text-slate-300 bg-[#27272a] hover:bg-[#3f3f46]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            每日一题
          </button>
          {isDaily && (
            <span className="text-xs text-[#a78bfa]">
              {new Date().toISOString().slice(0, 10)}
            </span>
          )}
        </div>

        {/* Puzzle grid */}
        <div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Celebration confetti */}
          {celebrate && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `${((i * 37 + 13) % 100)}%`,
                    top: `${((i * 73 + 29) % 100)}%`,
                    background: [
                      "#22c55e",
                      "#8b5cf6",
                      "#eab308",
                      "#ef4444",
                      "#3b82f6",
                    ][i % 5],
                    animation: `confettiFall 2s ease-out forwards`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          )}

          <div
            className={`grid grid-cols-4 gap-2 p-3 bg-[#09090b] border border-[#27272a] rounded-2xl ${
              solved ? "ring-2 ring-[#22c55e]/50" : ""
            }`}
          >
            {board.map((num, pos) => {
              const movable = canMove(board, pos);
              const isEmpty = num === 0;
              const correctPos = num !== 0 && num === pos + 1;

              return (
                <button
                  key={pos}
                  onClick={() => handleTileClick(pos)}
                  disabled={isEmpty || solved}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold transition-all duration-200 ${
                    isEmpty
                      ? "bg-transparent cursor-default"
                      : movable && !solved
                        ? "cursor-pointer hover:scale-105 active:scale-95"
                        : "cursor-default"
                  }`}
                  style={
                    isEmpty
                      ? { background: "transparent" }
                      : {
                          background: tileGradient(num),
                          color: "white",
                          boxShadow: correctPos
                            ? "0 0 12px rgba(34,197,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                            : "inset 0 1px 0 rgba(255,255,255,0.15)",
                          border: correctPos
                            ? "1px solid rgba(34,197,94,0.5)"
                            : "1px solid rgba(0,0,0,0.2)",
                        }
                  }
                >
                  {!isEmpty && num}
                  {correctPos && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-300/80" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Solved overlay */}
          {solved && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#09090b]/90 backdrop-blur-sm rounded-2xl z-10">
              <div className="text-5xl mb-2">🎉</div>
              <div className="text-2xl font-bold text-white">完成！</div>
              <div className="flex gap-4 text-sm">
                <span className="text-slate-300">
                  <span className="text-[#a78bfa] font-bold">{moves}</span> 步
                </span>
                <span className="text-slate-300">
                  <span className="text-[#a78bfa] font-bold">
                    {formatTime(seconds)}
                  </span>
                </span>
              </div>
              {result && (
                <div className="text-xs text-slate-500">
                  排名 #{result.rank} / {result.total} · 击败{" "}
                  {result.beatPercent}% 玩家
                </div>
              )}
              <button
                onClick={() => newGame(false)}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                再来一局
              </button>
            </div>
          )}
        </div>

        {/* Best records */}
        <div className="flex gap-4 text-xs text-slate-500">
          <span>
            最少步数: <span className="text-slate-300 font-medium">{bestMoves || "-"}</span>
          </span>
          <span>
            最快时间:{" "}
            <span className="text-slate-300 font-medium">
              {bestTime ? formatTime(bestTime) : "-"}
            </span>
          </span>
        </div>

        <p className="text-xs text-slate-500 text-center">
          点击方块滑动 · 移动端可滑动操作 · 绿点表示位置正确
        </p>
      </div>

      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(300px) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </GameShell>
  );
}
