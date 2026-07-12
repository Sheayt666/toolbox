"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Apple, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "suika-merge";
const CANVAS_W = 420;
const CANVAS_H = 600;
const DROP_Y = 58; // 水果悬停高度
const DANGER_Y = 96; // 溢出判定线
const MAX_TYPE = 10;
const BEST_SCORE_KEY = "gm_suika_best_score";

// 物理常量
const GRAVITY = 0.42;
const AIR_FRICTION = 0.995;
const WALL_DAMP = 0.4;
const FLOOR_DAMP = 0.28;
const REST = 0.2; // 球-球弹性恢复系数

interface FruitDef {
  name: string;
  emoji: string;
  color: string;
  radius: number;
}

// 11 级水果：葡萄→樱桃→草莓→橘子→柠檬→猕猴桃→番茄→桃子→菠萝→哈密瓜→西瓜
const FRUITS: FruitDef[] = [
  { name: "葡萄", emoji: "🍇", color: "#a855f7", radius: 15 },
  { name: "樱桃", emoji: "🍒", color: "#ef4444", radius: 20 },
  { name: "草莓", emoji: "🍓", color: "#f43f5e", radius: 26 },
  { name: "橘子", emoji: "🍊", color: "#f97316", radius: 33 },
  { name: "柠檬", emoji: "🍋", color: "#eab308", radius: 41 },
  { name: "猕猴桃", emoji: "🥝", color: "#84cc16", radius: 50 },
  { name: "番茄", emoji: "🍅", color: "#dc2626", radius: 60 },
  { name: "桃子", emoji: "🍑", color: "#fb7185", radius: 71 },
  { name: "菠萝", emoji: "🍍", color: "#facc15", radius: 83 },
  { name: "哈密瓜", emoji: "🍈", color: "#f59e0b", radius: 96 },
  { name: "西瓜", emoji: "🍉", color: "#22c55e", radius: 112 },
];

interface Fruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: number;
  merged: boolean;
  born: number;
}

interface MergePopup {
  x: number;
  y: number;
  value: number;
  time: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// 仅在前 5 种小水果中随机（与原版一致）
function randomSmallType() {
  return Math.floor(Math.random() * 5);
}

export default function SuikaMergePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fruitsRef = useRef<Fruit[]>([]);
  const nextIdRef = useRef(1);
  const currentXRef = useRef(CANVAS_W / 2);
  const currentTypeRef = useRef(0);
  const nextTypeRef = useRef(1);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const scoreRef = useRef(0);
  const lastScoreSyncedRef = useRef(0);
  const bestRef = useRef(0);
  const submittedRef = useRef(false);
  const cooldownRef = useRef(0);
  const overflowTimerRef = useRef(0);
  const popupRef = useRef<MergePopup | null>(null);
  const animFrameRef = useRef(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // 函数引用，避免 rAF 闭包陈旧
  const stepRef = useRef<(dt: number) => void>(() => {});
  const drawRef = useRef<() => void>(() => {});
  const gameOverRef = useRef<() => void>(() => {});

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentType, setCurrentType] = useState(0);
  const [nextType, setNextType] = useState(1);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `合成 ${s} 分`);
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

  const stepPhysics = useCallback(
    (dt: number) => {
      const fruits = fruitsRef.current;
      const W = CANVAS_W;
      const H = CANVAS_H;
      const sub = 2;
      const sdt = dt / sub;

      for (let s = 0; s < sub; s++) {
        // 积分：重力 + 位移 + 边界
        for (const f of fruits) {
          if (f.merged) continue;
          f.vy += GRAVITY * sdt;
          f.vx *= AIR_FRICTION;
          f.x += f.vx * sdt;
          f.y += f.vy * sdt;
          if (f.x - f.radius < 0) {
            f.x = f.radius;
            f.vx = Math.abs(f.vx) * WALL_DAMP;
          }
          if (f.x + f.radius > W) {
            f.x = W - f.radius;
            f.vx = -Math.abs(f.vx) * WALL_DAMP;
          }
          if (f.y + f.radius > H) {
            f.y = H - f.radius;
            if (f.vy > 0) f.vy = -f.vy * FLOOR_DAMP;
            f.vx *= 0.92;
          }
        }

        // 圆-圆碰撞 + 同类合并
        const mergedSet = new Set<number>();
        const toAdd: Fruit[] = [];
        for (let i = 0; i < fruits.length; i++) {
          const a = fruits[i];
          if (mergedSet.has(a.id) || a.merged) continue;
          for (let j = i + 1; j < fruits.length; j++) {
            const b = fruits[j];
            if (mergedSet.has(b.id) || b.merged) continue;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = a.radius + b.radius;
            if (dist < minDist) {
              if (a.type === b.type && a.type < MAX_TYPE) {
                mergedSet.add(a.id);
                mergedSet.add(b.id);
                a.merged = true;
                b.merged = true;
                const newType = a.type + 1;
                const nf: Fruit = {
                  id: nextIdRef.current++,
                  x: (a.x + b.x) / 2,
                  y: (a.y + b.y) / 2,
                  vx: (a.vx + b.vx) / 2,
                  vy: (a.vy + b.vy) / 2 - 2.2,
                  radius: FRUITS[newType].radius,
                  type: newType,
                  merged: false,
                  born: performance.now(),
                };
                toAdd.push(nf);
                const gained = (newType * (newType + 1)) / 2;
                scoreRef.current += gained;
                popupRef.current = {
                  x: nf.x,
                  y: nf.y,
                  value: gained,
                  time: performance.now(),
                };
                break;
              } else {
                const nx = dist > 0.0001 ? dx / dist : 1;
                const ny = dist > 0.0001 ? dy / dist : 0;
                const overlap = minDist - dist;
                a.x -= nx * overlap * 0.5;
                a.y -= ny * overlap * 0.5;
                b.x += nx * overlap * 0.5;
                b.y += ny * overlap * 0.5;
                const rvx = b.vx - a.vx;
                const rvy = b.vy - a.vy;
                const velAlongNormal = rvx * nx + rvy * ny;
                if (velAlongNormal < 0) {
                  const jimp = (-(1 + REST) * velAlongNormal) / 2;
                  a.vx -= jimp * nx;
                  a.vy -= jimp * ny;
                  b.vx += jimp * nx;
                  b.vy += jimp * ny;
                }
              }
            }
          }
        }
        if (toAdd.length) fruits.push(...toAdd);
        if (mergedSet.size) {
          // 原地删除已合并的水果，避免 filter 创建新数组（GC 压力）
          for (let i = fruits.length - 1; i >= 0; i--) {
            if (fruits[i].merged) fruits.splice(i, 1);
          }
        }
      }

      // 同步分数到状态
      if (scoreRef.current !== lastScoreSyncedRef.current) {
        lastScoreSyncedRef.current = scoreRef.current;
        setScore(scoreRef.current);
      }

      // 溢出判定：静止水果越过危险线
      const now = performance.now();
      let overflow = false;
      for (const f of fruitsRef.current) {
        if (now - f.born < 1300) continue;
        const speed = Math.abs(f.vx) + Math.abs(f.vy);
        if (f.y - f.radius < DANGER_Y && speed < 1.8) {
          overflow = true;
          break;
        }
      }
      if (overflow) {
        overflowTimerRef.current += dt;
        if (overflowTimerRef.current > 42) {
          gameOverRef.current();
        }
      } else {
        overflowTimerRef.current = 0;
      }
    },
    [],
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

    // 背景
    ctx.fillStyle = "#0b0b0e";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // 背景网格点
    ctx.fillStyle = "rgba(39,39,42,0.5)";
    for (let i = 0; i <= cv.width; i += 30) {
      for (let j = 0; j <= cv.height; j += 30) {
        ctx.fillRect(i - 0.5, j - 0.5, 1, 1);
      }
    }

    // 危险线（虚线 + 脉动）
    const dangerAlpha = 0.35 + 0.25 * Math.sin(t * 0.06);
    ctx.save();
    ctx.strokeStyle = `rgba(239,68,68,${dangerAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, DANGER_Y);
    ctx.lineTo(cv.width, DANGER_Y);
    ctx.stroke();
    ctx.restore();

    // 悬停水果 + 引导线
    if (runningRef.current && !overRef.current) {
      const ct = currentTypeRef.current;
      const r = FRUITS[ct].radius;
      const cx = clamp(currentXRef.current, r, cv.width - r);
      // 引导线
      ctx.strokeStyle = "rgba(168,85,247,0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(cx, DROP_Y + r);
      ctx.lineTo(cx, cv.height);
      ctx.stroke();
      ctx.setLineDash([]);
      // 悬停水果（半透明预览）
      drawFruit(ctx, cx, DROP_Y, ct, 0.92, t);
    }

    // 落下的水果
    for (const f of fruitsRef.current) {
      drawFruit(ctx, f.x, f.y, f.type, 1, t);
    }

    // 合成分数弹出
    const pop = popupRef.current;
    if (pop) {
      const age = performance.now() - pop.time;
      if (age < 700) {
        const p = age / 700;
        ctx.save();
        ctx.globalAlpha = 1 - p;
        ctx.fillStyle = "#c4b5fd";
        ctx.font = "bold 20px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`+${pop.value}`, pop.x, pop.y - p * 30);
        ctx.restore();
      } else {
        popupRef.current = null;
      }
    }
  }, []);

  function drawFruit(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: number,
    alpha: number,
    t: number,
  ) {
    const def = FRUITS[type];
    const r = def.radius;
    ctx.save();
    ctx.globalAlpha = alpha;

    // 外发光
    ctx.shadowColor = def.color;
    ctx.shadowBlur = 12;

    // 径向渐变球体
    const grad = ctx.createRadialGradient(
      x - r * 0.35,
      y - r * 0.35,
      r * 0.1,
      x,
      y,
      r,
    );
    grad.addColorStop(0, lighten(def.color, 0.45));
    grad.addColorStop(0.6, def.color);
    grad.addColorStop(1, darken(def.color, 0.3));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 高光
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // emoji 文字
    const fontSize = Math.round(r * 1.15);
    ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(def.emoji, x, y + 1);

    ctx.restore();
  }

  function lighten(hex: string, amt: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.round(r + (255 - r) * amt)},${Math.round(
      g + (255 - g) * amt,
    )},${Math.round(b + (255 - b) * amt)})`;
  }
  function darken(hex: string, amt: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${Math.round(r * (1 - amt))},${Math.round(
      g * (1 - amt),
    )},${Math.round(b * (1 - amt))})`;
  }
  function hexToRgb(hex: string) {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
    };
  }

  // 主循环（仅启动一次，读取 ref 避免陈旧闭包）
  useEffect(() => {
    stepRef.current = stepPhysics;
    drawRef.current = draw;
    gameOverRef.current = doGameOver;
    let raf: number;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(32, time - last) / 16.67;
      last = time;
      if (runningRef.current && !overRef.current) {
        stepRef.current(dt);
      }
      drawRef.current();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stepPhysics, draw, doGameOver]);

  // 读取最高分（mounted 模式）
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
    // 初始化首个水果与下一个（随机小水果）
    const c = randomSmallType();
    const n = randomSmallType();
    currentTypeRef.current = c;
    nextTypeRef.current = n;
    setCurrentType(c);
    setNextType(n);
    currentXRef.current = CANVAS_W / 2;
    runningRef.current = true;
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    setRunning(false);
  }, []);

  const restart = useCallback(() => {
    fruitsRef.current = [];
    nextIdRef.current = 1;
    scoreRef.current = 0;
    lastScoreSyncedRef.current = 0;
    overflowTimerRef.current = 0;
    submittedRef.current = false;
    overRef.current = false;
    setScore(0);
    setOver(false);
    setResult(null);
    setRunning(false);
    runningRef.current = false;
    const c = randomSmallType();
    const n = randomSmallType();
    currentTypeRef.current = c;
    nextTypeRef.current = n;
    setCurrentType(c);
    setNextType(n);
    currentXRef.current = CANVAS_W / 2;
  }, []);

  const drop = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    const now = performance.now();
    if (now < cooldownRef.current) return;
    const type = currentTypeRef.current;
    const r = FRUITS[type].radius;
    const x = clamp(currentXRef.current, r, CANVAS_W - r);
    fruitsRef.current.push({
      id: nextIdRef.current++,
      x,
      y: DROP_Y,
      vx: 0,
      vy: 0,
      radius: r,
      type,
      merged: false,
      born: now,
    });
    // 推进：当前 <- 下一个 <- 新随机
    currentTypeRef.current = nextTypeRef.current;
    setCurrentType(nextTypeRef.current);
    const nn = randomSmallType();
    nextTypeRef.current = nn;
    setNextType(nn);
    cooldownRef.current = now + 420;
  }, []);

  // 鼠标 / 触摸控制下落位置
  const updateXFromEvent = useCallback((clientX: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scale = rect.width > 0 ? CANVAS_W / rect.width : 1;
    const x = (clientX - rect.left) * scale;
    currentXRef.current = clamp(x, 0, CANVAS_W);
  }, []);

  const stats: GameStat[] = [
    { label: "当前分数", value: score },
    { label: "最高记录", value: best },
    { label: "下一个", value: FRUITS[nextType].emoji },
    { label: "状态", value: over ? "已结束" : running ? "进行中" : "待开始" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="合成大西瓜"
      description="全球爆火的物理合成游戏！相同水果碰撞合成更大的水果，从葡萄一路合成到西瓜，水果溢出顶部即结束。"
      instructions={`移动鼠标或手指控制水果下落位置，点击或松手释放水果。
相同水果碰撞会合成更大的水果（葡萄→樱桃→草莓→橘子→柠檬→猕猴桃→番茄→桃子→菠萝→哈密瓜→西瓜）。
每次合成都会获得分数，水果越大得分越高。
当水果堆积超过顶部红色虚线时游戏结束。
合理规划下落位置，尽量让同种水果靠在一起。`}
      icon={Apple}
      iconEmoji="🍉"
      iconGradient="from-green-400 to-lime-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 下一个水果预览条 */}
        <div className="flex items-center justify-between w-full max-w-[420px] mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">下一个</span>
            <div className="w-9 h-9 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center text-xl">
              {FRUITS[nextType].emoji}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">当前</span>
            <div className="w-9 h-9 rounded-lg bg-[#27272a]/60 border border-[#8b5cf6]/30 flex items-center justify-center text-xl">
              {FRUITS[currentType].emoji}
            </div>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={(e) => updateXFromEvent(e.clientX)}
            onClick={drop}
            onTouchStart={(e) => {
              if (e.touches[0]) updateXFromEvent(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                updateXFromEvent(e.touches[0].clientX);
                e.preventDefault();
              }
            }}
            onTouchEnd={(e) => {
              if (e.changedTouches[0]) {
                updateXFromEvent(e.changedTouches[0].clientX);
              }
              drop();
            }}
            className="w-full max-w-[420px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-[#8b5cf6]/10 cursor-pointer"
          />

          {/* 待开始覆盖层 */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/75 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                移动控制下落位置 · 点击释放水果
                <br />
                相同水果碰撞合成更大水果
              </p>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🍉</div>
              <h3 className="text-2xl font-bold mb-2">游戏结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-[#a78bfa] mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0
                  ? "新纪录！"
                  : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第{" "}
                  <span className="text-[#c4b5fd] font-bold">{result.rank}</span>
                  /{result.total}，超越了{" "}
                  <span className="text-[#c4b5fd] font-bold">
                    {result.beatPercent}%
                  </span>{" "}
                  的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-5 flex items-center gap-3">
          {running ? (
            <button
              onClick={pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
            >
              <Pause className="w-4 h-4" /> 暂停
            </button>
          ) : (
            !over && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors shadow-lg shadow-[#8b5cf6]/30"
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

        {/* 水果进化路线（移动端 2 列 / 桌面单行） */}
        <div className="mt-5 w-full max-w-[420px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 mb-2 text-center">
            合成进化路线
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {FRUITS.map((f, i) => (
              <div key={i} className="flex items-center">
                <span className="text-lg" title={f.name}>
                  {f.emoji}
                </span>
                {i < FRUITS.length - 1 && (
                  <span className="text-slate-600 text-xs mx-0.5">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
