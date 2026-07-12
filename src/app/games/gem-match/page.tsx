"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gem, RotateCcw, Play, Trophy, Flame, Sparkles, Calendar, Shuffle, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "gem-match";
const BEST_KEY = "gm_gem_match_best";
const DAILY_KEY = "gm_gem_match_daily_best";
const GAME_DURATION = 90;
const ROWS = 8;
const COLS = 8;
const TYPES = 6;

/* ===== Gem colors ===== */
interface GemColor {
  name: string;
  bg: string;
  glow: string;
  border: string;
  text: string;
}

const GEM_COLORS: GemColor[] = [
  { name: "红", bg: "radial-gradient(circle at 30% 25%, #fca5a5 0%, #ef4444 50%, #991b1b 100%)", glow: "rgba(239,68,68,0.5)", border: "#ef4444", text: "#fca5a5" },
  { name: "蓝", bg: "radial-gradient(circle at 30% 25%, #93c5fd 0%, #3b82f6 50%, #1e3a8a 100%)", glow: "rgba(59,130,246,0.5)", border: "#3b82f6", text: "#93c5fd" },
  { name: "绿", bg: "radial-gradient(circle at 30% 25%, #86efac 0%, #22c55e 50%, #14532d 100%)", glow: "rgba(34,197,94,0.5)", border: "#22c55e", text: "#86efac" },
  { name: "黄", bg: "radial-gradient(circle at 30% 25%, #fde68a 0%, #eab308 50%, #713f12 100%)", glow: "rgba(234,179,8,0.5)", border: "#eab308", text: "#fde68a" },
  { name: "紫", bg: "radial-gradient(circle at 30% 25%, #d8b4fe 0%, #a855f7 50%, #581c87 100%)", glow: "rgba(168,85,247,0.5)", border: "#a855f7", text: "#d8b4fe" },
  { name: "橙", bg: "radial-gradient(circle at 30% 25%, #fdba74 0%, #f97316 50%, #7c2d12 100%)", glow: "rgba(249,115,22,0.5)", border: "#f97316", text: "#fdba74" },
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
  special?: "line" | "color";
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
  specialsCreated: number;
  specialActivations: number;
}

function processClear(board: Board, groups: MatchGroup[]): ClearResult {
  const nb: Board = board.map((row) => row.map((c) => (c ? { ...c } : null)));

  const matched = new Set<string>();
  for (const g of groups) {
    for (const [r, c] of g.cells) matched.add(`${r},${c}`);
  }

  // Activate specials in matched set (BFS chain reaction)
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
      // Clear entire row and column
      for (let i = 0; i < COLS; i++) {
        const nkey = `${r},${i}`;
        matched.add(nkey);
        if (nb[r][i]?.special && !activated.has(nkey)) {
          activated.add(nkey);
          queue.push(nkey);
        }
      }
      for (let i = 0; i < ROWS; i++) {
        const nkey = `${i},${c}`;
        matched.add(nkey);
        if (nb[i][c]?.special && !activated.has(nkey)) {
          activated.add(nkey);
          queue.push(nkey);
        }
      }
    } else if (cell.special === "color") {
      // Clear all gems of the same type
      const targetType = cell.type;
      for (let rr = 0; rr < ROWS; rr++) {
        for (let cc = 0; cc < COLS; cc++) {
          if (nb[rr][cc]?.type === targetType) {
            const nkey = `${rr},${cc}`;
            matched.add(nkey);
            if (nb[rr][cc]?.special && !activated.has(nkey)) {
              activated.add(nkey);
              queue.push(nkey);
            }
          }
        }
      }
    }
  }

  // Create specials for 4+ matches
  let specialsCreated = 0;
  for (const g of groups) {
    if (g.length >= 5) {
      // Color bomb
      for (const [r, c] of g.cells) {
        const key = `${r},${c}`;
        if (nb[r][c] && !activated.has(key)) {
          nb[r][c] = { ...nb[r][c]!, special: "color" };
          matched.delete(key);
          specialsCreated++;
          break;
        }
      }
    } else if (g.length >= 4) {
      // Line clearer
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

  // Clear all matched cells
  let cleared = 0;
  for (const key of matched) {
    const [r, c] = key.split(",").map(Number);
    if (nb[r][c]) {
      nb[r][c] = null;
      cleared++;
    }
  }

  return { board: nb, cleared, specialsCreated, specialActivations };
}

/* ===== Component ===== */
export default function GemMatchPage() {
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
  const [dailyMode, setDailyMode] = useState(false);
  const [reshuffling, setReshuffling] = useState(false);
  const [paused, setPaused] = useState(false);

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
  const rngRef = useRef<(() => number) | null>(null);
  const pausedRef = useRef(false);

  /* ===== Mount: load best scores ===== */
  useEffect(() => {
    setMounted(true);
    try {
      const key = BEST_KEY;
      const b = parseInt(localStorage.getItem(key) || "0", 10) || 0;
      if (b > 0) {
        bestRef.current = b;
        setBestScore(b);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== Cleanup on unmount ===== */
  useEffect(() => {
    return () => {
      cascadeTimerRef.current.forEach((t) => clearTimeout(t));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ===== Pause hotkey (P) ===== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") {
          setPaused((p) => {
            pausedRef.current = !p;
            return !p;
          });
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
          const key = BEST_KEY;
          localStorage.setItem(key, String(s));
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
        comboRef.current = 0;
        setCombo(0);
        setClearingCells(new Set());

        if (!hasValidMoves(bd)) {
          setReshuffling(true);
          setLocked(true);
          lockedRef.current = true;
          const rng = rngRef.current || Math.random;
          const t = setTimeout(() => {
            const reshuffled = generateBoard(rng);
            boardRef.current = reshuffled;
            setBoard(reshuffled);
            setReshuffling(false);
            setLocked(false);
            lockedRef.current = false;
          }, 600);
          cascadeTimerRef.current.push(t);
        } else {
          setLocked(false);
          lockedRef.current = false;
        }
        return;
      }

      const clearSet = new Set<string>();
      for (const g of groups) {
        for (const [r, c] of g.cells) clearSet.add(`${r},${c}`);
      }
      setClearingCells(clearSet);

      const t1 = setTimeout(() => {
        if (!runningRef.current || overRef.current) return;

        const { board: cleared, cleared: cnt, specialsCreated, specialActivations } =
          processClear(bd, groups);

        const basePoints = cnt * 15;
        const specialBonus = specialsCreated * 100 + specialActivations * 200;
        const points = (basePoints + specialBonus) * comboLevel;
        scoreRef.current += points;
        if (comboLevel > maxComboRef.current) {
          maxComboRef.current = comboLevel;
          setMaxCombo(comboLevel);
        }
        setScore(scoreRef.current);
        setCombo(comboLevel);

        const fid = floatIdRef.current++;
        setFloatScore({ id: fid, value: points });
        const ft = setTimeout(() => {
          setFloatScore((prev) => (prev?.id === fid ? null : prev));
        }, 800);
        cascadeTimerRef.current.push(ft);

        boardRef.current = cleared;
        setBoard(cleared);
        setClearingCells(new Set());

        const t2 = setTimeout(() => {
          if (!runningRef.current || overRef.current) return;
          const rng = rngRef.current || Math.random;
          const gravity = applyGravity(cleared, rng);
          boardRef.current = gravity;
          setBoard(gravity);

          const t3 = setTimeout(() => {
            processCascade(gravity, comboLevel + 1);
          }, 250);
          cascadeTimerRef.current.push(t3);
        }, 250);
        cascadeTimerRef.current.push(t2);
      }, 200);
      cascadeTimerRef.current.push(t1);
    },
    [],
  );

  /* ===== Handle cell click ===== */
  const handleClick = useCallback(
    (r: number, c: number) => {
      if (!runningRef.current || overRef.current || lockedRef.current || pausedRef.current) return;

      const sel = selectedRef.current;
      if (!sel) {
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      if (sel.r === r && sel.c === c) {
        selectedRef.current = null;
        setSelected(null);
        return;
      }

      if (!areAdjacent(sel.r, sel.c, r, c)) {
        selectedRef.current = { r, c };
        setSelected({ r, c });
        return;
      }

      // Check if a special gem is being swapped (always allow special swaps)
      const cellA = boardRef.current[sel.r][sel.c];
      const cellB = boardRef.current[r][c];
      const hasSpecial = cellA?.special || cellB?.special;

      const swapped = swapCells(boardRef.current, sel.r, sel.c, r, c);
      const groups = findMatchGroups(swapped);

      if (groups.length === 0 && !hasSpecial) {
        // No match, swap back
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

      // If no groups but has special, create a synthetic match for the special
      if (groups.length === 0 && hasSpecial) {
        // The special gem itself is "matched" (activated by swap)
        const syntheticGroup: MatchGroup = {
          cells: [[r, c]],
          length: 1,
          direction: "h",
        };
        // Process with synthetic group
        const t = setTimeout(() => {
          if (!runningRef.current || overRef.current) return;
          const { board: cleared, cleared: cnt, specialActivations } =
            processClear(swapped, [syntheticGroup]);
          const points = (cnt * 15 + specialActivations * 200) * 1;
          scoreRef.current += points;
          setScore(scoreRef.current);
          boardRef.current = cleared;
          setBoard(cleared);

          const t2 = setTimeout(() => {
            if (!runningRef.current || overRef.current) return;
            const rng = rngRef.current || Math.random;
            const gravity = applyGravity(cleared, rng);
            boardRef.current = gravity;
            setBoard(gravity);
            const t3 = setTimeout(() => {
              processCascade(gravity, 2);
            }, 250);
            cascadeTimerRef.current.push(t3);
          }, 250);
          cascadeTimerRef.current.push(t2);
        }, 150);
        cascadeTimerRef.current.push(t);
        return;
      }

      processCascade(swapped, 1);
    },
    [processCascade],
  );

  /* ===== Start game ===== */
  const start = useCallback(() => {
    if (dailyMode) {
      rngRef.current = mulberry32(getDailySeed());
    } else {
      rngRef.current = null;
    }
    const rng = rngRef.current || Math.random;
    const bd = generateBoard(rng);
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
    pausedRef.current = false;

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
    setReshuffling(false);
    setPaused(false);
    setPhase("playing");
  }, [dailyMode]);

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
    pausedRef.current = false;
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
    setReshuffling(false);
    setPaused(false);
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
        title="宝石迷阵"
        description="经典三消宝石游戏！交换相邻宝石，三个以上同色消除，连锁获得连击加成。4连生成闪电，5连生成彩色炸弹！"
        instructions="点击两个相邻的宝石进行交换，形成3+同色连线即消除。消除后宝石下落填充，连锁消除获得连击倍率加成。4连生成闪电特殊宝石（激活时清除整行整列），5连生成彩色炸弹（激活时清除所有同色宝石）。无可行操作时自动洗牌。90秒倒计时挑战。"
        icon={Gem}
        iconEmoji="💎"
        iconGradient="from-cyan-400 to-teal-500"
        stats={stats}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="宝石迷阵"
      description="经典三消宝石游戏！交换相邻宝石，三个以上同色消除，连锁获得连击加成。4连生成闪电，5连生成彩色炸弹！"
      instructions={`点击两个相邻的宝石进行交换，形成3+同色连线即消除。
6种颜色：红 蓝 绿 黄 紫 橙
消除后宝石下落填充，连锁消除获得连击倍率加成。
4连 → 闪电特殊宝石（清除整行整列）
5连 → 彩色炸弹（清除所有同色宝石）
无可行操作时自动洗牌
每日挑战模式：所有玩家面对相同的初始棋盘
90秒倒计时，挑战最高分！`}
      icon={Gem}
      iconEmoji="💎"
      iconGradient="from-cyan-400 to-teal-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes gem-pop {
          0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          60% { opacity: 1; transform: scale(1.15) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
        .gem-pop { animation: gem-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes gem-clear {
          0% { opacity: 1; transform: scale(1); filter: brightness(1); }
          40% { opacity: 0.9; transform: scale(1.35); filter: brightness(2.5); }
          100% { opacity: 0; transform: scale(0); filter: brightness(3); }
        }
        .gem-clear { animation: gem-clear 0.25s ease-out forwards; }
        @keyframes gem-drop {
          0% { opacity: 0; transform: translateY(-25px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .gem-drop { animation: gem-drop 0.3s ease-out forwards; }
        @keyframes special-pulse {
          0%, 100% { box-shadow: 0 0 8px currentColor; }
          50% { box-shadow: 0 0 20px currentColor, 0 0 35px currentColor; }
        }
        .special-pulse { animation: special-pulse 0.8s ease-in-out infinite; }
        @keyframes color-bomb-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .color-bomb-spin { animation: color-bomb-spin 2s linear infinite; }
        @keyframes float-score-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-60px) scale(1.5); }
        }
        .float-score-up { animation: float-score-up 0.8s ease-out forwards; }
        @keyframes selected-glow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.5), 0 0 12px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.8), 0 0 20px rgba(34, 211, 238, 0.5); }
        }
        .selected-glow { animation: selected-glow 0.7s ease-in-out infinite; }
        @keyframes reshuffle-flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .reshuffle-flash { animation: reshuffle-flash 0.6s ease-in-out; }
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
                  ? "linear-gradient(90deg, #22d3ee, #14b8a6)"
                  : "linear-gradient(90deg, #ef4444, #f59e0b)",
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.4)",
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
              <div key={combo} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                <Flame className="w-4 h-4 text-cyan-400" />
                <span className="text-lg font-bold text-cyan-300">{combo}x</span>
                <span className="text-xs text-cyan-400/70">连击</span>
              </div>
            )}
            {floatScore && (
              <div
                key={floatScore.id}
                className="absolute left-1/2 top-0 -translate-x-1/2 float-score-up text-lg font-bold text-cyan-300 pointer-events-none"
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
                const gc = cell ? GEM_COLORS[cell.type] : null;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleClick(r, c)}
                    disabled={phase !== "playing" || locked || paused}
                    className={`relative aspect-square rounded-lg flex items-center justify-center transition-all duration-150 ${
                      cell ? "gem-drop cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"
                    } ${isSelected ? "selected-glow z-10" : ""} ${isClearing ? "gem-clear" : ""} ${
                      phase !== "playing" || locked ? "cursor-default" : ""
                    }`}
                    style={
                      cell && gc
                        ? {
                            background: cell.special === "color"
                              ? "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #f97316, #ef4444)"
                              : gc.bg,
                            boxShadow: cell.special
                              ? `0 0 12px ${gc.glow}, inset 0 0 10px rgba(255,255,255,0.3)`
                              : `inset 0 0 8px rgba(255,255,255,0.15), 0 1px 3px rgba(0,0,0,0.3)`,
                            border: cell.special ? `2px solid ${gc.border}` : "1px solid rgba(255,255,255,0.1)",
                          }
                        : {
                            background: "rgba(9,9,11,0.4)",
                            border: "1px solid rgba(39,39,42,0.5)",
                          }
                    }
                  >
                    {cell && (
                      <>
                        {/* Shine effect */}
                        <span
                          className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-white/40 blur-[1px] pointer-events-none"
                        />
                        <span
                          className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-white/60 pointer-events-none"
                        />
                        {/* Special indicator */}
                        {cell.special === "line" && (
                          <span className="absolute inset-0 flex items-center justify-center special-pulse" style={{ color: gc!.border }}>
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                              <path d="M12 2v20M2 12h20" />
                            </svg>
                          </span>
                        )}
                        {cell.special === "color" && (
                          <span className="absolute inset-0 flex items-center justify-center color-bomb-spin">
                            <Sparkles className="w-3.5 h-3.5 text-white drop-shadow-lg" />
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              }),
            )}
          </div>

          {/* Reshuffling indicator */}
          {reshuffling && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex items-center justify-center reshuffle-flash">
              <div className="text-center">
                <Shuffle className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-cyan-300">无可行操作，重新洗牌...</p>
              </div>
            </div>
          )}

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <div className="text-5xl mb-3">💎</div>
              <h3 className="text-xl font-bold mb-2 text-white">宝石迷阵</h3>
              <p className="text-sm text-slate-400 mb-4 text-center px-4">
                交换相邻宝石，消除3+同色得分
              </p>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setDailyMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !dailyMode
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                      : "bg-[#27272a] border border-[#3f3f46] text-slate-400"
                  }`}
                >
                  <Shuffle className="w-3 h-3 inline mr-1" /> 随机模式
                </button>
                <button
                  onClick={() => setDailyMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    dailyMode
                      ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                      : "bg-[#27272a] border border-[#3f3f46] text-slate-400"
                  }`}
                >
                  <Calendar className="w-3 h-3 inline mr-1" /> 每日挑战
                </button>
              </div>

              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
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
              <div className="text-5xl mb-3">{score >= bestScore && score > 0 ? "🏆" : "💎"}</div>
              <h3 className="text-xl font-bold mb-1 text-white">
                {score >= bestScore && score > 0 ? "新纪录！" : "游戏结束"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-cyan-400 mb-3">{score}</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs w-full max-w-[240px]">
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最高连击</div>
                  <div className="text-lg font-bold text-amber-400">{maxCombo}x</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最佳分</div>
                  <div className="text-lg font-bold text-cyan-400">{bestScore}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3 bg-[#27272a]/60 rounded-lg px-3 py-2">
                排名第 <span className="font-bold text-cyan-400">{result.rank}</span>/{result.total}
                ，超越了 <span className="font-bold text-cyan-400">{result.beatPercent}%</span> 的玩家
              </p>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}

          {/* Pause overlay */}
          {phase === "playing" && paused && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in z-10">
              <Pause className="w-12 h-12 text-cyan-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">已暂停</h3>
              <p className="text-sm text-slate-400 mb-4">按 P 键或点击按钮继续</p>
              <button
                onClick={() => {
                  pausedRef.current = false;
                  setPaused(false);
                }}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95"
              >
                <Play className="w-4 h-4" /> 继续游戏
              </button>
            </div>
          )}
        </div>

        {/* Legend */}
        {phase === "playing" && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded bg-gradient-to-br from-white/40 to-white/10 border border-cyan-400/50"></span>
              4连 → 闪电
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-fuchsia-400" />
              5连 → 彩色炸弹
            </span>
            <span className="text-slate-600">|</span>
            <span>连击 × 倍率</span>
          </div>
        )}

        {phase === "playing" && (
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                pausedRef.current = true;
                setPaused(true);
              }}
              className="inline-flex items-center gap-2 h-9 px-4 text-xs font-medium text-slate-300 hover:text-cyan-400 bg-[#18181b] border border-[#27272a] hover:border-cyan-500/30 rounded-lg transition-colors"
            >
              <Pause className="w-3.5 h-3.5" /> 暂停
            </button>
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 h-9 px-4 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> 结束游戏
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
