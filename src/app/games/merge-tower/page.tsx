"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Castle, RotateCcw, Play, Pause, Heart, Coins, Zap } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "merge-tower";
const BEST_SCORE_KEY = "gm_mergetower_best_score";

// 网格 5 列 x 6 行
const COLS = 5;
const ROWS = 6;
const CELL = 64;
const BOARD_W = COLS * CELL; // 320
const BOARD_H = ROWS * CELL; // 384

// 路径单元格（敌人行走路线），按顺序
const PATH_CELLS: [number, number][] = [
  [0, 0], [1, 0], [2, 0], [3, 0],
  [3, 1],
  [3, 2], [2, 2], [1, 2], [0, 2],
  [0, 3],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
  [4, 5],
];
const PATH_SET = new Set(PATH_CELLS.map(([c, r]) => `${c},${r}`));

// 8 个塔等级
const TOWER_TIERS = [
  { tier: 1, name: "箭塔", dmg: 6, range: 1.7, rate: 1.1, color: "#a3e635", emoji: "🏹" },
  { tier: 2, name: "弓塔", dmg: 14, range: 1.9, rate: 1.25, color: "#22d3ee", emoji: "🎯" },
  { tier: 3, name: "炮塔", dmg: 32, range: 2.1, rate: 1.0, color: "#60a5fa", emoji: "💣" },
  { tier: 4, name: "冰塔", dmg: 58, range: 2.2, rate: 1.35, color: "#818cf8", emoji: "❄️" },
  { tier: 5, name: "雷塔", dmg: 96, range: 2.4, rate: 1.45, color: "#c084fc", emoji: "⚡" },
  { tier: 6, name: "火塔", dmg: 150, range: 2.6, rate: 1.3, color: "#fb7185", emoji: "🔥" },
  { tier: 7, name: "暗塔", dmg: 240, range: 2.8, rate: 1.55, color: "#f472b6", emoji: "🌑" },
  { tier: 8, name: "神塔", dmg: 400, range: 3.2, rate: 1.7, color: "#fbbf24", emoji: "⭐" },
];

const TOWER_COST = 50;
const START_GOLD = 120;

const ENEMY_TYPES: Record<string, {
  baseHp: number; speed: number; gold: number; color: string; emoji: string; size: number;
}> = {
  normal: { baseHp: 22, speed: 0.9, gold: 7, color: "#4ade80", emoji: "👾", size: 0.7 },
  fast: { baseHp: 13, speed: 1.75, gold: 6, color: "#22d3ee", emoji: "🦟", size: 0.58 },
  tank: { baseHp: 75, speed: 0.5, gold: 16, color: "#fb923c", emoji: "🛡️", size: 0.86 },
};

interface Enemy {
  id: number;
  type: string;
  hp: number;
  maxHp: number;
  speed: number;
  dist: number; // 沿路径已走距离（px）
  gold: number;
  color: string;
  emoji: string;
  size: number;
  dead: boolean;
  reached: boolean;
  slowUntil: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  targetId: number;
  dmg: number;
  color: string;
  kind: "normal" | "ice";
  dead: boolean;
}

interface Tower {
  slot: number; // 索引到 freeCells
  tier: number; // 1..8
  cd: number; // 冷却剩余
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

// 计算路径像素坐标点
function buildWaypoints() {
  const pts: { x: number; y: number }[] = [];
  // 入口（屏幕外左侧 row0）
  pts.push({ x: -CELL * 0.5, y: 0.5 * CELL });
  for (const [c, r] of PATH_CELLS) {
    pts.push({ x: (c + 0.5) * CELL, y: (r + 0.5) * CELL });
  }
  // 出口（屏幕外右侧 row5）
  pts.push({ x: (COLS + 0.5) * CELL, y: (ROWS - 0.5) * CELL });
  return pts;
}

const WAYPOINTS = buildWaypoints();

// 预计算分段距离
const SEG: { len: number; cum: number; x: number; y: number; nx: number; ny: number }[] = (() => {
  const segs: { len: number; cum: number; x: number; y: number; nx: number; ny: number }[] = [];
  let cum = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const a = WAYPOINTS[i];
    const b = WAYPOINTS[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ len, cum, x: a.x, y: a.y, nx: b.x - a.x, ny: b.y - a.y });
    cum += len;
  }
  return segs;
})();
const TOTAL_LEN = SEG.reduce((s, x) => s + x.len, 0);

function pointAtDist(dist: number): { x: number; y: number } {
  const d = Math.max(0, dist);
  for (const s of SEG) {
    if (d <= s.cum + s.len || s === SEG[SEG.length - 1]) {
      const t = s.len > 0 ? (d - s.cum) / s.len : 0;
      const tt = Math.min(1, Math.max(0, t));
      return { x: s.x + s.nx * tt, y: s.y + s.ny * tt };
    }
  }
  const last = WAYPOINTS[WAYPOINTS.length - 1];
  return { x: last.x, y: last.y };
}

// 可放置塔的格子（非路径）
const FREE_CELLS: { col: number; row: number; x: number; y: number }[] = (() => {
  const arr: { col: number; row: number; x: number; y: number }[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!PATH_SET.has(`${c},${r}`)) {
        arr.push({ col: c, row: r, x: (c + 0.5) * CELL, y: (r + 0.5) * CELL });
      }
    }
  }
  return arr;
})();

function buildWave(n: number): string[] {
  const total = 5 + Math.floor(n * 1.5);
  const list: string[] = [];
  for (let i = 0; i < total; i++) {
    if (n >= 3 && i % 6 === 5) list.push("tank");
    else if (n >= 2 && Math.random() < 0.32) list.push("fast");
    else list.push("normal");
  }
  return list;
}

export default function MergeTowerPage() {
  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const towersRef = useRef<Map<number, Tower>>(new Map());
  const goldRef = useRef(START_GOLD);
  const livesRef = useRef(3);
  const waveRef = useRef(0);
  const killsRef = useRef(0);
  const bestRef = useRef(0);
  const scoreRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);

  const waveQueueRef = useRef<string[]>([]);
  const spawnCdRef = useRef(0);
  const prepCdRef = useRef(2.2);
  const phaseRef = useRef<"prep" | "spawning" | "idle">("idle");
  const idCounterRef = useRef(1);
  const dragSlotRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [gold, setGold] = useState(START_GOLD);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [, setTick] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);

  const gameOverRef = useRef<() => void>(() => {});

  const recomputeScore = useCallback(() => {
    const s = waveRef.current * 100 + killsRef.current * 5;
    scoreRef.current = s;
    setScore(s);
  }, []);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    runningRef.current = false;
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `第${waveRef.current}波 ${s}分`);
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

  const loseLife = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      gameOverRef.current();
    }
  }, []);

  const startNextWave = useCallback(() => {
    waveRef.current += 1;
    setWave(waveRef.current);
    waveQueueRef.current = buildWave(waveRef.current);
    spawnCdRef.current = 0.4;
    phaseRef.current = "spawning";
    recomputeScore();
  }, [recomputeScore]);

  const step = useCallback((dt: number) => {
    const dtSec = dt / 60; // dt 是帧倍数（相对 16.67ms），转秒近似 dt/60
    // 波次管理
    if (phaseRef.current === "prep") {
      prepCdRef.current -= dtSec;
      if (prepCdRef.current <= 0) {
        startNextWave();
      }
    } else if (phaseRef.current === "spawning") {
      spawnCdRef.current -= dtSec;
      if (spawnCdRef.current <= 0 && waveQueueRef.current.length > 0) {
        const type = waveQueueRef.current.shift()!;
        const def = ENEMY_TYPES[type];
        const hp = Math.round(def.baseHp * (1 + (waveRef.current - 1) * 0.35));
        enemiesRef.current.push({
          id: idCounterRef.current++,
          type,
          hp,
          maxHp: hp,
          speed: def.speed,
          dist: 0,
          gold: def.gold,
          color: def.color,
          emoji: def.emoji,
          size: def.size,
          dead: false,
          reached: false,
          slowUntil: 0,
        });
        spawnCdRef.current = Math.max(0.35, 0.9 - waveRef.current * 0.03);
      }
      if (waveQueueRef.current.length === 0) {
        phaseRef.current = "idle";
      }
    }

    const now = performance.now();

    // 敌人移动
    for (const e of enemiesRef.current) {
      if (e.dead || e.reached) continue;
      const spd = e.speed * (now < e.slowUntil ? 0.5 : 1);
      e.dist += spd * CELL * dtSec;
      if (e.dist >= TOTAL_LEN) {
        e.reached = true;
        loseLife();
      }
    }
    // 移除已到达/死亡
    const beforeLen = enemiesRef.current.length;
    enemiesRef.current = enemiesRef.current.filter((e) => !e.dead && !e.reached);
    if (enemiesRef.current.length === 0 && phaseRef.current === "idle" && beforeLen > 0) {
      // 波次清空
      const bonus = 20 + waveRef.current * 5;
      goldRef.current += bonus;
      setGold(goldRef.current);
      phaseRef.current = "prep";
      prepCdRef.current = 3;
    }

    // 塔射击
    for (const [, tw] of towersRef.current) {
      tw.cd -= dtSec;
      const def = TOWER_TIERS[tw.tier - 1];
      const cell = FREE_CELLS[tw.slot];
      if (tw.cd <= 0) {
        // 寻找射程内最靠前（dist 最大）的敌人
        let target: Enemy | null = null;
        let bestDist = -1;
        const rangePx = def.range * CELL;
        for (const e of enemiesRef.current) {
          if (e.dead || e.reached) continue;
          const p = pointAtDist(e.dist);
          const d = Math.hypot(p.x - cell.x, p.y - cell.y);
          if (d <= rangePx && e.dist > bestDist) {
            bestDist = e.dist;
            target = e;
          }
        }
        if (target) {
          const tp = pointAtDist(target.dist);
          projectilesRef.current.push({
            id: idCounterRef.current++,
            x: cell.x,
            y: cell.y,
            tx: tp.x,
            ty: tp.y,
            targetId: target.id,
            dmg: def.dmg,
            color: def.color,
            kind: tw.tier === 4 ? "ice" : "normal",
            dead: false,
          });
          tw.cd = 1 / def.rate;
        } else {
          tw.cd = 0.05;
        }
      }
    }

    // 投射物移动
    for (const p of projectilesRef.current) {
      if (p.dead) continue;
      const target = enemiesRef.current.find((e) => e.id === p.targetId && !e.dead && !e.reached);
      if (target) {
        const tp = pointAtDist(target.dist);
        p.tx = tp.x;
        p.ty = tp.y;
      }
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      const sp = 9 * CELL * dtSec;
      if (d <= sp || d < 6) {
        // 命中
        if (target) {
          target.hp -= p.dmg;
          if (p.kind === "ice") target.slowUntil = now + 1400;
          if (target.hp <= 0) {
            target.dead = true;
            goldRef.current += target.gold;
            setGold(goldRef.current);
            killsRef.current += 1;
            recomputeScore();
          }
        }
        p.dead = true;
      } else {
        p.x += (dx / d) * sp;
        p.y += (dy / d) * sp;
      }
    }
    projectilesRef.current = projectilesRef.current.filter((p) => !p.dead);
  }, [loseLife, recomputeScore, startNextWave]);

  // 主循环
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((time - last) / 16.67, 2);
      last = time;
      if (runningRef.current && !overRef.current) {
        step(dt);
      }
      setTick((t) => (t + 1) % 1000000);
    };
    raf = requestAnimationFrame(loop);
    gameOverRef.current = doGameOver;
    return () => cancelAnimationFrame(raf);
  }, [step, doGameOver]);

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

  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    enemiesRef.current = [];
    projectilesRef.current = [];
    towersRef.current = new Map();
    goldRef.current = START_GOLD;
    livesRef.current = 3;
    waveRef.current = 0;
    killsRef.current = 0;
    scoreRef.current = 0;
    submittedRef.current = false;
    waveQueueRef.current = [];
    phaseRef.current = "prep";
    prepCdRef.current = 2;
    spawnCdRef.current = 0;
    idCounterRef.current = 1;
    setGold(START_GOLD);
    setLives(3);
    setWave(0);
    setScore(0);
    setResult(null);
    setSelectedSlot(null);
    runningRef.current = true;
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    runningRef.current = false;
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    runningRef.current = true;
    setRunning(true);
  }, []);

  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    enemiesRef.current = [];
    projectilesRef.current = [];
    towersRef.current = new Map();
    goldRef.current = START_GOLD;
    livesRef.current = 3;
    waveRef.current = 0;
    killsRef.current = 0;
    scoreRef.current = 0;
    phaseRef.current = "idle";
    setGold(START_GOLD);
    setLives(3);
    setWave(0);
    setScore(0);
    setOver(false);
    setResult(null);
    setRunning(false);
    setSelectedSlot(null);
  }, []);

  // 点击空槽位 -> 购买塔
  const handleSlotClick = useCallback((slotIdx: number) => {
    if (!runningRef.current || overRef.current) return;
    if (towersRef.current.has(slotIdx)) {
      // 选中已有塔（用于合并）
      setSelectedSlot((prev) => (prev === slotIdx ? null : slotIdx));
      return;
    }
    // 空槽位：如果有选中的塔，取消选中
    if (selectedSlot !== null) {
      setSelectedSlot(null);
      return;
    }
    // 购买
    if (goldRef.current >= TOWER_COST) {
      goldRef.current -= TOWER_COST;
      setGold(goldRef.current);
      towersRef.current.set(slotIdx, { slot: slotIdx, tier: 1, cd: 0 });
      setTick((t) => t + 1);
    }
  }, [selectedSlot]);

  // 点击另一个塔 -> 尝试合并
  const handleTowerClick = useCallback((slotIdx: number) => {
    if (!runningRef.current || overRef.current) return;
    if (selectedSlot === null) {
      setSelectedSlot(slotIdx);
      return;
    }
    if (selectedSlot === slotIdx) {
      setSelectedSlot(null);
      return;
    }
    const a = towersRef.current.get(selectedSlot);
    const b = towersRef.current.get(slotIdx);
    if (a && b && a.tier === b.tier && a.tier < 8) {
      // 合并：保留目标槽位，升级
      const newTier = a.tier + 1;
      towersRef.current.delete(selectedSlot);
      b.tier = newTier;
      b.cd = 0;
      setSelectedSlot(null);
      setTick((t) => t + 1);
    } else {
      // 切换选中
      setSelectedSlot(slotIdx);
    }
  }, [selectedSlot]);

  // 拖拽合并
  const onDragStart = useCallback((slotIdx: number) => {
    dragSlotRef.current = slotIdx;
  }, []);
  const onDrop = useCallback((slotIdx: number) => {
    const src = dragSlotRef.current;
    dragSlotRef.current = null;
    if (src === null || src === slotIdx) return;
    const a = towersRef.current.get(src);
    const b = towersRef.current.get(slotIdx);
    if (a && b && a.tier === b.tier && a.tier < 8) {
      const newTier = a.tier + 1;
      towersRef.current.delete(src);
      b.tier = newTier;
      b.cd = 0;
      setSelectedSlot(null);
      setTick((t) => t + 1);
    }
  }, []);

  const stats: GameStat[] = [
    { label: "波数", value: wave },
    { label: "金币", value: gold },
    { label: "生命", value: lives },
    { label: "最高", value: best },
  ];

  const fresh = !running && !over && wave === 0 && score === 0;
  const paused = !running && !over && !fresh;

  const prepLeft = phaseRef.current === "prep" ? Math.max(0, prepCdRef.current) : 0;

  return (
    <GameShell
      gameId={GAME_ID}
      title="合成塔防"
      description="合成塔防融合了合成消除与塔防策略：在 5×6 网格上放置防御塔，把相同等级的塔拖拽合并成更高阶的神塔，抵御一波波沿路径进攻的敌人。8 个塔阶、3 种敌人、3 条命，看你能撑到第几波！"
      instructions={`点击空地花费 ${TOWER_COST} 金币放置 1 级箭塔。把相同等级的塔拖拽到一起（或先点选一个、再点另一个）即可合成更高阶的塔，最高 8 阶。塔会自动攻击射程内的敌人，击杀获得金币。敌人走到终点扣 1 命，共 3 命。每波清空后短暂准备进入下一波。`}
      icon={Castle}
      iconEmoji="🏰"
      iconGradient="from-amber-500 to-orange-600"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-[340px] mb-2 px-1 gap-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${i < lives ? "text-rose-500 fill-rose-500" : "text-slate-700"}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> {gold}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> 第 {wave} 波
            </span>
          </div>
        </div>

        <div className="relative" style={{ width: "100%", maxWidth: BOARD_W }}>
          {/* 棋盘 */}
          <div
            className="relative mx-auto rounded-xl border border-[#27272a] overflow-hidden shadow-lg shadow-amber-500/10"
            style={{
              aspectRatio: `${BOARD_W} / ${BOARD_H}`,
              background: "linear-gradient(135deg,#16120a,#0c0a14)",
            }}
          >
            {/* 单元格层 */}
            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${COLS},1fr)`, gridTemplateRows: `repeat(${ROWS},1fr)` }}
            >
              {Array.from({ length: COLS * ROWS }).map((_, idx) => {
                const c = idx % COLS;
                const r = Math.floor(idx / COLS);
                const isPath = PATH_SET.has(`${c},${r}`);
                const slotIdx = FREE_CELLS.findIndex((fc) => fc.col === c && fc.row === r);
                const tower = slotIdx >= 0 ? towersRef.current.get(slotIdx) : undefined;
                return (
                  <div
                    key={idx}
                    className={`relative ${isPath ? "" : "cursor-pointer"}`}
                    style={{
                      background: isPath
                        ? "repeating-linear-gradient(45deg,#3f2d12,#3f2d12 6px,#2a1d0a 6px,#2a1d0a 12px)"
                        : "rgba(255,255,255,0.015)",
                      border: "1px solid rgba(255,255,255,0.03)",
                    }}
                    onClick={() => {
                      if (isPath) return;
                      if (tower) handleTowerClick(slotIdx);
                      else handleSlotClick(slotIdx);
                    }}
                    onMouseEnter={() => !isPath && setHoverSlot(slotIdx)}
                    onMouseLeave={() => setHoverSlot(null)}
                    onDragOver={(e) => {
                      if (!isPath && towersRef.current.has(slotIdx)) e.preventDefault();
                    }}
                    onDrop={() => {
                      if (!isPath && towersRef.current.has(slotIdx)) onDrop(slotIdx);
                    }}
                  >
                    {/* 路径方向标记 */}
                    {isPath && (
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] opacity-30 select-none">
                        ▦
                      </span>
                    )}
                    {/* 塔 */}
                    {tower && (
                      <div
                        draggable={runningRef.current}
                        onDragStart={() => onDragStart(slotIdx)}
                        className="absolute inset-1 rounded-lg flex items-center justify-center select-none transition-transform hover:scale-105"
                        style={{
                          background: `linear-gradient(160deg,${TOWER_TIERS[tower.tier - 1].color}33,${TOWER_TIERS[tower.tier - 1].color}11)`,
                          border: `1.5px solid ${TOWER_TIERS[tower.tier - 1].color}`,
                          boxShadow: `0 0 10px ${TOWER_TIERS[tower.tier - 1].color}55`,
                          cursor: "grab",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTowerClick(slotIdx);
                        }}
                      >
                        <span className="text-lg leading-none">{TOWER_TIERS[tower.tier - 1].emoji}</span>
                        <span
                          className="absolute -top-1.5 -right-1.5 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-black"
                          style={{ background: TOWER_TIERS[tower.tier - 1].color }}
                        >
                          {tower.tier}
                        </span>
                      </div>
                    )}
                    {/* 空槽位提示 */}
                    {!isPath && !tower && (
                      <span className="absolute inset-0 flex items-center justify-center text-slate-700 text-xs opacity-0 hover:opacity-100 transition-opacity">
                        {gold >= TOWER_COST ? "+" : "·"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 射程指示 */}
            {(selectedSlot !== null || hoverSlot !== null) &&
              (() => {
                const slot = selectedSlot ?? hoverSlot;
                if (slot === null) return null;
                const tw = towersRef.current.get(slot);
                if (!tw) return null;
                const def = TOWER_TIERS[tw.tier - 1];
                const cell = FREE_CELLS[slot];
                const cxPct = (cell.x / BOARD_W) * 100;
                const cyPct = (cell.y / BOARD_H) * 100;
                const rPct = (def.range * CELL / BOARD_W) * 100;
                return (
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: `${cxPct}%`,
                      top: `${cyPct}%`,
                      width: `${rPct * 2}%`,
                      paddingBottom: `${rPct * 2 * (BOARD_W / BOARD_H)}%`,
                      transform: "translate(-50%,-50%)",
                      border: `1.5px dashed ${def.color}aa`,
                      background: `${def.color}10`,
                    }}
                  />
                );
              })()}

            {/* 敌人层 */}
            <div className="absolute inset-0 pointer-events-none">
              {enemiesRef.current.map((e) => {
                const p = pointAtDist(e.dist);
                const xPct = (p.x / BOARD_W) * 100;
                const yPct = (p.y / BOARD_H) * 100;
                const sz = e.size * 100;
                return (
                  <div
                    key={e.id}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      transform: "translate(-50%,-50%)",
                      width: `${sz}%`,
                    }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{
                        fontSize: "16px",
                        filter: `drop-shadow(0 0 6px ${e.color})`,
                        lineHeight: 1,
                      }}
                    >
                      {e.emoji}
                    </div>
                    {/* 血条 */}
                    <div className="w-[120%] h-1 rounded bg-black/60 mt-0.5 overflow-hidden">
                      <div
                        className="h-full rounded transition-all"
                        style={{
                          width: `${Math.max(0, (e.hp / e.maxHp) * 100)}%`,
                          background: e.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 投射物层 */}
            <div className="absolute inset-0 pointer-events-none">
              {projectilesRef.current.map((p) => {
                const xPct = (p.x / BOARD_W) * 100;
                const yPct = (p.y / BOARD_H) * 100;
                return (
                  <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      width: "8px",
                      height: "8px",
                      transform: "translate(-50%,-50%)",
                      background: p.color,
                      boxShadow: `0 0 6px ${p.color}`,
                    }}
                  />
                );
              })}
            </div>

            {/* 波次准备提示 */}
            {running && phaseRef.current === "prep" && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="px-4 py-2 rounded-lg bg-[#09090b]/85 backdrop-blur-sm border border-amber-500/40 text-sm text-amber-300 text-center">
                  第 {waveRef.current + 1} 波即将到来
                  <div className="text-xs text-slate-400 mt-0.5">{prepLeft.toFixed(1)}s</div>
                </div>
              </div>
            )}

            {/* 开始/暂停覆盖层 */}
            {(fresh || paused) && (
              <div className="absolute inset-0 bg-[#09090b]/75 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
                <button
                  onClick={fresh ? start : resume}
                  className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-lg shadow-amber-500/30"
                >
                  <Play className="w-5 h-5" /> {fresh ? "开始游戏" : "继续游戏"}
                </button>
                {fresh && (
                  <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                    点击空地建塔 · 拖拽/点选合成
                    <br />
                    抵御敌人，守住 3 条命
                  </p>
                )}
              </div>
            )}

            {/* 游戏结束 */}
            {over && (
              <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
                <div className="text-5xl mb-3">🏰</div>
                <h3 className="text-2xl font-bold mb-2">城防失守</h3>
                <p className="text-sm text-slate-400 mb-1">最终得分</p>
                <p className="text-4xl font-bold text-amber-400 mb-1">{score}</p>
                <p className="text-xs text-slate-500 mb-3">
                  坚持到第 {wave} 波 · 击杀 {killsRef.current}
                  {score >= best && score > 0 ? " · 新纪录！" : ` · 最高: ${best}`}
                </p>
                {result && (
                  <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                    排名第 <span className="text-amber-300 font-bold">{result.rank}</span>/{result.total}，超越了{" "}
                    <span className="text-amber-300 font-bold">{result.beatPercent}%</span> 的玩家
                  </p>
                )}
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors shadow-lg shadow-amber-500/30"
                >
                  <RotateCcw className="w-4 h-4" /> 再来一局
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="mt-5 flex items-center gap-3">
          {running ? (
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
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            )
          )}
          <div className="text-xs text-slate-500">
            建塔花费 <span className="text-amber-400 font-bold">{TOWER_COST}</span> 金 · 相同等级可合成
          </div>
        </div>

        {/* 塔阶图鉴 */}
        <div className="mt-4 w-full max-w-[340px] grid grid-cols-4 gap-1.5">
          {TOWER_TIERS.map((t) => (
            <div
              key={t.tier}
              className="rounded-lg px-2 py-1.5 flex items-center gap-1.5"
              style={{ background: `${t.color}11`, border: `1px solid ${t.color}33` }}
            >
              <span className="text-sm">{t.emoji}</span>
              <div className="leading-tight">
                <div className="text-[10px] font-bold" style={{ color: t.color }}>
                  Lv{t.tier}
                </div>
                <div className="text-[9px] text-slate-500">伤{t.dmg}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
