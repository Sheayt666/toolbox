"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore, recordGamePlay } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "merge-evolve";
const W = 400;
const H = 500;
const BEST_KEY = "gm_merge_evolve_best";
const GRAVITY = 0.35;
const RESTITUTION = 0.2;
const FRICTION = 0.985;
const WALL_PAD = 4;
const DROPPER_Y = 38;
const DROP_Y = 58;
const DANGER_Y = 70;
const DROP_COOLDOWN = 22;
const GAME_OVER_FRAMES = 50;
const MAX_CREATURES = 60;

interface Creature {
  x: number;
  y: number;
  vx: number;
  vy: number;
  level: number;
  r: number;
  merged: boolean;
  bornFrame: number;
  vanishing: boolean;
  vanishTimer: number;
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

const EVOLUTION = [
  { emoji: "🐛", color: "#4ade80", r: 13, score: 5 },
  { emoji: "🐟", color: "#38bdf8", r: 17, score: 10 },
  { emoji: "🦎", color: "#2dd4bf", r: 22, score: 20 },
  { emoji: "🦅", color: "#a78bfa", r: 28, score: 40 },
  { emoji: "🐶", color: "#fb923c", r: 35, score: 80 },
  { emoji: "🧑", color: "#f472b6", r: 43, score: 160 },
  { emoji: "👽", color: "#22d3ee", r: 52, score: 300 },
];

const MAX_DROP_LEVEL = 3; // 投放最多到第3级

/* ============ 组件 ============ */
export default function MergeEvolvePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 游戏状态
  const creaturesRef = useRef<Creature[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatTextsRef = useRef<FloatText[]>([]);
  const dropperXRef = useRef(W / 2);
  const currentLevelRef = useRef(0);
  const nextLevelRef = useRef(0);
  const canDropRef = useRef(true);
  const cooldownRef = useRef(0);
  const scoreRef = useRef(0);
  const maxLevelRef = useRef(0);
  const gameOverTimerRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const pausedRef = useRef(false);
  const dropFlashRef = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [maxLevel, setMaxLevel] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [nextLevel, setNextLevel] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);

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
  const addParticles = useCallback((x: number, y: number, color: string, count: number, spread: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * spread;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp - 1,
        life: 1,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const addFloatText = useCallback((x: number, y: number, text: string, color: string) => {
    floatTextsRef.current.push({ x, y, text, life: 1, color });
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
    const r = submitScore(GAME_ID, finalScore, `最高${EVOLUTION[maxLevelRef.current].emoji} 分${finalScore}`);
    setResult(r);
    setRefreshKey(k => k + 1);
    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBest(finalScore);
      try { localStorage.setItem(BEST_KEY, String(finalScore)); } catch { /* ignore */ }
    }
  }, []);

  /* ----- 投放生物 ----- */
  const dropCreature = useCallback(() => {
    if (!runningRef.current || overRef.current || pausedRef.current || !canDropRef.current) return;
    const level = currentLevelRef.current;
    const r = EVOLUTION[level].r;
    const x = Math.max(r + WALL_PAD, Math.min(W - r - WALL_PAD, dropperXRef.current));
    creaturesRef.current.push({
      x,
      y: DROP_Y,
      vx: 0,
      vy: 0,
      level,
      r,
      merged: false,
      bornFrame: animRef.current,
      vanishing: false,
      vanishTimer: 0,
    });
    canDropRef.current = false;
    cooldownRef.current = DROP_COOLDOWN;
    dropFlashRef.current = 10;
    // 切换生物
    currentLevelRef.current = nextLevelRef.current;
    setCurrentLevel(nextLevelRef.current);
    const nl = Math.floor(Math.random() * (MAX_DROP_LEVEL + 1));
    nextLevelRef.current = nl;
    setNextLevel(nl);
  }, []);

  /* ----- 合并处理 ----- */
  const processMerges = useCallback(() => {
    const mergeList: { x: number; y: number; level: number }[] = [];
    const creatures = creaturesRef.current;
    for (let i = 0; i < creatures.length; i++) {
      const c1 = creatures[i];
      if (c1.merged || c1.vanishing) continue;
      for (let j = i + 1; j < creatures.length; j++) {
        const c2 = creatures[j];
        if (c2.merged || c2.vanishing) continue;
        if (c1.level !== c2.level) continue;
        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < c1.r + c2.r) {
          // 合并
          c1.merged = true;
          c2.merged = true;
          const mx = (c1.x + c2.x) / 2;
          const my = (c1.y + c2.y) / 2;
          mergeList.push({ x: mx, y: my, level: c1.level });
          break;
        }
      }
    }
    // 移除已合并的
    if (mergeList.length > 0) {
      creaturesRef.current = creatures.filter(c => !c.merged);
    }
    // 创建新生物
    for (const m of mergeList) {
      const newLevel = m.level + 1;
      const evo = EVOLUTION[newLevel];
      addParticles(m.x, m.y, evo.color, 16, 4);
      if (newLevel >= 6) {
        // 外星 - 短暂出现后消失
        creaturesRef.current.push({
          x: m.x,
          y: m.y,
          vx: 0,
          vy: 0,
          level: 6,
          r: evo.r,
          merged: false,
          bornFrame: animRef.current,
          vanishing: true,
          vanishTimer: 35,
        });
        scoreRef.current += evo.score;
        setScore(scoreRef.current);
        addFloatText(m.x, m.y, `+${evo.score}`, "#22d3ee");
        addParticles(m.x, m.y, "#22d3ee", 30, 6);
        if (6 > maxLevelRef.current) {
          maxLevelRef.current = 6;
          setMaxLevel(6);
        }
      } else {
        creaturesRef.current.push({
          x: m.x,
          y: m.y,
          vx: 0,
          vy: -1,
          level: newLevel,
          r: evo.r,
          merged: false,
          bornFrame: animRef.current,
          vanishing: false,
          vanishTimer: 0,
        });
        scoreRef.current += evo.score;
        setScore(scoreRef.current);
        addFloatText(m.x, m.y, `+${evo.score}`, evo.color);
        if (newLevel > maxLevelRef.current) {
          maxLevelRef.current = newLevel;
          setMaxLevel(newLevel);
        }
      }
    }
  }, [addParticles, addFloatText]);

  /* ----- 碰撞解决 ----- */
  const resolveCollisions = useCallback(() => {
    const creatures = creaturesRef.current;
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 0; i < creatures.length; i++) {
        const c1 = creatures[i];
        if (c1.vanishing) continue;
        // 墙壁
        if (c1.x - c1.r < WALL_PAD) {
          c1.x = WALL_PAD + c1.r;
          c1.vx = Math.abs(c1.vx) * RESTITUTION;
        }
        if (c1.x + c1.r > W - WALL_PAD) {
          c1.x = W - WALL_PAD - c1.r;
          c1.vx = -Math.abs(c1.vx) * RESTITUTION;
        }
        // 地面
        if (c1.y + c1.r > H - WALL_PAD) {
          c1.y = H - WALL_PAD - c1.r;
          c1.vy = -Math.abs(c1.vy) * RESTITUTION;
          c1.vx *= FRICTION;
        }
        // 生物间碰撞
        for (let j = i + 1; j < creatures.length; j++) {
          const c2 = creatures[j];
          if (c2.vanishing) continue;
          const dx = c2.x - c1.x;
          const dy = c2.y - c1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = c1.r + c2.r;
          if (dist < minDist && dist > 0) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;
            // 分离
            c1.x -= nx * overlap * 0.5;
            c1.y -= ny * overlap * 0.5;
            c2.x += nx * overlap * 0.5;
            c2.y += ny * overlap * 0.5;
            // 速度交换
            const rvx = c2.vx - c1.vx;
            const rvy = c2.vy - c1.vy;
            const dot = rvx * nx + rvy * ny;
            if (dot < 0) {
              const impulse = dot * (1 + RESTITUTION) * 0.5;
              c1.vx += impulse * nx;
              c1.vy += impulse * ny;
              c2.vx -= impulse * nx;
              c2.vy -= impulse * ny;
            }
          }
        }
      }
    }
  }, []);

  /* ----- 更新 ----- */
  const update = useCallback(() => {
    animRef.current++;
    const creatures = creaturesRef.current;

    // 冷却
    if (!canDropRef.current) {
      cooldownRef.current--;
      if (cooldownRef.current <= 0) canDropRef.current = true;
    }
    if (dropFlashRef.current > 0) dropFlashRef.current--;

    // 物理
    for (const c of creatures) {
      if (c.vanishing) {
        c.vanishTimer--;
        if (c.vanishTimer <= 0) {
          addParticles(c.x, c.y, "#22d3ee", 20, 5);
        }
        continue;
      }
      c.vy += GRAVITY;
      c.vx *= FRICTION;
      c.x += c.vx;
      c.y += c.vy;
      // 速度限制
      if (c.vy > 12) c.vy = 12;
      if (c.vx > 8) c.vx = 8;
      if (c.vx < -8) c.vx = -8;
    }

    // 碰撞
    resolveCollisions();

    // 合并
    processMerges();

    // 移除消失的外星
    creaturesRef.current = creatures.filter(c => !(c.vanishing && c.vanishTimer <= 0));

    // 限制生物数量
    if (creaturesRef.current.length > MAX_CREATURES) {
      creaturesRef.current = creaturesRef.current.slice(-MAX_CREATURES);
    }

    // 粒子
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= 0.02;
    }
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 浮动文字
    for (const t of floatTextsRef.current) {
      t.y -= 1.5;
      t.life -= 0.018;
    }
    floatTextsRef.current = floatTextsRef.current.filter(t => t.life > 0);

    // 游戏结束检测
    let inDanger = false;
    for (const c of creaturesRef.current) {
      if (c.vanishing) continue;
      if (c.y - c.r < DANGER_Y && Math.abs(c.vy) < 1.5 && animRef.current - c.bornFrame > 30) {
        inDanger = true;
        break;
      }
    }
    if (inDanger) {
      gameOverTimerRef.current++;
      if (gameOverTimerRef.current > GAME_OVER_FRAMES) {
        doGameOver();
      }
    } else {
      gameOverTimerRef.current = Math.max(0, gameOverTimerRef.current - 2);
    }
  }, [resolveCollisions, processMerges, addParticles, doGameOver]);

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
    const frame = animRef.current;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0a1e");
    bg.addColorStop(0.5, "#0d0d24");
    bg.addColorStop(1, "#080814");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 背景网格
    ctx.strokeStyle = "rgba(99,102,241,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // 容器边框
    ctx.strokeStyle = "rgba(139,92,246,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WALL_PAD, DANGER_Y);
    ctx.lineTo(WALL_PAD, H - WALL_PAD);
    ctx.lineTo(W - WALL_PAD, H - WALL_PAD);
    ctx.lineTo(W - WALL_PAD, DANGER_Y);
    ctx.stroke();

    // 危险线
    const dangerAlpha = gameOverTimerRef.current > 0
      ? 0.3 + 0.5 * Math.sin(frame * 0.3)
      : 0.2;
    ctx.strokeStyle = `rgba(239,68,68,${dangerAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, DANGER_Y);
    ctx.lineTo(W, DANGER_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 投放器
    if (runningRef.current && !overRef.current && !pausedRef.current) {
      const cl = currentLevelRef.current;
      const evo = EVOLUTION[cl];
      const dx = dropperXRef.current;
      // 投放线
      ctx.strokeStyle = "rgba(139,92,246,0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(dx, DROPPER_Y + evo.r);
      ctx.lineTo(dx, H - WALL_PAD);
      ctx.stroke();
      ctx.setLineDash([]);
      // 投放闪光
      if (dropFlashRef.current > 0) {
        ctx.fillStyle = `rgba(167,139,250,${dropFlashRef.current / 10 * 0.3})`;
        ctx.fillRect(0, 0, W, H);
      }
      // 当前生物
      ctx.save();
      ctx.shadowColor = evo.color;
      ctx.shadowBlur = 10;
      const grad = ctx.createRadialGradient(dx - 4, DROPPER_Y - 4, 2, dx, DROPPER_Y, evo.r);
      grad.addColorStop(0, evo.color);
      grad.addColorStop(0.7, evo.color);
      grad.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(dx, DROPPER_Y, evo.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Emoji
      ctx.font = `${evo.r * 1.3}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(evo.emoji, dx, DROPPER_Y + 1);
    }

    // 生物
    for (const c of creaturesRef.current) {
      const evo = EVOLUTION[c.level];
      const age = frame - c.bornFrame;
      let scale = 1;
      if (age < 8) {
        scale = 1 + 0.4 * (1 - age / 8);
      }
      let alpha = 1;
      if (c.vanishing) {
        alpha = c.vanishTimer / 35;
        scale = 1 + (1 - alpha) * 0.5;
      }

      ctx.save();
      ctx.globalAlpha = alpha;
      // 光晕
      ctx.shadowColor = evo.color;
      ctx.shadowBlur = c.vanishing ? 20 : 8;
      // 身体
      const grad = ctx.createRadialGradient(c.x - c.r * 0.3, c.y - c.r * 0.3, c.r * 0.2, c.x, c.y, c.r * scale);
      grad.addColorStop(0, evo.color);
      grad.addColorStop(0.6, evo.color);
      grad.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 高光
      ctx.save();
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(c.x - c.r * 0.3, c.y - c.r * 0.35, c.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Emoji
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = `${c.r * 1.2 * scale}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(evo.emoji, c.x, c.y + 1);
      ctx.restore();

      // 消失光环
      if (c.vanishing) {
        ctx.strokeStyle = `rgba(34,211,238,${alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * scale + 5 + (1 - alpha) * 15, 0, Math.PI * 2);
        ctx.stroke();
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

    // 浮动文字
    for (const t of floatTextsRef.current) {
      ctx.save();
      ctx.globalAlpha = t.life;
      ctx.fillStyle = t.color;
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }

    // 下一个预览
    if (runningRef.current && !overRef.current) {
      const nl = nextLevelRef.current;
      const ne = EVOLUTION[nl];
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("下一个", W - 55, 18);
      ctx.shadowColor = ne.color;
      ctx.shadowBlur = 6;
      const ng = ctx.createRadialGradient(W - 30, 35, 2, W - 30, 35, ne.r * 0.6);
      ng.addColorStop(0, ne.color);
      ng.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(W - 30, 35, ne.r * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.font = `${ne.r * 0.8}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ne.emoji, W - 30, 36);
    }

    // 进化链
    ctx.font = "9px sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i < EVOLUTION.length; i++) {
      const ex = 25 + i * 50;
      const ey = H - 14;
      const achieved = i <= maxLevelRef.current;
      ctx.globalAlpha = achieved ? 1 : 0.3;
      ctx.font = "14px serif";
      ctx.fillText(EVOLUTION[i].emoji, ex, ey);
      if (i < EVOLUTION.length - 1) {
        ctx.globalAlpha = achieved && i < maxLevelRef.current ? 0.5 : 0.15;
        ctx.strokeStyle = "rgba(167,139,250,1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ex + 10, ey);
        ctx.lineTo(ex + 40, ey);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
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
    creaturesRef.current = [];
    particlesRef.current = [];
    floatTextsRef.current = [];
    dropperXRef.current = W / 2;
    scoreRef.current = 0;
    maxLevelRef.current = 0;
    gameOverTimerRef.current = 0;
    canDropRef.current = true;
    cooldownRef.current = 0;
    submittedRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    setScore(0);
    setMaxLevel(0);
    setOver(false);
    setResult(null);
    const cl = Math.floor(Math.random() * (MAX_DROP_LEVEL + 1));
    const nl = Math.floor(Math.random() * (MAX_DROP_LEVEL + 1));
    currentLevelRef.current = cl;
    nextLevelRef.current = nl;
    setCurrentLevel(cl);
    setNextLevel(nl);
    runningRef.current = true;
    setRunning(true);
    recordGamePlay(GAME_ID, 0);
  }, []);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    creaturesRef.current = [];
    particlesRef.current = [];
    floatTextsRef.current = [];
    dropperXRef.current = W / 2;
    scoreRef.current = 0;
    maxLevelRef.current = 0;
    gameOverTimerRef.current = 0;
    canDropRef.current = true;
    setScore(0);
    setMaxLevel(0);
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
      if (k === "p") {
        e.preventDefault();
        togglePause();
      } else if (k === " " || k === "enter") {
        e.preventDefault();
        if (!runningRef.current && !overRef.current) {
          start();
        } else if (runningRef.current && !overRef.current && !pausedRef.current) {
          dropCreature();
        }
      } else if (k === "arrowleft" || k === "a") {
        e.preventDefault();
        dropperXRef.current = Math.max(20, dropperXRef.current - 30);
      } else if (k === "arrowright" || k === "d") {
        e.preventDefault();
        dropperXRef.current = Math.min(W - 20, dropperXRef.current + 30);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [start, dropCreature, togglePause]);

  /* ----- 鼠标/触摸控制 ----- */
  const getCanvasX = (e: React.MouseEvent | React.TouchEvent) => {
    const cv = canvasRef.current;
    if (!cv) return W / 2;
    const rect = cv.getBoundingClientRect();
    const scaleX = W / rect.width;
    let cx: number;
    if ("touches" in e) {
      const t = e.touches[0] || e.changedTouches[0];
      cx = t.clientX;
    } else {
      cx = e.clientX;
    }
    return (cx - rect.left) * scaleX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    dropperXRef.current = getCanvasX(e);
  };
  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dropperXRef.current = getCanvasX(e);
    dropCreature();
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    dropperXRef.current = getCanvasX(e);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    dropCreature();
  };

  const stats: GameStat[] = [
    { label: "分数", value: score, icon: "⭐" },
    { label: "最高进化", value: EVOLUTION[maxLevel].emoji, icon: "🧬" },
    { label: "生物数", value: creaturesRef.current.length, icon: "🔬" },
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
      title="进化合成"
      iconEmoji="🧬"
      iconGradient="from-green-400 to-teal-600"
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
            onMouseMove={onMouseMove}
            onClick={onClick}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="w-full max-w-[400px] h-auto rounded-xl touch-none shadow-lg shadow-purple-500/10 cursor-pointer"
          />

          {/* 开始界面 */}
          {!running && !over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/70 backdrop-blur-sm">
              <div className="text-5xl mb-3">🧬</div>
              <h2 className="text-3xl font-bold text-white mb-2">进化合成</h2>
              <p className="text-sm text-gray-300 mb-4 text-center px-4 leading-relaxed max-w-[320px]">
                投放生物，相同生物合并进化！
              </p>
              <div className="flex items-center gap-1 mb-4 text-lg">
                {EVOLUTION.map((e, i) => (
                  <span key={i} className={i < 7 ? "" : "opacity-30"}>
                    {i < 7 ? e.emoji : ""}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mb-6 text-center max-w-[300px]">
                鼠标/触摸移动投放位置，点击投放
                <br />
                进化到外星人可获得大量分数！
              </p>
              <button
                onClick={start}
                aria-label="开始游戏"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-lg shadow-lg shadow-green-500/30 transition hover:scale-105 active:scale-95"
              >
                开始合成
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
                className="h-12 px-6 rounded-xl bg-green-500 text-white font-medium shadow-lg transition hover:bg-green-600 active:scale-95"
              >
                继续
              </button>
            </div>
          )}

          {/* 结束界面 */}
          {over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/80 backdrop-blur-md p-4">
              <div className="text-5xl mb-3">🧬</div>
              <h3 className="text-2xl font-bold text-white mb-4">游戏结束</h3>
              <div className="grid grid-cols-2 gap-3 mb-4 w-full max-w-[280px]">
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">最高进化</div>
                  <div className="text-2xl">{EVOLUTION[maxLevel].emoji}</div>
                </div>
                <div className="rounded-lg bg-gray-800/60 px-3 py-2 text-center">
                  <div className="text-xs text-gray-400">生物数</div>
                  <div className="text-xl font-bold text-cyan-400">{creaturesRef.current.length}</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">{score}</div>
              <p className="text-xs text-gray-400 mb-1">
                {score >= best && score > 0 ? "🎉 新纪录！" : `最佳: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-gray-400 mb-4">
                  排名第 <span className="text-green-400 font-bold">{result.rank}</span>/{result.total}
                  ，超越 <span className="text-green-400 font-bold">{result.beatPercent}%</span> 玩家
                </p>
              )}
              <button
                onClick={restart}
                aria-label="重新开始"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold shadow-lg transition hover:scale-105 active:scale-95"
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
              className="h-11 px-6 rounded-xl bg-green-500 text-white font-medium shadow-lg transition hover:bg-green-600 active:scale-95"
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
          {running && !over && !paused && (
            <button
              onClick={dropCreature}
              aria-label="投放生物"
              className="h-11 px-6 rounded-xl bg-purple-500 text-white font-medium shadow-lg transition hover:bg-purple-600 active:scale-95"
            >
              投放
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
