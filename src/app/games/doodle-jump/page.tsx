"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Rabbit, RotateCcw, Play, ChevronLeft, ChevronRight } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "doodle-jump";
const W = 400;
const H = 600;
const BEST_SCORE_KEY = "gm_doodle_jump_best_score";

// 物理参数
const GRAVITY = 0.4;
const JUMP_VEL = -13.5;
const SPRING_VEL = -21;
const MOVE_ACCEL = 0.7;
const MOVE_MAX = 5.2;
const FRICTION = 0.86;
const MAX_FALL = 16;

// 尺寸
const PLAYER_W = 38;
const PLAYER_H = 38;
const PLATFORM_W = 70;
const PLATFORM_H = 14;
const PLAYER_SCREEN_Y = 200; // 玩家固定在屏幕此 y 位置（相机跟随后）
const START_Y = 540;
const PLATFORM_GAP_MIN = 58;
const PLATFORM_GAP_MAX = 92;

type PlatformType = "normal" | "moving" | "fragile" | "spring";

interface Platform {
  x: number;
  y: number;
  type: PlatformType;
  vx: number;
  broken: boolean;
  breakAnim: number;
  used: boolean;
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number; // -1 左, 1 右
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ============ 工具函数 ============ */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// 根据当前攀登高度生成平台（仅在事件/循环中调用，不在 useState 初始化中）
function makePlatform(y: number, climb: number): Platform {
  const x = 8 + Math.random() * (W - PLATFORM_W - 16);
  let type: PlatformType = "normal";
  const r = Math.random();
  if (climb > 1400) {
    if (r < 0.1) type = "spring";
    else if (r < 0.34) type = "fragile";
    else if (r < 0.58) type = "moving";
  } else if (climb > 700) {
    if (r < 0.1) type = "spring";
    else if (r < 0.28 && climb > 1000) type = "fragile";
    else if (r < 0.48) type = "moving";
  } else if (climb > 250) {
    if (r < 0.08) type = "spring";
    else if (r < 0.22) type = "moving";
  } else {
    if (r < 0.06) type = "spring";
  }
  return {
    x,
    y,
    type,
    vx: type === "moving" ? (Math.random() < 0.5 ? -1.6 : 1.6) : 0,
    broken: false,
    breakAnim: 0,
    used: false,
  };
}

// 生成初始平台阵列（确定性首平台 + 随机后续）
function makeInitialPlatforms(): Platform[] {
  const list: Platform[] = [];
  // 首个平台在玩家正下方（确定性）
  list.push({
    x: W / 2 - PLATFORM_W / 2,
    y: START_Y + PLAYER_H + 4,
    type: "normal",
    vx: 0,
    broken: false,
    breakAnim: 0,
    used: false,
  });
  let y = START_Y - 50;
  let climb = 0;
  for (let i = 0; i < 12; i++) {
    list.push(makePlatform(y, climb));
    y -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
    climb += 70;
  }
  return list;
}

/* ============ 组件 ============ */

export default function DoodleJumpPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 游戏状态（ref — 不触发重渲染）
  const playerRef = useRef<Player>({
    x: W / 2 - PLAYER_W / 2,
    y: START_Y,
    vx: 0,
    vy: 0,
    facing: 1,
  });
  const platformsRef = useRef<Platform[]>([]);
  const cameraYRef = useRef(0);
  const maxClimbRef = useRef(0);
  const inputRef = useRef({ left: false, right: false });
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const animFrameRef = useRef(0);
  const starsRef = useRef<{ x: number; y: number; r: number; tw: number }[]>([]);

  // UI 状态
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /* ----- 绘制 ----- */
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    animFrameRef.current++;

    // 背景渐变
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0f1a");
    bg.addColorStop(0.5, "#0b0b14");
    bg.addColorStop(1, "#09090b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 背景星星（视差滚动）
    const cam = cameraYRef.current;
    for (const s of starsRef.current) {
      const parallax = 0.3;
      const sy = ((s.y - cam * parallax) % H + H) % H;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(animFrameRef.current * 0.02 + s.tw));
      ctx.fillStyle = `rgba(167,139,250,${tw * 0.35})`;
      ctx.beginPath();
      ctx.arc(s.x, sy, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const player = playerRef.current;

    // 绘制平台
    for (const p of platformsRef.current) {
      const sy = p.y - cam;
      if (sy < -PLATFORM_H || sy > H + 20) continue;

      if (p.broken) {
        // 破碎动画
        p.breakAnim += 0.08;
        const alpha = Math.max(0, 1 - p.breakAnim);
        if (alpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        const offset = p.breakAnim * 12;
        // 碎片
        ctx.fillStyle = "#f97316";
        for (let i = 0; i < 3; i++) {
          const fx = p.x + i * (PLATFORM_W / 3) + PLATFORM_W / 6;
          roundRect(ctx, fx - 8, sy + offset, 16, 6, 2);
          ctx.fill();
        }
        ctx.restore();
        continue;
      }

      // 平台主体
      let color = "#22c55e";
      let glow = "rgba(34,197,94,0.4)";
      if (p.type === "moving") {
        color = "#3b82f6";
        glow = "rgba(59,130,246,0.4)";
      } else if (p.type === "fragile") {
        color = "#f97316";
        glow = "rgba(249,115,22,0.4)";
      } else if (p.type === "spring") {
        color = "#ef4444";
        glow = "rgba(239,68,68,0.45)";
      }

      // 阴影
      ctx.save();
      ctx.shadowColor = glow;
      ctx.shadowBlur = 8;
      const grad = ctx.createLinearGradient(0, sy, 0, sy + PLATFORM_H);
      grad.addColorStop(0, color);
      grad.addColorStop(1, shade(color, -0.3));
      ctx.fillStyle = grad;
      roundRect(ctx, p.x, sy, PLATFORM_W, PLATFORM_H, 6);
      ctx.fill();
      ctx.restore();

      // 高光
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      roundRect(ctx, p.x + 3, sy + 2, PLATFORM_W - 6, 3, 1.5);
      ctx.fill();

      // 类型标识
      if (p.type === "spring") {
        // 弹簧
        ctx.strokeStyle = "#fca5a5";
        ctx.lineWidth = 2;
        const sx = p.x + PLATFORM_W / 2;
        ctx.beginPath();
        ctx.moveTo(sx - 6, sy);
        ctx.lineTo(sx - 6, sy - 8);
        ctx.lineTo(sx + 6, sy - 8);
        ctx.lineTo(sx + 6, sy);
        ctx.stroke();
        ctx.fillStyle = "#fca5a5";
        roundRect(ctx, sx - 8, sy - 11, 16, 4, 2);
        ctx.fill();
      } else if (p.type === "moving") {
        // 方向箭头
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        const ax = p.x + PLATFORM_W / 2;
        const ay = sy + PLATFORM_H / 2;
        if (p.vx > 0) {
          ctx.beginPath();
          ctx.moveTo(ax + 4, ay);
          ctx.lineTo(ax - 2, ay - 3);
          ctx.lineTo(ax - 2, ay + 3);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(ax - 4, ay);
          ctx.lineTo(ax + 2, ay - 3);
          ctx.lineTo(ax + 2, ay + 3);
          ctx.closePath();
          ctx.fill();
        }
      } else if (p.type === "fragile") {
        // 裂纹
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x + 15, sy + 4);
        ctx.lineTo(p.x + 22, sy + 10);
        ctx.moveTo(p.x + 40, sy + 3);
        ctx.lineTo(p.x + 48, sy + 11);
        ctx.moveTo(p.x + 55, sy + 5);
        ctx.lineTo(p.x + 60, sy + 9);
        ctx.stroke();
      }
    }

    // 绘制玩家
    const px = player.x;
    const py = player.y - cam;
    // 玩家阴影
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(px + PLAYER_W / 2, py + PLAYER_H + 2, PLAYER_W / 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 身体（绿色渐变圆角）
    ctx.save();
    ctx.shadowColor = "rgba(34,197,94,0.5)";
    ctx.shadowBlur = 10;
    const bodyGrad = ctx.createRadialGradient(
      px + PLAYER_W / 2 - 6,
      py + PLAYER_H / 2 - 6,
      4,
      px + PLAYER_W / 2,
      py + PLAYER_H / 2,
      PLAYER_W / 2 + 4,
    );
    bodyGrad.addColorStop(0, "#86efac");
    bodyGrad.addColorStop(0.6, "#22c55e");
    bodyGrad.addColorStop(1, "#15803d");
    ctx.fillStyle = bodyGrad;
    roundRect(ctx, px, py, PLAYER_W, PLAYER_H, 12);
    ctx.fill();
    ctx.restore();

    // 眼睛
    const eyeY = py + PLAYER_H / 2 - 4;
    const eyeOffset = player.facing * 3;
    // 左眼
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(px + 12, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();
    // 右眼
    ctx.beginPath();
    ctx.arc(px + 26, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();
    // 瞳孔
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(px + 12 + eyeOffset, eyeY + 1, 3, 0, Math.PI * 2);
    ctx.arc(px + 26 + eyeOffset, eyeY + 1, 3, 0, Math.PI * 2);
    ctx.fill();
    // 高光
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.arc(px + 12 + eyeOffset + 1, eyeY, 1, 0, Math.PI * 2);
    ctx.arc(px + 26 + eyeOffset + 1, eyeY, 1, 0, Math.PI * 2);
    ctx.fill();

    // 嘴巴（跳跃时张开）
    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (player.vy < -5) {
      // 开心张嘴
      ctx.arc(px + PLAYER_W / 2, py + 26, 4, 0, Math.PI);
    } else {
      ctx.moveTo(px + PLAYER_W / 2 - 4, py + 27);
      ctx.lineTo(px + PLAYER_W / 2 + 4, py + 27);
    }
    ctx.stroke();

    // 脸颊腮红
    ctx.fillStyle = "rgba(244,114,182,0.3)";
    ctx.beginPath();
    ctx.arc(px + 8, py + 24, 3, 0, Math.PI * 2);
    ctx.arc(px + 30, py + 24, 3, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  /* ----- 颜色工具 ----- */
  function shade(hex: string, amt: number): string {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const f = (c: number) =>
      Math.max(0, Math.min(255, Math.round(c * (1 + amt))));
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = maxClimbRef.current;
    const finalScore = Math.floor(s / 10);
    const r = submitScore(GAME_ID, finalScore, `高度 ${finalScore}m`);
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

  /* ----- 物理更新 ----- */
  const update = useCallback(() => {
    const player = playerRef.current;
    const input = inputRef.current;

    // 水平输入
    if (input.left) {
      player.vx -= MOVE_ACCEL;
      player.facing = -1;
    }
    if (input.right) {
      player.vx += MOVE_ACCEL;
      player.facing = 1;
    }
    if (!input.left && !input.right) {
      player.vx *= FRICTION;
    }
    player.vx = Math.max(-MOVE_MAX, Math.min(MOVE_MAX, player.vx));

    // 重力
    player.vy += GRAVITY;
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    // 记录上一帧脚部位置（用于穿透检测）
    const prevFeet = player.y + PLAYER_H;

    // 更新位置
    player.x += player.vx;
    player.y += player.vy;

    // 左右边界穿越
    if (player.x + PLAYER_W < 0) {
      player.x = W;
    } else if (player.x > W) {
      player.x = -PLAYER_W;
    }

    const currFeet = player.y + PLAYER_H;

    // 碰撞检测（仅下落时）
    if (player.vy > 0) {
      for (const p of platformsRef.current) {
        if (p.broken || p.breakAnim > 0) continue;
        // 脚部从平台上方穿越到下方
        if (
          prevFeet <= p.y + 2 &&
          currFeet >= p.y &&
          player.x + PLAYER_W > p.x + 4 &&
          player.x < p.x + PLATFORM_W - 4
        ) {
          if (p.type === "spring") {
            player.vy = SPRING_VEL;
            p.used = true;
          } else if (p.type === "fragile") {
            player.vy = JUMP_VEL;
            p.broken = true;
            p.breakAnim = 0.01;
          } else {
            player.vy = JUMP_VEL;
          }
          // 对齐到平台顶部，避免穿透
          player.y = p.y - PLAYER_H;
          break;
        }
      }
    }

    // 更新移动平台
    for (const p of platformsRef.current) {
      if (p.type === "moving" && !p.broken) {
        p.x += p.vx;
        if (p.x <= 0) {
          p.x = 0;
          p.vx = Math.abs(p.vx);
        } else if (p.x + PLATFORM_W >= W) {
          p.x = W - PLATFORM_W;
          p.vx = -Math.abs(p.vx);
        }
      }
    }

    // 相机跟随（仅向上）
    const targetCam = player.y - PLAYER_SCREEN_Y;
    if (targetCam < cameraYRef.current) {
      cameraYRef.current = targetCam;
    }

    // 更新最大攀登高度
    const climb = -cameraYRef.current;
    if (climb > maxClimbRef.current) {
      maxClimbRef.current = climb;
      const newScore = Math.floor(climb / 10);
      setScore((prev) => (newScore !== prev ? newScore : prev));
    }

    // 生成新平台（在相机上方）
    let highestY = Infinity;
    for (const p of platformsRef.current) {
      if (p.y < highestY) highestY = p.y;
    }
    const cam = cameraYRef.current;
    while (highestY > cam - 150) {
      highestY -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
      platformsRef.current.push(makePlatform(highestY, -cam));
    }

    // 移除屏幕下方的平台
    platformsRef.current = platformsRef.current.filter(
      (p) => p.y < cam + H + 60,
    );

    // 游戏结束：掉出屏幕底部
    if (player.y - cam > H + 20) {
      doGameOver();
    }
  }, [doGameOver]);

  /* ----- 主循环 ----- */
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = time - last;
      last = time;
      if (dt > 0 && dt < 100) {
        // 固定步长更新（以 16.67ms 为基准）
        if (runningRef.current && !overRef.current) {
          update();
        }
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [update, draw]);

  /* ----- 初始化（mounted 模式）----- */
  useEffect(() => {
    // 生成背景星星（随机但在 useEffect 中，不在 useState）
    const stars: { x: number; y: number; r: number; tw: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.5 + Math.random() * 1.5,
        tw: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;

    // 生成初始平台
    platformsRef.current = makeInitialPlatforms();
    playerRef.current = {
      x: W / 2 - PLAYER_W / 2,
      y: START_Y,
      vx: 0,
      vy: 0,
      facing: 1,
    };

    // 读取最高分（mounted 后读取，避免水合不匹配）
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

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    playerRef.current = {
      x: W / 2 - PLAYER_W / 2,
      y: START_Y,
      vx: 0,
      vy: JUMP_VEL,
      facing: 1,
    };
    platformsRef.current = makeInitialPlatforms();
    cameraYRef.current = 0;
    maxClimbRef.current = 0;
    submittedRef.current = false;
    setScore(0);
    setOver(false);
    setResult(null);
    runningRef.current = true;
    setRunning(true);
  }, []);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    playerRef.current = {
      x: W / 2 - PLAYER_W / 2,
      y: START_Y,
      vx: 0,
      vy: 0,
      facing: 1,
    };
    platformsRef.current = makeInitialPlatforms();
    cameraYRef.current = 0;
    maxClimbRef.current = 0;
    setScore(0);
    setOver(false);
    setResult(null);
    setRunning(false);
  }, []);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        inputRef.current.left = true;
        e.preventDefault();
      } else if (k === "arrowright" || k === "d") {
        inputRef.current.right = true;
        e.preventDefault();
      } else if (k === " " || k === "enter") {
        e.preventDefault();
        if (!runningRef.current && !overRef.current) start();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") {
        inputRef.current.left = false;
      } else if (k === "arrowright" || k === "d") {
        inputRef.current.right = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [start]);

  /* ----- 触摸控制（左右半屏）----- */
  const onTouchStart = (e: React.TouchEvent) => {
    if (!runningRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      const x = t.clientX - rect.left;
      if (x < rect.width / 2) {
        inputRef.current.left = true;
      } else {
        inputRef.current.right = true;
      }
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      inputRef.current.left = false;
      inputRef.current.right = false;
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!runningRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    inputRef.current.left = false;
    inputRef.current.right = false;
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      const x = t.clientX - rect.left;
      if (x < rect.width / 2) {
        inputRef.current.left = true;
      } else {
        inputRef.current.right = true;
      }
    }
  };

  const stats: GameStat[] = [
    { label: "当前高度", value: score },
    { label: "最高记录", value: best },
    { label: "游戏状态", value: over ? "已结束" : running ? "进行中" : "待开始" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="无尽跳跃"
      description="控制小绿怪自动跳跃，左右移动踩平台不断上升。四种平台类型，掉落即结束，比比谁跳得更高！"
      instructions={`键盘：← → 或 A D 控制左右移动，空格/回车开始。
移动端：点击画布左半屏向左移，右半屏向右移，或使用下方按钮。
平台类型：
  绿色 = 普通平台（正常弹跳）
  蓝色 = 移动平台（左右移动）
  橙色 = 易碎平台（踩一次即碎）
  红色 = 弹簧平台（弹得更高）
角色会从屏幕一侧穿出到另一侧。高度即为分数，掉出屏幕底部游戏结束。
你的最高记录会自动保存在本地。`}
      icon={Rabbit}
      iconEmoji="🦘"
      iconGradient="from-emerald-400 to-teal-500"
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
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onTouchMove={onTouchMove}
            className="w-full max-w-[400px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-emerald-500/10"
          />

          {/* 待开始覆盖层 */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Play className="w-5 h-5" /> 开始跳跃
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-4 leading-relaxed">
                ← → / A D 控制方向
                <br />
                移动端点击左右半屏
              </p>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🦘</div>
              <h3 className="text-2xl font-bold mb-2">掉落了！</h3>
              <p className="text-sm text-slate-400 mb-1">攀登高度</p>
              <p className="text-4xl font-bold text-emerald-400 mb-1">{score}m</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}m`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-emerald-400 font-bold">{result.rank}</span>/{result.total}
                  ，超越了 <span className="text-emerald-400 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再跳一局
              </button>
            </div>
          )}
        </div>

        {/* 控制按钮区 */}
        <div className="mt-5 flex flex-col items-center gap-4">
          {/* 移动端左右按钮 */}
          <div className="sm:hidden flex items-center gap-4">
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                inputRef.current.left = true;
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                inputRef.current.left = false;
              }}
              onMouseDown={() => {
                inputRef.current.left = true;
              }}
              onMouseUp={() => {
                inputRef.current.left = false;
              }}
              onMouseLeave={() => {
                inputRef.current.left = false;
              }}
              className="w-20 h-16 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-emerald-600 active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
            <button
              onTouchStart={(e) => {
                e.preventDefault();
                inputRef.current.right = true;
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                inputRef.current.right = false;
              }}
              onMouseDown={() => {
                inputRef.current.right = true;
              }}
              onMouseUp={() => {
                inputRef.current.right = false;
              }}
              onMouseLeave={() => {
                inputRef.current.right = false;
              }}
              className="w-20 h-16 rounded-xl bg-[#27272a] text-white flex items-center justify-center active:bg-emerald-600 active:scale-95 transition-all border border-[#3f3f46]"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>

          {/* 开始/重开按钮 */}
          <div className="flex items-center gap-3">
            {!running && !over && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Play className="w-4 h-4" /> 开始
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
