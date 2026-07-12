"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */
const CANVAS_W = 800;
const CANVAS_H = 500;
const GROUND_Y = 420;
const RAMP_END_X = 220;
const GRAVITY = 0.32;
const AIR_FRICTION = 0.995;
const GROUND_FRICTION = 0.88;

const HEAD = 0, TORSO = 1, L_HAND = 2, R_HAND = 3, L_FOOT = 4, R_FOOT = 5;

const SAVE_KEY = "crash-dummy-save-v1";

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
interface VPoint { x: number; y: number; px: number; py: number; }
interface VConstraint { p1: number; p2: number; len: number; }
interface Ragdoll {
  points: VPoint[];
  constraints: VConstraint[];
}
interface Obstacle {
  x: number; y: number;
  radius: number;
  hit: boolean;
  hitFlash: number;
}
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; }
interface Upgrades { acceleration: number; rampAngle: number; elasticity: number; }
interface SaveData { coins: number; bestDistance: number; totalEarned: number; upgrades: Upgrades; }

interface GameState {
  subPhase: "ready" | "charging" | "flying" | "result";
  chargeLevel: number;
  flightTime: number;
  maxX: number;
  endTimer: number;
  dummy: Ragdoll;
  obstacles: Obstacle[];
  particles: Particle[];
  trail: { x: number; y: number }[];
  camX: number;
  distance: number;
  earned: number;
  obstacleHits: number;
  shakeTime: number;
}

/* ================================================================== */
/*  Factory                                                            */
/* ================================================================== */
function createDummy(x: number, y: number): Ragdoll {
  const points: VPoint[] = [
    { x, y: y - 28, px: x, py: y - 28 },
    { x, y, px: x, py: y },
    { x: x - 14, y: y - 4, px: x - 14, py: y - 4 },
    { x: x + 14, y: y - 4, px: x + 14, py: y - 4 },
    { x: x - 10, y: y + 26, px: x - 10, py: y + 26 },
    { x: x + 10, y: y + 26, px: x + 10, py: y + 26 },
  ];
  const constraints: VConstraint[] = [
    { p1: HEAD, p2: TORSO, len: 30 },
    { p1: TORSO, p2: L_HAND, len: 24 },
    { p1: TORSO, p2: R_HAND, len: 24 },
    { p1: TORSO, p2: L_FOOT, len: 30 },
    { p1: TORSO, p2: R_FOOT, len: 30 },
  ];
  return { points, constraints };
}

function generateObstacles(): Obstacle[] {
  const obs: Obstacle[] = [];
  let x = RAMP_END_X + 150;
  while (x < 8000) {
    const onGround = Math.random() < 0.5;
    const y = onGround ? GROUND_Y - 22 : GROUND_Y - 80 - Math.random() * 120;
    obs.push({ x, y, radius: 18, hit: false, hitFlash: 0 });
    x += 130 + Math.random() * 200;
  }
  return obs;
}

function createGameState(): GameState {
  return {
    subPhase: "ready",
    chargeLevel: 0,
    flightTime: 0,
    maxX: RAMP_END_X,
    endTimer: 0,
    dummy: createDummy(RAMP_END_X, GROUND_Y - 30),
    obstacles: generateObstacles(),
    particles: [],
    trail: [],
    camX: 0,
    distance: 0,
    earned: 0,
    obstacleHits: 0,
    shakeTime: 0,
  };
}

/* ================================================================== */
/*  Physics                                                            */
/* ================================================================== */
function updateRagdoll(r: Ragdoll, dt: number, elasticity: number, gs: GameState) {
  // Verlet integration
  for (const p of r.points) {
    const vx = (p.x - p.px) * AIR_FRICTION;
    const vy = (p.y - p.py) * AIR_FRICTION;
    p.px = p.x; p.py = p.y;
    p.x += vx * dt;
    p.y += vy * dt + GRAVITY * dt;
  }

  // Constraints
  for (let iter = 0; iter < 5; iter++) {
    for (const c of r.constraints) {
      const p1 = r.points[c.p1];
      const p2 = r.points[c.p2];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const diff = (c.len - dist) / dist;
      const ox = dx * 0.5 * diff;
      const oy = dy * 0.5 * diff;
      p1.x -= ox; p1.y -= oy;
      p2.x += ox; p2.y += oy;
    }
  }

  // Ground bounce
  for (const p of r.points) {
    if (p.y > GROUND_Y) {
      const vy = p.y - p.py;
      const vx = p.x - p.px;
      p.y = GROUND_Y;
      p.py = p.y + vy * elasticity;
      p.px = p.x - vx * GROUND_FRICTION;
      // Dust particles
      if (Math.abs(vy) > 3) {
        for (let i = 0; i < 3; i++) {
          gs.particles.push({
            x: p.x, y: GROUND_Y,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3,
            life: 20, maxLife: 20, color: "rgba(150,120,80,0.6)",
          });
        }
        if (Math.abs(vy) > 6) gs.shakeTime = 8;
      }
    }
    // Ceiling
    if (p.y < 0) { p.y = 0; p.py = p.y; }
  }

  // Obstacle bounce
  for (const p of r.points) {
    for (const obs of gs.obstacles) {
      const dx = p.x - obs.x;
      const dy = p.y - obs.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < obs.radius + 8) {
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);
        p.x = obs.x + nx * (obs.radius + 8);
        p.y = obs.y + ny * (obs.radius + 8);
        const vx = p.x - p.px;
        const vy = p.y - p.py;
        const dot = vx * nx + vy * ny;
        if (dot < 0) {
          const boost = 1.4 + elasticity * 0.5;
          p.px = p.x - (vx - 2 * dot * nx) * boost;
          p.py = p.y - (vy - 2 * dot * ny) * boost;
          if (!obs.hit) { obs.hit = true; gs.obstacleHits++; }
          obs.hitFlash = 15;
          gs.particles.push({
            x: obs.x, y: obs.y,
            vx: 0, vy: 0,
            life: 15, maxLife: 15, color: "rgba(74,222,128,0.8)",
          });
        }
      }
    }
  }
}

/* ================================================================== */
/*  Rendering                                                          */
/* ================================================================== */
function drawRagdoll(ctx: CanvasRenderingContext2D, r: Ragdoll, camX: number) {
  const main = "#60a5fa";
  const dark = "#1e40af";

  ctx.strokeStyle = dark;
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  const bone = (a: VPoint, b: VPoint) => {
    ctx.beginPath();
    ctx.moveTo(a.x - camX, a.y);
    ctx.lineTo(b.x - camX, b.y);
    ctx.stroke();
  };
  bone(r.points[HEAD], r.points[TORSO]);
  bone(r.points[TORSO], r.points[L_HAND]);
  bone(r.points[TORSO], r.points[R_HAND]);
  bone(r.points[TORSO], r.points[L_FOOT]);
  bone(r.points[TORSO], r.points[R_FOOT]);

  // Torso
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(r.points[TORSO].x - camX, r.points[TORSO].y, 13, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(r.points[HEAD].x - camX, r.points[HEAD].y, 11, 0, Math.PI * 2);
  ctx.fill();
  // X eye (crash dummy)
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;
  const hx = r.points[HEAD].x - camX, hy = r.points[HEAD].y;
  ctx.beginPath();
  ctx.moveTo(hx - 4, hy - 4); ctx.lineTo(hx + 4, hy + 4);
  ctx.moveTo(hx + 4, hy - 4); ctx.lineTo(hx - 4, hy + 4);
  ctx.stroke();

  // Hands & feet
  ctx.fillStyle = dark;
  for (const hi of [L_HAND, R_HAND, L_FOOT, R_FOOT]) {
    ctx.beginPath();
    ctx.arc(r.points[hi].x - camX, r.points[hi].y, hi >= L_FOOT ? 7 : 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function render(ctx: CanvasRenderingContext2D, gs: GameState, upgrades: Upgrades, bestDist: number, coins: number) {
  const shakeX = gs.shakeTime > 0 ? (Math.random() - 0.5) * 8 : 0;
  const shakeY = gs.shakeTime > 0 ? (Math.random() - 0.5) * 8 : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  sky.addColorStop(0, "#0c4a6e");
  sky.addColorStop(0.6, "#0ea5e9");
  sky.addColorStop(1, "#7dd3fc");
  ctx.fillStyle = sky;
  ctx.fillRect(-20, -20, CANVAS_W + 40, CANVAS_H + 40);

  // Clouds (parallax)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 6; i++) {
    const cx = ((i * 300 - gs.camX * 0.2) % (CANVAS_W + 200)) - 100;
    const cy = 40 + (i % 3) * 40;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.arc(cx + 20, cy + 5, 15, 0, Math.PI * 2);
    ctx.arc(cx - 18, cy + 5, 12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground
  ctx.fillStyle = "#166534";
  ctx.fillRect(-20, GROUND_Y, CANVAS_W + 40, CANVAS_H - GROUND_Y + 20);
  ctx.fillStyle = "#22c55e";
  ctx.fillRect(-20, GROUND_Y, CANVAS_W + 40, 6);

  // Distance markers
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  for (let m = 0; m <= 200; m += 5) {
    const wx = RAMP_END_X + m * 10;
    const sx = wx - gs.camX;
    if (sx < -20 || sx > CANVAS_W + 20) continue;
    ctx.strokeStyle = m % 50 === 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y);
    ctx.lineTo(sx, GROUND_Y - (m % 50 === 0 ? 16 : 8));
    ctx.stroke();
    if (m % 25 === 0 && m > 0) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText(`${m}m`, sx, GROUND_Y + 18);
    }
  }

  // Ramp
  ctx.fillStyle = "#475569";
  ctx.beginPath();
  ctx.moveTo(20, 80);
  ctx.lineTo(20, GROUND_Y);
  ctx.lineTo(RAMP_END_X, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(20, 80);
  ctx.lineTo(RAMP_END_X, GROUND_Y);
  ctx.stroke();

  // Vehicle (on ramp during ready/charging)
  if (gs.subPhase === "ready" || gs.subPhase === "charging") {
    const vib = gs.subPhase === "charging" ? (Math.random() - 0.5) * 3 : 0;
    const vx = RAMP_END_X - 35 + vib;
    const vy = GROUND_Y - 18 + vib;
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(vx - 25, vy - 12, 50, 20);
    ctx.fillStyle = "#991b1b";
    ctx.fillRect(vx - 15, vy - 22, 25, 12);
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(vx - 15, vy + 10, 7, 0, Math.PI * 2);
    ctx.arc(vx + 15, vy + 10, 7, 0, Math.PI * 2);
    ctx.fill();
    // Exhaust
    if (gs.subPhase === "charging") {
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = `rgba(200,200,200,${0.3 - i * 0.08})`;
        ctx.beginPath();
        ctx.arc(vx - 30 - i * 8, vy + Math.random() * 4, 5 + i, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Obstacles
  for (const obs of gs.obstacles) {
    const sx = obs.x - gs.camX;
    if (sx < -30 || sx > CANVAS_W + 30) continue;
    const pulse = Math.sin(Date.now() / 200 + obs.x) * 2;
    const r = obs.radius + pulse + (obs.hitFlash > 0 ? 6 : 0);
    ctx.fillStyle = obs.hitFlash > 0 ? "#fef08a" : "rgba(34,197,94,0.85)";
    ctx.beginPath();
    ctx.arc(sx, obs.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Spring visual
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx - 6, obs.y);
    ctx.lineTo(sx + 6, obs.y);
    ctx.stroke();
  }

  // Trail
  for (let i = 0; i < gs.trail.length; i++) {
    const t = gs.trail[i];
    const a = i / gs.trail.length;
    ctx.fillStyle = `rgba(251,191,36,${a * 0.4})`;
    ctx.beginPath();
    ctx.arc(t.x - gs.camX, t.y, 3 + a * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Particles
  for (const p of gs.particles) {
    const a = p.life / p.maxLife;
    ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${a})`);
    ctx.beginPath();
    ctx.arc(p.x - gs.camX, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dummy
  if (gs.subPhase === "flying" || gs.subPhase === "result") {
    drawRagdoll(ctx, gs.dummy, gs.camX);
  }

  ctx.restore();

  // HUD (screen space)
  // Distance
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, CANVAS_W, 40);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`距离: ${Math.max(0, Math.floor(gs.distance / 10))}m`, 16, 26);
  ctx.textAlign = "right";
  ctx.fillText(`金币: ${coins}  最远: ${Math.floor(bestDist / 10)}m`, CANVAS_W - 16, 26);

  // Charge meter
  if (gs.subPhase === "charging") {
    const barW = 300, barH = 20;
    const bx = (CANVAS_W - barW) / 2, by = CANVAS_H - 50;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(bx - 3, by - 3, barW + 6, barH + 6);
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(bx, by, barW, barH);
    const pct = gs.chargeLevel;
    const col = pct < 0.5 ? "#22c55e" : pct < 0.8 ? "#eab308" : "#ef4444";
    ctx.fillStyle = col;
    ctx.fillRect(bx, by, barW * pct, barH);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`蓄力 ${Math.floor(pct * 100)}%`, CANVAS_W / 2, by + 14);
  }

  // Ready prompt
  if (gs.subPhase === "ready") {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, CANVAS_H - 60, CANVAS_W, 60);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("按住 空格键 / 触摸屏幕 蓄力加速", CANVAS_W / 2, CANVAS_H - 30);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("松开发射假人！飞行越远金币越多", CANVAS_W / 2, CANVAS_H - 12);
  }
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */
export default function CrashDummyPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"start" | "playing" | "paused">("start");
  const [refreshKey, setRefreshKey] = useState(0);

  // Persistent display state
  const [coins, setCoins] = useState(0);
  const [bestDist, setBestDist] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrades>({ acceleration: 0, rampAngle: 0, elasticity: 0 });
  const [resultInfo, setResultInfo] = useState({ distance: 0, earned: 0, hits: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const gsRef = useRef<GameState>(createGameState());
  const persistRef = useRef<SaveData>({ coins: 0, bestDistance: 0, totalEarned: 0, upgrades: { acceleration: 0, rampAngle: 0, elasticity: 0 } });
  const phaseRef = useRef(phase);
  const scoreTimerRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ---- mount ---- */
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data: SaveData = JSON.parse(raw);
        persistRef.current = data;
        setCoins(data.coins);
        setBestDist(data.bestDistance);
        setTotalEarned(data.totalEarned);
        setUpgrades(data.upgrades);
      }
    } catch { /* ignore */ }
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  /* ---- canvas setup (after mounted renders the canvas) ---- */
  useEffect(() => {
    if (mounted) {
      const canvas = canvasRef.current;
      if (canvas) ctxRef.current = canvas.getContext("2d");
    }
  }, [mounted]);

  const savePersist = useCallback(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(persistRef.current)); } catch { /* ignore */ }
  }, []);

  const syncPersist = useCallback(() => {
    const p = persistRef.current;
    setCoins(p.coins);
    setBestDist(p.bestDistance);
    setTotalEarned(p.totalEarned);
    setUpgrades({ ...p.upgrades });
  }, []);

  /* ---- keyboard ---- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " ") {
        e.preventDefault();
        const gs = gsRef.current;
        if (phaseRef.current === "playing" && gs.subPhase === "ready") {
          gs.subPhase = "charging";
          gs.chargeLevel = 0;
        }
      }
      if (k === "p") {
        if (phaseRef.current === "playing") setPhase("paused");
        else if (phaseRef.current === "paused") setPhase("playing");
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        const gs = gsRef.current;
        if (phaseRef.current === "playing" && gs.subPhase === "charging") {
          launch(gs, persistRef.current.upgrades);
        }
      }
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  /* ---- launch ---- */
  const launch = (gs: GameState, ups: Upgrades) => {
    const speed = 8 + gs.chargeLevel * 14 + ups.acceleration * 2.5;
    const angle = (28 + ups.rampAngle * 3) * Math.PI / 180;
    const vx = speed * Math.cos(angle);
    const vy = -speed * Math.sin(angle);
    // Reset dummy at ramp end
    gs.dummy = createDummy(RAMP_END_X, GROUND_Y - 30);
    for (const p of gs.dummy.points) {
      p.px = p.x - vx;
      p.py = p.y - vy;
    }
    gs.obstacles = generateObstacles();
    gs.subPhase = "flying";
    gs.flightTime = 0;
    gs.maxX = RAMP_END_X;
    gs.endTimer = 0;
    gs.obstacleHits = 0;
    gs.trail = [];
    gs.particles = [];
  };

  /* ---- game loop ---- */
  useEffect(() => {
    if (phase !== "playing") return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const loop = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = Math.min((ts - lastTimeRef.current) / 16.67, 2.5);
      lastTimeRef.current = ts;
      const gs = gsRef.current;
      const ups = persistRef.current.upgrades;
      const elasticity = 0.3 + ups.elasticity * 0.08;

      if (gs.subPhase === "charging") {
        gs.chargeLevel = Math.min(1, gs.chargeLevel + 0.012 * dt);
      }

      if (gs.subPhase === "flying") {
        gs.flightTime += dt / 60;
        updateRagdoll(gs.dummy, dt, elasticity, gs);

        // Track max x
        let cx = 0;
        for (const p of gs.dummy.points) cx += p.x;
        cx /= gs.dummy.points.length;
        if (cx > gs.maxX) gs.maxX = cx;
        gs.distance = gs.maxX - RAMP_END_X;

        // Camera
        gs.camX = Math.max(0, cx - 300);

        // Trail
        gs.trail.push({ x: gs.dummy.points[TORSO].x, y: gs.dummy.points[TORSO].y });
        if (gs.trail.length > 15) gs.trail.shift();

        // Obstacle flash decay
        for (const obs of gs.obstacles) {
          if (obs.hitFlash > 0) obs.hitFlash -= dt;
        }

        // End condition
        let allSlow = true;
        for (const p of gs.dummy.points) {
          const speed = Math.hypot(p.x - p.px, p.y - p.py);
          if (speed > 0.8) { allSlow = false; break; }
        }
        if (allSlow || gs.flightTime > 20) {
          gs.endTimer += dt;
          if (gs.endTimer > 50 || gs.flightTime > 20) {
            // End flight
            const dist = Math.max(0, Math.floor(gs.distance));
            const earned = Math.floor(dist / 10) + gs.obstacleHits * 30;
            const p = persistRef.current;
            p.coins += earned;
            p.totalEarned += earned;
            if (dist > p.bestDistance) p.bestDistance = dist;
            savePersist();
            syncPersist();
            setResultInfo({ distance: Math.floor(dist / 10), earned, hits: gs.obstacleHits });
            gs.subPhase = "result";
          }
        } else {
          gs.endTimer = 0;
        }
      }

      // Particles
      for (const part of gs.particles) {
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.vy += 0.15 * dt;
        part.life -= dt;
      }
      gs.particles = gs.particles.filter(p => p.life > 0);

      // Shake decay
      if (gs.shakeTime > 0) gs.shakeTime -= dt;

      // Score submit every 30s
      scoreTimerRef.current += dt / 60;
      if (scoreTimerRef.current > 30) {
        scoreTimerRef.current = 0;
        submitScore("crash-dummy", persistRef.current.totalEarned);
        setRefreshKey(k => k + 1);
      }

      // Render
      render(ctx, gs, ups, persistRef.current.bestDistance, persistRef.current.coins);

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, savePersist, syncPersist]);

  /* ---- touch handlers ---- */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const gs = gsRef.current;
    if (phaseRef.current === "playing" && gs.subPhase === "ready") {
      gs.subPhase = "charging";
      gs.chargeLevel = 0;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const gs = gsRef.current;
    if (phaseRef.current === "playing" && gs.subPhase === "charging") {
      launch(gs, persistRef.current.upgrades);
    }
  }, []);

  /* ---- actions ---- */
  const startGame = () => {
    gsRef.current = createGameState();
    setPhase("playing");
  };

  const launchAgain = () => {
    gsRef.current = createGameState();
  };

  const buyUpgrade = (key: keyof Upgrades) => {
    const p = persistRef.current;
    const costs: Record<keyof Upgrades, number> = {
      acceleration: Math.floor(100 * Math.pow(1.5, p.upgrades.acceleration)),
      rampAngle: Math.floor(80 * Math.pow(1.5, p.upgrades.rampAngle)),
      elasticity: Math.floor(120 * Math.pow(1.5, p.upgrades.elasticity)),
    };
    const cost = costs[key];
    if (p.coins >= cost) {
      p.coins -= cost;
      p.upgrades[key]++;
      savePersist();
      syncPersist();
    }
  };

  /* ---- stats ---- */
  const accCost = Math.floor(100 * Math.pow(1.5, upgrades.acceleration));
  const angCost = Math.floor(80 * Math.pow(1.5, upgrades.rampAngle));
  const elasCost = Math.floor(120 * Math.pow(1.5, upgrades.elasticity));

  const stats: GameStat[] = [
    { label: "最远距离", value: `${Math.floor(bestDist / 10)}m`, icon: "📏" },
    { label: "金币", value: coins, icon: "🪙" },
    { label: "总收益", value: totalEarned, icon: "💰" },
    { label: "加速度", value: `Lv${upgrades.acceleration}`, icon: "🚀" },
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
      gameId="crash-dummy"
      title="碰撞假人"
      iconEmoji="🤖"
      iconGradient="from-orange-500 to-red-600"
      stats={stats}
      shareScore={totalEarned}
      refreshKey={refreshKey}
    >
      <div className="relative">
        {/* START SCREEN */}
        {phase === "start" && (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="text-6xl">🤖</div>
            <h2 className="text-3xl font-bold text-white">碰撞假人</h2>
            <div className="max-w-md space-y-2 text-sm text-gray-400">
              <p>按住空格键或触摸屏幕蓄力加速</p>
              <p>松开发射假人，飞行越远金币越多</p>
              <p>飞行中碰到绿色弹射台可以飞得更远</p>
              <p>用金币升级车辆、坡道和假人弹性</p>
              <p className="text-amber-400">按 P 键暂停</p>
            </div>
            <button
              onClick={startGame}
              aria-label="开始游戏"
              className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            >
              开始游戏
            </button>
          </div>
        )}

        {/* CANVAS */}
        {(phase === "playing" || phase === "paused") && (
          <>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="block w-full touch-none"
              style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
              aria-label="碰撞假人游戏画布"
            />

            {/* RESULT OVERLAY */}
            {gsRef.current.subPhase === "result" && phase === "playing" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 overflow-y-auto rounded-2xl bg-black/80 p-4 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white">飞行结束!</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-gray-800/60 px-4 py-2">
                    <div className="text-xs text-gray-400">距离</div>
                    <div className="text-xl font-bold text-amber-400">{resultInfo.distance}m</div>
                  </div>
                  <div className="rounded-xl bg-gray-800/60 px-4 py-2">
                    <div className="text-xs text-gray-400">弹射</div>
                    <div className="text-xl font-bold text-green-400">{resultInfo.hits}</div>
                  </div>
                  <div className="rounded-xl bg-gray-800/60 px-4 py-2">
                    <div className="text-xs text-gray-400">金币</div>
                    <div className="text-xl font-bold text-yellow-400">+{resultInfo.earned}</div>
                  </div>
                </div>

                {/* Upgrades */}
                <div className="grid w-full max-w-md gap-2">
                  <UpgradeButton icon="🚀" name="车辆加速" desc={`发射速度 +20% (Lv${upgrades.acceleration})`} cost={accCost} coins={coins} onClick={() => buyUpgrade("acceleration")} />
                  <UpgradeButton icon="📐" name="坡道角度" desc={`发射角度 +3° (Lv${upgrades.rampAngle})`} cost={angCost} coins={coins} onClick={() => buyUpgrade("rampAngle")} />
                  <UpgradeButton icon="🤸" name="假人弹性" desc={`弹跳力 +8% (Lv${upgrades.elasticity})`} cost={elasCost} coins={coins} onClick={() => buyUpgrade("elasticity")} />
                </div>

                <button
                  onClick={launchAgain}
                  aria-label="再次发射"
                  className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-8 text-base font-bold text-white shadow-lg transition hover:scale-105 active:scale-95"
                >
                  再次发射
                </button>
              </div>
            )}

            {/* PAUSE OVERLAY */}
            {phase === "paused" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/80 backdrop-blur-sm">
                <h3 className="text-3xl font-bold text-white">已暂停</h3>
                <div className="text-center text-gray-400">
                  <div>金币: {coins} | 最远: {Math.floor(bestDist / 10)}m</div>
                </div>
                <button
                  onClick={() => setPhase("playing")}
                  aria-label="继续游戏"
                  className="flex h-14 items-center justify-center rounded-2xl bg-indigo-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
                >
                  继续 (P)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </GameShell>
  );
}

/* ---- upgrade button ---- */
function UpgradeButton({ icon, name, desc, cost, coins, onClick }: { icon: string; name: string; desc: string; cost: number; coins: number; onClick: () => void; }) {
  const aff = coins >= cost;
  return (
    <button
      onClick={onClick}
      disabled={!aff}
      aria-label={name}
      className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition active:scale-95 disabled:opacity-40 ${
        aff ? "border-amber-600/40 bg-amber-900/20 hover:bg-amber-900/30" : "border-gray-700 bg-gray-800/40"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-white">{name}</div>
        <div className="truncate text-xs text-gray-400">{desc}</div>
      </div>
      <div className={`shrink-0 text-sm font-bold ${aff ? "text-amber-400" : "text-gray-500"}`}>{cost}</div>
    </button>
  );
}
