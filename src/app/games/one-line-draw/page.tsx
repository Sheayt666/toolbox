"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PenTool,
  Undo2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "one-line-draw";
const BEST_KEY = "gm_one_line_best_level";

/* ===== Level types ===== */
interface Level {
  name: string;
  nodes: { x: number; y: number }[];
  edges: [number, number][];
}

/* ===== Helper: polygon points ===== */
function poly(
  n: number,
  cx: number,
  cy: number,
  r: number
): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

/* ===== 15 Levels (all verified to have Euler path: 0 or 2 odd-degree nodes) ===== */
const LEVELS: Level[] = [
  // L1: Triangle (3 nodes, 3 edges) — circuit
  {
    name: "三角形",
    nodes: [
      { x: 50, y: 20 },
      { x: 22, y: 75 },
      { x: 78, y: 75 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 0],
    ],
  },
  // L2: Square (4 nodes, 4 edges) — circuit
  {
    name: "正方形",
    nodes: [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 75, y: 75 },
      { x: 25, y: 75 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
    ],
  },
  // L3: Pentagon (5 nodes, 5 edges) — circuit
  {
    name: "五边形",
    nodes: poly(5, 50, 50, 32),
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
  // L4: Square + diagonal (4 nodes, 5 edges) — path
  {
    name: "方框对角",
    nodes: [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 75, y: 75 },
      { x: 25, y: 75 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [0, 2],
    ],
  },
  // L5: House (5 nodes, 6 edges) — path (2 odd: nodes 2,4)
  {
    name: "小房子",
    nodes: [
      { x: 20, y: 80 },
      { x: 80, y: 80 },
      { x: 80, y: 40 },
      { x: 50, y: 15 },
      { x: 20, y: 40 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [4, 2],
    ],
  },
  // L6: Bowtie (5 nodes, 6 edges) — circuit
  {
    name: "蝴蝶结",
    nodes: [
      { x: 50, y: 50 },
      { x: 20, y: 20 },
      { x: 20, y: 80 },
      { x: 80, y: 20 },
      { x: 80, y: 80 },
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 2],
      [0, 3],
      [0, 4],
      [3, 4],
    ],
  },
  // L7: Hexagon (6 nodes, 6 edges) — circuit
  {
    name: "六边形",
    nodes: poly(6, 50, 50, 35),
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
  },
  // L8: Pentagram (5 nodes, 5 edges) — circuit
  {
    name: "五角星",
    nodes: poly(5, 50, 50, 35),
    edges: [
      [0, 2],
      [2, 4],
      [4, 1],
      [1, 3],
      [3, 0],
    ],
  },
  // L9: Key shape (6 nodes, 6 edges) — path (2 odd: nodes 3,5)
  {
    name: "钥匙",
    nodes: [
      { x: 35, y: 25 },
      { x: 65, y: 25 },
      { x: 65, y: 50 },
      { x: 35, y: 50 },
      { x: 35, y: 75 },
      { x: 18, y: 75 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [4, 5],
    ],
  },
  // L10: Two squares sharing edge (6 nodes, 7 edges) — path (2 odd: nodes 1,4)
  {
    name: "双格",
    nodes: [
      { x: 15, y: 30 },
      { x: 50, y: 30 },
      { x: 85, y: 30 },
      { x: 15, y: 70 },
      { x: 50, y: 70 },
      { x: 85, y: 70 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [3, 4],
      [4, 5],
      [0, 3],
      [1, 4],
      [2, 5],
    ],
  },
  // L11: Figure-eight (7 nodes, 8 edges) — circuit
  {
    name: "8字形",
    nodes: [
      { x: 50, y: 50 },
      { x: 25, y: 30 },
      { x: 75, y: 30 },
      { x: 50, y: 12 },
      { x: 25, y: 70 },
      { x: 75, y: 70 },
      { x: 50, y: 88 },
    ],
    edges: [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
      [0, 4],
      [4, 6],
      [6, 5],
      [5, 0],
    ],
  },
  // L12: Complex (5 nodes, 7 edges) — path (2 odd: nodes 1,4)
  {
    name: "蛛网",
    nodes: [
      { x: 20, y: 20 },
      { x: 80, y: 20 },
      { x: 50, y: 50 },
      { x: 20, y: 80 },
      { x: 80, y: 80 },
    ],
    edges: [
      [0, 1],
      [0, 2],
      [1, 2],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ],
  },
  // L13: Twin pentagons (10 nodes, 11 edges) — path (2 odd: connecting nodes)
  {
    name: "双子塔",
    nodes: [
      ...poly(5, 28, 50, 22),
      ...poly(5, 72, 50, 22),
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 5],
      [2, 7],
    ],
  },
  // L14: Three loop chain (10 nodes, 13 edges) — path (2 odd: nodes 0,9)
  {
    name: "三连环",
    nodes: [
      { x: 15, y: 30 },
      { x: 30, y: 18 },
      { x: 35, y: 45 },
      { x: 18, y: 62 },
      { x: 50, y: 18 },
      { x: 55, y: 45 },
      { x: 50, y: 72 },
      { x: 75, y: 18 },
      { x: 85, y: 45 },
      { x: 75, y: 72 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
      [4, 5],
      [5, 6],
      [6, 2],
      [5, 7],
      [7, 8],
      [8, 9],
      [9, 5],
      [0, 9],
    ],
  },
  // L15: Four diamond chain + tail (14 nodes, 18 edges) — path (2 odd: nodes 0,12)
  {
    name: "大迷宫",
    nodes: [
      { x: 15, y: 20 },
      { x: 30, y: 10 },
      { x: 30, y: 30 },
      { x: 15, y: 40 },
      { x: 50, y: 20 },
      { x: 50, y: 40 },
      { x: 30, y: 50 },
      { x: 70, y: 30 },
      { x: 70, y: 50 },
      { x: 50, y: 60 },
      { x: 85, y: 40 },
      { x: 85, y: 60 },
      { x: 70, y: 70 },
      { x: 15, y: 65 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
      [4, 5],
      [5, 6],
      [6, 2],
      [5, 7],
      [7, 8],
      [8, 9],
      [9, 5],
      [8, 10],
      [10, 11],
      [11, 12],
      [12, 8],
      [0, 13],
      [13, 12],
    ],
  },
];

/* ===== Verify Euler path exists ===== */
function getDegrees(level: Level): number[] {
  const deg = new Array(level.nodes.length).fill(0);
  for (const [a, b] of level.edges) {
    deg[a]++;
    deg[b]++;
  }
  return deg;
}

/* ===== Find edge index between two nodes ===== */
function findEdgeIndex(
  level: Level,
  a: number,
  b: number,
  used: Set<number>
): number {
  for (let i = 0; i < level.edges.length; i++) {
    if (used.has(i)) continue;
    const [e1, e2] = level.edges[i];
    if ((e1 === a && e2 === b) || (e1 === b && e2 === a)) return i;
  }
  return -1;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

export default function OneLineDrawPage() {
  /* ===== mounted mode ===== */
  const [mounted, setMounted] = useState(false);
  const [levelIdx, setLevelIdx] = useState(0);
  const [path, setPath] = useState<number[]>([]);
  const [usedEdges, setUsedEdges] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bestLevel, setBestLevel] = useState(0);
  const [moves, setMoves] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pathRef = useRef<number[]>([]);
  const usedRef = useRef<Set<number>>(new Set());
  const levelIdxRef = useRef(0);
  const submittedRef = useRef(false);
  const movesRef = useRef(0);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const level = LEVELS[levelIdx];
  const totalEdges = level.edges.length;

  /* ===== init (mounted) ===== */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (saved > 0) {
        setBestLevel(saved);
        const startIdx = Math.min(saved, LEVELS.length - 1);
        setLevelIdx(startIdx);
        levelIdxRef.current = startIdx;
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ===== show error temporarily ===== */
  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(null), 1500);
  }, []);

  /* ===== handle node click ===== */
  const handleNodeClick = useCallback(
    (nodeIdx: number) => {
      if (submittedRef.current) return;

      const currentPath = pathRef.current;
      const currentUsed = usedRef.current;
      const currentLevel = LEVELS[levelIdxRef.current];

      // First node: start the path
      if (currentPath.length === 0) {
        pathRef.current = [nodeIdx];
        setPath([nodeIdx]);
        return;
      }

      const lastNode = currentPath[currentPath.length - 1];

      // Clicking the same node does nothing
      if (nodeIdx === lastNode) return;

      // Check if there's an unused edge between lastNode and nodeIdx
      const edgeIdx = findEdgeIndex(
        currentLevel,
        lastNode,
        nodeIdx,
        currentUsed
      );

      if (edgeIdx === -1) {
        // Check if the edge exists but is already used
        const anyEdge = currentLevel.edges.findIndex(
          ([a, b]) =>
            (a === lastNode && b === nodeIdx) ||
            (a === nodeIdx && b === lastNode)
        );
        if (anyEdge !== -1) {
          showError("这条边已经走过啦！");
        } else {
          showError("这两个节点不相邻！");
        }
        return;
      }

      // Valid move
      const newUsed = new Set(currentUsed);
      newUsed.add(edgeIdx);
      const newPath = [...currentPath, nodeIdx];

      pathRef.current = newPath;
      usedRef.current = newUsed;
      setPath(newPath);
      setUsedEdges(newUsed);
      movesRef.current += 1;
      setMoves(movesRef.current);

      // Check completion
      if (newUsed.size === currentLevel.edges.length) {
        setCompleted(true);
        if (!submittedRef.current) {
          submittedRef.current = true;
          const score = Math.max(
            100,
            currentLevel.edges.length * 100 - movesRef.current * 5
          );
          const r = submitScore(
            GAME_ID,
            score,
            `第${levelIdxRef.current + 1}关: ${currentLevel.name}`
          );
          setResult(r);
          setRefreshKey((k) => k + 1);

          // Save best level
          const completedLevel = levelIdxRef.current + 1;
          if (completedLevel > bestLevel) {
            setBestLevel(completedLevel);
            try {
              localStorage.setItem(BEST_KEY, String(completedLevel));
            } catch {
              /* ignore */
            }
          }
        }
      }
    },
    [bestLevel, showError]
  );

  /* ===== undo ===== */
  const handleUndo = useCallback(() => {
    if (submittedRef.current) return;
    const currentPath = pathRef.current;
    if (currentPath.length <= 1) {
      // Undo to empty
      pathRef.current = [];
      usedRef.current = new Set();
      setPath([]);
      setUsedEdges(new Set());
      return;
    }
    const removed = currentPath[currentPath.length - 1];
    const prev = currentPath[currentPath.length - 2];
    const currentLevel = LEVELS[levelIdxRef.current];
    // Find the edge that was used for this step
    const edgeIdx = currentLevel.edges.findIndex(
      ([a, b]) =>
        (a === prev && b === removed) || (a === removed && b === prev)
    );
    const newUsed = new Set(usedRef.current);
    if (edgeIdx !== -1) newUsed.delete(edgeIdx);
    const newPath = currentPath.slice(0, -1);
    pathRef.current = newPath;
    usedRef.current = newUsed;
    setPath(newPath);
    setUsedEdges(newUsed);
  }, []);

  /* ===== reset ===== */
  const handleReset = useCallback(() => {
    pathRef.current = [];
    usedRef.current = new Set();
    submittedRef.current = false;
    movesRef.current = 0;
    setPath([]);
    setUsedEdges(new Set());
    setCompleted(false);
    setResult(null);
    setMoves(0);
    setErrorMsg(null);
  }, []);

  /* ===== change level ===== */
  const changeLevel = useCallback(
    (delta: number) => {
      const newIdx = Math.max(
        0,
        Math.min(LEVELS.length - 1, levelIdxRef.current + delta)
      );
      levelIdxRef.current = newIdx;
      setLevelIdx(newIdx);
      handleReset();
    },
    [handleReset]
  );

  const goToLevel = useCallback(
    (idx: number) => {
      levelIdxRef.current = idx;
      setLevelIdx(idx);
      handleReset();
    },
    [handleReset]
  );

  const degrees = getDegrees(level);
  const oddNodes = degrees.filter((d) => d % 2 === 1).length;
  const progress = usedEdges.size / totalEdges;

  const stats: GameStat[] = [
    { label: "关卡", value: `${levelIdx + 1}/${LEVELS.length}` },
    { label: "进度", value: `${usedEdges.size}/${totalEdges}` },
    { label: "最高关", value: bestLevel },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="一笔画"
        description="用一条线经过所有边，不重复不遗漏"
        instructions="点击任意节点开始画线，然后点击相邻节点继续。每条边只能经过一次，经过所有边即完成。支持撤销和重置。部分图形需要从特定节点开始才能完成（有2个奇数度节点的图形必须从奇数度节点开始）。"
        icon={PenTool}
        iconEmoji="✏️"
        iconGradient="from-rose-400 to-pink-600"
        stats={stats}
        shareScore={levelIdx * 100}
        refreshKey={refreshKey}
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
      title="一笔画"
      description="用一条线经过所有边，不重复不遗漏"
      instructions="点击任意节点开始画线，然后点击相邻节点继续。每条边只能经过一次，经过所有边即完成。支持撤销和重置。部分图形需要从特定节点开始才能完成（有2个奇数度节点的图形必须从奇数度节点开始）。"
      icon={PenTool}
      iconEmoji="✏️"
      iconGradient="from-rose-400 to-pink-600"
      stats={stats}
      shareScore={levelIdx * 100}
      refreshKey={refreshKey}
    >
      <div className="max-w-[500px] mx-auto">
        {/* Level info & nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeLevel(-1)}
            disabled={levelIdx === 0}
            className="p-2 rounded-lg bg-[#27272a] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <div className="text-sm font-semibold text-white">
              第 {levelIdx + 1} 关: {level.name}
            </div>
            <div className="text-xs text-slate-500">
              {totalEdges} 条边 · {oddNodes === 0 ? "回路" : "路径"} ·{" "}
              {level.nodes.length} 节点
            </div>
          </div>

          <button
            onClick={() => changeLevel(1)}
            disabled={levelIdx === LEVELS.length - 1}
            className="p-2 rounded-lg bg-[#27272a] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#f43f5e] to-[#ec4899] rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 text-center mt-1">
            {usedEdges.size} / {totalEdges} 条边已画
          </div>
        </div>

        {/* SVG game area */}
        <div className="relative bg-[#0f0f12] border border-[#27272a] rounded-2xl p-4 mb-3">
          {/* Error message */}
          {errorMsg && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-xs text-red-300 animate-pulse">
              {errorMsg}
            </div>
          )}

          <svg
            viewBox="0 0 100 100"
            className="w-full min-h-[400px] touch-none"
            style={{ aspectRatio: "1" }}
          >
            {/* Grid background */}
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 10 0 L 0 0 0 10"
                  fill="none"
                  stroke="rgba(39,39,42,0.5)"
                  strokeWidth="0.3"
                />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Draw all edges (dim) */}
            {level.edges.map(([a, b], i) => {
              const na = level.nodes[a];
              const nb = level.nodes[b];
              const isUsed = usedEdges.has(i);
              return (
                <line
                  key={`edge-bg-${i}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={isUsed ? "transparent" : "rgba(63,63,70,0.6)"}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Draw used edges (highlighted) */}
            {path.slice(1).map((node, i) => {
              const prev = path[i];
              const na = level.nodes[prev];
              const nb = level.nodes[node];
              return (
                <line
                  key={`path-${i}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="url(#pathGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{
                    filter: "drop-shadow(0 0 3px rgba(244,63,94,0.6))",
                  }}
                />
              );
            })}

            <defs>
              <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <radialGradient id="nodeGrad">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="100%" stopColor="#e11d48" />
              </radialGradient>
              <radialGradient id="nodeUsedGrad">
                <stop offset="0%" stopColor="#6b7280" />
                <stop offset="100%" stopColor="#374151" />
              </radialGradient>
              <radialGradient id="nodeCurrentGrad">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#eab308" />
              </radialGradient>
            </defs>

            {/* Draw nodes */}
            {level.nodes.map((node, i) => {
              const isStart = path.length > 0 && path[0] === i;
              const isCurrent =
                path.length > 0 && path[path.length - 1] === i;
              const isInPath = path.includes(i);
              const isOdd = degrees[i] % 2 === 1;
              const currentNode =
                path.length > 0 ? path[path.length - 1] : -1;

              // Can this node be clicked?
              const canClick =
                !completed &&
                (path.length === 0 ||
                  (currentNode !== -1 &&
                    currentNode !== i &&
                    findEdgeIndex(level, currentNode, i, usedEdges) !== -1));

              return (
                <g
                  key={`node-${i}`}
                  onClick={() => handleNodeClick(i)}
                  style={{ cursor: canClick ? "pointer" : "default" }}
                >
                  {/* Odd-degree indicator (subtle ring) */}
                  {isOdd && path.length === 0 && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="5"
                      fill="none"
                      stroke="rgba(234,179,8,0.3)"
                      strokeWidth="0.5"
                      strokeDasharray="1,1"
                    />
                  )}

                  {/* Start indicator */}
                  {isStart && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="6"
                      fill="none"
                      stroke="rgba(34,197,94,0.5)"
                      strokeWidth="0.8"
                    />
                  )}

                  {/* Current node glow */}
                  {isCurrent && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="7"
                      fill="none"
                      stroke="rgba(234,179,8,0.4)"
                      strokeWidth="1"
                      className="animate-pulse"
                    />
                  )}

                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="3.5"
                    fill={
                      isCurrent
                        ? "url(#nodeCurrentGrad)"
                        : isInPath
                          ? "url(#nodeUsedGrad)"
                          : "url(#nodeGrad)"
                    }
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="0.5"
                  />

                  {/* Hover hint */}
                  {canClick && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="5"
                      fill="transparent"
                      className="hover:fill-[#f43f5e]/20"
                      style={{ transition: "fill 0.2s" }}
                    />
                  )}
                </g>
              );
            })}

            {/* Completion checkmark */}
            {completed && (
              <g>
                <circle
                  cx="50"
                  cy="50"
                  r="20"
                  fill="rgba(34,197,94,0.15)"
                  className="animate-pulse"
                />
              </g>
            )}
          </svg>

          {/* Completion overlay */}
          {completed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#09090b]/85 backdrop-blur-sm rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
              <div className="text-2xl font-bold text-white">完成！</div>
              <div className="text-sm text-slate-400">
                {moves} 步完成 · {level.name}
              </div>
              {result && (
                <div className="text-xs text-slate-500">
                  排名 #{result.rank} / {result.total} · 击败{" "}
                  {result.beatPercent}% 玩家
                </div>
              )}
              <div className="flex gap-2 mt-2">
                {levelIdx < LEVELS.length - 1 ? (
                  <button
                    onClick={() => changeLevel(1)}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
                  >
                    下一关
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-sm text-amber-400 font-semibold">
                    全部通关！
                  </div>
                )}
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  重玩
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={handleUndo}
            disabled={path.length === 0 || completed}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            撤销
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>

        {/* Level selector */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {LEVELS.map((lv, i) => {
            const isUnlocked = i <= bestLevel;
            const isCurrent = i === levelIdx;
            return (
              <button
                key={i}
                onClick={() => isUnlocked && goToLevel(i)}
                disabled={!isUnlocked}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  isCurrent
                    ? "bg-[#8b5cf6] text-white"
                    : isUnlocked
                      ? "bg-[#27272a] text-slate-300 hover:bg-[#3f3f46]"
                      : "bg-[#18181b] text-slate-600 cursor-not-allowed"
                }`}
              >
                {isUnlocked ? i + 1 : "🔒"}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 text-center mt-3">
          点击节点画线 · 黄色环表示奇数度起点 · 绿色环表示起点
        </p>
      </div>
    </GameShell>
  );
}
