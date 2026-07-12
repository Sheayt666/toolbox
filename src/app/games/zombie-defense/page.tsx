"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */
const CANVAS_W = 700;
const CANVAS_H = 500;
const PLAYER_RADIUS = 14;
const BARRICADE_SIZE = 36;
const BARRICADE_COST = 3;

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */
interface Player {
  x: number; y: number;
  hp: number; maxHp: number;
  moveSpeed: number;
  facing: number;
  damageFlash: number;
  invuln: number;
  materials: number;
}

interface Zombie {
  id: number;
  x: number; y: number;
  hp: number; maxHp: number;
  speed: number;
  damage: number;
  radius: number;
  type: "walker" | "runner" | "brute";
  color: string;
  hitFlash: number;
  attackCooldown: number;
  spawnAnim: number;
}

interface Bullet {
  x: number; y: number;
  vx: number; vy: number;
  damage: number;
  life: number;
  pierce: number;
  hitIds: Set<number>;
}

interface Barricade {
  x: number; y: number;
  hp: number; maxHp: number;
}

interface ItemDrop {
  x: number; y: number;
  type: "ammo" | "health" | "weapon" | "material";
  life: number;
  bob: number;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number; y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

interface WeaponDef {
  name: string;
  damage: number;
  fireRate: number;       // seconds between shots
  bulletSpeed: number;
  spread: number;          // radians
  pellets: number;
  ammoMax: number;         // -1 = infinite
  range: number;
  color: string;
  bulletSize: number;
}

interface GameState {
  player: Player;
  zombies: Zombie[];
  bullets: Bullet[];
  barricades: Barricade[];
  drops: ItemDrop[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  wave: number;
  waveState: "prep" | "fighting" | "break";
  waveTimer: number;
  spawnTimer: number;
  zombiesToSpawn: number;
  gameTime: number;
  kills: number;
  zombieIdCounter: number;
  weaponIndex: number;
  ammo: number;            // -1 = infinite (pistol)
  fireCooldown: number;
  shake: number;
}

/* ================================================================== */
/*  Weapons                                                            */
/* ================================================================== */
const WEAPONS: WeaponDef[] = [
  {
    name: "手枪",
    damage: 25,
    fireRate: 0.35,
    bulletSpeed: 480,
    spread: 0.03,
    pellets: 1,
    ammoMax: -1,
    range: 350,
    color: "#fbbf24",
    bulletSize: 4,
  },
  {
    name: "冲锋枪",
    damage: 18,
    fireRate: 0.1,
    bulletSpeed: 560,
    spread: 0.08,
    pellets: 1,
    ammoMax: 90,
    range: 380,
    color: "#60a5fa",
    bulletSize: 3,
  },
  {
    name: "霰弹枪",
    damage: 14,
    fireRate: 0.6,
    bulletSpeed: 440,
    spread: 0.25,
    pellets: 6,
    ammoMax: 24,
    range: 280,
    color: "#f87171",
    bulletSize: 4,
  },
  {
    name: "机枪",
    damage: 30,
    fireRate: 0.07,
    bulletSpeed: 620,
    spread: 0.05,
    pellets: 1,
    ammoMax: 150,
    range: 450,
    color: "#a78bfa",
    bulletSize: 4,
  },
];

/* ================================================================== */
/*  Component                                                          */
/*  Canvas init: callback ref (setCanvasRef) fires synchronously      */
/*  when <canvas> mounts, bypassing GameShell's delayed mount.         */
/*  Render also lazy-inits ctx as a fallback.                          */
/* ================================================================== */
export default function ZombieDefensePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gsRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef<{ x: number; y: number; down: boolean }>({ x: 0, y: 0, down: false });
  const touchMoveRef = useRef<{ active: boolean; dx: number; dy: number; sx: number; sy: number }>({
    active: false, dx: 0, dy: 0, sx: 0, sy: 0,
  });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scoreSubmitRef = useRef<number>(0);

  const [mounted, setMounted] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [phase, setPhase] = useState<"loading" | "menu" | "playing" | "paused" | "gameover">("loading");

  /* ---------------------------------------------------------------- */
  /*  Callback ref — fires synchronously when <canvas> mounts/unmounts */
  /*  This is the reliable way to init ctx, bypassing GameShell's       */
  /*  own mounted check that delays canvas DOM insertion.              */
  /* ---------------------------------------------------------------- */
  const setCanvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctxRef.current = ctx;
      setCanvasReady(true);
    } else {
      ctxRef.current = null;
      setCanvasReady(false);
    }
  }, []);
  const [stats, setStats] = useState<GameStat[]>([
    { label: "波数", value: 0, icon: "🌊" },
    { label: "击杀", value: 0, icon: "💀" },
    { label: "生存", value: "0s", icon: "⏱" },
  ]);
  const [hudData, setHudData] = useState({
    hp: 100,
    maxHp: 100,
    weapon: "手枪",
    ammo: -1,
    wave: 0,
    kills: 0,
    materials: 0,
    waveState: "prep" as "prep" | "fighting" | "break",
    waveTimer: 0,
  });

  /* ---------------------------------------------------------------- */
  /*  Init game state                                                  */
  /* ---------------------------------------------------------------- */
  const initGame = useCallback(() => {
    const gs: GameState = {
      player: {
        x: CANVAS_W / 2,
        y: CANVAS_H / 2,
        hp: 100,
        maxHp: 100,
        moveSpeed: 180,
        facing: 0,
        damageFlash: 0,
        invuln: 0,
        materials: 5,
      },
      zombies: [],
      bullets: [],
      barricades: [],
      drops: [],
      particles: [],
      floatingTexts: [],
      wave: 0,
      waveState: "prep",
      waveTimer: 5,
      spawnTimer: 0,
      zombiesToSpawn: 0,
      gameTime: 0,
      kills: 0,
      zombieIdCounter: 0,
      weaponIndex: 0,
      ammo: -1,
      fireCooldown: 0,
      shake: 0,
    };
    gsRef.current = gs;
    scoreSubmitRef.current = 0;
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Start wave                                                       */
  /* ---------------------------------------------------------------- */
  const startWave = useCallback((gs: GameState) => {
    gs.wave++;
    gs.waveState = "fighting";
    gs.zombiesToSpawn = 5 + gs.wave * 3;
    gs.spawnTimer = 0;
    gs.waveTimer = 0;
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Spawn zombie                                                     */
  /* ---------------------------------------------------------------- */
  const spawnZombie = useCallback((gs: GameState) => {
    const wave = gs.wave;
    let type: "walker" | "runner" | "brute" = "walker";
    const roll = Math.random();
    if (wave >= 5 && roll < 0.15) type = "brute";
    else if (wave >= 3 && roll < 0.3) type = "runner";

    const edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (edge === 0) { x = Math.random() * CANVAS_W; y = -20; }
    else if (edge === 1) { x = CANVAS_W + 20; y = Math.random() * CANVAS_H; }
    else if (edge === 2) { x = Math.random() * CANVAS_W; y = CANVAS_H + 20; }
    else { x = -20; y = Math.random() * CANVAS_H; }

    let hp = 30 + wave * 12;
    let speed = 50 + wave * 3;
    let damage = 8 + wave * 0.5;
    let radius = 13;
    let color = "#4ade80";

    if (type === "runner") {
      hp = 20 + wave * 8;
      speed = 90 + wave * 4;
      damage = 6 + wave * 0.4;
      radius = 10;
      color = "#facc15";
    } else if (type === "brute") {
      hp = 80 + wave * 25;
      speed = 35 + wave * 1.5;
      damage = 18 + wave * 0.8;
      radius = 20;
      color = "#ef4444";
    }

    gs.zombies.push({
      id: gs.zombieIdCounter++,
      x, y,
      hp, maxHp: hp,
      speed,
      damage,
      radius,
      type,
      color,
      hitFlash: 0,
      attackCooldown: 0,
      spawnAnim: 0.3,
    });
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Fire weapon                                                      */
  /* ---------------------------------------------------------------- */
  const fireWeapon = useCallback((gs: GameState) => {
    if (gs.fireCooldown > 0) return;
    const weapon = WEAPONS[gs.weaponIndex];
    if (gs.ammo === 0) {
      // Out of ammo — revert to pistol
      gs.weaponIndex = 0;
      gs.ammo = -1;
      return;
    }
    gs.fireCooldown = weapon.fireRate;

    const px = gs.player.x;
    const py = gs.player.y;
    const angle = gs.player.facing;

    for (let i = 0; i < weapon.pellets; i++) {
      const spreadOffset = (Math.random() - 0.5) * weapon.spread * 2;
      const a = angle + spreadOffset;
      gs.bullets.push({
        x: px + Math.cos(a) * (PLAYER_RADIUS + 4),
        y: py + Math.sin(a) * (PLAYER_RADIUS + 4),
        vx: Math.cos(a) * weapon.bulletSpeed,
        vy: Math.sin(a) * weapon.bulletSpeed,
        damage: weapon.damage,
        life: weapon.range / weapon.bulletSpeed,
        pierce: gs.weaponIndex === 2 ? 0 : 1, // shotgun no pierce, others pierce 1
        hitIds: new Set(),
      });
    }

    // Muzzle flash particles
    for (let i = 0; i < 4; i++) {
      const a = angle + (Math.random() - 0.5) * 0.5;
      gs.particles.push({
        x: px + Math.cos(angle) * 20,
        y: py + Math.sin(angle) * 20,
        vx: Math.cos(a) * 80 + (Math.random() - 0.5) * 40,
        vy: Math.sin(a) * 80 + (Math.random() - 0.5) * 40,
        life: 0.15,
        maxLife: 0.15,
        color: weapon.color,
        size: 3 + Math.random() * 2,
      });
    }

    gs.shake = Math.min(gs.shake + 2, 8);

    // Consume ammo
    if (gs.ammo > 0) {
      gs.ammo--;
      if (gs.ammo === 0) {
        gs.weaponIndex = 0;
        gs.ammo = -1;
      }
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Place barricade                                                  */
  /* ---------------------------------------------------------------- */
  const placeBarricade = useCallback((gs: GameState) => {
    if (gs.player.materials < BARRICADE_COST) return;
    // Check not overlapping player or existing barricade
    const bx = gs.player.x + Math.cos(gs.player.facing) * 40;
    const by = gs.player.y + Math.sin(gs.player.facing) * 40;
    if (bx < 20 || bx > CANVAS_W - 20 || by < 20 || by > CANVAS_H - 20) return;
    for (const b of gs.barricades) {
      if (Math.hypot(b.x - bx, b.y - by) < BARRICADE_SIZE) return;
    }
    gs.player.materials -= BARRICADE_COST;
    gs.barricades.push({
      x: bx, y: by,
      hp: 100, maxHp: 100,
    });
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Create particles                                                 */
  /* ---------------------------------------------------------------- */
  const spawnParticles = useCallback((gs: GameState, x: number, y: number, color: string, count: number, speed: number) => {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = speed * (0.3 + Math.random() * 0.7);
      gs.particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }, []);

  const spawnFloatingText = useCallback((gs: GameState, x: number, y: number, text: string, color: string) => {
    gs.floatingTexts.push({
      x, y, text, color,
      life: 1, vy: -40,
    });
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Drop item on kill                                                */
  /* ---------------------------------------------------------------- */
  const tryDropItem = useCallback((gs: GameState, x: number, y: number, zombieType: string) => {
    const roll = Math.random();
    if (zombieType === "brute") {
      // Brutes always drop something
      if (roll < 0.35) gs.drops.push({ x, y, type: "ammo", life: 10, bob: 0 });
      else if (roll < 0.55) gs.drops.push({ x, y, type: "health", life: 10, bob: 0 });
      else if (roll < 0.8) gs.drops.push({ x, y, type: "weapon", life: 10, bob: 0 });
      else gs.drops.push({ x, y, type: "material", life: 10, bob: 0 });
    } else {
      if (roll < 0.2) gs.drops.push({ x, y, type: "ammo", life: 10, bob: 0 });
      else if (roll < 0.28) gs.drops.push({ x, y, type: "health", life: 10, bob: 0 });
      else if (roll < 0.33) gs.drops.push({ x, y, type: "weapon", life: 10, bob: 0 });
      else if (roll < 0.45) gs.drops.push({ x, y, type: "material", life: 10, bob: 0 });
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Update                                                           */
  /* ---------------------------------------------------------------- */
  const update = useCallback((gs: GameState, dt: number) => {
    gs.gameTime += dt;
    gs.fireCooldown = Math.max(0, gs.fireCooldown - dt);
    gs.player.damageFlash = Math.max(0, gs.player.damageFlash - dt);
    gs.player.invuln = Math.max(0, gs.player.invuln - dt);
    gs.shake = Math.max(0, gs.shake - dt * 20);

    /* --- Wave logic --- */
    if (gs.waveState === "prep") {
      gs.waveTimer -= dt;
      if (gs.waveTimer <= 0) startWave(gs);
    } else if (gs.waveState === "fighting") {
      gs.spawnTimer -= dt;
      if (gs.zombiesToSpawn > 0 && gs.spawnTimer <= 0) {
        spawnZombie(gs);
        gs.zombiesToSpawn--;
        gs.spawnTimer = Math.max(0.3, 1.5 - gs.wave * 0.05);
      }
      if (gs.zombiesToSpawn === 0 && gs.zombies.length === 0) {
        gs.waveState = "break";
        gs.waveTimer = 5;
        // Bonus materials between waves
        gs.player.materials += 2 + Math.floor(gs.wave / 2);
        spawnFloatingText(gs, gs.player.x, gs.player.y - 30, `+${2 + Math.floor(gs.wave / 2)} 材料`, "#a78bfa");
      }
    } else if (gs.waveState === "break") {
      gs.waveTimer -= dt;
      if (gs.waveTimer <= 0) {
        gs.waveState = "prep";
        gs.waveTimer = 3;
      }
    }

    /* --- Player movement --- */
    let mx = 0, my = 0;
    const keys = keysRef.current;
    if (keys.has("w") || keys.has("arrowup")) my -= 1;
    if (keys.has("s") || keys.has("arrowdown")) my += 1;
    if (keys.has("a") || keys.has("arrowleft")) mx -= 1;
    if (keys.has("d") || keys.has("arrowright")) mx += 1;

    // Touch joystick
    if (touchMoveRef.current.active) {
      mx = touchMoveRef.current.dx;
      my = touchMoveRef.current.dy;
    }

    const mag = Math.hypot(mx, my);
    if (mag > 0.01) {
      mx /= mag; my /= mag;
      gs.player.x += mx * gs.player.moveSpeed * dt;
      gs.player.y += my * gs.player.moveSpeed * dt;
    }

    // Clamp to canvas
    gs.player.x = Math.max(PLAYER_RADIUS, Math.min(CANVAS_W - PLAYER_RADIUS, gs.player.x));
    gs.player.y = Math.max(PLAYER_RADIUS, Math.min(CANVAS_H - PLAYER_RADIUS, gs.player.y));

    // Facing toward mouse
    gs.player.facing = Math.atan2(mouseRef.current.y - gs.player.y, mouseRef.current.x - gs.player.x);

    /* --- Auto fire at nearest zombie --- */
    if (gs.waveState === "fighting" && gs.zombies.length > 0) {
      let nearest: Zombie | null = null;
      let minDist = Infinity;
      for (const z of gs.zombies) {
        const d = Math.hypot(z.x - gs.player.x, z.y - gs.player.y);
        if (d < minDist) { minDist = d; nearest = z; }
      }
      if (nearest && minDist < WEAPONS[gs.weaponIndex].range) {
        gs.player.facing = Math.atan2(nearest.y - gs.player.y, nearest.x - gs.player.x);
        fireWeapon(gs);
      }
    }

    /* --- Bullets --- */
    for (let i = gs.bullets.length - 1; i >= 0; i--) {
      const b = gs.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -10 || b.x > CANVAS_W + 10 || b.y < -10 || b.y > CANVAS_H + 10) {
        gs.bullets.splice(i, 1);
        continue;
      }
      // Check zombie hits
      let removed = false;
      for (let j = gs.zombies.length - 1; j >= 0; j--) {
        const z = gs.zombies[j];
        if (b.hitIds.has(z.id)) continue;
        const d = Math.hypot(b.x - z.x, b.y - z.y);
        if (d < z.radius + 3) {
          z.hp -= b.damage;
          z.hitFlash = 0.15;
          b.hitIds.add(z.id);
          spawnParticles(gs, b.x, b.y, z.color, 3, 100);

          if (z.hp <= 0) {
            gs.kills++;
            spawnParticles(gs, z.x, z.y, z.color, 12, 150);
            spawnFloatingText(gs, z.x, z.y, `+${Math.floor(z.maxHp * 0.5)}`, "#fbbf24");
            tryDropItem(gs, z.x, z.y, z.type);
            gs.zombies.splice(j, 1);
          }
          if (b.pierce <= 0) {
            gs.bullets.splice(i, 1);
            removed = true;
            break;
          }
          b.pierce--;
        }
      }
      if (removed) continue;

      // Check barricade hits (bullets pass through barricades from player side)
    }

    /* --- Zombies --- */
    for (let i = gs.zombies.length - 1; i >= 0; i--) {
      const z = gs.zombies[i];
      z.hitFlash = Math.max(0, z.hitFlash - dt);
      z.attackCooldown = Math.max(0, z.attackCooldown - dt);
      z.spawnAnim = Math.max(0, z.spawnAnim - dt);

      // Move toward player
      const dx = gs.player.x - z.x;
      const dy = gs.player.y - z.y;
      const dist = Math.hypot(dx, dy);
      let moveSpeed = z.speed;

      // Check barricade collision
      let blockedByBarricade: Barricade | null = null;
      for (const bar of gs.barricades) {
        if (bar.hp <= 0) continue;
        const bd = Math.hypot(bar.x - z.x, bar.y - z.y);
        if (bd < BARRICADE_SIZE / 2 + z.radius + 4) {
          // Attack barricade
          if (z.attackCooldown <= 0) {
            bar.hp -= z.damage * 0.6;
            z.attackCooldown = 0.5;
            spawnParticles(gs, bar.x, bar.y, "#8b6914", 4, 80);
            if (bar.hp <= 0) {
              spawnParticles(gs, bar.x, bar.y, "#8b6914", 15, 120);
            }
          }
          blockedByBarricade = bar;
          break;
        }
      }

      if (blockedByBarricade) {
        // Try to move around barricade slightly
        const bar = blockedByBarricade;
        const perpX = -(bar.y - z.y);
        const perpY = (bar.x - z.x);
        const pMag = Math.hypot(perpX, perpY);
        if (pMag > 0.01) {
          z.x += (perpX / pMag) * moveSpeed * 0.5 * dt;
          z.y += (perpY / pMag) * moveSpeed * 0.5 * dt;
        }
      } else if (dist > 1) {
        z.x += (dx / dist) * moveSpeed * dt;
        z.y += (dy / dist) * moveSpeed * dt;
      }

      // Attack player
      if (dist < z.radius + PLAYER_RADIUS && gs.player.invuln <= 0) {
        gs.player.hp -= z.damage;
        gs.player.damageFlash = 0.3;
        gs.player.invuln = 0.5;
        gs.shake = Math.min(gs.shake + 5, 12);
        spawnParticles(gs, gs.player.x, gs.player.y, "#ef4444", 6, 120);
        // Knockback zombie
        z.x -= (dx / dist) * 15;
        z.y -= (dy / dist) * 15;
      }
    }

    /* --- Item drops --- */
    for (let i = gs.drops.length - 1; i >= 0; i--) {
      const drop = gs.drops[i];
      drop.life -= dt;
      drop.bob += dt * 4;
      if (drop.life <= 0) {
        gs.drops.splice(i, 1);
        continue;
      }
      const d = Math.hypot(drop.x - gs.player.x, drop.y - gs.player.y);
      if (d < PLAYER_RADIUS + 12) {
        // Pick up
        if (drop.type === "ammo") {
          const w = WEAPONS[gs.weaponIndex];
          if (gs.weaponIndex > 0 && w.ammoMax > 0) {
            gs.ammo = Math.min(w.ammoMax, gs.ammo + Math.floor(w.ammoMax * 0.4));
            spawnFloatingText(gs, gs.player.x, gs.player.y - 30, "+弹药", "#60a5fa");
          } else {
            gs.player.materials += 1;
            spawnFloatingText(gs, gs.player.x, gs.player.y - 30, "+1 材料", "#a78bfa");
          }
        } else if (drop.type === "health") {
          gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 25);
          spawnFloatingText(gs, gs.player.x, gs.player.y - 30, "+25 HP", "#4ade80");
        } else if (drop.type === "weapon") {
          const nextIdx = Math.min(WEAPONS.length - 1, gs.weaponIndex + 1);
          if (nextIdx > gs.weaponIndex) {
            gs.weaponIndex = nextIdx;
            const nw = WEAPONS[nextIdx];
            gs.ammo = nw.ammoMax > 0 ? nw.ammoMax : -1;
            spawnFloatingText(gs, gs.player.x, gs.player.y - 30, nw.name + "!", nw.color);
          } else {
            gs.player.materials += 3;
            spawnFloatingText(gs, gs.player.x, gs.player.y - 30, "+3 材料", "#a78bfa");
          }
        } else if (drop.type === "material") {
          gs.player.materials += 2;
          spawnFloatingText(gs, gs.player.x, gs.player.y - 30, "+2 材料", "#a78bfa");
        }
        gs.drops.splice(i, 1);
      }
    }

    /* --- Particles --- */
    for (let i = gs.particles.length - 1; i >= 0; i--) {
      const p = gs.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) gs.particles.splice(i, 1);
    }

    /* --- Floating texts --- */
    for (let i = gs.floatingTexts.length - 1; i >= 0; i--) {
      const ft = gs.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) gs.floatingTexts.splice(i, 1);
    }

    /* --- Remove dead barricades --- */
    gs.barricades = gs.barricades.filter(b => b.hp > 0);

    /* --- Game over check --- */
    if (gs.player.hp <= 0) {
      gs.player.hp = 0;
      return true; // signal game over
    }
    return false;
  }, [startWave, spawnZombie, fireWeapon, spawnParticles, spawnFloatingText, tryDropItem]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  const render = useCallback((gs: GameState) => {
    let ctx = ctxRef.current;
    if (!ctx) {
      const cv = canvasRef.current;
      if (!cv) return;
      ctx = cv.getContext("2d");
      if (!ctx) return;
      ctxRef.current = ctx;
    }

    const weapon = WEAPONS[gs.weaponIndex];

    ctx.save();
    if (gs.shake > 0) {
      ctx.translate((Math.random() - 0.5) * gs.shake, (Math.random() - 0.5) * gs.shake);
    }

    // Background
    const grad = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, 50, CANVAS_W / 2, CANVAS_H / 2, 450);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(1, "#0f0f1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }

    // Barricades
    for (const b of gs.barricades) {
      const hpRatio = b.hp / b.maxHp;
      ctx.save();
      ctx.translate(b.x, b.y);
      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(-BARRICADE_SIZE / 2 + 2, -BARRICADE_SIZE / 2 + 2, BARRICADE_SIZE, BARRICADE_SIZE);
      // Body
      const barGrad = ctx.createLinearGradient(0, -BARRICADE_SIZE / 2, 0, BARRICADE_SIZE / 2);
      barGrad.addColorStop(0, "#a07c3a");
      barGrad.addColorStop(1, "#6b5223");
      ctx.fillStyle = barGrad;
      ctx.fillRect(-BARRICADE_SIZE / 2, -BARRICADE_SIZE / 2, BARRICADE_SIZE, BARRICADE_SIZE);
      // Plank lines
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-BARRICADE_SIZE / 2, 0);
      ctx.lineTo(BARRICADE_SIZE / 2, 0);
      ctx.stroke();
      // HP bar
      if (hpRatio < 1) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(-BARRICADE_SIZE / 2, -BARRICADE_SIZE / 2 - 6, BARRICADE_SIZE, 3);
        ctx.fillStyle = hpRatio > 0.5 ? "#4ade80" : hpRatio > 0.25 ? "#fbbf24" : "#ef4444";
        ctx.fillRect(-BARRICADE_SIZE / 2, -BARRICADE_SIZE / 2 - 6, BARRICADE_SIZE * hpRatio, 3);
      }
      ctx.restore();
    }

    // Item drops
    for (const drop of gs.drops) {
      const bobY = Math.sin(drop.bob) * 4;
      ctx.save();
      ctx.translate(drop.x, drop.y + bobY);
      const flash = drop.life < 3 && Math.floor(drop.life * 4) % 2 === 0;
      if (flash) ctx.globalAlpha = 0.5;

      let color = "#60a5fa";
      let icon = "A";
      if (drop.type === "ammo") { color = "#60a5fa"; icon = "🔫"; }
      else if (drop.type === "health") { color = "#4ade80"; icon = "✚"; }
      else if (drop.type === "weapon") { color = "#a78bfa"; icon = "★"; }
      else if (drop.type === "material") { color = "#fbbf24"; icon = "▣"; }

      // Glow
      const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
      glowGrad.addColorStop(0, color + "80");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(-18, -18, 36, 36);

      // Box
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0f0f1a";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icon, 0, 0);
      ctx.restore();
    }

    // Particles (behind entities)
    for (const p of gs.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Zombies
    for (const z of gs.zombies) {
      ctx.save();
      ctx.translate(z.x, z.y);
      const scale = z.spawnAnim > 0 ? 1 - z.spawnAnim / 0.3 * 0.5 : 1;
      ctx.scale(scale, scale);

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(2, 2, z.radius, z.radius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      const bodyColor = z.hitFlash > 0 ? "#ffffff" : z.color;
      const zGrad = ctx.createRadialGradient(-3, -3, 1, 0, 0, z.radius);
      zGrad.addColorStop(0, bodyColor);
      zGrad.addColorStop(1, z.color + "88");
      ctx.fillStyle = zGrad;
      ctx.beginPath();
      ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(-z.radius * 0.3, -z.radius * 0.2, 2, 0, Math.PI * 2);
      ctx.arc(z.radius * 0.3, -z.radius * 0.2, 2, 0, Math.PI * 2);
      ctx.fill();

      // HP bar
      if (z.hp < z.maxHp) {
        const hpRatio = z.hp / z.maxHp;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(-z.radius, -z.radius - 6, z.radius * 2, 3);
        ctx.fillStyle = hpRatio > 0.5 ? "#4ade80" : hpRatio > 0.25 ? "#fbbf24" : "#ef4444";
        ctx.fillRect(-z.radius, -z.radius - 6, z.radius * 2 * hpRatio, 3);
      }
      ctx.restore();
    }

    // Bullets
    for (const b of gs.bullets) {
      ctx.save();
      ctx.fillStyle = weapon.color;
      ctx.shadowColor = weapon.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, weapon.bulletSize, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.015, b.y - b.vy * 0.015);
      ctx.strokeStyle = weapon.color;
      ctx.lineWidth = weapon.bulletSize;
      ctx.stroke();
      ctx.restore();
    }

    // Player
    ctx.save();
    ctx.translate(gs.player.x, gs.player.y);

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(2, 2, PLAYER_RADIUS, PLAYER_RADIUS * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    const pColor = gs.player.damageFlash > 0 ? "#ef4444" : gs.player.invuln > 0 && Math.floor(gs.player.invuln * 10) % 2 === 0 ? "#6b7280" : "#3b82f6";
    const pGrad = ctx.createRadialGradient(-4, -4, 1, 0, 0, PLAYER_RADIUS);
    pGrad.addColorStop(0, "#60a5fa");
    pGrad.addColorStop(1, pColor);
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = "#1e40af";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gun direction indicator
    ctx.rotate(gs.player.facing);
    ctx.fillStyle = weapon.color;
    ctx.fillRect(PLAYER_RADIUS - 2, -3, 14, 6);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.strokeRect(PLAYER_RADIUS - 2, -3, 14, 6);

    ctx.restore();

    // Floating texts
    for (const ft of gs.floatingTexts) {
      ctx.globalAlpha = ft.life;
      ctx.fillStyle = ft.color;
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    // Wave info overlay
    if (gs.waveState === "prep") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, CANVAS_H / 2 - 30, CANVAS_W, 60);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`第 ${gs.wave + 1} 波即将开始... ${Math.ceil(gs.waveTimer)}s`, CANVAS_W / 2, CANVAS_H / 2);
    } else if (gs.waveState === "break") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, CANVAS_H / 2 - 30, CANVAS_W, 60);
      ctx.fillStyle = "#4ade80";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`第 ${gs.wave} 波清除! 休息 ${Math.ceil(gs.waveTimer)}s`, CANVAS_W / 2, CANVAS_H / 2);
    }

    ctx.restore();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Game loop                                                        */
  /* ---------------------------------------------------------------- */
  const gameLoop = useCallback((time: number) => {
    const gs = gsRef.current;
    if (!gs) return;

    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = time;

    if (phaseRef.current === "playing") {
      const gameOver = update(gs, dt);
      render(gs);

      if (gameOver) {
        const score = gs.kills * 10 + gs.wave * 50 + Math.floor(gs.gameTime);
        setPhase("gameover");
        submitScore("zombie-defense", score);
        return;
      }
    } else if (phaseRef.current === "paused") {
      render(gs);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [update, render]);

  // Use ref to track phase for game loop
  const phaseRef = useRef<"loading" | "menu" | "playing" | "paused" | "gameover">("loading");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* ---------------------------------------------------------------- */
  /*  Sync HUD                                                         */
  /* ---------------------------------------------------------------- */
  const syncHud = useCallback(() => {
    const gs = gsRef.current;
    if (!gs) return;
    const w = WEAPONS[gs.weaponIndex];
    setHudData({
      hp: Math.ceil(gs.player.hp),
      maxHp: gs.player.maxHp,
      weapon: w.name,
      ammo: gs.ammo,
      wave: gs.wave,
      kills: gs.kills,
      materials: gs.player.materials,
      waveState: gs.waveState,
      waveTimer: Math.ceil(gs.waveTimer),
    });
    setStats([
      { label: "波数", value: gs.wave, icon: "🌊" },
      { label: "击杀", value: gs.kills, icon: "💀" },
      { label: "生存", value: `${Math.floor(gs.gameTime)}s`, icon: "⏱" },
    ]);

    // Submit score every 10 seconds
    const now = Date.now();
    if (now - scoreSubmitRef.current > 10000) {
      scoreSubmitRef.current = now;
      const score = gs.kills * 10 + gs.wave * 50 + Math.floor(gs.gameTime);
      submitScore("zombie-defense", score);
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Start game                                                       */
  /* ---------------------------------------------------------------- */
  const startGame = useCallback(() => {
    initGame();
    setPhase("playing");
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [initGame, gameLoop]);

  /* ---------------------------------------------------------------- */
  /*  Restart                                                          */
  /* ---------------------------------------------------------------- */
  const restart = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    initGame();
    setPhase("playing");
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [initGame, gameLoop]);

  /* ---------------------------------------------------------------- */
  /*  Toggle pause                                                     */
  /* ---------------------------------------------------------------- */
  const togglePause = useCallback(() => {
    setPhase(prev => {
      if (prev === "playing") return "paused";
      if (prev === "paused") {
        lastTimeRef.current = performance.now();
        return "playing";
      }
      return prev;
    });
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Mount                                                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    setMounted(true);
    setPhase("menu");
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /*  HUD sync interval                                                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (phase !== "playing" && phase !== "paused") return;
    const interval = setInterval(syncHud, 100);
    const t = setTimeout(() => {}, 0);
    timersRef.current.push(t);
    return () => clearInterval(interval);
  }, [phase, syncHud]);

  /* ---------------------------------------------------------------- */
  /*  Keyboard                                                         */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "p") {
        e.preventDefault();
        togglePause();
        return;
      }
      if (phaseRef.current !== "playing") return;
      if (key === "e") {
        e.preventDefault();
        const gs = gsRef.current;
        if (gs) placeBarricade(gs);
        return;
      }
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault();
        keysRef.current.add(key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current.delete(key);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [togglePause, placeBarricade]);

  /* ---------------------------------------------------------------- */
  /*  Mouse                                                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!canvasReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      mouseRef.current.x = (e.clientX - rect.left) * scaleX;
      mouseRef.current.y = (e.clientY - rect.top) * scaleY;
    };

    const onMouseMove = (e: MouseEvent) => getMousePos(e);
    const onMouseDown = (e: MouseEvent) => {
      getMousePos(e);
      mouseRef.current.down = true;
      // Click also places barricade on mobile-less setups
      if (e.button === 2) {
        e.preventDefault();
        const gs = gsRef.current;
        if (gs && phaseRef.current === "playing") placeBarricade(gs);
      }
    };
    const onMouseUp = () => { mouseRef.current.down = false; };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [placeBarricade, canvasReady]);

  /* ---------------------------------------------------------------- */
  /*  Touch controls (virtual joystick)                                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!canvasReady) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getTouchPos = (touch: Touch) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (phaseRef.current !== "playing") return;
      const touch = e.touches[0];
      const pos = getTouchPos(touch);
      touchMoveRef.current = {
        active: true,
        dx: 0, dy: 0,
        sx: pos.x, sy: pos.y,
      };
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (phaseRef.current !== "playing") return;
      const touch = e.touches[0];
      const pos = getTouchPos(touch);
      const dx = pos.x - touchMoveRef.current.sx;
      const dy = pos.y - touchMoveRef.current.sy;
      const mag = Math.hypot(dx, dy);
      const maxMag = 50;
      if (mag > 0.01) {
        const clamped = Math.min(mag, maxMag) / maxMag;
        touchMoveRef.current.dx = (dx / mag) * clamped;
        touchMoveRef.current.dy = (dy / mag) * clamped;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      touchMoveRef.current.active = false;
      touchMoveRef.current.dx = 0;
      touchMoveRef.current.dy = 0;
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [canvasReady]);

  /* ---------------------------------------------------------------- */
  /*  Build barricade button (mobile)                                  */
  /* ---------------------------------------------------------------- */
  const handleBuildBarricade = useCallback(() => {
    const gs = gsRef.current;
    if (gs && phaseRef.current === "playing") {
      placeBarricade(gs);
    }
  }, [placeBarricade]);

  /* ---------------------------------------------------------------- */
  /*  Compute share score                                              */
  /* ---------------------------------------------------------------- */
  const shareScore = hudData.kills * 10 + hudData.wave * 50;
  const refreshKey = phase === "gameover" ? hudData.kills + hudData.wave : 0;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🧟</div>
          <div className="text-xl text-gray-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <GameShell
      gameId="zombie-defense"
      title="丧尸防御"
      iconEmoji="🧟"
      iconGradient="from-red-600 to-rose-800"
      stats={stats}
      shareScore={shareScore}
      refreshKey={refreshKey}
    >
      {/* Canvas */}
      <div className="relative w-full max-w-[700px] mx-auto">
        <canvas
          ref={setCanvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-xl border border-white/10 bg-[#0f0f1a] touch-none"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          aria-label="丧尸防御游戏画面"
        />

        {/* HUD overlay */}
        {(phase === "playing" || phase === "paused") && (
          <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2 pointer-events-none">
            {/* HP bar */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-red-400 text-sm font-bold">HP</span>
              <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${(hudData.hp / hudData.maxHp) * 100}%`,
                    background: hudData.hp / hudData.maxHp > 0.5 ? "#4ade80" : hudData.hp / hudData.maxHp > 0.25 ? "#fbbf24" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-white text-xs font-mono">{hudData.hp}/{hudData.maxHp}</span>
            </div>

            {/* Weapon */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-sm">🔫</span>
              <span className="text-white text-xs font-bold">{hudData.weapon}</span>
              <span className="text-gray-400 text-xs">
                {hudData.ammo === -1 ? "∞" : hudData.ammo}
              </span>
            </div>

            {/* Materials */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-sm">▣</span>
              <span className="text-yellow-400 text-xs font-bold">{hudData.materials}</span>
            </div>

            {/* Wave info */}
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 ml-auto">
              <span className="text-sm">🌊</span>
              <span className="text-white text-xs font-bold">波 {hudData.wave}</span>
              {hudData.waveState === "prep" && (
                <span className="text-yellow-400 text-xs ml-1">{hudData.waveTimer}s</span>
              )}
              {hudData.waveState === "break" && (
                <span className="text-green-400 text-xs ml-1">休息 {hudData.waveTimer}s</span>
              )}
            </div>
          </div>
        )}

        {/* Mobile build button */}
        {phase === "playing" && (
          <button
            onClick={handleBuildBarricade}
            className="absolute bottom-3 right-3 w-14 h-14 rounded-full bg-amber-600/80 backdrop-blur-sm text-white text-2xl flex items-center justify-center active:scale-90 transition-transform shadow-lg pointer-events-auto md:hidden"
            aria-label="建造路障"
          >
            🧱
          </button>
        )}

        {/* Menu overlay */}
        {phase === "menu" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
            <div className="text-center px-6">
              <div className="text-6xl mb-4">🧟</div>
              <h2 className="text-3xl font-bold text-white mb-2">丧尸防御</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                在末日中生存! WASD移动, 自动瞄准射击,
                按E建造路障, 击杀丧尸获取武器和补给
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
                aria-label="开始游戏"
                style={{ minHeight: 44 }}
              >
                开始游戏
              </button>
            </div>
          </div>
        )}

        {/* Paused overlay */}
        {phase === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <div className="text-5xl mb-4">⏸️</div>
              <h2 className="text-2xl font-bold text-white mb-4">已暂停</h2>
              <div className="flex flex-col gap-3 items-center">
                <button
                  onClick={togglePause}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:scale-105 transition-transform"
                  aria-label="继续游戏"
                  style={{ minHeight: 44 }}
                >
                  继续 (P)
                </button>
                <button
                  onClick={restart}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg font-bold hover:scale-105 transition-transform"
                  aria-label="重新开始"
                  style={{ minHeight: 44 }}
                >
                  重新开始
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game over overlay */}
        {phase === "gameover" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-sm rounded-xl">
            <div className="text-center px-6">
              <div className="text-6xl mb-3">💀</div>
              <h2 className="text-3xl font-bold text-red-500 mb-4">游戏结束</h2>
              <div className="grid grid-cols-3 gap-4 mb-6 max-w-xs mx-auto">
                <div>
                  <div className="text-2xl font-bold text-white">{hudData.wave}</div>
                  <div className="text-xs text-gray-400">波数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{hudData.kills}</div>
                  <div className="text-xs text-gray-400">击杀</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{shareScore}</div>
                  <div className="text-xs text-gray-400">分数</div>
                </div>
              </div>
              <button
                onClick={restart}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
                aria-label="再玩一次"
                style={{ minHeight: 44 }}
              >
                再玩一次
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls help */}
      <div className="max-w-[700px] mx-auto mt-4 px-2">
        <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-400">
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">WASD 移动</span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">鼠标 瞄准</span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">自动射击</span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">E / 右键 建造路障</span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">P 暂停</span>
          <span className="bg-white/5 px-3 py-1.5 rounded-lg">触屏 摇杆移动</span>
        </div>
      </div>
    </GameShell>
  );
}
