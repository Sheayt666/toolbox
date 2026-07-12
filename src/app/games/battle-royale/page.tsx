"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Skull, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "battle-royale";
const CANVAS_W = 600;
const CANVAS_H = 600;
const BEST_SCORE_KEY = "gm_battle_royale_best";

const ARENA_W = 600;
const ARENA_H = 600;
const AI_COUNT = 10;
const PLAYER_SPEED = 2.8;
const BULLET_SPEED = 6;
const PLAYER_RADIUS = 12;
const SHOOT_COOLDOWN = 18; // frames
const ZONE_SHRINK_DELAY = 300; // frames before shrink starts
const ZONE_SHRINK_RATE = 0.25; // pixels per frame
const ZONE_MIN_RADIUS = 60;
const ZONE_DAMAGE = 0.4; // per frame outside zone
const PLAYER_HP = 100;

interface Vec {
  x: number;
  y: number;
}

interface Entity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  alive: boolean;
  isPlayer: boolean;
  name: string;
  color: string;
  angle: number;
  shootCooldown: number;
  kills: number;
  aiState: "wander" | "chase" | "flee";
  aiTimer: number;
  aiTarget: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: number;
  life: number;
  isPlayer: boolean;
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

const AI_NAMES = [
  "暗影",
  "猎手",
  "幽灵",
  "狂战",
  "刺客",
  "游侠",
  "盾卫",
  "狙击",
  "斗士",
  "猎鹰",
];

const AI_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#14b8a6",
];

let nextBulletId = 1;

interface DPadButtonProps {
  label: string;
  ariaLabel: string;
  onPress: () => void;
  onRelease: () => void;
}

function DPadButton({ label, ariaLabel, onPress, onRelease }: DPadButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onContextMenu={(e) => e.preventDefault()}
      onTouchStart={(e) => {
        e.preventDefault();
        onPress();
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        onRelease();
      }}
      onTouchCancel={onRelease}
      onMouseDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      onMouseUp={onRelease}
      onMouseLeave={onRelease}
      className="select-none touch-none flex items-center justify-center w-16 h-16 rounded-xl bg-[#27272a] border border-[#3f3f46] text-[#8b5cf6] text-2xl font-bold active:bg-[#8b5cf6] active:text-white active:border-[#8b5cf6] transition-colors shadow-md"
    >
      {label}
    </button>
  );
}

export default function BattleRoyalePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const lastScoreSyncedRef = useRef(0);
  const bestRef = useRef(0);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef<Vec>({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
  const shootingRef = useRef(false);
  const zoneRef = useRef({
    cx: ARENA_W / 2,
    cy: ARENA_H / 2,
    radius: Math.min(ARENA_W, ARENA_H) / 2,
    nextCx: ARENA_W / 2,
    nextCy: ARENA_H / 2,
    nextRadius: Math.min(ARENA_W, ARENA_H) / 2,
    shrinkTimer: 0,
    phase: 0,
  });
  const survivalTimeRef = useRef(0);

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
  const [aliveCount, setAliveCount] = useState(0);
  const [killCount, setKillCount] = useState(0);
  const [hp, setHp] = useState(PLAYER_HP);
  const [mounted, setMounted] = useState(false);

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number) => {
      const particles = particlesRef.current;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 15 + Math.random() * 20,
          maxLife: 35,
          color,
          size: 1.5 + Math.random() * 3,
        });
      }
    },
    [],
  );

  const initGame = useCallback(() => {
    const entities: Entity[] = [];
    // Player at center
    entities.push({
      id: 0,
      x: ARENA_W / 2,
      y: ARENA_H / 2,
      vx: 0,
      vy: 0,
      hp: PLAYER_HP,
      maxHp: PLAYER_HP,
      alive: true,
      isPlayer: true,
      name: "你",
      color: "#f43f5e",
      angle: 0,
      shootCooldown: 0,
      kills: 0,
      aiState: "wander",
      aiTimer: 0,
      aiTarget: -1,
    });

    // AI entities spread around
    for (let i = 0; i < AI_COUNT; i++) {
      const ang = (i / AI_COUNT) * Math.PI * 2;
      const r = 150 + Math.random() * 100;
      entities.push({
        id: i + 1,
        x: ARENA_W / 2 + Math.cos(ang) * r,
        y: ARENA_H / 2 + Math.sin(ang) * r,
        vx: 0,
        vy: 0,
        hp: PLAYER_HP,
        maxHp: PLAYER_HP,
        alive: true,
        isPlayer: false,
        name: AI_NAMES[i % AI_NAMES.length],
        color: AI_COLORS[i % AI_COLORS.length],
        angle: Math.random() * Math.PI * 2,
        shootCooldown: Math.floor(Math.random() * 30),
        kills: 0,
        aiState: "wander",
        aiTimer: Math.floor(Math.random() * 60),
        aiTarget: -1,
      });
    }
    entitiesRef.current = entities;
    bulletsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    lastScoreSyncedRef.current = 0;
    survivalTimeRef.current = 0;
    zoneRef.current = {
      cx: ARENA_W / 2,
      cy: ARENA_H / 2,
      radius: Math.min(ARENA_W, ARENA_H) / 2,
      nextCx: ARENA_W / 2,
      nextCy: ARENA_H / 2,
      nextRadius: Math.min(ARENA_W, ARENA_H) / 2,
      shrinkTimer: 0,
      phase: 0,
    };
    nextBulletId = 1;
    setKillCount(0);
    setHp(PLAYER_HP);
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
    const r = submitScore(GAME_ID, s, `${s} 分`);
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

  const shoot = useCallback(
    (entity: Entity) => {
      if (entity.shootCooldown > 0) return;
      entity.shootCooldown = SHOOT_COOLDOWN;
      bulletsRef.current.push({
        id: nextBulletId++,
        x: entity.x + Math.cos(entity.angle) * PLAYER_RADIUS,
        y: entity.y + Math.sin(entity.angle) * PLAYER_RADIUS,
        vx: Math.cos(entity.angle) * BULLET_SPEED,
        vy: Math.sin(entity.angle) * BULLET_SPEED,
        ownerId: entity.id,
        life: 120,
        isPlayer: entity.isPlayer,
      });
      // Muzzle flash
      spawnParticles(
        entity.x + Math.cos(entity.angle) * PLAYER_RADIUS,
        entity.y + Math.sin(entity.angle) * PLAYER_RADIUS,
        "#fbbf24",
        3,
      );
    },
    [spawnParticles],
  );

  const stepAI = useCallback(
    (entity: Entity, dt: number) => {
      const entities = entitiesRef.current;
      const zone = zoneRef.current;
      entity.aiTimer -= dt;
      if (entity.aiTimer <= 0) {
        entity.aiTimer = 30 + Math.random() * 40;
        // Re-evaluate state
        // Check if outside zone
        const dZone = Math.sqrt(dist2(entity.x, entity.y, zone.cx, zone.cy));
        if (dZone > zone.radius - 40) {
          entity.aiState = "flee";
        } else {
          // Find nearest enemy
          let nearest: Entity | null = null;
          let nearestD = 250 * 250;
          for (const other of entities) {
            if (other.id === entity.id || !other.alive) continue;
            const d = dist2(entity.x, entity.y, other.x, other.y);
            if (d < nearestD) {
              nearestD = d;
              nearest = other;
            }
          }
          if (nearest) {
            entity.aiState = "chase";
            entity.aiTarget = nearest.id;
          } else {
            entity.aiState = "wander";
          }
        }
      }

      // Move based on state
      let tx = entity.x;
      let ty = entity.y;
      if (entity.aiState === "flee") {
        // Move toward zone center
        tx = zone.cx;
        ty = zone.cy;
      } else if (entity.aiState === "chase" && entity.aiTarget >= 0) {
        const target = entities[entity.aiTarget];
        if (target && target.alive) {
          tx = target.x;
          ty = target.y;
          // Aim at target
          entity.angle = Math.atan2(target.y - entity.y, target.x - entity.x);
          // Shoot if in range and cooldown ready
          const d = Math.sqrt(dist2(entity.x, entity.y, target.x, target.y));
          if (d < 200 && entity.shootCooldown <= 0) {
            shoot(entity);
          }
        } else {
          entity.aiState = "wander";
        }
      } else {
        // Wander toward zone center area
        tx = zone.cx + (Math.random() - 0.5) * zone.radius;
        ty = zone.cy + (Math.random() - 0.5) * zone.radius;
      }

      const dx = tx - entity.x;
      const dy = ty - entity.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 5) {
        const speed = PLAYER_SPEED * 0.85;
        entity.vx = (dx / d) * speed;
        entity.vy = (dy / d) * speed;
      } else {
        entity.vx = 0;
        entity.vy = 0;
      }

      // Avoid other entities (simple separation)
      for (const other of entities) {
        if (other.id === entity.id || !other.alive) continue;
        const od = dist2(entity.x, entity.y, other.x, other.y);
        if (od < (PLAYER_RADIUS * 3) ** 2 && od > 0) {
          const d2 = Math.sqrt(od);
          entity.vx -= ((other.x - entity.x) / d2) * 0.5;
          entity.vy -= ((other.y - entity.y) / d2) * 0.5;
        }
      }
    },
    [shoot],
  );

  const stepPhysics = useCallback(
    (dt: number) => {
      const entities = entitiesRef.current;
      const bullets = bulletsRef.current;
      const particles = particlesRef.current;
      const zone = zoneRef.current;

      survivalTimeRef.current += dt;

      // Zone shrinking
      if (survivalTimeRef.current > ZONE_SHRINK_DELAY) {
        zone.shrinkTimer += dt;
        if (zone.radius > ZONE_MIN_RADIUS) {
          zone.radius -= ZONE_SHRINK_RATE * dt;
          if (zone.radius < ZONE_MIN_RADIUS) zone.radius = ZONE_MIN_RADIUS;
        }
        // Occasionally recenter
        if (zone.shrinkTimer > 600 && zone.phase < 3) {
          zone.shrinkTimer = 0;
          zone.phase++;
          zone.nextCx = ARENA_W / 2 + (Math.random() - 0.5) * 100;
          zone.nextCy = ARENA_H / 2 + (Math.random() - 0.5) * 100;
        }
        zone.cx += (zone.nextCx - zone.cx) * 0.005 * dt;
        zone.cy += (zone.nextCy - zone.cy) * 0.005 * dt;
      }

      // Player movement
      const player = entities[0];
      if (player.alive) {
        let mx = 0;
        let my = 0;
        if (keysRef.current.has("w") || keysRef.current.has("arrowup")) my -= 1;
        if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) my += 1;
        if (keysRef.current.has("a") || keysRef.current.has("arrowleft")) mx -= 1;
        if (keysRef.current.has("d") || keysRef.current.has("arrowright")) mx += 1;
        const len = Math.sqrt(mx * mx + my * my);
        if (len > 0) {
          mx /= len;
          my /= len;
        }
        player.vx = mx * PLAYER_SPEED;
        player.vy = my * PLAYER_SPEED;

        // Aim at mouse
        player.angle = Math.atan2(
          mouseRef.current.y - player.y,
          mouseRef.current.x - player.x,
        );

        // Shoot
        if (shootingRef.current) {
          shoot(player);
        }
      }

      // Move entities
      for (const e of entities) {
        if (!e.alive) continue;
        if (!e.isPlayer) {
          stepAI(e, dt);
        }
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.x = clamp(e.x, PLAYER_RADIUS, ARENA_W - PLAYER_RADIUS);
        e.y = clamp(e.y, PLAYER_RADIUS, ARENA_H - PLAYER_RADIUS);
        if (e.shootCooldown > 0) e.shootCooldown -= dt;

        // Zone damage
        const dZone = Math.sqrt(dist2(e.x, e.y, zone.cx, zone.cy));
        if (dZone > zone.radius) {
          e.hp -= ZONE_DAMAGE * dt;
          if (e.hp <= 0) {
            e.alive = false;
            spawnParticles(e.x, e.y, e.color, 25);
          }
        }
      }

      // Move bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        if (b.life <= 0 || b.x < 0 || b.x > ARENA_W || b.y < 0 || b.y > ARENA_H) {
          bullets.splice(i, 1);
          continue;
        }
        // Check hits
        for (const e of entities) {
          if (!e.alive || e.id === b.ownerId) continue;
          if (dist2(b.x, b.y, e.x, e.y) < PLAYER_RADIUS ** 2) {
            e.hp -= 20;
            spawnParticles(b.x, b.y, "#fbbf24", 6);
            if (e.hp <= 0) {
              e.alive = false;
              spawnParticles(e.x, e.y, e.color, 25);
              // Award kill
              const shooter = entities[b.ownerId];
              if (shooter) {
                shooter.kills++;
                if (shooter.isPlayer) {
                  scoreRef.current += 50;
                  setKillCount(shooter.kills);
                }
              }
            }
            bullets.splice(i, 1);
            break;
          }
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Count alive
      let alive = 0;
      for (const e of entities) if (e.alive) alive++;
      setAliveCount(alive);

      // Update player HP display
      if (player.alive) {
        setHp(Math.max(0, Math.round(player.hp)));
      }

      // Score = kills * 50 + survival time
      const survivalScore = Math.floor(survivalTimeRef.current / 6);
      scoreRef.current = Math.max(scoreRef.current, survivalScore);
      if (player.alive && alive === 1) {
        // Victory!
        scoreRef.current += 100;
        gameOverRef.current();
      }

      // Sync score
      if (scoreRef.current !== lastScoreSyncedRef.current) {
        lastScoreSyncedRef.current = scoreRef.current;
        setScore(scoreRef.current);
      }

      // Check player death
      if (!player.alive) {
        gameOverRef.current();
      }
    },
    [stepAI, shoot, spawnParticles],
  );

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    animFrameRef.current++;
    const t = animFrameRef.current;

    const entities = entitiesRef.current;
    const bullets = bulletsRef.current;
    const particles = particlesRef.current;
    const zone = zoneRef.current;

    // Background
    ctx.fillStyle = "#0c0a09";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Grid
    const gridSize = 40;
    ctx.strokeStyle = "rgba(244,63,94,0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < cv.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cv.height);
    }
    for (let y = 0; y < cv.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(cv.width, y);
    }
    ctx.stroke();

    // Safe zone (lighter area)
    ctx.save();
    ctx.beginPath();
    ctx.arc(zone.cx, zone.cy, zone.radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(244,63,94,0.03)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.restore();

    // Danger zone (outside safe zone) - red tint
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, cv.width, cv.height);
    ctx.arc(zone.cx, zone.cy, zone.radius, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.fillStyle = "rgba(239,68,68,0.12)";
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.restore();

    // Zone border (pulsing)
    const pulse = 0.5 + 0.3 * Math.sin(t * 0.05);
    ctx.strokeStyle = `rgba(239,68,68,${pulse})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.arc(zone.cx, zone.cy, zone.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Particles (behind entities)
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Bullets
    for (const b of bullets) {
      ctx.shadowColor = b.isPlayer ? "#fbbf24" : "#ef4444";
      ctx.shadowBlur = 8;
      ctx.fillStyle = b.isPlayer ? "#fde047" : "#fca5a5";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.strokeStyle = b.isPlayer ? "rgba(253,224,71,0.4)" : "rgba(252,165,165,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 2, b.y - b.vy * 2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Entities
    for (const e of entities) {
      if (!e.alive) continue;
      // Glow
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 10;

      // Body
      const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, PLAYER_RADIUS);
      grad.addColorStop(0, e.color);
      grad.addColorStop(0.7, e.color);
      grad.addColorStop(1, `${e.color}66`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(e.x, e.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gun direction
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(
        e.x + Math.cos(e.angle) * (PLAYER_RADIUS + 6),
        e.y + Math.sin(e.angle) * (PLAYER_RADIUS + 6),
      );
      ctx.stroke();

      // HP bar
      const hpPct = e.hp / e.maxHp;
      const barW = 24;
      const barH = 3;
      const barX = e.x - barW / 2;
      const barY = e.y - PLAYER_RADIUS - 8;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#eab308" : "#ef4444";
      ctx.fillRect(barX, barY, barW * hpPct, barH);

      // Name for player
      if (e.isPlayer) {
        ctx.fillStyle = "#fda4af";
        ctx.font = "bold 10px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("你", e.x, e.y - PLAYER_RADIUS - 12);
      }

      // Kills badge
      if (e.kills > 0) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.arc(e.x + PLAYER_RADIUS - 2, e.y - PLAYER_RADIUS + 2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 9px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.fillText(String(e.kills), e.x + PLAYER_RADIUS - 2, e.y - PLAYER_RADIUS + 5);
      }
    }

    // Player HP bar (big, bottom)
    const player = entities[0];
    if (player.alive) {
      const bw = 200;
      const bh = 10;
      const bx = (cv.width - bw) / 2;
      const by = cv.height - 25;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(bx - 2, by - 2, bw + 4, bh + 4);
      const hpPct = player.hp / player.maxHp;
      const hpColor = hpPct > 0.5 ? "#22c55e" : hpPct > 0.25 ? "#eab308" : "#ef4444";
      ctx.fillStyle = hpColor;
      ctx.fillRect(bx, by, bw * hpPct, bh);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px ui-sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`HP ${Math.round(player.hp)}`, cv.width / 2, by + 8);
    }

    // Alive counter (top)
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(5, 5, 80, 24);
    ctx.fillStyle = "#fda4af";
    ctx.font = "bold 13px ui-sans-serif, system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`存活: ${aliveCount}`, 12, 22);
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

  // Mount detection (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    initGame();
    runningRef.current = true;
    pausedRef.current = false;
    setRunning(true);
    setPaused(false);
    setScore(0);
    setAliveCount(AI_COUNT + 1);
    setKillCount(0);
    setHp(PLAYER_HP);
  }, [initGame]);

  const pause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  const restart = useCallback(() => {
    submittedRef.current = false;
    overRef.current = false;
    setOver(false);
    setResult(null);
    setRunning(false);
    setPaused(false);
    runningRef.current = false;
    pausedRef.current = false;
    keysRef.current.clear();
    initGame();
    setScore(0);
  }, [initGame]);

  // Mouse controls
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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-500 text-sm animate-pulse">加载中...</div>
      </div>
    );
  }

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "最高记录", value: best },
    { label: "击杀", value: killCount },
    { label: "存活", value: aliveCount },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="生存竞技场"
      description="大逃杀风格的自上而下竞技场！用 WASD 移动，鼠标瞄准射击，在不断缩小的安全区内与 10 个 AI 对手战斗。活到最后就是胜利！"
      instructions={`使用 WASD 或方向键移动角色。
鼠标控制瞄准方向，点击或按住鼠标射击。
安全区（虚线圆圈）会随时间不断缩小。
在安全区外会持续受到伤害。
击杀敌人得 50 分，存活时间也会累计分数。
最后一人存活获得额外 100 分胜利奖励。
注意管理你的 HP，血量归零即淘汰。`}
      icon={Skull}
      iconEmoji="💀"
      iconGradient="from-red-500 to-rose-700"
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
              shootingRef.current = true;
            }}
            onMouseUp={() => {
              shootingRef.current = false;
            }}
            onMouseLeave={() => {
              shootingRef.current = false;
            }}
            onTouchStart={(e) => {
              if (e.touches[0]) {
                updateMouse(e.touches[0].clientX, e.touches[0].clientY);
                shootingRef.current = true;
              }
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                updateMouse(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
              }
            }}
            onTouchEnd={() => {
              shootingRef.current = false;
            }}
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-red-500/10 cursor-crosshair"
          />

          {/* Start overlay */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                WASD 移动 · 鼠标瞄准射击
                <br />
                在缩小的安全区内活到最后
              </p>
            </div>
          )}

          {/* Pause overlay */}
          {paused && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <h3 className="text-xl font-bold mb-4">已暂停</h3>
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            </div>
          )}

          {/* Game over overlay */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">
                {aliveCount === 1 && entitiesRef.current[0]?.alive ? "🏆" : "💀"}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {aliveCount === 1 && entitiesRef.current[0]?.alive ? "大吉大利！" : "已被淘汰"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">最终分数</p>
              <p className="text-4xl font-bold text-red-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-1">击杀: {killCount} · 存活: {aliveCount}人</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-red-400 font-bold">{result.rank}</span>/{result.total}，超越了{" "}
                  <span className="text-red-400 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* Mobile D-pad controls */}
        <div className="md:hidden mt-5 flex flex-col items-center select-none">
          <p className="text-xs text-slate-500 mb-2">移动控制</p>
          <div className="grid grid-cols-3 grid-rows-3 gap-2">
            <span />
            <DPadButton
              label="↑"
              ariaLabel="向上移动"
              onPress={() => keysRef.current.add("w")}
              onRelease={() => keysRef.current.delete("w")}
            />
            <span />
            <DPadButton
              label="←"
              ariaLabel="向左移动"
              onPress={() => keysRef.current.add("a")}
              onRelease={() => keysRef.current.delete("a")}
            />
            <span className="flex items-center justify-center w-16 h-16">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3f3f46]" />
            </span>
            <DPadButton
              label="→"
              ariaLabel="向右移动"
              onPress={() => keysRef.current.add("d")}
              onRelease={() => keysRef.current.delete("d")}
            />
            <span />
            <DPadButton
              label="↓"
              ariaLabel="向下移动"
              onPress={() => keysRef.current.add("s")}
              onRelease={() => keysRef.current.delete("s")}
            />
            <span />
          </div>
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
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-500/30"
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

        {/* HP bar */}
        {running && !over && (
          <div className="mt-4 w-full max-w-[600px]">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>HP</span>
              <span className="tabular-nums">{hp}/100</span>
            </div>
            <div className="h-3 bg-[#27272a] rounded-full overflow-hidden border border-[#3f3f46]">
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{
                  width: `${hp}%`,
                  background:
                    hp > 50
                      ? "linear-gradient(90deg, #22c55e, #4ade80)"
                      : hp > 25
                        ? "linear-gradient(90deg, #eab308, #facc15)"
                        : "linear-gradient(90deg, #ef4444, #f87171)",
                }}
              />
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-5 w-full max-w-[600px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 text-center">
            提示：待在安全区内 · 击杀得 50 分 · 存活时间累计分数 · 最后存活 +100 分
          </p>
        </div>
      </div>
    </GameShell>
  );
}
