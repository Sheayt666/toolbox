"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Play, Trophy, Flame, Calendar, Shuffle, Pause, Sparkles } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "triple-crush";
const BEST_KEY = "gm_triple_crush_best";
const GAME_DURATION = 60;
const ROWS = 8;
const COLS = 8;
const TYPES = 6;

/* ===== Candy colors ===== */
interface CandyColor {
  bg: string;
  glow: string;
  border: string;
  emoji: string;
}

const CANDY_COLORS: CandyColor[] = [
  { bg: "radial-gradient(circle at 35% 30%, #fca5a5 0%, #ef4444 55%, #991b1b 100%)", glow: "rgba(239,68,68,0.6)", border: "#ef4444", emoji: "🍓" },
  { bg: "radial-gradient(circle at 35% 30%, #93c5fd 0%, #3b82f6 55%, #1e3a8a 100%)", glow: "rgba(59,130,246,0.6)", border: "#3b82f6", emoji: "🫐" },
  { bg: "radial-gradient(circle at 35% 30%, #86efac 0%, #22c55e 55%, #14532d 100%)", glow: "rgba(34,197,94,0.6)", border: "#22c55e", emoji: "🍏" },
  { bg: "radial-gradient(circle at 35% 30%, #fde68a 0%, #eab308 55%, #713f12 100%)", glow: "rgba(234,179,8,0.6)", border: "#eab308", emoji: "🍋" },
  { bg: "radial-gradient(circle at 35% 30%, #d8b4fe 0%, #a855f7 55%, #581c87 100%)", glow: "rgba(168,85,247,0.6)", border: "#a855f7", emoji: "🍇" },
  { bg: "radial-gradient(circle at 35% 30%, #fdba74 0%, #f97316 55%, #7c2d12 100%)", glow: "rgba(249,115,22,0.6)", border: "#f97316", emoji: "🍊" },
];

/* ===== Seeded RNG ===== */
function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailySeed(): number {
  const today = new Date().toISOString().slice(0, 10);
  return parseInt(today.replace(/-/g, ""), 10);
}

/* ===== Types ===== */
interface Cell {
  type: number;
  id: number;
  special?: "line" | "rainbow";
}

type Board = (Cell | null)[][];

interface MatchGroup {
  cells: [number, number][];
  length: number;
}

/* ===== Board utilities ===== */
function generateBoard(rng: () => number = Math.random): Board {
  const board: Board = Array.from({ length: ROWS }, () =>
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
        (c >= 2 && board[r][c - 1]?.type === type && board[r][c - 2]?.type === type) ||
        (r >= 2 && board[r - 1][c]?.type === type && board[r - 2][c]?.type === type)
      );
      board[r][c] = { type, id: id++ };
    }
  }
  return board;
}

function findMatchGroups(board: Board): MatchGroup[] {
  const groups: MatchGroup[] = [];
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let start = 0;
    for (let c = 1; c <= COLS; c++) {
      if (c < COLS && board[r][c] && board[r][start] && board[r][c]!.type === board[r][start]!.type) {
        continue;
      }
      const len = c - start;
      if (len >= 3) {
        const cells: [number, number][] = [];
        for (let i = start; i < c; i++) cells.push([r, i]);
        groups.push({ cells, length: len });
      }
      start = c;
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    let start = 0;
    for (let r = 1; r <= ROWS; r++) {
      if (r < ROWS && board[r][c] && board[start][c] && board[r][c]!.type === board[start][c]!.type) {
        continue;
      }
      const len = r - start;
      if (len >= 3) {
        const cells: [number, number][] = [];
        for (let i = start; i < r; i++) cells.push([i, c]);
        groups.push({ cells, length: len });
      }
      start = r;
    }
  }
  return groups;
}

function swapCells(board: Board, r1: number, c1: number, r2: number, c2: number): Board {
  const nb: Board = board.map((row) => row.map((c) => (c ? { ...c } : null)));
  const tmp = nb[r1][c1];
  nb[r1][c1] = nb[r2][c2];
  nb[r2][c2] = tmp;
  return nb;
}

function areAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
}

function hasValidMoves(board: Board): boolean {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (c < COLS - 1) {
        const swapped = swapCells(board, r, c, r, c + 1);
        if (findMatchGroups(swapped).length > 0) return true;
      }
      if (r < ROWS - 1) {
        const swapped = swapCells(board, r, c, r + 1, c);
        if (findMatchGroups(swapped).length > 0) return true;
      }
    }
  }
  return false;
}

function applyGravity(board: Board, rng: () => number = Math.random): Board {
  const nb: Board = Array.from({ length: ROWS }, () =>
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
  specialsCreated: number;
  specialActivations: number;
}

function processClear(board: Board, groups: MatchGroup[]): ClearResult {
  const nb: Board = board.map((row) => row.map((c) => (c ? { ...c } : null)));
  const matched = new Set<string>();
  for (const g of groups) {
    for (const [r, c] of g.cells) matched.add(`${r},${c}`);
  }

  // Activate specials (BFS chain)
  const activated = new Set<string>();
  const queue: string[] = [];
  for (const key of matched) {
    const [r, c] = key.split(",").map(Number);
    if (nb[r][c]?.special) {
      activated.add(key);
      queue.push(key);
    }
  }

  let specialActivations = 0;
  while (queue.length > 0) {
    const key = queue.shift()!;
    specialActivations++;
    const [r, c] = key.split(",").map(Number);
    const cell = nb[r][c];
    if (!cell) continue;
    if (cell.special === "line") {
      for (let i = 0; i < COLS; i++) {
        const nkey = `${r},${i}`;
        matched.add(nkey);
        if (nb[r][i]?.special && !activated.has(nkey)) { activated.add(nkey); queue.push(nkey); }
      }
      for (let i = 0; i < ROWS; i++) {
        const nkey = `${i},${c}`;
        matched.add(nkey);
        if (nb[i][c]?.special && !activated.has(nkey)) { activated.add(nkey); queue.push(nkey); }
      }
    } else if (cell.special === "rainbow") {
      const targetType = cell.type;
      for (let rr = 0; rr < ROWS; rr++) {
        for (let cc = 0; cc < COLS; cc++) {
          if (nb[rr][cc]?.type === targetType) {
            const nkey = `${rr},${cc}`;
            matched.add(nkey);
            if (nb[rr][cc]?.special && !activated.has(nkey)) { activated.add(nkey); queue.push(nkey); }
          }
        }
      }
    }
  }

  // Create specials for 4+ matches
  let specialsCreated = 0;
  for (const g of groups) {
    if (g.length >= 5) {
      for (const [r, c] of g.cells) {
        const key = `${r},${c}`;
        if (nb[r][c] && !activated.has(key)) {
          nb[r][c] = { ...nb[r][c]!, special: "rainbow" };
          matched.delete(key);
          specialsCreated++;
          break;
        }
      }
    } else if (g.length >= 4) {
      for (const [r, c] of g.cells) {
        const key = `${r},${c}`;
        if (nb[r][c] && !activated.has(key)) {
          nb[r][c] = { ...nb[r][c]!, special: "line" };
          matched.delete(key);
          specialsCreated++;
          break;
        }
      }
    }
  }

  // Clear matched
  let cleared = 0;
  for (const key of matched) {
    const [r, c] = key.split(",").map(Number);
    if (nb[r][c]) { nb[r][c] = null; cleared++; }
  }
  return { board: nb, cleared, specialsCreated, specialActivations };
}

/* ===== Component ===== */
export default function TripleCrushPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [board, setBoard] = useState<Board>(() =>
    Array.from({ length: ROWS }, () => Array<Cell | null>(COLS).fill(null)),
  );
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [chains, setChains] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [bestScore, setBestScore] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [floatScore, setFloatScore] = useState<{ id: number; value: number } | null>(null);
  const [dailyMode, setDailyMode] = useState(false);
  const [reshuffling, setReshuffling] = useState(false);
  const [paused, setPaused] = useState(false);

  // Refs
  const boardRef = useRef<Board>(board);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const chainsRef = useRef(0);
  const timeLeftRef = useRef(GAME_DURATION);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const lockedRef = useRef(false);
  const selectedRef = useRef<{ r: number; c: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const cascadeTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const floatIdRef = useRef(0);
  const rngRef = useRef<(() => number) | null>(null);
  const pausedRef = useRef(false);
  const dragStartRef = useRef<{ r: number; c: number; x: number; y: number } | null>(null);

  /* ===== Mount: load best ===== */
  useEffect(() => {
    setMounted(true);
    try {
      const b = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (b > 0) { bestRef.current = b; setBestScore(b); }
    } catch { /* ignore */ }
  }, []);

  /* ===== Cleanup on unmount ===== */
  useEffect(() => {
    return () => {
      cascadeTimersRef.current.forEach(clearTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ===== Pause hotkey (P) ===== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") {
          setPaused((p) => { pausedRef.current = !p; return !p; });
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase]);

  /* ===== Timer ===== */
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) doGameOver();
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ===== Game over ===== */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    cascadeTimersRef.current.forEach(clearTimeout);
    cascadeTimersRef.current = [];
    setLocked(false); lockedRef.current = false;
    setPhase("over");
    if (!submittedRef.current) {
      submittedRef.current = true;
      const s = Math.floor(scoreRef.current);
      void submitScore(GAME_ID, s);
      setRefreshKey((k) => k + 1);
      if (s > bestRef.current) {
        bestRef.current = s; setBestScore(s);
        try { localStorage.setItem(BEST_KEY, String(s)); } catch { /* ignore */ }
      }
    }
  }, []);

  /* ===== Cascade processing ===== */
  const processCascade = useCallback((bd: Board, comboLevel: number) => {
    if (!runningRef.current || overRef.current) return;
    const groups = findMatchGroups(bd);
    if (groups.length === 0) {
      comboRef.current = 0;
      setCombo(0);
      setClearingCells(new Set());
      if (!hasValidMoves(bd)) {
        setReshuffling(true); setLocked(true); lockedRef.current = true;
        const rng = rngRef.current || Math.random;
        const t = setTimeout(() => {
          const reshuffled = generateBoard(rng);
          boardRef.current = reshuffled; setBoard(reshuffled);
          setReshuffling(false); setLocked(false); lockedRef.current = false;
        }, 600);
        cascadeTimersRef.current.push(t);
      } else {
        setLocked(false); lockedRef.current = false;
      }
      return;
    }
    const clearSet = new Set<string>();
    for (const g of groups) for (const [r, c] of g.cells) clearSet.add(`${r},${c}`);
    setClearingCells(clearSet);

    const t1 = setTimeout(() => {
      if (!runningRef.current || overRef.current) return;
      const { board: cleared, cleared: cnt, specialsCreated, specialActivations } = processClear(bd, groups);
      const basePoints = cnt * 20;
      const specialBonus = specialsCreated * 150 + specialActivations * 250;
      const points = (basePoints + specialBonus) * comboLevel;
      scoreRef.current += points;
      chainsRef.current += 1;
      if (comboLevel > maxComboRef.current) { maxComboRef.current = comboLevel; setMaxCombo(comboLevel); }
      setScore(scoreRef.current); setCombo(comboLevel); setChains(chainsRef.current);
      const fid = floatIdRef.current++;
      setFloatScore({ id: fid, value: points });
      const ft = setTimeout(() => setFloatScore((prev) => (prev?.id === fid ? null : prev)), 800);
      cascadeTimersRef.current.push(ft);
      boardRef.current = cleared; setBoard(cleared); setClearingCells(new Set());

      const t2 = setTimeout(() => {
        if (!runningRef.current || overRef.current) return;
        const rng = rngRef.current || Math.random;
        const gravity = applyGravity(cleared, rng);
        boardRef.current = gravity; setBoard(gravity);
        const t3 = setTimeout(() => processCascade(gravity, comboLevel + 1), 250);
        cascadeTimersRef.current.push(t3);
      }, 250);
      cascadeTimersRef.current.push(t2);
    }, 200);
    cascadeTimersRef.current.push(t1);
  }, []);

  /* ===== Try swap ===== */
  const trySwap = useCallback((r1: number, c1: number, r2: number, c2: number) => {
    if (!runningRef.current || overRef.current || lockedRef.current || pausedRef.current) return;
    if (!areAdjacent(r1, c1, r2, c2)) return;
    const cellA = boardRef.current[r1][c1];
    const cellB = boardRef.current[r2][c2];
    const hasSpecial = cellA?.special || cellB?.special;
    const swapped = swapCells(boardRef.current, r1, c1, r2, c2);
    const groups = findMatchGroups(swapped);
    if (groups.length === 0 && !hasSpecial) {
      setLocked(true); lockedRef.current = true;
      boardRef.current = swapped; setBoard(swapped);
      selectedRef.current = null; setSelected(null);
      const t = setTimeout(() => {
        const reverted = swapCells(boardRef.current, r1, c1, r2, c2);
        boardRef.current = reverted; setBoard(reverted);
        setLocked(false); lockedRef.current = false;
      }, 250);
      cascadeTimersRef.current.push(t);
      return;
    }
    setLocked(true); lockedRef.current = true;
    selectedRef.current = null; setSelected(null);
    boardRef.current = swapped; setBoard(swapped);
    if (groups.length === 0 && hasSpecial) {
      const syntheticGroup: MatchGroup = { cells: [[r1, c1], [r2, c2]], length: 2 };
      const t = setTimeout(() => {
        if (!runningRef.current || overRef.current) return;
        const { board: cleared, cleared: cnt, specialActivations } = processClear(swapped, [syntheticGroup]);
        const points = (cnt * 20 + specialActivations * 250) * 1;
        scoreRef.current += points; setScore(scoreRef.current);
        boardRef.current = cleared; setBoard(cleared);
        const t2 = setTimeout(() => {
          if (!runningRef.current || overRef.current) return;
          const rng = rngRef.current || Math.random;
          const gravity = applyGravity(cleared, rng);
          boardRef.current = gravity; setBoard(gravity);
          const t3 = setTimeout(() => processCascade(gravity, 2), 250);
          cascadeTimersRef.current.push(t3);
        }, 250);
        cascadeTimersRef.current.push(t2);
      }, 150);
      cascadeTimersRef.current.push(t);
      return;
    }
    processCascade(swapped, 1);
  }, [processCascade]);

  /* ===== Handle click ===== */
  const handleClick = useCallback((r: number, c: number) => {
    if (!runningRef.current || overRef.current || lockedRef.current || pausedRef.current) return;
    const sel = selectedRef.current;
    if (!sel) { selectedRef.current = { r, c }; setSelected({ r, c }); return; }
    if (sel.r === r && sel.c === c) { selectedRef.current = null; setSelected(null); return; }
    if (!areAdjacent(sel.r, sel.c, r, c)) { selectedRef.current = { r, c }; setSelected({ r, c }); return; }
    trySwap(sel.r, sel.c, r, c);
  }, [trySwap]);

  /* ===== Drag handlers ===== */
  const handlePointerDown = useCallback((r: number, c: number, e: React.PointerEvent) => {
    if (!runningRef.current || overRef.current || lockedRef.current || pausedRef.current) return;
    dragStartRef.current = { r, c, x: e.clientX, y: e.clientY };
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const start = dragStartRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const threshold = 15;
    dragStartRef.current = null;
    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      let tr = start.r, tc = start.c;
      if (Math.abs(dx) > Math.abs(dy)) { tc += dx > 0 ? 1 : -1; }
      else { tr += dy > 0 ? 1 : -1; }
      if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) {
        selectedRef.current = null; setSelected(null);
        trySwap(start.r, start.c, tr, tc);
      }
    }
  }, [trySwap]);

  /* ===== Start ===== */
  const start = useCallback(() => {
    rngRef.current = dailyMode ? mulberry32(getDailySeed()) : null;
    const rng = rngRef.current || Math.random;
    const bd = generateBoard(rng);
    boardRef.current = bd;
    scoreRef.current = 0; comboRef.current = 0; maxComboRef.current = 0;
    chainsRef.current = 0; timeLeftRef.current = GAME_DURATION;
    overRef.current = false; runningRef.current = true; submittedRef.current = false;
    lockedRef.current = false; selectedRef.current = null; pausedRef.current = false;
    cascadeTimersRef.current.forEach(clearTimeout); cascadeTimersRef.current = [];
    setBoard(bd); setScore(0); setCombo(0); setMaxCombo(0); setChains(0);
    setTimeLeft(GAME_DURATION); setSelected(null); setLocked(false);
    setClearingCells(new Set()); setFloatScore(null); setReshuffling(false);
    setPaused(false); setPhase("playing");
  }, [dailyMode]);

  /* ===== Restart ===== */
  const restart = useCallback(() => {
    cascadeTimersRef.current.forEach(clearTimeout); cascadeTimersRef.current = [];
    if (timerRef.current) clearInterval(timerRef.current);
    overRef.current = false; runningRef.current = false; submittedRef.current = false;
    lockedRef.current = false; selectedRef.current = null; pausedRef.current = false;
    setPhase("idle"); setScore(0); setCombo(0); setMaxCombo(0); setChains(0);
    setTimeLeft(GAME_DURATION); setSelected(null); setLocked(false);
    setClearingCells(new Set()); setFloatScore(null); setReshuffling(false); setPaused(false);
  }, []);

  const timePercent = (timeLeft / GAME_DURATION) * 100;

  const stats: GameStat[] = [
    { label: "分数", value: score, icon: "🍬" },
    { label: "连锁", value: chains, icon: "⚡" },
    { label: "最高连锁", value: maxCombo, icon: "🔥" },
    { label: "倒计时", value: `${timeLeft}s`, icon: "⏱️" },
  ];

  if (!mounted) {
    return (
      <GameShell gameId={GAME_ID} title="三连粉碎" iconEmoji="🍬" iconGradient="from-orange-400 to-pink-500"
        stats={stats} shareScore={0} refreshKey={0}>
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId={GAME_ID} title="三连粉碎" iconEmoji="🍬" iconGradient="from-orange-400 to-pink-500"
      stats={stats} shareScore={score} refreshKey={refreshKey}>
      <style>{`
        @keyframes tc-drop { 0% { opacity: 0; transform: translateY(-25px); } 100% { opacity: 1; transform: translateY(0); } }
        .tc-drop { animation: tc-drop 0.3s ease-out forwards; }
        @keyframes tc-clear { 0% { opacity: 1; transform: scale(1); filter: brightness(1); } 40% { opacity: 0.9; transform: scale(1.35); filter: brightness(2.5); } 100% { opacity: 0; transform: scale(0); filter: brightness(3); } }
        .tc-clear { animation: tc-clear 0.25s ease-out forwards; }
        @keyframes tc-float { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(1.5); } }
        .tc-float { animation: tc-float 0.8s ease-out forwards; }
        @keyframes tc-sel { 0%, 100% { box-shadow: 0 0 0 3px rgba(251,146,60,0.5), 0 0 12px rgba(251,146,60,0.3); } 50% { box-shadow: 0 0 0 4px rgba(251,146,60,0.8), 0 0 20px rgba(251,146,60,0.5); } }
        .tc-sel { animation: tc-sel 0.7s ease-in-out infinite; }
        @keyframes tc-special { 0%, 100% { box-shadow: 0 0 8px currentColor; } 50% { box-shadow: 0 0 20px currentColor, 0 0 35px currentColor; } }
        .tc-special { animation: tc-special 0.8s ease-in-out infinite; }
        @keyframes tc-rainbow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .tc-rainbow { animation: tc-rainbow 2s linear infinite; }
      `}</style>

      <div className="flex flex-col items-center max-w-[440px] mx-auto p-4" onPointerUp={handlePointerUp}>
        {/* Timer bar */}
        <div className="w-full h-2.5 bg-[#27272a] rounded-full mb-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${timePercent}%`, background: timePercent > 33 ? "linear-gradient(90deg, #fb923c, #ec4899)" : "linear-gradient(90deg, #ef4444, #f59e0b)", boxShadow: "0 0 10px rgba(251,146,60,0.4)" }} />
        </div>

        {/* Score row */}
        <div className="flex items-center justify-between w-full mb-3 relative">
          <div className="text-left">
            <div className="text-xs text-slate-500">分数</div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            {combo >= 2 && (
              <div key={combo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-lg font-bold text-orange-300">{combo}x</span>
                <span className="text-xs text-orange-400/70">连锁</span>
              </div>
            )}
            {floatScore && (
              <div key={floatScore.id} className="tc-float text-lg font-bold text-orange-300 pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
                +{floatScore.value}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">最佳</div>
            <div className="text-lg font-bold text-amber-400 tabular-nums">{bestScore}</div>
          </div>
        </div>

        {/* Board */}
        <div className="relative w-full">
          <div className="grid gap-1 sm:gap-1.5 p-2 sm:p-3 rounded-xl bg-[#18181b] border border-[#27272a] touch-none select-none"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
            {board.map((row, r) => row.map((cell, c) => {
              const key = `${r},${c}`;
              const isClearing = clearingCells.has(key);
              const isSelected = selected?.r === r && selected?.c === c;
              const cc = cell ? CANDY_COLORS[cell.type] : null;
              return (
                <button key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  onPointerDown={(e) => handlePointerDown(r, c, e)}
                  disabled={phase !== "playing" || locked || paused}
                  aria-label={`糖果 行${r + 1}列${c + 1}`}
                  className={`relative aspect-square rounded-lg flex items-center justify-center transition-all duration-150 ${
                    cell ? "tc-drop cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"
                  } ${isSelected ? "tc-sel z-10" : ""} ${isClearing ? "tc-clear" : ""}`}
                  style={cell && cc ? {
                    background: cell.special === "rainbow"
                      ? "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #f97316, #ef4444)"
                      : cc.bg,
                    boxShadow: cell.special ? `0 0 12px ${cc.glow}, inset 0 0 10px rgba(255,255,255,0.3)` : `inset 0 0 8px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.3)`,
                    border: cell.special ? `2px solid ${cc.border}` : "1px solid rgba(255,255,255,0.1)",
                  } : { background: "rgba(9,9,11,0.4)", border: "1px solid rgba(39,39,42,0.5)" }}>
                  {cell && (
                    <>
                      <span className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-white/40 blur-[1px] pointer-events-none" />
                      <span className="text-base sm:text-lg pointer-events-none select-none">{cc!.emoji}</span>
                      {cell.special === "line" && (
                        <span className="absolute inset-0 flex items-center justify-center tc-special" style={{ color: cc!.border }}>
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M12 2v20M2 12h20" /></svg>
                        </span>
                      )}
                      {cell.special === "rainbow" && (
                        <span className="absolute inset-0 flex items-center justify-center tc-rainbow">
                          <Sparkles className="w-3.5 h-3.5 text-white drop-shadow-lg" />
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            }))}
          </div>

          {/* Reshuffling */}
          {reshuffling && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Shuffle className="w-8 h-8 text-orange-400 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-orange-300">无可行操作，重新洗牌...</p>
              </div>
            </div>
          )}

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-5xl mb-3">🍬</div>
              <h3 className="text-xl font-bold mb-2 text-white">三连粉碎</h3>
              <p className="text-sm text-slate-400 mb-4 text-center px-4 max-w-[300px]">
                拖拽或点击交换相邻糖果，三个以上同色消除！4连生成条纹糖，5连生成彩虹糖。60秒限时挑战。
              </p>
              <div className="flex gap-2 mb-4">
                <button onClick={() => setDailyMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!dailyMode ? "bg-orange-500/20 border border-orange-500/40 text-orange-300" : "bg-[#27272a] border border-[#3f3f46] text-slate-400"}`}>
                  <Shuffle className="w-3 h-3 inline mr-1" /> 随机模式
                </button>
                <button onClick={() => setDailyMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dailyMode ? "bg-orange-500/20 border border-orange-500/40 text-orange-300" : "bg-[#27272a] border border-[#3f3f46] text-slate-400"}`}>
                  <Calendar className="w-3 h-3 inline mr-1" /> 每日挑战
                </button>
              </div>
              <button onClick={start} aria-label="开始游戏"
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95">
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              {bestScore > 0 && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                  <Trophy className="w-3 h-3 text-amber-400" /> 最佳: <span className="text-amber-400 font-bold">{bestScore}</span>
                </div>
              )}
            </div>
          )}

          {/* Game over */}
          {phase === "over" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
              <div className="text-5xl mb-3">{score >= bestScore && score > 0 ? "🏆" : "🍬"}</div>
              <h3 className="text-xl font-bold mb-1 text-white">{score >= bestScore && score > 0 ? "新纪录！" : "游戏结束"}</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-orange-400 mb-3">{score}</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs w-full max-w-[240px]">
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2"><div className="text-slate-500">总连锁</div><div className="text-lg font-bold text-amber-400">{chains}</div></div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2"><div className="text-slate-500">最高连锁</div><div className="text-lg font-bold text-orange-400">{maxCombo}x</div></div>
              </div>
              <button onClick={restart} aria-label="再来一局"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95">
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}

          {/* Pause */}
          {phase === "playing" && paused && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Pause className="w-12 h-12 text-orange-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">已暂停</h3>
              <p className="text-sm text-slate-400 mb-4">按 P 键或点击按钮继续</p>
              <button onClick={() => { pausedRef.current = false; setPaused(false); }} aria-label="继续游戏"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 rounded-xl transition-all shadow-lg shadow-orange-500/30 active:scale-95">
                <Play className="w-4 h-4" /> 继续游戏
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        {phase === "playing" && (
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => { pausedRef.current = true; setPaused(true); }} aria-label="暂停游戏"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-orange-400 bg-[#18181b] border border-[#27272a] hover:border-orange-500/30 rounded-lg transition-colors">
              <Pause className="w-3.5 h-3.5" /> 暂停
            </button>
            <button onClick={restart} aria-label="结束游戏"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> 结束游戏
            </button>
          </div>
        )}

        {/* Legend */}
        {phase === "playing" && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-gradient-to-br from-white/40 to-white/10 border border-orange-400/50"></span>4连 → 条纹糖</span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-fuchsia-400" />5连 → 彩虹糖</span>
            <span className="text-slate-600">|</span>
            <span>拖拽或点击交换</span>
          </div>
        )}
      </div>
    </GameShell>
  );
}
