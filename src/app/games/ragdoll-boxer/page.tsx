"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */
const CANVAS_W = 700;
const CANVAS_H = 400;
const GROUND_Y = 340;
const GRAVITY = 0.35;
const FRICTION = 0.97;

/* Point indices */
const HEAD = 0;
const TORSO = 1;
const L_HAND = 2;
const R_HAND = 3;
const L_FOOT = 4;
const R_FOOT = 5;
const PINNED = new Set([TORSO, L_FOOT, R_FOOT]);

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
interface VPoint {
  x: number; y: number;
  px: number; py: number;
}
interface VConstraint {
  p1: number; p2: number;
  len: number;
  stiffness: number;
}
interface Fighter {
  points: VPoint[];
  constraints: VConstraint[];
  hp: number;
  x: number;
  vx: number;
  facing: number;
  isPlayer: boolean;
  punchCooldown: number;
  punchActive: boolean;
  punchHand: number;
  punchTimer: number;
  hitFlash: number;
  knockedOut: boolean;
}
interface HitEffect {
  x: number; y: number;
  life: number; maxLife: number;
}
interface GameState {
  subPhase: "announce" | "fighting" | "roundEnd" | "matchEnd";
  round: number;
  roundTimer: number;
  score: number;
  kos: number;
  player: Fighter;
  ai: Fighter;
  announceText: string;
  announceTimer: number;
  hitEffects: HitEffect[];
}

/* ================================================================== */
/*  Fighter factory                                                    */
/* ================================================================== */
function createFighter(x: number, facing: number, isPlayer: boolean): Fighter {
  const points: VPoint[] = [
    { x, y: 200, px: x, py: 200 },                          // head
    { x, y: 240, px: x, py: 240 },                          // torso
    { x: x - 22 * facing, y: 240, px: x - 22 * facing, py: 240 }, // L hand
    { x: x + 22 * facing, y: 240, px: x + 22 * facing, py: 240 }, // R hand
    { x: x - 14 * facing, y: GROUND_Y - 6, px: x - 14 * facing, py: GROUND_Y - 6 }, // L foot
    { x: x + 14 * facing, y: GROUND_Y - 6, px: x + 14 * facing, py: GROUND_Y - 6 }, // R foot
  ];
  const constraints: VConstraint[] = [
    { p1: HEAD,   p2: TORSO,  len: 42, stiffness: 1 },
    { p1: TORSO,  p2: L_HAND, len: 38, stiffness: 0.7 },
    { p1: TORSO,  p2: R_HAND, len: 38, stiffness: 0.7 },
    { p1: TORSO,  p2: L_FOOT, len: 55, stiffness: 1 },
    { p1: TORSO,  p2: R_FOOT, len: 55, stiffness: 1 },
  ];
  return {
    points, constraints, hp: 100, x, vx: 0, facing, isPlayer,
    punchCooldown: 0, punchActive: false, punchHand: R_HAND,
    punchTimer: 0, hitFlash: 0, knockedOut: false,
  };
}

function createGameState(): GameState {
  return {
    subPhase: "announce",
    round: 1,
    roundTimer: 30,
    score: 0,
    kos: 0,
    player: createFighter(220, 1, true),
    ai: createFighter(480, -1, false),
    announceText: "第 1 回合",
    announceTimer: 2.5,
    hitEffects: [],
  };
}

/* ================================================================== */
/*  Physics                                                            */
/* ================================================================== */
function updateFighter(f: Fighter, dt: number) {
  if (!f.knockedOut) {
    // Pin torso and feet
    const t = f.points[TORSO];
    t.px = t.x = f.x; t.py = t.y = 240;
    f.points[L_FOOT].x = f.x - 14 * f.facing;
    f.points[L_FOOT].y = GROUND_Y - 6;
    f.points[L_FOOT].px = f.points[L_FOOT].x;
    f.points[L_FOOT].py = f.points[L_FOOT].y;
    f.points[R_FOOT].x = f.x + 14 * f.facing;
    f.points[R_FOOT].y = GROUND_Y - 6;
    f.points[R_FOOT].px = f.points[R_FOOT].x;
    f.points[R_FOOT].py = f.points[R_FOOT].y;
  }

  // Verlet integration for non-pinned points
  const pinned = f.knockedOut ? new Set<number>() : PINNED;
  for (let i = 0; i < f.points.length; i++) {
    if (pinned.has(i)) continue;
    const p = f.points[i];
    const vx = (p.x - p.px) * FRICTION;
    const vy = (p.y - p.py) * FRICTION;
    p.px = p.x; p.py = p.y;
    p.x += vx * dt;
    p.y += vy * dt + GRAVITY * dt;
  }

  // Constraint solving
  for (let iter = 0; iter < 6; iter++) {
    for (const c of f.constraints) {
      const p1 = f.points[c.p1];
      const p2 = f.points[c.p2];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const diff = ((c.len - dist) / dist) * c.stiffness;
      const ox = dx * 0.5 * diff;
      const oy = dy * 0.5 * diff;
      if (!pinned.has(c.p1)) { p1.x -= ox; p1.y -= oy; }
      if (!pinned.has(c.p2)) { p2.x += ox; p2.y += oy; }
    }
  }

  // Ground + wall collision
  for (let i = 0; i < f.points.length; i++) {
    if (pinned.has(i)) continue;
    const p = f.points[i];
    if (p.y > GROUND_Y) {
      p.y = GROUND_Y;
      p.py = p.y + (p.py - p.y) * 0.3;
    }
    if (p.x < 8) p.x = 8;
    if (p.x > CANVAS_W - 8) p.x = CANVAS_W - 8;
  }

  if (f.punchCooldown > 0) f.punchCooldown -= dt;
  if (f.punchTimer > 0) {
    f.punchTimer -= dt;
    if (f.punchTimer <= 0) f.punchActive = false;
  }
  if (f.hitFlash > 0) f.hitFlash -= dt;
}

function doPunch(f: Fighter, targetX: number, targetY: number) {
  if (f.punchCooldown > 0 || f.knockedOut) return;
  const lh = f.points[L_HAND];
  const rh = f.points[R_HAND];
  const lhD = Math.hypot(lh.x - targetX, lh.y - targetY);
  const rhD = Math.hypot(rh.x - targetX, rh.y - targetY);
  const useRight = rhD <= lhD;
  const hand = useRight ? rh : lh;
  const dx = targetX - hand.x;
  const dy = targetY - hand.y;
  const dist = Math.hypot(dx, dy) || 1;
  hand.px = hand.x - (dx / dist) * 20;
  hand.py = hand.y - (dy / dist) * 20;
  f.punchCooldown = 28;
  f.punchActive = true;
  f.punchHand = useRight ? R_HAND : L_HAND;
  f.punchTimer = 12;
}

function checkHit(attacker: Fighter, defender: Fighter, gs: GameState) {
  if (!attacker.punchActive) return;
  const hand = attacker.points[attacker.punchHand];
  const head = defender.points[HEAD];
  const dx = hand.x - head.x;
  const dy = hand.y - head.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 26) {
    const speed = Math.hypot(hand.x - hand.px, hand.y - hand.py);
    if (speed > 7) {
      const damage = Math.min(14, speed * 0.65);
      defender.hp -= damage;
      const kx = (dx / (dist || 1)) * 14;
      const ky = (dy / (dist || 1)) * 10;
      head.x += kx; head.y += ky;
      head.px = head.x - kx * 0.4;
      head.py = head.y - ky * 0.4;
      defender.hitFlash = 12;
      if (attacker.isPlayer) gs.score += 1;
      gs.hitEffects.push({ x: head.x, y: head.y, life: 18, maxLife: 18 });
      attacker.punchActive = false;
    }
  }
}

/* ================================================================== */
/*  AI                                                                 */
/* ================================================================== */
function updateAI(ai: Fighter, player: Fighter, dt: number) {
  if (ai.knockedOut) return;
  const dist = Math.abs(ai.x - player.x);
  if (dist > 110) {
    ai.x -= ai.facing * 1.4 * dt;
  } else if (dist < 70) {
    ai.x += ai.facing * 0.6 * dt;
  }
  ai.x = Math.max(60, Math.min(CANVAS_W - 60, ai.x));

  if (ai.punchCooldown <= 0 && dist < 160) {
    if (Math.random() < 0.025 * dt) {
      const head = player.points[HEAD];
      doPunch(ai, head.x + (Math.random() - 0.5) * 20, head.y + (Math.random() - 0.5) * 15);
    }
  }
}

/* ================================================================== */
/*  Rendering                                                          */
/* ================================================================== */
function drawFighter(ctx: CanvasRenderingContext2D, f: Fighter) {
  const isP = f.isPlayer;
  const main = isP ? "#3b82f6" : "#ef4444";
  const dark = isP ? "#1e3a8a" : "#7f1d1d";

  // Body connections
  ctx.strokeStyle = dark;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  const drawBone = (a: VPoint, b: VPoint) => {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };
  drawBone(f.points[HEAD], f.points[TORSO]);
  drawBone(f.points[TORSO], f.points[L_HAND]);
  drawBone(f.points[TORSO], f.points[R_HAND]);
  drawBone(f.points[TORSO], f.points[L_FOOT]);
  drawBone(f.points[TORSO], f.points[R_FOOT]);

  // Torso
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(f.points[TORSO].x, f.points[TORSO].y, 16, 0, Math.PI * 2);
  ctx.fill();

  // Head
  const headColor = f.hitFlash > 0 ? "#fde047" : isP ? "#93c5fd" : "#fca5a5";
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(f.points[HEAD].x, f.points[HEAD].y, 14, 0, Math.PI * 2);
  ctx.fill();
  // Eyes
  const eo = f.facing * 4;
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(f.points[HEAD].x + eo, f.points[HEAD].y - 3, 2.5, 0, Math.PI * 2);
  ctx.arc(f.points[HEAD].x + eo, f.points[HEAD].y + 4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Fists
  for (const hi of [L_HAND, R_HAND]) {
    const h = f.points[hi];
    const punching = f.punchActive && f.punchHand === hi;
    ctx.fillStyle = punching ? "#fbbf24" : dark;
    ctx.beginPath();
    ctx.arc(h.x, h.y, punching ? 12 : 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Feet
  ctx.fillStyle = dark;
  for (const fi of [L_FOOT, R_FOOT]) {
    const ft = f.points[fi];
    ctx.beginPath();
    ctx.ellipse(ft.x, ft.y, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHPBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hp: number, max: number, color: string, leftToRight: boolean) {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x, y, w, h);
  const pct = Math.max(0, hp / max);
  ctx.fillStyle = color;
  if (leftToRight) {
    ctx.fillRect(x, y, w * pct, h);
  } else {
    ctx.fillRect(x + w * (1 - pct), y, w * pct, h);
  }
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
}

function render(ctx: CanvasRenderingContext2D, gs: GameState) {
  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Ring floor
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y); ctx.lineTo(CANVAS_W, GROUND_Y);
  ctx.stroke();
  // Ring posts
  ctx.fillStyle = "#475569";
  ctx.fillRect(8, 60, 6, GROUND_Y - 60);
  ctx.fillRect(CANVAS_W - 14, 60, 6, GROUND_Y - 60);

  // HP bars
  drawHPBar(ctx, 20, 16, 240, 16, gs.player.hp, 100, "#3b82f6", true);
  drawHPBar(ctx, CANVAS_W - 260, 16, 240, 16, gs.ai.hp, 100, "#ef4444", false);

  // Timer + round
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(Math.ceil(gs.roundTimer).toString(), CANVAS_W / 2, 32);
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText(`第 ${gs.round} 回合 / 3`, CANVAS_W / 2, 48);

  // Score
  ctx.textAlign = "left";
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.fillText(`得分 ${gs.score}  KO ${gs.kos}`, 20, 48);

  // Fighters
  drawFighter(ctx, gs.ai);
  drawFighter(ctx, gs.player);

  // Hit effects
  for (const e of gs.hitEffects) {
    const a = e.life / e.maxLife;
    ctx.strokeStyle = `rgba(251,191,36,${a})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, (1 - a) * 28 + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Announcement
  if (gs.subPhase !== "fighting" && gs.announceText) {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, CANVAS_H / 2 - 45, CANVAS_W, 90);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 34px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(gs.announceText, CANVAS_W / 2, CANVAS_H / 2 + 12);
  }
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */
export default function RagdollBoxerPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"start" | "playing" | "paused" | "gameOver">("start");
  const [display, setDisplay] = useState({ round: 1, timer: 30, pHP: 100, aHP: 100, score: 0, kos: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastUiRef = useRef(0);
  const gsRef = useRef<GameState>(createGameState());
  const mouseRef = useRef({ x: 350, y: 240 });
  const keysRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<{ startX: number; startY: number; x: number; y: number; t: number } | null>(null);
  const phaseRef = useRef(phase);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  /* ---- mount ---- */
  useEffect(() => {
    setMounted(true);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  /* ---- canvas setup (after mounted renders the canvas) ---- */
  useEffect(() => {
    if (mounted) {
      const canvas = canvasRef.current;
      if (canvas) {
        ctxRef.current = canvas.getContext("2d");
      }
    }
  }, [mounted]);

  /* ---- keyboard ---- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current.add(k);
      if (k === "p") {
        if (phaseRef.current === "playing") setPhase("paused");
        else if (phaseRef.current === "paused") setPhase("playing");
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

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

      /* ---- sub-phase timers ---- */
      if (gs.subPhase !== "fighting") {
        gs.announceTimer -= dt / 60;
        if (gs.announceTimer <= 0) {
          if (gs.subPhase === "announce") {
            gs.subPhase = "fighting";
          } else if (gs.subPhase === "roundEnd") {
            gs.round++;
            if (gs.round > 3) {
              gs.subPhase = "matchEnd";
              gs.announceText = "比赛结束!";
              gs.announceTimer = 3;
            } else {
              gs.subPhase = "announce";
              gs.announceText = `第 ${gs.round} 回合`;
              gs.announceTimer = 2.5;
              gs.roundTimer = 30;
              gs.player = createFighter(220, 1, true);
              gs.ai = createFighter(480, -1, false);
            }
          } else if (gs.subPhase === "matchEnd") {
            submitScore("ragdoll-boxer", gs.score);
            setRefreshKey(k => k + 1);
            setPhase("gameOver");
            return;
          }
        }
      }

      /* ---- fighting logic ---- */
      if (gs.subPhase === "fighting") {
        gs.roundTimer -= dt / 60;
        if (gs.roundTimer <= 0) {
          gs.roundTimer = 0;
          endRound(gs);
        }

        // Player movement
        if (!gs.player.knockedOut) {
          const k = keysRef.current;
          if (k.has("a") || k.has("arrowleft")) gs.player.x -= 2.2 * dt;
          if (k.has("d") || k.has("arrowright")) gs.player.x += 2.2 * dt;
          gs.player.x = Math.max(50, Math.min(CANVAS_W - 50, gs.player.x));
        }

        // AI
        updateAI(gs.ai, gs.player, dt);

        // Physics
        updateFighter(gs.player, dt);
        updateFighter(gs.ai, dt);

        // Player hand tracking
        if (!gs.player.knockedOut && !gs.player.punchActive) {
          const torso = gs.player.points[TORSO];
          const rh = gs.player.points[R_HAND];
          const dx = mouseRef.current.x - torso.x;
          const dy = mouseRef.current.y - torso.y;
          const d = Math.hypot(dx, dy) || 1;
          const tx = torso.x + (dx / d) * 30;
          const ty = torso.y + (dy / d) * 18;
          rh.x += (tx - rh.x) * 0.18 * dt;
          rh.y += (ty - rh.y) * 0.18 * dt;
          const lh = gs.player.points[L_HAND];
          const ltx = torso.x - 16 * gs.player.facing;
          const lty = torso.y + 6;
          lh.x += (ltx - lh.x) * 0.12 * dt;
          lh.y += (lty - lh.y) * 0.12 * dt;
        }

        // AI hand guard
        if (!gs.ai.knockedOut && !gs.ai.punchActive) {
          const torso = gs.ai.points[TORSO];
          for (const [hi, off] of [[L_HAND, -16], [R_HAND, 16]] as const) {
            const h = gs.ai.points[hi];
            const tx = torso.x + off * gs.ai.facing;
            const ty = torso.y + 6;
            h.x += (tx - h.x) * 0.12 * dt;
            h.y += (ty - h.y) * 0.12 * dt;
          }
        }

        // Collision
        checkHit(gs.player, gs.ai, gs);
        checkHit(gs.ai, gs.player, gs);

        // KO check
        if (gs.player.hp <= 0 || gs.ai.hp <= 0) endRound(gs);
      } else {
        // Still update physics for KO fall
        updateFighter(gs.player, dt);
        updateFighter(gs.ai, dt);
      }

      // Decay hit effects
      gs.hitEffects = gs.hitEffects.filter(e => { e.life -= dt; return e.life > 0; });

      // Render
      render(ctx, gs);

      // UI sync
      if (ts - lastUiRef.current > 100) {
        lastUiRef.current = ts;
        setDisplay({
          round: gs.round, timer: Math.ceil(gs.roundTimer),
          pHP: Math.max(0, Math.floor(gs.player.hp)),
          aHP: Math.max(0, Math.floor(gs.ai.hp)),
          score: gs.score, kos: gs.kos,
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  /* ---- round end logic ---- */
  const endRound = (gs: GameState) => {
    if (gs.subPhase !== "fighting") return;
    if (gs.player.hp <= 0) {
      gs.player.knockedOut = true;
      gs.announceText = "被击倒!";
    } else if (gs.ai.hp <= 0) {
      gs.ai.knockedOut = true;
      gs.score += 5;
      gs.kos += 1;
      gs.announceText = "KO!";
    } else {
      gs.announceText = "时间到!";
    }
    gs.subPhase = "roundEnd";
    gs.announceTimer = 3;
  };

  /* ---- input handlers ---- */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    mouseRef.current.x = (e.clientX - r.left) * (CANVAS_W / r.width);
    mouseRef.current.y = (e.clientY - r.top) * (CANVAS_H / r.height);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) * (CANVAS_W / r.width);
    const y = (e.clientY - r.top) * (CANVAS_H / r.height);
    const gs = gsRef.current;
    if (gs.subPhase === "fighting") doPunch(gs.player, x, y);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const t = e.touches[0];
    const x = (t.clientX - r.left) * (CANVAS_W / r.width);
    const y = (t.clientY - r.top) * (CANVAS_H / r.height);
    touchRef.current = { startX: x, startY: y, x, y, t: Date.now() };
    mouseRef.current = { x, y };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const t = e.touches[0];
    const x = (t.clientX - r.left) * (CANVAS_W / r.width);
    const y = (t.clientY - r.top) * (CANVAS_H / r.height);
    if (touchRef.current) {
      const dx = x - touchRef.current.x;
      const gs = gsRef.current;
      if (gs.subPhase === "fighting" && !gs.player.knockedOut) {
        gs.player.x += dx * 0.6;
        gs.player.x = Math.max(50, Math.min(CANVAS_W - 50, gs.player.x));
      }
      touchRef.current.x = x;
      touchRef.current.y = y;
    }
    mouseRef.current = { x, y };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const tc = touchRef.current;
    if (tc) {
      const elapsed = Date.now() - tc.t;
      const dist = Math.hypot(tc.x - tc.startX, tc.y - tc.startY);
      if (elapsed < 200 && dist < 15) {
        const gs = gsRef.current;
        if (gs.subPhase === "fighting") doPunch(gs.player, tc.x, tc.y);
      }
      touchRef.current = null;
    }
  }, []);

  /* ---- start / restart ---- */
  const startGame = () => {
    gsRef.current = createGameState();
    setPhase("playing");
  };

  /* ---- stats ---- */
  const stats: GameStat[] = [
    { label: "得分", value: display.score, icon: "🥊" },
    { label: "回合", value: `${display.round}/3`, icon: "Round" },
    { label: "KO数", value: display.kos, icon: "💥" },
    { label: "玩家HP", value: display.pHP, icon: "❤️" },
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
      gameId="ragdoll-boxer"
      title="布偶拳击"
      iconEmoji="🥊"
      iconGradient="from-red-500 to-rose-700"
      stats={stats}
      shareScore={display.score}
      refreshKey={refreshKey}
    >
      <div className="relative">
        {/* START SCREEN */}
        {phase === "start" && (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="text-6xl">🥊</div>
            <h2 className="text-3xl font-bold text-white">布偶拳击</h2>
            <div className="max-w-md space-y-2 text-sm text-gray-400">
              <p>鼠标控制拳头方向，点击挥拳出击</p>
              <p>A / D 或 方向键 左右移动</p>
              <p>击中对手头部得 1 分，击倒对手 (HP=0) 获得 KO 胜利</p>
              <p>3 回合制，每回合 30 秒，KO 额外 +5 分</p>
              <p className="text-amber-400">按 P 键暂停</p>
            </div>
            <button
              onClick={startGame}
              aria-label="开始比赛"
              className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            >
              开始比赛
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
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="block w-full touch-none"
              style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
              aria-label="拳击游戏画布"
            />
            {/* PAUSE OVERLAY */}
            {phase === "paused" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/80 backdrop-blur-sm">
                <h3 className="text-3xl font-bold text-white">已暂停</h3>
                <div className="text-center text-gray-400">
                  <div>得分: {display.score} | KO: {display.kos}</div>
                  <div>第 {display.round} 回合 | 剩余 {display.timer}s</div>
                </div>
                <button
                  onClick={() => setPhase("playing")}
                  aria-label="继续比赛"
                  className="flex h-14 items-center justify-center rounded-2xl bg-indigo-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
                >
                  继续 (P)
                </button>
              </div>
            )}
          </>
        )}

        {/* GAME OVER */}
        {phase === "gameOver" && (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="text-6xl">{display.kos >= 2 ? "🏆" : "🥊"}</div>
            <h2 className="text-3xl font-bold text-white">比赛结束</h2>
            <div className="rounded-2xl bg-gray-800/60 px-8 py-4">
              <div className="text-sm text-gray-400">最终得分</div>
              <div className="text-5xl font-bold text-amber-400">{display.score}</div>
              <div className="mt-2 text-sm text-gray-400">KO 次数: {display.kos}</div>
            </div>
            <button
              onClick={startGame}
              aria-label="再战一局"
              className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            >
              再战一局
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
