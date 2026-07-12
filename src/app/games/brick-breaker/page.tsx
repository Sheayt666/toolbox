"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrickWall, RotateCcw, Play, Pause, Heart, Zap } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "brick-breaker";
const CANVAS_W = 600;
const CANVAS_H = 450;
const BEST_SCORE_KEY = "gm_brick_best_score";

// 网格布局
const COLS = 10;
const BRICK_W = 52;
const BRICK_H = 18;
const GAP = 6;
const PAD_X = 12;
const OFFSET_Y = 45;
const GAP_Y = 6;

// 挡板 / 球
const PADDLE_Y = CANVAS_H - 24;
const PADDLE_H = 12;
const PADDLE_BASE_W = 92;
const PADDLE_EXPAND_W = 140;
const BALL_R = 7;
const BASE_SPEED = 4.6;

// 砖块类型: 0=空 1=普通 2=坚硬 3=钢铁
const BRICK_DEFS = [
  { color: "#27272a", hp: 0, points: 0 }, // 0 空
  { color: "#8b5cf6", hp: 1, points: 10 }, // 普通紫
  { color: "#f59e0b", hp: 2, points: 25 }, // 坚硬橙
  { color: "#64748b", hp: 3, points: 45 }, // 钢铁灰
];

// 5 关布局
const LEVELS: number[][][] = [
  // L1 入门
  [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  // L2 金字塔
  [
    [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 2, 2, 1, 1, 0, 0],
    [0, 1, 1, 2, 2, 2, 2, 1, 1, 0],
    [1, 1, 2, 2, 3, 3, 2, 2, 1, 1],
  ],
  // L3 棋盘
  [
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
  ],
  // L4 堡垒
  [
    [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
    [3, 2, 1, 1, 1, 1, 1, 1, 2, 3],
    [3, 2, 1, 0, 0, 0, 0, 1, 2, 3],
    [3, 2, 2, 2, 2, 2, 2, 2, 2, 3],
  ],
  // L5 终极混合
  [
    [3, 2, 3, 2, 3, 2, 3, 2, 3, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 3, 1, 3, 1, 3, 1, 3, 1, 3],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  stuck: boolean;
}

interface Brick {
  x: number;
  y: number;
  type: number;
  hp: number;
  alive: boolean;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  kind: "expand" | "multi" | "slow";
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function buildBricks(level: number): Brick[] {
  const layout = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
  const bricks: Brick[] = [];
  for (let r = 0; r < layout.length; r++) {
    for (let c = 0; c < COLS; c++) {
      const t = layout[r][c];
      if (!t) continue;
      bricks.push({
        x: PAD_X + c * (BRICK_W + GAP),
        y: OFFSET_Y + r * (BRICK_H + GAP_Y),
        type: t,
        hp: BRICK_DEFS[t].hp,
        alive: true,
      });
    }
  }
  return bricks;
}

export default function BrickBreakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const paddleXRef = useRef(CANVAS_W / 2 - PADDLE_BASE_W / 2);
  const effectsRef = useRef({ expandUntil: 0, slowUntil: 0 });
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const levelRef = useRef(1);
  const bestRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const wonRef = useRef(false);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);
  const flashRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const stepRef = useRef<(dt: number) => void>(() => {});
  const drawRef = useRef<() => void>(() => {});
  const gameOverRef = useRef<() => void>(() => {});
  const loseLifeRef = useRef<() => void>(() => {});

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const targetSpeed = useCallback(() => {
    const slow = performance.now() < effectsRef.current.slowUntil;
    return (BASE_SPEED + (levelRef.current - 1) * 0.45) * (slow ? 0.62 : 1);
  }, []);

  const paddleWidth = useCallback(() => {
    return performance.now() < effectsRef.current.expandUntil
      ? PADDLE_EXPAND_W
      : PADDLE_BASE_W;
  }, []);

  const resetBallToPaddle = useCallback(() => {
    const pw = paddleWidth();
    ballsRef.current = [
      {
        x: paddleXRef.current + pw / 2,
        y: PADDLE_Y - BALL_R - 1,
        vx: 0,
        vy: 0,
        stuck: true,
      },
    ];
  }, [paddleWidth]);

  const loseLife = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    powerUpsRef.current = [];
    if (livesRef.current <= 0) {
      gameOverRef.current();
    } else {
      resetBallToPaddle();
    }
  }, [resetBallToPaddle]);

  const nextLevel = useCallback(() => {
    if (levelRef.current >= LEVELS.length) {
      // 通关
      wonRef.current = true;
      setWon(true);
      runningRef.current = false;
      setRunning(false);
      if (submittedRef.current) return;
      submittedRef.current = true;
      const s = scoreRef.current;
      const r = submitScore(GAME_ID, s, `通关 ${s} 分`);
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
      return;
    }
    levelRef.current += 1;
    setLevel(levelRef.current);
    bricksRef.current = buildBricks(levelRef.current);
    powerUpsRef.current = [];
    effectsRef.current = { expandUntil: 0, slowUntil: 0 };
    resetBallToPaddle();
  }, [resetBallToPaddle]);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `第${levelRef.current}关 ${s} 分`);
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

  const launchBall = useCallback(() => {
    let launched = false;
    for (const b of ballsRef.current) {
      if (b.stuck) {
        const sp = targetSpeed();
        b.stuck = false;
        b.vx = sp * 0.4;
        b.vy = -sp * 0.92;
        launched = true;
      }
    }
    return launched;
  }, [targetSpeed]);

  const spawnPowerUp = useCallback((x: number, y: number) => {
    const kinds: PowerUp["kind"][] = ["expand", "multi", "slow"];
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    powerUpsRef.current.push({ x, y, vy: 2.2, kind });
  }, []);

  const stepPhysics = useCallback(
    (dt: number) => {
      const pw = paddleWidth();
      const sp = targetSpeed();
      const now = performance.now();

      for (const ball of ballsRef.current) {
        if (ball.stuck) {
          ball.x = paddleXRef.current + pw / 2;
          ball.y = PADDLE_Y - BALL_R - 1;
          continue;
        }
        // 速度归一化（保持恒定速率，处理 slow 效果）
        const cur = Math.hypot(ball.vx, ball.vy) || 1;
        ball.vx = (ball.vx / cur) * sp;
        ball.vy = (ball.vy / cur) * sp;

        // 子步进，避免穿透
        const steps = Math.max(1, Math.ceil((sp * dt) / (BALL_R * 0.6)));
        const sx = (ball.vx * dt) / steps;
        const sy = (ball.vy * dt) / steps;
        for (let s = 0; s < steps; s++) {
          ball.x += sx;
          ball.y += sy;

          // 墙壁
          if (ball.x - BALL_R < 0) {
            ball.x = BALL_R;
            ball.vx = Math.abs(ball.vx);
          }
          if (ball.x + BALL_R > CANVAS_W) {
            ball.x = CANVAS_W - BALL_R;
            ball.vx = -Math.abs(ball.vx);
          }
          if (ball.y - BALL_R < 0) {
            ball.y = BALL_R;
            ball.vy = Math.abs(ball.vy);
          }

          // 挡板碰撞
          if (
            ball.vy > 0 &&
            ball.y + BALL_R >= PADDLE_Y &&
            ball.y + BALL_R <= PADDLE_Y + PADDLE_H + 6 &&
            ball.x >= paddleXRef.current - BALL_R &&
            ball.x <= paddleXRef.current + pw + BALL_R
          ) {
            const hit = (ball.x - (paddleXRef.current + pw / 2)) / (pw / 2);
            const angle = clamp(hit, -1, 1) * (Math.PI / 3); // 最大 60°
            ball.vx = sp * Math.sin(angle);
            ball.vy = -Math.abs(sp * Math.cos(angle));
            ball.y = PADDLE_Y - BALL_R - 1;
            // 保证最小水平分量，避免垂直死循环
            if (Math.abs(ball.vx) < sp * 0.15) {
              ball.vx = (ball.vx < 0 ? -1 : 1) * sp * 0.15;
              ball.vy = -Math.sqrt(Math.max(0, sp * sp - ball.vx * ball.vx));
            }
          }

          // 砖块碰撞
          let hitBrick: Brick | null = null;
          for (const br of bricksRef.current) {
            if (!br.alive) continue;
            const nx = clamp(ball.x, br.x, br.x + BRICK_W);
            const ny = clamp(ball.y, br.y, br.y + BRICK_H);
            const dx = ball.x - nx;
            const dy = ball.y - ny;
            if (dx * dx + dy * dy < BALL_R * BALL_R) {
              hitBrick = br;
              // 反弹方向
              if (Math.abs(dx) > Math.abs(dy)) {
                ball.vx = -ball.vx;
                if (dx >= 0) ball.x = br.x + BRICK_W + BALL_R + 0.5;
                else ball.x = br.x - BALL_R - 0.5;
              } else {
                ball.vy = -ball.vy;
                if (dy >= 0) ball.y = br.y + BRICK_H + BALL_R + 0.5;
                else ball.y = br.y - BALL_R - 0.5;
              }
              break;
            }
          }
          if (hitBrick) {
            hitBrick.hp -= 1;
            flashRef.current = {
              x: hitBrick.x + BRICK_W / 2,
              y: hitBrick.y + BRICK_H / 2,
              time: now,
            };
            if (hitBrick.hp <= 0) {
              hitBrick.alive = false;
              const pts = BRICK_DEFS[hitBrick.type].points;
              scoreRef.current += pts;
              setScore(scoreRef.current);
              // 12% 掉落道具
              if (Math.random() < 0.12) {
                spawnPowerUp(
                  hitBrick.x + BRICK_W / 2,
                  hitBrick.y + BRICK_H / 2,
                );
              }
            }
            break; // 每帧每球处理一次砖块碰撞
          }

          // 球掉到底部
          if (ball.y - BALL_R > CANVAS_H) {
            ball.x = -9999; // 标记移除
            break;
          }
        }
      }

      // 移除掉落的球 — 原地删除避免每帧 filter 创建新数组
      const balls = ballsRef.current;
      for (let i = balls.length - 1; i >= 0; i--) {
        if (balls[i].x <= -9000) balls.splice(i, 1);
      }
      if (ballsRef.current.length === 0) {
        loseLifeRef.current();
      }

      // 道具下落 + 接取 — 原地删除
      const powerUps = powerUpsRef.current;
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const p = powerUps[i];
        p.y += p.vy * dt;
        let remove = false;
        if (p.y > CANVAS_H) {
          remove = true;
        } else if (
          p.y + 8 >= PADDLE_Y &&
          p.y <= PADDLE_Y + PADDLE_H &&
          p.x >= paddleXRef.current &&
          p.x <= paddleXRef.current + pw
        ) {
          applyPowerUp(p.kind);
          remove = true;
        }
        if (remove) powerUps.splice(i, 1);
      }

      // 关卡通关判定
      if (bricksRef.current.every((b) => !b.alive)) {
        nextLevel();
      }
    },
    [paddleWidth, targetSpeed, spawnPowerUp, nextLevel],
  );

  const applyPowerUp = useCallback(
    (kind: PowerUp["kind"]) => {
      const now = performance.now();
      if (kind === "expand") {
        effectsRef.current.expandUntil = now + 12000;
      } else if (kind === "slow") {
        effectsRef.current.slowUntil = now + 9000;
      } else if (kind === "multi") {
        const current = ballsRef.current.filter((b) => !b.stuck);
        const src = current[0] || ballsRef.current[0];
        if (src) {
          const sp = targetSpeed();
          for (const ang of [-0.5, 0.5]) {
            const cos = Math.cos(ang);
            const sin = Math.sin(ang);
            ballsRef.current.push({
              x: src.x,
              y: src.y,
              vx: src.vx * cos - src.vy * sin,
              vy: src.vx * sin + src.vy * cos,
              stuck: false,
            });
          }
          // 限制最多 8 个球
          if (ballsRef.current.length > 8) {
            ballsRef.current = ballsRef.current.slice(0, 8);
          }
        }
      }
    },
    [targetSpeed],
  );

  function drawRoundRect(
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

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    // 缓存 getContext 结果，避免每帧重新获取
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = cv.getContext("2d");
      if (!ctx) return;
      ctxRef.current = ctx;
    }
    animFrameRef.current++;
    const t = animFrameRef.current;
    const now = performance.now();

    // 背景
    ctx.fillStyle = "#0b0b0e";
    ctx.fillRect(0, 0, cv.width, cv.height);
    // 背景星点
    ctx.fillStyle = "rgba(39,39,42,0.4)";
    for (let i = 0; i < 40; i++) {
      const x = (i * 97) % cv.width;
      const y = (i * 53) % cv.height;
      ctx.fillRect(x, y, 1, 1);
    }

    // 砖块
    for (const br of bricksRef.current) {
      if (!br.alive) continue;
      const def = BRICK_DEFS[br.type];
      const maxHp = BRICK_DEFS[br.type].hp;
      const dmg = 1 - br.hp / maxHp; // 0=满血 1=快碎
      ctx.save();
      const grad = ctx.createLinearGradient(br.x, br.y, br.x, br.y + BRICK_H);
      grad.addColorStop(0, lighten(def.color, 0.3 - dmg * 0.2));
      grad.addColorStop(1, darken(def.color, 0.25 + dmg * 0.15));
      ctx.fillStyle = grad;
      drawRoundRect(ctx, br.x, br.y, BRICK_W, BRICK_H, 3);
      ctx.fill();
      // 高光
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      drawRoundRect(ctx, br.x + 1, br.y + 1, BRICK_W - 2, 3, 2);
      ctx.fill();
      // 损伤裂纹
      if (dmg > 0.4) {
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(br.x + 8, br.y + 3);
        ctx.lineTo(br.x + 16, br.y + BRICK_H - 4);
        ctx.lineTo(br.x + BRICK_W - 10, br.y + 5);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 挡板
    const pw = paddleWidth();
    ctx.save();
    const pgrad = ctx.createLinearGradient(
      0,
      PADDLE_Y,
      0,
      PADDLE_Y + PADDLE_H,
    );
    pgrad.addColorStop(0, "#c4b5fd");
    pgrad.addColorStop(1, "#7c3aed");
    ctx.fillStyle = pgrad;
    ctx.shadowColor = "#8b5cf6";
    ctx.shadowBlur = 12;
    drawRoundRect(ctx, paddleXRef.current, PADDLE_Y, pw, PADDLE_H, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    drawRoundRect(ctx, paddleXRef.current + 2, PADDLE_Y + 1, pw - 4, 3, 2);
    ctx.fill();
    ctx.restore();

    // 球
    for (const ball of ballsRef.current) {
      ctx.save();
      ctx.shadowColor = "#a78bfa";
      ctx.shadowBlur = 12;
      const bgrad = ctx.createRadialGradient(
        ball.x - 2,
        ball.y - 2,
        1,
        ball.x,
        ball.y,
        BALL_R,
      );
      bgrad.addColorStop(0, "#f5f3ff");
      bgrad.addColorStop(1, "#a78bfa");
      ctx.fillStyle = bgrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 道具
    for (const p of powerUpsRef.current) {
      ctx.save();
      const color =
        p.kind === "expand"
          ? "#22c55e"
          : p.kind === "multi"
            ? "#06b6d4"
            : "#f59e0b";
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      drawRoundRect(ctx, p.x - 9, p.y - 7, 18, 14, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#09090b";
      ctx.font = "bold 10px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.kind === "expand" ? "E" : p.kind === "multi" ? "M" : "S", p.x, p.y);
      ctx.restore();
    }

    // 砖块击中闪光
    const fl = flashRef.current;
    if (fl) {
      const age = now - fl.time;
      if (age < 180) {
        ctx.save();
        ctx.globalAlpha = 1 - age / 180;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, 14 + age * 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        flashRef.current = null;
      }
    }

    // 效果指示器
    if (now < effectsRef.current.expandUntil) {
      drawEffectBar(ctx, "加长挡板", 10, CANVAS_H - 12, "#22c55e", effectsRef.current.expandUntil - now, 12000, t);
    }
    if (now < effectsRef.current.slowUntil) {
      drawEffectBar(ctx, "慢速", 10, CANVAS_H - 12 - (now < effectsRef.current.expandUntil ? 16 : 0), "#f59e0b", effectsRef.current.slowUntil - now, 9000, t);
    }
  }, [paddleWidth]);

  function drawEffectBar(
    ctx: CanvasRenderingContext2D,
    label: string,
    x: number,
    y: number,
    color: string,
    remain: number,
    total: number,
    t: number,
  ) {
    ctx.save();
    ctx.fillStyle = "rgba(9,9,11,0.7)";
    drawRoundRect(ctx, x, y, 110, 14, 4);
    ctx.fill();
    ctx.fillStyle = color;
    const w = (remain / total) * 106;
    drawRoundRect(ctx, x + 2, y + 2, w, 10, 3);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "9px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 6, y + 7);
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

  // 主循环
  useEffect(() => {
    stepRef.current = stepPhysics;
    drawRef.current = draw;
    gameOverRef.current = doGameOver;
    loseLifeRef.current = loseLife;
    let raf: number;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(32, time - last) / 16.67;
      last = time;
      if (runningRef.current && !overRef.current && !wonRef.current) {
        stepRef.current(dt);
      }
      drawRef.current();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stepPhysics, draw, doGameOver, loseLife]);

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
    if (wonRef.current) {
      // 通关后重开
      wonRef.current = false;
      setWon(false);
      levelRef.current = 1;
      setLevel(1);
    }
    if (bricksRef.current.length === 0 || levelRef.current === 1) {
      levelRef.current = 1;
      setLevel(1);
      bricksRef.current = buildBricks(1);
    }
    scoreRef.current = 0;
    livesRef.current = 3;
    submittedRef.current = false;
    effectsRef.current = { expandUntil: 0, slowUntil: 0 };
    powerUpsRef.current = [];
    setScore(0);
    setLives(3);
    resetBallToPaddle();
    runningRef.current = true;
    setRunning(true);
  }, [resetBallToPaddle]);

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
    wonRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    levelRef.current = 1;
    scoreRef.current = 0;
    livesRef.current = 3;
    effectsRef.current = { expandUntil: 0, slowUntil: 0 };
    powerUpsRef.current = [];
    bricksRef.current = [];
    ballsRef.current = [];
    setLevel(1);
    setScore(0);
    setLives(3);
    setOver(false);
    setWon(false);
    setResult(null);
    setRunning(false);
  }, []);

  // 鼠标 / 触摸控制挡板
  const updatePaddle = useCallback((clientX: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scale = rect.width > 0 ? CANVAS_W / rect.width : 1;
    const x = (clientX - rect.left) * scale;
    const pw = paddleWidth();
    paddleXRef.current = clamp(x - pw / 2, 0, CANVAS_W - pw);
  }, [paddleWidth]);

  // 键盘：空格发射 / 暂停
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " ") {
        e.preventDefault();
        if (over || won) return;
        if (!running) {
          resume();
          return;
        }
        const launched = launchBall();
        if (!launched) {
          // 没有stuck的球，空格暂停
        }
      } else if (k === "p") {
        if (over || won) return;
        if (running) pause();
        else resume();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, over, won, resume, pause, launchBall]);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "生命", value: lives },
    { label: "关卡", value: `${level}/5` },
    { label: "最高", value: best },
  ];

  // 区分"全新开始"与"暂停继续"
  const fresh = !running && !over && !won && score === 0 && lives === 3 && level === 1;
  const paused = !running && !over && !won && !fresh;

  return (
    <GameShell
      gameId={GAME_ID}
      title="弹球消除"
      description="经典打砖块游戏！控制挡板让弹球弹射消除所有砖块，5个关卡、3种砖块、3种道具，物理弹射的纯粹爽感。"
      instructions={`移动鼠标或手指控制底部挡板，点击或空格发射弹球。
弹球会从墙壁、挡板、砖块反弹；挡板碰撞点决定反弹角度（中间直上，边缘斜射）。
砖块类型：紫色普通砖(1击)、橙色坚硬砖(2击)、灰色钢铁砖(3击)。
道具：绿色E=加长挡板、青色M=多球、橙色S=慢速。
球掉到底部失去一条命，共 3 条命。消除全部砖块进入下一关，共 5 关。`}
      icon={BrickWall}
      iconEmoji="🧱"
      iconGradient="from-orange-400 to-red-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 生命指示 */}
        <div className="flex items-center justify-between w-full max-w-[600px] mb-2 px-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < lives
                    ? "text-rose-500 fill-rose-500"
                    : "text-slate-700"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Zap className="w-3.5 h-3.5 text-[#a78bfa]" />
            <span>第 {level} 关 / 共 {LEVELS.length} 关</span>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={(e) => updatePaddle(e.clientX)}
            onClick={() => {
              if (running) {
                launchBall();
              }
            }}
            onTouchStart={(e) => {
              if (e.touches[0]) updatePaddle(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                updatePaddle(e.touches[0].clientX);
                e.preventDefault();
              }
            }}
            onTouchEnd={() => {
              if (running) {
                launchBall();
              }
            }}
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-[#8b5cf6]/10 cursor-pointer"
          />

          {/* 待开始 / 暂停覆盖层 */}
          {(fresh || paused) && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/75 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={fresh ? start : resume}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
              >
                <Play className="w-5 h-5" /> {fresh ? "开始游戏" : "继续游戏"}
              </button>
              {fresh && (
                <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                  移动鼠标控制挡板 · 点击发射弹球
                  <br />
                  消除所有砖块进入下一关
                </p>
              )}
            </div>
          )}

          {/* 暂停时发射提示 */}
          {running && ballsRef.current.some((b) => b.stuck) && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="px-4 py-2 rounded-lg bg-[#09090b]/80 backdrop-blur-sm border border-[#27272a] text-sm text-slate-300 animate-pulse-soft">
                点击 / 空格 发射弹球
              </div>
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
                到达第 {level} 关
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

          {/* 通关覆盖层 */}
          {won && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🏆</div>
              <h3 className="text-2xl font-bold mb-2">通关达成！</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-amber-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
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

        {/* 控制按钮 */}
        <div className="mt-5 flex items-center gap-3">
          {running ? (
            <button
              onClick={pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
            >
              <Pause className="w-4 h-4" /> 暂停
            </button>
          ) : (
            !over &&
            !won && (
              <button
                onClick={fresh ? start : resume}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
              >
                <Play className="w-4 h-4" /> {fresh ? "开始" : "继续"}
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

        {/* 道具说明 */}
        <div className="mt-5 w-full max-w-[600px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 mb-2 text-center">道具说明</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-4 rounded bg-green-500 text-[#09090b] font-bold text-center leading-4 text-[10px]">
                E
              </span>
              加长挡板
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-4 rounded bg-cyan-500 text-[#09090b] font-bold text-center leading-4 text-[10px]">
                M
              </span>
              多球
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-4 rounded bg-amber-500 text-[#09090b] font-bold text-center leading-4 text-[10px]">
                S
              </span>
              慢速
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-4 rounded bg-[#8b5cf6]" />
              普通 1击
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-4 rounded bg-[#f59e0b]" />
              坚硬 2击
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-4 rounded bg-[#64748b]" />
              钢铁 3击
            </span>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
