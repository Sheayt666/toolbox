"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Worm, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "snake-arena";
const CANVAS_W = 600;
const CANVAS_H = 600;
const BEST_SCORE_KEY = "gm_snake_arena_best";

const MAP_W = 2400;
const MAP_H = 2400;
const FOOD_COUNT = 220;
const AI_COUNT = 7;
const SEG_SPACING = 7;
const BASE_SPEED = 2.6;
const BOOST_SPEED = 4.6;
const HEAD_RADIUS = 7;
const FOOD_RADIUS = 4;

interface Vec {
  x: number;
  y: number;
}

interface Segment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
  hue: number;
  value: number;
}

interface Snake {
  id: number;
  segments: Segment[];
  angle: number;
  targetAngle: number;
  speed: number;
  alive: boolean;
  isPlayer: boolean;
  name: string;
  color: string;
  boost: boolean;
  boostFuel: number;
  aiTimer: number;
  aiMode: "wander" | "food" | "hunt" | "flee";
  killCount: number;
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

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function angleLerp(a: number, b: number, t: number) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

const AI_NAMES = [
  "眼镜蛇",
  "蟒蛇",
  "青蛇",
  "黑蛇",
  "金蛇",
  "银蛇",
  "毒蛇",
  "飞蛇",
];

const AI_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#06b6d4",
  "#3b82f6",
  "#ec4899",
  "#f43f5e",
  "#14b8a6",
];

export default function SnakeArenaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakesRef = useRef<Snake[]>([]);
  const foodsRef = useRef<Food[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const playerIdRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const lastScoreSyncedRef = useRef(0);
  const bestRef = useRef(0);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);
  const mouseRef = useRef<Vec>({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
  const boostingRef = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastAliveSyncedRef = useRef(-1);

  const stepRef = useRef<(dt: number) => void>(() => {});
  const drawRef = useRef<() => void>(() => {});
  const gameOverRef = useRef<() => void>(() => {});

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [alive, setAlive] = useState(0);

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number) => {
      const particles = particlesRef.current;
      // 粒子上限，防止 GC 压力
      if (particles.length > 300) {
        particles.splice(0, particles.length - 300);
      }
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 30 + Math.random() * 20,
          maxLife: 50,
          color,
          size: 2 + Math.random() * 3,
        });
      }
    },
    [],
  );

  const spawnFoodAt = useCallback((x: number, y: number, value: number) => {
    foodsRef.current.push({
      x: clamp(x, 10, MAP_W - 10),
      y: clamp(y, 10, MAP_H - 10),
      hue: Math.floor(Math.random() * 360),
      value,
    });
  }, []);

  const killSnake = useCallback(
    (snake: Snake) => {
      if (!snake.alive) return;
      snake.alive = false;
      const segs = snake.segments;
      // Drop food along body
      for (let i = 0; i < segs.length; i += 3) {
        spawnFoodAt(segs[i].x, segs[i].y, 2);
      }
      // Particles
      const head = segs[0];
      spawnParticles(head.x, head.y, snake.color, 30);
    },
    [spawnFoodAt, spawnParticles],
  );

  const initGame = useCallback(() => {
    // Player snake at center
    const player: Snake = {
      id: 0,
      segments: [],
      angle: 0,
      targetAngle: 0,
      speed: BASE_SPEED,
      alive: true,
      isPlayer: true,
      name: "你",
      color: "#a3e635",
      boost: false,
      boostFuel: 100,
      aiTimer: 0,
      aiMode: "wander",
      killCount: 0,
    };
    const cx = MAP_W / 2;
    const cy = MAP_H / 2;
    for (let i = 0; i < 20; i++) {
      player.segments.push({ x: cx - i * SEG_SPACING, y: cy });
    }
    playerIdRef.current = 0;

    const snakes: Snake[] = [player];

    // AI snakes
    for (let i = 0; i < AI_COUNT; i++) {
      const ai: Snake = {
        id: i + 1,
        segments: [],
        angle: Math.random() * Math.PI * 2,
        targetAngle: Math.random() * Math.PI * 2,
        speed: BASE_SPEED,
        alive: true,
        isPlayer: false,
        name: AI_NAMES[i % AI_NAMES.length],
        color: AI_COLORS[i % AI_COLORS.length],
        boost: false,
        boostFuel: 100,
        aiTimer: 0,
        aiMode: "wander",
        killCount: 0,
      };
      const ax = 100 + Math.random() * (MAP_W - 200);
      const ay = 100 + Math.random() * (MAP_H - 200);
      const startLen = 15 + Math.floor(Math.random() * 15);
      for (let j = 0; j < startLen; j++) {
        ai.segments.push({
          x: ax - Math.cos(ai.angle) * j * SEG_SPACING,
          y: ay - Math.sin(ai.angle) * j * SEG_SPACING,
        });
      }
      snakes.push(ai);
    }
    snakesRef.current = snakes;

    // Food
    const foods: Food[] = [];
    for (let i = 0; i < FOOD_COUNT; i++) {
      foods.push({
        x: 20 + Math.random() * (MAP_W - 40),
        y: 20 + Math.random() * (MAP_H - 40),
        hue: Math.floor(Math.random() * 360),
        value: 1,
      });
    }
    foodsRef.current = foods;
    particlesRef.current = [];
    scoreRef.current = 20;
    lastScoreSyncedRef.current = 20;
  }, []);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    setRunning(false);
    runningRef.current = false;
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `蛇长 ${s}`);
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

  const stepAI = useCallback(
    (snake: Snake, dt: number) => {
      const head = snake.segments[0];
      snake.aiTimer -= dt;
      if (snake.aiTimer <= 0) {
        snake.aiTimer = 30 + Math.random() * 60;
        // Decide mode
        const r = Math.random();
        if (r < 0.15) snake.aiMode = "hunt";
        else if (r < 0.3) snake.aiMode = "flee";
        else snake.aiMode = "food";
      }

      // Find nearest food
      let nearestFood: Food | null = null;
      let nearestFoodD = Infinity;
      for (const f of foodsRef.current) {
        const d = dist2(head.x, head.y, f.x, f.y);
        if (d < nearestFoodD) {
          nearestFoodD = d;
          nearestFood = f;
        }
      }

      let tx = head.x;
      let ty = head.y;

      if (snake.aiMode === "food" && nearestFood) {
        tx = nearestFood.x;
        ty = nearestFood.y;
      } else if (snake.aiMode === "hunt") {
        // Target another snake's head
        let target: Snake | null = null;
        let bestD = 400 * 400;
        for (const other of snakesRef.current) {
          if (other.id === snake.id || !other.alive) continue;
          const d = dist2(head.x, head.y, other.segments[0].x, other.segments[0].y);
          if (d < bestD) {
            bestD = d;
            target = other;
          }
        }
        if (target) {
          // Predict where target is going, try to cut off
          const tHead = target.segments[0];
          tx = tHead.x + Math.cos(target.angle) * 60;
          ty = tHead.y + Math.sin(target.angle) * 60;
        } else if (nearestFood) {
          tx = nearestFood.x;
          ty = nearestFood.y;
        }
      } else if (snake.aiMode === "flee") {
        // Move away from nearest snake
        let nearestSnake: Snake | null = null;
        let nearestD = 200 * 200;
        for (const other of snakesRef.current) {
          if (other.id === snake.id || !other.alive) continue;
          const d = dist2(head.x, head.y, other.segments[0].x, other.segments[0].y);
          if (d < nearestD) {
            nearestD = d;
            nearestSnake = other;
          }
        }
        if (nearestSnake) {
          const oh = nearestSnake.segments[0];
          tx = head.x - (oh.x - head.x);
          ty = head.y - (oh.y - head.y);
        }
      }

      // Avoid walls
      const wallMargin = 120;
      if (head.x < wallMargin) tx = head.x + 200;
      if (head.x > MAP_W - wallMargin) tx = head.x - 200;
      if (head.y < wallMargin) ty = head.y + 200;
      if (head.y > MAP_H - wallMargin) ty = head.y - 200;

      snake.targetAngle = Math.atan2(ty - head.y, tx - head.x);
      snake.angle = angleLerp(snake.angle, snake.targetAngle, 0.08 * dt);

      // Occasionally boost
      if (snake.boostFuel > 50 && Math.random() < 0.01) {
        snake.boost = true;
      } else if (snake.boostFuel < 20) {
        snake.boost = false;
      }
      snake.speed = snake.boost ? BOOST_SPEED : BASE_SPEED;
    },
    [],
  );

  const stepPhysics = useCallback(
    (dt: number) => {
      const snakes = snakesRef.current;
      const foods = foodsRef.current;
      const particles = particlesRef.current;

      // Update player target angle from mouse
      const player = snakes[0];
      if (player.alive) {
        const head = player.segments[0];
        // mouseRef is relative to canvas center
        const dx = mouseRef.current.x - CANVAS_W / 2;
        const dy = mouseRef.current.y - CANVAS_H / 2;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          player.targetAngle = Math.atan2(dy, dx);
        }
        player.angle = angleLerp(player.angle, player.targetAngle, 0.12 * dt);
        player.boost = boostingRef.current && player.boostFuel > 0;
        player.speed = player.boost ? BOOST_SPEED : BASE_SPEED;
      }

      // Move snakes
      for (const snake of snakes) {
        if (!snake.alive) continue;
        if (!snake.isPlayer) {
          stepAI(snake, dt);
        }

        const spd = snake.speed * dt;
        const head = snake.segments[0];
        const nx = head.x + Math.cos(snake.angle) * spd;
        const ny = head.y + Math.sin(snake.angle) * spd;

        // Wall check — die if hit wall
        if (nx < 5 || nx > MAP_W - 5 || ny < 5 || ny > MAP_H - 5) {
          killSnake(snake);
          continue;
        }

        // Boost fuel
        if (snake.boost) {
          snake.boostFuel = Math.max(0, snake.boostFuel - 0.5 * dt);
          // Drop food when boosting
          if (snake.segments.length > 10 && Math.random() < 0.15) {
            const tail = snake.segments[snake.segments.length - 1];
            spawnFoodAt(tail.x, tail.y, 1);
            snake.segments.pop();
          }
        } else {
          snake.boostFuel = Math.min(100, snake.boostFuel + 0.15 * dt);
        }

        // Move segments: each follows the previous
        const newHead = { x: nx, y: ny };
        for (let i = snake.segments.length - 1; i > 0; i--) {
          const prev = snake.segments[i - 1];
          const cur = snake.segments[i];
          const ddx = prev.x - cur.x;
          const ddy = prev.y - cur.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d > SEG_SPACING) {
            const ratio = (d - SEG_SPACING) / d;
            cur.x += ddx * ratio;
            cur.y += ddy * ratio;
          }
        }
        snake.segments[0] = newHead;

        // Eat food
        for (let fi = foods.length - 1; fi >= 0; fi--) {
          const f = foods[fi];
          if (dist2(nx, ny, f.x, f.y) < (HEAD_RADIUS + FOOD_RADIUS) ** 2) {
            // Grow snake
            const tail = snake.segments[snake.segments.length - 1];
            for (let g = 0; g < f.value; g++) {
              snake.segments.push({ x: tail.x, y: tail.y });
            }
            if (snake.isPlayer) {
              scoreRef.current += f.value;
            }
            spawnParticles(f.x, f.y, `hsl(${f.hue}, 80%, 60%)`, 4);
            foods.splice(fi, 1);
            // Respawn food elsewhere
            foods.push({
              x: 20 + Math.random() * (MAP_W - 40),
              y: 20 + Math.random() * (MAP_H - 40),
              hue: Math.floor(Math.random() * 360),
              value: 1,
            });
          }
        }
      }

      // Collision: head vs body of other snakes
      for (const snake of snakes) {
        if (!snake.alive) continue;
        const head = snake.segments[0];
        for (const other of snakes) {
          if (other.id === snake.id || !other.alive) continue;
          // Skip other's head (handled separately for head-on)
          for (let i = 2; i < other.segments.length; i++) {
            const seg = other.segments[i];
            if (dist2(head.x, head.y, seg.x, seg.y) < (HEAD_RADIUS + 3) ** 2) {
              killSnake(snake);
              if (other.isPlayer || snake.isPlayer) {
                // If player killed someone
              }
              if (other.isPlayer && !snake.isPlayer) {
                other.killCount++;
                scoreRef.current += 10;
              }
              break;
            }
          }
          if (!snake.alive) break;
        }
      }

      // Head-on collision: both die if very close
      for (let i = 0; i < snakes.length; i++) {
        const a = snakes[i];
        if (!a.alive) continue;
        for (let j = i + 1; j < snakes.length; j++) {
          const b = snakes[j];
          if (!b.alive) continue;
          const ha = a.segments[0];
          const hb = b.segments[0];
          if (dist2(ha.x, ha.y, hb.x, hb.y) < (HEAD_RADIUS * 2) ** 2) {
            killSnake(a);
            killSnake(b);
          }
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Sync score
      if (scoreRef.current !== lastScoreSyncedRef.current) {
        lastScoreSyncedRef.current = scoreRef.current;
        setScore(scoreRef.current);
      }

      // Alive count
      let aliveCount = 0;
      for (const s of snakes) if (s.alive) aliveCount++;
      // 仅在变化时更新，避免每帧触发 React 重渲染
      if (aliveCount !== lastAliveSyncedRef.current) {
        lastAliveSyncedRef.current = aliveCount;
        setAlive(aliveCount);
      }

      // Check player death
      if (!player.alive) {
        gameOverRef.current();
      }
    },
    [stepAI, killSnake, spawnFoodAt, spawnParticles],
  );

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

    const snakes = snakesRef.current;
    const foods = foodsRef.current;
    const particles = particlesRef.current;
    const player = snakes[0];

    // Camera follows player head
    let camX = MAP_W / 2;
    let camY = MAP_H / 2;
    if (player && player.alive) {
      camX = player.segments[0].x;
      camY = player.segments[0].y;
    } else if (snakes.length > 1) {
      // Follow first alive AI
      const aliveAI = snakes.find((s) => s.alive);
      if (aliveAI) {
        camX = aliveAI.segments[0].x;
        camY = aliveAI.segments[0].y;
      }
    }
    camX = clamp(camX, CANVAS_W / 2, MAP_W - CANVAS_W / 2);
    camY = clamp(camY, CANVAS_H / 2, MAP_H - CANVAS_H / 2);

    // Background
    ctx.fillStyle = "#0a0f0a";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Grid
    const gridSize = 40;
    const offX = -(camX - CANVAS_W / 2) % gridSize;
    const offY = -(camY - CANVAS_H / 2) % gridSize;
    ctx.strokeStyle = "rgba(132,204,22,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = offX; x < cv.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cv.height);
    }
    for (let y = offY; y < cv.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(cv.width, y);
    }
    ctx.stroke();

    // Map border
    const bx = 0 - (camX - CANVAS_W / 2);
    const by = 0 - (camY - CANVAS_H / 2);
    ctx.strokeStyle = "rgba(239,68,68,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, MAP_W, MAP_H);

    // Food
    for (const f of foods) {
      const sx = f.x - (camX - CANVAS_W / 2);
      const sy = f.y - (camY - CANVAS_H / 2);
      if (sx < -10 || sx > cv.width + 10 || sy < -10 || sy > cv.height + 10)
        continue;
      const pulse = 0.7 + 0.3 * Math.sin(t * 0.05 + f.hue);
      ctx.fillStyle = `hsla(${f.hue}, 80%, 60%, ${pulse})`;
      ctx.beginPath();
      ctx.arc(sx, sy, FOOD_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `hsla(${f.hue}, 90%, 75%, 0.8)`;
      ctx.beginPath();
      ctx.arc(sx - 1, sy - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Snakes
    for (const snake of snakes) {
      if (!snake.alive) continue;
      const segs = snake.segments;
      // Draw body (tail to head)
      for (let i = segs.length - 1; i >= 0; i--) {
        const seg = segs[i];
        const sx = seg.x - (camX - CANVAS_W / 2);
        const sy = seg.y - (camY - CANVAS_H / 2);
        if (sx < -20 || sx > cv.width + 20 || sy < -20 || sy > cv.height + 20)
          continue;

        const isHead = i === 0;
        const radius = isHead ? HEAD_RADIUS : HEAD_RADIUS - 0.5;

        // Glow
        ctx.shadowColor = snake.color;
        ctx.shadowBlur = isHead ? 15 : 8;

        // Body gradient
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
        grad.addColorStop(0, snake.color);
        grad.addColorStop(1, `${snake.color}88`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Head details
        if (isHead) {
          // Eyes
          const eyeOff = 3;
          const ang = snake.angle;
          const ex1 = sx + Math.cos(ang - 0.6) * eyeOff;
          const ey1 = sy + Math.sin(ang - 0.6) * eyeOff;
          const ex2 = sx + Math.cos(ang + 0.6) * eyeOff;
          const ey2 = sy + Math.sin(ang + 0.6) * eyeOff;
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(ex1, ey1, 2, 0, Math.PI * 2);
          ctx.arc(ex2, ey2, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#000";
          ctx.beginPath();
          ctx.arc(ex1 + Math.cos(ang) * 0.8, ey1 + Math.sin(ang) * 0.8, 1, 0, Math.PI * 2);
          ctx.arc(ex2 + Math.cos(ang) * 0.8, ey2 + Math.sin(ang) * 0.8, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Name tag for player and nearby snakes
      if (snake.isPlayer || dist2(camX, camY, snake.segments[0].x, snake.segments[0].y) < 300 * 300) {
        const head = segs[0];
        const sx = head.x - (camX - CANVAS_W / 2);
        const sy = head.y - (camY - CANVAS_H / 2);
        ctx.fillStyle = snake.isPlayer ? "#a3e635" : "rgba(255,255,255,0.5)";
        ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(snake.name, sx, sy - 14);
      }
    }

    // Particles
    for (const p of particles) {
      const sx = p.x - (camX - CANVAS_W / 2);
      const sy = p.y - (camY - CANVAS_H / 2);
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Minimap
    const mmSize = 100;
    const mmX = cv.width - mmSize - 10;
    const mmY = 10;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(mmX, mmY, mmSize, mmSize);
    ctx.strokeStyle = "rgba(132,204,22,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mmX, mmY, mmSize, mmSize);
    for (const snake of snakes) {
      if (!snake.alive) continue;
      const head = snake.segments[0];
      const mx = mmX + (head.x / MAP_W) * mmSize;
      const my = mmY + (head.y / MAP_H) * mmSize;
      ctx.fillStyle = snake.color;
      ctx.beginPath();
      ctx.arc(mx, my, snake.isPlayer ? 3 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Camera rect
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      mmX + ((camX - CANVAS_W / 2) / MAP_W) * mmSize,
      mmY + ((camY - CANVAS_H / 2) / MAP_H) * mmSize,
      (CANVAS_W / MAP_W) * mmSize,
      (CANVAS_H / MAP_H) * mmSize,
    );

    // Boost fuel bar (player)
    if (player && player.alive) {
      const bw = 120;
      const bh = 6;
      const bx2 = 10;
      const by2 = cv.height - 20;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(bx2, by2, bw, bh);
      const fuelPct = player.boostFuel / 100;
      const fuelColor = fuelPct > 0.3 ? "#a3e635" : "#ef4444";
      ctx.fillStyle = fuelColor;
      ctx.fillRect(bx2, by2, bw * fuelPct, bh);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "10px ui-sans-serif, system-ui";
      ctx.textAlign = "left";
      ctx.fillText("加速燃料 (按住鼠标)", bx2, by2 - 4);
    }
  }, []);

  // Main loop
  useEffect(() => {
    stepRef.current = stepPhysics;
    drawRef.current = draw;
    gameOverRef.current = doGameOver;
    let raf: number;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((time - last) / 16.67, 2);
      last = time;
      if (runningRef.current && !overRef.current && !pausedRef.current) {
        stepRef.current(dt);
      }
      drawRef.current();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stepPhysics, draw, doGameOver]);

  // Load best score
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
    initGame();
    runningRef.current = true;
    pausedRef.current = false;
    setRunning(true);
    setPaused(false);
    setScore(20);
  }, [initGame]);

  const pause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  // P 键暂停/继续
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        pause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pause]);

  const restart = useCallback(() => {
    submittedRef.current = false;
    overRef.current = false;
    setOver(false);
    setResult(null);
    setRunning(false);
    setPaused(false);
    runningRef.current = false;
    pausedRef.current = false;
    initGame();
    setScore(20);
  }, [initGame]);

  // Mouse / touch controls
  const updateMouse = useCallback((clientX: number, clientY: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scaleX = rect.width > 0 ? CANVAS_W / rect.width : 1;
    const scaleY = rect.height > 0 ? CANVAS_H / rect.height : 1;
    mouseRef.current = {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const stats: GameStat[] = [
    { label: "蛇长", value: score },
    { label: "最高记录", value: best },
    { label: "存活", value: alive },
    { label: "状态", value: over ? "已结束" : paused ? "暂停" : running ? "进行中" : "待开始" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="蛇之竞技场"
      description="Slither.io 风格的多人贪吃蛇竞技！控制你的蛇吞噬食物不断变长，小心别撞到其他蛇的身体，用加速截断对手的路线将其击杀。"
      instructions={`移动鼠标或手指控制蛇的行进方向。
按住鼠标左键或屏幕可加速移动（消耗燃料）。
吞噬地图上的彩色食物点可以增加蛇的长度。
如果蛇头撞到其他蛇的身体，你的蛇会死亡。
用加速截断其他蛇的路线，让它们的头撞上你的身体即可击杀对手。
撞到地图边缘也会死亡。
分数 = 蛇的长度，击杀对手额外加分。`}
      icon={Worm}
      iconEmoji="🐉"
      iconGradient="from-lime-400 to-green-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={(e) => updateMouse(e.clientX, e.clientY)}
            onMouseDown={() => {
              boostingRef.current = true;
            }}
            onMouseUp={() => {
              boostingRef.current = false;
            }}
            onMouseLeave={() => {
              boostingRef.current = false;
            }}
            onTouchStart={(e) => {
              if (e.touches[0]) {
                updateMouse(e.touches[0].clientX, e.touches[0].clientY);
                boostingRef.current = true;
              }
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                updateMouse(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
              }
            }}
            onTouchEnd={() => {
              boostingRef.current = false;
            }}
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-lime-500/10 cursor-crosshair"
          />

          {/* Start overlay */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-lime-500 hover:bg-lime-600 rounded-xl transition-colors shadow-lg shadow-lime-500/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                移动鼠标控制方向 · 按住加速
                <br />
                吞噬食物变长，别撞到其他蛇
              </p>
            </div>
          )}

          {/* Pause overlay */}
          {paused && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <h3 className="text-xl font-bold mb-4">已暂停</h3>
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-lime-500 hover:bg-lime-600 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            </div>
          )}

          {/* Game over overlay */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">💀</div>
              <h3 className="text-2xl font-bold mb-2">蛇已陨落</h3>
              <p className="text-sm text-slate-400 mb-1">最终蛇长</p>
              <p className="text-4xl font-bold text-lime-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-lime-400 font-bold">{result.rank}</span>/{result.total}，超越了{" "}
                  <span className="text-lime-400 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-lime-500 hover:bg-lime-600 rounded-xl transition-colors shadow-lg shadow-lime-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center gap-3">
          {running && !over ? (
            <button
              onClick={pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? "继续" : "暂停"}
            </button>
          ) : (
            !over && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-lime-500 hover:bg-lime-600 rounded-xl transition-colors shadow-lg shadow-lime-500/30"
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

        {/* Tips */}
        <div className="mt-5 w-full max-w-[600px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 text-center">
            提示：按住鼠标/屏幕加速可截断对手路线 · 右上角小地图显示全局态势
          </p>
        </div>
      </div>
    </GameShell>
  );
}
