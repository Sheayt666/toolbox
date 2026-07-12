"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, RotateCcw, Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "tetris";
const COLS = 10;
const ROWS = 20;
const CELL = 34; // 画布逻辑分辨率 340×680
const BEST_SCORE_KEY = "gm_tetris_best_score";

interface PieceDef {
  name: string;
  color: string;
  shape: number[][];
}

// 7 种经典方块：I=青 O=黄 T=紫 S=绿 Z=红 L=橙 J=蓝
const PIECES: PieceDef[] = [
  { name: "I", color: "#06b6d4", shape: [[1, 1, 1, 1]] },
  { name: "O", color: "#eab308", shape: [[1, 1], [1, 1]] },
  { name: "T", color: "#a855f7", shape: [[0, 1, 0], [1, 1, 1]] },
  { name: "S", color: "#22c55e", shape: [[0, 1, 1], [1, 1, 0]] },
  { name: "Z", color: "#ef4444", shape: [[1, 1, 0], [0, 1, 1]] },
  { name: "L", color: "#f97316", shape: [[0, 0, 1], [1, 1, 1]] },
  { name: "J", color: "#3b82f6", shape: [[1, 0, 0], [1, 1, 1]] },
];

const LINE_SCORES = [0, 100, 300, 500, 800];

interface Piece {
  shape: number[][];
  type: number;
  col: number;
  row: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

function rotateCW(m: number[][]): number[][] {
  const rows = m.length;
  const cols = m[0].length;
  const r: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      r[j][rows - 1 - i] = m[i][j];
    }
  }
  return r;
}

function emptyGrid(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function makeBag(): number[] {
  const arr = [0, 1, 2, 3, 4, 5, 6];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TetrisPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<number[][]>(emptyGrid());
  const pieceRef = useRef<Piece | null>(null);
  const bagRef = useRef<number[]>([]);
  const nextTypeRef = useRef(0);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const bestRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const dropAccRef = useRef(0);
  const dropIntervalRef = useRef(800);
  const animFrameRef = useRef(0);

  const tickRef = useRef<() => void>(() => {});
  const drawRef = useRef<() => void>(() => {});
  const gameOverRef = useRef<() => void>(() => {});

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nextType, setNextType] = useState(0);

  const pullFromBag = useCallback(() => {
    if (bagRef.current.length === 0) {
      bagRef.current = makeBag();
    }
    return bagRef.current.pop()!;
  }, []);

  const collide = useCallback((shape: number[][], col: number, row: number) => {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (!shape[i][j]) continue;
        const x = col + j;
        const y = row + i;
        if (x < 0 || x >= COLS || y >= ROWS) return true;
        if (y >= 0 && gridRef.current[y][x]) return true;
      }
    }
    return false;
  }, []);

  const spawnPiece = useCallback(
    (type: number) => {
      const def = PIECES[type];
      const shape = def.shape.map((r) => [...r]);
      const col = Math.floor((COLS - shape[0].length) / 2);
      const row = 0;
      const p: Piece = { shape, type, col, row };
      if (collide(shape, col, row)) {
        // 顶部溢出 = 游戏结束
        pieceRef.current = p;
        gameOverRef.current();
        return;
      }
      pieceRef.current = p;
    },
    [collide],
  );

  const lockAndSpawn = useCallback(() => {
    const p = pieceRef.current;
    if (!p) return;
    // 写入网格
    for (let i = 0; i < p.shape.length; i++) {
      for (let j = 0; j < p.shape[i].length; j++) {
        if (p.shape[i][j]) {
          const y = p.row + i;
          const x = p.col + j;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            gridRef.current[y][x] = p.type + 1;
          }
        }
      }
    }
    // 消行
    let cleared = 0;
    const newGrid: number[][] = [];
    for (let r = 0; r < ROWS; r++) {
      if (gridRef.current[r].every((c) => c !== 0)) {
        cleared++;
      } else {
        newGrid.push(gridRef.current[r]);
      }
    }
    while (newGrid.length < ROWS) {
      newGrid.unshift(Array(COLS).fill(0));
    }
    gridRef.current = newGrid;

    if (cleared > 0) {
      const gained = LINE_SCORES[cleared] || 0;
      scoreRef.current += gained;
      setScore(scoreRef.current);
      linesRef.current += cleared;
      setLines(linesRef.current);
      const newLevel = Math.floor(linesRef.current / 10) + 1;
      if (newLevel !== levelRef.current) {
        levelRef.current = newLevel;
        setLevel(newLevel);
        dropIntervalRef.current = Math.max(80, 800 - (newLevel - 1) * 70);
      }
    }

    // 生成下一个
    const nt = nextTypeRef.current;
    nextTypeRef.current = pullFromBag();
    setNextType(nextTypeRef.current);
    spawnPiece(nt);
  }, [pullFromBag, spawnPiece]);

  const tickGravity = useCallback(() => {
    const p = pieceRef.current;
    if (!p) return;
    if (!collide(p.shape, p.col, p.row + 1)) {
      p.row++;
    } else {
      lockAndSpawn();
    }
  }, [collide, lockAndSpawn]);

  const move = useCallback(
    (dx: number) => {
      const p = pieceRef.current;
      if (!p || !runningRef.current || overRef.current) return;
      if (!collide(p.shape, p.col + dx, p.row)) {
        p.col += dx;
      }
    },
    [collide],
  );

  const rotate = useCallback(() => {
    const p = pieceRef.current;
    if (!p || !runningRef.current || overRef.current) return;
    const rotated = rotateCW(p.shape);
    // 墙踢：尝试多种偏移
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!collide(rotated, p.col + k, p.row)) {
        p.shape = rotated;
        p.col += k;
        return;
      }
    }
  }, [collide]);

  const softDrop = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    tickGravity();
    dropAccRef.current = 0;
  }, [tickGravity]);

  const hardDrop = useCallback(() => {
    const p = pieceRef.current;
    if (!p || !runningRef.current || overRef.current) return;
    let dropped = 0;
    while (!collide(p.shape, p.col, p.row + 1)) {
      p.row++;
      dropped++;
    }
    if (dropped > 0) {
      scoreRef.current += dropped * 2;
      setScore(scoreRef.current);
    }
    lockAndSpawn();
    dropAccRef.current = 0;
  }, [collide, lockAndSpawn]);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `消除 ${linesRef.current} 行`);
    setResult(r);
    setRefreshKey((k) => k + 1);
    if (s > bestRef.current) {
      bestRef.current = s;
      setBest(s);
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(s));
      } catch {
        /* ignore */
      }
    }
  }, []);

  function drawBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    ghost: boolean,
  ) {
    const px = x * CELL;
    const py = y * CELL;
    if (ghost) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, CELL - 4, CELL - 4);
      ctx.restore();
      return;
    }
    ctx.save();
    // 主体渐变
    const grad = ctx.createLinearGradient(px, py, px, py + CELL);
    grad.addColorStop(0, lighten(color, 0.35));
    grad.addColorStop(1, darken(color, 0.25));
    ctx.fillStyle = grad;
    ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
    // 内高光
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fillRect(px + 2, py + 2, CELL - 4, 3);
    // 边框
    ctx.strokeStyle = darken(color, 0.45);
    ctx.lineWidth = 1;
    ctx.strokeRect(px + 1, py + 1, CELL - 2, CELL - 2);
    ctx.restore();
  }

  function lighten(hex: string, amt: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.round(r + (255 - r) * amt)},${Math.round(
      g + (255 - g) * amt,
    )},${Math.round(b + (255 - b) * amt)})`;
  }
  function darken(hex: string, amt: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.round(r * (1 - amt))},${Math.round(
      g * (1 - amt),
    )},${Math.round(b * (1 - amt))})`;
  }
  function hexToRgb(hex: string) {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  }

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    animFrameRef.current++;

    // 背景
    ctx.fillStyle = "#0b0b0e";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // 网格线
    ctx.strokeStyle = "rgba(39,39,42,0.5)";
    ctx.lineWidth = 1;
    for (let i = 1; i < COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, cv.height);
      ctx.stroke();
    }
    for (let j = 1; j < ROWS; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * CELL);
      ctx.lineTo(cv.width, j * CELL);
      ctx.stroke();
    }

    // 已锁定方块
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = gridRef.current[r][c];
        if (v) {
          drawBlock(ctx, c, r, PIECES[v - 1].color, false);
        }
      }
    }

    // 幽灵方块（落点预览）
    const p = pieceRef.current;
    if (p && runningRef.current && !overRef.current) {
      let ghostRow = p.row;
      while (!collide(p.shape, p.col, ghostRow + 1)) {
        ghostRow++;
      }
      for (let i = 0; i < p.shape.length; i++) {
        for (let j = 0; j < p.shape[i].length; j++) {
          if (p.shape[i][j]) {
            drawBlock(ctx, p.col + j, ghostRow + i, PIECES[p.type].color, true);
          }
        }
      }
      // 当前方块
      for (let i = 0; i < p.shape.length; i++) {
        for (let j = 0; j < p.shape[i].length; j++) {
          if (p.shape[i][j]) {
            drawBlock(ctx, p.col + j, p.row + i, PIECES[p.type].color, false);
          }
        }
      }
    }
  }, [collide]);

  // 主循环
  useEffect(() => {
    tickRef.current = tickGravity;
    drawRef.current = draw;
    gameOverRef.current = doGameOver;
    let raf: number;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = time - last;
      last = time;
      if (runningRef.current && !overRef.current) {
        dropAccRef.current += dt;
        if (dropAccRef.current >= dropIntervalRef.current) {
          dropAccRef.current -= dropIntervalRef.current;
          tickRef.current();
        }
      }
      drawRef.current();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tickGravity, draw, doGameOver]);

  // 读取最高分（mounted 模式）
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (saved > 0) {
        bestRef.current = saved;
        setBest(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    gridRef.current = emptyGrid();
    bagRef.current = makeBag();
    const first = pullFromBag();
    nextTypeRef.current = pullFromBag();
    setNextType(nextTypeRef.current);
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    dropIntervalRef.current = 800;
    dropAccRef.current = 0;
    submittedRef.current = false;
    setScore(0);
    setLines(0);
    setLevel(1);
    spawnPiece(first);
    runningRef.current = true;
    setRunning(true);
  }, [pullFromBag, spawnPiece]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    runningRef.current = true;
    setRunning(true);
  }, []);

  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    gridRef.current = emptyGrid();
    pieceRef.current = null;
    bagRef.current = [];
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    dropIntervalRef.current = 800;
    dropAccRef.current = 0;
    setScore(0);
    setLines(0);
    setLevel(1);
    setOver(false);
    setResult(null);
    setRunning(false);
  }, []);

  // 键盘控制
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        move(-1);
        e.preventDefault();
      } else if (k === "arrowright" || k === "d") {
        move(1);
        e.preventDefault();
      } else if (k === "arrowup" || k === "w") {
        rotate();
        e.preventDefault();
      } else if (k === "arrowdown" || k === "s") {
        softDrop();
        e.preventDefault();
      } else if (k === " ") {
        hardDrop();
        e.preventDefault();
      } else if (k === "p") {
        if (over) return;
        if (running) pause();
        else resume();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, rotate, softDrop, hardDrop, running, over, start, pause, resume]);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "行数", value: lines },
    { label: "等级", value: level },
    { label: "最高", value: best },
  ];

  // 下一个方块预览（HTML 网格）
  const nextDef = PIECES[nextType];
  const nextShape = nextDef.shape;
  const previewRows = Math.max(nextShape.length, 2);

  return (
    <GameShell
      gameId={GAME_ID}
      title="俄罗斯方块"
      description="永恒经典的方块消除游戏！旋转、移动、消除整行，速度随等级递增。7种经典方块，挑战你的反应与空间想象。"
      instructions={`键盘控制：← → 左右移动，↑ 旋转，↓ 加速下落，空格硬降到底，P 暂停。
移动端可使用下方按钮控制。
消除整行得分：1行=100，2行=300，3行=500，4行=800（Tetris）。
每消除 10 行升一级，下落速度加快。
方块堆到顶部无法生成新方块时游戏结束。
半透明轮廓是方块的落点预览（幽灵方块）。`}
      icon={Box}
      iconEmoji="🧱"
      iconGradient="from-cyan-400 to-blue-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-start justify-center gap-3 sm:gap-4 w-full">
          {/* 主画布 */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={COLS * CELL}
              height={ROWS * CELL}
              className="w-full max-w-[340px] h-auto rounded-xl border border-[#27272a] shadow-lg shadow-[#8b5cf6]/10"
            />

            {/* 待开始覆盖层 */}
            {!running && !over && (
              <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
                <button
                  onClick={start}
                  className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
                >
                  <Play className="w-5 h-5" /> 开始游戏
                </button>
                <p className="mt-4 text-xs text-slate-400 text-center px-4 leading-relaxed">
                  ← → 移动 · ↑ 旋转
                  <br />
                  ↓ 加速 · 空格硬降
                </p>
              </div>
            )}

            {/* 游戏结束覆盖层 */}
            {over && (
              <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
                <div className="text-5xl mb-3">🧱</div>
                <h3 className="text-2xl font-bold mb-2">游戏结束</h3>
                <p className="text-sm text-slate-400 mb-1">最终得分</p>
                <p className="text-4xl font-bold text-[#a78bfa] mb-1">{score}</p>
                <p className="text-xs text-slate-500 mb-3">
                  消除 {lines} 行 · 等级 {level}
                  {score >= best && score > 0 ? " · 新纪录！" : ` · 最高: ${best}`}
                </p>
                {result && (
                  <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                    排名第{" "}
                    <span className="text-[#c4b5fd] font-bold">{result.rank}</span>
                    /{result.total}，超越了{" "}
                    <span className="text-[#c4b5fd] font-bold">
                      {result.beatPercent}%
                    </span>{" "}
                    的玩家
                  </p>
                )}
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
                >
                  <RotateCcw className="w-4 h-4" /> 再来一局
                </button>
              </div>
            )}
          </div>

          {/* 侧边信息：下一个 + 等级（桌面端显示） */}
          <div className="hidden sm:flex flex-col gap-3 w-24">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3">
              <p className="text-[11px] text-slate-500 mb-2 text-center">下一个</p>
              <div
                className="grid gap-0.5 justify-center"
                style={{
                  gridTemplateColumns: `repeat(${nextShape[0].length}, 18px)`,
                  gridTemplateRows: `repeat(${previewRows}, 18px)`,
                }}
              >
                {Array.from({ length: previewRows }).map((_, i) =>
                  Array.from({ length: nextShape[0].length }).map((_, j) => {
                    const filled = nextShape[i] && nextShape[i][j];
                    return (
                      <div
                        key={`${i}-${j}`}
                        className="rounded-sm"
                        style={{
                          width: 18,
                          height: 18,
                          background: filled ? nextDef.color : "transparent",
                          boxShadow: filled
                            ? `inset 0 2px 0 rgba(255,255,255,0.3)`
                            : "none",
                        }}
                      />
                    );
                  }),
                )}
              </div>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 text-center">
              <p className="text-[11px] text-slate-500">等级</p>
              <p className="text-2xl font-bold text-[#a78bfa]">{level}</p>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 text-center">
              <p className="text-[11px] text-slate-500">行数</p>
              <p className="text-2xl font-bold text-white">{lines}</p>
            </div>
          </div>
        </div>

        {/* 移动端下一个预览 */}
        <div className="sm:hidden mt-3 flex items-center gap-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-[11px] text-slate-500">下一个</span>
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${nextShape[0].length}, 14px)`,
                gridTemplateRows: `repeat(${previewRows}, 14px)`,
              }}
            >
              {Array.from({ length: previewRows }).map((_, i) =>
                Array.from({ length: nextShape[0].length }).map((_, j) => {
                  const filled = nextShape[i] && nextShape[i][j];
                  return (
                    <div
                      key={`${i}-${j}`}
                      className="rounded-sm"
                      style={{
                        width: 14,
                        height: 14,
                        background: filled ? nextDef.color : "transparent",
                      }}
                    />
                  );
                }),
              )}
            </div>
          </div>
        </div>

        {/* 控制按钮区 */}
        <div className="mt-5 flex flex-col items-center gap-4">
          {/* 移动端方向按钮 */}
          <div className="sm:hidden grid grid-cols-3 gap-2 w-56">
            <div />
            <button
              onClick={rotate}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <button
              onClick={hardDrop}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
              title="硬降"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
            <button
              onClick={() => move(-1)}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={softDrop}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <button
              onClick={() => move(1)}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* 开始/暂停/重开按钮 */}
          <div className="flex items-center gap-3">
            {running ? (
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
              >
                <Pause className="w-4 h-4" /> 暂停
              </button>
            ) : (
              !over && (
                <button
                  onClick={score > 0 ? resume : start}
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
                >
                  <Play className="w-4 h-4" /> {score > 0 ? "继续" : "开始"}
                </button>
              )
            )}
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
            >
              <RotateCcw className="w-4 h-4" /> 重新开始
            </button>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
