"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */
const CANVAS_W = 700;
const CANVAS_H = 500;

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
interface Player {
  x: number; y: number;
  hp: number; maxHp: number;
  level: number; xp: number; xpNext: number;
  damage: number;
  attackSpeed: number;
  attackCooldown: number;
  moveSpeed: number;
  projectiles: number;
  pierce: number;
  range: number;
  invuln: number;
  damageFlash: number;
  facing: number;
}
interface Enemy {
  id: number;
  x: number; y: number;
  hp: number; maxHp: number;
  damage: number;
  speed: number;
  radius: number;
  xp: number;
  type: "normal" | "fast" | "tank" | "boss";
  color: string;
  hitFlash: number;
  spawnAnim: number;
}
interface Projectile {
  x: number; y: number;
  vx: number; vy: number;
  damage: number;
  pierce: number;
  life: number;
  hitIds: Set<number>;
}
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string;
  size: number;
}
interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  particles: Particle[];
  wave: number;
  waveTimer: number;
  spawnTimer: number;
  gameTime: number;
  kills: number;
  enemyIdCounter: number;
}
interface Skill {
  id: string;
  name: string;
  desc: string;
  icon: string;
  apply: (p: Player) => void;
}

/* ================================================================== */
/*  Skills                                                             */
/* ================================================================== */
const ALL_SKILLS: Skill[] = [
  { id: "damage",     name: "攻击力+",  desc: "伤害 +5",      icon: "⚔️", apply: p => { p.damage += 5; } },
  { id: "atkSpeed",   name: "攻速+",    desc: "攻速 +0.4/s",  icon: "⚡", apply: p => { p.attackSpeed += 0.4; } },
  { id: "moveSpeed",  name: "移速+",    desc: "移速 +0.6",    icon: "👟", apply: p => { p.moveSpeed += 0.6; } },
  { id: "multiShot",  name: "多发射",   desc: "弹幕 +1",      icon: "🌟", apply: p => { p.projectiles += 1; } },
  { id: "pierce",     name: "穿透",     desc: "穿透 +1",      icon: "🎯", apply: p => { p.pierce += 1; } },
  { id: "range",      name: "范围+",    desc: "射程 +50",     icon: "📏", apply: p => { p.range += 50; } },
  { id: "maxHp",      name: "生命+",    desc: "上限 +20",     icon: "❤️", apply: p => { p.maxHp += 20; p.hp += 20; } },
];

function getRandomSkills(n: number): Skill[] {
  const shuffled = [...ALL_SKILLS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/* ================================================================== */
/*  Factory                                                            */
/* ================================================================== */
function createPlayer(): Player {
  return {
    x: CANVAS_W / 2, y: CANVAS_H / 2,
    hp: 100, maxHp: 100,
    level: 1, xp: 0, xpNext: 5,
    damage: 10, attackSpeed: 1.5, attackCooldown: 0,
    moveSpeed: 3, projectiles: 1, pierce: 0, range: 200,
    invuln: 0, damageFlash: 0, facing: 0,
  };
}

function createGameState(): GameState {
  return {
    player: createPlayer(),
    enemies: [], projectiles: [], particles: [],
    wave: 1, waveTimer: 0, spawnTimer: 0,
    gameTime: 0, kills: 0, enemyIdCounter: 0,
  };
}

function getSpawnPos(): { x: number; y: number } {
  const angle = Math.random() * Math.PI * 2;
  const dist = Math.max(CANVAS_W, CANVAS_H) * 0.65;
  return {
    x: CANVAS_W / 2 + Math.cos(angle) * dist,
    y: CANVAS_H / 2 + Math.sin(angle) * dist,
  };
}

function spawnEnemy(gs: GameState) {
  const pos = getSpawnPos();
  const w = gs.wave;
  const r = Math.random();
  let type: Enemy["type"] = "normal";
  if (w >= 3 && r < 0.15) type = "tank";
  else if (w >= 2 && r < 0.4) type = "fast";

  let hp = 10 + w * 3, speed = 1 + w * 0.04, damage = 5, radius = 10, xp = 1, color = "#22c55e";
  if (type === "fast")  { hp = 5 + w * 2;  speed = 1.8 + w * 0.04; damage = 3;  radius = 7;  color = "#eab308"; }
  if (type === "tank")  { hp = 30 + w * 8;  speed = 0.6 + w * 0.02; damage = 10; radius = 14; xp = 3;  color = "#ef4444"; }

  gs.enemies.push({
    id: gs.enemyIdCounter++, x: pos.x, y: pos.y,
    hp, maxHp: hp, damage, speed: Math.min(speed, 3.5),
    radius, xp, type, color, hitFlash: 0, spawnAnim: 15,
  });
}

function spawnBoss(gs: GameState) {
  const pos = getSpawnPos();
  const hp = 80 + gs.wave * 20;
  gs.enemies.push({
    id: gs.enemyIdCounter++, x: pos.x, y: pos.y,
    hp, maxHp: hp, damage: 20, speed: 0.7,
    radius: 25, xp: 20, type: "boss", color: "#a855f7",
    hitFlash: 0, spawnAnim: 30,
  });
}

/* ================================================================== */
/*  Combat                                                             */
/* ================================================================== */
function fireProjectiles(gs: GameState) {
  const p = gs.player;
  let nearest: Enemy | null = null;
  let minD = Infinity;
  for (const e of gs.enemies) {
    const d = Math.hypot(e.x - p.x, e.y - p.y);
    if (d < minD) { minD = d; nearest = e; }
  }
  if (!nearest) return;

  const dx = nearest.x - p.x;
  const dy = nearest.y - p.y;
  const baseAngle = Math.atan2(dy, dx);
  p.facing = baseAngle;

  const n = p.projectiles;
  const spread = 0.18;
  const start = baseAngle - spread * (n - 1) / 2;
  const projSpeed = 7;

  for (let i = 0; i < n; i++) {
    const a = start + spread * i;
    gs.projectiles.push({
      x: p.x, y: p.y,
      vx: Math.cos(a) * projSpeed,
      vy: Math.sin(a) * projSpeed,
      damage: p.damage, pierce: p.pierce,
      life: p.range, hitIds: new Set(),
    });
  }
  p.attackCooldown = 1 / p.attackSpeed;
}

function addParticles(gs: GameState, x: number, y: number, color: string, count: number, speed: number) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * speed;
    gs.particles.push({
      x, y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 15 + Math.random() * 10, maxLife: 25,
      color, size: 2 + Math.random() * 3,
    });
  }
}

/* ================================================================== */
/*  Rendering                                                          */
/* ================================================================== */
function render(ctx: CanvasRenderingContext2D, gs: GameState, joystick: { active: boolean; baseX: number; baseY: number; x: number; y: number }) {
  // Background
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Grid
  ctx.strokeStyle = "rgba(55,65,81,0.3)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= CANVAS_W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_H); ctx.stroke();
  }
  for (let y = 0; y <= CANVAS_H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_W, y); ctx.stroke();
  }

  // Particles (under entities)
  for (const p of gs.particles) {
    const a = p.life / p.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Enemies
  for (const e of gs.enemies) {
    const scale = e.spawnAnim > 0 ? 1 - e.spawnAnim / 30 : 1;
    const r = e.radius * scale;
    // Boss aura
    if (e.type === "boss") {
      ctx.fillStyle = "rgba(168,85,247,0.15)";
      ctx.beginPath();
      ctx.arc(e.x, e.y, r + 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = e.hitFlash > 0 ? "#fff" : e.color;
    ctx.beginPath();
    ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = e.type === "boss" ? "#c084fc" : "rgba(255,255,255,0.3)";
    ctx.lineWidth = e.type === "boss" ? 3 : 1.5;
    ctx.stroke();

    // HP bar for tank/boss
    if (e.maxHp > 20) {
      const bw = e.radius * 2;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw, 4);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(e.x - bw / 2, e.y - e.radius - 8, bw * (e.hp / e.maxHp), 4);
    }
  }

  // Projectiles
  for (const proj of gs.projectiles) {
    // Trail
    ctx.fillStyle = "rgba(34,211,238,0.3)";
    ctx.beginPath();
    ctx.arc(proj.x - proj.vx * 0.5, proj.y - proj.vy * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();
    // Core
    ctx.fillStyle = "#67e8f9";
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  const p = gs.player;
  // Damage flash
  if (p.damageFlash > 0) {
    ctx.fillStyle = `rgba(239,68,68,${p.damageFlash / 10 * 0.3})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  // Body
  ctx.fillStyle = p.invuln > 0 && Math.floor(p.invuln / 3) % 2 === 0 ? "#93c5fd" : "#3b82f6";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  // Facing indicator
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.facing) * 8, p.y + Math.sin(p.facing) * 8, 3, 0, Math.PI * 2);
  ctx.fill();

  // HUD
  // HP bar
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(10, 10, 200, 8);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(10, 10, 200 * Math.max(0, p.hp / p.maxHp), 8);
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, 200, 8);
  // XP bar
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(10, 22, 200, 5);
  ctx.fillStyle = "#a855f7";
  ctx.fillRect(10, 22, 200 * (p.xp / p.xpNext), 5);
  // Level
  ctx.fillStyle = "#fff";
  ctx.font = "bold 11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Lv ${p.level}`, 10, 42);

  // Wave / time / kills
  ctx.textAlign = "right";
  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px sans-serif";
  const mins = Math.floor(gs.gameTime / 60);
  const secs = Math.floor(gs.gameTime % 60);
  ctx.fillText(`波次 ${gs.wave}  时间 ${mins}:${secs.toString().padStart(2, "0")}  击杀 ${gs.kills}`, CANVAS_W - 10, 20);

  // Wave announcement
  if (gs.waveTimer < 2 && gs.gameTime > 1) {
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    const text = gs.wave % 5 === 0 ? `第 ${gs.wave} 波 - Boss!` : `第 ${gs.wave} 波`;
    ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2 - 60);
  }

  // Joystick
  if (joystick.active) {
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, 45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.arc(joystick.x, joystick.y, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */
export default function BugSurvivorPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"start" | "playing" | "paused" | "gameOver">("start");
  const [display, setDisplay] = useState({ time: 0, kills: 0, wave: 1, level: 1, hp: 100, maxHp: 100 });
  const [levelUpChoices, setLevelUpChoices] = useState<Skill[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastUiRef = useRef(0);
  const gsRef = useRef<GameState>(createGameState());
  const keysRef = useRef<Set<string>>(new Set());
  const joystickRef = useRef({ active: false, baseX: 0, baseY: 0, x: 0, y: 0, dx: 0, dy: 0 });
  const levelUpPausedRef = useRef(false);
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
      if (canvas) ctxRef.current = canvas.getContext("2d");
    }
  }, [mounted]);

  /* ---- keyboard ---- */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current.add(k);
      if (k === "p") {
        if (phaseRef.current === "playing" && !levelUpPausedRef.current) setPhase("paused");
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
      const p = gs.player;
      const joy = joystickRef.current;
      const paused = levelUpPausedRef.current;

      if (!paused) {
        gs.gameTime += dt / 60;

        /* --- Player movement --- */
        let dx = 0, dy = 0;
        const k = keysRef.current;
        if (k.has("w") || k.has("arrowup")) dy -= 1;
        if (k.has("s") || k.has("arrowdown")) dy += 1;
        if (k.has("a") || k.has("arrowleft")) dx -= 1;
        if (k.has("d") || k.has("arrowright")) dx += 1;
        if (joy.active && (joy.dx !== 0 || joy.dy !== 0)) { dx = joy.dx; dy = joy.dy; }
        const len = Math.hypot(dx, dy);
        if (len > 0) {
          dx /= len; dy /= len;
          p.x += dx * p.moveSpeed * dt;
          p.y += dy * p.moveSpeed * dt;
        }
        p.x = Math.max(15, Math.min(CANVAS_W - 15, p.x));
        p.y = Math.max(15, Math.min(CANVAS_H - 15, p.y));

        /* --- Attack --- */
        if (p.attackCooldown > 0) p.attackCooldown -= dt / 60;
        if (p.attackCooldown <= 0 && gs.enemies.length > 0) {
          fireProjectiles(gs);
        }

        /* --- Projectiles --- */
        for (let i = gs.projectiles.length - 1; i >= 0; i--) {
          const proj = gs.projectiles[i];
          const md = Math.hypot(proj.vx, proj.vy) * dt;
          proj.x += proj.vx * dt;
          proj.y += proj.vy * dt;
          proj.life -= md;

          for (let j = gs.enemies.length - 1; j >= 0; j--) {
            const e = gs.enemies[j];
            if (proj.hitIds.has(e.id)) continue;
            if (Math.hypot(e.x - proj.x, e.y - proj.y) < e.radius + 4) {
              e.hp -= proj.damage;
              e.hitFlash = 5;
              proj.hitIds.add(e.id);
              addParticles(gs, proj.x, proj.y, e.color, 3, 3);

              if (e.hp <= 0) {
                p.xp += e.xp;
                gs.kills++;
                addParticles(gs, e.x, e.y, e.color, 8, 5);
                gs.enemies.splice(j, 1);
              }

              if (proj.pierce <= 0) {
                gs.projectiles.splice(i, 1);
                break;
              }
              proj.pierce--;
            }
          }

          if (gs.projectiles[i] && (proj.life <= 0 || proj.x < -10 || proj.x > CANVAS_W + 10 || proj.y < -10 || proj.y > CANVAS_H + 10)) {
            gs.projectiles.splice(i, 1);
          }
        }

        /* --- Enemies --- */
        for (const e of gs.enemies) {
          if (e.hitFlash > 0) e.hitFlash -= dt;
          if (e.spawnAnim > 0) e.spawnAnim -= dt;
          const ex = p.x - e.x;
          const ey = p.y - e.y;
          const ed = Math.hypot(ex, ey) || 1;
          e.x += (ex / ed) * e.speed * dt;
          e.y += (ey / ed) * e.speed * dt;

          // Collision with player
          if (ed < e.radius + 12 && p.invuln <= 0) {
            p.hp -= e.damage;
            p.invuln = 40;
            p.damageFlash = 10;
            // Knockback
            p.x += (ex / ed) * 8;
            p.y += (ey / ed) * 8;
          }
        }

        if (p.invuln > 0) p.invuln -= dt;
        if (p.damageFlash > 0) p.damageFlash -= dt;

        /* --- Waves & spawning --- */
        gs.waveTimer += dt / 60;
        if (gs.waveTimer >= 25) {
          gs.waveTimer = 0;
          gs.wave++;
          if (gs.wave % 5 === 0) spawnBoss(gs);
        }
        gs.spawnTimer -= dt / 60;
        if (gs.spawnTimer <= 0) {
          gs.spawnTimer = Math.max(0.3, 1.8 - gs.wave * 0.08);
          const count = 1 + Math.floor(gs.wave / 3);
          for (let i = 0; i < count; i++) spawnEnemy(gs);
        }

        /* --- Level up --- */
        if (p.xp >= p.xpNext) {
          p.xp -= p.xpNext;
          p.level++;
          p.xpNext = 5 + p.level * 4;
          levelUpPausedRef.current = true;
          setLevelUpChoices(getRandomSkills(3));
        }

        /* --- Particles --- */
        for (const part of gs.particles) {
          part.x += part.vx * dt;
          part.y += part.vy * dt;
          part.vx *= 0.92;
          part.vy *= 0.92;
          part.life -= dt;
        }
        gs.particles = gs.particles.filter(pp => pp.life > 0);

        /* --- Game over --- */
        if (p.hp <= 0) {
          submitScore("bug-survivor", Math.floor(gs.gameTime) + gs.kills * 5);
          setRefreshKey(k => k + 1);
          setPhase("gameOver");
          return;
        }
      }

      /* --- Render --- */
      render(ctx, gs, joystickRef.current);

      /* --- UI sync --- */
      if (ts - lastUiRef.current > 100) {
        lastUiRef.current = ts;
        setDisplay({
          time: Math.floor(gs.gameTime),
          kills: gs.kills,
          wave: gs.wave,
          level: p.level,
          hp: Math.max(0, Math.floor(p.hp)),
          maxHp: p.maxHp,
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  /* ---- touch handlers (joystick) ---- */
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const t = e.touches[0];
    const x = (t.clientX - r.left) * (CANVAS_W / r.width);
    const y = (t.clientY - r.top) * (CANVAS_H / r.height);
    joystickRef.current = { active: true, baseX: x, baseY: y, x, y, dx: 0, dy: 0 };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const j = joystickRef.current;
    if (!j.active) return;
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const t = e.touches[0];
    const x = (t.clientX - r.left) * (CANVAS_W / r.width);
    const y = (t.clientY - r.top) * (CANVAS_H / r.height);
    const dx = x - j.baseX;
    const dy = y - j.baseY;
    const dist = Math.hypot(dx, dy);
    const max = 45;
    const cd = Math.min(dist, max);
    const ang = Math.atan2(dy, dx);
    j.x = j.baseX + Math.cos(ang) * cd;
    j.y = j.baseY + Math.sin(ang) * cd;
    j.dx = Math.cos(ang) * (cd / max);
    j.dy = Math.sin(ang) * (cd / max);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    joystickRef.current = { active: false, baseX: 0, baseY: 0, x: 0, y: 0, dx: 0, dy: 0 };
  }, []);

  /* ---- skill choice ---- */
  const chooseSkill = useCallback((skill: Skill) => {
    skill.apply(gsRef.current.player);
    const p = gsRef.current.player;
    if (p.xp >= p.xpNext) {
      p.xp -= p.xpNext;
      p.level++;
      p.xpNext = 5 + p.level * 4;
      setLevelUpChoices(getRandomSkills(3));
    } else {
      levelUpPausedRef.current = false;
      setLevelUpChoices(null);
    }
  }, []);

  /* ---- start / restart ---- */
  const startGame = () => {
    gsRef.current = createGameState();
    levelUpPausedRef.current = false;
    setLevelUpChoices(null);
    setPhase("playing");
  };

  /* ---- stats ---- */
  const stats: GameStat[] = [
    { label: "生存时间", value: `${Math.floor(display.time)}s`, icon: "⏱️" },
    { label: "击杀数", value: display.kills, icon: "💀" },
    { label: "波数", value: display.wave, icon: "🌊" },
    { label: "等级", value: display.level, icon: "⭐" },
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
      gameId="bug-survivor"
      title="虫群幸存"
      iconEmoji="🐛"
      iconGradient="from-green-500 to-emerald-700"
      stats={stats}
      shareScore={display.time + display.kills * 5}
      refreshKey={refreshKey}
    >
      <div className="relative">
        {/* START SCREEN */}
        {phase === "start" && (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="text-6xl">🐛</div>
            <h2 className="text-3xl font-bold text-white">虫群幸存</h2>
            <div className="max-w-md space-y-2 text-sm text-gray-400">
              <p>WASD / 方向键 移动，自动攻击最近敌人</p>
              <p>击杀敌人获得经验，升级时选择 3 个技能之一</p>
              <p>技能：攻击力、攻速、移速、多发射、穿透、范围、生命</p>
              <p>每 25 秒进入新一波，每 5 波出现 Boss</p>
              <p className="text-amber-400">按 P 键暂停 | 移动端触摸摇杆移动</p>
            </div>
            <button
              onClick={startGame}
              aria-label="开始生存"
              className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            >
              开始生存
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
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="block w-full touch-none"
              style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
              aria-label="虫群幸存游戏画布"
            />

            {/* LEVEL UP OVERLAY */}
            {levelUpChoices && phase === "playing" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/85 p-4 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-amber-400">升级! 选择技能</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {levelUpChoices.map(skill => (
                    <button
                      key={skill.id}
                      onClick={() => chooseSkill(skill)}
                      aria-label={skill.name}
                      className="flex w-32 flex-col items-center gap-2 rounded-2xl border-2 border-indigo-500/40 bg-gray-800/80 p-4 text-center transition hover:scale-105 hover:border-indigo-400 active:scale-95"
                    >
                      <span className="text-4xl">{skill.icon}</span>
                      <span className="text-sm font-bold text-white">{skill.name}</span>
                      <span className="text-xs text-gray-400">{skill.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PAUSE OVERLAY */}
            {phase === "paused" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/80 backdrop-blur-sm">
                <h3 className="text-3xl font-bold text-white">已暂停</h3>
                <div className="text-center text-gray-400">
                  <div>生存: {display.time}s | 击杀: {display.kills}</div>
                  <div>波次: {display.wave} | 等级: {display.level}</div>
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

        {/* GAME OVER */}
        {phase === "gameOver" && (
          <div className="flex min-h-[500px] flex-col items-center justify-center gap-5 p-8 text-center">
            <div className="text-6xl">☠️</div>
            <h2 className="text-3xl font-bold text-white">游戏结束</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-800/60 px-6 py-3">
                <div className="text-xs text-gray-400">生存时间</div>
                <div className="text-2xl font-bold text-amber-400">{display.time}s</div>
              </div>
              <div className="rounded-xl bg-gray-800/60 px-6 py-3">
                <div className="text-xs text-gray-400">击杀数</div>
                <div className="text-2xl font-bold text-green-400">{display.kills}</div>
              </div>
              <div className="rounded-xl bg-gray-800/60 px-6 py-3">
                <div className="text-xs text-gray-400">波数</div>
                <div className="text-2xl font-bold text-blue-400">{display.wave}</div>
              </div>
              <div className="rounded-xl bg-gray-800/60 px-6 py-3">
                <div className="text-xs text-gray-400">等级</div>
                <div className="text-2xl font-bold text-purple-400">{display.level}</div>
              </div>
            </div>
            <button
              onClick={startGame}
              aria-label="再来一次"
              className="flex h-14 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-10 text-lg font-bold text-white shadow-xl transition hover:scale-105 active:scale-95"
            >
              再来一次
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
