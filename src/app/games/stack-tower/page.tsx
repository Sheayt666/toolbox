"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, RotateCcw, Play, Pause, Crown, Sparkles } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "stack-tower";
const CANVAS_W = 400;
const CANVAS_H = 600;
const BEST_SCORE_KEY = "gm_stacktower_best_score";
const BLOCK_H = 30;
const START_W = 190;
const GROUND_Y = CANVAS_H - 40;
const PERFECT_TOL = 5;

interface Block {
  x: number;
  w: number;
  y: number; // 顶部 worldY
  hue: number;
}
interface Debris {
  x: number;
  w: number;
  y: number;
  vy: number;
  vx: number;
  hue: number;
  life: number;
  rot: number;
  vr: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
interface FloatText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}
interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

export default function StackTowerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stackRef = useRef<Block[]>([]);
  const movingRef = useRef<{ x: number; w: number; dir: number; hue: number }>({
    x: 0,
    w: START_W,
    dir: 1,
    hue: 200,
  });
  const debrisRef = useRef<Debris[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatsRef = useRef<FloatText[]>([]);
  const cameraRef = useRef(0);
  const flashRef = useRef<{ y: number; t: number } | null>(null);
  const perfectFlashRef = useRef(0);
  const shakeRef = useRef(0);

  const scoreRef = useRef(0);
  const heightRef = useRef(0);
  const perfectRef = useRef(0);
  const bestRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);

  const [score, setScore] = useState(0);
  const [height, setHeight] = useState(0);
  const [perfect, setPerfect] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [, setTick] = useState(0);

  const gameOverRef = useRef<() => void>(() => {});

  const topBlock = useCallback(() => {
    return stackRef.current[stackRef.current.length - 1];
  }, []);

  const topY = useCallback(() => {
    const s = stackRef.current;
    if (s.length === 0) return GROUND_Y;
    return s[s.length - 1].y;
  }, []);

  const recomputeScore = useCallback(() => {
    scoreRef.current = heightRef.current * 50 + perfectRef.current * 25;
    setScore(scoreRef.current);
  }, []);

  const spawnDebris = useCallback((x: number, w: number, y: number, hue: number) => {
    debrisRef.current.push({
      x,
      w,
      y,
      vy: -1,
      vx: (Math.random() - 0.5) * 2,
      hue,
      life: 90,
      rot: 0,
      vr: (Math.random() - 0.5) * 0.2,
    });
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 4 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 1,
        life: 30 + Math.random() * 20,
        color,
      });
    }
  }, []);

  const addFloat = useCallback((x: number, y: number, text: string, color: string) => {
    floatsRef.current.push({ x, y, text, life: 60, color });
  }, []);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    runningRef.current = false;
    setRunning(false);
    shakeRef.current = 12;
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `${heightRef.current}层 完美${perfectRef.current}`);
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

  const drop = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    const m = movingRef.current;
    const tb = topBlock();
    if (!tb) return;
    const overlapLeft = Math.max(m.x, tb.x);
    const overlapRight = Math.min(m.x + m.w, tb.x + tb.w);
    const overlapW = overlapRight - overlapLeft;
    const landY = tb.y - BLOCK_H;

    // 完美判定
    const diff = m.x - tb.x;
    if (Math.abs(diff) <= PERFECT_TOL) {
      // 完美：宽度不损失，略微回长
      const newW = Math.min(START_W, m.w + 3);
      stackRef.current.push({ x: tb.x, w: newW, y: landY, hue: m.hue });
      perfectRef.current += 1;
      setPerfect(perfectRef.current);
      perfectFlashRef.current = 18;
      addFloat(tb.x + tb.w / 2, landY, "PERFECT", "#fbbf24");
      spawnParticles(tb.x + tb.w / 2, landY + BLOCK_H / 2, "#fde68a", 16);
    } else if (overlapW <= 0) {
      // 完全没对上 -> 游戏结束，整块掉落
      spawnDebris(m.x, m.w, landY, m.hue);
      shakeRef.current = 10;
      doGameOver();
      return;
    } else {
      // 切掉超出部分
      stackRef.current.push({ x: overlapLeft, w: overlapW, y: landY, hue: m.hue });
      // 左侧残块
      if (m.x < overlapLeft) {
        spawnDebris(m.x, overlapLeft - m.x, landY, m.hue);
      }
      // 右侧残块
      if (m.x + m.w > overlapRight) {
        spawnDebris(overlapRight, m.x + m.w - overlapRight, landY, m.hue);
      }
      flashRef.current = { y: landY, t: performance.now() };
      shakeRef.current = 3;
    }

    heightRef.current = stackRef.current.length;
    setHeight(heightRef.current);
    recomputeScore();

    // 下一块
    const nextHue = (200 + heightRef.current * 14) % 360;
    const speed = Math.min(5.5, 2.2 + heightRef.current * 0.12);
    const newW = stackRef.current[stackRef.current.length - 1].w;
    movingRef.current = {
      x: movingRef.current.dir > 0 ? 0 : CANVAS_W - newW,
      w: newW,
      dir: -movingRef.current.dir,
      hue: nextHue,
    };
    // 把速度存到 moving 上（用闭包变量）
    speedRef.current = speed;
  }, [topBlock, recomputeScore, addFloat, spawnParticles, spawnDebris, doGameOver]);

  const speedRef = useRef(2.6);

  const step = useCallback(
    (dt: number) => {
      const m = movingRef.current;
      const sp = speedRef.current * dt;
      m.x += m.dir * sp;
      if (m.x < 0) {
        m.x = 0;
        m.dir = 1;
      }
      if (m.x + m.w > CANVAS_W) {
        m.x = CANVAS_W - m.w;
        m.dir = -1;
      }

      // 相机平滑跟随
      const target = Math.min(0, topY() - CANVAS_H * 0.6);
      cameraRef.current += (target - cameraRef.current) * Math.min(1, 0.1 * dt);

      // 残块物理
      const steps = Math.max(1, Math.min(3, Math.round(dt)));
      for (const d of debrisRef.current) {
        d.vy += 0.5 * steps;
        d.y += d.vy * steps;
        d.x += d.vx * steps;
        d.rot += d.vr * steps;
        d.life -= steps;
      }
      debrisRef.current = debrisRef.current.filter((d) => d.life > 0 && d.y < CANVAS_H + 200);

      for (const p of particlesRef.current) {
        p.vy += 0.2 * steps;
        p.x += p.vx * steps;
        p.y += p.vy * steps;
        p.life -= steps;
      }
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      for (const f of floatsRef.current) {
        f.y -= 0.7 * steps;
        f.life -= steps;
      }
      floatsRef.current = floatsRef.current.filter((f) => f.life > 0);

      if (perfectFlashRef.current > 0) perfectFlashRef.current -= steps;
      if (shakeRef.current > 0) shakeRef.current = Math.max(0, shakeRef.current - 0.5 * steps);
    },
    [topY],
  );

  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    animFrameRef.current++;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, "#0a0a1a");
    bg.addColorStop(1, "#050510");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // 背景光晕（随高度变色）
    const hue = stackRef.current.length > 0 ? stackRef.current[stackRef.current.length - 1].hue : 200;
    const glow = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H * 0.6, 20, CANVAS_W / 2, CANVAS_H * 0.6, CANVAS_W);
    glow.addColorStop(0, `hsla(${hue},70%,50%,0.12)`);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // 震动
    const shake = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0;
    ctx.save();
    ctx.translate(shake, shake);

    const cam = cameraRef.current;
    const toDrawY = (worldY: number) => worldY - cam;

    // 地面
    const gY = toDrawY(GROUND_Y);
    if (gY < CANVAS_H) {
      const gg = ctx.createLinearGradient(0, gY, 0, CANVAS_H);
      gg.addColorStop(0, "#1e293b");
      gg.addColorStop(1, "#0f172a");
      ctx.fillStyle = gg;
      ctx.fillRect(0, gY, CANVAS_W, CANVAS_H - gY);
      ctx.strokeStyle = "rgba(99,102,241,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, gY);
      ctx.lineTo(CANVAS_W, gY);
      ctx.stroke();
    }

    // 已堆叠方块
    for (const b of stackRef.current) {
      const dy = toDrawY(b.y);
      if (dy > CANVAS_H || dy + BLOCK_H < 0) continue;
      const c1 = `hsl(${b.hue},70%,62%)`;
      const c2 = `hsl(${b.hue},65%,42%)`;
      const c3 = `hsl(${b.hue},60%,28%)`;
      const grad = ctx.createLinearGradient(0, dy, 0, dy + BLOCK_H);
      grad.addColorStop(0, c1);
      grad.addColorStop(0.5, c2);
      grad.addColorStop(1, c3);
      ctx.fillStyle = grad;
      drawRoundRect(ctx, b.x, dy, b.w, BLOCK_H, 4);
      ctx.fill();
      // 顶面高光
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      drawRoundRect(ctx, b.x + 2, dy + 2, b.w - 4, 4, 2);
      ctx.fill();
      // 侧面阴影
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(b.x + b.w - 4, dy + 2, 3, BLOCK_H - 4);
    }

    // 顶部完美闪光
    if (perfectFlashRef.current > 0) {
      const tb = stackRef.current[stackRef.current.length - 1];
      if (tb) {
        const dy = toDrawY(tb.y);
        ctx.save();
        ctx.globalAlpha = perfectFlashRef.current / 18;
        ctx.fillStyle = "#fde68a";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 20;
        drawRoundRect(ctx, tb.x, dy, tb.w, BLOCK_H, 4);
        ctx.fill();
        ctx.restore();
      }
    }

    // 命中闪光
    const fl = flashRef.current;
    if (fl) {
      const age = performance.now() - fl.t;
      if (age < 200) {
        const dy = toDrawY(fl.y);
        ctx.save();
        ctx.globalAlpha = 1 - age / 200;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, dy, CANVAS_W, 2);
        ctx.restore();
      } else {
        flashRef.current = null;
      }
    }

    // 残块
    for (const d of debrisRef.current) {
      const dy = toDrawY(d.y);
      ctx.save();
      ctx.globalAlpha = Math.max(0, d.life / 90);
      ctx.translate(d.x + d.w / 2, dy + BLOCK_H / 2);
      ctx.rotate(d.rot);
      const grad = ctx.createLinearGradient(0, -BLOCK_H / 2, 0, BLOCK_H / 2);
      grad.addColorStop(0, `hsl(${d.hue},70%,60%)`);
      grad.addColorStop(1, `hsl(${d.hue},60%,30%)`);
      ctx.fillStyle = grad;
      drawRoundRect(ctx, -d.w / 2, -BLOCK_H / 2, d.w, BLOCK_H, 4);
      ctx.fill();
      ctx.restore();
    }

    // 移动方块
    if (runningRef.current && !overRef.current) {
      const m = movingRef.current;
      const tb = topBlock();
      const mY = (tb ? tb.y : GROUND_Y) - BLOCK_H;
      const dy = toDrawY(mY);
      ctx.save();
      const c1 = `hsl(${m.hue},75%,65%)`;
      const c2 = `hsl(${m.hue},70%,45%)`;
      const grad = ctx.createLinearGradient(0, dy, 0, dy + BLOCK_H);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.shadowColor = `hsl(${m.hue},80%,55%)`;
      ctx.shadowBlur = 14;
      drawRoundRect(ctx, m.x, dy, m.w, BLOCK_H, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      drawRoundRect(ctx, m.x + 2, dy + 2, m.w - 4, 4, 2);
      ctx.fill();
      // 对齐辅助线
      if (tb) {
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tb.x, dy);
        ctx.lineTo(tb.x, dy + BLOCK_H);
        ctx.moveTo(tb.x + tb.w, dy);
        ctx.lineTo(tb.x + tb.w, dy + BLOCK_H);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // 粒子
    for (const p of particlesRef.current) {
      const dy = toDrawY(p.y);
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / 50);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 浮字
    for (const f of floatsRef.current) {
      const dy = toDrawY(f.y);
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.life / 60);
      ctx.fillStyle = f.color;
      ctx.font = "bold 18px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 10;
      ctx.fillText(f.text, f.x, dy);
      ctx.restore();
    }

    ctx.restore();

    // 顶部高度指示
    if (runningRef.current && !overRef.current) {
      ctx.save();
      ctx.fillStyle = "rgba(9,9,11,0.6)";
      drawRoundRect(ctx, CANVAS_W - 86, 12, 74, 30, 8);
      ctx.fill();
      ctx.fillStyle = "#a5b4fc";
      ctx.font = "bold 18px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`${heightRef.current} 层`, CANVAS_W - 20, 27);
      ctx.restore();
    }
  }, [topBlock, height]);

  // 主循环
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;
      if (runningRef.current && !overRef.current) {
        step(dt);
      } else {
        // 即便不运行也更新残块/相机淡出
        cameraRef.current += (Math.min(0, topY() - CANVAS_H * 0.6) - cameraRef.current) * 0.1;
      }
      draw();
      setTick((x) => (x + 1) % 1000000);
    };
    raf = requestAnimationFrame(loop);
    gameOverRef.current = doGameOver;
    return () => cancelAnimationFrame(raf);
  }, [step, draw, doGameOver, topY]);

  // 读取最高分
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
    // 初始基座
    const baseHue = 200;
    stackRef.current = [{ x: (CANVAS_W - START_W) / 2, w: START_W, y: GROUND_Y - BLOCK_H, hue: baseHue }];
    movingRef.current = {
      x: 0,
      w: START_W,
      dir: 1,
      hue: (baseHue + 14) % 360,
    };
    speedRef.current = 2.6;
    debrisRef.current = [];
    particlesRef.current = [];
    floatsRef.current = [];
    cameraRef.current = 0;
    flashRef.current = null;
    perfectFlashRef.current = 0;
    shakeRef.current = 0;
    heightRef.current = 1;
    perfectRef.current = 0;
    scoreRef.current = 50;
    submittedRef.current = false;
    setHeight(1);
    setPerfect(0);
    setScore(50);
    setResult(null);
    runningRef.current = true;
    setRunning(true);
  }, []);

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
    submittedRef.current = false;
    runningRef.current = false;
    stackRef.current = [];
    debrisRef.current = [];
    particlesRef.current = [];
    floatsRef.current = [];
    cameraRef.current = 0;
    heightRef.current = 0;
    perfectRef.current = 0;
    scoreRef.current = 0;
    setHeight(0);
    setPerfect(0);
    setScore(0);
    setOver(false);
    setResult(null);
    setRunning(false);
  }, []);

  // 键盘：空格/回车 落块，P 暂停
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "enter") {
        e.preventDefault();
        if (running && !over) drop();
        else if (fresh) start();
      } else if (k === "p") {
        if (running) pause();
        else if (!over) resume();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, over, drop, pause, resume, start]);

  const stats: GameStat[] = [
    { label: "层数", value: height },
    { label: "分数", value: score },
    { label: "完美", value: perfect },
    { label: "最高", value: best },
  ];

  const fresh = !running && !over && height === 0 && score === 0;
  const paused = !running && !over && !fresh;

  return (
    <GameShell
      gameId={GAME_ID}
      title="物理叠塔"
      description="经典叠塔游戏！方块在顶部左右滑动，看准时机点击让它稳稳落在上一块上。对齐越准，塔越窄得越慢；完美对齐不缩窄还有额外奖励。相机随塔升高而上移，挑战你能堆到第几层！"
      instructions={`方块在画布顶部左右往复滑动，点击画布（或按空格 / 回车）让它落下。新方块只会保留与下方方块重叠的部分，超出部分会被切掉掉落，因此塔会越堆越窄。当偏差小于 ${PERFECT_TOL} 像素时判定为完美对齐：宽度不缩窄、额外加分、略微回长。一旦完全对不上（重叠为 0）即游戏结束。按 P 暂停。`}
      icon={Building2}
      iconEmoji="🏗️"
      iconGradient="from-indigo-400 to-blue-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-[400px] mb-2 px-1 text-xs text-slate-300">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> {height} 层
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 完美 {perfect}
          </span>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onClick={() => {
              if (running && !over) drop();
            }}
            onTouchStart={(e) => {
              if (running && !over) {
                drop();
                e.preventDefault();
              }
            }}
            className="w-full max-w-[400px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-indigo-500/10 cursor-pointer"
          />

          {/* 开始 / 暂停覆盖层 */}
          {(fresh || paused) && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/75 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={fresh ? start : resume}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
              >
                <Play className="w-5 h-5" /> {fresh ? "开始游戏" : "继续游戏"}
              </button>
              {fresh && (
                <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                  点击 / 空格 让方块落下
                  <br />
                  对齐越准，塔越高
                </p>
              )}
            </div>
          )}

          {/* 游戏结束 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🏗️</div>
              <h3 className="text-2xl font-bold mb-2">塔已倾倒</h3>
              <p className="text-sm text-slate-400 mb-1">最终高度</p>
              <p className="text-4xl font-bold text-indigo-400 mb-1">
                {height} <span className="text-lg text-slate-400">层</span>
              </p>
              <p className="text-xs text-slate-500 mb-1">得分 {score} · 完美 {perfect}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-indigo-300 font-bold">{result.rank}</span>/
                  {result.total}，超越了{" "}
                  <span className="text-indigo-300 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-5 flex items-center gap-3">
          {running ? (
            <button
              onClick={pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-200 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              <Pause className="w-4 h-4" /> 暂停
            </button>
          ) : (
            !over &&
            !fresh && (
              <button
                onClick={resume}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
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

        {/* 提示 */}
        <div className="mt-5 w-full max-w-[400px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> 完美 +25 不缩窄
            </span>
            <span className="text-slate-500">空格 / 点击 落块</span>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
