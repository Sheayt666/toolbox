"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore, recordGamePlay } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "parkour-rush";
const W = 400;
const H = 600;
const BEST_KEY = "gm_parkour_rush_best";

// 物理
const GRAVITY = 0.7;
const JUMP_VEL = -14;
const MAX_FALL = 18;
const MOVE_ACCEL = 0.8;
const MOVE_MAX = 5.5;
const FRICTION = 0.85;

// 角色
const GROUND_Y = 462; // 站立时角色顶部Y
const STAND_H = 48;
const STAND_W = 34;
const SLIDE_H = 24;
const SLIDE_W = 46;
const SLIDE_MS = 520;

// 障碍
type ObstacleType = "low" | "high" | "wall";

interface Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
  passed: boolean;
  color: string;
}

interface Coin {
  x: number;
  y: number;
  r: number;
  collected: boolean;
  spin: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface BgBuilding {
  x: number;
  w: number;
  h: number;
  color: string;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ============ 工具函数 ============ */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const f = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c * (1 + amt))));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

/* ============ 组件 ============ */
export default function ParkourRushPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 游戏状态 (refs)
  const charXRef = useRef(W / 2 - STAND_W / 2);
  const charYRef = useRef(GROUND_Y);
  const vyRef = useRef(0);
  const vxRef = useRef(0);
  const isJumpingRef = useRef(false);
  const isSlidingRef = useRef(false);
  const slideEndRef = useRef(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const buildingsRef = useRef<BgBuilding[]>([]);
  const speedRef = useRef(3);
  const distanceRef = useRef(0);
  const coinCountRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const coinTimerRef = useRef(0);
  const inputRef = useRef({ left: false, right: false });
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const pausedRef = useRef(false);
  const frameRef = useRef(0);

  // UI 状态
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (saved > 0) {
        bestRef.current = saved;
        setBest(saved);
      }
    } catch {
      /* ignore */
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  /* ----- 生成背景建筑 ----- */
  const genBuildings = useCallback(() => {
    const list: BgBuilding[] = [];
    let x = -20;
    while (x < W + 100) {
      const w = 40 + Math.random() * 60;
      const h = 80 + Math.random() * 200;
      const hue = 220 + Math.random() * 40;
      list.push({
        x,
        w,
        h,
        color: `hsl(${hue},25%,${8 + Math.random() * 6}%)`,
      });
      x += w + 2;
    }
    buildingsRef.current = list;
  }, []);

  /* ----- 生成障碍 ----- */
  const spawnObstacle = useCallback(() => {
    const types: ObstacleType[] = ["low", "high", "wall"];
    const t = types[Math.floor(Math.random() * types.length)];
    if (t === "low") {
      obstaclesRef.current.push({
        type: "low",
        x: 0,
        y: GROUND_Y + STAND_H - 30,
        w: W,
        h: 32,
        passed: false,
        color: "#f97316",
      });
    } else if (t === "high") {
      obstaclesRef.current.push({
        type: "high",
        x: 0,
        y: GROUND_Y - 6,
        w: W,
        h: 38,
        passed: false,
        color: "#8b5cf6",
      });
    } else {
      const leftSide = Math.random() < 0.5;
      obstaclesRef.current.push({
        type: "wall",
        x: leftSide ? 0 : W * 0.45,
        y: GROUND_Y - 60,
        w: W * 0.55,
        h: STAND_H + 60,
        passed: false,
        color: "#ef4444",
      });
    }
  }, []);

  const spawnCoin = useCallback(() => {
    const x = 30 + Math.random() * (W - 60);
    coinsRef.current.push({
      x,
      y: -20,
      r: 10,
      collected: false,
      spin: 0,
    });
  }, []);

  /* ----- 碰撞检测 ----- */
  const checkCollision = useCallback((): boolean => {
    const cx = charXRef.current;
    const cy = charYRef.current;
    const cw = isSlidingRef.current ? SLIDE_W : STAND_W;
    const ch = isSlidingRef.current ? SLIDE_H : STAND_H;

    for (const o of obstaclesRef.current) {
      if (o.passed) continue;
      // AABB
      if (
        cx < o.x + o.w &&
        cx + cw > o.x &&
        cy < o.y + o.h &&
        cy + ch > o.y
      ) {
        return true;
      }
    }
    return false;
  }, []);

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const dist = Math.floor(distanceRef.current);
    const coinScore = coinCountRef.current * 10;
    const finalScore = dist + coinScore;
    const r = submitScore(GAME_ID, finalScore, `距离${dist}m 金币${coinCountRef.current}`);
    setResult(r);
    setRefreshKey((k) => k + 1);
    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBest(finalScore);
      try {
        localStorage.setItem(BEST_KEY, String(finalScore));
      } catch {
        /* ignore */
      }
    }
  }, []);

  /* ----- 粒子效果 ----- */
  const addParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const sp = 1 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp - 1,
        life: 1,
        maxLife: 1,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  /* ----- 更新逻辑 ----- */
  const update = useCallback(() => {
    frameRef.current++;
    const speed = speedRef.current;

    // 距离 & 速度
    distanceRef.current += speed * 0.06;
    speedRef.current = Math.min(speed + 0.0015, 9);

    // 水平移动
    const input = inputRef.current;
    if (input.left) {
      vxRef.current -= MOVE_ACCEL;
    }
    if (input.right) {
      vxRef.current += MOVE_ACCEL;
    }
    if (!input.left && !input.right) {
      vxRef.current *= FRICTION;
    }
    vxRef.current = Math.max(-MOVE_MAX, Math.min(MOVE_MAX, vxRef.current));
    charXRef.current += vxRef.current;
    charXRef.current = Math.max(2, Math.min(W - STAND_W - 2, charXRef.current));

    // 跳跃物理
    if (isJumpingRef.current) {
      vyRef.current += GRAVITY;
      if (vyRef.current > MAX_FALL) vyRef.current = MAX_FALL;
      charYRef.current += vyRef.current;
      if (charYRef.current >= GROUND_Y) {
        charYRef.current = GROUND_Y;
        vyRef.current = 0;
        isJumpingRef.current = false;
      }
    }

    // 滑铲结束
    if (isSlidingRef.current && Date.now() > slideEndRef.current) {
      isSlidingRef.current = false;
    }

    // 障碍物移动
    for (const o of obstaclesRef.current) {
      o.y += speed;
    }
    // 移除离屏障碍 & 标记已通过
    obstaclesRef.current = obstaclesRef.current.filter((o) => {
      if (o.y > H + 50) return false;
      return true;
    });

    // 金币移动
    for (const c of coinsRef.current) {
      c.y += speed;
      c.spin += 0.15;
    }
    // 金币碰撞
    const cx = charXRef.current;
    const cy = charYRef.current;
    const cw = isSlidingRef.current ? SLIDE_W : STAND_W;
    const ch = isSlidingRef.current ? SLIDE_H : STAND_H;
    for (const c of coinsRef.current) {
      if (c.collected) continue;
      const dx = (cx + cw / 2) - c.x;
      const dy = (cy + ch / 2) - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < c.r + 18) {
        c.collected = true;
        coinCountRef.current++;
        setCoins(coinCountRef.current);
        addParticles(c.x, c.y, "#fbbf24", 8);
      }
    }
    coinsRef.current = coinsRef.current.filter((c) => !c.collected && c.y < H + 30);

    // 粒子更新
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= 0.03;
    }
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    // 生成障碍
    spawnTimerRef.current -= speed;
    if (spawnTimerRef.current <= 0) {
      spawnObstacle();
      spawnTimerRef.current = 180 + Math.random() * 120;
    }

    // 生成金币
    coinTimerRef.current -= speed;
    if (coinTimerRef.current <= 0) {
      spawnCoin();
      coinTimerRef.current = 100 + Math.random() * 80;
    }

    // 碰撞检测
    if (checkCollision()) {
      addParticles(cx + cw / 2, cy + ch / 2, "#ef4444", 16);
      doGameOver();
    }

    // 更新分数
    const newScore = Math.floor(distanceRef.current) + coinCountRef.current * 10;
    setScore(newScore);
  }, [spawnObstacle, spawnCoin, checkCollision, doGameOver, addParticles]);

  /* ----- 绘制 ----- */
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = cv.getContext("2d");
      if (!ctx) return;
      ctxRef.current = ctx;
    }
    animRef.current++;

    // 背景渐变
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0a1a");
    bg.addColorStop(0.4, "#12122a");
    bg.addColorStop(0.8, "#1a0a1a");
    bg.addColorStop(1, "#0a0510");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 背景建筑（视差滚动）
    const scrollOffset = (distanceRef.current * 0.3) % W;
    ctx.save();
    for (const b of buildingsRef.current) {
      const bx = b.x - scrollOffset;
      const drawX = ((bx % (W + 100)) + (W + 100)) % (W + 100) - 50;
      ctx.fillStyle = b.color;
      ctx.fillRect(drawX, H - b.h - 50, b.w, b.h);
      // 窗户
      ctx.fillStyle = "rgba(255,220,100,0.12)";
      for (let wy = H - b.h - 40; wy < H - 60; wy += 16) {
        for (let wx = drawX + 6; wx < drawX + b.w - 6; wx += 14) {
          if ((wx + wy + b.w) % 3 === 0) {
            ctx.fillRect(wx, wy, 6, 8);
          }
        }
      }
    }
    ctx.restore();

    // 地面
    const groundY = GROUND_Y + STAND_H;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
    groundGrad.addColorStop(0, "#1e1b4b");
    groundGrad.addColorStop(1, "#0a0a14");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, W, H - groundY);
    // 地面线
    ctx.strokeStyle = "rgba(139,92,246,0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();
    // 地面纹理（速度线）
    ctx.strokeStyle = "rgba(139,92,246,0.15)";
    ctx.lineWidth = 1;
    const lineOffset = (distanceRef.current * 2) % 40;
    for (let i = 0; i < 8; i++) {
      const ly = groundY + 10 + i * 16;
      ctx.beginPath();
      ctx.moveTo(-lineOffset, ly);
      ctx.lineTo(W, ly);
      ctx.stroke();
    }

    // 速度线
    if (speedRef.current > 4) {
      ctx.strokeStyle = `rgba(255,255,255,${(speedRef.current - 4) * 0.04})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const ly = (animRef.current * speedRef.current * 2 + i * 100) % H;
        ctx.beginPath();
        ctx.moveTo(W - 10, ly);
        ctx.lineTo(W - 40, ly);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(10, ly + 50);
        ctx.lineTo(40, ly + 50);
        ctx.stroke();
      }
    }

    // 障碍物
    for (const o of obstaclesRef.current) {
      ctx.save();
      ctx.shadowColor = o.color;
      ctx.shadowBlur = 12;
      const grad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.h);
      grad.addColorStop(0, o.color);
      grad.addColorStop(1, shade(o.color, -0.3));
      ctx.fillStyle = grad;
      if (o.type === "low") {
        // 低矮障碍 - 尖刺
        roundRect(ctx, o.x, o.y, o.w, o.h, 4);
        ctx.fill();
        ctx.fillStyle = shade(o.color, 0.2);
        ctx.fillRect(o.x, o.y, o.w, 4);
      } else if (o.type === "high") {
        // 高空障碍 - 悬挂横梁
        roundRect(ctx, o.x, o.y, o.w, o.h, 4);
        ctx.fill();
        ctx.fillStyle = shade(o.color, 0.2);
        ctx.fillRect(o.x, o.y + o.h - 4, o.w, 4);
        // 悬挂线
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1;
        for (let lx = o.x + 20; lx < o.x + o.w; lx += 60) {
          ctx.beginPath();
          ctx.moveTo(lx, 0);
          ctx.lineTo(lx, o.y);
          ctx.stroke();
        }
      } else {
        // 墙壁
        roundRect(ctx, o.x, o.y, o.w, o.h, 4);
        ctx.fill();
        ctx.fillStyle = shade(o.color, 0.15);
        ctx.fillRect(o.x + 2, o.y + 2, o.w - 4, 6);
        // 警示条纹
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        for (let sy = o.y + 16; sy < o.y + o.h - 4; sy += 12) {
          ctx.fillRect(o.x + 4, sy, o.w - 8, 4);
        }
      }
      ctx.restore();
    }

    // 金币
    for (const c of coinsRef.current) {
      if (c.collected) continue;
      ctx.save();
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 10;
      const scaleX = Math.abs(Math.cos(c.spin));
      ctx.translate(c.x, c.y);
      ctx.scale(scaleX, 1);
      const cg = ctx.createRadialGradient(-3, -3, 1, 0, 0, c.r);
      cg.addColorStop(0, "#fef08a");
      cg.addColorStop(0.5, "#fbbf24");
      cg.addColorStop(1, "#d97706");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(-3, -3, c.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 粒子
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 角色
    const px = charXRef.current;
    const py = charYRef.current;
    const pw = isSlidingRef.current ? SLIDE_W : STAND_W;
    const ph = isSlidingRef.current ? SLIDE_H : STAND_H;

    ctx.save();
    ctx.shadowColor = "rgba(34,211,238,0.5)";
    ctx.shadowBlur = 12;
    // 身体
    const bodyGrad = ctx.createLinearGradient(px, py, px, py + ph);
    bodyGrad.addColorStop(0, "#67e8f9");
    bodyGrad.addColorStop(0.5, "#22d3ee");
    bodyGrad.addColorStop(1, "#0891b2");
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, px, py, pw, ph, isSlidingRef.current ? 10 : 14);
    ctx.fill();
    ctx.restore();

    // 眼睛
    ctx.fillStyle = "#fff";
    const eyeY = py + (isSlidingRef.current ? 8 : 14);
    ctx.beginPath();
    ctx.arc(px + pw * 0.3, eyeY, 4, 0, Math.PI * 2);
    ctx.arc(px + pw * 0.7, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(px + pw * 0.3, eyeY, 2, 0, Math.PI * 2);
    ctx.arc(px + pw * 0.7, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();

    // 腿部动画（跑步）
    if (!isSlidingRef.current && !isJumpingRef.current) {
      const legPhase = Math.sin(animRef.current * 0.3);
      ctx.fillStyle = "#0891b2";
      ctx.fillRect(px + 6, py + ph - 2, 8, 4 + legPhase * 2);
      ctx.fillRect(px + pw - 14, py + ph - 2, 8, 4 - legPhase * 2);
    }

    // 滑铲尾迹
    if (isSlidingRef.current) {
      ctx.fillStyle = "rgba(34,211,238,0.3)";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(px - i * 10 - 4, py + ph - 6, 8, 4);
      }
    }

    // 跳跃尾迹
    if (isJumpingRef.current && vyRef.current < 0) {
      ctx.fillStyle = "rgba(34,211,238,0.2)";
      for (let i = 0; i < 3; i++) {
        ctx.fillRect(px + pw / 2 - 3, py + ph + i * 8, 6, 4);
      }
    }
  }, []);

  /* ----- 主循环 ----- */
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((time - last) / 16.67, 2);
      last = time;
      if (runningRef.current && !overRef.current && !pausedRef.current) {
        for (let i = 0; i < dt; i++) {
          update();
        }
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [update, draw]);

  /* ----- 初始化 ----- */
  useEffect(() => {
    genBuildings();
  }, [genBuildings]);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    charXRef.current = W / 2 - STAND_W / 2;
    charYRef.current = GROUND_Y;
    vyRef.current = 0;
    vxRef.current = 0;
    isJumpingRef.current = false;
    isSlidingRef.current = false;
    obstaclesRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    speedRef.current = 3;
    distanceRef.current = 0;
    coinCountRef.current = 0;
    spawnTimerRef.current = 120;
    coinTimerRef.current = 60;
    submittedRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setScore(0);
    setCoins(0);
    setOver(false);
    setResult(null);
    runningRef.current = true;
    setRunning(true);
    genBuildings();
    recordGamePlay(GAME_ID, 0);
  }, [genBuildings]);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    charXRef.current = W / 2 - STAND_W / 2;
    charYRef.current = GROUND_Y;
    vyRef.current = 0;
    vxRef.current = 0;
    isJumpingRef.current = false;
    isSlidingRef.current = false;
    obstaclesRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    speedRef.current = 3;
    distanceRef.current = 0;
    coinCountRef.current = 0;
    setScore(0);
    setCoins(0);
    setOver(false);
    setResult(null);
    setRunning(false);
    pausedRef.current = false;
    setPaused(false);
  }, []);

  /* ----- 暂停 ----- */
  const togglePause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    setPaused((p) => {
      const np = !p;
      pausedRef.current = np;
      return np;
    });
  }, []);

  /* ----- 跳跃 ----- */
  const doJump = useCallback(() => {
    if (!runningRef.current || overRef.current || pausedRef.current) return;
    if (!isJumpingRef.current && !isSlidingRef.current) {
      vyRef.current = JUMP_VEL;
      isJumpingRef.current = true;
    }
  }, []);

  /* ----- 滑铲 ----- */
  const doSlide = useCallback(() => {
    if (!runningRef.current || overRef.current || pausedRef.current) return;
    if (!isSlidingRef.current) {
      isSlidingRef.current = true;
      slideEndRef.current = Date.now() + SLIDE_MS;
      if (isJumpingRef.current) {
        // 空中滑铲加速下落
        vyRef.current = Math.max(vyRef.current, 10);
      }
    }
  }, []);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "a" || k === "arrowleft") {
        inputRef.current.left = true;
        e.preventDefault();
      } else if (k === "d" || k === "arrowright") {
        inputRef.current.right = true;
        e.preventDefault();
      } else if (k === "w" || k === " " || k === "arrowup") {
        e.preventDefault();
        if (!runningRef.current && !overRef.current) {
          start();
        } else {
          doJump();
        }
      } else if (k === "s" || k === "arrowdown") {
        e.preventDefault();
        doSlide();
      } else if (k === "p") {
        e.preventDefault();
        togglePause();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "a" || k === "arrowleft") {
        inputRef.current.left = false;
      } else if (k === "d" || k === "arrowright") {
        inputRef.current.right = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [start, doJump, doSlide, togglePause]);

  /* ----- 触摸控制（滑动） ----- */
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!runningRef.current || overRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (absDx < 20 && absDy < 20) return; // tap, ignore
    if (absDy > absDx) {
      if (dy < 0) doJump();
      else doSlide();
    } else {
      if (dx < 0) {
        inputRef.current.left = true;
        const timer = setTimeout(() => { inputRef.current.left = false; }, 150);
        timersRef.current.push(timer);
      } else {
        inputRef.current.right = true;
        const timer = setTimeout(() => { inputRef.current.right = false; }, 150);
        timersRef.current.push(timer);
      }
    }
  };

  const stats: GameStat[] = [
    { label: "距离", value: `${Math.floor(distanceRef.current)}m`, icon: "📏" },
    { label: "金币", value: coins, icon: "🪙" },
    { label: "当前分数", value: score, icon: "⭐" },
    { label: "最佳", value: best, icon: "🏆" },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="极速跑酷"
      iconEmoji="🏃"
      iconGradient="from-orange-400 to-red-600"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="w-full max-w-[400px] h-auto rounded-xl touch-none shadow-lg shadow-cyan-500/10"
            style={{ imageRendering: "pixelated" }}
          />

          {/* 开始界面 */}
          {!running && !over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
              <div className="text-6xl mb-4">🏃</div>
              <h2 className="text-3xl font-bold text-white mb-2">极速跑酷</h2>
              <p className="text-sm text-gray-300 mb-6 text-center px-4 leading-relaxed">
                向前奔跑，躲避障碍，收集金币！
                <br />
                速度会越来越快，挑战你的极限！
              </p>
              <div className="flex flex-col gap-2 mb-6 text-xs text-gray-400">
                <div className="flex items-center gap-2"><span className="text-orange-400">A/D</span> 左右移动</div>
                <div className="flex items-center gap-2"><span className="text-orange-400">W/空格</span> 跳跃</div>
                <div className="flex items-center gap-2"><span className="text-orange-400">S</span> 滑铲</div>
                <div className="flex items-center gap-2"><span className="text-orange-400">P</span> 暂停</div>
              </div>
              <button
                onClick={start}
                aria-label="开始游戏"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg shadow-lg shadow-orange-500/30 transition hover:scale-105 active:scale-95"
              >
                开始跑酷
              </button>
            </div>
          )}

          {/* 暂停界面 */}
          {paused && running && !over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
              <div className="text-5xl mb-3">⏸️</div>
              <h3 className="text-2xl font-bold text-white mb-4">已暂停</h3>
              <button
                onClick={togglePause}
                aria-label="继续游戏"
                className="h-12 px-6 rounded-xl bg-orange-500 text-white font-medium shadow-lg transition hover:bg-orange-600 active:scale-95"
              >
                继续
              </button>
            </div>
          )}

          {/* 结束界面 */}
          {over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/80 backdrop-blur-md p-4">
              <div className="text-5xl mb-3">💥</div>
              <h3 className="text-2xl font-bold text-white mb-4">游戏结束</h3>
              <div className="grid grid-cols-2 gap-3 mb-4 w-full max-w-[280px]">
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">距离</div>
                  <div className="text-xl font-bold text-cyan-400">{Math.floor(distanceRef.current)}m</div>
                </div>
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">金币</div>
                  <div className="text-xl font-bold text-yellow-400">{coins}</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-2">{score}</div>
              <p className="text-xs text-gray-400 mb-1">
                {score >= best && score > 0 ? "🎉 新纪录！" : `最佳: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-gray-400 mb-4">
                  排名第 <span className="text-orange-400 font-bold">{result.rank}</span>/{result.total}
                  ，超越 <span className="text-orange-400 font-bold">{result.beatPercent}%</span> 玩家
                </p>
              )}
              <button
                onClick={restart}
                aria-label="重新开始"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg transition hover:scale-105 active:scale-95"
              >
                再来一局
              </button>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {!running && !over && (
            <button
              onClick={start}
              aria-label="开始游戏"
              className="h-11 px-6 rounded-xl bg-orange-500 text-white font-medium shadow-lg transition hover:bg-orange-600 active:scale-95"
            >
              开始
            </button>
          )}
          {running && !over && (
            <button
              onClick={togglePause}
              aria-label="暂停游戏"
              className="h-11 px-6 rounded-xl bg-amber-500 text-white font-medium shadow-lg transition hover:bg-amber-600 active:scale-95"
            >
              {paused ? "继续" : "暂停"}
            </button>
          )}
          <button
            onClick={restart}
            aria-label="重新开始游戏"
            className="h-11 px-6 rounded-xl bg-gray-700 text-white font-medium shadow-lg transition hover:bg-gray-600 active:scale-95"
          >
            重新开始
          </button>
        </div>

        {/* 移动端控制 */}
        <div className="mt-3 grid grid-cols-4 gap-2 sm:hidden w-full max-w-[400px]">
          <button
            onTouchStart={(e) => { e.preventDefault(); inputRef.current.left = true; }}
            onTouchEnd={(e) => { e.preventDefault(); inputRef.current.left = false; }}
            aria-label="向左移动"
            className="h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-orange-600 transition border border-gray-700"
          >
            ←
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); doJump(); }}
            aria-label="跳跃"
            className="h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-orange-600 transition border border-gray-700"
          >
            ↑
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); doSlide(); }}
            aria-label="滑铲"
            className="h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-orange-600 transition border border-gray-700"
          >
            ↓
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); inputRef.current.right = true; }}
            onTouchEnd={(e) => { e.preventDefault(); inputRef.current.right = false; }}
            aria-label="向右移动"
            className="h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-orange-600 transition border border-gray-700"
          >
            →
          </button>
        </div>
      </div>
    </GameShell>
  );
}
