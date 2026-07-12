"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore, recordGamePlay } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "rocket-leap";
const W = 500;
const H = 600;
const BEST_KEY = "gm_rocket_leap_best";

const GRAVITY = 0.35;
const MAX_POWER = 18;
const CHARGE_RATE = 0.3;
const CHAR_R = 14;
const PLATFORM_H = 14;
const FIXED_SCREEN_Y = 250;

interface Platform {
  x: number;
  y: number;
  w: number;
  landed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  tw: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function genPlatform(y: number, jumpCount: number): Platform {
  const minW = Math.max(50, 100 - jumpCount * 3);
  const maxW = Math.max(70, 130 - jumpCount * 3);
  const w = minW + Math.random() * (maxW - minW);
  const x = 30 + Math.random() * (W - w - 60);
  return { x, y, w, landed: false };
}

function genStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < 50; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.5 + Math.random() * 1.8,
      tw: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

/* ============ 组件 ============ */
export default function RocketLeapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 游戏状态
  const charXRef = useRef(W / 2);
  const charYRef = useRef(550);
  const prevCharYRef = useRef(550);
  const vxRef = useRef(0);
  const vyRef = useRef(0);
  const powerRef = useRef(0);
  const aimXRef = useRef(0);
  const aimYRef = useRef(0);
  const chargingRef = useRef(false);
  const onPlatformRef = useRef(true);
  const platformsRef = useRef<Platform[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const cameraYRef = useRef(0);
  const maxClimbRef = useRef(0);
  const jumpCountRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const pausedRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [jumps, setJumps] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    starsRef.current = genStars();
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

  /* ----- 粒子 ----- */
  const addParticles = useCallback((x: number, y: number, color: string, count: number, spread: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sp = 0.5 + Math.random() * spread;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        life: 1,
        color,
        size: 1.5 + Math.random() * 2.5,
      });
    }
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
    const heightBonus = Math.floor(maxClimbRef.current / 10);
    const finalScore = jumpCountRef.current * 10 + heightBonus;
    const r = submitScore(GAME_ID, finalScore, `${jumpCountRef.current}跳 高度${heightBonus}m`);
    setResult(r);
    setRefreshKey(k => k + 1);
    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBest(finalScore);
      try { localStorage.setItem(BEST_KEY, String(finalScore)); } catch { /* ignore */ }
    }
  }, []);

  /* ----- 着陆处理 ----- */
  const handleLanding = useCallback((p: Platform) => {
    charYRef.current = p.y - CHAR_R;
    vyRef.current = 0;
    vxRef.current = 0;
    onPlatformRef.current = true;
    if (!p.landed) {
      p.landed = true;
      jumpCountRef.current++;
      setJumps(jumpCountRef.current);
      const heightBonus = Math.floor(maxClimbRef.current / 10);
      setScore(jumpCountRef.current * 10 + heightBonus);
      addParticles(charXRef.current, p.y, "#fbbf24", 12, 3);
    }
  }, [addParticles]);

  /* ----- 更新 ----- */
  const update = useCallback(() => {
    // 充能
    if (chargingRef.current && onPlatformRef.current) {
      powerRef.current = Math.min(powerRef.current + CHARGE_RATE, MAX_POWER);
    }

    // 物理（飞行中）
    if (!onPlatformRef.current) {
      prevCharYRef.current = charYRef.current;
      vyRef.current += GRAVITY;
      charXRef.current += vxRef.current;
      charYRef.current += vyRef.current;

      // 火焰尾迹
      if (Math.random() < 0.6) {
        particlesRef.current.push({
          x: charXRef.current - vxRef.current * 0.5,
          y: charYRef.current - vyRef.current * 0.5,
          vx: -vxRef.current * 0.1 + (Math.random() - 0.5),
          vy: -vyRef.current * 0.1 + (Math.random() - 0.5),
          life: 0.6,
          color: Math.random() < 0.5 ? "#f97316" : "#fbbf24",
          size: 2 + Math.random() * 2,
        });
      }

      // 左右边界
      if (charXRef.current < CHAR_R) {
        charXRef.current = CHAR_R;
        vxRef.current = Math.abs(vxRef.current) * 0.5;
      }
      if (charXRef.current > W - CHAR_R) {
        charXRef.current = W - CHAR_R;
        vxRef.current = -Math.abs(vxRef.current) * 0.5;
      }

      // 着陆检测
      if (vyRef.current > 0) {
        const feet = charYRef.current + CHAR_R;
        const prevFeet = prevCharYRef.current + CHAR_R;
        for (const p of platformsRef.current) {
          if (
            prevFeet <= p.y + 2 &&
            feet >= p.y &&
            charXRef.current + CHAR_R > p.x + 2 &&
            charXRef.current - CHAR_R < p.x + p.w - 2
          ) {
            handleLanding(p);
            break;
          }
        }
      }
    }

    // 相机跟随
    const targetCam = charYRef.current - FIXED_SCREEN_Y;
    if (targetCam < cameraYRef.current) {
      cameraYRef.current = targetCam;
    }

    // 最大高度
    const climb = -cameraYRef.current;
    if (climb > maxClimbRef.current) {
      maxClimbRef.current = climb;
    }

    // 生成新平台
    let highestY = Infinity;
    for (const p of platformsRef.current) {
      if (p.y < highestY) highestY = p.y;
    }
    const cam = cameraYRef.current;
    while (highestY > cam - 200) {
      const gap = 100 + Math.random() * 80 + jumpCountRef.current * 2;
      highestY -= gap;
      platformsRef.current.push(genPlatform(highestY, jumpCountRef.current));
    }

    // 移除离屏平台
    platformsRef.current = platformsRef.current.filter(p => p.y < cam + H + 100);

    // 粒子更新
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life -= 0.02;
    }
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 掉落检测
    if (charYRef.current - cam > H + 50) {
      doGameOver();
    }
  }, [handleLanding, doGameOver]);

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
    const cam = cameraYRef.current;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#050810");
    bg.addColorStop(0.4, "#0a0e1a");
    bg.addColorStop(0.8, "#0d1424");
    bg.addColorStop(1, "#080812");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 星星
    for (const s of starsRef.current) {
      const sy = ((s.y - cam * 0.15) % H + H) % H;
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(animRef.current * 0.015 + s.tw));
      ctx.fillStyle = `rgba(167,139,250,${tw * 0.4})`;
      ctx.beginPath();
      ctx.arc(s.x, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 平台
    for (const p of platformsRef.current) {
      const sy = p.y - cam;
      if (sy < -PLATFORM_H || sy > H + 20) continue;
      ctx.save();
      ctx.shadowColor = p.landed ? "rgba(34,197,94,0.3)" : "rgba(96,165,250,0.4)";
      ctx.shadowBlur = 8;
      const grad = ctx.createLinearGradient(0, sy, 0, sy + PLATFORM_H);
      if (p.landed) {
        grad.addColorStop(0, "#4ade80");
        grad.addColorStop(1, "#16a34a");
      } else {
        grad.addColorStop(0, "#60a5fa");
        grad.addColorStop(1, "#2563eb");
      }
      ctx.fillStyle = grad;
      roundRect(ctx, p.x, sy, p.w, PLATFORM_H, 5);
      ctx.fill();
      ctx.restore();
      // 高光
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      roundRect(ctx, p.x + 3, sy + 2, p.w - 6, 3, 1.5);
      ctx.fill();
    }

    // 粒子
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y - cam, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const cx = charXRef.current;
    const cy = charYRef.current - cam;

    // 力度条 & 方向指示器
    if (chargingRef.current && onPlatformRef.current) {
      const power = powerRef.current;
      const ratio = power / MAX_POWER;
      // 力度条
      const barX = cx + CHAR_R + 8;
      const barY = cy - 30;
      const barH = 60;
      const barW = 6;
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      roundRect(ctx, barX, barY, barW, barH, 3);
      ctx.fill();
      const fillH = barH * ratio;
      const fillColor = ratio < 0.4 ? "#4ade80" : ratio < 0.7 ? "#fbbf24" : "#ef4444";
      ctx.fillStyle = fillColor;
      roundRect(ctx, barX, barY + barH - fillH, barW, fillH, 3);
      ctx.fill();

      // 方向箭头
      const dx = aimXRef.current - cx;
      const dy = aimYRef.current - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 5) {
        let dirX = dx / dist;
        let dirY = dy / dist;
        if (dirY > -0.15) {
          dirY = -0.15;
          const len = Math.sqrt(dirX * dirX + dirY * dirY);
          dirX /= len; dirY /= len;
        }
        const arrowLen = 30 + ratio * 50;
        const ax = cx + dirX * arrowLen;
        const ay = cy + dirY * arrowLen;
        ctx.strokeStyle = fillColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = fillColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        // 箭头头
        const angle = Math.atan2(dirY, dirX);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 8 * Math.cos(angle - 0.4), ay - 8 * Math.sin(angle - 0.4));
        ctx.lineTo(ax - 8 * Math.cos(angle + 0.4), ay - 8 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 轨迹预览
        const previewVx = dirX * power;
        const previewVy = dirY * power;
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        for (let t = 4; t < 80; t += 4) {
          const px = cx + previewVx * t;
          const py = cy + previewVy * t + 0.5 * GRAVITY * t * t;
          if (py > H || px < 0 || px > W) break;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 角色（火箭）
    ctx.save();
    ctx.shadowColor = "rgba(249,115,22,0.5)";
    ctx.shadowBlur = 10;
    // 火焰（飞行中）
    if (!onPlatformRef.current && vyRef.current < 2) {
      const flameLen = 10 + Math.random() * 8;
      const fgrad = ctx.createLinearGradient(cx, cy + CHAR_R, cx, cy + CHAR_R + flameLen);
      fgrad.addColorStop(0, "#fbbf24");
      fgrad.addColorStop(0.5, "#f97316");
      fgrad.addColorStop(1, "rgba(239,68,68,0)");
      ctx.fillStyle = fgrad;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + CHAR_R);
      ctx.lineTo(cx + 5, cy + CHAR_R);
      ctx.lineTo(cx, cy + CHAR_R + flameLen);
      ctx.closePath();
      ctx.fill();
    }
    // 身体
    const bodyGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, CHAR_R);
    bodyGrad.addColorStop(0, "#fde68a");
    bodyGrad.addColorStop(0.5, "#f59e0b");
    bodyGrad.addColorStop(1, "#b45309");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, CHAR_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 眼睛
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 3, 4, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    const eyeOffset = onPlatformRef.current ? 0 : Math.sign(vxRef.current) * 1.5;
    ctx.beginPath();
    ctx.arc(cx - 4 + eyeOffset, cy - 2, 2, 0, Math.PI * 2);
    ctx.arc(cx + 4 + eyeOffset, cy - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // 高度指示
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "12px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`高度: ${Math.floor(maxClimbRef.current / 10)}m`, 10, 20);
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
        for (let i = 0; i < dt; i++) update();
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [update, draw]);

  /* ----- 初始化平台 ----- */
  const initPlatforms = useCallback(() => {
    const list: Platform[] = [];
    list.push({ x: W / 2 - 50, y: 560, w: 100, landed: false });
    let y = 460;
    for (let i = 0; i < 8; i++) {
      list.push(genPlatform(y, 0));
      y -= 100 + Math.random() * 60;
    }
    platformsRef.current = list;
  }, []);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    charXRef.current = W / 2;
    charYRef.current = 560 - CHAR_R;
    prevCharYRef.current = charYRef.current;
    vxRef.current = 0;
    vyRef.current = 0;
    powerRef.current = 0;
    chargingRef.current = false;
    onPlatformRef.current = true;
    cameraYRef.current = 0;
    maxClimbRef.current = 0;
    jumpCountRef.current = 0;
    submittedRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setScore(0);
    setJumps(0);
    setOver(false);
    setResult(null);
    initPlatforms();
    runningRef.current = true;
    setRunning(true);
    recordGamePlay(GAME_ID, 0);
  }, [initPlatforms]);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    charXRef.current = W / 2;
    charYRef.current = 560 - CHAR_R;
    vxRef.current = 0;
    vyRef.current = 0;
    powerRef.current = 0;
    chargingRef.current = false;
    onPlatformRef.current = true;
    cameraYRef.current = 0;
    maxClimbRef.current = 0;
    jumpCountRef.current = 0;
    setScore(0);
    setJumps(0);
    setOver(false);
    setResult(null);
    setRunning(false);
    pausedRef.current = false;
    setPaused(false);
  }, []);

  /* ----- 暂停 ----- */
  const togglePause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    setPaused(p => {
      const np = !p;
      pausedRef.current = np;
      if (np) chargingRef.current = false;
      return np;
    });
  }, []);

  /* ----- 发射 ----- */
  const launch = useCallback(() => {
    if (!chargingRef.current || !onPlatformRef.current || !runningRef.current || overRef.current || pausedRef.current) return;
    chargingRef.current = false;
    const power = powerRef.current;
    powerRef.current = 0;
    if (power < 2) return; // 力度太小不发射

    const cam = cameraYRef.current;
    const cx = charXRef.current;
    const cy = charYRef.current - cam;
    const dx = aimXRef.current - cx;
    const dy = aimYRef.current - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;

    let dirX = dx / dist;
    let dirY = dy / dist;
    if (dirY > -0.15) {
      dirY = -0.15;
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      dirX /= len; dirY /= len;
    }

    vxRef.current = dirX * power;
    vyRef.current = dirY * power;
    onPlatformRef.current = false;
    addParticles(charXRef.current, charYRef.current + CHAR_R, "#f97316", 10, 4);
  }, [addParticles]);

  /* ----- 开始充能 ----- */
  const startCharge = useCallback((mx: number, my: number) => {
    if (!runningRef.current || overRef.current || pausedRef.current || !onPlatformRef.current) return;
    chargingRef.current = true;
    powerRef.current = 0;
    aimXRef.current = mx;
    aimYRef.current = my;
  }, []);

  /* ----- 更新瞄准 ----- */
  const updateAim = useCallback((mx: number, my: number) => {
    aimXRef.current = mx;
    aimYRef.current = my;
  }, []);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "p") {
        e.preventDefault();
        togglePause();
      } else if (k === " " || k === "enter") {
        e.preventDefault();
        if (!runningRef.current && !overRef.current) start();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [start, togglePause]);

  /* ----- 鼠标/触摸控制 ----- */
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const cv = canvasRef.current;
    if (!cv) return { x: 0, y: 0 };
    const rect = cv.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    let cx: number, cy: number;
    if ("touches" in e) {
      const t = e.touches[0] || e.changedTouches[0];
      cx = t.clientX; cy = t.clientY;
    } else {
      cx = e.clientX; cy = e.clientY;
    }
    return {
      x: (cx - rect.left) * scaleX,
      y: (cy - rect.top) * scaleY,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const { x, y } = getCanvasPos(e);
    startCharge(x, y);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!chargingRef.current) return;
    const { x, y } = getCanvasPos(e);
    updateAim(x, y);
  };
  const onMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    launch();
  };
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCanvasPos(e);
    startCharge(x, y);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!chargingRef.current) return;
    const { x, y } = getCanvasPos(e);
    updateAim(x, y);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    launch();
  };

  const stats: GameStat[] = [
    { label: "跳跃数", value: jumps, icon: "🚀" },
    { label: "高度", value: `${Math.floor(maxClimbRef.current / 10)}m`, icon: "📏" },
    { label: "分数", value: score, icon: "⭐" },
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
      title="火箭跳跃"
      iconEmoji="🚀"
      iconGradient="from-orange-400 to-pink-600"
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
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="w-full max-w-[500px] h-auto rounded-xl touch-none shadow-lg shadow-orange-500/10 cursor-crosshair"
          />

          {/* 开始界面 */}
          {!running && !over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold text-white mb-2">火箭跳跃</h2>
              <p className="text-sm text-gray-300 mb-6 text-center px-4 leading-relaxed max-w-[320px]">
                按住鼠标/触摸瞄准并蓄力
                <br />
                松开发射，落到下一个平台
                <br />
                力度越大飞得越远！
              </p>
              <div className="flex flex-col gap-2 mb-6 text-xs text-gray-400">
                <div>按住瞄准 · 松开发射 · P暂停</div>
              </div>
              <button
                onClick={start}
                aria-label="开始游戏"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-orange-500/30 transition hover:scale-105 active:scale-95"
              >
                开始跳跃
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
              <div className="text-5xl mb-3">💫</div>
              <h3 className="text-2xl font-bold text-white mb-4">掉落了！</h3>
              <div className="grid grid-cols-2 gap-3 mb-4 w-full max-w-[300px]">
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">跳跃数</div>
                  <div className="text-xl font-bold text-orange-400">{jumps}</div>
                </div>
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">高度</div>
                  <div className="text-xl font-bold text-cyan-400">{Math.floor(maxClimbRef.current / 10)}m</div>
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
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold shadow-lg transition hover:scale-105 active:scale-95"
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
      </div>
    </GameShell>
  );
}
