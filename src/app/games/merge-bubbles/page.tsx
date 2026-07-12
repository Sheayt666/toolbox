"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "merge-bubbles";
const CANVAS_W = 500;
const CANVAS_H = 600;
const BEST_SCORE_KEY = "gm_merge_bubbles_best";

const BUBBLE_R = 18;
const ROW_H = BUBBLE_R * 1.732; // hex grid row height (sqrt(3) * r)
const DANGER_Y = CANVAS_H - 100;
const SHOOTER_Y = CANVAS_H - 40;
const MAX_TIER = 9; // 0-9 = 10 tiers
const SHOOT_SPEED = 8;
const MAX_BOUNCES = 50;

interface BubbleDef {
  color: string;
  glow: string;
  name: string;
}

const BUBBLES: BubbleDef[] = [
  { color: "#a855f7", glow: "#c084fc", name: "紫晶" },
  { color: "#3b82f6", glow: "#60a5fa", name: "蓝宝" },
  { color: "#06b6d4", glow: "#22d3ee", name: "青玉" },
  { color: "#22c55e", glow: "#4ade80", name: "翡翠" },
  { color: "#eab308", glow: "#facc15", name: "金珀" },
  { color: "#f97316", glow: "#fb923c", name: "琥珀" },
  { color: "#ef4444", glow: "#f87171", name: "红玛" },
  { color: "#ec4899", glow: "#f472b6", name: "玫瑰" },
  { color: "#8b5cf6", glow: "#a78bfa", name: "紫晶" },
  { color: "#fbbf24", glow: "#fcd34d", name: "帝王" },
];

interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tier: number;
  settled: boolean;
  row: number;
  col: number;
  merged: boolean;
  born: number;
  popping: boolean;
  popTime: number;
}

interface FloatingBubble {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tier: number;
  life: number;
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

interface Popup {
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

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function lighten(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r + (255 - r) * amt)},${Math.round(g + (255 - g) * amt)},${Math.round(b + (255 - b) * amt)})`;
}

function darken(hex: string, amt: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.round(r * (1 - amt))},${Math.round(g * (1 - amt))},${Math.round(b * (1 - amt))})`;
}

let nextBubbleId = 1;

export default function MergeBubblesPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Map<string, Bubble>>(new Map()); // "row,col" -> Bubble
  const flyingRef = useRef<Bubble[]>([]); // currently flying bubbles
  const floatingRef = useRef<FloatingBubble[]>([]); // floating score bubbles
  const particlesRef = useRef<Particle[]>([]);
  const popupsRef = useRef<Popup[]>([]);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const pausedRef = useRef(false);
  const scoreRef = useRef(0);
  const lastScoreSyncedRef = useRef(0);
  const bestRef = useRef(0);
  const submittedRef = useRef(false);
  const animFrameRef = useRef(0);
  const aimAngleRef = useRef(-Math.PI / 2);
  const currentTierRef = useRef(0);
  const nextTierRef = useRef(1);
  const cooldownRef = useRef(0);
  const overflowTimerRef = useRef(0);
  const mergeChainTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
  const [currentTier, setCurrentTier] = useState(0);
  const [nextTier, setNextTier] = useState(1);
  const [maxTier, setMaxTier] = useState(0);
  const [mounted, setMounted] = useState(false);

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number) => {
      const particles = particlesRef.current;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 15 + Math.random() * 20,
          maxLife: 35,
          color,
          size: 1.5 + Math.random() * 3,
        });
      }
    },
    [],
  );

  const gridKey = (row: number, col: number) => `${row},${col}`;

  const getBubblePos = (row: number, col: number) => {
    const offset = row % 2 === 0 ? 0 : BUBBLE_R;
    return {
      x: BUBBLE_R + col * BUBBLE_R * 2 + offset,
      y: BUBBLE_R + row * ROW_H,
    };
  };

  const getGridFromPos = (x: number, y: number) => {
    const row = Math.round((y - BUBBLE_R) / ROW_H);
    const offset = row % 2 === 0 ? 0 : BUBBLE_R;
    const col = Math.round((x - BUBBLE_R - offset) / (BUBBLE_R * 2));
    return { row, col };
  };

  const initGame = useCallback(() => {
    mergeChainTimersRef.current.forEach((id) => clearTimeout(id));
    mergeChainTimersRef.current = [];
    gridRef.current.clear();
    flyingRef.current = [];
    floatingRef.current = [];
    particlesRef.current = [];
    popupsRef.current = [];
    scoreRef.current = 0;
    lastScoreSyncedRef.current = 0;
    overflowTimerRef.current = 0;
    nextBubbleId = 1;
    aimAngleRef.current = -Math.PI / 2;

    // Generate initial rows of bubbles (rows 0-4)
    const startRows = 5;
    for (let row = 0; row < startRows; row++) {
      const cols = row % 2 === 0 ? 13 : 12;
      for (let col = 0; col < cols; col++) {
        const tier = Math.floor(Math.random() * 4); // start with low tiers
        const pos = getBubblePos(row, col);
        const bubble: Bubble = {
          id: nextBubbleId++,
          x: pos.x,
          y: pos.y,
          vx: 0,
          vy: 0,
          tier,
          settled: true,
          row,
          col,
          merged: false,
          born: 0,
          popping: false,
          popTime: 0,
        };
        gridRef.current.set(gridKey(row, col), bubble);
      }
    }

    const c = Math.floor(Math.random() * 4);
    const n = Math.floor(Math.random() * 4);
    currentTierRef.current = c;
    nextTierRef.current = n;
    setCurrentTier(c);
    setNextTier(n);
    setMaxTier(0);
    setScore(0);
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

  const findNeighbors = useCallback((bubble: Bubble): Bubble[] => {
    const neighbors: Bubble[] = [];
    const { row, col } = bubble;
    const offsets =
      row % 2 === 0
        ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
        : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
    for (const [dr, dc] of offsets) {
      const nr = row + dr;
      const nc = col + dc;
      const key = gridKey(nr, nc);
      const nb = gridRef.current.get(key);
      if (nb && !nb.merged && !nb.popping) {
        neighbors.push(nb);
      }
    }
    return neighbors;
  }, []);

  const mergeChain = useCallback(
    (bubble: Bubble) => {
      // Find connected same-tier bubbles
      const visited = new Set<number>();
      const chain: Bubble[] = [];
      const queue: Bubble[] = [bubble];

      while (queue.length > 0) {
        const b = queue.shift()!;
        if (visited.has(b.id)) continue;
        visited.add(b.id);
        chain.push(b);

        const neighbors = findNeighbors(b);
        for (const nb of neighbors) {
          if (nb.tier === b.tier && !visited.has(nb.id)) {
            queue.push(nb);
          }
        }
      }

      // If 2+ same tier connected, merge them
      if (chain.length >= 2 && bubble.tier < MAX_TIER) {
        const newTier = bubble.tier + 1;
        // Keep the first bubble, merge others into it
        const keeper = chain[0];
        keeper.tier = newTier;
        keeper.born = performance.now();

        // Spawn merge particles
        spawnParticles(keeper.x, keeper.y, BUBBLES[newTier].glow, 12);

        // Score
        const gained = (newTier + 1) * (newTier + 1) * chain.length;
        scoreRef.current += gained;
        popupsRef.current.push({
          x: keeper.x,
          y: keeper.y,
          value: gained,
          time: performance.now(),
        });

        // Remove other bubbles in chain
        for (let i = 1; i < chain.length; i++) {
          const b = chain[i];
          b.merged = true;
          gridRef.current.delete(gridKey(b.row, b.col));
        }

        // Recursively check for new merges
        const mergeTid = setTimeout(() => mergeChain(keeper), 50);
        mergeChainTimersRef.current.push(mergeTid);
      }
    },
    [findNeighbors, spawnParticles],
  );

  const settleBubble = useCallback(
    (bubble: Bubble) => {
      // Find nearest grid position
      const { row, col } = getGridFromPos(bubble.x, bubble.y);
      let bestRow = row;
      let bestCol = col;
      let bestDist = Infinity;

      // Search nearby grid positions
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r < 0) continue;
          const key = gridKey(r, c);
          if (gridRef.current.has(key)) continue;
          const pos = getBubblePos(r, c);
          const d = (pos.x - bubble.x) ** 2 + (pos.y - bubble.y) ** 2;
          if (d < bestDist) {
            bestDist = d;
            bestRow = r;
            bestCol = c;
          }
        }
      }

      bubble.settled = true;
      bubble.row = bestRow;
      bubble.col = bestCol;
      const pos = getBubblePos(bestRow, bestCol);
      bubble.x = pos.x;
      bubble.y = pos.y;
      bubble.vx = 0;
      bubble.vy = 0;
      gridRef.current.set(gridKey(bestRow, bestCol), bubble);

      // Check for merges
      mergeChain(bubble);
    },
    [mergeChain],
  );

  const shoot = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    const now = performance.now();
    if (now < cooldownRef.current) return;

    const angle = aimAngleRef.current;
    flyingRef.current.push({
      id: nextBubbleId++,
      x: CANVAS_W / 2,
      y: SHOOTER_Y,
      vx: Math.cos(angle) * SHOOT_SPEED,
      vy: Math.sin(angle) * SHOOT_SPEED,
      tier: currentTierRef.current,
      settled: false,
      row: 0,
      col: 0,
      merged: false,
      born: now,
      popping: false,
      popTime: 0,
    });

    // Advance: current <- next <- new random
    currentTierRef.current = nextTierRef.current;
    setCurrentTier(nextTierRef.current);
    const nn = Math.floor(Math.random() * 4);
    nextTierRef.current = nn;
    setNextTier(nn);
    cooldownRef.current = now + 300;
  }, []);

  const stepPhysics = useCallback(
    (dt: number) => {
      const flying = flyingRef.current;
      const grid = gridRef.current;
      const particles = particlesRef.current;
      const popups = popupsRef.current;

      // Move flying bubbles
      for (let i = flying.length - 1; i >= 0; i--) {
        const b = flying[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Wall bounce
        if (b.x - BUBBLE_R < 0) {
          b.x = BUBBLE_R;
          b.vx = Math.abs(b.vx);
        }
        if (b.x + BUBBLE_R > CANVAS_W) {
          b.x = CANVAS_W - BUBBLE_R;
          b.vx = -Math.abs(b.vx);
        }

        // Top wall
        if (b.y - BUBBLE_R < 0) {
          b.y = BUBBLE_R;
          settleBubble(b);
          flying.splice(i, 1);
          continue;
        }

        // Check collision with settled bubbles
        let hit = false;
        for (const [, sb] of grid) {
          if (sb.merged || sb.popping) continue;
          const dx = b.x - sb.x;
          const dy = b.y - sb.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BUBBLE_R * 2 - 2) {
            hit = true;
            break;
          }
        }
        if (hit) {
          settleBubble(b);
          flying.splice(i, 1);
          continue;
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Popups
      for (let i = popups.length - 1; i >= 0; i--) {
        const pop = popups[i];
        const age = performance.now() - pop.time;
        if (age > 700) popups.splice(i, 1);
      }

      // Check overflow (bubbles below danger line)
      let overflow = false;
      for (const [, b] of grid) {
        if (b.merged) continue;
        if (b.y + BUBBLE_R > DANGER_Y) {
          overflow = true;
          break;
        }
      }
      if (overflow) {
        overflowTimerRef.current += dt;
        if (overflowTimerRef.current > 30) {
          gameOverRef.current();
        }
      } else {
        overflowTimerRef.current = 0;
      }

      // Track max tier
      let mt = 0;
      for (const [, b] of grid) {
        if (b.tier > mt) mt = b.tier;
      }
      for (const b of flying) {
        if (b.tier > mt) mt = b.tier;
      }
      if (mt > maxTier) {
        setMaxTier(mt);
      }

      // Sync score
      if (scoreRef.current !== lastScoreSyncedRef.current) {
        lastScoreSyncedRef.current = scoreRef.current;
        setScore(scoreRef.current);
      }
    },
    [settleBubble],
  );

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    animFrameRef.current++;
    const t = animFrameRef.current;

    const grid = gridRef.current;
    const flying = flyingRef.current;
    const particles = particlesRef.current;
    const popups = popupsRef.current;

    // Background
    ctx.fillStyle = "#0c0a14";
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, cv.height);
    bgGrad.addColorStop(0, "rgba(139,92,246,0.08)");
    bgGrad.addColorStop(0.5, "rgba(88,28,135,0.03)");
    bgGrad.addColorStop(1, "rgba(76,29,149,0.08)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cv.width, cv.height);

    // Grid dots
    ctx.fillStyle = "rgba(139,92,246,0.06)";
    for (let i = 0; i <= cv.width; i += 25) {
      for (let j = 0; j <= cv.height; j += 25) {
        ctx.fillRect(i - 0.5, j - 0.5, 1, 1);
      }
    }

    // Danger line
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

    // Ceiling line
    ctx.strokeStyle = "rgba(139,92,246,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, BUBBLE_R * 2);
    ctx.lineTo(cv.width, BUBBLE_R * 2);
    ctx.stroke();

    // Settled bubbles
    for (const [, b] of grid) {
      if (b.merged) continue;
      drawBubble(ctx, b.x, b.y, b.tier, 1, t);
    }

    // Flying bubbles
    for (const b of flying) {
      drawBubble(ctx, b.x, b.y, b.tier, 1, t);
    }

    // Particles
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Popups
    for (const pop of popups) {
      const age = performance.now() - pop.time;
      const p = age / 700;
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = "#c4b5fd";
      ctx.font = "bold 18px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`+${pop.value}`, pop.x, pop.y - p * 25);
      ctx.restore();
    }

    // Aim guide
    if (runningRef.current && !overRef.current) {
      const angle = aimAngleRef.current;
      const sx = CANVAS_W / 2;
      const sy = SHOOTER_Y;
      ctx.strokeStyle = "rgba(196,181,253,0.3)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      // Simulate trajectory with bounces
      let tx = sx;
      let ty = sy;
      let tvx = Math.cos(angle);
      let tvy = Math.sin(angle);
      for (let step = 0; step < 100; step++) {
        tx += tvx * 8;
        ty += tvy * 8;
        if (tx < BUBBLE_R) {
          tx = BUBBLE_R;
          tvx = Math.abs(tvx);
        }
        if (tx > CANVAS_W - BUBBLE_R) {
          tx = CANVAS_W - BUBBLE_R;
          tvx = -Math.abs(tvx);
        }
        if (ty < BUBBLE_R * 2) break;
        // Check collision with grid
        let hit = false;
        for (const [, sb] of grid) {
          if (sb.merged) continue;
          const dx = tx - sb.x;
          const dy = ty - sb.y;
          if (dx * dx + dy * dy < (BUBBLE_R * 2) ** 2) {
            hit = true;
            break;
          }
        }
        if (hit) break;
      }
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shooter bubble
      drawBubble(ctx, sx, sy, currentTierRef.current, 0.92, t);

      // Shooter base
      ctx.fillStyle = "rgba(139,92,246,0.15)";
      ctx.beginPath();
      ctx.arc(sx, sy, BUBBLE_R + 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(196,181,253,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(sx, sy, BUBBLE_R + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, []);

  function drawBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tier: number,
    alpha: number,
    t: number,
  ) {
    const def = BUBBLES[tier];
    const r = BUBBLE_R;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow
    ctx.shadowColor = def.glow;
    ctx.shadowBlur = 12;

    // Radial gradient
    const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    grad.addColorStop(0, lighten(def.color, 0.45));
    grad.addColorStop(0.6, def.color);
    grad.addColorStop(1, darken(def.color, 0.3));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Highlight
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Tier number
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = `bold ${Math.round(r * 0.7)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(tier + 1), x, y + 1);

    ctx.restore();
  }

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
    return () => {
      cancelAnimationFrame(raf);
      mergeChainTimersRef.current.forEach((id) => clearTimeout(id));
      mergeChainTimersRef.current = [];
    };
  }, [stepPhysics, draw, doGameOver]);

  // Load best score
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

  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    initGame();
    runningRef.current = true;
    pausedRef.current = false;
    setRunning(true);
    setPaused(false);
    setScore(0);
    setMaxTier(0);
  }, [initGame]);

  const pause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  // 键盘：P 暂停/继续
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "p") {
        if (!runningRef.current || overRef.current) return;
        pause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pause]);

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
    setScore(0);
    setMaxTier(0);
  }, [initGame]);

  // Mouse / touch controls
  const updateAim = useCallback((clientX: number, clientY: number) => {
    const cv = canvasRef.current;
    if (!cv) return;
    const rect = cv.getBoundingClientRect();
    const scaleX = rect.width > 0 ? CANVAS_W / rect.width : 1;
    const scaleY = rect.height > 0 ? CANVAS_H / rect.height : 1;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    const dx = x - CANVAS_W / 2;
    const dy = y - SHOOTER_Y;
    let angle = Math.atan2(dy, dx);
    // Clamp angle to upward range
    angle = clamp(angle, -Math.PI + 0.2, -0.2);
    aimAngleRef.current = angle;
  }, []);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "最高记录", value: best },
    { label: "下一个", value: `${nextTier + 1}级` },
    { label: "最高合成", value: `${maxTier + 1}级` },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="合成泡泡"
        description="融合射击与合成的泡泡游戏！从底部发射泡泡，相同等级的泡泡碰撞后会合成更高一级的泡泡。10 个等级等你挑战，泡泡堆到红线就游戏结束！"
        instructions=""
        icon={Sparkles}
        iconEmoji="🔮"
        iconGradient="from-purple-400 to-indigo-500"
        stats={[]}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-purple-400" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="合成泡泡"
      description="融合射击与合成的泡泡游戏！从底部发射泡泡，相同等级的泡泡碰撞后会合成更高一级的泡泡。10 个等级等你挑战，泡泡堆到红线就游戏结束！"
      instructions={`移动鼠标或手指控制瞄准方向。
点击或松手发射泡泡。
泡泡会粘在顶部或其他泡泡上。
相同等级的泡泡接触后会合成更高一级的泡泡（1级→2级→...→10级）。
合成等级越高，得分越多。
当泡泡堆积超过红色虚线时游戏结束。
利用墙壁反弹可以打到难以到达的位置。`}
      icon={Sparkles}
      iconEmoji="🔮"
      iconGradient="from-purple-400 to-indigo-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* Next bubble preview */}
        <div className="flex items-center justify-between w-full max-w-[500px] mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">下一个</span>
            <div className="w-9 h-9 rounded-lg bg-[#27272a] border border-[#3f3f46] flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${lighten(BUBBLES[nextTier].color, 0.4)}, ${BUBBLES[nextTier].color})`,
                  boxShadow: `0 0 8px ${BUBBLES[nextTier].glow}`,
                }}
              />
            </div>
            <span className="text-xs text-slate-500">{nextTier + 1}级</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">当前</span>
            <div className="w-9 h-9 rounded-lg bg-[#27272a]/60 border border-[#8b5cf6]/30 flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${lighten(BUBBLES[currentTier].color, 0.4)}, ${BUBBLES[currentTier].color})`,
                  boxShadow: `0 0 8px ${BUBBLES[currentTier].glow}`,
                }}
              />
            </div>
            <span className="text-xs text-slate-500">{currentTier + 1}级</span>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={(e) => updateAim(e.clientX, e.clientY)}
            onClick={shoot}
            onTouchStart={(e) => {
              if (e.touches[0]) updateAim(e.touches[0].clientX, e.touches[0].clientY);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) {
                updateAim(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
              }
            }}
            onTouchEnd={(e) => {
              if (e.changedTouches[0]) {
                updateAim(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
              }
              shoot();
            }}
            className="w-full max-w-[500px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-purple-500/10 cursor-pointer"
          />

          {/* Start overlay */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={start}
                aria-label="开始游戏"
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                移动控制瞄准 · 点击发射泡泡
                <br />
                相同等级泡泡碰撞合成更高级
              </p>
            </div>
          )}

          {/* Pause overlay */}
          {paused && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/70 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <h3 className="text-xl font-bold mb-4">已暂停</h3>
              <button
                onClick={pause}
                aria-label="继续游戏"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" /> 继续
              </button>
            </div>
          )}

          {/* Game over overlay */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🔮</div>
              <h3 className="text-2xl font-bold mb-2">游戏结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-purple-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-1">最高合成: {maxTier + 1} 级</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-purple-400 font-bold">{result.rank}</span>/{result.total}，超越了{" "}
                  <span className="text-purple-400 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                aria-label="再来一局"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
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
              aria-label={paused ? "继续游戏" : "暂停游戏"}
              className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? "继续" : "暂停"}
            </button>
          ) : (
            !over && (
              <button
                onClick={start}
                aria-label="开始游戏"
                className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
              >
                <Play className="w-4 h-4" /> 开始
              </button>
            )
          )}
          <button
            onClick={restart}
            aria-label="重新开始"
            className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>

        {/* Bubble tier legend */}
        <div className="mt-5 w-full max-w-[500px] bg-[#18181b] border border-[#27272a] rounded-xl p-3">
          <p className="text-[11px] text-slate-500 mb-2 text-center">泡泡等级（相同等级碰撞合成下一级）</p>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {BUBBLES.map((b, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white/80 ${i <= maxTier ? "" : "opacity-30"}`}
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${lighten(b.color, 0.4)}, ${b.color})`,
                    boxShadow: i <= maxTier ? `0 0 6px ${b.glow}` : "none",
                  }}
                >
                  {i + 1}
                </div>
                {i < BUBBLES.length - 1 && (
                  <span className="text-slate-600 text-[10px] mx-0.5">›</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameShell>
  );
}
