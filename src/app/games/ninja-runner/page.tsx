"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Zap, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "ninja-runner";
const W = 800;
const H = 400;
const GROUND_Y = 320;
const BEST_SCORE_KEY = "gm_ninja_runner_best_score";
const GRAVITY = 0.7;
const JUMP_VEL = -13;
const BASE_SPEED = 4;
const PLAYER_X = 120;

interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "spike" | "barrier" | "gap";
  hit: boolean;
}

interface Collectible {
  x: number;
  y: number;
  type: "coin" | "shuriken";
  collected: boolean;
  bob: number;
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

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

interface Player {
  y: number;
  vy: number;
  onGround: boolean;
  jumps: number;
  sliding: boolean;
  slideTimer: number;
  hitTimer: number;
  invincible: number;
  runPhase: number;
}

/* ============ 组件 ============ */

export default function NinjaRunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playerRef = useRef<Player>({
    y: GROUND_Y,
    vy: 0,
    onGround: true,
    jumps: 0,
    sliding: false,
    slideTimer: 0,
    hitTimer: 0,
    invincible: 0,
    runPhase: 0,
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const collectiblesRef = useRef<Collectible[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedRef = useRef(BASE_SPEED);
  const distanceRef = useRef(0);
  const coinsRef = useRef(0);
  const livesRef = useRef(3);
  const inputRef = useRef({ jump: false, slide: false });
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const pausedRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const animFrameRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const collectibleTimerRef = useRef(0);
  const bgOffsetRef = useRef(0);
  const mountainsRef = useRef<{ x: number; h: number; w: number }[]>([]);
  const treesRef = useRef<{ x: number; h: number }[]>([]);

  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lives, setLives] = useState(3);
  const [coins, setCoins] = useState(0);
  const [invincible, setInvincible] = useState(false);
  const [paused, setPaused] = useState(false);

  /* ----- 初始化背景元素 ----- */
  const initBackground = useCallback(() => {
    const mountains: { x: number; h: number; w: number }[] = [];
    for (let i = 0; i < 8; i++) {
      mountains.push({
        x: i * 200,
        h: 80 + Math.random() * 60,
        w: 150 + Math.random() * 100,
      });
    }
    mountainsRef.current = mountains;

    const trees: { x: number; h: number }[] = [];
    for (let i = 0; i < 15; i++) {
      trees.push({
        x: i * 80,
        h: 30 + Math.random() * 25,
      });
    }
    treesRef.current = trees;
  }, []);

  /* ----- 生成障碍物 ----- */
  const spawnObstacle = useCallback(() => {
    const types: ("spike" | "barrier" | "gap")[] = ["spike", "barrier", "gap"];
    const type = types[Math.floor(Math.random() * types.length)];
    let obs: Obstacle;
    if (type === "spike") {
      obs = { x: W + 50, y: GROUND_Y - 25, w: 25, h: 25, type, hit: false };
    } else if (type === "barrier") {
      obs = { x: W + 50, y: GROUND_Y - 70, w: 30, h: 40, type, hit: false };
    } else {
      obs = { x: W + 50, y: GROUND_Y, w: 60, h: 80, type, hit: false };
    }
    obstaclesRef.current.push(obs);
  }, []);

  /* ----- 生成收集品 ----- */
  const spawnCollectible = useCallback(() => {
    const isShuriken = Math.random() < 0.15;
    const y = isShuriken
      ? GROUND_Y - 80 - Math.random() * 60
      : GROUND_Y - 40 - Math.random() * 80;
    collectiblesRef.current.push({
      x: W + 50,
      y,
      type: isShuriken ? "shuriken" : "coin",
      collected: false,
      bob: Math.random() * Math.PI * 2,
    });
  }, []);

  /* ----- 添加粒子 ----- */
  const addParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 20 + Math.random() * 15,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  /* ----- 绘制 ----- */
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    animFrameRef.current++;

    // 天空渐变
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#1e1b4b");
    sky.addColorStop(0.4, "#312e81");
    sky.addColorStop(0.8, "#581c87");
    sky.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // 月亮
    ctx.save();
    ctx.shadowColor = "rgba(251,191,36,0.5)";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(650, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = sky;
    ctx.beginPath();
    ctx.arc(640, 72, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 星星
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 30; i++) {
      const sx = (i * 37 + animFrameRef.current * 0.1) % W;
      const sy = (i * 23) % 120;
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(animFrameRef.current * 0.03 + i));
      ctx.globalAlpha = tw * 0.5;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1;

    // 远山（视差）
    const bgOff = bgOffsetRef.current;
    ctx.fillStyle = "rgba(88,28,135,0.4)";
    for (const m of mountainsRef.current) {
      const mx = ((m.x - bgOff * 0.2) % (W + 200)) - 100;
      if (mx < -200 || mx > W + 100) continue;
      ctx.beginPath();
      ctx.moveTo(mx, GROUND_Y);
      ctx.lineTo(mx + m.w / 2, GROUND_Y - m.h);
      ctx.lineTo(mx + m.w, GROUND_Y);
      ctx.fill();
    }

    // 近山
    ctx.fillStyle = "rgba(30,27,75,0.6)";
    for (const m of mountainsRef.current) {
      const mx = ((m.x - bgOff * 0.4 + 100) % (W + 200)) - 100;
      if (mx < -200 || mx > W + 100) continue;
      ctx.beginPath();
      ctx.moveTo(mx, GROUND_Y);
      ctx.lineTo(mx + m.w * 0.7 / 2, GROUND_Y - m.h * 0.7);
      ctx.lineTo(mx + m.w * 0.7, GROUND_Y);
      ctx.fill();
    }

    // 树（视差）
    for (const t of treesRef.current) {
      const tx = ((t.x - bgOff * 0.7) % (W + 80)) - 40;
      if (tx < -40 || tx > W + 40) continue;
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(tx - 2, GROUND_Y - t.h, 4, t.h);
      ctx.fillStyle = "#14532d";
      ctx.beginPath();
      ctx.moveTo(tx, GROUND_Y - t.h - 12);
      ctx.lineTo(tx - 10, GROUND_Y - t.h + 4);
      ctx.lineTo(tx + 10, GROUND_Y - t.h + 4);
      ctx.fill();
    }

    // 地面
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    groundGrad.addColorStop(0, "#1c1917");
    groundGrad.addColorStop(1, "#0c0a09");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // 地面纹理
    ctx.strokeStyle = "rgba(239,68,68,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 20) {
      const gx = (i - bgOff) % W;
      ctx.beginPath();
      ctx.moveTo(gx, GROUND_Y);
      ctx.lineTo(gx + 10, GROUND_Y + 5);
      ctx.stroke();
    }

    // 地面线
    ctx.strokeStyle = "rgba(239,68,68,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    const player = playerRef.current;

    // 绘制障碍物
    for (const obs of obstaclesRef.current) {
      if (obs.type === "spike") {
        // 尖刺
        ctx.save();
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        const spikes = 3;
        const sw = obs.w / spikes;
        for (let i = 0; i < spikes; i++) {
          ctx.beginPath();
          ctx.moveTo(obs.x + i * sw, obs.y + obs.h);
          ctx.lineTo(obs.x + i * sw + sw / 2, obs.y);
          ctx.lineTo(obs.x + (i + 1) * sw, obs.y + obs.h);
          ctx.fill();
        }
        ctx.restore();
      } else if (obs.type === "barrier") {
        // 低矮障碍 — 滑铲穿过
        ctx.save();
        ctx.fillStyle = "#f59e0b";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 6;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(obs.x + 3, obs.y + 3, obs.w - 6, 3);
        ctx.fillRect(obs.x + 3, obs.y + obs.h / 2, obs.w - 6, 3);
        ctx.restore();
      } else if (obs.type === "gap") {
        // 缺口
        ctx.fillStyle = "#000";
        ctx.fillRect(obs.x, GROUND_Y, obs.w, H - GROUND_Y);
        // 边缘
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obs.x, GROUND_Y);
        ctx.lineTo(obs.x, GROUND_Y + 10);
        ctx.moveTo(obs.x + obs.w, GROUND_Y);
        ctx.lineTo(obs.x + obs.w, GROUND_Y + 10);
        ctx.stroke();
      }
    }

    // 绘制收集品
    for (const c of collectiblesRef.current) {
      if (c.collected) continue;
      c.bob += 0.1;
      const cy = c.y + Math.sin(c.bob) * 5;
      ctx.save();
      if (c.type === "coin") {
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(c.x, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(c.x, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("$", c.x, cy + 3);
      } else {
        // 手里剑
        ctx.translate(c.x, cy);
        ctx.rotate(animFrameRef.current * 0.1);
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#06b6d4";
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(6, -3);
          ctx.lineTo(12, 0);
          ctx.lineTo(6, 3);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 绘制粒子
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.globalAlpha = p.life / 35;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 绘制忍者
    drawNinja(ctx, player);

    // HUD
    // 生命
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < livesRef.current ? "#ef4444" : "#27272a";
      ctx.font = "20px sans-serif";
      ctx.fillText("❤", 15 + i * 25, 30);
    }

    // 分数
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.floor(distanceRef.current / 10) + coinsRef.current * 10}`, W - 15, 28);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("分数", W - 15, 42);

    // 金币
    ctx.textAlign = "left";
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`🪙 ${coinsRef.current}`, 15, 50);

    // 速度指示
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`速度 ${speedRef.current.toFixed(1)}x`, W / 2, 25);

    // 无敌状态
    if (player.invincible > 0) {
      ctx.fillStyle = "rgba(6,182,212,0.8)";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`无敌 ${Math.ceil(player.invincible / 60)}s`, W / 2, 45);
    }
  }, []);

  /* ----- 绘制忍者 ----- */
  function drawNinja(ctx: CanvasRenderingContext2D, p: Player) {
    const x = PLAYER_X;
    let y = p.y;
    const isInvincible = p.invincible > 0;
    const isHit = p.hitTimer > 0;

    ctx.save();

    // 闪烁效果
    if (isInvincible && animFrameRef.current % 6 < 3) {
      ctx.globalAlpha = 0.6;
    }
    if (isHit && animFrameRef.current % 4 < 2) {
      ctx.globalAlpha = 0.3;
    }

    const bodyColor = isInvincible ? "#06b6d4" : "#dc2626";

    // 阴影
    if (p.onGround) {
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(x, GROUND_Y + 2, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.sliding) {
      // 滑铲姿态
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      // 身体
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 10);
      ctx.lineTo(x + 15, y - 10);
      ctx.stroke();
      // 头
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(x + 18, y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      // 头巾飘带
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 12, y - 14);
      ctx.lineTo(x - 5, y - 16);
      ctx.stroke();
      // 腿
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 10);
      ctx.lineTo(x - 25, y - 5);
      ctx.moveTo(x - 10, y - 10);
      ctx.lineTo(x - 20, y - 2);
      ctx.stroke();
      // 滑铲尘土
      if (animFrameRef.current % 3 === 0) {
        particlesRef.current.push({
          x: x - 20,
          y: y - 2,
          vx: -2,
          vy: -1,
          life: 15,
          color: "#78716c",
          size: 2,
        });
      }
    } else {
      // 正常/跳跃姿态
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      const headR = 8;
      const headY = y - 45;
      const bodyTop = y - 38;
      const bodyBot = y - 18;

      // 头
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(x, headY, headR, 0, Math.PI * 2);
      ctx.fill();
      // 眼睛
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 2, headY - 2, 4, 2);

      // 头巾飘带
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 2;
      const bandWave = Math.sin(animFrameRef.current * 0.2);
      ctx.beginPath();
      ctx.moveTo(x - 6, headY - 2);
      ctx.lineTo(x - 14, headY - 4 + bandWave * 3);
      ctx.lineTo(x - 20, headY + bandWave * 5);
      ctx.stroke();

      // 身体
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, bodyTop);
      ctx.lineTo(x, bodyBot);
      ctx.stroke();

      if (p.onGround) {
        // 跑步腿
        const legPhase = p.runPhase;
        const legL = Math.sin(legPhase) * 8;
        const legR = Math.sin(legPhase + Math.PI) * 8;
        ctx.beginPath();
        ctx.moveTo(x, bodyBot);
        ctx.lineTo(x - 6 + legL, y);
        ctx.moveTo(x, bodyBot);
        ctx.lineTo(x + 6 + legR, y);
        ctx.stroke();

        // 手臂摆动
        const armL = Math.sin(legPhase + Math.PI) * 6;
        const armR = Math.sin(legPhase) * 6;
        ctx.beginPath();
        ctx.moveTo(x, bodyTop + 4);
        ctx.lineTo(x - 8 + armL, bodyTop + 12);
        ctx.moveTo(x, bodyTop + 4);
        ctx.lineTo(x + 8 + armR, bodyTop + 12);
        ctx.stroke();
      } else {
        // 跳跃姿态 — 蜷腿
        ctx.beginPath();
        ctx.moveTo(x, bodyBot);
        ctx.lineTo(x - 8, y - 8);
        ctx.moveTo(x, bodyBot);
        ctx.lineTo(x + 8, y - 8);
        ctx.stroke();
        // 手臂上举
        ctx.beginPath();
        ctx.moveTo(x, bodyTop + 4);
        ctx.lineTo(x - 8, bodyTop - 4);
        ctx.moveTo(x, bodyTop + 4);
        ctx.lineTo(x + 8, bodyTop - 4);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /* ----- 碰撞检测 ----- */
  function checkCollision(p: Player, obs: Obstacle): boolean {
    const px = PLAYER_X;
    const pw = 24;
    let py: number, ph: number;
    if (p.sliding) {
      py = p.y - 20;
      ph = 20;
    } else {
      py = p.y - 53;
      ph = 53;
    }

    if (obs.type === "gap") {
      // 缺口 — 只有在地面时才会掉入
      if (p.onGround && px + pw > obs.x && px < obs.x + obs.w) {
        return true;
      }
      return false;
    }

    return (
      px + pw > obs.x &&
      px < obs.x + obs.w &&
      py + ph > obs.y &&
      py < obs.y + obs.h
    );
  }

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finalScore = Math.floor(distanceRef.current / 10) + coinsRef.current * 10;
    const r = submitScore(GAME_ID, finalScore, `距离 ${Math.floor(distanceRef.current / 10)}m + 金币 ${coinsRef.current}`);
    setResult(r);
    setRefreshKey((k) => k + 1);
    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBest(finalScore);
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(finalScore));
      } catch {
        /* ignore */
      }
    }
  }, []);

  /* ----- 更新 ----- */
  const update = useCallback(() => {
    const player = playerRef.current;

    // 速度递增
    speedRef.current = BASE_SPEED + distanceRef.current / 2000;
    const speed = speedRef.current;
    distanceRef.current += speed;
    bgOffsetRef.current += speed;

    // 玩家物理
    if (inputRef.current.jump && player.jumps < 2) {
      player.vy = JUMP_VEL;
      player.onGround = false;
      player.jumps++;
      player.sliding = false;
      inputRef.current.jump = false;
      addParticles(PLAYER_X, player.y, "#dc2626", 5);
    }

    if (inputRef.current.slide && player.onGround) {
      player.sliding = true;
      player.slideTimer = 30;
      inputRef.current.slide = false;
    }
    if (player.slideTimer > 0) {
      player.slideTimer--;
      if (player.slideTimer <= 0) {
        player.sliding = false;
      }
    }

    player.vy += GRAVITY;
    player.y += player.vy;

    // 检查是否在地面（需要检查缺口）
    let onGap = false;
    for (const obs of obstaclesRef.current) {
      if (obs.type === "gap" && obs.hit) continue;
      if (
        obs.type === "gap" &&
        PLAYER_X > obs.x &&
        PLAYER_X < obs.x + obs.w
      ) {
        onGap = true;
        break;
      }
    }

    if (player.y >= GROUND_Y && !onGap) {
      player.y = GROUND_Y;
      player.vy = 0;
      player.onGround = true;
      player.jumps = 0;
    } else if (player.y >= GROUND_Y && onGap) {
      // 掉入缺口
      player.vy += GRAVITY * 2;
      player.y += player.vy;
      if (player.y > H + 50) {
        livesRef.current = 0;
        setLives(0);
        doGameOver();
        return;
      }
    } else {
      player.onGround = false;
    }

    if (player.onGround) {
      player.runPhase += speed * 0.12;
    }

    if (player.hitTimer > 0) player.hitTimer--;
    if (player.invincible > 0) {
      player.invincible--;
      if (player.invincible === 0) {
        setInvincible(false);
      }
    }

    // 更新障碍物
    for (const obs of obstaclesRef.current) {
      obs.x -= speed;
    }
    obstaclesRef.current = obstaclesRef.current.filter((o) => o.x > -100);

    // 更新收集品
    for (const c of collectiblesRef.current) {
      c.x -= speed;
    }
    collectiblesRef.current = collectiblesRef.current.filter((c) => c.x > -50 && !c.collected);

    // 生成障碍物
    spawnTimerRef.current -= speed;
    if (spawnTimerRef.current <= 0) {
      spawnObstacle();
      spawnTimerRef.current = 120 + Math.random() * 80;
    }

    // 生成收集品
    collectibleTimerRef.current -= speed;
    if (collectibleTimerRef.current <= 0) {
      spawnCollectible();
      collectibleTimerRef.current = 80 + Math.random() * 60;
    }

    // 碰撞检测 — 障碍物
    if (player.invincible <= 0) {
      for (const obs of obstaclesRef.current) {
        if (obs.hit) continue;
        if (checkCollision(player, obs)) {
          obs.hit = true;
          player.hitTimer = 30;
          player.invincible = 90;
          livesRef.current--;
          setLives(livesRef.current);
          addParticles(PLAYER_X, player.y - 30, "#ef4444", 15);
          if (livesRef.current <= 0) {
            doGameOver();
            return;
          }
        }
      }
    }

    // 收集品检测
    const px = PLAYER_X;
    const py = player.sliding ? player.y - 10 : player.y - 30;
    for (const c of collectiblesRef.current) {
      if (c.collected) continue;
      const dx = Math.abs(c.x - px);
      const dy = Math.abs(c.y - py);
      if (dx < 25 && dy < 30) {
        c.collected = true;
        if (c.type === "coin") {
          coinsRef.current++;
          setCoins(coinsRef.current);
          addParticles(c.x, c.y, "#fbbf24", 8);
        } else {
          player.invincible = 300;
          setInvincible(true);
          addParticles(c.x, c.y, "#06b6d4", 20);
        }
      }
    }

    // 更新粒子
    for (const p of particlesRef.current) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
    }
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    // 更新分数
    const newScore = Math.floor(distanceRef.current / 10) + coinsRef.current * 10;
    setScore(newScore);
  }, [spawnObstacle, spawnCollectible, addParticles, doGameOver]);

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

  /* ----- mounted 初始化 ----- */
  useEffect(() => {
    setMounted(true);
    initBackground();
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (saved > 0) {
        bestRef.current = saved;
        setBest(saved);
      }
    } catch {
      /* ignore */
    }
  }, [initBackground]);

  /* ----- 暂停/继续 ----- */
  const togglePause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    playerRef.current = {
      y: GROUND_Y,
      vy: 0,
      onGround: true,
      jumps: 0,
      sliding: false,
      slideTimer: 0,
      hitTimer: 0,
      invincible: 0,
      runPhase: 0,
    };
    obstaclesRef.current = [];
    collectiblesRef.current = [];
    particlesRef.current = [];
    speedRef.current = BASE_SPEED;
    distanceRef.current = 0;
    coinsRef.current = 0;
    livesRef.current = 3;
    spawnTimerRef.current = 60;
    collectibleTimerRef.current = 100;
    overRef.current = false;
    submittedRef.current = false;
    pausedRef.current = false;
    setScore(0);
    setCoins(0);
    setLives(3);
    setInvincible(false);
    setOver(false);
    setResult(null);
    setPaused(false);
    runningRef.current = true;
    setRunning(true);
  }, []);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    start();
  }, [start]);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "arrowup" || k === "w") {
        inputRef.current.jump = true;
        e.preventDefault();
      } else if (k === "arrowdown" || k === "s") {
        inputRef.current.slide = true;
        e.preventDefault();
      } else if (k === "p") {
        togglePause();
        e.preventDefault();
      } else if (k === "enter") {
        if (!runningRef.current) start();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [start, togglePause]);

  /* ----- 触摸控制 ----- */
  const onTouchStart = (e: React.TouchEvent) => {
    if (!runningRef.current) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      const y = t.clientY - rect.top;
      if (y < rect.height * 0.6) {
        inputRef.current.jump = true;
      } else {
        inputRef.current.slide = true;
      }
    }
  };

  const stats: GameStat[] = [
    { label: "当前分数", value: score },
    { label: "金币", value: coins },
    { label: "生命", value: `${lives}/3` },
    { label: "最高记录", value: best },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="忍者跑酷"
        description="操控忍者飞奔穿越障碍！跳跃躲避尖刺，滑铲穿过低栏，跨过缺口。收集金币和手里剑，手里剑可获得短暂无敌！"
        instructions={`键盘控制：
  空格 / ↑ / W = 跳跃（可二段跳）
  ↓ / S = 滑铲
移动端：点击屏幕上半部分跳跃，下半部分滑铲

障碍类型：
  红色尖刺 = 跳跃越过
  橙色低栏 = 滑铲穿过
  黑色缺口 = 跳跃跨越

收集品：
  金币 = 每个加10分
  手里剑 = 5秒无敌状态

速度会随距离逐渐加快，每次受伤失去1条命，3条命用完游戏结束。
分数 = 距离/10 + 金币×10`}
        icon={Zap}
        iconEmoji="🥷"
        iconGradient="from-red-500 to-rose-600"
        stats={stats}
        shareScore={score}
        refreshKey={refreshKey}
      >
        <div className="flex items-center justify-center h-[400px] text-slate-500">加载中...</div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="忍者跑酷"
      description="操控忍者飞奔穿越障碍！跳跃躲避尖刺，滑铲穿过低栏，跨过缺口。收集金币和手里剑，手里剑可获得短暂无敌！"
      instructions={`键盘控制：
  空格 / ↑ / W = 跳跃（可二段跳）
  ↓ / S = 滑铲
移动端：点击屏幕上半部分跳跃，下半部分滑铲

障碍类型：
  红色尖刺 = 跳跃越过
  橙色低栏 = 滑铲穿过
  黑色缺口 = 跳跃跨越

收集品：
  金币 = 每个加10分
  手里剑 = 5秒无敌状态

速度会随距离逐渐加快，每次受伤失去1条命，3条命用完游戏结束。
分数 = 距离/10 + 金币×10`}
      icon={Zap}
      iconEmoji="🥷"
      iconGradient="from-red-500 to-rose-600"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onTouchStart={onTouchStart}
            className="w-full max-w-[800px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-red-500/10"
          />

          {/* 待开始覆盖层 */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                <Play className="w-5 h-5" /> 开始跑酷
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-4 leading-relaxed">
                空格跳跃（可二段跳） · ↓ 滑铲
                <br />
                移动端：上屏跳，下屏滑
              </p>
            </div>
          )}

          {/* 暂停覆盖层 */}
          {paused && running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <h3 className="text-2xl font-bold text-white mb-4">已暂停</h3>
              <button
                onClick={togglePause}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🥷</div>
              <h3 className="text-2xl font-bold mb-2">跑酷结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-red-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-1">
                距离 {Math.floor(distanceRef.current / 10)}m · 金币 {coins}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-red-400 font-bold">{result.rank}</span>/{result.total}
                  ，超越了 <span className="text-red-400 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再跑一次
              </button>
            </div>
          )}
        </div>

        {/* 移动端控制按钮 */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              inputRef.current.jump = true;
            }}
            className="w-24 h-16 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-red-600 active:scale-95 transition-all border border-[#3f3f46] flex-col"
          >
            <span className="text-2xl">⬆️</span>
            <span className="text-[10px] text-slate-400">跳跃</span>
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              inputRef.current.slide = true;
            }}
            className="w-24 h-16 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-red-600 active:scale-95 transition-all border border-[#3f3f46] flex-col"
          >
            <span className="text-2xl">⬇️</span>
            <span className="text-[10px] text-slate-400">滑铲</span>
          </button>
        </div>

        {/* 开始/暂停/重开按钮 */}
        <div className="flex items-center gap-3 mt-3">
          {!running && !over && (
            <button
              onClick={start}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30"
            >
              <Play className="w-4 h-4" /> 开始
            </button>
          )}
          {running && !over && (
            <button
              onClick={togglePause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? "继续" : "暂停"}
            </button>
          )}
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>
      </div>
    </GameShell>
  );
}
