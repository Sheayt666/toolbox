"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "stickman-boss";
const W = 800;
const H = 450;
const GROUND_Y = 380;
const GRAVITY = 0.6;
const MOVE_SPEED = 3.5;
const JUMP_VEL = -13;
const BEST_SCORE_KEY = "gm_stickman_boss_best";
const PLAYER_MAX_HP = 100;
const PLAYER_MAX_ENERGY = 100;

interface Player {
  x: number; y: number; vx: number; vy: number;
  hp: number; energy: number;
  facing: number; onGround: boolean;
  attackTimer: number; attackCooldown: number; attackHit: boolean;
  isUltimate: boolean; ultTimer: number;
  hitFlash: number; walkPhase: number; invincible: number;
}

interface Boss {
  x: number; y: number; vx: number; vy: number;
  hp: number; maxHp: number; phase: number;
  facing: number; onGround: boolean;
  attackTimer: number; attackCooldown: number;
  currentAttack: string | null; attackWindup: number; attackPhase: number;
  walkPhase: number; hitFlash: number;
  dead: boolean; deathTimer: number; active: boolean;
}

interface Projectile { x: number; y: number; vx: number; vy: number; life: number; }
interface Effect {
  x: number; y: number; type: string; life: number; maxLife: number;
  vx: number; vy: number; radius: number; text?: string;
}

interface GameData {
  player: Player;
  boss: Boss;
  projectiles: Projectile[];
  effects: Effect[];
  keys: Record<string, boolean>;
  bossIndex: number;
  score: number;
  gameOver: boolean;
  victory: boolean;
  bossTransition: number;
  startTime: number;
  totalTime: number;
  shake: number;
}

const BOSSES = [
  { name: "暗影战士", hp: 250, speed: 2.5, damage: 8, color: "#818cf8", attackCd: 120 },
  { name: "烈焰魔王", hp: 450, speed: 3.2, damage: 12, color: "#f87171", attackCd: 95 },
  { name: "终极机甲", hp: 700, speed: 4.0, damage: 16, color: "#fbbf24", attackCd: 75 },
];

function makePlayer(): Player {
  return {
    x: 150, y: GROUND_Y, vx: 0, vy: 0,
    hp: PLAYER_MAX_HP, energy: 0,
    facing: 1, onGround: true,
    attackTimer: 0, attackCooldown: 0, attackHit: false,
    isUltimate: false, ultTimer: 0,
    hitFlash: 0, walkPhase: 0, invincible: 0,
  };
}

function makeBoss(index: number): Boss {
  const b = BOSSES[index];
  return {
    x: 650, y: GROUND_Y, vx: 0, vy: 0,
    hp: b.hp, maxHp: b.hp, phase: 1,
    facing: -1, onGround: true,
    attackTimer: 60, attackCooldown: b.attackCd,
    currentAttack: null, attackWindup: 0, attackPhase: 0,
    walkPhase: 0, hitFlash: 0,
    dead: false, deathTimer: 0, active: true,
  };
}

function makeGameData(): GameData {
  return {
    player: makePlayer(),
    boss: makeBoss(0),
    projectiles: [],
    effects: [],
    keys: {},
    bossIndex: 0,
    score: 0,
    gameOver: false,
    victory: false,
    bossTransition: 0,
    startTime: 0,
    totalTime: 0,
    shake: 0,
  };
}

type Phase = "idle" | "playing" | "paused" | "over";

export default function StickmanBossPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gameDataRef = useRef<GameData>(makeGameData());
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const submittedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const phaseRef = useRef<Phase>("idle");

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dHp, setDHp] = useState(PLAYER_MAX_HP);
  const [dEnergy, setDEnergy] = useState(0);
  const [dBossHp, setDBossHp] = useState(250);
  const [dBossIdx, setDBossIdx] = useState(0);
  const [dScore, setDScore] = useState(0);
  const [dBossName, setDBossName] = useState(BOSSES[0].name);
  const [bestScore, setBestScore] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dTime, setDTime] = useState(0);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const s = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10);
      if (s > 0) setBestScore(s);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const gd = gameDataRef.current;
    submitScore(GAME_ID, gd.score);
    setRefreshKey((k) => k + 1);
    if (gd.score > bestScore) {
      setBestScore(gd.score);
      try { localStorage.setItem(BEST_SCORE_KEY, String(gd.score)); } catch { /* ignore */ }
    }
  }, [bestScore]);

  // Sync display state from refs
  useEffect(() => {
    if (phase !== "playing" && phase !== "paused") return;
    const interval = setInterval(() => {
      const gd = gameDataRef.current;
      setDHp(Math.max(0, Math.round(gd.player.hp)));
      setDEnergy(Math.round(gd.player.energy));
      setDBossHp(Math.max(0, Math.round(gd.boss.hp)));
      setDBossIdx(gd.bossIndex);
      setDScore(gd.score);
      setDBossName(BOSSES[gd.bossIndex].name);
      setDTime(Math.floor((Date.now() - gd.startTime) / 1000));
      if (gd.gameOver || gd.victory) {
        setPhase("over");
        timersRef.current.push(setTimeout(() => finish(), 100));
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phase, finish]);

  const startGame = useCallback(() => {
    const gd = makeGameData();
    gd.startTime = Date.now();
    gameDataRef.current = gd;
    submittedRef.current = false;
    setDHp(PLAYER_MAX_HP);
    setDEnergy(0);
    setDBossHp(BOSSES[0].hp);
    setDBossIdx(0);
    setDScore(0);
    setDTime(0);
    setDBossName(BOSSES[0].name);
    setPhase("playing");
  }, []);

  const togglePause = useCallback(() => {
    if (phaseRef.current === "playing") setPhase("paused");
    else if (phaseRef.current === "paused") setPhase("playing");
  }, []);

  // Keyboard input
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "p") { e.preventDefault(); togglePause(); return; }
      if (phaseRef.current !== "playing") return;
      gameDataRef.current.keys[k] = true;
      if (["a","d","w","j","k"," "].includes(k)) e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => {
      gameDataRef.current.keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [togglePause]);

  // rAF game loop
  useEffect(() => {
    if (phase !== "playing") return;
    const cv = canvasRef.current;
    if (!cv) return;
    let ctx = ctxRef.current;
    if (!ctx) {
      ctx = cv.getContext("2d");
      if (!ctx) return;
      ctxRef.current = ctx;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 16.67, 2);
      lastTimeRef.current = now;
      update(dt);
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Draw also when paused (to show the frozen frame)
  useEffect(() => {
    if (phase === "paused" || phase === "over") draw();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ===== UPDATE =====
  function update(dt: number) {
    const gd = gameDataRef.current;
    if (gd.gameOver || gd.victory) return;
    const p = gd.player;
    const b = gd.boss;
    const keys = gd.keys;

    // Total time
    gd.totalTime = Date.now() - gd.startTime;

    // --- Player input ---
    if (p.invincible > 0) p.invincible -= dt;
    if (p.hitFlash > 0) p.hitFlash -= dt;
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.attackTimer > 0) p.attackTimer -= dt;
    if (p.ultTimer > 0) {
      p.ultTimer -= dt;
      if (p.ultTimer <= 0) p.isUltimate = false;
    }

    let moving = false;
    if (keys["a"]) { p.vx = -MOVE_SPEED; p.facing = -1; moving = true; }
    else if (keys["d"]) { p.vx = MOVE_SPEED; p.facing = 1; moving = true; }
    else p.vx *= 0.7;

    if (keys["w"] && p.onGround) {
      p.vy = JUMP_VEL;
      p.onGround = false;
      spawnDust(gd, p.x, GROUND_Y);
    }

    if (keys["j"] && p.attackCooldown <= 0 && p.attackTimer <= 0) {
      p.attackTimer = 18;
      p.attackCooldown = 28;
      p.attackHit = false;
    }

    if (keys["k"] && p.energy >= PLAYER_MAX_ENERGY && p.ultTimer <= 0) {
      p.energy = 0;
      p.isUltimate = true;
      p.ultTimer = 30;
      p.attackTimer = 20;
      p.attackHit = false;
      // Ultimate effect
      gd.effects.push({ x: p.x, y: p.y - 25, type: "ult", life: 30, maxLife: 30, vx: 0, vy: 0, radius: 0 });
      gd.shake = 8;
    }

    // Player physics
    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.y >= GROUND_Y) { p.y = GROUND_Y; p.vy = 0; p.onGround = true; }
    p.x = Math.max(30, Math.min(W - 30, p.x));
    if (moving && p.onGround) p.walkPhase += 0.2 * dt;

    // Player attack hit detection
    if (p.attackTimer > 0 && !p.attackHit) {
      const range = p.isUltimate ? 130 : 65;
      const dmg = p.isUltimate ? 50 : 15;
      const dx = b.x - p.x;
      if (b.active && !b.dead && Math.abs(dx) < range && Math.abs(b.y - p.y) < 80) {
        if ((p.facing > 0 && dx > -20) || (p.facing < 0 && dx < 20)) {
          b.hp -= dmg;
          b.hitFlash = 10;
          p.attackHit = true;
          p.energy = Math.min(PLAYER_MAX_ENERGY, p.energy + (p.isUltimate ? 0 : 18));
          gd.shake = p.isUltimate ? 10 : 4;
          gd.effects.push({ x: b.x, y: b.y - 30, type: "hit", life: 15, maxLife: 15, vx: (Math.random() - 0.5) * 3, vy: -2, radius: 0 });
          gd.effects.push({ x: b.x, y: b.y - 30, type: "spark", life: 10, maxLife: 10, vx: 0, vy: 0, radius: 0, text: p.isUltimate ? "-50" : "-15" });
          // Phase transition
          const threshold = b.maxHp * (0.34 * (3 - b.phase));
          if (b.hp <= threshold && b.phase < 3) {
            b.phase++;
            gd.effects.push({ x: b.x, y: b.y - 40, type: "phase", life: 40, maxLife: 40, vx: 0, vy: 0, radius: 0 });
            gd.shake = 12;
          }
          if (b.hp <= 0) {
            b.hp = 0;
            b.dead = true;
            b.deathTimer = 90;
            b.active = false;
            gd.score += (gd.bossIndex + 1) * 1000;
            gd.bossTransition = 120;
            gd.effects.push({ x: b.x, y: b.y - 30, type: "explode", life: 40, maxLife: 40, vx: 0, vy: 0, radius: 0 });
            gd.shake = 15;
          }
        }
      }
    }

    // --- Boss logic ---
    if (b.active && !b.dead) {
      if (b.hitFlash > 0) b.hitFlash -= dt;
      b.facing = p.x < b.x ? -1 : 1;

      if (b.attackCooldown > 0) b.attackCooldown -= dt;
      if (b.attackWindup > 0) {
        b.attackWindup -= dt;
        if (b.attackWindup <= 0) b.attackPhase = 1; // execute
      }

      // Choose attack
      if (b.attackCooldown <= 0 && !b.currentAttack) {
        const attacks = b.phase === 1 ? ["charge"] : b.phase === 2 ? ["charge", "slam"] : ["charge", "slam", "bullets"];
        b.currentAttack = attacks[Math.floor(Math.random() * attacks.length)];
        b.attackWindup = 20;
        b.attackPhase = 0;
      }

      if (b.currentAttack && b.attackPhase === 1) {
        executeBossAttack(gd, dt);
      }

      // Boss physics
      b.vy += GRAVITY * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y >= GROUND_Y) {
        if (!b.onGround && b.currentAttack === "slam" && b.attackPhase === 1) {
          // Slam landing - create shockwave
          gd.effects.push({ x: b.x, y: GROUND_Y, type: "shock", life: 30, maxLife: 30, vx: 0, vy: 0, radius: 10 });
          gd.shake = 12;
          // Check player
          if (p.onGround && Math.abs(p.x - b.x) < 120 && p.invincible <= 0) {
            damagePlayer(gd, BOSSES[gd.bossIndex].damage);
          }
          b.currentAttack = null;
          b.attackPhase = 0;
          b.attackCooldown = BOSSES[gd.bossIndex].attackCd;
        }
        b.y = GROUND_Y;
        b.vy = 0;
        b.onGround = true;
      } else {
        b.onGround = false;
      }
      b.x = Math.max(30, Math.min(W - 30, b.x));

      // Contact damage during charge
      if (b.currentAttack === "charge" && b.attackPhase === 1) {
        if (Math.abs(b.x - p.x) < 45 && Math.abs(b.y - p.y) < 70 && p.invincible <= 0) {
          damagePlayer(gd, BOSSES[gd.bossIndex].damage);
          b.currentAttack = null;
          b.attackPhase = 0;
          b.attackCooldown = BOSSES[gd.bossIndex].attackCd;
        }
      }

      if (moving) b.walkPhase += 0.15 * dt;
    }

    // Boss death animation
    if (b.dead && b.deathTimer > 0) {
      b.deathTimer -= dt;
    }

    // Boss transition
    if (gd.bossTransition > 0) {
      gd.bossTransition -= dt;
      if (gd.bossTransition <= 0) {
        if (gd.bossIndex < 2) {
          gd.bossIndex++;
          gd.boss = makeBoss(gd.bossIndex);
          // Heal player partially
          p.hp = Math.min(PLAYER_MAX_HP, p.hp + 30);
          gd.effects.push({ x: p.x, y: p.y - 30, type: "heal", life: 30, maxLife: 30, vx: 0, vy: -1, radius: 0, text: "+30" });
        } else {
          // Victory!
          gd.victory = true;
          const timeBonus = Math.max(0, 180 - Math.floor(gd.totalTime / 1000)) * 5;
          const hpBonus = Math.round(p.hp) * 10;
          gd.score += timeBonus + hpBonus;
        }
      }
    }

    // --- Projectiles ---
    for (let i = gd.projectiles.length - 1; i >= 0; i--) {
      const pr = gd.projectiles[i];
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      pr.life -= dt;
      if (pr.life <= 0 || pr.x < -20 || pr.x > W + 20 || pr.y < -20 || pr.y > H + 20) {
        gd.projectiles.splice(i, 1);
        continue;
      }
      // Hit player
      if (p.invincible <= 0 && Math.abs(pr.x - p.x) < 22 && Math.abs(pr.y - (p.y - 25)) < 30) {
        damagePlayer(gd, BOSSES[gd.bossIndex].damage * 0.7);
        gd.projectiles.splice(i, 1);
      }
    }

    // --- Effects ---
    for (let i = gd.effects.length - 1; i >= 0; i--) {
      const ef = gd.effects[i];
      ef.life -= dt;
      ef.x += ef.vx * dt;
      ef.y += ef.vy * dt;
      if (ef.type === "shock") ef.radius += 4 * dt;
      if (ef.life <= 0) gd.effects.splice(i, 1);
    }

    // Shake decay
    if (gd.shake > 0) gd.shake = Math.max(0, gd.shake - 0.5 * dt);

    // Check player death
    if (p.hp <= 0 && !gd.gameOver) {
      gd.gameOver = true;
    }
  }

  function executeBossAttack(gd: GameData, _dt: number) {
    const b = gd.boss;
    const p = gd.player;
    const cfg = BOSSES[gd.bossIndex];
    if (b.currentAttack === "charge") {
      b.vx = b.facing * cfg.speed * 2.2;
      if (Math.abs(b.x - p.x) < 30 || b.x < 40 || b.x > W - 40) {
        b.vx = 0;
        b.currentAttack = null;
        b.attackPhase = 0;
        b.attackCooldown = cfg.attackCd;
      }
    } else if (b.currentAttack === "slam") {
      if (b.onGround) {
        b.vy = -14;
        b.onGround = false;
      }
    } else if (b.currentAttack === "bullets") {
      const count = 8 + b.phase * 2;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 3 + Math.random();
        gd.projectiles.push({
          x: b.x, y: b.y - 35,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 180,
        });
      }
      b.currentAttack = null;
      b.attackPhase = 0;
      b.attackCooldown = cfg.attackCd;
    }
  }

  function damagePlayer(gd: GameData, dmg: number) {
    const p = gd.player;
    p.hp -= dmg;
    p.hitFlash = 12;
    p.invincible = 40;
    p.vx = p.facing * -4;
    gd.shake = 6;
    gd.effects.push({ x: p.x, y: p.y - 30, type: "hit", life: 15, maxLife: 15, vx: 0, vy: -2, radius: 0 });
  }

  function spawnDust(gd: GameData, x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      gd.effects.push({
        x: x + (Math.random() - 0.5) * 20, y,
        type: "dust", life: 20, maxLife: 20,
        vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2,
        radius: 0,
      });
    }
  }

  // ===== DRAW =====
  function draw() {
    const cv = canvasRef.current;
    if (!cv) return;
    let ctx = ctxRef.current;
    if (!ctx) { ctx = cv.getContext("2d"); if (!ctx) return; ctxRef.current = ctx; }
    const gd = gameDataRef.current;

    ctx.save();
    // Screen shake
    if (gd.shake > 0) {
      ctx.translate((Math.random() - 0.5) * gd.shake, (Math.random() - 0.5) * gd.shake);
    }

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0f0a1e");
    bg.addColorStop(0.5, "#1a1033");
    bg.addColorStop(1, "#0d0820");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Distant mountains
    ctx.fillStyle = "rgba(60,40,100,0.4)";
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(100, 250); ctx.lineTo(200, 320); ctx.lineTo(350, 200);
    ctx.lineTo(500, 300); ctx.lineTo(650, 220); ctx.lineTo(800, 280);
    ctx.lineTo(W, GROUND_Y);
    ctx.fill();

    // Ground
    const gg = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    gg.addColorStop(0, "#2a1a3e");
    gg.addColorStop(1, "#1a0f2e");
    ctx.fillStyle = gg;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.strokeStyle = "#4a2a6e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    // Ground texture lines
    ctx.strokeStyle = "rgba(74,42,110,0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, GROUND_Y + 10);
      ctx.lineTo(i + 20, GROUND_Y + 10);
      ctx.stroke();
    }

    // Draw effects (back layer)
    for (const ef of gd.effects) {
      const t = ef.life / ef.maxLife;
      if (ef.type === "shock") {
        ctx.strokeStyle = `rgba(239,68,68,${t * 0.6})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, ef.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (ef.type === "dust") {
        ctx.fillStyle = `rgba(120,100,140,${t * 0.4})`;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, 3 * t, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw boss
    const b = gd.boss;
    const bColor = BOSSES[gd.bossIndex].color;
    if (!b.dead || b.deathTimer > 0) {
      const alpha = b.dead ? b.deathTimer / 90 : 1;
      ctx.globalAlpha = alpha;
      drawFighter(ctx, b.x, b.y, b.facing, b.walkPhase, b.hitFlash > 0, bColor, 1.4, b.currentAttack, b.attackWindup > 0, b.phase);
      ctx.globalAlpha = 1;
    }

    // Draw player
    const p = gd.player;
    const pFlash = p.hitFlash > 0 && Math.floor(p.hitFlash / 3) % 2 === 0;
    const pInv = p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0;
    if (!pInv) {
      const pColor = p.isUltimate ? "#fbbf24" : "#22d3ee";
      drawFighter(ctx, p.x, p.y, p.facing, p.walkPhase, pFlash, pColor, 1, p.attackTimer > 0 ? "punch" : null, false, 0, p.isUltimate);
    }

    // Draw projectiles
    for (const pr of gd.projectiles) {
      ctx.fillStyle = BOSSES[gd.bossIndex].color;
      ctx.shadowColor = BOSSES[gd.bossIndex].color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw effects (front layer)
    for (const ef of gd.effects) {
      const t = ef.life / ef.maxLife;
      if (ef.type === "hit") {
        ctx.fillStyle = `rgba(255,200,0,${t})`;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, 6 * t, 0, Math.PI * 2);
        ctx.fill();
      } else if (ef.type === "spark" && ef.text) {
        ctx.fillStyle = `rgba(255,220,100,${t})`;
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ef.text, ef.x, ef.y - 20 * (1 - t));
      } else if (ef.type === "ult") {
        ctx.strokeStyle = `rgba(251,191,36,${t})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, (1 - t) * 100, 0, Math.PI * 2);
        ctx.stroke();
      } else if (ef.type === "explode") {
        const r = (1 - t) * 80;
        ctx.fillStyle = `rgba(255,100,0,${t * 0.5})`;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (ef.type === "phase") {
        ctx.strokeStyle = `rgba(255,255,255,${t})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ef.x, ef.y, (1 - t) * 60, 0, Math.PI * 2);
        ctx.stroke();
      } else if (ef.type === "heal" && ef.text) {
        ctx.fillStyle = `rgba(34,197,94,${t})`;
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(ef.text, ef.x, ef.y - 30 * (1 - t));
      }
    }

    ctx.restore();

    // HUD on canvas
    // Boss HP bar
    if (b.active && !b.dead) {
      const barW = 300;
      const barX = (W - barW) / 2;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(barX - 2, 14, barW + 4, 18);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(barX, 16, barW, 14);
      const hpRatio = b.hp / b.maxHp;
      const phaseColors = ["#ef4444", "#f59e0b", "#8b5cf6"];
      ctx.fillStyle = phaseColors[b.phase - 1] || "#ef4444";
      ctx.fillRect(barX, 16, barW * hpRatio, 14);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${BOSSES[gd.bossIndex].name}  P${b.phase}`, W / 2, 26);
    }

    // Player HP/Energy bars (bottom left)
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(12, H - 52, 200, 42);
    // HP
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(16, H - 48, 192, 14);
    ctx.fillStyle = p.hp > 30 ? "#22c55e" : "#ef4444";
    ctx.fillRect(16, H - 48, 192 * (p.hp / PLAYER_MAX_HP), 14);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`HP ${Math.round(p.hp)}/${PLAYER_MAX_HP}`, 20, H - 38);
    // Energy
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(16, H - 30, 192, 14);
    ctx.fillStyle = p.energy >= PLAYER_MAX_ENERGY ? "#fbbf24" : "#3b82f6";
    ctx.fillRect(16, H - 30, 192 * (p.energy / PLAYER_MAX_ENERGY), 14);
    ctx.fillStyle = "#fff";
    ctx.fillText(`能量 ${Math.round(p.energy)}/100${p.energy >= PLAYER_MAX_ENERGY ? " (K必杀!)" : ""}`, 20, H - 20);

    // Boss transition message
    if (gd.bossTransition > 0 && gd.bossTransition < 100 && !gd.victory) {
      ctx.fillStyle = `rgba(0,0,0,${0.5 * (gd.bossTransition / 100)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(34,211,238,${gd.bossTransition / 100})`;
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Boss 已击败!", W / 2, H / 2);
      if (gd.bossIndex < 2) {
        ctx.font = "16px sans-serif";
        ctx.fillText(`下一个: ${BOSSES[gd.bossIndex + 1].name}`, W / 2, H / 2 + 30);
      }
    }
  }

  function drawFighter(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, facing: number, walkPhase: number,
    flash: boolean, color: string, scale: number,
    attack: string | null, windup: boolean, bossPhase: number, isUlt = false,
  ) {
    const s = scale;
    const headR = 8 * s;
    const bodyTop = y - 42 * s;
    const bodyBot = y - 14 * s;
    const shoulderY = y - 36 * s;
    const hipY = y - 14 * s;

    ctx.strokeStyle = flash ? "#ffffff" : color;
    ctx.fillStyle = flash ? "#ffffff" : color;
    ctx.lineWidth = 3 * s;
    ctx.lineCap = "round";

    // Glow for ultimate
    if (isUlt) {
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 20;
    }

    // Head
    ctx.beginPath();
    ctx.arc(x, bodyTop + headR, headR, 0, Math.PI * 2);
    ctx.fill();

    // Boss crown for phase 3
    if (bossPhase === 3) {
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(x - headR, bodyTop + 2);
      ctx.lineTo(x - headR, bodyTop - 4 * s);
      ctx.lineTo(x - headR / 2, bodyTop);
      ctx.lineTo(x, bodyTop - 6 * s);
      ctx.lineTo(x + headR / 2, bodyTop);
      ctx.lineTo(x + headR, bodyTop - 4 * s);
      ctx.lineTo(x + headR, bodyTop + 2);
      ctx.fill();
      ctx.fillStyle = flash ? "#ffffff" : color;
    }

    // Body
    ctx.beginPath();
    ctx.moveTo(x, bodyTop + headR * 2);
    ctx.lineTo(x, bodyBot);
    ctx.stroke();

    // Arms
    if (attack === "punch" || (isUlt)) {
      // Attack arm extended
      const reach = isUlt ? 35 * s : 28 * s;
      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x + facing * reach, shoulderY);
      ctx.stroke();
      // Fist
      ctx.beginPath();
      ctx.arc(x + facing * reach, shoulderY, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      // Back arm
      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x - facing * 8 * s, shoulderY + 12 * s);
      ctx.stroke();
    } else if (windup && attack) {
      // Windup - arms pulled back
      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x - facing * 12 * s, shoulderY + 8 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x - facing * 6 * s, shoulderY + 14 * s);
      ctx.stroke();
    } else {
      const swing = Math.sin(walkPhase) * 6 * s;
      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x + swing, shoulderY + 16 * s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, shoulderY);
      ctx.lineTo(x - swing, shoulderY + 16 * s);
      ctx.stroke();
    }

    // Legs
    const legSwing = Math.sin(walkPhase) * 10 * s;
    if (!flash) {
      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.lineTo(x + legSwing, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.lineTo(x - legSwing, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, hipY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }

  // Mobile control helper
  const setKey = useCallback((key: string, val: boolean) => {
    gameDataRef.current.keys[key] = val;
  }, []);

  const stats: GameStat[] = [
    { label: "当前Boss", value: `${Math.min(dBossIdx + 1, 3)}/3`, icon: "👹" },
    { label: "分数", value: dScore, icon: "⭐" },
    { label: "用时", value: `${dTime}s`, icon: "⏱️" },
    { label: "最高分", value: bestScore, icon: "🏆" },
  ];

  if (!mounted) {
    return (
      <GameShell gameId={GAME_ID} title="火柴人Boss战" iconEmoji="⚔️" iconGradient="from-red-500 to-orange-500"
        stats={[{ label: "当前Boss", value: "—" }, { label: "分数", value: 0 }, { label: "用时", value: "—" }, { label: "最高分", value: 0 }]}
        shareScore={0} refreshKey={0}>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell gameId={GAME_ID} title="火柴人Boss战" iconEmoji="⚔️" iconGradient="from-red-500 to-orange-500"
      stats={stats} shareScore={dScore} refreshKey={refreshKey}>
      <div className="flex flex-col items-center p-4">
        <div className="relative w-full max-w-[800px]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full h-auto rounded-xl border border-gray-700 touch-none"
            style={{ aspectRatio: "800 / 450" }}
          />

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="text-5xl">⚔️</div>
              <h3 className="text-2xl font-bold text-white">火柴人Boss战</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                击败3个Boss！A/D移动，W跳跃，J攻击，K必杀技（能量满时）。Boss有3阶段，每阶段攻击模式不同。
              </p>
              <button onClick={startGame} aria-label="开始游戏"
                className="mt-2 inline-flex items-center justify-center min-h-[44px] px-8 text-base font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-lg shadow-red-600/30">
                开始战斗
              </button>
            </div>
          )}

          {/* Paused overlay */}
          {phase === "paused" && (
            <div className="absolute inset-0 rounded-xl bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
              <div className="text-4xl">⏸️</div>
              <h3 className="text-xl font-bold text-white">已暂停</h3>
              <div className="flex gap-3">
                <button onClick={togglePause} aria-label="继续游戏"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors">
                  继续 (P)
                </button>
                <button onClick={startGame} aria-label="重新开始"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  重新开始
                </button>
              </div>
            </div>
          )}

          {/* Game over overlay */}
          {phase === "over" && (
            <div className="absolute inset-0 rounded-xl bg-black/90 backdrop-blur-md flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="text-5xl">{gameDataRef.current.victory ? "🏆" : "💀"}</div>
              <h3 className="text-2xl font-bold text-white">
                {gameDataRef.current.victory ? "胜利！" : "游戏结束"}
              </h3>
              <p className="text-sm text-gray-400">最终分数</p>
              <p className="text-4xl font-bold text-red-400">{dScore}</p>
              <p className="text-xs text-gray-500">
                {dScore >= bestScore ? "新纪录！" : `最高分: ${bestScore}`}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <div><span className="text-gray-500">击败:</span> <span className="text-gray-300 font-bold">{Math.min(dBossIdx + (gameDataRef.current.victory ? 1 : 0), 3)}/3</span></div>
                <div><span className="text-gray-500">用时:</span> <span className="text-gray-300 font-bold">{dTime}s</span></div>
                <div><span className="text-gray-500">剩余HP:</span> <span className="text-gray-300 font-bold">{dHp}</span></div>
              </div>
              <button onClick={startGame} aria-label="再来一局"
                className="mt-4 inline-flex items-center justify-center min-h-[44px] px-8 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-lg shadow-red-600/30">
                再来一局
              </button>
            </div>
          )}
        </div>

        {/* Mobile controls */}
        {phase === "playing" && (
          <div className="mt-4 flex w-full max-w-[800px] items-center justify-between gap-2 sm:hidden">
            <div className="flex gap-2">
              <button
                onTouchStart={(e) => { e.preventDefault(); setKey("a", true); }}
                onTouchEnd={(e) => { e.preventDefault(); setKey("a", false); }}
                aria-label="向左移动"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-red-600 border border-gray-700"
              >←</button>
              <button
                onTouchStart={(e) => { e.preventDefault(); setKey("d", true); }}
                onTouchEnd={(e) => { e.preventDefault(); setKey("d", false); }}
                aria-label="向右移动"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-2xl flex items-center justify-center active:bg-red-600 border border-gray-700"
              >→</button>
            </div>
            <div className="flex gap-2">
              <button
                onTouchStart={(e) => { e.preventDefault(); setKey("w", true); setKey("w", false); }}
                aria-label="跳跃"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-sm font-bold flex items-center justify-center active:bg-cyan-600 border border-gray-700"
              >跳</button>
              <button
                onTouchStart={(e) => { e.preventDefault(); setKey("j", true); setKey("j", false); }}
                aria-label="攻击"
                className="w-14 h-14 rounded-xl bg-gray-800 text-white text-sm font-bold flex items-center justify-center active:bg-yellow-600 border border-gray-700"
              >攻</button>
              <button
                onTouchStart={(e) => { e.preventDefault(); setKey("k", true); setKey("k", false); }}
                aria-label="必杀技"
                className="w-14 h-14 rounded-xl bg-purple-900 text-white text-sm font-bold flex items-center justify-center active:bg-purple-600 border border-purple-700"
              >必杀</button>
            </div>
          </div>
        )}

        {/* Desktop controls hint */}
        {phase === "playing" && (
          <div className="mt-3 hidden sm:flex gap-4 text-xs text-gray-500">
            <span>A/D 移动</span><span>W 跳跃</span><span>J 攻击</span><span>K 必杀</span><span>P 暂停</span>
            <button onClick={togglePause} aria-label="暂停"
              className="inline-flex items-center justify-center min-h-[44px] px-4 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg">
              暂停 (P)
            </button>
          </div>
        )}
      </div>
    </GameShell>
  );
}
