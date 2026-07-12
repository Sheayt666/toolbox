"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore, recordGamePlay } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "lava-escape";
const W = 600;
const H = 500;
const BEST_KEY = "gm_lava_escape_best";
const GRID = 5;
const PLAT_W = 96;
const PLAT_H = 64;
const GAP = 18;
const GRID_X = (W - GRID * PLAT_W - (GRID - 1) * GAP) / 2;
const GRID_Y = (H - GRID * PLAT_H - (GRID - 1) * GAP) / 2;
const WARN_FRAMES = 180; // 3 seconds at 60fps
const JUMP_FRAMES = 18; // ~300ms
const PLAYER_R = 15;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
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

function platCenter(col: number, row: number) {
  return {
    x: GRID_X + col * (PLAT_W + GAP) + PLAT_W / 2,
    y: GRID_Y + row * (PLAT_H + GAP) + PLAT_H / 2,
  };
}

function platRect(col: number, row: number) {
  return {
    x: GRID_X + col * (PLAT_W + GAP),
    y: GRID_Y + row * (PLAT_H + GAP),
  };
}

/* ============ 组件 ============ */
export default function LavaEscapePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 游戏状态
  const playerColRef = useRef(2);
  const playerRowRef = useRef(2);
  const playerXRef = useRef(0);
  const playerYRef = useRef(0);
  const jumpingRef = useRef(false);
  const jumpFromXRef = useRef(0);
  const jumpFromYRef = useRef(0);
  const jumpToXRef = useRef(0);
  const jumpToYRef = useRef(0);
  const jumpProgressRef = useRef(0);
  const jumpToColRef = useRef(-1);
  const jumpToRowRef = useRef(-1);
  const warningColRef = useRef(-1);
  const warningRowRef = useRef(-1);
  const warningTimerRef = useRef(0);
  const lavaRef = useRef<Set<string>>(new Set());
  const roundRef = useRef(0);
  const scoreRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const pausedRef = useRef(false);

  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
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

  /* ----- 粒子 ----- */
  const addParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 3;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp - 1,
        life: 1,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }, []);

  /* ----- 开始新一轮警告 ----- */
  const startWarning = useCallback(() => {
    const safe: { col: number; row: number }[] = [];
    for (let c = 0; c < GRID; c++) {
      for (let r = 0; r < GRID; r++) {
        const key = `${c},${r}`;
        if (lavaRef.current.has(key)) continue;
        // 可以警告玩家所在的平台
        safe.push({ col: c, row: r });
      }
    }
    if (safe.length <= 1) {
      // 只剩一个安全平台（玩家的），不警告
      warningColRef.current = -1;
      warningRowRef.current = -1;
      return;
    }
    const pick = safe[Math.floor(Math.random() * safe.length)];
    warningColRef.current = pick.col;
    warningRowRef.current = pick.row;
    warningTimerRef.current = WARN_FRAMES;
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
    const finalScore = scoreRef.current;
    const r = submitScore(GAME_ID, finalScore, `存活${roundRef.current}轮`);
    setResult(r);
    setRefreshKey(k => k + 1);
    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBest(finalScore);
      try { localStorage.setItem(BEST_KEY, String(finalScore)); } catch { /* ignore */ }
    }
  }, []);

  /* ----- 警告到期 ----- */
  const handleWarningExpire = useCallback(() => {
    const wc = warningColRef.current;
    const wr = warningRowRef.current;
    if (wc < 0) return;
    // 平台变熔岩
    lavaRef.current.add(`${wc},${wr}`);
    addParticles(platCenter(wc, wr).x, platCenter(wc, wr).y, "#ef4444", 16);
    // 检查玩家是否在上面
    if (!jumpingRef.current && playerColRef.current === wc && playerRowRef.current === wr) {
      addParticles(playerXRef.current, playerYRef.current, "#ef4444", 20);
      doGameOver();
      return;
    }
    // 存活得分
    scoreRef.current += 10;
    roundRef.current++;
    setScore(scoreRef.current);
    setRound(roundRef.current);
    // 开始新警告
    startWarning();
  }, [addParticles, doGameOver, startWarning]);

  /* ----- 跳跃 ----- */
  const tryJump = useCallback((col: number, row: number) => {
    if (!runningRef.current || overRef.current || pausedRef.current) return;
    if (jumpingRef.current) return;
    if (col < 0 || col >= GRID || row < 0 || row >= GRID) return;
    if (col === playerColRef.current && row === playerRowRef.current) return;
    if (lavaRef.current.has(`${col},${row}`)) return;
    // 开始跳跃
    jumpingRef.current = true;
    jumpFromXRef.current = playerXRef.current;
    jumpFromYRef.current = playerYRef.current;
    const target = platCenter(col, row);
    jumpToXRef.current = target.x;
    jumpToYRef.current = target.y;
    jumpToColRef.current = col;
    jumpToRowRef.current = row;
    jumpProgressRef.current = 0;
  }, []);

  /* ----- 更新 ----- */
  const update = useCallback(() => {
    animRef.current++;

    // 跳跃动画
    if (jumpingRef.current) {
      jumpProgressRef.current += 1 / JUMP_FRAMES;
      if (jumpProgressRef.current >= 1) {
        jumpProgressRef.current = 1;
        jumpingRef.current = false;
        playerColRef.current = jumpToColRef.current;
        playerRowRef.current = jumpToRowRef.current;
        playerXRef.current = jumpToXRef.current;
        playerYRef.current = jumpToYRef.current;
        // 落地粒子
        addParticles(playerXRef.current, playerYRef.current + PLAYER_R, "#fbbf24", 6);
        // 检查是否落在正在警告的平台上（可以继续待着，但有时间限制）
      } else {
        const t = jumpProgressRef.current;
        playerXRef.current = jumpFromXRef.current + (jumpToXRef.current - jumpFromXRef.current) * t;
        const arcY = jumpFromYRef.current + (jumpToYRef.current - jumpFromYRef.current) * t;
        const arcHeight = 40;
        playerYRef.current = arcY - Math.sin(t * Math.PI) * arcHeight;
      }
    }

    // 警告计时
    if (warningColRef.current >= 0 && !overRef.current) {
      warningTimerRef.current -= 1;
      if (warningTimerRef.current <= 0) {
        handleWarningExpire();
      }
    }

    // 粒子更新
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.life -= 0.025;
    }
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  }, [handleWarningExpire, addParticles]);

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

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1a0a0a");
    bg.addColorStop(0.5, "#0d0506");
    bg.addColorStop(1, "#080404");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 背景火焰光效
    const flicker = 0.5 + 0.5 * Math.sin(animRef.current * 0.05);
    const glow = ctx.createRadialGradient(W / 2, H, 50, W / 2, H, H);
    glow.addColorStop(0, `rgba(239,68,68,${0.08 * flicker})`);
    glow.addColorStop(1, "rgba(239,68,68,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 绘制平台
    for (let c = 0; c < GRID; c++) {
      for (let r = 0; r < GRID; r++) {
        const rect = platRect(c, r);
        const key = `${c},${r}`;
        const isLava = lavaRef.current.has(key);
        const isWarning = warningColRef.current === c && warningRowRef.current === r;
        const isPlayer = !jumpingRef.current && playerColRef.current === c && playerRowRef.current === r;

        if (isLava) {
          // 熔岩平台
          ctx.save();
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 15;
          const lavaGrad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + PLAT_H);
          lavaGrad.addColorStop(0, "#fbbf24");
          lavaGrad.addColorStop(0.3, "#f97316");
          lavaGrad.addColorStop(0.6, "#ef4444");
          lavaGrad.addColorStop(1, "#991b1b");
          ctx.fillStyle = lavaGrad;
          roundRect(ctx, rect.x, rect.y, PLAT_W, PLAT_H, 8);
          ctx.fill();
          ctx.restore();
          // 岩浆气泡
          ctx.fillStyle = "rgba(254,215,170,0.4)";
          for (let i = 0; i < 3; i++) {
            const bx = rect.x + 15 + ((animRef.current * 0.5 + i * 30) % (PLAT_W - 30));
            const by = rect.y + PLAT_H - 10 - Math.abs(Math.sin(animRef.current * 0.04 + i * 2)) * 12;
            ctx.beginPath();
            ctx.arc(bx, by, 3 + Math.sin(animRef.current * 0.06 + i) * 1, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (isWarning) {
          // 警告平台
          const warnRatio = warningTimerRef.current / WARN_FRAMES;
          const flash = 0.5 + 0.5 * Math.sin(animRef.current * 0.2);
          ctx.save();
          ctx.shadowColor = "#ef4444";
          ctx.shadowBlur = 10 + flash * 10;
          const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + PLAT_H);
          grad.addColorStop(0, `rgba(239,68,68,${0.6 + flash * 0.4})`);
          grad.addColorStop(1, `rgba(127,29,29,${0.8 + flash * 0.2})`);
          ctx.fillStyle = grad;
          roundRect(ctx, rect.x, rect.y, PLAT_W, PLAT_H, 8);
          ctx.fill();
          ctx.restore();
          // 警告边框
          ctx.strokeStyle = `rgba(251,191,36,${0.6 + flash * 0.4})`;
          ctx.lineWidth = 2;
          roundRect(ctx, rect.x, rect.y, PLAT_W, PLAT_H, 8);
          ctx.stroke();
          // 计时圆弧
          const cx = rect.x + PLAT_W / 2;
          const cy = rect.y + PLAT_H / 2;
          ctx.strokeStyle = warnRatio > 0.3 ? "#fbbf24" : "#ef4444";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, 22, -Math.PI / 2, -Math.PI / 2 + warnRatio * Math.PI * 2);
          ctx.stroke();
          // 倒计时数字
          ctx.fillStyle = "#fff";
          ctx.font = "bold 16px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(Math.ceil(warningTimerRef.current / 60).toString(), cx, cy);
        } else {
          // 安全平台
          ctx.save();
          ctx.shadowColor = "rgba(100,116,139,0.3)";
          ctx.shadowBlur = 5;
          const grad = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + PLAT_H);
          grad.addColorStop(0, "#475569");
          grad.addColorStop(0.5, "#334155");
          grad.addColorStop(1, "#1e293b");
          ctx.fillStyle = grad;
          roundRect(ctx, rect.x, rect.y, PLAT_W, PLAT_H, 8);
          ctx.fill();
          ctx.restore();
          // 高光
          ctx.fillStyle = "rgba(255,255,255,0.08)";
          roundRect(ctx, rect.x + 3, rect.y + 3, PLAT_W - 6, 4, 2);
          ctx.fill();
        }
      }
    }

    // 粒子
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 角色
    const px = playerXRef.current;
    const py = playerYRef.current;
    // 阴影
    if (!jumpingRef.current) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(px, py + PLAYER_R + 2, PLAYER_R * 0.8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 身体
    ctx.save();
    ctx.shadowColor = "rgba(34,211,238,0.6)";
    ctx.shadowBlur = 12;
    const bodyGrad = ctx.createRadialGradient(px - 4, py - 4, 2, px, py, PLAYER_R);
    bodyGrad.addColorStop(0, "#67e8f9");
    bodyGrad.addColorStop(0.5, "#22d3ee");
    bodyGrad.addColorStop(1, "#0891b2");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.arc(px, py, PLAYER_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // 眼睛
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(px - 5, py - 3, 4, 0, Math.PI * 2);
    ctx.arc(px + 5, py - 3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(px - 5, py - 2, 2, 0, Math.PI * 2);
    ctx.arc(px + 5, py - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    // 嘴
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (jumpingRef.current) {
      ctx.arc(px, py + 4, 3, 0, Math.PI);
    } else {
      ctx.moveTo(px - 3, py + 4);
      ctx.lineTo(px + 3, py + 4);
    }
    ctx.stroke();

    // 跳跃轨迹
    if (jumpingRef.current) {
      ctx.strokeStyle = "rgba(34,211,238,0.3)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(jumpFromXRef.current, jumpFromYRef.current);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);
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
        for (let i = 0; i < dt; i++) update();
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [update, draw]);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    playerColRef.current = 2;
    playerRowRef.current = 2;
    const c = platCenter(2, 2);
    playerXRef.current = c.x;
    playerYRef.current = c.y;
    jumpingRef.current = false;
    jumpProgressRef.current = 0;
    lavaRef.current = new Set();
    roundRef.current = 0;
    scoreRef.current = 0;
    particlesRef.current = [];
    submittedRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setScore(0);
    setRound(0);
    setOver(false);
    setResult(null);
    runningRef.current = true;
    setRunning(true);
    startWarning();
    recordGamePlay(GAME_ID, 0);
  }, [startWarning]);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    playerColRef.current = 2;
    playerRowRef.current = 2;
    const c = platCenter(2, 2);
    playerXRef.current = c.x;
    playerYRef.current = c.y;
    jumpingRef.current = false;
    lavaRef.current = new Set();
    roundRef.current = 0;
    scoreRef.current = 0;
    warningColRef.current = -1;
    setScore(0);
    setRound(0);
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
      return np;
    });
  }, []);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup" || k === "w") {
        e.preventDefault();
        tryJump(playerColRef.current, playerRowRef.current - 1);
      } else if (k === "arrowdown" || k === "s") {
        e.preventDefault();
        tryJump(playerColRef.current, playerRowRef.current + 1);
      } else if (k === "arrowleft" || k === "a") {
        e.preventDefault();
        tryJump(playerColRef.current - 1, playerRowRef.current);
      } else if (k === "arrowright" || k === "d") {
        e.preventDefault();
        tryJump(playerColRef.current + 1, playerRowRef.current);
      } else if (k === "p") {
        e.preventDefault();
        togglePause();
      } else if (k === " " || k === "enter") {
        e.preventDefault();
        if (!runningRef.current && !overRef.current) start();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tryJump, togglePause, start]);

  /* ----- 点击/触摸控制 ----- */
  const onCanvasClick = (e: React.MouseEvent) => {
    if (!runningRef.current || overRef.current || pausedRef.current) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    // 查找点击的平台
    for (let c = 0; c < GRID; c++) {
      for (let r = 0; r < GRID; r++) {
        const pr = platRect(c, r);
        if (mx >= pr.x && mx <= pr.x + PLAT_W && my >= pr.y && my <= pr.y + PLAT_H) {
          tryJump(c, r);
          return;
        }
      }
    }
  };
  const onCanvasTouch = (e: React.TouchEvent) => {
    if (!runningRef.current || overRef.current || pausedRef.current) return;
    e.preventDefault();
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const t = e.touches[0] || e.changedTouches[0];
    const mx = (t.clientX - rect.left) * scaleX;
    const my = (t.clientY - rect.top) * scaleY;
    for (let c = 0; c < GRID; c++) {
      for (let r = 0; r < GRID; r++) {
        const pr = platRect(c, r);
        if (mx >= pr.x && mx <= pr.x + PLAT_W && my >= pr.y && my <= pr.y + PLAT_H) {
          tryJump(c, r);
          return;
        }
      }
    }
  };

  const stats: GameStat[] = [
    { label: "存活轮数", value: round, icon: "🔄" },
    { label: "分数", value: score, icon: "⭐" },
    { label: "安全平台", value: GRID * GRID - lavaRef.current.size, icon: "🟦" },
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
      title="熔岩逃生"
      iconEmoji="🌋"
      iconGradient="from-red-500 to-orange-600"
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
            onClick={onCanvasClick}
            onTouchStart={onCanvasTouch}
            className="w-full max-w-[600px] h-auto rounded-xl touch-none shadow-lg shadow-red-500/10 cursor-pointer"
          />

          {/* 开始界面 */}
          {!running && !over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
              <div className="text-6xl mb-4">🌋</div>
              <h2 className="text-3xl font-bold text-white mb-2">熔岩逃生</h2>
              <p className="text-sm text-gray-300 mb-6 text-center px-4 leading-relaxed max-w-[340px]">
                平台会随机变成熔岩！
                <br />
                3秒预警后变为致命熔岩
                <br />
                点击/方向键跳到安全平台
                <br />
                存活越久分数越高！
              </p>
              <div className="flex flex-col gap-2 mb-6 text-xs text-gray-400">
                <div className="flex items-center gap-2"><span className="text-red-400">点击平台</span> 跳跃到目标</div>
                <div className="flex items-center gap-2"><span className="text-red-400">方向键/WASD</span> 相邻移动</div>
                <div className="flex items-center gap-2"><span className="text-red-400">P</span> 暂停</div>
              </div>
              <button
                onClick={start}
                aria-label="开始游戏"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold text-lg shadow-lg shadow-red-500/30 transition hover:scale-105 active:scale-95"
              >
                开始逃生
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
                className="h-12 px-6 rounded-xl bg-red-500 text-white font-medium shadow-lg transition hover:bg-red-600 active:scale-95"
              >
                继续
              </button>
            </div>
          )}

          {/* 结束界面 */}
          {over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/80 backdrop-blur-md p-4">
              <div className="text-5xl mb-3">🔥</div>
              <h3 className="text-2xl font-bold text-white mb-4">被熔岩吞噬！</h3>
              <div className="grid grid-cols-2 gap-3 mb-4 w-full max-w-[300px]">
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">存活轮数</div>
                  <div className="text-xl font-bold text-orange-400">{round}</div>
                </div>
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">剩余平台</div>
                  <div className="text-xl font-bold text-cyan-400">{GRID * GRID - lavaRef.current.size}</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-red-400 mb-2">{score}</div>
              <p className="text-xs text-gray-400 mb-1">
                {score >= best && score > 0 ? "🎉 新纪录！" : `最佳: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-gray-400 mb-4">
                  排名第 <span className="text-red-400 font-bold">{result.rank}</span>/{result.total}
                  ，超越 <span className="text-red-400 font-bold">{result.beatPercent}%</span> 玩家
                </p>
              )}
              <button
                onClick={restart}
                aria-label="重新开始"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold shadow-lg transition hover:scale-105 active:scale-95"
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
              className="h-11 px-6 rounded-xl bg-red-500 text-white font-medium shadow-lg transition hover:bg-red-600 active:scale-95"
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

        {/* 移动端方向键 */}
        <div className="mt-3 sm:hidden grid grid-cols-3 gap-2 w-full max-w-[240px]">
          <div />
          <button
            onClick={() => tryJump(playerColRef.current, playerRowRef.current - 1)}
            aria-label="向上跳"
            className="h-12 rounded-xl bg-gray-800 text-white text-xl flex items-center justify-center active:bg-red-600 transition border border-gray-700"
          >↑</button>
          <div />
          <button
            onClick={() => tryJump(playerColRef.current - 1, playerRowRef.current)}
            aria-label="向左跳"
            className="h-12 rounded-xl bg-gray-800 text-white text-xl flex items-center justify-center active:bg-red-600 transition border border-gray-700"
          >←</button>
          <div />
          <button
            onClick={() => tryJump(playerColRef.current + 1, playerRowRef.current)}
            aria-label="向右跳"
            className="h-12 rounded-xl bg-gray-800 text-white text-xl flex items-center justify-center active:bg-red-600 transition border border-gray-700"
          >→</button>
          <div />
          <button
            onClick={() => tryJump(playerColRef.current, playerRowRef.current + 1)}
            aria-label="向下跳"
            className="h-12 rounded-xl bg-gray-800 text-white text-xl flex items-center justify-center active:bg-red-600 transition border border-gray-700"
          >↓</button>
          <div />
        </div>
      </div>
    </GameShell>
  );
}
