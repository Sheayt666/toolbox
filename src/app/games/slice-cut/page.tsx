"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Scissors, RotateCcw, Play, Pause, Heart, Clock, Zap } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "slice-cut";
const CANVAS_W = 600;
const CANVAS_H = 500;
const BEST_SCORE_KEY = "gm_slicecut_best_score";
const ROUND_TIME = 60;
const GRAVITY = 0.26;

interface Fruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  type: number; // 索引 FRUITS
  rot: number;
  vr: number;
  sliced: boolean;
  half: 0 | 1 | 2; // 0 整, 1 左半, 2 右半
  side: number; // 半块的分离方向
  dead: boolean;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
}
interface SlicePt {
  x: number;
  y: number;
  t: number;
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

const FRUITS = [
  { emoji: "🍎", color: "#ef4444", pts: 10, r: 24 },
  { emoji: "🍊", color: "#f97316", pts: 15, r: 24 },
  { emoji: "🍉", color: "#22c55e", pts: 20, r: 30 },
  { emoji: "🍇", color: "#a855f7", pts: 25, r: 22 },
  { emoji: "🍓", color: "#f43f5e", pts: 15, r: 20 },
  { emoji: "🍌", color: "#eab308", pts: 20, r: 26 },
  { emoji: "🥝", color: "#84cc16", pts: 18, r: 22 },
  { emoji: "🍑", color: "#fb923c", pts: 18, r: 24 },
];
const BOMB = { emoji: "💣", color: "#1f2937", pts: 0, r: 26 };

function distPtSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

export default function SliceCutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fruitsRef = useRef<Fruit[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatsRef = useRef<FloatText[]>([]);
  const sliceRef = useRef<SlicePt[]>([]);
  const lastSlicePtRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const bestRef = useRef(0);
  const timeRef = useRef(ROUND_TIME);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);
  const maxComboRef = useRef(0);
  const idCounterRef = useRef(1);
  const spawnTimerRef = useRef(1);
  const elapsedRef = useRef(0);

  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [best, setBest] = useState(0);
  const [time, setTime] = useState(ROUND_TIME);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [combo, setCombo] = useState(0);
  const [, setTick] = useState(0);

  const gameOverRef = useRef<() => void>(() => {});

  const spawnParticles = useCallback((x: number, y: number, color: string, n: number, spd = 5) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * spd + 1;
      const life = 28 + Math.random() * 22;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 2,
        life,
        max: life,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const addFloat = useCallback((x: number, y: number, text: string, color: string) => {
    floatsRef.current.push({ x, y, text, life: 55, color });
  }, []);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    runningRef.current = false;
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `${s}分 最高连击${maxComboRef.current}`);
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

  const loseLife = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) gameOverRef.current();
  }, []);

  const launchFruit = useCallback((isBomb: boolean) => {
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? 60 + Math.random() * 120 : CANVAS_W - 60 - Math.random() * 120;
    const y = CANVAS_H + 30;
    const targetX = CANVAS_W / 2 + (Math.random() - 0.5) * 200;
    const peakY = 80 + Math.random() * 120;
    // 计算抛物线初速度：先选 vx 让落到 targetX，vy 使最高点约 peakY
    const flightTime = Math.sqrt((2 * (CANVAS_H - peakY)) / GRAVITY) + Math.sqrt((2 * peakY) / GRAVITY);
    const vx = (targetX - x) / flightTime;
    const vy = -Math.sqrt(2 * GRAVITY * (CANVAS_H - peakY));
    const def = isBomb ? BOMB : FRUITS[Math.floor(Math.random() * FRUITS.length)];
    fruitsRef.current.push({
      id: idCounterRef.current++,
      x,
      y,
      vx,
      vy,
      r: def.r,
      type: isBomb ? -1 : FRUITS.indexOf(def),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      sliced: false,
      half: 0,
      side: 0,
      dead: false,
    });
  }, []);

  const sliceFruit = useCallback(
    (f: Fruit, dirX: number, dirY: number) => {
      if (f.sliced) return;
      f.sliced = true;
      const len = Math.hypot(dirX, dirY) || 1;
      const nx = dirX / len;
      const ny = dirY / len;
      // 垂直方向
      const px = -ny;
      const py = nx;

      if (f.type === -1) {
        // 炸弹：扣命 + 爆炸
        spawnParticles(f.x, f.y, "#fbbf24", 24, 7);
        spawnParticles(f.x, f.y, "#f97316", 16, 5);
        addFloat(f.x, f.y - 20, "-1 ❤", "#f43f5e");
        f.dead = true;
        comboRef.current = 0;
        setCombo(0);
        loseLife();
        return;
      }

      const def = FRUITS[f.type];
      // 切成两半
      const split = 3.2;
      fruitsRef.current.push({
        ...f,
        id: idCounterRef.current++,
        half: 1,
        side: -1,
        vx: f.vx + px * split,
        vy: f.vy + py * split,
        vr: f.vr + (Math.random() - 0.5) * 0.3,
      });
      fruitsRef.current.push({
        ...f,
        id: idCounterRef.current++,
        half: 2,
        side: 1,
        vx: f.vx - px * split,
        vy: f.vy - py * split,
        vr: f.vr + (Math.random() - 0.5) * 0.3,
      });
      f.dead = true;

      // 计分 + 连击
      comboRef.current += 1;
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current;
      comboTimerRef.current = 30; // 0.5s
      const comboBonus = comboRef.current >= 2 ? (comboRef.current - 1) * 15 : 0;
      const gained = def.pts + comboBonus;
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setCombo(comboRef.current);
      addFloat(f.x, f.y - 14, `+${gained}${comboRef.current >= 2 ? ` x${comboRef.current}` : ""}`, def.color);
      spawnParticles(f.x, f.y, def.color, 14, 4);
    },
    [spawnParticles, addFloat, loseLife],
  );

  const checkSlice = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const slen = Math.hypot(dx, dy);
      if (slen < 6) return; // 太短不算
      for (const f of fruitsRef.current) {
        if (f.sliced || f.dead) continue;
        if (f.half !== 0) continue; // 只切整果
        if (distPtSeg(f.x, f.y, x1, y1, x2, y2) <= f.r) {
          sliceFruit(f, dx, dy);
        }
      }
    },
    [sliceFruit],
  );

  const physicsStep = useCallback(() => {
    // 生成
    spawnTimerRef.current -= 1;
    if (spawnTimerRef.current <= 0) {
      const wave = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < wave; i++) {
        const bombChance = elapsedRef.current > 8 ? 0.12 : 0.04;
        launchFruit(Math.random() < bombChance);
      }
      spawnTimerRef.current = 42 + Math.floor(Math.random() * 36) - Math.min(20, Math.floor(elapsedRef.current / 4));
    }

    // 水果物理
    for (const f of fruitsRef.current) {
      if (f.dead) continue;
      f.vy += GRAVITY;
      f.x += f.vx;
      f.y += f.vy;
      f.rot += f.vr;
      // 出屏
      if (f.y > CANVAS_H + 60 || f.x < -60 || f.x > CANVAS_W + 60) {
        if (!f.sliced && f.half === 0 && f.type !== -1) {
          // 漏切水果扣命
          loseLife();
          comboRef.current = 0;
          setCombo(0);
        }
        f.dead = true;
      }
    }
    fruitsRef.current = fruitsRef.current.filter((f) => !f.dead);

    // 粒子
    for (const p of particlesRef.current) {
      p.vy += 0.25;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
    }
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    // 浮字
    for (const ft of floatsRef.current) {
      ft.y -= 0.7;
      ft.life -= 1;
    }
    floatsRef.current = floatsRef.current.filter((ft) => ft.life > 0);

    // 连击计时
    if (comboTimerRef.current > 0) {
      comboTimerRef.current -= 1;
      if (comboTimerRef.current <= 0) {
        comboRef.current = 0;
        setCombo(0);
      }
    }

    // 切片轨迹老化
    const now = performance.now();
    sliceRef.current = sliceRef.current.filter((p) => now - p.t < 220);
  }, [launchFruit, loseLife]);

  const step = useCallback(
    (dt: number) => {
      const steps = Math.max(1, Math.min(3, Math.round(dt)));
      for (let i = 0; i < steps; i++) physicsStep();
      // 计时（按真实步数 ~60fps）
      elapsedRef.current += steps / 60;
      timeRef.current = Math.max(0, ROUND_TIME - elapsedRef.current);
      if (timeRef.current <= 0) {
        gameOverRef.current();
      }
    },
    [physicsStep],
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
    const t = animFrameRef.current;
    const now = performance.now();

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, "#1a0e08");
    bg.addColorStop(1, "#0a0606");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // 背景光晕
    const glow = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H, 10, CANVAS_W / 2, CANVAS_H, CANVAS_W);
    glow.addColorStop(0, "rgba(249,115,22,0.12)");
    glow.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // 星点
    ctx.fillStyle = "rgba(251,146,60,0.2)";
    for (let i = 0; i < 40; i++) {
      const x = (i * 79) % CANVAS_W;
      const y = (i * 47) % CANVAS_H;
      ctx.fillRect(x, y, 1, 1);
    }

    // 水果
    for (const f of fruitsRef.current) {
      const def = f.type === -1 ? BOMB : FRUITS[f.type];
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      if (f.half === 0) {
        // 整果
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 12;
        const grad = ctx.createRadialGradient(-f.r * 0.3, -f.r * 0.3, 2, 0, 0, f.r);
        grad.addColorStop(0, "#fff");
        grad.addColorStop(0.5, def.color);
        grad.addColorStop(1, "#000");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = `${f.r}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(def.emoji, 0, f.r * 0.05);
      } else {
        // 半块：画半圆
        ctx.shadowColor = def.color;
        ctx.shadowBlur = 8;
        const grad = ctx.createRadialGradient(-f.r * 0.3, -f.r * 0.3, 2, 0, 0, f.r);
        grad.addColorStop(0, "#fff");
        grad.addColorStop(0.5, def.color);
        grad.addColorStop(1, "#000");
        ctx.fillStyle = grad;
        ctx.beginPath();
        const start = f.half === 1 ? Math.PI / 2 : -Math.PI / 2;
        const end = f.half === 1 ? (Math.PI * 3) / 2 : Math.PI / 2;
        ctx.arc(0, 0, f.r, start, end);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // 切面
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -f.r);
        ctx.lineTo(0, f.r);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 粒子
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 浮字
    for (const ft of floatsRef.current) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.life / 55);
      ctx.fillStyle = ft.color;
      ctx.font = "bold 16px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 8;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // 切片轨迹
    const trail = sliceRef.current;
    if (trail.length >= 2) {
      ctx.save();
      for (let i = 1; i < trail.length; i++) {
        const p0 = trail[i - 1];
        const p1 = trail[i];
        const age = (now - p1.t) / 220;
        ctx.globalAlpha = 1 - age;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = (1 - age) * 6 + 1;
        ctx.lineCap = "round";
        ctx.shadowColor = "#fb923c";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 连击显示
    if (combo >= 2) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, comboTimerRef.current / 30);
      ctx.fillStyle = "#fb923c";
      ctx.font = "bold 28px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = 14;
      const pulse = 1 + Math.sin(t * 0.4) * 0.06;
      ctx.save();
      ctx.translate(CANVAS_W / 2, 70);
      ctx.scale(pulse, pulse);
      ctx.fillText(`连击 x${combo}`, 0, 0);
      ctx.restore();
      ctx.restore();
    }

    // 时间条
    const tw = (timeRef.current / ROUND_TIME) * (CANVAS_W - 40);
    ctx.save();
    ctx.fillStyle = "rgba(9,9,11,0.6)";
    drawRoundRect(ctx, 20, 12, CANVAS_W - 40, 8, 4);
    ctx.fill();
    const tg = ctx.createLinearGradient(20, 0, CANVAS_W - 20, 0);
    tg.addColorStop(0, "#22c55e");
    tg.addColorStop(0.7, "#eab308");
    tg.addColorStop(1, "#ef4444");
    ctx.fillStyle = tg;
    drawRoundRect(ctx, 20, 12, Math.max(0, tw), 8, 4);
    ctx.fill();
    ctx.restore();
  }, [combo]);

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
      }
      draw();
      setTick((x) => (x + 1) % 1000000);
    };
    raf = requestAnimationFrame(loop);
    gameOverRef.current = doGameOver;
    return () => cancelAnimationFrame(raf);
  }, [step, draw, doGameOver]);

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
    fruitsRef.current = [];
    particlesRef.current = [];
    floatsRef.current = [];
    sliceRef.current = [];
    lastSlicePtRef.current = null;
    scoreRef.current = 0;
    livesRef.current = 3;
    timeRef.current = ROUND_TIME;
    elapsedRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    spawnTimerRef.current = 30;
    submittedRef.current = false;
    idCounterRef.current = 1;
    setScore(0);
    setLives(3);
    setTime(ROUND_TIME);
    setCombo(0);
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
    fruitsRef.current = [];
    particlesRef.current = [];
    floatsRef.current = [];
    sliceRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    timeRef.current = ROUND_TIME;
    elapsedRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setLives(3);
    setTime(ROUND_TIME);
    setCombo(0);
    setOver(false);
    setResult(null);
    setRunning(false);
  }, []);

  // 切片输入
  const getPos = (clientX: number, clientY: number) => {
    const cv = canvasRef.current;
    if (!cv) return { x: 0, y: 0 };
    const rect = cv.getBoundingClientRect();
    const sx = rect.width > 0 ? CANVAS_W / rect.width : 1;
    const sy = rect.height > 0 ? CANVAS_H / rect.height : 1;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  };
  const onPointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!runningRef.current || overRef.current) return;
      const { x, y } = getPos(clientX, clientY);
      const now = performance.now();
      const prev = lastSlicePtRef.current;
      if (prev) {
        const d = Math.hypot(x - prev.x, y - prev.y);
        if (d > 3) {
          checkSlice(prev.x, prev.y, x, y);
          sliceRef.current.push({ x, y, t: now });
          if (sliceRef.current.length > 24) sliceRef.current.shift();
          lastSlicePtRef.current = { x, y, t: now };
        }
      } else {
        lastSlicePtRef.current = { x, y, t: now };
        sliceRef.current.push({ x, y, t: now });
      }
    },
    [checkSlice],
  );
  const onPointerEnd = useCallback(() => {
    lastSlicePtRef.current = null;
  }, []);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "生命", value: lives },
    { label: "时间", value: `${Math.ceil(time)}s` },
    { label: "最高", value: best },
  ];

  const fresh = !running && !over && score === 0 && time === ROUND_TIME;
  const paused = !running && !over && !fresh;

  return (
    <GameShell
      gameId={GAME_ID}
      title="切割大师"
      description="水果从屏幕两侧抛出，划过空中划出弧线。用鼠标快速拖动划出刀光，切开水果得分，连切触发连击加成！小心炸弹——切到会扣命。3 条命、60 秒，挑战你的极限手速。"
      instructions={`在画布上按住鼠标快速拖动（移动端用手指滑动）划出刀光，刀光经过的水果会被切成两半并飞溅。不同水果分值不同（10–25），一次拖动连切多个水果触发连击，连击数越高奖励越多。切到炸弹 💣 扣 1 命；让普通水果掉出屏幕也会扣 1 命。共 3 命、60 秒。按 P 暂停。`}
      icon={Scissors}
      iconEmoji="🔪"
      iconGradient="from-orange-400 to-red-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-[600px] mb-2 px-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? "text-rose-500 fill-rose-500" : "text-slate-700"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" /> {Math.ceil(time)}s
            </span>
            {combo >= 2 && (
              <span className="flex items-center gap-1 text-orange-400 font-bold">
                <Zap className="w-3.5 h-3.5" /> x{combo}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
            onMouseLeave={onPointerEnd}
            onTouchStart={(e) => {
              if (e.touches[0]) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
              }
            }}
            onTouchEnd={onPointerEnd}
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-orange-500/10 cursor-crosshair"
          />

          {/* 开始 / 暂停覆盖层 */}
          {(fresh || paused) && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/75 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={fresh ? start : resume}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
              >
                <Play className="w-5 h-5" /> {fresh ? "开始游戏" : "继续游戏"}
              </button>
              {fresh && (
                <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                  按住鼠标快速拖动划出刀光
                  <br />
                  切水果得分，躲开炸弹
                </p>
              )}
            </div>
          )}

          {/* 游戏结束 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🔪</div>
              <h3 className="text-2xl font-bold mb-2">
                {lives <= 0 ? "命已用尽" : "时间到"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-orange-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                最高连击 x{maxComboRef.current}
                {score >= best && score > 0 ? " · 新纪录！" : ` · 最高: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-orange-300 font-bold">{result.rank}</span>/
                  {result.total}，超越了{" "}
                  <span className="text-orange-300 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors shadow-lg shadow-orange-500/30"
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
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
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

        {/* 水果分值 */}
        <div className="mt-5 w-full max-w-[600px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            {FRUITS.slice(0, 6).map((f) => (
              <span key={f.emoji} className="flex items-center gap-1">
                <span>{f.emoji}</span>
                <span className="text-slate-500">{f.pts}</span>
              </span>
            ))}
            <span className="flex items-center gap-1 text-rose-400">
              <span>💣</span> 切到扣命
            </span>
            <span className="text-orange-400">连击 +15/层</span>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
