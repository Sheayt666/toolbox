"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Circle, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "black-hole";
const CANVAS_W = 600;
const CANVAS_H = 600;
const BEST_SCORE_KEY = "gm_black_hole_best";

const MAP_W = 2000;
const MAP_H = 2000;
const GAME_TIME = 90; // seconds
const AI_HOLE_COUNT = 4;

interface Vec {
  x: number;
  y: number;
}

interface Obj {
  id: number;
  x: number;
  y: number;
  radius: number;
  mass: number;
  type: "pebble" | "can" | "box" | "plant" | "car" | "building" | "tree";
  color: string;
  emoji: string;
  eaten: boolean;
  vx: number;
  vy: number;
  wobble: number;
}

interface Hole {
  x: number;
  y: number;
  radius: number;
  mass: number;
  isPlayer: boolean;
  targetX: number;
  targetY: number;
  aiTimer: number;
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

function dist2(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

const OBJ_DEFS: Record<
  Obj["type"],
  { radius: number; mass: number; color: string; emoji: string; name: string }
> = {
  pebble: { radius: 6, mass: 1, color: "#78716c", emoji: "🪨", name: "石子" },
  can: { radius: 10, mass: 3, color: "#22d3ee", emoji: "🥫", name: "罐头" },
  box: { radius: 14, mass: 6, color: "#d97706", emoji: "📦", name: "箱子" },
  plant: { radius: 12, mass: 4, color: "#22c55e", emoji: "🪴", name: "盆栽" },
  tree: { radius: 22, mass: 15, color: "#15803d", emoji: "🌳", name: "树木" },
  car: { radius: 28, mass: 35, color: "#ef4444", emoji: "🚗", name: "汽车" },
  building: { radius: 50, mass: 120, color: "#64748b", emoji: "🏢", name: "建筑" },
};

const OBJ_TYPES: Obj["type"][] = [
  "pebble",
  "pebble",
  "pebble",
  "can",
  "can",
  "box",
  "plant",
  "tree",
  "car",
  "building",
];

let nextObjId = 1;

export default function BlackHolePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holesRef = useRef<Hole[]>([]);
  const objsRef = useRef<Obj[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const lastScoreSyncedRef = useRef(0);
  const bestRef = useRef(0);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);
  const mouseRef = useRef<Vec>({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
  const timeLeftRef = useRef(GAME_TIME);
  const timeLeftSyncedRef = useRef(GAME_TIME);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

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
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [holeSize, setHoleSize] = useState(15);

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
          life: 20 + Math.random() * 15,
          maxLife: 35,
          color,
          size: 1.5 + Math.random() * 2.5,
        });
      }
    },
    [],
  );

  const spawnObjects = useCallback(() => {
    const objs: Obj[] = [];
    // Scatter objects across map
    for (let i = 0; i < 350; i++) {
      const type = OBJ_TYPES[Math.floor(Math.random() * OBJ_TYPES.length)];
      const def = OBJ_DEFS[type];
      objs.push({
        id: nextObjId++,
        x: 30 + Math.random() * (MAP_W - 60),
        y: 30 + Math.random() * (MAP_H - 60),
        radius: def.radius,
        mass: def.mass,
        type,
        color: def.color,
        emoji: def.emoji,
        eaten: false,
        vx: 0,
        vy: 0,
        wobble: Math.random() * Math.PI * 2,
      });
    }
    objsRef.current = objs;
  }, []);

  const initGame = useCallback(() => {
    const player: Hole = {
      x: MAP_W / 2,
      y: MAP_H / 2,
      radius: 15,
      mass: 10,
      isPlayer: true,
      targetX: MAP_W / 2,
      targetY: MAP_H / 2,
      aiTimer: 0,
    };

    const holes: Hole[] = [player];
    for (let i = 0; i < AI_HOLE_COUNT; i++) {
      holes.push({
        x: 200 + Math.random() * (MAP_W - 400),
        y: 200 + Math.random() * (MAP_H - 400),
        radius: 12 + Math.random() * 8,
        mass: 8 + Math.random() * 6,
        isPlayer: false,
        targetX: 0,
        targetY: 0,
        aiTimer: 0,
      });
    }
    holesRef.current = holes;
    spawnObjects();
    particlesRef.current = [];
    scoreRef.current = 0;
    lastScoreSyncedRef.current = 0;
    timeLeftRef.current = GAME_TIME;
    timeLeftSyncedRef.current = GAME_TIME;
    setHoleSize(15);
  }, [spawnObjects]);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    setRunning(false);
    runningRef.current = false;
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `吞噬 ${s} 质量`);
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

  const stepAI = useCallback((hole: Hole, dt: number) => {
    hole.aiTimer -= dt;
    if (hole.aiTimer <= 0) {
      hole.aiTimer = 40 + Math.random() * 60;
      // Find nearest swallowable object
      let best: Obj | null = null;
      let bestD = Infinity;
      for (const obj of objsRef.current) {
        if (obj.eaten) continue;
        if (obj.radius >= hole.radius) continue;
        const d = dist2(hole.x, hole.y, obj.x, obj.y);
        if (d < bestD) {
          bestD = d;
          best = obj;
        }
      }
      if (best) {
        hole.targetX = best.x;
        hole.targetY = best.y;
      } else {
        hole.targetX = 100 + Math.random() * (MAP_W - 200);
        hole.targetY = 100 + Math.random() * (MAP_H - 200);
      }
    }
    // Move toward target
    const dx = hole.targetX - hole.x;
    const dy = hole.targetY - hole.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const speed = 2.0 + Math.min(1, hole.radius / 50);
    if (d > 2) {
      hole.x += (dx / d) * speed * dt;
      hole.y += (dy / d) * speed * dt;
    }
    hole.x = clamp(hole.x, hole.radius, MAP_W - hole.radius);
    hole.y = clamp(hole.y, hole.radius, MAP_H - hole.radius);
  }, []);

  const stepPhysics = useCallback(
    (dt: number) => {
      const holes = holesRef.current;
      const objs = objsRef.current;
      const particles = particlesRef.current;

      // Player movement: smoothly follow mouse direction
      const player = holes[0];
      const dx = mouseRef.current.x - CANVAS_W / 2;
      const dy = mouseRef.current.y - CANVAS_H / 2;
      const dLen = Math.sqrt(dx * dx + dy * dy);
      if (dLen > 5) {
        const speed = 3.0 + Math.min(1.5, player.radius / 40);
        const factor = Math.min(1, dLen / 100);
        player.x += (dx / dLen) * speed * factor * dt;
        player.y += (dy / dLen) * speed * factor * dt;
      }
      player.x = clamp(player.x, player.radius, MAP_W - player.radius);
      player.y = clamp(player.y, player.radius, MAP_H - player.radius);

      // AI holes
      for (const hole of holes) {
        if (hole.isPlayer) continue;
        stepAI(hole, dt);
      }

      // Swallow objects
      for (const hole of holes) {
        for (const obj of objs) {
          if (obj.eaten) continue;
          if (obj.radius >= hole.radius) continue;
          const d2 = dist2(hole.x, hole.y, obj.x, obj.y);
          const swallowRange = (hole.radius + obj.radius) ** 2;
          if (d2 < swallowRange) {
            // Pull object toward hole
            const d = Math.sqrt(d2);
            const pullStrength = 0.3 + (1 - d / (hole.radius + obj.radius)) * 0.8;
            obj.vx += ((hole.x - obj.x) / d) * pullStrength * dt * 3;
            obj.vy += ((hole.y - obj.y) / d) * pullStrength * dt * 3;
            obj.x += obj.vx * dt;
            obj.y += obj.vy * dt;
            // If close enough, eat
            if (d < hole.radius * 0.6) {
              obj.eaten = true;
              hole.mass += obj.mass;
              hole.radius = Math.sqrt(hole.mass) * 1.8 + 5;
              if (hole.isPlayer) {
                scoreRef.current += obj.mass;
                setHoleSize(Math.round(hole.radius));
              }
              spawnParticles(obj.x, obj.y, obj.color, 8);
            }
          }
        }
      }

      // Remove eaten objects — 原地删除避免每帧 filter 创建新数组（GC 压力）
      for (let i = objs.length - 1; i >= 0; i--) {
        if (objs[i].eaten) objs.splice(i, 1);
      }

      // Respawn some objects to keep the map populated
      if (objsRef.current.length < 250) {
        const type = OBJ_TYPES[Math.floor(Math.random() * OBJ_TYPES.length)];
        const def = OBJ_DEFS[type];
        objsRef.current.push({
          id: nextObjId++,
          x: 30 + Math.random() * (MAP_W - 60),
          y: 30 + Math.random() * (MAP_H - 60),
          radius: def.radius,
          mass: def.mass,
          type,
          color: def.color,
          emoji: def.emoji,
          eaten: false,
          vx: 0,
          vy: 0,
          wobble: Math.random() * Math.PI * 2,
        });
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Timer
      timeLeftRef.current -= dt / 60;
      if (timeLeftRef.current <= 0) {
        timeLeftRef.current = 0;
        gameOverRef.current();
      }

      // Sync score
      if (scoreRef.current !== lastScoreSyncedRef.current) {
        lastScoreSyncedRef.current = scoreRef.current;
        setScore(scoreRef.current);
      }
      // Sync timer (update every frame, but throttle to whole seconds)
      const tInt = Math.ceil(timeLeftRef.current);
      if (tInt !== timeLeftSyncedRef.current) {
        timeLeftSyncedRef.current = tInt;
        setTimeLeft(tInt);
      }
    },
    [stepAI, spawnParticles],
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

    const holes = holesRef.current;
    const objs = objsRef.current;
    const particles = particlesRef.current;
    const player = holes[0];
    if (!player) return;

    // Camera follows player
    let camX = player.x;
    let camY = player.y;
    camX = clamp(camX, CANVAS_W / 2, MAP_W - CANVAS_W / 2);
    camY = clamp(camY, CANVAS_H / 2, MAP_H - CANVAS_H / 2);

    const toScreenX = (wx: number) => wx - (camX - CANVAS_W / 2);
    const toScreenY = (wy: number) => wy - (camY - CANVAS_H / 2);

    // Background
    ctx.fillStyle = "#0c0a09";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Ground grid
    const gridSize = 50;
    const offX = -(camX - CANVAS_W / 2) % gridSize;
    const offY = -(camY - CANVAS_H / 2) % gridSize;
    ctx.strokeStyle = "rgba(120,113,108,0.08)";
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
    ctx.strokeStyle = "rgba(239,68,68,0.3)";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      toScreenX(0),
      toScreenY(0),
      MAP_W,
      MAP_H,
    );

    // Objects
    for (const obj of objs) {
      const sx = toScreenX(obj.x);
      const sy = toScreenY(obj.y);
      if (sx < -40 || sx > cv.width + 40 || sy < -40 || sy > cv.height + 40)
        continue;

      obj.wobble += 0.02;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(sx + 2, sy + obj.radius * 0.8, obj.radius * 0.8, obj.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Object body
      const def = OBJ_DEFS[obj.type];
      const canEat = obj.radius < player.radius;

      if (canEat) {
        // Highlight swallowable objects
        ctx.shadowColor = "#22c55e";
        ctx.shadowBlur = 8;
      }

      // Draw based on type
      if (obj.type === "building") {
        ctx.fillStyle = obj.color;
        ctx.fillRect(sx - obj.radius, sy - obj.radius, obj.radius * 2, obj.radius * 2);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(sx - obj.radius, sy - obj.radius, obj.radius * 2, obj.radius * 0.5);
        // Windows
        ctx.fillStyle = "rgba(255,255,0,0.4)";
        for (let wy = 0; wy < 3; wy++) {
          for (let wx = 0; wx < 3; wx++) {
            ctx.fillRect(
              sx - obj.radius * 0.6 + wx * obj.radius * 0.5,
              sy - obj.radius * 0.4 + wy * obj.radius * 0.5,
              obj.radius * 0.2,
              obj.radius * 0.2,
            );
          }
        }
      } else if (obj.type === "tree") {
        // Trunk
        ctx.fillStyle = "#78350f";
        ctx.fillRect(sx - 3, sy, 6, obj.radius * 0.6);
        // Foliage
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(sx, sy - obj.radius * 0.3, obj.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === "car") {
        ctx.fillStyle = obj.color;
        ctx.fillRect(sx - obj.radius, sy - obj.radius * 0.5, obj.radius * 2, obj.radius);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(sx - obj.radius * 0.7, sy - obj.radius * 0.35, obj.radius * 1.4, obj.radius * 0.35);
        // Wheels
        ctx.fillStyle = "#1c1917";
        ctx.beginPath();
        ctx.arc(sx - obj.radius * 0.6, sy + obj.radius * 0.4, obj.radius * 0.2, 0, Math.PI * 2);
        ctx.arc(sx + obj.radius * 0.6, sy + obj.radius * 0.4, obj.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Simple shapes for pebble, can, box, plant
        ctx.fillStyle = obj.color;
        if (obj.type === "pebble") {
          ctx.beginPath();
          ctx.arc(sx, sy, obj.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (obj.type === "can") {
          ctx.fillRect(sx - obj.radius * 0.7, sy - obj.radius, obj.radius * 1.4, obj.radius * 2);
        } else if (obj.type === "box") {
          ctx.fillRect(sx - obj.radius, sy - obj.radius, obj.radius * 2, obj.radius * 2);
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 1;
          ctx.strokeRect(sx - obj.radius, sy - obj.radius, obj.radius * 2, obj.radius * 2);
        } else if (obj.type === "plant") {
          ctx.beginPath();
          ctx.arc(sx, sy, obj.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#166534";
          ctx.beginPath();
          ctx.arc(sx - obj.radius * 0.3, sy - obj.radius * 0.3, obj.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
    }

    // Holes (black holes)
    for (const hole of holes) {
      const sx = toScreenX(hole.x);
      const sy = toScreenY(hole.y);
      if (sx < -100 || sx > cv.width + 100 || sy < -100 || sy > cv.height + 100)
        continue;

      const r = hole.radius;

      // Accretion disk glow
      const glowGrad = ctx.createRadialGradient(sx, sy, r * 0.8, sx, sy, r * 2.5);
      const glowColor = hole.isPlayer ? "rgba(168,85,247," : "rgba(239,68,68,";
      glowGrad.addColorStop(0, glowColor + "0.3)");
      glowGrad.addColorStop(0.5, glowColor + "0.1)");
      glowGrad.addColorStop(1, glowColor + "0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Swirl ring
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.03 * (hole.isPlayer ? 1 : -0.7));
      ctx.strokeStyle = hole.isPlayer ? "rgba(168,85,247,0.6)" : "rgba(239,68,68,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.1) {
        const rr = r * 1.3 + Math.sin(a * 3 + t * 0.05) * 3;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (a === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // The hole itself (pure black with gradient edge)
      const holeGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      holeGrad.addColorStop(0, "#000000");
      holeGrad.addColorStop(0.7, "#000000");
      holeGrad.addColorStop(0.9, hole.isPlayer ? "#1e1b4b" : "#450a0a");
      holeGrad.addColorStop(1, hole.isPlayer ? "rgba(168,85,247,0.4)" : "rgba(239,68,68,0.3)");
      ctx.fillStyle = holeGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();

      // Label for player
      if (hole.isPlayer) {
        ctx.fillStyle = "#c4b5fd";
        ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("你", sx, sy - r - 8);
      }
    }

    // Particles
    for (const p of particles) {
      const sx = toScreenX(p.x);
      const sy = toScreenY(p.y);
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(sx, sy, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Timer bar
    const tbW = cv.width - 20;
    const tbH = 5;
    const tbX = 10;
    const tbY = 10;
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(tbX, tbY, tbW, tbH);
    const timePct = timeLeftRef.current / GAME_TIME;
    const timeColor = timePct > 0.3 ? "#a855f7" : timePct > 0.15 ? "#f59e0b" : "#ef4444";
    ctx.fillStyle = timeColor;
    ctx.fillRect(tbX, tbY, tbW * timePct, tbH);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 14px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.ceil(timeLeftRef.current)}s`, cv.width / 2, tbY + 22);

    // Minimap
    const mmSize = 80;
    const mmX = cv.width - mmSize - 10;
    const mmY = 25;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(mmX, mmY, mmSize, mmSize);
    ctx.strokeStyle = "rgba(168,85,247,0.3)";
    ctx.lineWidth = 1;
    ctx.strokeRect(mmX, mmY, mmSize, mmSize);
    for (const hole of holes) {
      const mx = mmX + (hole.x / MAP_W) * mmSize;
      const my = mmY + (hole.y / MAP_H) * mmSize;
      ctx.fillStyle = hole.isPlayer ? "#a855f7" : "#ef4444";
      ctx.beginPath();
      ctx.arc(mx, my, hole.isPlayer ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
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
    setScore(0);
    setTimeLeft(GAME_TIME);
    setHoleSize(15);
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
    setScore(0);
    setTimeLeft(GAME_TIME);
    setHoleSize(15);
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
    { label: "质量", value: score },
    { label: "最高记录", value: best },
    { label: "剩余时间", value: `${timeLeft}s` },
    { label: "黑洞大小", value: Math.round(holeSize) },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="黑洞吞噬"
      description="Hole.io 风格的吞噬竞技！控制一个黑洞在地图上移动，吞噬比自己小的物体不断变大。从石子到建筑，吞噬一切，在 90 秒内获得最高质量！"
      instructions={`移动鼠标或手指控制黑洞移动方向。
黑洞只能吞噬比自己小的物体，被吞噬的物体会增加黑洞的质量和大小。
地图上有各种物体：石子、罐头、箱子、盆栽、树木、汽车、建筑。
物体越大，吞噬后获得的质量越多。
随着黑洞变大，你可以吞噬更大的物体。
90 秒倒计时结束游戏，分数 = 总吞噬质量。
绿色发光的物体表示当前可以吞噬。`}
      icon={Circle}
      iconEmoji="🕳️"
      iconGradient="from-slate-600 to-gray-800"
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
            onTouchStart={(e) => {
              if (e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                updateMouse(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
              }
            }}
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-purple-500/10 cursor-pointer"
          />

          {/* Start overlay */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors shadow-lg shadow-slate-500/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                移动鼠标控制黑洞 · 吞噬一切
                <br />
                90 秒内吞噬尽可能多的物体
              </p>
            </div>
          )}

          {/* Pause overlay */}
          {paused && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <h3 className="text-xl font-bold mb-4">已暂停</h3>
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            </div>
          )}

          {/* Game over overlay */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🕳️</div>
              <h3 className="text-2xl font-bold mb-2">时间到！</h3>
              <p className="text-sm text-slate-400 mb-1">总吞噬质量</p>
              <p className="text-4xl font-bold text-slate-300 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-slate-300 font-bold">{result.rank}</span>/{result.total}，超越了{" "}
                  <span className="text-slate-300 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors shadow-lg shadow-slate-500/30"
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
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors shadow-lg shadow-slate-500/30"
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

        {/* Object legend */}
        <div className="mt-5 w-full max-w-[600px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 mb-2 text-center">物体等级（从小到大）</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(Object.keys(OBJ_DEFS) as Obj["type"][]).map((type) => {
              const def = OBJ_DEFS[type];
              return (
                <div key={type} className="flex items-center gap-1 bg-[#09090b]/60 rounded-lg px-2 py-1">
                  <span className="text-sm">{def.emoji}</span>
                  <span className="text-[10px] text-slate-400">{def.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
