"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleDot, RotateCcw, Pause, Play } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "bubble-shooter";
const BEST_KEY = "gm_bubble_best";

/* ===== Canvas / grid geometry ===== */
const W = 420;
const H = 550;
const R = 17; // bubble radius
const D = R * 2; // diameter
const ROW_H = D * 0.8660254; // vertical spacing (sqrt(3)/2 * D)
const COLS = 11; // columns per row (same for even & odd)
const SHOOTER_Y = H - 32;
const SPEED = 13;
const SHOTS_PER_ROW = 6;
const INIT_ROWS = 6;
const DANGER_Y = SHOOTER_Y - R * 3.5;

/* ===== Colors ===== */
const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
const COLOR_LIGHT = ["#fca5a5", "#93c5fd", "#86efac", "#fde047", "#d8b4fe"];

/* ===== Grid helpers ===== */
function bubbleX(row: number, col: number): number {
  return R + col * D + (row % 2 === 1 ? R : 0);
}

function bubbleY(row: number): number {
  return R + row * ROW_H;
}

function neighbors(row: number, col: number): [number, number][] {
  const odd = row % 2 === 1;
  return odd
    ? [
        [row, col - 1],
        [row, col + 1],
        [row - 1, col],
        [row - 1, col + 1],
        [row + 1, col],
        [row + 1, col + 1],
      ]
    : [
        [row, col - 1],
        [row, col + 1],
        [row - 1, col - 1],
        [row - 1, col],
        [row + 1, col - 1],
        [row + 1, col],
      ];
}

function emptyRow(): number[] {
  return Array<number>(COLS).fill(-1);
}

function makeGrid(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < INIT_ROWS; r++) {
    const row = emptyRow();
    const fillCount = r < INIT_ROWS - 2 ? COLS : Math.ceil(COLS * 0.6);
    for (let c = 0; c < fillCount; c++) {
      row[c] = Math.floor(Math.random() * COLORS.length);
    }
    grid.push(row);
  }
  return grid;
}

function ensureRow(grid: number[][], row: number): void {
  while (grid.length <= row) grid.push(emptyRow());
}

function findSnapPos(
  x: number,
  y: number,
  grid: number[][]
): [number, number] {
  let row = Math.round((y - R) / ROW_H);
  row = Math.max(0, row);
  ensureRow(grid, row + 1);

  const offset = row % 2 === 1 ? R : 0;
  let col = Math.round((x - R - offset) / D);
  col = Math.max(0, Math.min(COLS - 1, col));

  if (grid[row][col] === -1) return [row, col];

  // Search nearest empty cell
  let best: [number, number] = [row, col];
  let bestDist = Infinity;
  for (let r = Math.max(0, row - 2); r <= row + 2; r++) {
    ensureRow(grid, r);
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === -1) {
        const dx = bubbleX(r, c) - x;
        const dy = bubbleY(r) - y;
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          best = [r, c];
        }
      }
    }
  }
  return best;
}

function floodFill(
  grid: number[][],
  row: number,
  col: number,
  color: number
): [number, number][] {
  const visited = new Set<string>();
  const result: [number, number][] = [];
  const stack: [number, number][] = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (!grid[r] || grid[r][c] !== color) continue;
    result.push([r, c]);
    for (const [nr, nc] of neighbors(r, c)) {
      if (nr >= 0 && nr < grid.length && nc >= 0 && nc < COLS) {
        if (grid[nr] && grid[nr][nc] === color) {
          stack.push([nr, nc]);
        }
      }
    }
  }
  return result;
}

function findFloating(grid: number[][]): [number, number][] {
  const connected = new Set<string>();
  const stack: [number, number][] = [];
  // Start from top row
  if (grid[0]) {
    for (let c = 0; c < COLS; c++) {
      if (grid[0][c] !== -1) stack.push([0, c]);
    }
  }
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (connected.has(key)) continue;
    if (!grid[r] || grid[r][c] === -1) continue;
    connected.add(key);
    for (const [nr, nc] of neighbors(r, c)) {
      if (nr >= 0 && nr < grid.length && nc >= 0 && nc < COLS) {
        if (grid[nr] && grid[nr][nc] !== -1) {
          stack.push([nr, nc]);
        }
      }
    }
  }
  const floating: [number, number][] = [];
  for (let r = 0; r < grid.length; r++) {
    if (!grid[r]) continue;
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== -1 && !connected.has(`${r},${c}`)) {
        floating.push([r, c]);
      }
    }
  }
  return floating;
}

function addTopRow(grid: number[][]): number[][] {
  const newRow = emptyRow();
  for (let c = 0; c < COLS; c++) {
    if (Math.random() < 0.85) {
      newRow[c] = Math.floor(Math.random() * COLORS.length);
    }
  }
  return [newRow, ...grid];
}

function checkGameOver(grid: number[][]): boolean {
  for (let r = 0; r < grid.length; r++) {
    if (!grid[r]) continue;
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] !== -1 && bubbleY(r) > DANGER_Y) return true;
    }
  }
  return false;
}

function getExistingColors(grid: number[][]): number[] {
  const set = new Set<number>();
  for (const row of grid) {
    if (!row) continue;
    for (const v of row) {
      if (v !== -1) set.add(v);
    }
  }
  return Array.from(set);
}

interface AimPoint {
  x: number;
  y: number;
}

function calcAimPath(
  startX: number,
  startY: number,
  angle: number,
  grid: number[][]
): AimPoint[] {
  const points: AimPoint[] = [{ x: startX, y: startY }];
  let x = startX;
  let y = startY;
  let vx = Math.cos(angle);
  const vy = Math.sin(angle);
  let bounces = 0;
  const step = 5;

  while (y > R && bounces < 3) {
    x += vx * step;
    y += vy * step;

    if (x < R) {
      x = R;
      vx = -vx;
      bounces++;
      points.push({ x, y });
    } else if (x > W - R) {
      x = W - R;
      vx = -vx;
      bounces++;
      points.push({ x, y });
    }

    // Check collision with grid bubbles
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] !== -1) {
          const bx = bubbleX(r, c);
          const by = bubbleY(r);
          const dx = x - bx;
          const dy = y - by;
          if (dx * dx + dy * dy < D * D) {
            points.push({ x, y });
            return points;
          }
        }
      }
    }
  }
  points.push({ x, y });
  return points;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

interface PopAnim {
  id: number;
  x: number;
  y: number;
  color: number;
}

/* ===== Draw a single bubble ===== */
function drawBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: number
) {
  // Glow
  ctx.beginPath();
  ctx.arc(x, y, R + 1, 0, Math.PI * 2);
  ctx.fillStyle = COLORS[color] + "40";
  ctx.fill();
  // Main bubble
  const grad = ctx.createRadialGradient(
    x - R * 0.3,
    y - R * 0.3,
    R * 0.1,
    x,
    y,
    R
  );
  grad.addColorStop(0, COLOR_LIGHT[color]);
  grad.addColorStop(1, COLORS[color]);
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();
  // Highlight
  ctx.beginPath();
  ctx.arc(x - R * 0.3, y - R * 0.3, R * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fill();
  // Border
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

export default function BubbleShooterPage() {
  /* ===== mounted mode ===== */
  const [mounted, setMounted] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [over, setOver] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [combo, setCombo] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<number[][]>([]);
  const shootingRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: number;
  } | null>(null);
  const currentColorRef = useRef(0);
  const nextColorRef = useRef(0);
  const aimAngleRef = useRef(-Math.PI / 2);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const animRef = useRef(0);
  const scoreRef = useRef(0);
  const shotsRef = useRef(0);
  const submittedRef = useRef(false);
  const popIdRef = useRef(0);
  const popAnimsRef = useRef<PopAnim[]>([]);
  const overRef = useRef(false);
  const pausedRef = useRef(false);
  const handleSnapRef = useRef<(sb: { x: number; y: number; vx: number; vy: number; color: number }) => void>(() => {});
  const [nextBubble, setNextBubble] = useState(0);
  const [paused, setPaused] = useState(false);

  /* ===== init game (mounted) ===== */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (saved > 0) setBestScore(saved);
    } catch {
      /* ignore */
    }
    const g = makeGrid();
    gridRef.current = g;
    const colors = getExistingColors(g);
    const pool = colors.length > 0 ? colors : [0, 1, 2, 3, 4];
    currentColorRef.current = pool[Math.floor(Math.random() * pool.length)];
    nextColorRef.current = pool[Math.floor(Math.random() * pool.length)];
    setNextBubble(nextColorRef.current);
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ===== render & game loop ===== */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0f0f12";
    ctx.fillRect(0, 0, W, H);

    // Danger line
    ctx.strokeStyle = "rgba(239,68,68,0.25)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, DANGER_Y);
    ctx.lineTo(W, DANGER_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    const grid = gridRef.current;

    // Draw grid bubbles
    for (let r = 0; r < grid.length; r++) {
      if (!grid[r]) continue;
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === -1) continue;
        const bx = bubbleX(r, c);
        const by = bubbleY(r);
        drawBubble(ctx, bx, by, grid[r][c]);
      }
    }

    // Draw pop animations
    const pops = popAnimsRef.current;
    for (const p of pops) {
      const t = (Date.now() - p.id) / 300;
      if (t < 1) {
        const scale = 1 + t * 0.8;
        const alpha = 1 - t;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, R * scale, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[p.color];
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Draw aim line
    if (!shootingRef.current && !overRef.current && mouseRef.current) {
      const angle = aimAngleRef.current;
      const path = calcAimPath(W / 2, SHOOTER_Y, angle, grid);
      ctx.strokeStyle = "rgba(167,139,250,0.4)";
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw target dot
      const last = path[path.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(167,139,250,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw shooting bubble
    const sb = shootingRef.current;
    if (sb) {
      drawBubble(ctx, sb.x, sb.y, sb.color);
    }

    // Draw shooter
    const sx = W / 2;
    const sy = SHOOTER_Y;
    // Shooter base
    ctx.beginPath();
    ctx.arc(sx, sy + 8, R + 6, 0, Math.PI);
    ctx.fillStyle = "#27272a";
    ctx.fill();
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shooter bubble (current)
    if (!shootingRef.current && !overRef.current) {
      drawBubble(ctx, sx, sy, currentColorRef.current);
      // Aim arrow
      const angle = aimAngleRef.current;
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + Math.cos(angle) * 30, sy + Math.sin(angle) * 30);
      ctx.stroke();
    }

    // Game over overlay
    if (overRef.current) {
      ctx.fillStyle = "rgba(9,9,11,0.8)";
      ctx.fillRect(0, 0, W, H);
    }
  }, []);

  /* ===== game loop ===== */
  useEffect(() => {
    if (!mounted) return;

    const loop = () => {
      if (pausedRef.current) {
        animRef.current = requestAnimationFrame(loop);
        return;
      }
      const sb = shootingRef.current;
      if (sb && !overRef.current) {
        sb.x += sb.vx;
        sb.y += sb.vy;

        // Wall bounce
        if (sb.x < R) {
          sb.x = R;
          sb.vx = -sb.vx;
        } else if (sb.x > W - R) {
          sb.x = W - R;
          sb.vx = -sb.vx;
        }

        // Check collision with top
        let collided = sb.y <= R;

        // Check collision with grid bubbles
        if (!collided) {
          const grid = gridRef.current;
          for (let r = 0; r < grid.length && !collided; r++) {
            if (!grid[r]) continue;
            for (let c = 0; c < COLS && !collided; c++) {
              if (grid[r][c] !== -1) {
                const bx = bubbleX(r, c);
                const by = bubbleY(r);
                const dx = sb.x - bx;
                const dy = sb.y - by;
                if (dx * dx + dy * dy < D * D) {
                  collided = true;
                }
              }
            }
          }
        }

        if (collided) {
          handleSnapRef.current(sb);
          shootingRef.current = null;
        }
      }

      // Clean up old pop animations
      const now = Date.now();
      popAnimsRef.current = popAnimsRef.current.filter(
        (p) => now - p.id < 300
      );

      draw();
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [mounted, draw]);

  /* ===== snap & match logic ===== */
  const handleSnap = useCallback(
    (sb: { x: number; y: number; vx: number; vy: number; color: number }) => {
      const grid = gridRef.current;
      const [row, col] = findSnapPos(sb.x, sb.y, grid);
      ensureRow(grid, row);
      grid[row][col] = sb.color;

      // Pop animation at snap position
      popAnimsRef.current.push({
        id: Date.now() + popIdRef.current++,
        x: bubbleX(row, col),
        y: bubbleY(row),
        color: sb.color,
      });

      // Flood fill match
      const matched = floodFill(grid, row, col, sb.color);
      let gained = 0;
      let popCount = 0;

      if (matched.length >= 3) {
        for (const [r, c] of matched) {
          popAnimsRef.current.push({
            id: Date.now() + popIdRef.current++,
            x: bubbleX(r, c),
            y: bubbleY(r),
            color: grid[r][c],
          });
          grid[r][c] = -1;
          popCount++;
        }
        gained = popCount * 10;

        // Check floating
        const floating = findFloating(grid);
        for (const [r, c] of floating) {
          popAnimsRef.current.push({
            id: Date.now() + popIdRef.current++,
            x: bubbleX(r, c),
            y: bubbleY(r),
            color: grid[r][c],
          });
          grid[r][c] = -1;
          popCount++;
        }
        gained += floating.length * 20;

        // Combo bonus
        if (popCount >= 6) {
          gained += popCount * 5;
        }
        setCombo((c) => c + 1);
      } else {
        setCombo(0);
      }

      if (gained > 0) {
        scoreRef.current += gained;
        setScore(scoreRef.current);
      }

      // Increment shots, maybe add row
      shotsRef.current++;
      if (shotsRef.current % SHOTS_PER_ROW === 0) {
        gridRef.current = addTopRow(grid);
      }

      // Pick next color from existing colors
      const existing = getExistingColors(gridRef.current);
      const pool = existing.length > 0 ? existing : [0, 1, 2, 3, 4];
      currentColorRef.current = nextColorRef.current;
      nextColorRef.current = pool[Math.floor(Math.random() * pool.length)];
      setNextBubble(nextColorRef.current);

      // Check game over
      if (checkGameOver(gridRef.current)) {
        overRef.current = true;
        setOver(true);
        if (!submittedRef.current) {
          submittedRef.current = true;
          const r = submitScore(GAME_ID, scoreRef.current);
          setResult(r);
          setRefreshKey((k) => k + 1);
          if (scoreRef.current > 0) {
            try {
              const best = parseInt(
                localStorage.getItem(BEST_KEY) || "0",
                10
              );
              if (scoreRef.current > best) {
                localStorage.setItem(BEST_KEY, String(scoreRef.current));
                setBestScore(scoreRef.current);
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
    },
    []
  );
  useEffect(() => {
    handleSnapRef.current = handleSnap;
  }, [handleSnap]);

  /* ===== input handlers ===== */
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: W / 2, y: H / 2 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (overRef.current || shootingRef.current) return;
    const pos = getCanvasPos(e);
    mouseRef.current = pos;
    const dx = pos.x - W / 2;
    const dy = pos.y - SHOOTER_Y;
    let angle = Math.atan2(dy, dx);
    // Clamp angle to upward range
    if (angle > -0.15) angle = -0.15;
    if (angle < -Math.PI + 0.15) angle = -Math.PI + 0.15;
    aimAngleRef.current = angle;
  };

  const handleShoot = () => {
    if (overRef.current || shootingRef.current || !mounted || pausedRef.current) return;
    const angle = aimAngleRef.current;
    shootingRef.current = {
      x: W / 2,
      y: SHOOTER_Y,
      vx: Math.cos(angle) * SPEED,
      vy: Math.sin(angle) * SPEED,
      color: currentColorRef.current,
    };
  };

  /* ===== restart ===== */
  const restart = () => {
    const g = makeGrid();
    gridRef.current = g;
    const colors = getExistingColors(g);
    const pool = colors.length > 0 ? colors : [0, 1, 2, 3, 4];
    currentColorRef.current = pool[Math.floor(Math.random() * pool.length)];
    nextColorRef.current = pool[Math.floor(Math.random() * pool.length)];
    setNextBubble(nextColorRef.current);
    scoreRef.current = 0;
    shotsRef.current = 0;
    submittedRef.current = false;
    overRef.current = false;
    shootingRef.current = null;
    popAnimsRef.current = [];
    setScore(0);
    setOver(false);
    setResult(null);
    setCombo(0);
    pausedRef.current = false;
    setPaused(false);
  };

  const togglePause = useCallback(() => {
    if (overRef.current) return;
    setPaused((p) => {
      const np = !p;
      pausedRef.current = np;
      return np;
    });
  }, []);

  /* ===== keyboard pause ===== */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p") {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePause]);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "最高", value: bestScore },
    { label: "连消", value: combo },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="泡泡龙"
        description="发射彩色泡泡，3个以上同色相连即可消除"
        instructions="移动鼠标瞄准，点击发射泡泡。3个以上同色泡泡相连即可消除，消除后悬空的泡泡也会掉落。每隔几步顶部会新增一行，泡泡触底则游戏结束。"
        icon={CircleDot}
        iconEmoji="🫧"
        iconGradient="from-sky-400 to-indigo-500"
        stats={stats}
        shareScore={score}
        refreshKey={refreshKey}
      >
        <div className="flex items-center justify-center h-[550px]">
          <div className="text-slate-500">加载中...</div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="泡泡龙"
      description="发射彩色泡泡，3个以上同色相连即可消除"
      instructions="移动鼠标瞄准，点击发射泡泡。3个以上同色泡泡相连即可消除，消除后悬空的泡泡也会掉落。每隔几步顶部会新增一行，泡泡触底则游戏结束。"
      icon={CircleDot}
      iconEmoji="🫧"
      iconGradient="from-sky-400 to-indigo-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Next bubble + restart */}
        <div className="flex items-center justify-between w-full max-w-[420px] px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">下一个:</span>
            <div
              className="w-6 h-6 rounded-full border border-white/20"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${COLOR_LIGHT[nextBubble]}, ${COLORS[nextBubble]})`,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            {!over && (
              <button
                onClick={togglePause}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
              >
                {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                {paused ? "继续" : "暂停"}
              </button>
            )}
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新开始
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onClick={handleShoot}
            onTouchStart={(e) => {
              e.preventDefault();
              handleMove(e);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleShoot();
            }}
            className="rounded-xl border border-[#27272a] cursor-crosshair touch-none max-w-full"
            style={{ background: "#0f0f12" }}
          />

          {/* Pause overlay */}
          {paused && !over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#09090b]/70 backdrop-blur-sm rounded-xl animate-overlay-in">
              <div className="text-4xl">⏸️</div>
              <div className="text-xl font-bold text-white">已暂停</div>
              <div className="text-xs text-slate-400">按 P 或点击按钮继续</div>
            </div>
          )}

          {/* Game over overlay */}
          {over && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#09090b]/85 backdrop-blur-sm rounded-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  游戏结束
                </div>
                <div className="text-lg text-[#a78bfa] font-semibold">
                  {score} 分
                </div>
                {result && (
                  <div className="text-sm text-slate-400 mt-1">
                    排名 #{result.rank} / {result.total} · 击败{" "}
                    {result.beatPercent}% 玩家
                  </div>
                )}
              </div>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                再来一局
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 text-center">
          移动鼠标瞄准 · 点击发射 · 同色3连消除
        </p>
      </div>
    </GameShell>
  );
}
