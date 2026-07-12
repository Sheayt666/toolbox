"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "hex-blocks";
const RADIUS = 4; // 边长5的六边形 → 61格
const HEX_SIZE = 28;
const BEST_SCORE_KEY = "toolbox-best-hex-blocks";
const SQRT3 = Math.sqrt(3);

/* ============ 类型 ============ */
type HexCoord = [number, number];
interface ShapeTemplate { cells: HexCoord[]; }
interface TrayShape { template: ShapeTemplate; colorIdx: number; }
interface ClearAnim { id: number; cells: HexCoord[]; color: string; }

/* ============ 六边形数学 ============ */
function hexToPixel(q: number, r: number): [number, number] {
  const x = HEX_SIZE * (SQRT3 * q + SQRT3 / 2 * r);
  const y = HEX_SIZE * (3 / 2 * r);
  return [x, y];
}

function pixelToHex(x: number, y: number): HexCoord {
  const q = (SQRT3 / 3 * x - 1 / 3 * y) / HEX_SIZE;
  const r = (2 / 3 * y) / HEX_SIZE;
  return hexRound(q, r);
}

function hexRound(q: number, r: number): HexCoord {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  return [rq, rr];
}

function hexPoints(cx: number, cy: number, size: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${(cx + size * Math.cos(angle)).toFixed(1)},${(cy + size * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(" ");
}

function isValidCell(q: number, r: number): boolean {
  return Math.abs(q) <= RADIUS && Math.abs(r) <= RADIUS && Math.abs(q + r) <= RADIUS;
}

function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

function getAllCells(): HexCoord[] {
  const cells: HexCoord[] = [];
  for (let q = -RADIUS; q <= RADIUS; q++) {
    for (let r = -RADIUS; r <= RADIUS; r++) {
      if (isValidCell(q, r)) cells.push([q, r]);
    }
  }
  return cells;
}

const ALL_CELLS = getAllCells();

/* ============ 形状模板 ============ */
const SHAPE_TEMPLATES: ShapeTemplate[] = [
  { cells: [[0, 0]] },
  { cells: [[0, 0], [1, 0]] },
  { cells: [[0, 0], [0, 1]] },
  { cells: [[0, 0], [1, -1]] },
  { cells: [[0, 0], [1, 0], [2, 0]] },
  { cells: [[0, 0], [0, 1], [0, 2]] },
  { cells: [[0, 0], [1, 0], [0, 1]] },
  { cells: [[0, 0], [1, 0], [1, -1]] },
  { cells: [[0, 0], [0, 1], [-1, 1]] },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { cells: [[0, 0], [1, 0], [2, 0], [0, 1]] },
  { cells: [[0, 0], [1, 0], [2, 0], [2, -1]] },
  { cells: [[0, 0], [1, 0], [0, 1], [-1, 1]] },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]] },
  { cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1]] },
];

const SHAPE_COLORS = [
  { fill: "#8b5cf6", stroke: "#a78bfa", light: "#c4b5fd" },
  { fill: "#3b82f6", stroke: "#60a5fa", light: "#93c5fd" },
  { fill: "#22c55e", stroke: "#4ade80", light: "#86efac" },
  { fill: "#f59e0b", stroke: "#fbbf24", light: "#fde68a" },
  { fill: "#ec4899", stroke: "#f472b6", light: "#fbcfe8" },
  { fill: "#6366f1", stroke: "#818cf8", light: "#c7d2fe" },
  { fill: "#14b8a6", stroke: "#2dd4bf", light: "#5eead4" },
];

/* ============ 游戏逻辑 ============ */
function canPlace(grid: Set<string>, cells: HexCoord[], q: number, r: number): boolean {
  for (const [dq, dr] of cells) {
    const nq = q + dq;
    const nr = r + dr;
    if (!isValidCell(nq, nr)) return false;
    if (grid.has(hexKey(nq, nr))) return false;
  }
  return true;
}

interface LineInfo { dir: number; idx: number; cells: HexCoord[]; }

function getCompleteLines(grid: Set<string>): LineInfo[] {
  const lines: LineInfo[] = [];
  // 方向0: q恒定
  for (let q = -RADIUS; q <= RADIUS; q++) {
    const cells: HexCoord[] = [];
    for (let r = -RADIUS; r <= RADIUS; r++) {
      if (isValidCell(q, r)) cells.push([q, r]);
    }
    if (cells.length >= 3 && cells.every(([cq, cr]) => grid.has(hexKey(cq, cr)))) {
      lines.push({ dir: 0, idx: q, cells });
    }
  }
  // 方向1: r恒定
  for (let r = -RADIUS; r <= RADIUS; r++) {
    const cells: HexCoord[] = [];
    for (let q = -RADIUS; q <= RADIUS; q++) {
      if (isValidCell(q, r)) cells.push([q, r]);
    }
    if (cells.length >= 3 && cells.every(([cq, cr]) => grid.has(hexKey(cq, cr)))) {
      lines.push({ dir: 1, idx: r, cells });
    }
  }
  // 方向2: s=-q-r恒定
  for (let s = -RADIUS; s <= RADIUS; s++) {
    const cells: HexCoord[] = [];
    for (let q = -RADIUS; q <= RADIUS; q++) {
      const r = -q - s;
      if (isValidCell(q, r)) cells.push([q, r]);
    }
    if (cells.length >= 3 && cells.every(([cq, cr]) => grid.has(hexKey(cq, cr)))) {
      lines.push({ dir: 2, idx: s, cells });
    }
  }
  return lines;
}

function canPlaceAnywhere(grid: Set<string>, shapes: (TrayShape | null)[]): boolean {
  for (const shape of shapes) {
    if (!shape) continue;
    for (const [q, r] of ALL_CELLS) {
      if (canPlace(grid, shape.template.cells, q, r)) return true;
    }
  }
  return false;
}

function generateShape(): TrayShape {
  const template = SHAPE_TEMPLATES[Math.floor(Math.random() * SHAPE_TEMPLATES.length)];
  const colorIdx = Math.floor(Math.random() * SHAPE_COLORS.length);
  return { template, colorIdx };
}

function generateTray(): (TrayShape | null)[] {
  return [generateShape(), generateShape(), generateShape()];
}

/* ============ 组件 ============ */
export default function HexBlocksPage() {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<"start" | "playing" | "over">("start");
  const [grid, setGrid] = useState<Set<string>>(new Set());
  const [cellColors, setCellColors] = useState<Map<string, number>>(new Map());
  const [trayShapes, setTrayShapes] = useState<(TrayShape | null)[]>([null, null, null]);
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dragShapeIdx, setDragShapeIdx] = useState<number | null>(null);
  const [dragHex, setDragHex] = useState<HexCoord | null>(null);
  const [dragValid, setDragValid] = useState(false);
  const [clearAnims, setClearAnims] = useState<ClearAnim[]>([]);
  const [scorePopup, setScorePopup] = useState<{ id: number; value: number; x: number; y: number } | null>(null);

  const gridRef = useRef<Set<string>>(new Set());
  const cellColorsRef = useRef<Map<string, number>>(new Map());
  const trayShapesRef = useRef<(TrayShape | null)[]>([null, null, null]);
  const scoreRef = useRef(0);
  const linesClearedRef = useRef(0);
  const comboRef = useRef(0);
  const gameStateRef = useRef<"start" | "playing" | "over">("start");
  const submittedRef = useRef(false);
  const pausedRef = useRef(false);
  const dragShapeIdxRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const popupIdRef = useRef(0);
  const clearAnimIdRef = useRef(0);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { cellColorsRef.current = cellColors; }, [cellColors]);
  useEffect(() => { trayShapesRef.current = trayShapes; }, [trayShapes]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { dragShapeIdxRef.current = dragShapeIdx; }, [dragShapeIdx]);

  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

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
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const startGame = useCallback(() => {
    const newGrid = new Set<string>();
    const newColors = new Map<string, number>();
    const newTray = generateTray();
    gridRef.current = newGrid;
    cellColorsRef.current = newColors;
    trayShapesRef.current = newTray;
    scoreRef.current = 0;
    linesClearedRef.current = 0;
    comboRef.current = 0;
    submittedRef.current = false;
    setGrid(new Set());
    setCellColors(new Map());
    setTrayShapes(newTray);
    setScore(0);
    setLinesCleared(0);
    setCombo(0);
    setPaused(false);
    setClearAnims([]);
    setScorePopup(null);
    setGameState("playing");
    gameStateRef.current = "playing";
  }, []);

  const endGame = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setGameState("over");
    gameStateRef.current = "over";
    setRefreshKey(k => k + 1);
    submitScore(GAME_ID, scoreRef.current);
    if (scoreRef.current > bestScore) {
      setBestScore(scoreRef.current);
      try { localStorage.setItem(BEST_SCORE_KEY, String(scoreRef.current)); } catch { /* ignore */ }
    }
  }, [bestScore]);

  const placeShape = useCallback((shapeIdx: number, q: number, r: number) => {
    const shapes = trayShapesRef.current;
    const shape = shapes[shapeIdx];
    if (!shape) return;
    if (!canPlace(gridRef.current, shape.template.cells, q, r)) return;

    const newGrid = new Set(gridRef.current);
    const newColors = new Map(cellColorsRef.current);
    for (const [dq, dr] of shape.template.cells) {
      const nq = q + dq;
      const nr = r + dr;
      newGrid.add(hexKey(nq, nr));
      newColors.set(hexKey(nq, nr), shape.colorIdx);
    }

    let gained = shape.template.cells.length;
    const lines = getCompleteLines(newGrid);

    if (lines.length > 0) {
      comboRef.current += 1;
      const comboMult = comboRef.current;
      let totalCleared = 0;
      const clearedCells: HexCoord[] = [];
      const clearedKeys = new Set<string>();

      for (const line of lines) {
        for (const cell of line.cells) {
          const k = hexKey(cell[0], cell[1]);
          if (!clearedKeys.has(k)) {
            clearedKeys.add(k);
            clearedCells.push(cell);
            newGrid.delete(k);
            newColors.delete(k);
            totalCleared++;
          }
        }
      }

      gained += totalCleared * 10 * lines.length * comboMult;
      linesClearedRef.current += lines.length;

      const animId = clearAnimIdRef.current++;
      const color = SHAPE_COLORS[shape.colorIdx].light;
      setClearAnims(prev => [...prev, { id: animId, cells: clearedCells, color }]);
      const t = setTimeout(() => {
        setClearAnims(prev => prev.filter(a => a.id !== animId));
      }, 500);
      timersRef.current.push(t);

      const [pcx, pcy] = hexToPixel(q, r);
      const popupId = popupIdRef.current++;
      setScorePopup({ id: popupId, value: gained, x: pcx, y: pcy });
      const t2 = setTimeout(() => setScorePopup(null), 800);
      timersRef.current.push(t2);
    } else {
      comboRef.current = 0;
    }

    const newShapes = [...shapes];
    newShapes[shapeIdx] = generateShape();

    gridRef.current = newGrid;
    cellColorsRef.current = newColors;
    trayShapesRef.current = newShapes;
    scoreRef.current += gained;

    setGrid(new Set(newGrid));
    setCellColors(new Map(newColors));
    setTrayShapes(newShapes);
    setScore(scoreRef.current);
    setLinesCleared(linesClearedRef.current);
    setCombo(comboRef.current);

    if (!canPlaceAnywhere(newGrid, newShapes)) {
      const t = setTimeout(() => endGame(), 400);
      timersRef.current.push(t);
    }
  }, [endGame]);

  const startDrag = useCallback((e: React.PointerEvent, idx: number) => {
    if (gameStateRef.current !== "playing" || pausedRef.current) return;
    if (dragShapeIdxRef.current !== null) return;
    if (!trayShapesRef.current[idx]) return;
    e.preventDefault();
    setDragShapeIdx(idx);
  }, []);

  useEffect(() => {
    if (dragShapeIdx === null) return;

    const handleMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      const [hq, hr] = pixelToHex(transformed.x, transformed.y);
      if (isValidCell(hq, hr)) {
        const shape = trayShapesRef.current[dragShapeIdx];
        if (shape) {
          setDragHex([hq, hr]);
          setDragValid(canPlace(gridRef.current, shape.template.cells, hq, hr));
        }
      } else {
        setDragHex(null);
        setDragValid(false);
      }
    };

    const handleUp = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (svg) {
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const transformed = pt.matrixTransform(ctm.inverse());
          const [hq, hr] = pixelToHex(transformed.x, transformed.y);
          if (isValidCell(hq, hr)) {
            const shape = trayShapesRef.current[dragShapeIdx];
            if (shape && canPlace(gridRef.current, shape.template.cells, hq, hr)) {
              placeShape(dragShapeIdx, hq, hr);
            }
          }
        }
      }
      setDragShapeIdx(null);
      setDragHex(null);
      setDragValid(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragShapeIdx, placeShape]);

  const stats: GameStat[] = [
    { label: "分数", value: score, icon: "⭐" },
    { label: "消除行", value: linesCleared, icon: "📉" },
    { label: "连击", value: combo > 0 ? `x${combo}` : "0", icon: "🔥" },
    { label: "最高分", value: bestScore, icon: "🏆" },
  ];

  const renderShapePreview = (shape: TrayShape, size: number) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [q, r] of shape.template.cells) {
      const x = size * (SQRT3 * q + SQRT3 / 2 * r);
      const y = size * (3 / 2 * r);
      minX = Math.min(minX, x - size);
      minY = Math.min(minY, y - size);
      maxX = Math.max(maxX, x + size);
      maxY = Math.max(maxY, y + size);
    }
    const pad = size * 0.3;
    const vb = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
    return (
      <svg viewBox={vb} className="w-full h-full">
        {shape.template.cells.map(([q, r], i) => {
          const x = size * (SQRT3 * q + SQRT3 / 2 * r);
          const y = size * (3 / 2 * r);
          return (
            <polygon key={i} points={hexPoints(x, y, size - 1)}
              fill={SHAPE_COLORS[shape.colorIdx].fill}
              stroke={SHAPE_COLORS[shape.colorIdx].stroke}
              strokeWidth="1" />
          );
        })}
      </svg>
    );
  };

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <GameShell gameId={GAME_ID} title="六边方块" iconEmoji="⬡" iconGradient="from-teal-500 to-cyan-500"
      stats={stats} shareScore={score} refreshKey={refreshKey}>
      <div className="relative">
        {gameState === "start" && (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="text-6xl">⬡</div>
            <h2 className="text-3xl font-bold text-white">六边方块</h2>
            <p className="max-w-md text-center text-gray-400">
              将方块拖入六边形网格，填满整行即可消除！连续消除获得连击加成。三个方向均可消除。
            </p>
            <button onClick={startGame} aria-label="开始游戏"
              className="flex h-12 items-center gap-2 rounded-xl bg-teal-600 px-8 text-lg font-bold text-white transition hover:bg-teal-500 active:scale-95">
              <Play size={20} /> 开始游戏
            </button>
          </div>
        )}

        {gameState === "playing" && (
          <div className="p-4">
            {combo > 0 && (
              <div className="mb-2 text-center">
                <span className="inline-block rounded-full bg-orange-500/20 px-4 py-1 text-sm font-bold text-orange-400">
                  连击 x{combo}!
                </span>
              </div>
            )}

            <div className="relative mx-auto" style={{ maxWidth: "500px" }}>
              <svg ref={svgRef} viewBox="-240 -220 480 440" className="w-full touch-none"
                style={{ userSelect: "none" }} role="img" aria-label="六边形游戏网格">
                <defs>
                  <radialGradient id="hexBg" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="rgba(30,30,45,0.6)" />
                    <stop offset="100%" stopColor="rgba(9,9,11,0.2)" />
                  </radialGradient>
                </defs>
                <rect x="-240" y="-220" width="480" height="440" fill="url(#hexBg)" />

                {ALL_CELLS.map(([q, r]) => {
                  const [cx, cy] = hexToPixel(q, r);
                  const k = hexKey(q, r);
                  const filled = grid.has(k);
                  const colorIdx = cellColors.get(k) ?? 0;
                  return (
                    <polygon key={`cell-${k}`} points={hexPoints(cx, cy, HEX_SIZE - 1.5)}
                      fill={filled ? SHAPE_COLORS[colorIdx].fill : "rgba(39,39,42,0.35)"}
                      stroke={filled ? SHAPE_COLORS[colorIdx].stroke : "rgba(63,63,70,0.5)"}
                      strokeWidth="1.5" />
                  );
                })}

                {dragShapeIdx !== null && dragHex && trayShapes[dragShapeIdx] &&
                  trayShapes[dragShapeIdx]!.template.cells.map(([dq, dr], i) => {
                    const nq = dragHex[0] + dq;
                    const nr = dragHex[1] + dr;
                    if (!isValidCell(nq, nr)) return null;
                    const [cx, cy] = hexToPixel(nq, nr);
                    return (
                      <polygon key={`preview-${i}`} points={hexPoints(cx, cy, HEX_SIZE - 1.5)}
                        fill={dragValid ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}
                        stroke={dragValid ? "#22c55e" : "#ef4444"}
                        strokeWidth="2" strokeDasharray="3 2" />
                    );
                  })
                }

                {clearAnims.map(anim =>
                  anim.cells.map(([q, r], i) => {
                    const [cx, cy] = hexToPixel(q, r);
                    return (
                      <polygon key={`anim-${anim.id}-${i}`} points={hexPoints(cx, cy, HEX_SIZE - 1.5)}
                        fill={anim.color} className="hex-clear-anim" />
                    );
                  })
                )}

                {scorePopup && (
                  <text x={scorePopup.x} y={scorePopup.y} textAnchor="middle"
                    className="hex-score-popup" fill="#fbbf24" fontSize="22" fontWeight="bold">
                    +{scorePopup.value}
                  </text>
                )}
              </svg>
            </div>

            <div className="mt-4 flex justify-center gap-3">
              {trayShapes.map((shape, idx) => (
                <div key={idx} onPointerDown={(e) => startDrag(e, idx)}
                  className={`flex h-20 w-20 cursor-grab items-center justify-center rounded-xl border-2 bg-gray-800/60 transition active:cursor-grabbing ${
                    dragShapeIdx === idx ? "opacity-40 scale-95 border-teal-500" : "border-gray-700 hover:border-teal-500 hover:bg-gray-800"
                  }`} aria-label={`方块${idx + 1}`}>
                  {shape && renderShapePreview(shape, 10)}
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-center gap-3">
              <button onClick={() => setPaused(p => !p)} aria-label="暂停"
                className="flex h-11 items-center gap-2 rounded-xl bg-gray-800 px-5 text-sm font-medium text-white transition hover:bg-gray-700 active:scale-95">
                <Pause size={16} /> 暂停 (P)
              </button>
              <button onClick={startGame} aria-label="重新开始"
                className="flex h-11 items-center gap-2 rounded-xl bg-gray-800 px-5 text-sm font-medium text-white transition hover:bg-gray-700 active:scale-95">
                <RotateCcw size={16} /> 重新开始
              </button>
            </div>
          </div>
        )}

        {gameState === "over" && (
          <div className="flex flex-col items-center justify-center gap-6 py-20">
            <div className="text-6xl">🏁</div>
            <h2 className="text-3xl font-bold text-white">游戏结束</h2>
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-400">{score}</div>
                <div className="text-sm text-gray-400">本局分数</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-400">{linesCleared}</div>
                <div className="text-sm text-gray-400">消除行数</div>
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
              className="flex h-12 items-center gap-2 rounded-xl bg-teal-600 px-8 text-lg font-bold text-white transition hover:bg-teal-500 active:scale-95">
              <RotateCcw size={20} /> 再玩一次
            </button>
          </div>
        )}

        {paused && gameState === "playing" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="text-4xl font-bold text-white">已暂停</div>
              <button onClick={() => setPaused(false)} aria-label="继续"
                className="flex h-12 items-center gap-2 rounded-xl bg-teal-600 px-8 text-lg font-bold text-white transition hover:bg-teal-500 active:scale-95">
                <Play size={20} /> 继续
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes hexClearAnim {
          0% { opacity: 0.9; }
          50% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        .hex-clear-anim { animation: hexClearAnim 0.5s ease-out forwards; pointer-events: none; }
        @keyframes hexScorePopup {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .hex-score-popup { animation: hexScorePopup 0.8s ease-out forwards; pointer-events: none; }
      `}</style>
    </GameShell>
  );
}