"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Puzzle, RotateCcw, Play } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "block-jigsaw";
const GRID_SIZE = 10;
const CELL_SIZE = 34;
const BEST_SCORE_KEY = "gm_block_jigsaw_best_score";

type Cell = 0 | 1;

interface BlockShape {
  id: string;
  cells: Cell[][];
  width: number;
  height: number;
  color: string;
}

interface BlockInstance {
  shape: BlockShape;
  uid: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ============ 方块形状库 ============ */
const COLORS = [
  "#22c55e", "#3b82f6", "#ef4444", "#f59e0b",
  "#a855f7", "#06b6d4", "#ec4899", "#84cc16",
  "#f97316", "#14b8a6",
];

const SHAPES: Cell[][][] = [
  // 单格
  [[1]],
  // 2x1 / 1x2
  [[1, 1]],
  [[1], [1]],
  // 2x2
  [[1, 1], [1, 1]],
  // 3x1 / 1x3
  [[1, 1, 1]],
  [[1], [1], [1]],
  // 4x1 / 1x4
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  // 5x1
  [[1, 1, 1, 1, 1]],
  // L-shapes (3x2 and 2x3)
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1], [1, 0], [1, 0]],
  [[1, 1], [0, 1], [0, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  // T-shapes
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 1], [1, 0]],
  [[0, 1], [1, 1], [0, 1]],
  // S / Z shapes
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0], [1, 1], [0, 1]],
  [[0, 1], [1, 1], [1, 0]],
  // 3x3
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  // small L (2x2 corner)
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1], [1, 0]],
  [[1, 1], [0, 1]],
];

let shapeIdCounter = 0;

function makeRandomShape(): BlockShape {
  const idx = Math.floor(Math.random() * SHAPES.length);
  const cells = SHAPES[idx].map((row) => row.slice());
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const height = cells.length;
  const width = cells[0].length;
  shapeIdCounter++;
  return {
    id: `shape-${shapeIdCounter}-${Date.now()}`,
    cells,
    width,
    height,
    color,
  };
}

function makeThreeShapes(): BlockInstance[] {
  return [
    { shape: makeRandomShape(), uid: shapeIdCounter },
    { shape: makeRandomShape(), uid: shapeIdCounter + 1 },
    { shape: makeRandomShape(), uid: shapeIdCounter + 2 },
  ];
}

function emptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array<number>(GRID_SIZE).fill(0),
  );
}

function canPlace(
  grid: number[][],
  shape: BlockShape,
  row: number,
  col: number,
): boolean {
  if (row < 0 || col < 0) return false;
  if (row + shape.height > GRID_SIZE) return false;
  if (col + shape.width > GRID_SIZE) return false;
  for (let r = 0; r < shape.height; r++) {
    for (let c = 0; c < shape.width; c++) {
      if (shape.cells[r][c] === 1 && grid[row + r][col + c] !== 0) {
        return false;
      }
    }
  }
  return true;
}

function placeBlock(
  grid: number[][],
  shape: BlockShape,
  row: number,
  col: number,
  colorIndex: number,
): number[][] {
  const newGrid = grid.map((r) => r.slice());
  for (let r = 0; r < shape.height; r++) {
    for (let c = 0; c < shape.width; c++) {
      if (shape.cells[r][c] === 1) {
        newGrid[row + r][col + c] = colorIndex;
      }
    }
  }
  return newGrid;
}

function clearLines(grid: number[][]): {
  grid: number[][];
  clearedRows: number;
  clearedCols: number;
} {
  const newGrid = grid.map((r) => r.slice());
  const fullRows: number[] = [];
  const fullCols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    if (newGrid[r].every((v) => v !== 0)) fullRows.push(r);
  }
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (newGrid[r][c] === 0) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }

  for (const r of fullRows) {
    for (let c = 0; c < GRID_SIZE; c++) newGrid[r][c] = 0;
  }
  for (const c of fullCols) {
    for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = 0;
  }

  return {
    grid: newGrid,
    clearedRows: fullRows.length,
    clearedCols: fullCols.length,
  };
}

function canAnyBlockFit(grid: number[][], blocks: BlockInstance[]): boolean {
  for (const block of blocks) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (canPlace(grid, block.shape, r, c)) return true;
      }
    }
  }
  return false;
}

function countCells(shape: BlockShape): number {
  let count = 0;
  for (const row of shape.cells) {
    for (const c of row) if (c === 1) count++;
  }
  return count;
}

/* ============ 组件 ============ */

export default function BlockJigsawPage() {
  const gridRef = useRef<number[][]>(emptyGrid());
  const blocksRef = useRef<BlockInstance[]>([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const bestRef = useRef(0);
  const submittedRef = useRef(false);
  const overRef = useRef(false);
  const dragRef = useRef<{
    blockUid: number;
    shape: BlockShape;
    pointerX: number;
    pointerY: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [mounted, setMounted] = useState(false);
  const [grid, setGrid] = useState<number[][]>(emptyGrid());
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dragUid, setDragUid] = useState<number | null>(null);
  const [flashScore, setFlashScore] = useState<string | null>(null);

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

  /* ----- cleanup timers on unmount ----- */
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  /* ----- 开始新游戏 ----- */
  const startGame = useCallback(() => {
    const g = emptyGrid();
    const b = makeThreeShapes();
    gridRef.current = g;
    blocksRef.current = b;
    scoreRef.current = 0;
    comboRef.current = 0;
    overRef.current = false;
    submittedRef.current = false;
    setGrid(g);
    setBlocks(b);
    setScore(0);
    setCombo(0);
    setOver(false);
    setResult(null);
    setRunning(true);
  }, []);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    startGame();
  }, [startGame]);

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finalScore = scoreRef.current;
    const r = submitScore(GAME_ID, finalScore, `${finalScore} 分`);
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

  /* ----- 放置方块 ----- */
  const tryPlaceBlock = useCallback(
    (blockUid: number, row: number, col: number) => {
      const block = blocksRef.current.find((b) => b.uid === blockUid);
      if (!block) return;
      const shape = block.shape;
      if (!canPlace(gridRef.current, shape, row, col)) return;

      const colorIdx = COLORS.indexOf(shape.color) + 1;
      let newGrid = placeBlock(gridRef.current, shape, row, col, colorIdx);
      const placedCells = countCells(shape);

      // 清除整行/整列
      const { grid: clearedGrid, clearedRows, clearedCols } = clearLines(newGrid);
      const totalCleared = clearedRows + clearedCols;

      let gained = placedCells;
      let newCombo = comboRef.current;

      if (totalCleared > 0) {
        newCombo = comboRef.current + 1;
        const lineScore = totalCleared * 100;
        const comboBonus = newCombo > 1 ? (newCombo - 1) * 50 : 0;
        gained += lineScore + comboBonus;

        setFlashScore(
          `+${lineScore}${comboBonus > 0 ? ` 连击 x${newCombo}!` : ""}`,
        );
        timersRef.current.push(setTimeout(() => setFlashScore(null), 1200));
      } else {
        newCombo = 0;
      }

      const newScore = scoreRef.current + gained;
      scoreRef.current = newScore;
      comboRef.current = newCombo;
      gridRef.current = clearedGrid;
      setGrid(clearedGrid);
      setScore(newScore);
      setCombo(newCombo);

      // 移除已放置的方块
      const remaining = blocksRef.current.filter((b) => b.uid !== blockUid);
      blocksRef.current = remaining;
      setBlocks(remaining);

      // 如果三个方块都用完了，生成新的三个
      if (remaining.length === 0) {
        const newBlocks = makeThreeShapes();
        blocksRef.current = newBlocks;
        setBlocks(newBlocks);
      }

      // 检查游戏结束
      timersRef.current.push(setTimeout(() => {
        if (!canAnyBlockFit(gridRef.current, blocksRef.current)) {
          doGameOver();
        }
      }, 50));
    },
    [doGameOver],
  );

  /* ----- 拖拽处理 ----- */
  const onPointerDownBlock = (
    e: React.PointerEvent,
    block: BlockInstance,
  ) => {
    if (!running || over) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragRef.current = {
      blockUid: block.uid,
      shape: block.shape,
      pointerX: e.clientX,
      pointerY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    setDragUid(block.uid);
    setDragPos({ x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return;
      dragRef.current.pointerX = e.clientX;
      dragRef.current.pointerY = e.clientY;
      setDragPos({ x: e.clientX, y: e.clientY });

      // 计算网格悬停位置
      const gridEl = gridContainerRef.current;
      if (!gridEl) return;
      const rect = gridEl.getBoundingClientRect();
      const shape = dragRef.current.shape;
      // 方块拖拽时，鼠标在方块中心区域，计算放置位置
      const blockElW = shape.width * CELL_SIZE;
      const blockElH = shape.height * CELL_SIZE;
      // 偏移：拖拽时方块左上角 = 鼠标位置 - 方块半宽
      const ghostLeft = e.clientX - blockElW / 2;
      const ghostTop = e.clientY - blockElH / 2;
      const col = Math.round((ghostLeft - rect.left) / CELL_SIZE);
      const row = Math.round((ghostTop - rect.top) / CELL_SIZE);

      if (
        row >= 0 && row + shape.height <= GRID_SIZE &&
        col >= 0 && col + shape.width <= GRID_SIZE
      ) {
        setHoverCell({ row, col });
      } else {
        setHoverCell(null);
      }
    },
    [],
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { blockUid, shape } = dragRef.current;
      const gridEl = gridContainerRef.current;
      if (gridEl) {
        const rect = gridEl.getBoundingClientRect();
        const blockElW = shape.width * CELL_SIZE;
        const blockElH = shape.height * CELL_SIZE;
        const ghostLeft = e.clientX - blockElW / 2;
        const ghostTop = e.clientY - blockElH / 2;
        const col = Math.round((ghostLeft - rect.left) / CELL_SIZE);
        const row = Math.round((ghostTop - rect.top) / CELL_SIZE);
        if (
          row >= 0 && row + shape.height <= GRID_SIZE &&
          col >= 0 && col + shape.width <= GRID_SIZE
        ) {
          tryPlaceBlock(blockUid, row, col);
        }
      }
      dragRef.current = null;
      setDragUid(null);
      setDragPos(null);
      setHoverCell(null);
    },
    [tryPlaceBlock],
  );

  useEffect(() => {
    if (!dragUid) return;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [dragUid, onPointerMove, onPointerUp]);

  /* ----- 渲染网格单元格颜色 ----- */
  const cellColor = (val: number): string => {
    if (val === 0) return "transparent";
    return COLORS[(val - 1) % COLORS.length];
  };

  /* ----- 预览放置位置 ----- */
  const previewGrid = (() => {
    if (!dragRef.current || !hoverCell) return null;
    const shape = dragRef.current.shape;
    const { row, col } = hoverCell;
    const canFit = canPlace(gridRef.current, shape, row, col);
    return { shape, row, col, canFit };
  })();

  const stats: GameStat[] = [
    { label: "当前分数", value: score },
    { label: "最高记录", value: best },
    { label: "连击", value: combo > 0 ? `x${combo}` : "—" },
    { label: "状态", value: over ? "已结束" : running ? "进行中" : "待开始" },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="方块拼图"
        description="将底部方块拖入10x10网格，填满整行或整列即可消除得分。连击消除获得额外奖励，无法放置任何方块时游戏结束！"
        instructions={`拖拽底部的方块到网格中放置。
填满一整行或一整列即可消除并得分。
一次消除多行/多列会触发连击，获得额外奖励分。
三个方块全部放置后会自动补充新的三个方块。
当没有任何方块可以放入网格时游戏结束。
分数 = 放置方块格数 + 消除行/列数 × 100 + 连击奖励。`}
        icon={Puzzle}
        iconEmoji="🧩"
        iconGradient="from-emerald-400 to-green-500"
        stats={[]}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-slate-500">加载中...</div>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="方块拼图"
      description="将底部方块拖入10x10网格，填满整行或整列即可消除得分。连击消除获得额外奖励，无法放置任何方块时游戏结束！"
      instructions={`拖拽底部的方块到网格中放置。
填满一整行或一整列即可消除并得分。
一次消除多行/多列会触发连击，获得额外奖励分。
三个方块全部放置后会自动补充新的三个方块。
当没有任何方块可以放入网格时游戏结束。
分数 = 放置方块格数 + 消除行/列数 × 100 + 连击奖励。`}
      icon={Puzzle}
      iconEmoji="🧩"
      iconGradient="from-emerald-400 to-green-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center gap-4">
        {/* 分数显示 */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-slate-500">分数</div>
            <div className="text-2xl font-bold text-emerald-400 tabular-nums">{score}</div>
          </div>
          {combo > 1 && (
            <div className="text-center animate-pulse">
              <div className="text-xs text-slate-500">连击</div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">x{combo}</div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs text-slate-500">最高</div>
            <div className="text-2xl font-bold text-slate-300 tabular-nums">{best}</div>
          </div>
        </div>

        {/* 网格区域 */}
        <div className="relative">
          {flashScore && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg font-bold text-amber-400 animate-bounce z-20 whitespace-nowrap">
              {flashScore}
            </div>
          )}
          <div
            ref={gridContainerRef}
            className="relative bg-[#0a0a0b] border border-[#27272a] rounded-lg p-1.5 shadow-lg shadow-emerald-500/5"
            style={{ width: GRID_SIZE * CELL_SIZE + 12 }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                gap: "2px",
              }}
            >
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const isPreview =
                    previewGrid &&
                    previewGrid.shape.cells[r - previewGrid.row]?.[c - previewGrid.col] === 1;
                  const previewCanFit = previewGrid?.canFit;
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="rounded-sm transition-colors duration-150"
                      style={{
                        width: CELL_SIZE - 2,
                        height: CELL_SIZE - 2,
                        backgroundColor:
                          val !== 0
                            ? cellColor(val)
                            : isPreview
                              ? previewCanFit
                                ? "rgba(34,197,94,0.3)"
                                : "rgba(239,68,68,0.2)"
                              : "rgba(39,39,42,0.4)",
                        boxShadow: val !== 0 ? `inset 0 0 0 1px rgba(255,255,255,0.1)` : "none",
                      }}
                    />
                  );
                }),
              )}
            </div>
          </div>

          {/* 待开始覆盖层 */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-lg bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <button
                onClick={startGame}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-4">
                拖拽方块到网格放置
              </p>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-lg bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">🧩</div>
              <h3 className="text-2xl font-bold mb-2">游戏结束</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-emerald-400 mb-1">{score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
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
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* 方块托盘 */}
        <div className="flex items-start justify-center gap-3 min-h-[100px] w-full max-w-md">
          {mounted && running && !over && blocks.map((block) => {
            if (dragUid === block.uid) {
              return (
                <div
                  key={block.uid}
                  className="flex-shrink-0 opacity-30"
                  style={{ width: block.shape.width * 22, height: block.shape.height * 22 }}
                >
                  <BlockPreview shape={block.shape} cellSize={22} />
                </div>
              );
            }
            return (
              <div
                key={block.uid}
                onPointerDown={(e) => onPointerDownBlock(e, block)}
                className="flex-shrink-0 cursor-grab active:cursor-grabbing touch-none hover:scale-105 transition-transform"
                style={{ touchAction: "none" }}
              >
                <BlockPreview shape={block.shape} cellSize={26} />
              </div>
            );
          })}
          {(!running || over) && (
            <div className="h-[100px] flex items-center text-slate-600 text-sm">
              点击"开始游戏"获取方块
            </div>
          )}
        </div>

        {/* 拖拽中的幽灵方块 */}
        {dragUid !== null && dragPos && dragRef.current && (
          <div
            className="fixed pointer-events-none z-50"
            style={{
              left: dragPos.x - (dragRef.current.shape.width * CELL_SIZE) / 2,
              top: dragPos.y - (dragRef.current.shape.height * CELL_SIZE) / 2,
            }}
          >
            <BlockPreview shape={dragRef.current.shape} cellSize={CELL_SIZE - 2} />
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex items-center gap-3 mt-2">
          {!running && !over && (
            <button
              onClick={startGame}
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
    </GameShell>
  );
}

/* ============ 方块预览组件 ============ */

function BlockPreview({
  shape,
  cellSize,
}: {
  shape: BlockShape;
  cellSize: number;
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${shape.width}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${shape.height}, ${cellSize}px)`,
        gap: "2px",
      }}
    >
      {shape.cells.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className="rounded-sm transition-all"
            style={{
              width: cellSize - 2,
              height: cellSize - 2,
              backgroundColor: cell === 1 ? shape.color : "transparent",
              boxShadow:
                cell === 1
                  ? `inset 0 0 0 1px rgba(255,255,255,0.15), 0 1px 3px ${shape.color}40`
                  : "none",
            }}
          />
        )),
      )}
    </div>
  );
}
