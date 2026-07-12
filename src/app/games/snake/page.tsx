"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Worm, RotateCcw, Play, Pause, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "snake";
const COLS = 20;
const ROWS = 20;
const CELL = 30; // 画布逻辑分辨率 600×600
const BASE_SPEED = 160;
const MIN_SPEED = 70;
const BEST_SCORE_KEY = "gm_snake_best_score";

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
  const foodRef = useRef<Pt>({ x: 14, y: 10 });
  const loopRef = useRef<number | null>(null);
  const speedRef = useRef(BASE_SPEED);
  const submittedRef = useRef(false);
  const animFrameRef = useRef<number>(0);

  const [score, setScore] = useState(3);
  const [best, setBest] = useState(3);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scorePopups, setScorePopups] = useState<{ id: number; value: number }[]>([]);
  const [currentSpeed, setCurrentSpeed] = useState(BASE_SPEED);
  const popupIdRef = useRef(0);

  const triggerScorePopup = useCallback((value: number) => {
    const id = popupIdRef.current++;
    setScorePopups((prev) => [...prev, { id, value }]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  }, []);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // 背景
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // 网格点阵（更精致）
    ctx.fillStyle = "rgba(39,39,42,0.6)";
    for (let i = 0; i <= COLS; i++) {
      for (let j = 0; j <= ROWS; j++) {
        ctx.fillRect(i * CELL - 0.5, j * CELL - 0.5, 1, 1);
      }
    }

    // 食物 — 脉动发光
    const f = foodRef.current;
    const pulse = 0.5 + 0.5 * Math.sin(animFrameRef.current * 0.08);
    const fx = f.x * CELL + CELL / 2;
    const fy = f.y * CELL + CELL / 2;

    // 食物外光晕
    const glowRadius = CELL / 2 + 4 + pulse * 3;
    const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, glowRadius);
    grad.addColorStop(0, "rgba(168,85,247,0.5)");
    grad.addColorStop(0.5, "rgba(168,85,247,0.2)");
    grad.addColorStop(1, "rgba(168,85,247,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(fx - glowRadius, fy - glowRadius, glowRadius * 2, glowRadius * 2);

    // 食物本体
    ctx.fillStyle = "#c084fc";
    ctx.shadowColor = "#a855f7";
    ctx.shadowBlur = 10 + pulse * 6;
    ctx.beginPath();
    ctx.arc(fx, fy, CELL / 2 - 2 + pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 食物高光
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.arc(fx - 2, fy - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // 蛇身 — 渐变 + 圆角
    const snake = snakeRef.current;
    snake.forEach((s, i) => {
      const t = i / Math.max(snake.length - 1, 1);
      if (i === 0) {
        // 蛇头 — 更亮 + 眼睛
        ctx.fillStyle = "#c4b5fd";
        ctx.shadowColor = "#8b5cf6";
        ctx.shadowBlur = 8;
        roundRect(ctx, s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2, 5);
        ctx.fill();
        ctx.shadowBlur = 0;

        // 眼睛
        const dir = dirRef.current;
        const eyeOffsetX = dir.x * 3;
        const eyeOffsetY = dir.y * 3;
        const eye1x = s.x * CELL + CELL / 2 + eyeOffsetX + (dir.x === 0 ? -3 : 0);
        const eye1y = s.y * CELL + CELL / 2 + eyeOffsetY + (dir.y === 0 ? -3 : 0);
        const eye2x = s.x * CELL + CELL / 2 + eyeOffsetX + (dir.x === 0 ? 3 : 0);
        const eye2y = s.y * CELL + CELL / 2 + eyeOffsetY + (dir.y === 0 ? 3 : 0);
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.arc(eye1x, eye1y, 2, 0, Math.PI * 2);
        ctx.arc(eye2x, eye2y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 蛇身 — 从亮紫到暗紫渐变
        const r = Math.round(168 - t * 60);
        const g = Math.round(85 - t * 40);
        const b = Math.round(247 - t * 80);
        ctx.fillStyle = `rgba(${r},${g},${b},${1 - t * 0.4})`;
        roundRect(ctx, s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3, 4);
        ctx.fill();
      }
    });
  }, []);

  // 读取本地存储的最佳成绩（mounted后读取避免水合不匹配）
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "3", 10) || 3;
      if (saved > 3) setBest(saved);
    } catch { /* ignore */ }
  }, []);

  // 绘制当前状态（非运行时也绘制一次，确保画布有内容）
  useEffect(() => {
    draw();
  }, [draw, running, over]);

  // 动画帧循环（仅游戏运行时，用于食物脉动效果）
  useEffect(() => {
    if (!running || over) return;
    let raf: number;
    const animate = () => {
      animFrameRef.current++;
      if (canvasRef.current) draw();
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [draw, running, over]);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const len = snakeRef.current.length;
    const r = submitScore(GAME_ID, len, `长度 ${len}`);
    setResult(r);
    setRefreshKey((k) => k + 1);
    // 保存最高分到 localStorage
    if (len > best) {
      setBest(len);
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(len));
      } catch {
        // ignore
      }
    }
  }, [best]);

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
      setCurrentSpeed(speedRef.current);
      triggerScorePopup(1);
    }
    loopRef.current = window.setTimeout(() => tickRef.current(), speedRef.current);
  }, [gameOver, triggerScorePopup]);
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
    setCurrentSpeed(BASE_SPEED);
    submittedRef.current = false;
    setScore(3);
    setOver(false);
    setResult(null);
    setRunning(false);
  }, []);

  // 初始化食物位置
  useEffect(() => {
    foodRef.current = randFood(snakeRef.current);
  }, []);

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
    { label: "当前速度", value: running ? `${Math.round(1000 / currentSpeed)} fps` : "—" },
    { label: "游戏状态", value: over ? "已结束" : running ? "进行中" : "待开始" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="贪吃蛇"
      description="经典贪吃蛇游戏，吃食物变长，蛇越长速度越快，撞墙或撞到自己即结束"
      instructions={`使用键盘方向键或 W A S D 控制方向，空格键暂停/继续。
移动端可在画布上滑动或使用下方方向按钮控制。
吃到紫色食物蛇身变长，速度会随长度增加而提升。
撞到墙壁或自己的身体游戏结束，蛇的长度即为你的分数。
你的最高长度记录会自动保存在本地。`}
      icon={Worm}
      iconEmoji="🐍"
      iconGradient="from-green-500 to-emerald-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 分数弹出动画层 */}
        <div className="relative h-8 mb-2">
          {scorePopups.map((p) => (
            <div
              key={p.id}
              className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none animate-score-pop text-lg font-bold text-[#c4b5fd]"
            >
              +1 长度
            </div>
          ))}
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-[#8b5cf6]/10"
          />

          {/* 暂停覆盖层 */}
          {running && (
            <div
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-[#09090b]/80 backdrop-blur-sm border border-[#27272a] text-xs text-slate-400 pointer-events-none animate-pulse-soft"
            >
              运行中
            </div>
          )}

          {/* 待开始覆盖层 */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/75 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-4">
                方向键 / WASD / 滑动 / 按钮
              </p>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🐍</div>
              <h3 className="text-2xl font-bold mb-2">游戏结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终长度</p>
              <p className="text-4xl font-bold text-[#a78bfa] mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best ? "新纪录！" : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-[#c4b5fd] font-bold">{result.rank}</span>/{result.total}
                  ，超越了 <span className="text-[#c4b5fd] font-bold">{result.beatPercent}%</span> 的玩家
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

        {/* 控制按钮区 */}
        <div className="mt-5 flex flex-col items-center gap-4">
          {/* 移动端方向按钮 */}
          <div className="grid grid-cols-3 gap-2 sm:hidden w-48">
            <div />
            <button
              onClick={() => setDir(0, -1)}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <div />
            <button
              onClick={() => setDir(-1, 0)}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setDir(0, 1)}
              className="h-14 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-[#8b5cf6] active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <button
              onClick={() => setDir(1, 0)}
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
                  onClick={start}
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
                >
                  <Play className="w-4 h-4" /> 开始
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
