"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Swords, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "stickman-battle";
const W = 600;
const H = 400;
const GROUND_Y = 340;
const BEST_SCORE_KEY = "gm_stickman_battle_best_score";
const GRAVITY = 0.55;
const MOVE_SPEED = 2.6;
const JUMP_VEL = -11;
const MAX_WAVES = 10;

interface Fighter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  facing: number;
  onGround: boolean;
  attackCooldown: number;
  attackType: "punch" | "kick" | "special" | null;
  attackTimer: number;
  attackHit: boolean;
  hitFlash: number;
  blockTimer: number;
  isPlayer: boolean;
  walkPhase: number;
  dead: boolean;
  deathTimer: number;
}

interface Effect {
  x: number;
  y: number;
  type: "hit" | "block" | "special" | "dust";
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  text?: string;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ============ 工具函数 ============ */

function makePlayer(): Fighter {
  return {
    x: 120,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    facing: 1,
    onGround: true,
    attackCooldown: 0,
    attackType: null,
    attackTimer: 0,
    attackHit: false,
    hitFlash: 0,
    blockTimer: 0,
    isPlayer: true,
    walkPhase: 0,
    dead: false,
    deathTimer: 0,
  };
}

function makeEnemy(wave: number, index: number): Fighter {
  const hp = 40 + wave * 12;
  return {
    x: W - 100 - index * 50,
    y: GROUND_Y,
    vx: 0,
    vy: 0,
    hp,
    maxHp: hp,
    facing: -1,
    onGround: true,
    attackCooldown: 60 + Math.random() * 60,
    attackType: null,
    attackTimer: 0,
    attackHit: false,
    hitFlash: 0,
    blockTimer: 0,
    isPlayer: false,
    walkPhase: 0,
    dead: false,
    deathTimer: 0,
  };
}

function getAttackRange(type: "punch" | "kick" | "special"): number {
  if (type === "punch") return 48;
  if (type === "kick") return 60;
  return 80;
}

function getAttackDamage(type: "punch" | "kick" | "special"): number {
  if (type === "punch") return 8;
  if (type === "kick") return 12;
  return 20;
}

/* ============ 组件 ============ */

export default function StickmanBattlePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const playerRef = useRef<Fighter>(makePlayer());
  const enemiesRef = useRef<Fighter[]>([]);
  const effectsRef = useRef<Effect[]>([]);
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
    punch: false,
    kick: false,
    special: false,
  });
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const animFrameRef = useRef(0);
  const waveRef = useRef(1);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);
  const waveTransitionRef = useRef(0);
  const specialCooldownRef = useRef(0);
  const pausedRef = useRef(false);
  const waveMsgTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [wave, setWave] = useState(1);
  const [hp, setHp] = useState(100);
  const [combo, setCombo] = useState(0);
  const [specialCd, setSpecialCd] = useState(0);
  const [waveMsg, setWaveMsg] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  /* ----- 绘制 ----- */
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    animFrameRef.current++;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1a1a2e");
    bg.addColorStop(0.5, "#16213e");
    bg.addColorStop(1, "#0f0f1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 远景山
    ctx.fillStyle = "rgba(100,100,150,0.15)";
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= W; x += 40) {
      const h = 60 + Math.sin(x * 0.02) * 30 + Math.cos(x * 0.05) * 20;
      ctx.lineTo(x, GROUND_Y - h);
    }
    ctx.lineTo(W, GROUND_Y);
    ctx.fill();

    // 地面
    const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    groundGrad.addColorStop(0, "#27272a");
    groundGrad.addColorStop(1, "#18181b");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // 地面线
    ctx.strokeStyle = "rgba(139,92,246,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();

    // 网格线
    ctx.strokeStyle = "rgba(139,92,246,0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + 15, H);
      ctx.stroke();
    }

    const player = playerRef.current;

    // 绘制特效（在角色后面）
    for (const e of effectsRef.current) {
      if (e.type === "dust") {
        ctx.save();
        ctx.globalAlpha = e.life / e.maxLife * 0.5;
        ctx.fillStyle = "#78787a";
        ctx.beginPath();
        ctx.arc(e.x, e.y, (1 - e.life / e.maxLife) * 12 + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 绘制敌人
    for (const enemy of enemiesRef.current) {
      drawFighter(ctx, enemy);
    }

    // 绘制玩家
    drawFighter(ctx, player);

    // 绘制特效（在角色前面）
    for (const e of effectsRef.current) {
      if (e.type === "hit") {
        ctx.save();
        ctx.globalAlpha = e.life / e.maxLife;
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 3;
        const r = (1 - e.life / e.maxLife) * 25 + 8;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (e.type === "block") {
        ctx.save();
        ctx.globalAlpha = e.life / e.maxLife;
        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("格挡!", e.x, e.y - (1 - e.life / e.maxLife) * 20);
        ctx.restore();
      } else if (e.type === "special") {
        ctx.save();
        ctx.globalAlpha = e.life / e.maxLife;
        const r = (1 - e.life / e.maxLife) * 60 + 20;
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
        grad.addColorStop(0, "rgba(168,85,247,0.6)");
        grad.addColorStop(0.5, "rgba(139,92,246,0.3)");
        grad.addColorStop(1, "rgba(139,92,246,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (e.type === "dust") {
        // already drawn
      }

      // 连击文字
      if (e.text) {
        ctx.save();
        ctx.globalAlpha = e.life / e.maxLife;
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(e.text, e.x, e.y - (1 - e.life / e.maxLife) * 30);
        ctx.restore();
      }
    }

    // 顶部 HUD
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, 50);

    // 玩家血条
    ctx.fillStyle = "#27272a";
    ctx.fillRect(10, 10, 180, 20);
    const pHpRatio = Math.max(0, player.hp / player.maxHp);
    const pHpGrad = ctx.createLinearGradient(10, 0, 190, 0);
    pHpGrad.addColorStop(0, "#22c55e");
    pHpGrad.addColorStop(1, pHpRatio > 0.3 ? "#4ade80" : "#ef4444");
    ctx.fillStyle = pHpGrad;
    ctx.fillRect(10, 10, 180 * pHpRatio, 20);
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 180, 20);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`HP ${Math.ceil(player.hp)}/${player.maxHp}`, 15, 25);

    // 波次显示
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`第 ${waveRef.current} / ${MAX_WAVES} 波`, W / 2, 30);

    // 分数
    ctx.textAlign = "right";
    ctx.fillText(`${scoreRef.current}`, W - 15, 30);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("分数", W - 15, 42);

    // 敌人血条（在角色头上）
    for (const enemy of enemiesRef.current) {
      if (enemy.dead) continue;
      const ex = enemy.x;
      const ey = enemy.y - 75;
      ctx.fillStyle = "#27272a";
      ctx.fillRect(ex - 30, ey, 60, 6);
      const eHpRatio = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(ex - 30, ey, 60 * eHpRatio, 6);
      ctx.strokeStyle = "#3f3f46";
      ctx.strokeRect(ex - 30, ey, 60, 6);
    }

    // 连击显示
    if (comboRef.current > 1 && comboTimerRef.current > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, comboTimerRef.current / 30);
      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`连击 x${comboRef.current}!`, W / 2, 70);
      ctx.restore();
    }
  }, []);

  /* ----- 绘制火柴人 ----- */
  function drawFighter(ctx: CanvasRenderingContext2D, f: Fighter) {
    if (f.dead) {
      // 倒地
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - f.deathTimer / 60);
      ctx.strokeStyle = f.isPlayer ? "#60a5fa" : "#f87171";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      const dy = Math.min(f.deathTimer * 0.5, 20);
      ctx.beginPath();
      ctx.moveTo(f.x - 20, f.y - dy);
      ctx.lineTo(f.x + 20, f.y - dy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(f.x - 15 * f.facing, f.y - dy - 8, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();
    const color = f.isPlayer ? "#60a5fa" : "#f87171";
    const flashColor = f.hitFlash > 0 ? "#fff" : color;
    ctx.strokeStyle = flashColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const cx = f.x;
    const headY = f.y - 65;
    const bodyTop = f.y - 58;
    const bodyBot = f.y - 25;
    const facing = f.facing;

    // 走路动画
    const walkOffset = f.onGround && Math.abs(f.vx) > 0.5 ? Math.sin(f.walkPhase) * 5 : 0;
    const legOffset = f.onGround && Math.abs(f.vx) > 0.5 ? Math.sin(f.walkPhase) * 8 : 0;

    // 阴影
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, GROUND_Y + 2, 22, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 头
    ctx.beginPath();
    ctx.arc(cx, headY, 8, 0, Math.PI * 2);
    ctx.stroke();

    // 眼睛
    if (!f.dead) {
      ctx.fillStyle = flashColor;
      ctx.beginPath();
      ctx.arc(cx + facing * 3, headY - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 身体
    ctx.beginPath();
    ctx.moveTo(cx, bodyTop);
    ctx.lineTo(cx, bodyBot);
    ctx.stroke();

    // 腿
    if (f.onGround) {
      ctx.beginPath();
      ctx.moveTo(cx, bodyBot);
      ctx.lineTo(cx - 8 + legOffset, f.y);
      ctx.moveTo(cx, bodyBot);
      ctx.lineTo(cx + 8 - legOffset, f.y);
      ctx.stroke();
    } else {
      // 跳跃
      ctx.beginPath();
      ctx.moveTo(cx, bodyBot);
      ctx.lineTo(cx - 6, f.y - 12);
      ctx.moveTo(cx, bodyBot);
      ctx.lineTo(cx + 6, f.y - 12);
      ctx.stroke();
    }

    // 手臂 / 攻击
    if (f.attackType && f.attackTimer > 0) {
      const progress = 1 - f.attackTimer / (f.attackType === "special" ? 25 : 15);
      const reach = getAttackRange(f.attackType) * Math.sin(progress * Math.PI);
      const armY = bodyTop + 8;

      if (f.attackType === "punch") {
        // 出拳
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(cx + facing * reach, armY);
        ctx.stroke();
        // 拳头
        ctx.fillStyle = flashColor;
        ctx.beginPath();
        ctx.arc(cx + facing * reach, armY, 5, 0, Math.PI * 2);
        ctx.fill();
        // 另一只手
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(cx - facing * 8, armY + 5);
        ctx.stroke();
      } else if (f.attackType === "kick") {
        // 踢腿
        const kickY = bodyBot + 5;
        ctx.beginPath();
        ctx.moveTo(cx, kickY);
        ctx.lineTo(cx + facing * reach, kickY - 5);
        ctx.stroke();
        // 脚
        ctx.fillStyle = flashColor;
        ctx.beginPath();
        ctx.arc(cx + facing * reach, kickY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        // 手臂保持平衡
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(cx - facing * 10, armY - 5);
        ctx.moveTo(cx, armY);
        ctx.lineTo(cx - facing * 6, armY + 8);
        ctx.stroke();
      } else if (f.attackType === "special") {
        // 特殊技 — 能量波
        ctx.save();
        ctx.shadowColor = "#a855f7";
        ctx.shadowBlur = 15;
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, armY);
        ctx.lineTo(cx + facing * reach, armY);
        ctx.stroke();
        // 能量球
        ctx.fillStyle = "#c084fc";
        ctx.beginPath();
        ctx.arc(cx + facing * reach, armY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        // 另一只手也前伸
        ctx.beginPath();
        ctx.moveTo(cx, armY + 5);
        ctx.lineTo(cx + facing * reach * 0.7, armY + 5);
        ctx.stroke();
      }
    } else {
      // 普通手臂
      const armOffset = f.onGround && Math.abs(f.vx) > 0.5 ? Math.sin(f.walkPhase) * 4 : 0;
      ctx.beginPath();
      ctx.moveTo(cx, bodyTop + 5);
      ctx.lineTo(cx - 10, bodyTop + 15 + armOffset);
      ctx.moveTo(cx, bodyTop + 5);
      ctx.lineTo(cx + 10, bodyTop + 15 - armOffset);
      ctx.stroke();
    }

    // 格挡指示
    if (f.blockTimer > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, f.y - 35, 25, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  /* ----- 攻击命中检测 ----- */
  function checkAttackHit(attacker: Fighter, defenders: Fighter[]) {
    if (attacker.attackHit || !attacker.attackType) return;
    const range = getAttackRange(attacker.attackType);
    const damage = getAttackDamage(attacker.attackType);
    const armY = attacker.y - 50;
    const attackX = attacker.x + attacker.facing * range;

    for (const defender of defenders) {
      if (defender.dead || defender === attacker) continue;
      const dx = Math.abs(defender.x - attackX);
      const dy = Math.abs(defender.y - 35 - armY);
      if (dx < 30 && dy < 40) {
        // 格挡检测
        if (
          defender.blockTimer > 0 &&
          defender.facing !== attacker.facing
        ) {
          effectsRef.current.push({
            x: defender.x,
            y: defender.y - 50,
            type: "block",
            life: 20,
            maxLife: 20,
            vx: 0,
            vy: 0,
          });
          attacker.attackHit = true;
          // 推后
          defender.vx += attacker.facing * 3;
          return;
        }

        // 命中
        defender.hp -= damage;
        defender.hitFlash = 8;
        defender.vx += attacker.facing * (attacker.attackType === "special" ? 6 : 3);
        attacker.attackHit = true;

        effectsRef.current.push({
          x: defender.x,
          y: defender.y - 40,
          type: attacker.attackType === "special" ? "special" : "hit",
          life: 15,
          maxLife: 15,
          vx: 0,
          vy: 0,
        });

        if (attacker.isPlayer) {
          comboRef.current++;
          comboTimerRef.current = 60;
          setCombo(comboRef.current);
          const comboBonus = comboRef.current > 1 ? comboRef.current * 5 : 0;
          effectsRef.current.push({
            x: defender.x,
            y: defender.y - 80,
            type: "hit",
            life: 30,
            maxLife: 30,
            vx: 0,
            vy: -1,
            text: comboRef.current > 1 ? `${comboRef.current}连击!` : `-${damage}`,
          });
          if (defender.hp <= 0) {
            defender.dead = true;
            defender.deathTimer = 0;
            const waveBonus = waveRef.current * 10;
            scoreRef.current += 100 + waveBonus + comboBonus;
            setScore(scoreRef.current);
          }
        }
        return;
      }
    }
  }

  /* ----- 更新 ----- */
  const update = useCallback(() => {
    const player = playerRef.current;
    const input = inputRef.current;

    // 波次过渡
    if (waveTransitionRef.current > 0) {
      waveTransitionRef.current--;
      // 仍更新特效
      for (const e of effectsRef.current) {
        e.life--;
        e.x += e.vx;
        e.y += e.vy;
      }
      effectsRef.current = effectsRef.current.filter((e) => e.life > 0);
      return;
    }

    // 玩家输入
    if (input.left) {
      player.vx = -MOVE_SPEED;
      player.facing = -1;
    } else if (input.right) {
      player.vx = MOVE_SPEED;
      player.facing = 1;
    } else {
      player.vx *= 0.7;
    }

    if (input.jump && player.onGround) {
      player.vy = JUMP_VEL;
      player.onGround = false;
      effectsRef.current.push({
        x: player.x,
        y: GROUND_Y,
        type: "dust",
        life: 15,
        maxLife: 15,
        vx: 0,
        vy: 0,
      });
    }

    // 攻击
    if (input.punch && player.attackCooldown <= 0 && !player.attackType) {
      player.attackType = "punch";
      player.attackTimer = 15;
      player.attackHit = false;
      player.attackCooldown = 20;
    }
    if (input.kick && player.attackCooldown <= 0 && !player.attackType) {
      player.attackType = "kick";
      player.attackTimer = 18;
      player.attackHit = false;
      player.attackCooldown = 25;
    }
    if (
      input.special &&
      player.attackCooldown <= 0 &&
      !player.attackType &&
      specialCooldownRef.current <= 0
    ) {
      player.attackType = "special";
      player.attackTimer = 25;
      player.attackHit = false;
      player.attackCooldown = 35;
      specialCooldownRef.current = 180;
    }

    input.punch = false;
    input.kick = false;
    input.special = false;

    // 更新玩家
    updateFighter(player);

    // 更新敌人
    const aliveEnemies = enemiesRef.current.filter((e) => !e.dead);
    for (const enemy of aliveEnemies) {
      updateEnemyAI(enemy, player);
      updateFighter(enemy);
    }

    // 攻击命中检测
    if (player.attackType && player.attackTimer > 0 && !player.attackHit) {
      checkAttackHit(player, enemiesRef.current);
    }
    for (const enemy of aliveEnemies) {
      if (enemy.attackType && enemy.attackTimer > 0 && !enemy.attackHit) {
        checkAttackHit(enemy, [player]);
      }
    }

    // 更新特效
    for (const e of effectsRef.current) {
      e.life--;
      e.x += e.vx;
      e.y += e.vy;
    }
    effectsRef.current = effectsRef.current.filter((e) => e.life > 0);

    // 连击计时
    if (comboTimerRef.current > 0) {
      comboTimerRef.current--;
      if (comboTimerRef.current <= 0) {
        comboRef.current = 0;
        setCombo(0);
      }
    }

    // 特殊技能冷却
    if (specialCooldownRef.current > 0) {
      specialCooldownRef.current--;
      setSpecialCd(Math.ceil(specialCooldownRef.current / 60));
    }

    // 清理死亡敌人
    for (const e of enemiesRef.current) {
      if (e.dead) {
        e.deathTimer++;
      }
    }
    enemiesRef.current = enemiesRef.current.filter(
      (e) => !e.dead || e.deathTimer < 60,
    );

    // 检查波次完成
    if (enemiesRef.current.filter((e) => !e.dead).length === 0 && !overRef.current) {
      if (waveRef.current >= MAX_WAVES) {
        // 通关
        scoreRef.current += 500;
        setScore(scoreRef.current);
        doGameOver(true);
      } else {
        waveRef.current++;
        setWave(waveRef.current);
        spawnWave(waveRef.current);
        waveTransitionRef.current = 90;
        setWaveMsg(`第 ${waveRef.current} 波`);
        const waveTid = setTimeout(() => setWaveMsg(null), 2000);
        waveMsgTimersRef.current.push(waveTid);
      }
    }

    // 玩家死亡
    if (player.hp <= 0 && !overRef.current) {
      doGameOver(false);
    }

    // 更新 UI
    setHp(Math.max(0, Math.ceil(player.hp)));
  }, []);

  /* ----- 更新战士物理 ----- */
  function updateFighter(f: Fighter) {
    f.vy += GRAVITY;
    f.x += f.vx;
    f.y += f.vy;

    if (f.y >= GROUND_Y) {
      f.y = GROUND_Y;
      f.vy = 0;
      f.onGround = true;
    } else {
      f.onGround = false;
    }

    if (f.x < 30) f.x = 30;
    if (f.x > W - 30) f.x = W - 30;

    if (f.vx > 0.5 || f.vx < -0.5) {
      f.walkPhase += 0.25;
    }

    if (f.attackTimer > 0) {
      f.attackTimer--;
      if (f.attackTimer <= 0) {
        f.attackType = null;
      }
    }
    if (f.attackCooldown > 0) f.attackCooldown--;
    if (f.hitFlash > 0) f.hitFlash--;
    if (f.blockTimer > 0) f.blockTimer--;
  }

  /* ----- 敌人 AI ----- */
  function updateEnemyAI(enemy: Fighter, player: Fighter) {
    if (enemy.dead) return;
    const dx = player.x - enemy.x;
    const dist = Math.abs(dx);
    enemy.facing = dx > 0 ? 1 : -1;

    if (dist > 70) {
      // 接近
      enemy.vx = enemy.facing * MOVE_SPEED * 0.7;
    } else {
      // 攻击范围
      enemy.vx *= 0.5;
      if (enemy.attackCooldown <= 0 && !enemy.attackType) {
        const r = Math.random();
        if (r < 0.6) {
          enemy.attackType = "punch";
          enemy.attackTimer = 15;
          enemy.attackHit = false;
          enemy.attackCooldown = 50 + Math.random() * 40;
        } else if (r < 0.85) {
          enemy.attackType = "kick";
          enemy.attackTimer = 18;
          enemy.attackHit = false;
          enemy.attackCooldown = 60 + Math.random() * 40;
        } else {
          // 格挡
          enemy.blockTimer = 30;
          enemy.attackCooldown = 40;
        }
      }
    }

    // 偶尔跳跃
    if (dist > 100 && Math.random() < 0.005 && enemy.onGround) {
      enemy.vy = JUMP_VEL * 0.8;
      enemy.onGround = false;
    }
  }

  /* ----- 生成波次 ----- */
  function spawnWave(wave: number) {
    const count = Math.min(3 + Math.floor(wave / 2), 6);
    enemiesRef.current = [];
    for (let i = 0; i < count; i++) {
      enemiesRef.current.push(makeEnemy(wave, i));
    }
  }

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback((victory: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finalScore = scoreRef.current + (victory ? 1000 : 0);
    scoreRef.current = finalScore;
    setScore(finalScore);
    const r = submitScore(GAME_ID, finalScore, `${finalScore} 分${victory ? " (通关)" : ""}`);
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
    return () => {
      cancelAnimationFrame(raf);
      waveMsgTimersRef.current.forEach((id) => clearTimeout(id));
      waveMsgTimersRef.current = [];
    };
  }, [update, draw]);

  /* ----- mounted 初始化 ----- */
  useEffect(() => {
    setMounted(true);
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

  /* ----- 暂停/继续 ----- */
  const togglePause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    playerRef.current = makePlayer();
    enemiesRef.current = [];
    effectsRef.current = [];
    waveRef.current = 1;
    scoreRef.current = 0;
    comboRef.current = 0;
    comboTimerRef.current = 0;
    specialCooldownRef.current = 0;
    overRef.current = false;
    submittedRef.current = false;
    waveTransitionRef.current = 0;
    waveMsgTimersRef.current.forEach((id) => clearTimeout(id));
    waveMsgTimersRef.current = [];
    pausedRef.current = false;
    setScore(0);
    setCombo(0);
    setWave(1);
    setHp(100);
    setSpecialCd(0);
    setOver(false);
    setResult(null);
    setPaused(false);
    runningRef.current = true;
    setRunning(true);
    spawnWave(1);
    setWaveMsg("第 1 波");
    const startTid = setTimeout(() => setWaveMsg(null), 2000);
    waveMsgTimersRef.current.push(startTid);
  }, []);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    start();
  }, [start]);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "a" || k === "arrowleft") {
        inputRef.current.left = true;
        e.preventDefault();
      } else if (k === "d" || k === "arrowright") {
        inputRef.current.right = true;
        e.preventDefault();
      } else if (k === "w" || k === "arrowup" || k === " ") {
        inputRef.current.jump = true;
        e.preventDefault();
      } else if (k === "j") {
        inputRef.current.punch = true;
        e.preventDefault();
      } else if (k === "k") {
        inputRef.current.kick = true;
        e.preventDefault();
      } else if (k === "l") {
        inputRef.current.special = true;
        e.preventDefault();
      } else if (k === "p") {
        togglePause();
        e.preventDefault();
      } else if (k === "enter") {
        if (!runningRef.current) start();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "a" || k === "arrowleft") {
        inputRef.current.left = false;
      } else if (k === "d" || k === "arrowright") {
        inputRef.current.right = false;
      } else if (k === "w" || k === "arrowup" || k === " ") {
        inputRef.current.jump = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [start, togglePause]);

  /* ----- 移动端按钮控制 ----- */
  const holdBtn = (key: "left" | "right" | "jump") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      inputRef.current[key] = true;
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      inputRef.current[key] = false;
    },
    onPointerLeave: () => {
      inputRef.current[key] = false;
    },
  });

  const tapBtn = (key: "punch" | "kick" | "special") => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      inputRef.current[key] = true;
    },
  });

  const stats: GameStat[] = [
    { label: "当前分数", value: score },
    { label: "波次", value: `${wave}/${MAX_WAVES}` },
    { label: "连击", value: combo > 0 ? `x${combo}` : "—" },
    { label: "最高记录", value: best },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="火柴人对战"
        description="控制火柴人战士击败一波波敌人！拳打、脚踢、特殊技能，连击越多分数越高。10波挑战，每波敌人更强！"
        instructions={`键盘控制：
  A/D 或 ← → = 左右移动
  W / 空格 / ↑ = 跳跃
  J = 出拳（快速，低伤害）
  K = 踢腿（中速，中伤害）
  L = 特殊技能（高伤害，有冷却）
攻击技巧：
  连续命中敌人可触发连击，连击越高分数奖励越多
  敌人有时会格挡，注意变换攻击方式
  特殊技能有3秒冷却，可击退敌人并造成大伤害
共10波，每波敌人数量和血量递增，通关有额外奖励！`}
        icon={Swords}
        iconEmoji="🥋"
        iconGradient="from-slate-500 to-gray-700"
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
      title="火柴人对战"
      description="控制火柴人战士击败一波波敌人！拳打、脚踢、特殊技能，连击越多分数越高。10波挑战，每波敌人更强！"
      instructions={`键盘控制：
  A/D 或 ← → = 左右移动
  W / 空格 / ↑ = 跳跃
  J = 出拳（快速，低伤害）
  K = 踢腿（中速，中伤害）
  L = 特殊技能（高伤害，有冷却）
攻击技巧：
  连续命中敌人可触发连击，连击越高分数奖励越多
  敌人有时会格挡，注意变换攻击方式
  特殊技能有3秒冷却，可击退敌人并造成大伤害
共10波，每波敌人数量和血量递增，通关有额外奖励！`}
      icon={Swords}
      iconEmoji="🥋"
      iconGradient="from-slate-500 to-gray-700"
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
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-slate-500/10"
          />

          {/* 波次提示 */}
          {waveMsg && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-4xl font-bold text-white animate-pulse drop-shadow-lg">
                {waveMsg}
              </div>
            </div>
          )}

          {/* 待开始覆盖层 */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-xl transition-colors shadow-lg shadow-slate-500/30"
              >
                <Play className="w-5 h-5" /> 开始战斗
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-4 leading-relaxed">
                A/D 移动 · W 跳跃 · J 拳 · K 踢 · L 特殊
              </p>
            </div>
          )}

          {/* 暂停覆盖层 */}
          {paused && running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <h3 className="text-2xl font-bold text-white mb-4">已暂停</h3>
              <button
                onClick={togglePause}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-xl transition-colors shadow-lg shadow-slate-500/30"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">{score >= best && score > 0 ? "🏆" : "🥋"}</div>
              <h3 className="text-2xl font-bold mb-2">
                {waveRef.current >= MAX_WAVES && hp > 0 ? "通关胜利！" : "战斗结束"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-slate-300 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-slate-300 font-bold">{result.rank}</span>/{result.total}
                  ，超越了 <span className="text-slate-300 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-xl transition-colors shadow-lg shadow-slate-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再战一局
              </button>
            </div>
          )}
        </div>

        {/* 特殊技能冷却指示 */}
        {running && !over && specialCd > 0 && (
          <div className="mt-2 text-xs text-slate-500">
            特殊技能冷却: <span className="text-purple-400 font-bold">{specialCd}s</span>
          </div>
        )}

        {/* 移动端控制 */}
        <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-md">
          {/* 方向键 */}
          <div className="flex items-center gap-3">
            <button
              {...holdBtn("left")}
              className="w-16 h-12 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-slate-600 active:scale-95 transition-all border border-[#3f3f46] text-xl"
            >
              ◀
            </button>
            <button
              {...holdBtn("jump")}
              className="w-16 h-12 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-slate-600 active:scale-95 transition-all border border-[#3f3f46] text-xs font-bold"
            >
              跳跃
            </button>
            <button
              {...holdBtn("right")}
              className="w-16 h-12 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-slate-600 active:scale-95 transition-all border border-[#3f3f46] text-xl"
            >
              ▶
            </button>
          </div>
          {/* 攻击键 */}
          <div className="flex items-center gap-3">
            <button
              {...tapBtn("punch")}
              className="w-16 h-14 rounded-xl bg-blue-600/30 text-blue-300 flex items-center justify-center active:bg-blue-600 active:scale-95 transition-all border border-blue-600/50 text-xs font-bold"
            >
              拳 J
            </button>
            <button
              {...tapBtn("kick")}
              className="w-16 h-14 rounded-xl bg-amber-600/30 text-amber-300 flex items-center justify-center active:bg-amber-600 active:text-white active:scale-95 transition-all border border-amber-600/50 text-xs font-bold"
            >
              踢 K
            </button>
            <button
              {...tapBtn("special")}
              className={`w-16 h-14 rounded-xl text-purple-300 flex items-center justify-center active:scale-95 transition-all border text-xs font-bold ${
                specialCd > 0
                  ? "bg-purple-900/20 border-purple-900/30 opacity-50"
                  : "bg-purple-600/30 border-purple-600/50 active:bg-purple-600 active:text-white"
              }`}
            >
              {specialCd > 0 ? `${specialCd}s` : "必杀 L"}
            </button>
          </div>

          {/* 开始/暂停/重开按钮 */}
          <div className="flex items-center gap-3 mt-2">
            {!running && !over && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 rounded-xl transition-colors shadow-lg shadow-slate-500/30"
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
      </div>
    </GameShell>
  );
}
