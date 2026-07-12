"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FlaskConical, RotateCcw, Play, Trophy, Flame, Bomb } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "brainrot-match";
const BEST_KEY = "gm_brainrot_match_best";
const GAME_DURATION = 60; // seconds
const ROWS = 8;
const COLS = 8;
const TYPES = 6;

const EMOJIS = ["🐱", "🤖", "👽", "🦄", "🐸", "🐙"];
const EMOJI_COLORS = [
  "from-orange-400/20 to-orange-600/10 border-orange-500/30",
  "from-slate-400/20 to-slate-600/10 border-slate-500/30",
  "from-green-400/20 to-green-600/10 border-green-500/30",
  "from-pink-400/20 to-pink-600/10 border-pink-500/30",
  "from-emerald-400/20 to-emerald-600/10 border-emerald-500/30",
  "from-violet-400/20 to-violet-600/10 border-violet-500/30",
];

/* ===== Types ===== */
interface Cell {
  type: number;
  id: number;
  bomb?: boolean;
}

type Board = (Cell | null)[][];

interface MatchGroup {
  cells: [number, number][];
  length: number;
  direction: "h" | "v";
}

interface GameResult {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ===== Board utilities ===== */
function generateBoard(rng: () => number = Math.random): Board {
  const board: (Cell | null)[][] = Array.from({ length: ROWS }, () =>
    Array<Cell | null>(COLS).fill(null),
  );
  let id = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let type: number;
      let attempts = 0;
      do {
        type = Math.floor(rng() * TYPES);
        attempts++;
        if (attempts > 30) break;
      } while (
        (c >= 2 &&
          board[r][c - 1]?.type === type &&
          board[r][c - 2]?.type === type) ||
        (r >= 2 &&
          board[r - 1][c]?.type === type &&
          board[r - 2][c]?.type === type)
      );
      board[r][c] = { type, id: id++ };
    }
  }
  if (!hasValidMoves(board)) return generateBoard(rng);
  return board;
}

function findMatchGroups(board: Board): MatchGroup[] {
  const groups: MatchGroup[] = [];

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let start = 0;
    for (let c = 1; c <= COLS; c++) {
      if (
        c < COLS &&
        board[r][c] &&
        board[r][start] &&
        board[r][c]!.type === board[r][start]!.type
      ) {
        continue;
      }
      const len = c - start;
      if (len >= 3) {
        const cells: [number, number][] = [];
        for (let i = start; i < c; i++) cells.push([r, i]);
        groups.push({ cells, length: len, direction: "h" });
      }
      start = c;
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    let start = 0;
    for (let r = 1; r <= ROWS; r++) {
      if (
        r < ROWS &&
        board[r][c] &&
        board[start][c] &&
        board[r][c]!.type === board[start][c]!.type
      ) {
        continue;
      }
      const len = r - start;
      if (len >= 3) {
        const cells: [number, number][] = [];
        for (let i = start; i < r; i++) cells.push([i, c]);
        groups.push({ cells, length: len, direction: "v" });
      }
      start = r;
    }
  }

  return groups;
}

function swapCells(
  board: Board,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): Board {
  const nb: Board = board.map((row) => row.map((c) => (c ? { ...c } : null)));
  const tmp = nb[r1][c1];
  nb[r1][c1] = nb[r2][c2];
  nb[r2][c2] = tmp;
  return nb;
}

function areAdjacent(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): boolean {
  return (
    (Math.abs(r1 - r2) === 1 && c1 === c2) ||
    (Math.abs(c1 - c2) === 1 && r1 === r2)
  );
}

function wouldMatch(
  board: Board,
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): boolean {
  const swapped = swapCells(board, r1, c1, r2, c2);
  return findMatchGroups(swapped).length > 0;
}

function hasValidMoves(board: Board): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1 && wouldMatch(board, r, c, r, c + 1)) return true;
      if (r < ROWS - 1 && wouldMatch(board, r, c, r + 1, c)) return true;
    }
  }
  return false;
}

function applyGravity(board: Board, rng: () => number = Math.random): Board {
  const nb: (Cell | null)[][] = Array.from({ length: ROWS }, () =>
    Array<Cell | null>(COLS).fill(null),
  );
  let nextId = Date.now() + Math.floor(rng() * 100000);

  for (let c = 0; c < COLS; c++) {
    const stack: Cell[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c]) stack.push(board[r][c]!);
    }
    for (let r = ROWS - 1; r >= 0; r--) {
      const idx = ROWS - 1 - r;
      if (idx < stack.length) {
        nb[r][c] = stack[idx];
      } else {
        nb[r][c] = { type: Math.floor(rng() * TYPES), id: nextId++ };
      }
    }
  }
  return nb;
}

interface ClearResult {
  board: Board;
  cleared: number;
  bombsCreated: number;
  bombExplosions: number;
}

function processClear(board: Board, groups: MatchGroup[]): ClearResult {
  const nb: Board = board.map((row) => row.map((c) => (c ? { ...c } : null)));

  // Collect all matched cells
  const matched = new Set<string>();
  for (const g of groups) {
    for (const [r, c] of g.cells) matched.add(`${r},${c}`);
  }

  // Find bombs in matched set and explode them (BFS chain reaction)
  const explodeQueue: string[] = [];
  const exploded = new Set<string>();
  for (const key of matched) {
    const [r, c] = key.split(",").map(Number);
    if (nb[r][c]?.bomb) {
      explodeQueue.push(key);
      exploded.add(key);
    }
  }

  let bombExplosions = 0;
  while (explodeQueue.length > 0) {
    const key = explodeQueue.shift()!;
    bombExplosions++;
    const [r, c] = key.split(",").map(Number);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const nkey = `${nr},${nc}`;
          matched.add(nkey);
          if (nb[nr][nc]?.bomb && !exploded.has(nkey)) {
            exploded.add(nkey);
            explodeQueue.push(nkey);
          }
        }
      }
    }
  }

  // Create bombs for 4+ matches (at the swapped position / first cell)
  let bombsCreated = 0;
  for (const g of groups) {
    if (g.length >= 4) {
      // Find a cell that's not exploded to place the bomb
      for (const [r, c] of g.cells) {
        const key = `${r},${c}`;
        if (nb[r][c] && !exploded.has(key)) {
          nb[r][c] = { ...nb[r][c]!, bomb: true };
          matched.delete(key);
          bombsCreated++;
          break;
        }
      }
    }
  }

  // Clear all matched cells
  let cleared = 0;
  for (const key of matched) {
    const [r, c] = key.split(",").map(Number);
    if (nb[r][c]) {
      nb[r][c] = null;
      cleared++;
    }
  }

  return { board: nb, cleared, bombsCreated, bombExplosions };
}

/* ===== Component ===== */
export default function BrainrotMatchPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [board, setBoard] = useState<Board>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null)),
  );
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bestScore, setBestScore] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [floatScore, setFloatScore] = useState<{ id: number; value: number } | null>(null);

  // Refs
  const boardRef = useRef<Board>(board);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const lockedRef = useRef(false);
  const selectedRef = useRef<{ r: number; c: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const cascadeTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const floatIdRef = useRef(0);

  /* ===== Mount: load best score ===== */
  useEffect(() => {
    setMounted(true);
    try {
      const b = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (b > 0) {
        bestRef.current = b;
        setBestScore(b);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== Cleanup cascade timers on unmount ===== */
  useEffect(() => {
    return () => {
      cascadeTimerRef.current.forEach((t) => clearTimeout(t));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ===== Timer ===== */
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        doGameOver();
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ===== Game over ===== */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    cascadeTimerRef.current.forEach((t) => clearTimeout(t));
    cascadeTimerRef.current = [];
    setLocked(false);
    lockedRef.current = false;
    setPhase("over");

    if (!submittedRef.current) {
      submittedRef.current = true;
      const s = Math.floor(scoreRef.current);
      const r = submitScore(GAME_ID, s, `${maxComboRef.current}连击`);
      setResult(r);
      setRefreshKey((k) => k + 1);
      if (s > bestRef.current) {
        bestRef.current = s;
        setBestScore(s);
        try {
          localStorage.setItem(BEST_KEY, String(s));
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  /* ===== Cascade processing ===== */
  const processCascade = useCallback(
    (bd: Board, comboLevel: number) => {
      if (!runningRef.current || overRef.current) return;

      const groups = findMatchGroups(bd);
      if (groups.length === 0) {
        // No more matches
        comboRef.current = 0;
        setCombo(0);
        setClearingCells(new Set());

        // Check valid moves
        if (!hasValidMoves(bd)) {
          const reshuffled = generateBoard();
          boardRef.current = reshuffled;
          setBoard(reshuffled);
        }

        setLocked(false);
        lockedRef.current = false;
        return;
      }

      // Show clearing animation
      const clearSet = new Set<string>();
      for (const g of groups) {
        for (const [r, c] of g.cells) clearSet.add(`${r},${c}`);
      }
      setClearingCells(clearSet);

      // Process after a short delay for visual
      const t1 = setTimeout(() => {
        if (!runningRef.current || overRef.current) return;

        const { board: cleared, cleared: cnt, bombsCreated, bombExplosions } =
          processClear(bd, groups);

        // Scoring
        const basePoints = cnt * 10;
        const bombBonus = bombsCreated * 50 + bombExplosions * 100;
        const points = (basePoints + bombBonus) * comboLevel;
        scoreRef.current += points;
        if (comboLevel > maxComboRef.current) {
          maxComboRef.current = comboLevel;
          setMaxCombo(comboLevel);
        }
        setScore(scoreRef.current);
        setCombo(comboLevel);

        // Float score
        const fid = floatIdRef.current++;
        setFloatScore({ id: fid, value: points });
        setTimeout(() => {
          setFloatScore((prev) => (prev?.id === fid ? null : prev));
        }, 800);

        boardRef.current = cleared;
        setBoard(cleared);
        setClearingCells(new Set());

        // Apply gravity after delay
        const t2 = setTimeout(() => {
          if (!runningRef.current || overRef.current) return;
          const gravity = applyGravity(cleared);
          boardRef.current = gravity;
          setBoard(gravity);

          // Continue cascade
          const t3 = setTimeout(() => {
            processCascade(gravity, comboLevel + 1);
          }, 250);
          cascadeTimerRef.current.push(t3);
        }, 200);
        cascadeTimerRef.current.push(t2);
      }, 200);
      cascadeTimerRef.current.push(t1);
    },
    [],
  );

  /* ===== Handle cell click ===== */
  const handleClick = useCallback(
    (r: number, c: number) => {
      if (!runningRef.current || overRef.current || lockedRef.current) return;

      const sel = selectedRef.current;
      if (!sel) {
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      if (sel.r === r && sel.c === c) {
        // Deselect
        selectedRef.current = null;
        setSelected(null);
        return;
      }

      if (!areAdjacent(sel.r, sel.c, r, c)) {
        // Select new cell
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      // Attempt swap
      const swapped = swapCells(boardRef.current, sel.r, sel.c, r, c);
      const groups = findMatchGroups(swapped);

      if (groups.length === 0) {
        // No match, swap back with visual feedback
        setLocked(true);
        lockedRef.current = true;
        boardRef.current = swapped;
        setBoard(swapped);
        selectedRef.current = null;
        setSelected(null);

        const t = setTimeout(() => {
          const reverted = swapCells(boardRef.current, sel.r, sel.c, r, c);
          boardRef.current = reverted;
          setBoard(reverted);
          setLocked(false);
          lockedRef.current = false;
        }, 250);
        cascadeTimerRef.current.push(t);
        return;
      }

      // Valid swap, start cascade
      setLocked(true);
      lockedRef.current = true;
      selectedRef.current = null;
      setSelected(null);
      boardRef.current = swapped;
      setBoard(swapped);

      processCascade(swapped, 1);
    },
    [processCascade],
  );

  /* ===== Start game ===== */
  const start = useCallback(() => {
    const bd = generateBoard();
    boardRef.current = bd;
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    timeLeftRef.current = GAME_DURATION;
    overRef.current = false;
    runningRef.current = true;
    submittedRef.current = false;
    lockedRef.current = false;
    selectedRef.current = null;

    cascadeTimerRef.current.forEach((t) => clearTimeout(t));
    cascadeTimerRef.current = [];

    setBoard(bd);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);
    setSelected(null);
    setLocked(false);
    setResult(null);
    setClearingCells(new Set());
    setFloatScore(null);
    setPhase("playing");
  }, []);

  /* ===== Restart ===== */
  const restart = useCallback(() => {
    cascadeTimerRef.current.forEach((t) => clearTimeout(t));
    cascadeTimerRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    lockedRef.current = false;
    selectedRef.current = null;
    setPhase("idle");
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(GAME_DURATION);
    setSelected(null);
    setLocked(false);
    setResult(null);
    setClearingCells(new Set());
    setFloatScore(null);
  }, []);

  const timePercent = (timeLeft / GAME_DURATION) * 100;

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "连击", value: combo },
    { label: "最高连击", value: maxCombo },
    { label: "剩余", value: `${timeLeft}s` },
  ];

  /* ===== Loading state ===== */
  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="脑洞消消乐"
        description="Brainrot角色三消游戏！交换相邻梗角色，三个以上同款消除，连击越多分数越高。"
        instructions="点击两个相邻的梗角色进行交换，如果交换后形成3个或以上同款角色连线（横/竖），则消除得分。消除后方块下落，新方块从顶部填充。连锁消除可获得连击倍率加成。4连消除生成炸弹，炸弹被消除时引爆周围3×3区域！60秒倒计时挑战。"
        icon={FlaskConical}
        iconEmoji="🧪"
        iconGradient="from-violet-400 to-fuchsia-500"
        stats={stats}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="脑洞消消乐"
      description="Brainrot角色三消游戏！交换相邻梗角色，三个以上同款消除，连击越多分数越高。"
      instructions={`点击两个相邻的梗角色进行交换，形成3+同款连线即消除。
🐱🤖👽🦄🐸🐙 共6种角色。
消除后方块下落填充，连锁消除获得连击倍率加成。
4连消除生成炸弹💣，炸弹被消除时引爆周围3×3区域。
60秒倒计时，挑战最高分！
连击越高得分倍率越大：基础分 × 连击数。`}
      icon={FlaskConical}
      iconEmoji="🧪"
      iconGradient="from-violet-400 to-fuchsia-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes cell-pop {
          0% { opacity: 0; transform: scale(0.3); }
          60% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        .cell-pop { animation: cell-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes cell-clear {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); filter: brightness(2); }
          100% { opacity: 0; transform: scale(0); }
        }
        .cell-clear { animation: cell-clear 0.2s ease-out forwards; }
        @keyframes cell-drop {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .cell-drop { animation: cell-drop 0.25s ease-out forwards; }
        @keyframes bomb-pulse {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8); }
        }
        .bomb-pulse { animation: bomb-pulse 1s ease-in-out infinite; }
        @keyframes float-score-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
        }
        .float-score-up { animation: float-score-up 0.8s ease-out forwards; }
        @keyframes selected-pulse {
          0%, 100% { box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.6); }
          50% { box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.9); }
        }
        .selected-pulse { animation: selected-pulse 0.8s ease-in-out infinite; }
      `}</style>

      <div className="flex flex-col items-center max-w-[480px] mx-auto">
        {/* Timer bar */}
        <div className="w-full h-2.5 bg-[#27272a] rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${timePercent}%`,
              background:
                timePercent > 33
                  ? "linear-gradient(90deg, #8b5cf6, #d946ef)"
                  : "linear-gradient(90deg, #ef4444, #f59e0b)",
              boxShadow: "0 0 10px rgba(139, 92, 246, 0.4)",
            }}
          />
        </div>

        {/* Score & Combo */}
        <div className="flex items-center justify-between w-full mb-3 relative">
          <div className="text-left">
            <div className="text-xs text-slate-500">分数</div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            {combo >= 2 && (
              <div key={combo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-500/30">
                <Flame className="w-4 h-4 text-violet-400" />
                <span className="text-lg font-bold text-violet-300">{combo}x</span>
                <span className="text-xs text-violet-400/70">连击</span>
              </div>
            )}
            {floatScore && (
              <div
                key={floatScore.id}
                className="absolute left-1/2 top-0 -translate-x-1/2 float-score-up text-lg font-bold text-violet-300 pointer-events-none"
              >
                +{floatScore.value}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">最佳</div>
            <div className="text-lg font-bold text-amber-400 tabular-nums">{bestScore}</div>
          </div>
        </div>

        {/* Game board */}
        <div className="relative w-full">
          <div
            className="grid gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-xl bg-[#18181b] border border-[#27272a]"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r},${c}`;
                const isClearing = clearingCells.has(key);
                const isSelected = selected?.r === r && selected?.c === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    disabled={phase !== "playing" || locked}
                    className={`relative aspect-square rounded-lg flex items-center justify-center transition-all duration-150 cell-drop ${
                      cell
                        ? `bg-gradient-to-br ${EMOJI_COLORS[cell.type]} border ${
                            cell.bomb ? "border-red-500/60 bomb-pulse" : ""
                          } ${isSelected ? "selected-pulse ring-2 ring-violet-500" : ""} ${
                            isClearing ? "cell-clear" : ""
                          } hover:scale-110 active:scale-95 cursor-pointer`
                        : "bg-[#09090b]/40 border border-[#27272a]/50 cursor-default"
                    } ${phase !== "playing" || locked ? "cursor-default" : ""}`}
                  >
                    {cell && (
                      <>
                        <span className="text-lg sm:text-xl lg:text-2xl select-none">
                          {EMOJIS[cell.type]}
                        </span>
                        {cell.bomb && (
                          <span className="absolute -top-1 -right-1 text-xs">
                            <Bomb className="w-3.5 h-3.5 text-red-400" />
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              }),
            )}
          </div>

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <div className="text-5xl mb-3">🧪</div>
              <h3 className="text-xl font-bold mb-2 text-white">脑洞消消乐</h3>
              <p className="text-sm text-slate-400 mb-4 text-center px-4">
                交换相邻角色，消除3+同款得分
              </p>
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 rounded-xl transition-all shadow-lg shadow-violet-500/30 active:scale-95"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              {bestScore > 0 && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  最佳: <span className="text-amber-400 font-bold">{bestScore}</span>
                </div>
              )}
            </div>
          )}

          {/* Game over overlay */}
          {phase === "over" && result && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">{score >= bestScore && score > 0 ? "🏆" : "🧪"}</div>
              <h3 className="text-xl font-bold mb-1 text-white">
                {score >= bestScore && score > 0 ? "新纪录！" : "游戏结束"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-violet-400 mb-3">{score}</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs w-full max-w-[240px]">
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最高连击</div>
                  <div className="text-lg font-bold text-amber-400">{maxCombo}x</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最佳分</div>
                  <div className="text-lg font-bold text-violet-400">{bestScore}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3 bg-[#27272a]/60 rounded-lg px-3 py-2">
                排名第 <span className="font-bold text-violet-400">{result.rank}</span>/{result.total}
                ，超越了 <span className="font-bold text-violet-400">{result.beatPercent}%</span> 的玩家
              </p>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 rounded-xl transition-all shadow-lg shadow-violet-500/30 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        {phase === "playing" && (
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Bomb className="w-3 h-3 text-red-400" /> 4连生成炸弹
            </span>
            <span className="text-slate-600">|</span>
            <span>连击 × 倍率</span>
          </div>
        )}

        {phase === "playing" && (
          <button
            onClick={restart}
            className="mt-3 inline-flex items-center gap-2 h-9 px-4 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 结束游戏
          </button>
        )}
      </div>
    </GameShell>
  );
}
