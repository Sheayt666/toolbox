"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "cell-eater";
const CANVAS_W = 600;
const CANVAS_H = 600;
const WORLD_W = 2000;
const WORLD_H = 2000;
const FOOD_COUNT = 200;
const AI_COUNT = 7;
const GAME_DURATION = 60;
const BEST_SCORE_KEY = "toolbox-best-cell-eater";
const MASS_SCALE = 4;
const BASE_SPEED = 260;
const MIN_SPLIT_MASS = 40;
const MIN_EJECT_MASS = 20;
const MAX_PLAYER_CELLS = 4;
const SPLIT_COOLDOWN = 3;
const EJECT_COOLDOWN = 0.5;
const MERGE_TIME = 10;
const EAT_RATIO = 1.1;

const CELL_COLORS = [
  "#8b5cf6", "#3b82f6", "#22c55e", "#f59e0b",
  "#ec4899", "#6366f1", "#14b8a6", "#f97316",
];
const FOOD_COLORS = [
  "#a78bfa", "#60a5fa", "#4ade80", "#fbbf24",
  "#f472b6", "#818cf8", "#2dd4bf", "#fb923c",
];
const AI_NAMES = ["小球", "吞噬者", "巨细胞", "分裂体", "纳米", "原子", "量子"];
const PLAYER_COLOR = "#8b5cf6";

/* ============ 类型 ============ */
interface Cell {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
  isPlayer: boolean;
  name: string;
  splitCd: number;
  ejectCd: number;
  mergeTimer: number;
  wanderAngle: number;
  wanderTimer: number;
  dead: boolean;
}

interface Food { x: number; y: number; color: string; }

interface GameData {
  cells: Cell[];
  foods: Food[];
  camX: number;
  camY: number;
  zoom: number;
  mouseX: number;
  mouseY: number;
  worldMouseX: number;
  worldMouseY: number;
  timeLeft: number;
  kills: number;
  nextId: number;
  splitCd: number;
  ejectCd: number;
  playerIds: number[];
  started: boolean;
}

/* ============ 辅助函数 ============ */
function massToRadius(mass: number): number {
  return Math.sqrt(mass / Math.PI) * MASS_SCALE;
}

function massToSpeed(mass: number): number {
  const r = massToRadius(mass);
  return BASE_SPEED / (1 + r * 0.025);
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

/* ============ 游戏初始化 ============ */
function initGame(): GameData {
  const cells: Cell[] = [];
  const foods: Food[] = [];
  let nextId = 0;

  // 玩家细胞
  const player: Cell = {
    id: nextId++, x: WORLD_W / 2, y: WORLD_H / 2, vx: 0, vy: 0,
    mass: 20, color: PLAYER_COLOR, isPlayer: true, name: "你",
    splitCd: 0, ejectCd: 0, mergeTimer: 0,
    wanderAngle: 0, wanderTimer: 0, dead: false,
  };
  cells.push(player);

  // AI细胞
  for (let i = 0; i < AI_COUNT; i++) {
    cells.push({
      id: nextId++,
      x: rand(100, WORLD_W - 100),
      y: rand(100, WORLD_H - 100),
      vx: 0, vy: 0,
      mass: rand(15, 50),
      color: CELL_COLORS[(i + 1) % CELL_COLORS.length],
      isPlayer: false,
      name: AI_NAMES[i % AI_NAMES.length],
      splitCd: 0, ejectCd: 0, mergeTimer: 0,
      wanderAngle: rand(0, Math.PI * 2),
      wanderTimer: rand(1, 3),
      dead: false,
    });
  }

  // 食物
  for (let i = 0; i < FOOD_COUNT; i++) {
    foods.push({
      x: rand(20, WORLD_W - 20),
      y: rand(20, WORLD_H - 20),
      color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
    });
  }

  return {
    cells, foods, camX: WORLD_W / 2, camY: WORLD_H / 2, zoom: 1,
    mouseX: CANVAS_W / 2, mouseY: CANVAS_H / 2,
    worldMouseX: WORLD_W / 2, worldMouseY: WORLD_H / 2,
    timeLeft: GAME_DURATION, kills: 0, nextId,
    splitCd: 0, ejectCd: 0, playerIds: [player.id], started: true,
  };
}

/* ============ 游戏更新 ============ */
function updateGame(gd: GameData, dt: number): void {
  if (gd.timeLeft <= 0) return;
  gd.timeLeft = Math.max(0, gd.timeLeft - dt);
  if (gd.splitCd > 0) gd.splitCd = Math.max(0, gd.splitCd - dt);
  if (gd.ejectCd > 0) gd.ejectCd = Math.max(0, gd.ejectCd - dt);

  // 计算世界鼠标坐标
  gd.worldMouseX = gd.camX + (gd.mouseX - CANVAS_W / 2) / gd.zoom;
  gd.worldMouseY = gd.camY + (gd.mouseY - CANVAS_H / 2) / gd.zoom;

  // 更新所有细胞
  for (const cell of gd.cells) {
    if (cell.dead) continue;
    if (cell.mergeTimer > 0) cell.mergeTimer = Math.max(0, cell.mergeTimer - dt);
    if (cell.splitCd > 0) cell.splitCd = Math.max(0, cell.splitCd - dt);
    if (cell.ejectCd > 0) cell.ejectCd = Math.max(0, cell.ejectCd - dt);

    let tx = 0, ty = 0;
    if (cell.isPlayer) {
      const dx = gd.worldMouseX - cell.x;
      const dy = gd.worldMouseY - cell.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 5) { tx = dx / d; ty = dy / d; }
    } else {
      // AI行为
      let nearestThreat: Cell | null = null;
      let threatDist = 300;
      let nearestPrey: Cell | null = null;
      let preyDist = 400;
      let nearestFood: Food | null = null;
      let foodDist = 250;

      for (const other of gd.cells) {
        if (other === cell || other.dead) continue;
        const d = dist(cell.x, cell.y, other.x, other.y);
        if (other.mass > cell.mass * EAT_RATIO && d < threatDist) {
          threatDist = d; nearestThreat = other;
        }
        if (cell.mass > other.mass * EAT_RATIO && d < preyDist) {
          preyDist = d; nearestPrey = other;
        }
      }
      for (const food of gd.foods) {
        const d = dist(cell.x, cell.y, food.x, food.y);
        if (d < foodDist) { foodDist = d; nearestFood = food; }
      }

      if (nearestThreat) {
        tx = (cell.x - nearestThreat.x);
        ty = (cell.y - nearestThreat.y);
        const d = Math.sqrt(tx * tx + ty * ty);
        if (d > 0) { tx /= d; ty /= d; }
      } else if (nearestPrey) {
        tx = (nearestPrey.x - cell.x);
        ty = (nearestPrey.y - cell.y);
        const d = Math.sqrt(tx * tx + ty * ty);
        if (d > 0) { tx /= d; ty /= d; }
      } else if (nearestFood) {
        tx = (nearestFood.x - cell.x);
        ty = (nearestFood.y - cell.y);
        const d = Math.sqrt(tx * tx + ty * ty);
        if (d > 0) { tx /= d; ty /= d; }
      } else {
        cell.wanderTimer -= dt;
        if (cell.wanderTimer <= 0) {
          cell.wanderAngle = rand(0, Math.PI * 2);
          cell.wanderTimer = rand(1, 3);
        }
        tx = Math.cos(cell.wanderAngle) * 0.5;
        ty = Math.sin(cell.wanderAngle) * 0.5;
      }
    }

    const speed = massToSpeed(cell.mass);
    cell.vx = tx * speed;
    cell.vy = ty * speed;
    cell.x += cell.vx * dt;
    cell.y += cell.vy * dt;

    // 世界边界
    const r = massToRadius(cell.mass);
    cell.x = Math.max(r, Math.min(WORLD_W - r, cell.x));
    cell.y = Math.max(r, Math.min(WORLD_H - r, cell.y));
  }

  // 吃食物
  for (const cell of gd.cells) {
    if (cell.dead) continue;
    const r = massToRadius(cell.mass);
    for (let i = gd.foods.length - 1; i >= 0; i--) {
      const food = gd.foods[i];
      if (dist(cell.x, cell.y, food.x, food.y) < r) {
        cell.mass += 1.5;
        gd.foods.splice(i, 1);
        gd.foods.push({
          x: rand(20, WORLD_W - 20),
          y: rand(20, WORLD_H - 20),
          color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)],
        });
      }
    }
  }

  // 吃细胞
  for (let i = 0; i < gd.cells.length; i++) {
    const a = gd.cells[i];
    if (a.dead) continue;
    for (let j = gd.cells.length - 1; j > i; j--) {
      const b = gd.cells[j];
      if (b.dead) continue;
      const d = dist(a.x, a.y, b.x, b.y);
      const ra = massToRadius(a.mass);
      const rb = massToRadius(b.mass);
      if (d < Math.max(ra, rb) * 0.85) {
        if (a.mass > b.mass * EAT_RATIO && d < ra) {
          a.mass += b.mass * 0.85;
          b.dead = true;
          if (a.isPlayer && !b.isPlayer) gd.kills++;
        } else if (b.mass > a.mass * EAT_RATIO && d < rb) {
          b.mass += a.mass * 0.85;
          a.dead = true;
          if (b.isPlayer && !a.isPlayer) gd.kills++;
        }
      }
    }
  }

  // 玩家细胞合并
  const playerCells = gd.cells.filter(c => c.isPlayer && !c.dead);
  for (let i = 0; i < playerCells.length; i++) {
    for (let j = i + 1; j < playerCells.length; j++) {
      const a = playerCells[i];
      const b = playerCells[j];
      if (a.mergeTimer <= 0 && b.mergeTimer <= 0) {
        const d = dist(a.x, a.y, b.x, b.y);
        const ra = massToRadius(a.mass);
        const rb = massToRadius(b.mass);
        if (d < (ra + rb) * 0.6) {
          a.mass += b.mass;
          a.x = (a.x * a.mass + b.x * b.mass) / (a.mass + b.mass);
          a.y = (a.y * a.mass + b.y * b.mass) / (a.mass + b.mass);
          b.dead = true;
        }
      }
    }
  }

  // 移除死亡细胞
  gd.cells = gd.cells.filter(c => !c.dead);
  gd.playerIds = gd.cells.filter(c => c.isPlayer).map(c => c.id);

  // 更新相机
  const pCells = gd.cells.filter(c => c.isPlayer);
  if (pCells.length > 0) {
    let totalMass = 0, cx = 0, cy = 0;
    for (const c of pCells) { totalMass += c.mass; cx += c.x * c.mass; cy += c.y * c.mass; }
    gd.camX = cx / totalMass;
    gd.camY = cy / totalMass;
    let totalR = 0;
    for (const c of pCells) totalR += massToRadius(c.mass);
    gd.zoom = Math.max(0.45, Math.min(1.3, 220 / (220 + totalR * 0.5)));
  }
}

/* ============ 分裂与喷射 ============ */
function doSplit(gd: GameData): void {
  if (gd.splitCd > 0) return;
  const pCells = gd.cells.filter(c => c.isPlayer && !c.dead);
  if (pCells.length >= MAX_PLAYER_CELLS) return;
  pCells.sort((a, b) => b.mass - a.mass);
  const target = pCells[0];
  if (!target || target.mass < MIN_SPLIT_MASS) return;

  const halfMass = target.mass / 2;
  target.mass = halfMass;
  target.mergeTimer = MERGE_TIME;

  const dx = gd.worldMouseX - target.x;
  const dy = gd.worldMouseY - target.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const dirX = d > 0 ? dx / d : 1;
  const dirY = d > 0 ? dy / d : 0;
  const r = massToRadius(halfMass);

  gd.cells.push({
    id: gd.nextId++,
    x: target.x + dirX * r * 1.5,
    y: target.y + dirY * r * 1.5,
    vx: dirX * 400, vy: dirY * 400,
    mass: halfMass, color: PLAYER_COLOR,
    isPlayer: true, name: "你",
    splitCd: 0, ejectCd: 0, mergeTimer: MERGE_TIME,
    wanderAngle: 0, wanderTimer: 0, dead: false,
  });
  gd.splitCd = SPLIT_COOLDOWN;
}

function doEject(gd: GameData): void {
  if (gd.ejectCd > 0) return;
  const pCells = gd.cells.filter(c => c.isPlayer && !c.dead);
  pCells.sort((a, b) => b.mass - a.mass);
  const target = pCells[0];
  if (!target || target.mass < MIN_EJECT_MASS) return;

  const dx = gd.worldMouseX - target.x;
  const dy = gd.worldMouseY - target.y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const dirX = d > 0 ? dx / d : 1;
  const dirY = d > 0 ? dy / d : 0;
  const r = massToRadius(target.mass);

  target.mass -= 8;
  gd.foods.push({
    x: target.x + dirX * (r + 5),
    y: target.y + dirY * (r + 5),
    color: target.color,
  });
  gd.ejectCd = EJECT_COOLDOWN;
}

/* ============ 渲染 ============ */
function renderGame(ctx: CanvasRenderingContext2D, gd: GameData): void {
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.save();
  ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
  ctx.scale(gd.zoom, gd.zoom);
  ctx.translate(-gd.camX, -gd.camY);

  // 网格
  ctx.strokeStyle = "rgba(60,60,80,0.15)";
  ctx.lineWidth = 1 / gd.zoom;
  const gridStep = 100;
  const startX = Math.max(0, gd.camX - CANVAS_W / 2 / gd.zoom);
  const endX = Math.min(WORLD_W, gd.camX + CANVAS_W / 2 / gd.zoom);
  const startY = Math.max(0, gd.camY - CANVAS_H / 2 / gd.zoom);
  const endY = Math.min(WORLD_H, gd.camY + CANVAS_H / 2 / gd.zoom);
  for (let x = Math.floor(startX / gridStep) * gridStep; x <= endX; x += gridStep) {
    ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke();
  }
  for (let y = Math.floor(startY / gridStep) * gridStep; y <= endY; y += gridStep) {
    ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke();
  }

  // 世界边界
  ctx.strokeStyle = "rgba(139,92,246,0.4)";
  ctx.lineWidth = 3 / gd.zoom;
  ctx.strokeRect(0, 0, WORLD_W, WORLD_H);

  // 食物
  for (const food of gd.foods) {
    if (food.x < startX - 20 || food.x > endX + 20 || food.y < startY - 20 || food.y > endY + 20) continue;
    ctx.fillStyle = food.color;
    ctx.beginPath();
    ctx.arc(food.x, food.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 细胞 (按质量排序，小的在上面)
  const sorted = [...gd.cells].sort((a, b) => b.mass - a.mass);
  for (const cell of sorted) {
    const r = massToRadius(cell.mass);
    if (cell.x + r < startX || cell.x - r > endX || cell.y + r < startY || cell.y - r > endY) continue;

    // 阴影
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(cell.x + 2, cell.y + 2, r, 0, Math.PI * 2);
    ctx.fill();

    // 主体
    const grad = ctx.createRadialGradient(cell.x - r * 0.3, cell.y - r * 0.3, 0, cell.x, cell.y, r);
    grad.addColorStop(0, cell.color);
    grad.addColorStop(1, cell.color + "88");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cell.x, cell.y, r, 0, Math.PI * 2);
    ctx.fill();

    // 边框
    ctx.strokeStyle = cell.isPlayer ? "#c4b5fd" : cell.color;
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.stroke();

    // 名字
    if (r > 15) {
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.max(10, Math.min(r * 0.4, 20))}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cell.name, cell.x, cell.y - r * 0.15);
      ctx.font = `${Math.max(8, Math.min(r * 0.3, 14))}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(Math.floor(cell.mass).toString(), cell.x, cell.y + r * 0.25);
    }
  }

  ctx.restore();
}

/* ============ 组件 ============ */
export default function CellEaterPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const gdRef = useRef<GameData | null>(null);
  const animFrameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(false);
  const gameStateRef = useRef<"start" | "playing" | "over">("start");
  const submittedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const displaySyncRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const endGameRef = useRef<() => void>(() => {});

  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<"start" | "playing" | "over">("start");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hud, setHud] = useState({ time: GAME_DURATION, mass: 0, rank: 0, kills: 0, leaderboard: [] as { name: string; mass: number; isPlayer: boolean }[] });

  useEffect(() => () => {
    if (displaySyncRef.current) clearInterval(displaySyncRef.current);
    cancelAnimationFrame(animFrameRef.current);
    timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (saved > 0) setBestScore(saved);
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (gameStateRef.current === "playing") {
          setPaused(p => !p);
        }
      } else if (e.key === " " && gameStateRef.current === "playing" && !pausedRef.current) {
        e.preventDefault();
        if (gdRef.current) doSplit(gdRef.current);
      } else if (e.key === "w" && gameStateRef.current === "playing" && !pausedRef.current) {
        e.preventDefault();
        if (gdRef.current) doEject(gdRef.current);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { bestScoreRef.current = bestScore; }, [bestScore]);

  const startGame = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (displaySyncRef.current) { clearInterval(displaySyncRef.current); displaySyncRef.current = null; }
    const gd = initGame();
    gdRef.current = gd;
    submittedRef.current = false;
    setScore(0);
    setPaused(false);
    setGameState("playing");
    gameStateRef.current = "playing";
    lastTimeRef.current = 0;

    displaySyncRef.current = setInterval(() => {
      const gd = gdRef.current;
      if (!gd || gameStateRef.current !== "playing" || pausedRef.current) return;

      const pCells = gd.cells.filter(c => c.isPlayer);
      const playerMass = pCells.reduce((s, c) => s + c.mass, 0);

      const allSorted = [...gd.cells].sort((a, b) => {
        const am = a.isPlayer ? playerMass : a.mass;
        const bm = b.isPlayer ? playerMass : b.mass;
        return bm - am;
      });
      const uniqueEntries: { name: string; mass: number; isPlayer: boolean }[] = [];
      const seen = new Set<string>();
      for (const c of allSorted) {
        const key = c.isPlayer ? "player" : c.name;
        if (seen.has(key)) continue;
        seen.add(key);
        uniqueEntries.push({
          name: c.name,
          mass: Math.floor(c.isPlayer ? playerMass : c.mass),
          isPlayer: c.isPlayer,
        });
      }

      let rank = 1;
      for (const e of uniqueEntries) {
        if (e.isPlayer) break;
        rank++;
      }

      setHud({
        time: Math.ceil(gd.timeLeft),
        mass: Math.floor(playerMass),
        rank,
        kills: gd.kills,
        leaderboard: uniqueEntries.slice(0, 5),
      });

      if (gd.timeLeft <= 0 || pCells.length === 0) {
        endGameRef.current();
      }
    }, 100);

    const loop = (now: number) => {
      if (gameStateRef.current !== "playing") return;
      const gd = gdRef.current;
      if (!gd) return;
      if (lastTimeRef.current === 0) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (!pausedRef.current) {
        updateGame(gd, dt);
      }

      const cv = canvasRef.current;
      if (cv) {
        let ctx = ctxRef.current;
        if (!ctx) { ctx = cv.getContext("2d"); if (ctx) ctxRef.current = ctx; }
        if (ctx) renderGame(ctx, gd);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
  }, []);

  const endGame = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const gd = gdRef.current;
    const pCells = gd ? gd.cells.filter(c => c.isPlayer) : [];
    const playerMass = pCells.reduce((s, c) => s + c.mass, 0);
    const finalScore = Math.floor(playerMass);
    scoreRef.current = finalScore;

    cancelAnimationFrame(animFrameRef.current);
    if (displaySyncRef.current) { clearInterval(displaySyncRef.current); displaySyncRef.current = null; }

    setScore(finalScore);
    setGameState("over");
    gameStateRef.current = "over";
    setRefreshKey(k => k + 1);
    submitScore(GAME_ID, finalScore);
    if (finalScore > bestScoreRef.current) {
      setBestScore(finalScore);
      try { localStorage.setItem(BEST_SCORE_KEY, String(finalScore)); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => { endGameRef.current = endGame; }, [endGame]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const gd = gdRef.current;
    if (!gd) return;
    const rect = e.currentTarget.getBoundingClientRect();
    gd.mouseX = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    gd.mouseY = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const gd = gdRef.current;
    if (!gd) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    gd.mouseX = ((touch.clientX - rect.left) / rect.width) * CANVAS_W;
    gd.mouseY = ((touch.clientY - rect.top) / rect.height) * CANVAS_H;
  }, []);

  const stats: GameStat[] = [
    { label: "体积", value: hud.mass, icon: "🔵" },
    { label: "排名", value: `#${hud.rank}`, icon: "🏅" },
    { label: "击杀", value: hud.kills, icon: "💀" },
    { label: "最高分", value: bestScore, icon: "🏆" },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <GameShell gameId={GAME_ID} title="细胞吞噬" iconEmoji="🔵" iconGradient="from-cyan-500 to-blue-500"
      stats={stats} shareScore={score} refreshKey={refreshKey}>
      <div className="relative">
        {gameState === "start" && (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="text-6xl">🔵</div>
            <h2 className="text-3xl font-bold text-white">细胞吞噬</h2>
            <p className="max-w-md text-center text-gray-400">
              控制细胞吞噬食物和小细胞来变大！小心比你大的细胞。空格分裂追击，W键喷射质量。60秒限时挑战！
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <span>🖱️ 鼠标移动</span>
              <span>⌨️ 空格分裂</span>
              <span>⌨️ W喷射</span>
            </div>
            <button onClick={startGame} aria-label="开始游戏"
              className="flex h-12 items-center gap-2 rounded-xl bg-cyan-600 px-8 text-lg font-bold text-white transition hover:bg-cyan-500 active:scale-95">
              <Play size={20} /> 开始游戏
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="p-2">
            {/* Canvas + HUD overlay */}
            <div className="relative mx-auto" style={{ maxWidth: "600px" }}>
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onTouchStart={handleTouchMove}
                className="w-full rounded-xl border border-gray-700 bg-[#0a0a0f] touch-none"
                aria-label="游戏画面"
              />

              {/* HUD: Timer */}
              <div className="absolute left-1/2 top-2 -translate-x-1/2">
                <div className={`rounded-full px-4 py-1 text-lg font-bold ${
                  hud.time <= 10 ? "bg-red-500/30 text-red-400" : "bg-black/50 text-white"
                }`}>
                  ⏱️ {hud.time}s
                </div>
              </div>

              {/* HUD: Mass & Rank */}
              <div className="absolute left-2 top-2 flex flex-col gap-1">
                <div className="rounded-lg bg-black/50 px-3 py-1 text-sm text-white">
                  体积: <span className="font-bold text-cyan-400">{hud.mass}</span>
                </div>
                <div className="rounded-lg bg-black/50 px-3 py-1 text-sm text-white">
                  排名: <span className="font-bold text-amber-400">#{hud.rank}</span>
                </div>
                <div className="rounded-lg bg-black/50 px-3 py-1 text-sm text-white">
                  击杀: <span className="font-bold text-red-400">{hud.kills}</span>
                </div>
              </div>

              {/* HUD: Leaderboard */}
              <div className="absolute right-2 top-2 rounded-lg bg-black/50 p-2 text-xs">
                <div className="mb-1 font-bold text-gray-400">排行榜</div>
                {hud.leaderboard.map((entry, i) => (
                  <div key={i} className={`flex justify-between gap-3 ${
                    entry.isPlayer ? "text-cyan-400 font-bold" : "text-gray-300"
                  }`}>
                    <span>{i + 1}. {entry.name}</span>
                    <span>{entry.mass}</span>
                  </div>
                ))}
              </div>

              {/* Mobile controls */}
              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-3 sm:hidden">
                <button
                  onClick={() => gdRef.current && doSplit(gdRef.current)}
                  aria-label="分裂"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600/80 text-white active:scale-90"
                >
                  <span className="text-xs font-bold">分裂</span>
                </button>
                <button
                  onClick={() => gdRef.current && doEject(gdRef.current)}
                  aria-label="喷射"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600/80 text-white active:scale-90"
                >
                  <span className="text-xs font-bold">喷射</span>
                </button>
              </div>

              {/* Pause button */}
              <button
                onClick={() => setPaused(p => !p)}
                aria-label="暂停"
                className="absolute bottom-2 right-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white active:scale-90"
              >
                <Pause size={18} />
              </button>

              {/* Desktop controls hint */}
              <div className="mt-2 hidden text-center text-xs text-gray-500 sm:block">
                鼠标移动方向 | 空格分裂 | W喷射 | P暂停
              </div>
            </div>

            <div className="mt-2 flex justify-center">
              <button onClick={startGame} aria-label="重新开始"
                className="flex h-11 items-center gap-2 rounded-xl bg-gray-800 px-5 text-sm font-medium text-white transition hover:bg-gray-700 active:scale-95">
                <RotateCcw size={16} /> 重新开始
              </button>
            </div>
          </div>
        )}

        {gameState === "over" && (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            <div className="text-6xl">{hud.mass > 0 ? "🎯" : "💀"}</div>
            <h2 className="text-3xl font-bold text-white">
              {hud.mass > 0 ? "时间到！" : "被吞噬了！"}
            </h2>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">{score}</div>
                <div className="text-sm text-gray-400">最终体积</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400">#{hud.rank}</div>
                <div className="text-sm text-gray-400">排名</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400">{hud.kills}</div>
                <div className="text-sm text-gray-400">击杀</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">{bestScore}</div>
                <div className="text-sm text-gray-400">最高分</div>
              </div>
            </div>
            {score >= bestScore && score > 0 && (
              <div className="rounded-full bg-amber-500/20 px-4 py-1 text-sm font-bold text-amber-400">新纪录！</div>
            )}
            <button onClick={startGame} aria-label="再玩一次"
              className="flex h-12 items-center gap-2 rounded-xl bg-cyan-600 px-8 text-lg font-bold text-white transition hover:bg-cyan-500 active:scale-95">
              <RotateCcw size={20} /> 再玩一次
            </button>
          </div>
        )}

        {paused && gameState === "playing" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl font-bold text-white">已暂停</div>
              <button onClick={() => setPaused(false)} aria-label="继续"
                className="flex h-12 items-center gap-2 rounded-xl bg-cyan-600 px-8 text-lg font-bold text-white transition hover:bg-cyan-500 active:scale-95">
                <Play size={20} /> 继续
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}