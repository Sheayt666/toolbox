"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Rocket, RotateCcw, Play, Pause, Crosshair } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "ragdoll-launch";
const CANVAS_W = 600;
const CANVAS_H = 500;
const BEST_SCORE_KEY = "gm_ragdolllaunch_best_score";
const GROUND_Y = 470;
const CANNON_X = 60;
const CANNON_Y = 420;
const TOTAL_SHOTS = 10;

// 物理常量（按 60fps 固定步长）
const GRAVITY = 0.42;
const AIR = 0.992;
const RESTITUTION = 0.42;
const MAX_V = 22;

interface Pt {
  x: number;
  y: number;
  px: number;
  py: number;
  r: number;
}
interface Stick {
  a: number;
  b: number;
  len: number;
  vis: number; // 线宽
}
interface Ragdoll {
  pts: Pt[];
  sticks: Stick[];
  alive: boolean;
}
interface Target { x: number; y: number; r: number; pts: number; color: string; hitCd: number; pulse: number; }
interface Bumper { x: number; y: number; r: number; cd: number; }
interface FloatText { x: number; y: number; text: string; life: number; color: string; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }
interface Result { rank: number; total: number; beatPercent: number; }

function makeRagdoll(x: number, y: number, vx: number, vy: number): Ragdoll {
  const layout: { dx: number; dy: number; r: number }[] = [
    { dx: 0, dy: -30, r: 8 }, { dx: 0, dy: -10, r: 4 }, { dx: 0, dy: 15, r: 5 },
    { dx: -12, dy: -5, r: 4 }, { dx: 12, dy: -5, r: 4 }, { dx: -8, dy: 30, r: 5 }, { dx: 8, dy: 30, r: 5 },
  ];
  const pts: Pt[] = layout.map((l) => ({ x: x + l.dx, y: y + l.dy, px: x + l.dx - vx, py: y + l.dy - vy, r: l.r }));
  const sticks: Stick[] = [
    { a: 0, b: 1, len: 20, vis: 5 }, { a: 1, b: 2, len: 25, vis: 7 },
    { a: 1, b: 3, len: 15, vis: 4 }, { a: 1, b: 4, len: 15, vis: 4 },
    { a: 2, b: 5, len: 22, vis: 5 }, { a: 2, b: 6, len: 22, vis: 5 },
    { a: 2, b: 3, len: 20, vis: 0 }, { a: 2, b: 4, len: 20, vis: 0 }, { a: 0, b: 2, len: 45, vis: 0 },
  ];
  return { pts, sticks, alive: true };
}

function randTarget(): Target {
  const kinds = [
    { r: 27, pts: 50, color: "#f472b6" }, { r: 20, pts: 100, color: "#fb7185" }, { r: 14, pts: 200, color: "#fda4af" },
  ];
  const k = kinds[Math.floor(Math.random() * kinds.length)];
  return { x: 320 + Math.random() * 250, y: 120 + Math.random() * 280, r: k.r, pts: k.pts, color: k.color, hitCd: 0, pulse: Math.random() * Math.PI * 2 };
}

export default function RagdollLaunchPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ragdollRef = useRef<Ragdoll | null>(null);
  const targetsRef = useRef<Target[]>([]);
  const bumpersRef = useRef<Bumper[]>([
    { x: 250, y: 300, r: 18, cd: 0 },
    { x: 430, y: 200, r: 18, cd: 0 },
    { x: 360, y: 380, r: 16, cd: 0 },
  ]);
  const particlesRef = useRef<Particle[]>([]);
  const floatsRef = useRef<FloatText[]>([]);
  const trailRef = useRef<{ x: number; y: number; life: number }[]>([]);

  const scoreRef = useRef(0);
  const shotsRef = useRef(TOTAL_SHOTS);
  const bestRef = useRef(0);
  const stateRef = useRef<"aim" | "flying" | "gameover">("aim");
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const aimAngleRef = useRef(-Math.PI / 4);
  const chargingRef = useRef(false);
  const chargeStartRef = useRef(0);
  const powerRef = useRef(0);
  const restTimerRef = useRef(0);
  const betweenTimerRef = useRef(0);
  const animFrameRef = useRef(0);

  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(TOTAL_SHOTS);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const gameOverRef = useRef<() => void>(() => {});

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, n: number, spd = 4) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = Math.random() * spd + 1;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 1,
          life: 30 + Math.random() * 20,
          color,
        });
      }
    },
    [],
  );

  const addFloat = useCallback((x: number, y: number, text: string, color: string) => {
    floatsRef.current.push({ x, y, text, life: 60, color });
  }, []);

  const fire = useCallback(() => {
    if (stateRef.current !== "aim" || shotsRef.current <= 0) return;
    const power = Math.max(0.18, powerRef.current);
    const speed = 6 + power * 11;
    const ang = aimAngleRef.current;
    const vx = Math.cos(ang) * speed;
    const vy = Math.sin(ang) * speed;
    const mx = CANNON_X + Math.cos(ang) * 34;
    const my = CANNON_Y + Math.sin(ang) * 34;
    ragdollRef.current = makeRagdoll(mx, my, vx, vy);
    trailRef.current = [];
    stateRef.current = "flying";
    restTimerRef.current = 0;
    shotsRef.current -= 1;
    setShots(shotsRef.current);
    spawnParticles(mx, my, "#f9a8d4", 10, 3);
  }, [spawnParticles]);

  const endShot = useCallback(() => {
    ragdollRef.current = null;
    trailRef.current = [];
    if (shotsRef.current <= 0) {
      gameOverRef.current();
      return;
    }
    stateRef.current = "aim";
    betweenTimerRef.current = 12;
  }, []);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    runningRef.current = false;
    setRunning(false);
    stateRef.current = "gameover";
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `${s}分 ${TOTAL_SHOTS - shotsRef.current}发`);
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

  const physicsStep = useCallback(() => {
    const rd = ragdollRef.current;
    if (!rd || !rd.alive) return;
    const pts = rd.pts;

    // verlet 积分
    for (const p of pts) {
      let vx = (p.x - p.px) * AIR;
      let vy = (p.y - p.py) * AIR;
      // 限速
      const sp = Math.hypot(vx, vy);
      if (sp > MAX_V) {
        vx = (vx / sp) * MAX_V;
        vy = (vy / sp) * MAX_V;
      }
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + GRAVITY;
    }

    // 约束求解
    for (let it = 0; it < 6; it++) {
      for (const s of rd.sticks) {
        const a = pts[s.a];
        const b = pts[s.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = ((s.len - d) / d) * 0.5;
        const ox = dx * diff;
        const oy = dy * diff;
        a.x -= ox;
        a.y -= oy;
        b.x += ox;
        b.y += oy;
      }
      // 边界 / 碰撞
      for (const p of pts) {
        // 地面
        if (p.y + p.r > GROUND_Y) {
          const v = p.y - p.py;
          p.y = GROUND_Y - p.r;
          p.py = p.y + v * RESTITUTION;
          // 地面摩擦
          p.px = p.x - (p.x - p.px) * 0.86;
        }
        // 左右墙
        if (p.x - p.r < 0) {
          const v = p.x - p.px;
          p.x = p.r;
          p.px = p.x + v * RESTITUTION;
        }
        if (p.x + p.r > CANVAS_W) {
          const v = p.x - p.px;
          p.x = CANVAS_W - p.r;
          p.px = p.x + v * RESTITUTION;
        }
        if (p.y - p.r < 0) {
          const v = p.y - p.py;
          p.y = p.r;
          p.py = p.y + v * RESTITUTION;
        }
      }
      // 弹珠碰撞
      for (const b of bumpersRef.current) {
        for (const p of pts) {
          const dx = p.x - b.x;
          const dy = p.y - b.y;
          const d = Math.hypot(dx, dy);
          const min = b.r + p.r;
          if (d < min) {
            const nx = dx / (d || 1);
            const ny = dy / (d || 1);
            const push = (min - d) * 1.0;
            p.x += nx * push;
            p.y += ny * push;
            // 反弹加速
            const v = Math.hypot(p.x - p.px, p.y - p.py);
            const boost = Math.max(4, v * 1.4);
            p.px = p.x - nx * boost;
            p.py = p.y - ny * boost;
            if (b.cd <= 0) {
              scoreRef.current += 25;
              setScore(scoreRef.current);
              addFloat(b.x, b.y - b.r - 6, "+25", "#fbbf24");
              spawnParticles(b.x, b.y, "#fbbf24", 8, 3);
              b.cd = 12;
            }
          }
        }
      }
      // 目标碰撞
      for (const t of targetsRef.current) {
        if (t.hitCd > 0) continue;
        for (const p of pts) {
          const dx = p.x - t.x;
          const dy = p.y - t.y;
          if (dx * dx + dy * dy < (t.r + p.r) * (t.r + p.r)) {
            scoreRef.current += t.pts;
            setScore(scoreRef.current);
            addFloat(t.x, t.y - t.r - 6, `+${t.pts}`, t.color);
            spawnParticles(t.x, t.y, t.color, 14, 4);
            // 反弹一点
            const nx = dx / (Math.hypot(dx, dy) || 1);
            const ny = dy / (Math.hypot(dx, dy) || 1);
            for (const q of pts) {
              q.px = q.x - nx * 3;
              q.py = q.y - ny * 3;
            }
            // 重新定位目标
            const nt = randTarget();
            t.x = nt.x;
            t.y = nt.y;
            t.r = nt.r;
            t.pts = nt.pts;
            t.color = nt.color;
            t.hitCd = 20;
            break;
          }
        }
      }
    }

    // 拖尾
    const head = pts[0];
    trailRef.current.push({ x: head.x, y: head.y, life: 20 });
    if (trailRef.current.length > 30) trailRef.current.shift();

    // 判定本轮结束
    let totalV = 0;
    for (const p of pts) totalV += Math.hypot(p.x - p.px, p.y - p.py);
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    if (cx > CANVAS_W + 30 || cx < -30) {
      endShot();
      return;
    }
    if (totalV < 1.2) {
      restTimerRef.current++;
      if (restTimerRef.current > 50) endShot();
    } else {
      restTimerRef.current = 0;
    }
  }, [addFloat, spawnParticles, endShot]);

  const step = useCallback(
    (dt: number) => {
      const steps = Math.max(1, Math.min(3, Math.round(dt)));
      for (let i = 0; i < steps; i++) physicsStep();

      // 充能功率（三角波 0..1..0）
      if (chargingRef.current && stateRef.current === "aim") {
        const t = (performance.now() - chargeStartRef.current) / 1000;
        powerRef.current = Math.abs(((t * 0.85) % 2) - 1);
      }

      // 冷却递减
      for (const b of bumpersRef.current) if (b.cd > 0) b.cd -= steps;
      for (const t of targetsRef.current) {
        if (t.hitCd > 0) t.hitCd -= steps;
        t.pulse += 0.05 * steps;
      }
      // 粒子
      for (const p of particlesRef.current) {
        p.vy += 0.2 * steps;
        p.x += p.vx * steps;
        p.y += p.vy * steps;
        p.life -= steps;
      }
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      // 浮字
      for (const f of floatsRef.current) {
        f.y -= 0.6 * steps;
        f.life -= steps;
      }
      floatsRef.current = floatsRef.current.filter((f) => f.life > 0);
      // 拖尾衰减
      for (const tr of trailRef.current) tr.life -= steps;
      trailRef.current = trailRef.current.filter((tr) => tr.life > 0);
      // 间隔
      if (betweenTimerRef.current > 0) betweenTimerRef.current -= steps;
    },
    [physicsStep],
  );

  const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    animFrameRef.current++;
    const t = animFrameRef.current;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bg.addColorStop(0, "#1a0a14");
    bg.addColorStop(1, "#0a0608");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    // 星点
    ctx.fillStyle = "rgba(244,114,182,0.25)";
    for (let i = 0; i < 50; i++) {
      const x = (i * 73) % CANVAS_W;
      const y = (i * 41) % (GROUND_Y - 20);
      const s = (i % 3) + 1;
      ctx.fillRect(x, y, s * 0.5, s * 0.5);
    }

    // 地面
    const gg = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_H);
    gg.addColorStop(0, "#3f1d2e");
    gg.addColorStop(1, "#1a0d14");
    ctx.fillStyle = gg;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    ctx.strokeStyle = "#f472b6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();

    // 弹珠
    for (const b of bumpersRef.current) {
      ctx.save();
      const flash = b.cd > 0 ? b.cd / 12 : 0;
      const grad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, b.r);
      grad.addColorStop(0, flash > 0 ? "#fef08a" : "#fda4af");
      grad.addColorStop(1, "#be185d");
      ctx.fillStyle = grad;
      ctx.shadowColor = "#f472b6";
      ctx.shadowBlur = 10 + flash * 20;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 目标
    for (const tg of targetsRef.current) {
      ctx.save();
      const pulse = 1 + Math.sin(tg.pulse) * 0.06;
      const rr = tg.r * pulse;
      ctx.shadowColor = tg.color;
      ctx.shadowBlur = 16;
      const grad = ctx.createRadialGradient(tg.x, tg.y, 2, tg.x, tg.y, rr);
      grad.addColorStop(0, "#fff");
      grad.addColorStop(0.4, tg.color);
      grad.addColorStop(1, "#831843");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // 环
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(tg.x, tg.y, rr * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      // 分值
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${tg.pts}`, tg.x, tg.y);
      ctx.restore();
    }

    // 拖尾
    for (let i = 0; i < trailRef.current.length; i++) {
      const tr = trailRef.current[i];
      ctx.save();
      ctx.globalAlpha = (tr.life / 20) * 0.5;
      ctx.fillStyle = "#f9a8d4";
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 3 * (i / trailRef.current.length) + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 布偶
    const rd = ragdollRef.current;
    if (rd) {
      ctx.save();
      // 肢体
      for (const s of rd.sticks) {
        if (s.vis <= 0) continue;
        const a = rd.pts[s.a];
        const b = rd.pts[s.b];
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = s.vis;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // 关节
      for (let i = 1; i < rd.pts.length; i++) {
        const p = rd.pts[i];
        ctx.fillStyle = "#f9a8d4";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 头
      const h = rd.pts[0];
      ctx.shadowColor = "#fb7185";
      ctx.shadowBlur = 10;
      const hg = ctx.createRadialGradient(h.x - 2, h.y - 2, 1, h.x, h.y, h.r);
      hg.addColorStop(0, "#ffe4e6");
      hg.addColorStop(1, "#f43f5e");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 粒子
    for (const p of particlesRef.current) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / 40);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 浮字
    for (const f of floatsRef.current) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, f.life / 60);
      ctx.fillStyle = f.color;
      ctx.font = "bold 16px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 8;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    // 大炮
    ctx.save();
    ctx.translate(CANNON_X, CANNON_Y);
    // 基座
    ctx.fillStyle = "#3f3f46";
    drawRoundRect(ctx, -22, -6, 44, 28, 6);
    ctx.fill();
    ctx.fillStyle = "#52525b";
    drawRoundRect(ctx, -18, -4, 36, 8, 4);
    ctx.fill();
    // 炮管
    ctx.rotate(aimAngleRef.current);
    const barrelGrad = ctx.createLinearGradient(0, -8, 0, 8);
    barrelGrad.addColorStop(0, "#f9a8d4");
    barrelGrad.addColorStop(0.5, "#fb7185");
    barrelGrad.addColorStop(1, "#be185d");
    ctx.fillStyle = barrelGrad;
    drawRoundRect(ctx, 0, -8, 38, 16, 5);
    ctx.fill();
    ctx.fillStyle = "#831843";
    ctx.beginPath();
    ctx.arc(38, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 瞄准虚线 + 预测轨迹（aim 状态）
    if (stateRef.current === "aim" && runningRef.current) {
      const previewPower = chargingRef.current ? powerRef.current : 0.6;
      const speed = 6 + previewPower * 11;
      const ang = aimAngleRef.current;
      let px = CANNON_X + Math.cos(ang) * 34;
      let py = CANNON_Y + Math.sin(ang) * 34;
      let pvx = Math.cos(ang) * speed;
      let pvy = Math.sin(ang) * speed;
      ctx.save();
      ctx.strokeStyle = chargingRef.current ? "#fbbf24" : "rgba(244,114,182,0.5)";
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let i = 0; i < 28; i++) {
        pvy += GRAVITY;
        px += pvx;
        py += pvy;
        if (py > GROUND_Y || px > CANVAS_W) break;
        if (i % 2 === 0) ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 功率条
      const bw = 90;
      const bx = CANNON_X - bw / 2;
      const by = CANNON_Y + 32;
      ctx.save();
      ctx.fillStyle = "rgba(9,9,11,0.7)";
      drawRoundRect(ctx, bx, by, bw, 8, 4);
      ctx.fill();
      const pw = bw * previewPower;
      const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      pg.addColorStop(0, "#34d399");
      pg.addColorStop(0.6, "#fbbf24");
      pg.addColorStop(1, "#f43f5e");
      ctx.fillStyle = pg;
      drawRoundRect(ctx, bx, by, pw, 8, 4);
      ctx.fill();
      ctx.restore();
    }

    // 角度指示
    if (stateRef.current === "aim" && runningRef.current) {
      ctx.save();
      ctx.fillStyle = "rgba(244,114,182,0.9)";
      ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      const deg = Math.round((-aimAngleRef.current * 180) / Math.PI);
      ctx.fillText(`角度 ${deg}°`, 10, 16);
      ctx.fillText(
        chargingRef.current ? `蓄力 ${Math.round(powerRef.current * 100)}%` : "按住蓄力",
        10,
        32,
      );
      ctx.restore();
    }
  }, [running]);

  // 主循环
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 16.67, 2);
      last = now;
      if (runningRef.current && !overRef.current) {
        step(dt);
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    gameOverRef.current = doGameOver;
    return () => cancelAnimationFrame(raf);
  }, [step, draw, doGameOver]);

  // 读取最高分
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

  const initRound = useCallback(() => {
    targetsRef.current = [randTarget(), randTarget(), randTarget()];
    bumpersRef.current = [
      { x: 250, y: 300, r: 18, cd: 0 },
      { x: 430, y: 200, r: 18, cd: 0 },
      { x: 360, y: 380, r: 16, cd: 0 },
    ];
    particlesRef.current = [];
    floatsRef.current = [];
    trailRef.current = [];
    ragdollRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    initRound();
    scoreRef.current = 0;
    shotsRef.current = TOTAL_SHOTS;
    submittedRef.current = false;
    stateRef.current = "aim";
    aimAngleRef.current = -Math.PI / 4;
    chargingRef.current = false;
    powerRef.current = 0;
    setScore(0);
    setShots(TOTAL_SHOTS);
    setResult(null);
    runningRef.current = true;
    setRunning(true);
  }, [initRound]);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    chargingRef.current = false;
    setRunning(false);
  }, []);
  const resume = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    runningRef.current = true;
    setRunning(true);
  }, []);

  const restart = useCallback(() => {
    overRef.current = false;
    submittedRef.current = false;
    runningRef.current = false;
    stateRef.current = "aim";
    scoreRef.current = 0;
    shotsRef.current = TOTAL_SHOTS;
    ragdollRef.current = null;
    particlesRef.current = [];
    floatsRef.current = [];
    setScore(0);
    setShots(TOTAL_SHOTS);
    setOver(false);
    setResult(null);
    setRunning(false);
  }, []);

  // 鼠标 / 触摸
  const getPos = (clientX: number, clientY: number) => {
    const cv = canvasRef.current;
    if (!cv) return { x: 0, y: 0 };
    const rect = cv.getBoundingClientRect();
    const sx = rect.width > 0 ? CANVAS_W / rect.width : 1;
    const sy = rect.height > 0 ? CANVAS_H / rect.height : 1;
    return { x: (clientX - rect.left) * sx, y: (clientY - rect.top) * sy };
  };
  const updateAim = useCallback(
    (clientX: number, clientY: number) => {
      const { x, y } = getPos(clientX, clientY);
      const ang = Math.atan2(y - CANNON_Y, x - CANNON_X);
      // 限制朝右上 / 右下范围
      aimAngleRef.current = Math.max(-Math.PI / 2 + 0.05, Math.min(0.2, ang));
    },
    [],
  );

  // 键盘
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowup") {
        e.preventDefault();
        aimAngleRef.current = Math.max(-Math.PI / 2 + 0.05, aimAngleRef.current - 0.06);
      } else if (k === "arrowdown") {
        e.preventDefault();
        aimAngleRef.current = Math.min(0.2, aimAngleRef.current + 0.06);
      } else if (k === " ") {
        e.preventDefault();
        if (over || !running) return;
        if (stateRef.current === "aim" && !chargingRef.current) {
          chargingRef.current = true;
          chargeStartRef.current = performance.now();
        }
      } else if (k === "p") {
        if (running) pause();
        else if (!over) resume();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.key.toLowerCase() === "space") {
        if (chargingRef.current) {
          fire();
          chargingRef.current = false;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [running, over, fire, pause, resume]);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "剩余", value: `${shots}发` },
    { label: "最高", value: best },
  ];

  const fresh = !running && !over && score === 0 && shots === TOTAL_SHOTS;
  const paused = !running && !over && !fresh;

  return (
    <GameShell
      gameId={GAME_ID}
      title="布偶发射器"
      description="调节角度、蓄力发射，把会甩动四肢的布偶火柴人发射到目标区！基于 Verlet 物理的布偶会真实地翻滚、弹跳，撞到弹珠加分、击中靶子按大小得 50/100/200 分。10 发一局，看你能拿多少分。"
      instructions={`移动鼠标瞄准（或方向键上下调角度），按住鼠标 / 空格蓄力（功率条来回循环），松开发射。布偶会受重力与空气阻力飞行并四处弹跳。粉色弹珠：撞击 +25 分并反弹；靶子：按大小得 50/100/200 分，击中后随机重生。每发结束自动进入下一发，共 10 发。按 P 暂停。`}
      icon={Rocket}
      iconEmoji="🤸"
      iconGradient="from-pink-400 to-rose-500"
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
            onMouseMove={(e) => {
              if (running && !over) updateAim(e.clientX, e.clientY);
            }}
            onMouseDown={() => {
              if (running && !over && stateRef.current === "aim" && !chargingRef.current) {
                chargingRef.current = true;
                chargeStartRef.current = performance.now();
              }
            }}
            onMouseUp={() => {
              if (chargingRef.current) {
                fire();
                chargingRef.current = false;
              }
            }}
            onMouseLeave={() => {
              if (chargingRef.current) {
                fire();
                chargingRef.current = false;
              }
            }}
            onTouchStart={(e) => {
              if (e.touches[0] && running && !over) {
                updateAim(e.touches[0].clientX, e.touches[0].clientY);
                if (stateRef.current === "aim" && !chargingRef.current) {
                  chargingRef.current = true;
                  chargeStartRef.current = performance.now();
                }
              }
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                updateAim(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
              }
            }}
            onTouchEnd={() => {
              if (chargingRef.current) {
                fire();
                chargingRef.current = false;
              }
            }}
            className="w-full max-w-[600px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-rose-500/10 cursor-crosshair"
          />

          {/* 开始 / 暂停覆盖层 */}
          {(fresh || paused) && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/75 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={fresh ? start : resume}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-lg shadow-rose-500/30"
              >
                <Play className="w-5 h-5" /> {fresh ? "开始游戏" : "继续游戏"}
              </button>
              {fresh && (
                <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                  移动鼠标瞄准 · 按住蓄力 · 松开发射
                  <br />
                  击中靶子与弹珠得分，共 {TOTAL_SHOTS} 发
                </p>
              )}
            </div>
          )}

          {/* 游戏结束 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🤸</div>
              <h3 className="text-2xl font-bold mb-2">回合结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-rose-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-rose-300 font-bold">{result.rank}</span>/
                  {result.total}，超越了{" "}
                  <span className="text-rose-300 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-lg shadow-rose-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-5 flex items-center gap-3">
          {running && !over ? (
            <button
              onClick={pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-200 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              <Pause className="w-4 h-4" /> 暂停
            </button>
          ) : (
            !over &&
            !fresh && (
              <button
                onClick={resume}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            )
          )}
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>

        {/* 目标说明 */}
        <div className="mt-5 w-full max-w-[600px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-pink-300" /> 大靶 50 · 中靶 100 · 小靶 200
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> 弹珠 +25
            </span>
            <span className="text-slate-500">方向键调角度 · 空格蓄力发射 · P 暂停</span>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
