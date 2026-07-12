"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Worm, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "snake";
const COLS = 20;
const ROWS = 20;
const CELL = 16; // 画布逻辑分辨率 320×320
const BASE_SPEED = 160;
const MIN_SPEED = 70;

type Pt = { x: number; y: number };

function initialSnake(): Pt[] {
  return [
    { x: 9, y: 10 },
    { x: 8, y: 10 },
    { x: 7, y: 10 },
  ];
}
function randFood(snake: Pt[]): Pt {
  while (true) {
    const p = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Pt[]>(initialSnake());
  const dirRef = useRef<Pt>({ x: 1, y: 0 });
  const nextDirRef = useRef<Pt>({ x: 1, y: 0 });
  // 初始用一个不与初始蛇身重叠的固定位置，挂载后在 effect 中随机化（避免渲染期读取 ref）
  const foodRef = useRef<Pt>({ x: 14, y: 10 });
  const loopRef = useRef<number | null>(null);
  const speedRef = useRef(BASE_SPEED);
  const submittedRef = useRef(false);

  const [score, setScore] = useState(3);
  const [best, setBest] = useState(3);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, cv.width, cv.height);
    // 网格线
    ctx.strokeStyle = "rgba(39,39,42,0.5)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, ROWS * CELL);
      ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * CELL);
      ctx.lineTo(COLS * CELL, j * CELL);
      ctx.stroke();
    }
    // 食物
    const f = foodRef.current;
    ctx.fillStyle = "#8b5cf6";
    ctx.shadowColor = "#8b5cf6";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // 蛇身
    const snake = snakeRef.current;
    snake.forEach((s, i) => {
      const t = i / snake.length;
      ctx.fillStyle = i === 0 ? "#a78bfa" : `rgba(139,92,246,${1 - t * 0.6})`;
      roundRect(ctx, s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 4);
      ctx.fill();
    });
  }, []);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const len = snakeRef.current.length;
    const r = submitScore(GAME_ID, len, `长度 ${len}`);
    setResult(r);
    setRefreshKey((k) => k + 1);
  }, []);

  const gameOver = useCallback(() => {
    setOver(true);
    setRunning(false);
    if (loopRef.current) {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    }
    finish();
  }, [finish]);

  // 用 ref 间接调用 tick，避免在 useCallback 内部自引用
  const tickRef = useRef<() => void>(() => {});
  const tick = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const head = snakeRef.current[0];
    const nx = head.x + dirRef.current.x;
    const ny = head.y + dirRef.current.y;
    // 撞墙
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      gameOver();
      return;
    }
    const eating = nx === foodRef.current.x && ny === foodRef.current.y;
    const body = eating ? snakeRef.current : snakeRef.current.slice(0, -1);
    // 撞自己
    if (body.some((s) => s.x === nx && s.y === ny)) {
      gameOver();
      return;
    }
    const newSnake = [{ x: nx, y: ny }, ...body];
    snakeRef.current = newSnake;
    if (eating) {
      foodRef.current = randFood(newSnake);
      const len = newSnake.length;
      setScore(len);
      setBest((b) => Math.max(b, len));
      speedRef.current = Math.max(MIN_SPEED, BASE_SPEED - (len - 3) * 5);
    }
    draw();
    loopRef.current = window.setTimeout(() => tickRef.current(), speedRef.current);
  }, [draw, gameOver]);
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const start = useCallback(() => {
    if (running || over) return;
    setRunning(true);
    loopRef.current = window.setTimeout(tick, speedRef.current);
  }, [running, over, tick]);

  const pause = useCallback(() => {
    if (!running) return;
    setRunning(false);
    if (loopRef.current) {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    }
  }, [running]);

  const restart = useCallback(() => {
    if (loopRef.current) {
      clearTimeout(loopRef.current);
      loopRef.current = null;
    }
    const s = initialSnake();
    snakeRef.current = s;
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randFood(s);
    speedRef.current = BASE_SPEED;
    submittedRef.current = false;
    setScore(3);
    setBest(3);
    setOver(false);
    setResult(null);
    setRunning(false);
    draw();
  }, [draw]);

  const setDir = useCallback((dx: number, dy: number) => {
    // 禁止 180 度反向
    if (dirRef.current.x + dx === 0 && dirRef.current.y + dy === 0) return;
    nextDirRef.current = { x: dx, y: dy };
  }, []);

  // 键盘控制：方向键 + WASD + 空格暂停
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") {
        setDir(0, -1);
        e.preventDefault();
      } else if (k === "arrowdown" || k === "s") {
        setDir(0, 1);
        e.preventDefault();
      } else if (k === "arrowleft" || k === "a") {
        setDir(-1, 0);
        e.preventDefault();
      } else if (k === "arrowright" || k === "d") {
        setDir(1, 0);
        e.preventDefault();
      } else if (k === " ") {
        e.preventDefault();
        if (over) return;
        if (running) {
          pause();
        } else {
          start();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, over, start, pause, setDir]);

  // 初始绘制 + 随机化食物位置
  useEffect(() => {
    foodRef.current = randFood(snakeRef.current);
    draw();
  }, [draw]);

  // 卸载清理
  useEffect(() => {
    return () => {
      if (loopRef.current) clearTimeout(loopRef.current);
    };
  }, []);

  // 触屏滑动
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < 24) return;
    if (ax > ay) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
    touchStart.current = null;
  };

  const stats: GameStat[] = [
    { label: "当前长度", value: score },
    { label: "最高记录", value: best },
    { label: "游戏状态", value: over ? "已结束" : running ? "进行中" : "待开始" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="贪吃蛇"
      description="经典贪吃蛇游戏，吃食物变长，蛇越长速度越快，撞墙或撞到自己即结束"
      instructions={`使用键盘方向键或 W A S D 控制方向，空格键暂停/继续，移动端可在画布上滑动。
吃到紫色食物蛇身变长，速度会随长度增加而提升。
撞到墙壁或自己的身体游戏结束，蛇的长度即为你的分数。`}
      icon={Worm}
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="w-full max-w-[360px] aspect-square rounded-xl border border-[#27272a] touch-none"
          />

          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex flex-col items-center justify-center">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 开始游戏
              </button>
              <p className="mt-3 text-xs text-slate-400">方向键 / WASD / 滑动控制</p>
            </div>
          )}

          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
              <div className="text-4xl mb-2">🐍</div>
              <h3 className="text-xl font-bold mb-1">游戏结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终长度</p>
              <p className="text-3xl font-bold text-[#a78bfa] mb-3">{score}</p>
              {result && (
                <p className="text-xs text-slate-400 mb-4">
                  排名第 {result.rank}/{result.total}，超越了 {result.beatPercent}% 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-3">
          {running ? (
            <button
              onClick={pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              <Pause className="w-4 h-4" /> 暂停
            </button>
          ) : (
            !over && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 开始
              </button>
            )
          )}
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>
      </div>
    </GameShell>
  );
}
