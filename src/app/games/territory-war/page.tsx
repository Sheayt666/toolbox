"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Map as MapIcon, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "territory-war";
const CANVAS_W = 500;
const CANVAS_H = 500;
const BEST_SCORE_KEY = "gm_territory_war_best";

const GRID = 100; // 100x100 grid
const CELL = CANVAS_W / GRID; // 5px per cell
const AI_COUNT = 4;
const MOVE_INTERVAL = 5; // frames per step

const PLAYER_COLORS = [
  { fill: "#06b6d4", trail: "#67e8f9", name: "你" },
  { fill: "#ef4444", trail: "#fca5a5", name: "红方" },
  { fill: "#eab308", trail: "#fde047", name: "黄方" },
  { fill: "#a855f7", trail: "#c4b5fd", name: "紫方" },
  { fill: "#22c55e", trail: "#86efac", name: "绿方" },
];

interface Player {
  id: number;
  x: number;
  y: number;
  dir: { x: number; y: number };
  nextDir: { x: number; y: number };
  alive: boolean;
  inTrail: boolean; // currently outside territory leaving trail
  aiTimer: number;
  aiTarget: { x: number; y: number } | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export default function TerritoryWarPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Int8Array>(new Int8Array(GRID * GRID)); // -1 neutral, 0..n = owner
  const trailRef = useRef<Set<number>>(new Set()); // cells that are trail (player id encoded)
  const trailOwnerRef = useRef<Int8Array>(new Int8Array(GRID * GRID)); // who owns the trail
  const playersRef = useRef<Player[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const stepCounterRef = useRef(0);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const lastScoreSyncedRef = useRef(0);
  const bestRef = useRef(0);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);
  const dirQueueRef = useRef<{ x: number; y: number }[]>([]);

  const stepRef = useRef<(dt: number) => void>(() => {});
  const drawRef = useRef<() => void>(() => {});
  const gameOverRef = useRef<() => void>(() => {});

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [aliveCount, setAliveCount] = useState(0);

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number) => {
      const particles = particlesRef.current;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 20 + Math.random() * 15,
          maxLife: 35,
          color,
          size: 2 + Math.random() * 2,
        });
      }
    },
    [],
  );

  const idx = (x: number, y: number) => y * GRID + x;

  const floodFill = useCallback(
    (playerId: number) => {
      const grid = gridRef.current;
      const trailOwner = trailOwnerRef.current;
      const trail = trailRef.current;

      // Mark trail cells as player territory
      for (const cellIdx of trail) {
        grid[cellIdx] = playerId;
      }
      trail.clear();

      // Flood fill from borders: any cell not owned by player and not trail becomes "outside"
      // Then enclosed cells become player's
      const visited = new Uint8Array(GRID * GRID);
      const queue: number[] = [];

      // Start from all border cells that are not player's
      for (let x = 0; x < GRID; x++) {
        if (grid[idx(x, 0)] !== playerId) {
          queue.push(idx(x, 0));
          visited[idx(x, 0)] = 1;
        }
        if (grid[idx(x, GRID - 1)] !== playerId) {
          queue.push(idx(x, GRID - 1));
          visited[idx(x, GRID - 1)] = 1;
        }
      }
      for (let y = 0; y < GRID; y++) {
        if (grid[idx(0, y)] !== playerId) {
          queue.push(idx(0, y));
          visited[idx(0, y)] = 1;
        }
        if (grid[idx(GRID - 1, y)] !== playerId) {
          queue.push(idx(GRID - 1, y));
          visited[idx(GRID - 1, y)] = 1;
        }
      }

      while (queue.length > 0) {
        const ci = queue.shift()!;
        const cx = ci % GRID;
        const cy = Math.floor(ci / GRID);
        const neighbors = [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) continue;
          const ni = idx(nx, ny);
          if (visited[ni]) continue;
          if (grid[ni] === playerId) continue;
          visited[ni] = 1;
          queue.push(ni);
        }
      }

      // All unvisited cells that are not player's become player's
      let gained = 0;
      for (let i = 0; i < GRID * GRID; i++) {
        if (!visited[i] && grid[i] !== playerId) {
          // Check if this cell belongs to another player's territory - if so, we capture it
          grid[i] = playerId;
          gained++;
        }
      }

      // Clear trail ownership
      trailOwner.fill(-1);

      return gained;
    },
    [],
  );

  const killPlayer = useCallback(
    (player: Player) => {
      if (!player.alive) return;
      player.alive = false;
      // Clear player's trail
      const trail = trailRef.current;
      const trailOwner = trailOwnerRef.current;
      const toRemove: number[] = [];
      for (const cellIdx of trail) {
        if (trailOwner[cellIdx] === player.id) {
          toRemove.push(cellIdx);
          trailOwner[cellIdx] = -1;
        }
      }
      for (const ci of toRemove) trail.delete(ci);

      // Clear player's territory
      const grid = gridRef.current;
      for (let i = 0; i < GRID * GRID; i++) {
        if (grid[i] === player.id) grid[i] = -1;
      }

      // Particles
      spawnParticles(
        player.x * CELL + CELL / 2,
        player.y * CELL + CELL / 2,
        PLAYER_COLORS[player.id].fill,
        20,
      );
    },
    [spawnParticles],
  );

  const initGame = useCallback(() => {
    const grid = gridRef.current;
    grid.fill(-1);
    trailRef.current.clear();
    trailOwnerRef.current.fill(-1);
    particlesRef.current = [];
    stepCounterRef.current = 0;
    dirQueueRef.current = [];
    scoreRef.current = 0;
    lastScoreSyncedRef.current = 0;

    const players: Player[] = [];
    // Player at center
    const startX = Math.floor(GRID / 2);
    const startY = Math.floor(GRID / 2);
    const startRadius = 4;

    for (let i = 0; i <= AI_COUNT; i++) {
      let px: number, py: number;
      if (i === 0) {
        px = startX;
        py = startY;
      } else {
        // Place AI in corners
        const corners = [
          [10, 10],
          [GRID - 11, 10],
          [10, GRID - 11],
          [GRID - 11, GRID - 11],
        ];
        [px, py] = corners[i - 1];
      }

      players.push({
        id: i,
        x: px,
        y: py,
        dir: { x: 1, y: 0 },
        nextDir: { x: 1, y: 0 },
        alive: true,
        inTrail: false,
        aiTimer: 0,
        aiTarget: null,
      });

      // Give starting territory
      for (let dx = -startRadius; dx <= startRadius; dx++) {
        for (let dy = -startRadius; dy <= startRadius; dy++) {
          const gx = px + dx;
          const gy = py + dy;
          if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
            grid[idx(gx, gy)] = i;
          }
        }
      }
    }
    playersRef.current = players;

    // Calculate initial score for player
    let playerCells = 0;
    for (let i = 0; i < GRID * GRID; i++) {
      if (grid[i] === 0) playerCells++;
    }
    scoreRef.current = playerCells;
    lastScoreSyncedRef.current = playerCells;
  }, []);

  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    setRunning(false);
    runningRef.current = false;
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const pct = Math.round((s / (GRID * GRID)) * 100);
    const r = submitScore(GAME_ID, s, `占领 ${pct}%`);
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

  const stepAI = useCallback((player: Player) => {
    const grid = gridRef.current;
    // Simple AI: if in territory, venture out; if in trail, return to territory
    if (!player.inTrail) {
      // Venture out: pick a direction away from territory
      if (!player.aiTarget || Math.random() < 0.05) {
        // Pick a target outside territory
        let attempts = 0;
        while (attempts < 10) {
          const tx = Math.floor(Math.random() * GRID);
          const ty = Math.floor(Math.random() * GRID);
          if (grid[idx(tx, ty)] !== player.id) {
            player.aiTarget = { x: tx, y: ty };
            break;
          }
          attempts++;
        }
      }
    } else {
      // Return to territory: find nearest own territory
      let bestDist = Infinity;
      let bestX = player.x;
      let bestY = player.y;
      for (let r = 1; r < 20; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
            const gx = player.x + dx;
            const gy = player.y + dy;
            if (gx < 0 || gx >= GRID || gy < 0 || gy >= GRID) continue;
            if (grid[idx(gx, gy)] === player.id) {
              const d = dx * dx + dy * dy;
              if (d < bestDist) {
                bestDist = d;
                bestX = gx;
                bestY = gy;
              }
            }
          }
        }
        if (bestDist < Infinity) break;
      }
      player.aiTarget = { x: bestX, y: bestY };
    }

    if (player.aiTarget) {
      const dx = player.aiTarget.x - player.x;
      const dy = player.aiTarget.y - player.y;
      // Prefer the axis with greater distance, but avoid 180 turns
      if (Math.abs(dx) > Math.abs(dy)) {
        const nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        // Avoid reversing
        if (nd.x !== -player.dir.x || nd.y !== -player.dir.y) {
          player.nextDir = nd;
        } else if (dy !== 0) {
          player.nextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        }
      } else {
        const nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
        if (nd.x !== -player.dir.x || nd.y !== -player.dir.y) {
          player.nextDir = nd;
        } else if (dx !== 0) {
          player.nextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
        }
      }
    }

    // Avoid hitting walls
    const nx = player.x + player.nextDir.x;
    const ny = player.y + player.nextDir.y;
    if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
      // Turn perpendicular
      if (player.nextDir.x !== 0) {
        player.nextDir = { x: 0, y: Math.random() < 0.5 ? 1 : -1 };
      } else {
        player.nextDir = { x: Math.random() < 0.5 ? 1 : -1, y: 0 };
      }
    }
  }, []);

  const stepPhysics = useCallback(
    (dt: number) => {
      stepCounterRef.current += dt;
      if (stepCounterRef.current < MOVE_INTERVAL) return;
      stepCounterRef.current = 0;

      const players = playersRef.current;
      const grid = gridRef.current;
      const trail = trailRef.current;
      const trailOwner = trailOwnerRef.current;

      // Process player direction queue
      const player = players[0];
      if (player.alive && dirQueueRef.current.length > 0) {
        const nd = dirQueueRef.current.shift()!;
        // Don't allow 180 turn
        if (nd.x !== -player.dir.x || nd.y !== -player.dir.y) {
          player.nextDir = nd;
        }
      }

      // AI decisions
      for (const p of players) {
        if (!p.alive) continue;
        if (p.id !== 0) stepAI(p);
      }

      // Move all players
      for (const p of players) {
        if (!p.alive) continue;
        p.dir = p.nextDir;
        const nx = p.x + p.dir.x;
        const ny = p.y + p.dir.y;

        // Wall collision = death
        if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
          killPlayer(p);
          continue;
        }

        p.x = nx;
        p.y = ny;

        const ci = idx(nx, ny);

        // Check if hit another player's trail
        if (trail.has(ci) && trailOwner[ci] !== p.id) {
          // This player hit someone's trail - kill the trail owner
          const owner = trailOwner[ci];
          if (owner >= 0 && owner < players.length) {
            killPlayer(players[owner]);
          }
        }

        // Check if hit own trail
        if (trail.has(ci) && trailOwner[ci] === p.id) {
          killPlayer(p);
          continue;
        }

        // Check territory
        if (grid[ci] === p.id) {
          // Back on own territory
          if (p.inTrail) {
            p.inTrail = false;
            // Complete territory
            floodFill(p.id);
          }
        } else {
          // Outside territory - leave trail
          p.inTrail = true;
          trail.add(ci);
          trailOwner[ci] = p.id;
          // Don't overwrite other players' territory with trail, just mark as trail
        }
      }

      // Calculate score
      let playerCells = 0;
      let alive = 0;
      for (const p of players) {
        if (p.alive) alive++;
      }
      for (let i = 0; i < GRID * GRID; i++) {
        if (grid[i] === 0) playerCells++;
      }
      scoreRef.current = playerCells;
      setAliveCount(alive);

      if (scoreRef.current !== lastScoreSyncedRef.current) {
        lastScoreSyncedRef.current = scoreRef.current;
        setScore(scoreRef.current);
      }

      // Check player death
      if (!player.alive) {
        gameOverRef.current();
      }

      // Update particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const part = particles[i];
        part.x += part.vx * dt;
        part.y += part.vy * dt;
        part.vx *= 0.93;
        part.vy *= 0.93;
        part.life -= dt;
        if (part.life <= 0) particles.splice(i, 1);
      }
    },
    [stepAI, killPlayer, floodFill],
  );

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    animFrameRef.current++;
    const t = animFrameRef.current;

    const grid = gridRef.current;
    const trail = trailRef.current;
    const trailOwner = trailOwnerRef.current;
    const players = playersRef.current;
    const particles = particlesRef.current;

    // Background
    ctx.fillStyle = "#0a0f14";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Draw grid cells
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const ci = idx(x, y);
        const owner = grid[ci];
        if (owner >= 0) {
          ctx.fillStyle = PLAYER_COLORS[owner].fill;
          ctx.globalAlpha = 0.5;
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Draw trails
    for (const ci of trail) {
      const x = ci % GRID;
      const y = Math.floor(ci / GRID);
      const owner = trailOwner[ci];
      if (owner >= 0) {
        ctx.fillStyle = PLAYER_COLORS[owner].trail;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i <= GRID; i += 5) {
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, cv.height);
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(cv.width, i * CELL);
    }
    ctx.stroke();

    // Draw players
    for (const p of players) {
      if (!p.alive) continue;
      const cx = p.x * CELL + CELL / 2;
      const cy = p.y * CELL + CELL / 2;
      const color = PLAYER_COLORS[p.id];

      // Glow
      ctx.shadowColor = color.fill;
      ctx.shadowBlur = 12;

      // Body
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, CELL * 1.2);
      grad.addColorStop(0, color.trail);
      grad.addColorStop(0.6, color.fill);
      grad.addColorStop(1, color.fill);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, CELL * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Direction indicator
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx + p.dir.x * CELL * 0.4, cy + p.dir.y * CELL * 0.4, CELL * 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Name for player
      if (p.id === 0) {
        ctx.fillStyle = "#67e8f9";
        ctx.font = "bold 10px ui-sans-serif, system-ui";
        ctx.textAlign = "center";
        ctx.fillText("你", cx, cy - CELL * 1.5);
      }
    }

    // Particles
    for (const part of particles) {
      const alpha = part.life / part.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = part.color;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Score percentage overlay
    const pct = Math.round((scoreRef.current / (GRID * GRID)) * 100);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(5, 5, 90, 24);
    ctx.fillStyle = "#67e8f9";
    ctx.font = "bold 13px ui-sans-serif, system-ui";
    ctx.textAlign = "left";
    ctx.fillText(`领地: ${pct}%`, 12, 22);
  }, []);

  // Main loop
  useEffect(() => {
    stepRef.current = stepPhysics;
    drawRef.current = draw;
    gameOverRef.current = doGameOver;
    let raf: number;
    let last = performance.now();
    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((time - last) / 16.67, 2);
      last = time;
      if (runningRef.current && !overRef.current && !pausedRef.current) {
        stepRef.current(dt);
      }
      drawRef.current();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stepPhysics, draw, doGameOver]);

  // Load best score
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

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!runningRef.current || overRef.current) return;
      let dir: { x: number; y: number } | null = null;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dir = { x: 0, y: -1 };
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dir = { x: 0, y: 1 };
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dir = { x: -1, y: 0 };
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dir = { x: 1, y: 0 };
          break;
      }
      if (dir) {
        e.preventDefault();
        dirQueueRef.current.push(dir);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    initGame();
    runningRef.current = true;
    pausedRef.current = false;
    setRunning(true);
    setPaused(false);
    setScore(scoreRef.current);
    setAliveCount(AI_COUNT + 1);
  }, [initGame]);

  const pause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  const restart = useCallback(() => {
    submittedRef.current = false;
    overRef.current = false;
    setOver(false);
    setResult(null);
    setRunning(false);
    setPaused(false);
    runningRef.current = false;
    pausedRef.current = false;
    initGame();
    setScore(scoreRef.current);
  }, [initGame]);

  // Swipe controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches[0]) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    let dir: { x: number; y: number };
    if (Math.abs(dx) > Math.abs(dy)) {
      dir = { x: dx > 0 ? 1 : -1, y: 0 };
    } else {
      dir = { x: 0, y: dy > 0 ? 1 : -1 };
    }
    dirQueueRef.current.push(dir);
    touchStartRef.current = null;
  }, []);

  const pct = Math.round((score / (GRID * GRID)) * 100);
  const stats: GameStat[] = [
    { label: "领地", value: `${pct}%` },
    { label: "最高记录", value: `${Math.round((best / (GRID * GRID)) * 100)}%` },
    { label: "存活", value: aliveCount },
    { label: "状态", value: over ? "已结束" : paused ? "暂停" : running ? "进行中" : "待开始" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="领地战争"
      description="Paper.io 风格的领地争夺战！控制你的方块在网格上移动，离开领地留下轨迹，回到自己领地时围出的区域全部归你。小心别让对手截断你的轨迹！"
      instructions={`使用方向键或 WASD 控制移动方向（手机端滑动屏幕）。
离开自己的领地时会留下彩色轨迹。
当轨迹回到自己的领地时，围出的区域全部变成你的领地。
如果其他玩家/AI 截断了你的轨迹（碰到你的轨迹），你就会死亡。
同样，你可以截断对手的轨迹来消灭他们。
撞到地图边缘也会死亡。
分数 = 你占领的领地占总地图的百分比。`}
      icon={MapIcon}
      iconEmoji="🗺️"
      iconGradient="from-cyan-400 to-blue-500"
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
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full max-w-[500px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-cyan-500/10"
          />

          {/* Start overlay */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors shadow-lg shadow-cyan-500/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                方向键/WASD 移动 · 手机滑动
                <br />
                围出区域占领领地，别被截断
              </p>
            </div>
          )}

          {/* Pause overlay */}
          {paused && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <h3 className="text-xl font-bold mb-4">已暂停</h3>
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            </div>
          )}

          {/* Game over overlay */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🗺️</div>
              <h3 className="text-2xl font-bold mb-2">领地失守</h3>
              <p className="text-sm text-slate-400 mb-1">最终占领</p>
              <p className="text-4xl font-bold text-cyan-400 mb-1">{pct}%</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${Math.round((best / (GRID * GRID)) * 100)}%`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-cyan-400 font-bold">{result.rank}</span>/{result.total}，超越了{" "}
                  <span className="text-cyan-400 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors shadow-lg shadow-cyan-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center gap-3">
          {running && !over ? (
            <button
              onClick={pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? "继续" : "暂停"}
            </button>
          ) : (
            !over && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors shadow-lg shadow-cyan-500/30"
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

        {/* Mobile direction pad */}
        {running && !over && !paused && (
          <div className="mt-5 sm:hidden grid grid-cols-3 gap-2 w-36">
            <div />
            <button
              onClick={() => dirQueueRef.current.push({ x: 0, y: -1 })}
              className="h-12 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg flex items-center justify-center text-slate-300 border border-[#3f3f46] text-xl"
            >
              ↑
            </button>
            <div />
            <button
              onClick={() => dirQueueRef.current.push({ x: -1, y: 0 })}
              className="h-12 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg flex items-center justify-center text-slate-300 border border-[#3f3f46] text-xl"
            >
              ←
            </button>
            <button
              onClick={() => dirQueueRef.current.push({ x: 0, y: 1 })}
              className="h-12 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg flex items-center justify-center text-slate-300 border border-[#3f3f46] text-xl"
            >
              ↓
            </button>
            <button
              onClick={() => dirQueueRef.current.push({ x: 1, y: 0 })}
              className="h-12 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg flex items-center justify-center text-slate-300 border border-[#3f3f46] text-xl"
            >
              →
            </button>
          </div>
        )}

        {/* Players legend */}
        <div className="mt-5 w-full max-w-[500px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 mb-2 text-center">玩家</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PLAYER_COLORS.map((c, i) => {
              const p = playersRef.current[i];
              const isAlive = p ? p.alive : true;
              return (
                <div key={i} className={`flex items-center gap-1 ${isAlive ? "" : "opacity-30"}`}>
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: c.fill }} />
                  <span className="text-[11px] text-slate-400">{c.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
