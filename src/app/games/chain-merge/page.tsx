"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, RotateCcw, Play, Pause, Calendar, Shuffle, Sparkles } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "chain-merge";
const BEST_SCORE_KEY = "gm_chainmerge_best_score";
const SIZE = 8;
const NUM_COLORS = 5;

const COLORS = [
  { bg: "#2dd4bf", light: "#5eead4", dark: "#0d9488" },
  { bg: "#38bdf8", light: "#7dd3fc", dark: "#0284c7" },
  { bg: "#a78bfa", light: "#c4b5fd", dark: "#7c3aed" },
  { bg: "#f472b6", light: "#f9a8d4", dark: "#be185d" },
  { bg: "#fbbf24", light: "#fcd34d", dark: "#b45309" },
];

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ---------- 确定性随机数（每日挑战） ---------- */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function dateSeedNum(): number {
  const d = new Date();
  const s = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return parseInt(s, 10);
}
function dateSeedStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

type Grid = number[][];

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
}
function genGrid(rng: () => number): Grid {
  const g = emptyGrid();
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) g[r][c] = Math.floor(rng() * NUM_COLORS);
  return g;
}
function cloneGrid(g: Grid): Grid {
  return g.map((r) => r.slice());
}

// BFS 连通同色块
function floodGroup(g: Grid, sr: number, sc: number): string[] {
  const color = g[sr][sc];
  if (color < 0) return [];
  const visited = new Set<string>();
  const stack: [number, number][] = [[sr, sc]];
  const out: string[] = [];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    const key = `${r},${c}`;
    if (visited.has(key)) continue;
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) continue;
    if (g[r][c] !== color) continue;
    visited.add(key);
    out.push(key);
    stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
  }
  return out;
}

// 重力 + 顶部补齐
function applyGravity(g: Grid, rng: () => number): Grid {
  const ng = emptyGrid();
  for (let c = 0; c < SIZE; c++) {
    const col: number[] = [];
    for (let r = SIZE - 1; r >= 0; r--) {
      if (g[r][c] >= 0) col.push(g[r][c]);
    }
    // col 是从底到顶的存活块
    for (let i = 0; i < col.length; i++) {
      ng[SIZE - 1 - i][c] = col[i];
    }
    // 顶部补新块
    for (let r = SIZE - 1 - col.length; r >= 0; r--) {
      ng[r][c] = Math.floor(rng() * NUM_COLORS);
    }
  }
  return ng;
}

function hasMoves(g: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return true;
      if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
}

export default function ChainMergePage() {
  const [grid, setGrid] = useState<Grid>(emptyGrid);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [selectedColor, setSelectedColor] = useState(-1);
  const [merging, setMerging] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [mode, setMode] = useState<"normal" | "daily">("normal");
  const [lastChain, setLastChain] = useState<{ size: number; pts: number } | null>(null);
  const [floatPts, setFloatPts] = useState<{ id: number; pts: number; r: number; c: number } | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const movesRef = useRef(0);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const rngRef = useRef<() => number>(Math.random);
  const floatIdRef = useRef(1);
  const animatingRef = useRef(false);

  const newRng = useCallback((m: "normal" | "daily") => {
    return m === "daily" ? mulberry32(dateSeedNum()) : Math.random;
  }, []);

  const checkGameOver = useCallback((g: Grid) => {
    if (!hasMoves(g)) {
      overRef.current = true;
      setOver(true);
      setRunning(false);
      setSelected(null);
      if (submittedRef.current) return;
      submittedRef.current = true;
      const s = scoreRef.current;
      const detail =
        mode === "daily" ? `每日 ${dateSeedStr()} ${s}分` : `${s}分 ${movesRef.current}步`;
      const r = submitScore(GAME_ID, s, detail);
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
    }
  }, [mode]);

  // 点击格子
  const handleClick = useCallback(
    (r: number, c: number) => {
      if (!running || over || paused || animatingRef.current) return;
      const color = grid[r][c];
      if (color < 0) return;

      // 若已有选中组，且点击在该组内 -> 合并
      if (selected && selected.includes(`${r},${c}`)) {
        const group = selected;
        const count = group.length;
        const pts = count * count * 10;
        animatingRef.current = true;
        setMerging(new Set(group));
        // 浮动分数
        floatIdRef.current += 1;
        setFloatPts({ id: floatIdRef.current, pts, r, c });
        setLastChain({ size: count, pts });

        window.setTimeout(() => {
          setGrid((prev) => {
            const ng = cloneGrid(prev);
            for (const key of group) {
              const [gr, gc] = key.split(",").map(Number);
              ng[gr][gc] = -1; // 标记移除
            }
            const fallen = applyGravity(ng, rngRef.current);
            return fallen;
          });
          setMerging(new Set());
          setSelected(null);
          setSelectedColor(-1);
          scoreRef.current += pts;
          setScore(scoreRef.current);
          movesRef.current += 1;
          setMoves(movesRef.current);
          setFloatPts(null);
          animatingRef.current = false;
          // 延迟检测游戏结束（等 grid 更新）
          window.setTimeout(() => {
            setGrid((g) => {
              checkGameOver(g);
              return g;
            });
          }, 30);
        }, 220);
        return;
      }

      // 否则计算新的连通组
      const group = floodGroup(grid, r, c);
      if (group.length < 2) {
        // 单块无法消除，取消选中
        setSelected(null);
        setSelectedColor(-1);
        return;
      }
      setSelected(group);
      setSelectedColor(color);
    },
    [grid, running, over, paused, selected, checkGameOver],
  );

  const start = useCallback(
    (m?: "normal" | "daily") => {
      const useMode = m ?? mode;
      rngRef.current = newRng(useMode);
      const g = genGrid(rngRef.current);
      // 保证初始有可消除
      let safety = 0;
      while (!hasMoves(g) && safety < 20) {
        const rg = newRng(useMode);
        const ng = genGrid(rg);
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) g[r][c] = ng[r][c];
        safety++;
      }
      setGrid(g);
      scoreRef.current = 0;
      movesRef.current = 0;
      overRef.current = false;
      submittedRef.current = false;
      animatingRef.current = false;
      setScore(0);
      setMoves(0);
      setOver(false);
      setResult(null);
      setSelected(null);
      setSelectedColor(-1);
      setMerging(new Set());
      setLastChain(null);
      setFloatPts(null);
      setRunning(true);
      setPaused(false);
    },
    [mode, newRng],
  );

  const restart = useCallback(() => {
    overRef.current = false;
    submittedRef.current = false;
    animatingRef.current = false;
    scoreRef.current = 0;
    movesRef.current = 0;
    setGrid(emptyGrid());
    setScore(0);
    setMoves(0);
    setOver(false);
    setResult(null);
    setSelected(null);
    setSelectedColor(-1);
    setMerging(new Set());
    setLastChain(null);
    setFloatPts(null);
    setRunning(false);
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (!running || over) return;
    setPaused(true);
  }, [running, over]);
  const resume = useCallback(() => {
    if (over) return;
    setPaused(false);
  }, [over]);

  const switchMode = useCallback(
    (m: "normal" | "daily") => {
      if (m === mode) return;
      setMode(m);
      // 切换模式时若正在游戏则重开
      if (running || over) {
        start(m);
      }
    },
    [mode, running, over, start],
  );

  // 挂载：生成预览棋盘 + 读取最高分
  useEffect(() => {
    rngRef.current = newRng("normal");
    setGrid(genGrid(rngRef.current));
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
  }, [newRng]);

  // 键盘：P 暂停 / R 重开
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "p") {
        if (running && !over) paused ? resume() : pause();
      } else if (k === "r") {
        restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, over, paused, pause, resume, restart]);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "步数", value: moves },
    { label: "最高", value: best },
    { label: "模式", value: mode === "daily" ? "每日" : "普通" },
  ];

  const fresh = !running && !over && score === 0 && moves === 0;
  const selCount = selected ? selected.length : 0;
  const selPts = selCount >= 2 ? selCount * selCount * 10 : 0;

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="链式合成"
        description="点击同色相连的方块高亮整条链，再次点击即可一次性消除！消除得分 = 数量²×10，链越长收益越高。方块下落后顶部补充新块，直到无路可消。每日挑战模式使用固定种子，全员同盘竞技。"
        instructions={`点击一个方块，系统会用泛洪算法找出所有相连的同色方块（至少 2 个）并高亮。再次点击高亮区域即可消除整组，得分 = 数量² × 10。消除后上方方块下落、顶部生成新块。当棋盘上不再有任何相邻同色块时游戏结束。按 P 暂停、R 重开。`}
        icon={Link2}
        iconEmoji="🔗"
        iconGradient="from-teal-400 to-cyan-500"
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
      title="链式合成"
      description="点击同色相连的方块高亮整条链，再次点击即可一次性消除！消除得分 = 数量²×10，链越长收益越高。方块下落后顶部补充新块，直到无路可消。每日挑战模式使用固定种子，全员同盘竞技。"
      instructions={`点击一个方块，系统会用泛洪算法找出所有相连的同色方块（至少 2 个）并高亮。再次点击高亮区域即可消除整组，得分 = 数量² × 10。消除后上方方块下落、顶部生成新块。当棋盘上不再有任何相邻同色块时游戏结束。按 P 暂停、R 重开。`}
      icon={Link2}
      iconEmoji="🔗"
      iconGradient="from-teal-400 to-cyan-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 模式切换 */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => switchMode("normal")}
            className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg transition-colors ${
              mode === "normal"
                ? "bg-cyan-500 text-white"
                : "bg-[#27272a] text-slate-400 hover:text-white"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" /> 普通模式
          </button>
          <button
            onClick={() => switchMode("daily")}
            className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg transition-colors ${
              mode === "daily"
                ? "bg-teal-500 text-white"
                : "bg-[#27272a] text-slate-400 hover:text-white"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> 每日挑战
          </button>
          {mode === "daily" && (
            <span className="text-[11px] text-teal-300/80">{dateSeedStr()}</span>
          )}
        </div>

        <div className="relative" style={{ width: "100%", maxWidth: 384 }}>
          <div
            className="relative mx-auto rounded-xl border border-[#27272a] overflow-hidden p-2 shadow-lg shadow-cyan-500/10"
            style={{ background: "linear-gradient(135deg,#0c1418,#0a0e14)" }}
          >
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${SIZE},1fr)` }}
            >
              {grid.map((row, r) =>
                row.map((color, c) => {
                  const key = `${r},${c}`;
                  const isSel = selected?.includes(key);
                  const isMerging = merging.has(key);
                  const def = color >= 0 ? COLORS[color] : COLORS[0];
                  return (
                    <button
                      key={key}
                      onClick={() => handleClick(r, c)}
                      disabled={over || paused || !running}
                      className="relative aspect-square rounded-md transition-all duration-150"
                      style={{
                        background:
                          color >= 0
                            ? `linear-gradient(150deg,${def.light},${def.bg} 55%,${def.dark})`
                            : "transparent",
                        opacity: color >= 0 ? 1 : 0,
                        transform: isSel ? "scale(0.9)" : isMerging ? "scale(1.25)" : "scale(1)",
                        boxShadow: isSel
                          ? `0 0 0 2px #fff, 0 0 14px ${def.light}`
                          : isMerging
                            ? `0 0 18px ${def.light}`
                            : `inset 0 1px 0 rgba(255,255,255,0.25)`,
                        cursor: running && !over && !paused ? "pointer" : "default",
                        animation: isMerging ? "chainpop 0.22s ease-out forwards" : undefined,
                      }}
                    >
                      {color >= 0 && (
                        <span
                          className="absolute inset-0 rounded-md"
                          style={{
                            background:
                              "radial-gradient(circle at 30% 25%,rgba(255,255,255,0.35),transparent 55%)",
                          }}
                        />
                      )}
                    </button>
                  );
                }),
              )}
            </div>

            {/* 浮动得分 */}
            {floatPts && (
              <div
                className="absolute pointer-events-none font-bold text-cyan-300 text-lg"
                style={{
                  left: `${((floatPts.c + 0.5) / SIZE) * 100}%`,
                  top: `${((floatPts.r + 0.5) / SIZE) * 100}%`,
                  transform: "translate(-50%,-50%)",
                  animation: "floatup 0.9s ease-out forwards",
                  textShadow: "0 0 10px rgba(45,212,191,0.8)",
                }}
              >
                +{floatPts.pts}
              </div>
            )}

            {/* 选中信息 */}
            {running && !over && !paused && selCount >= 2 && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full mt-2 pointer-events-none">
                <div className="px-3 py-1 rounded-lg bg-[#09090b]/90 border border-cyan-500/40 text-xs text-cyan-300 whitespace-nowrap">
                  链长 {selCount} · 再点消除 <span className="font-bold">+{selPts}</span>
                </div>
              </div>
            )}

            {/* 开始 / 暂停覆盖层 */}
            {(fresh || paused) && !over && (
              <div className="absolute inset-0 rounded-xl bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
                <button
                  onClick={fresh ? () => start() : resume}
                  className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors shadow-lg shadow-cyan-500/30"
                >
                  <Play className="w-5 h-5" /> {fresh ? "开始游戏" : "继续游戏"}
                </button>
                {fresh && (
                  <p className="mt-4 text-xs text-slate-400 text-center px-6 leading-relaxed">
                    点选同色连通块高亮 · 再点消除
                    <br />
                    链越长，得分越高（n²×10）
                  </p>
                )}
              </div>
            )}

            {/* 游戏结束 */}
            {over && (
              <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
                <div className="text-5xl mb-3">🔗</div>
                <h3 className="text-2xl font-bold mb-2">无路可消</h3>
                <p className="text-sm text-slate-400 mb-1">最终得分</p>
                <p className="text-4xl font-bold text-cyan-400 mb-1">{score}</p>
                <p className="text-xs text-slate-500 mb-3">
                  共 {moves} 步
                  {score >= best && score > 0 ? " · 新纪录！" : ` · 最高: ${best}`}
                </p>
                {result && (
                  <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                    排名第 <span className="text-cyan-300 font-bold">{result.rank}</span>/
                    {result.total}，超越了{" "}
                    <span className="text-cyan-300 font-bold">{result.beatPercent}%</span> 的玩家
                  </p>
                )}
                <button
                  onClick={() => start()}
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors shadow-lg shadow-cyan-500/30"
                >
                  <RotateCcw className="w-4 h-4" /> 再来一局
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="mt-12 flex items-center gap-3">
          {running && !over ? (
            <button
              onClick={paused ? resume : pause}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-200 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? "继续" : "暂停"}
            </button>
          ) : null}
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>

        {/* 最近一次消除 + 规则 */}
        <div className="mt-5 w-full max-w-[384px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {lastChain ? (
              <span>
                上次：{lastChain.size} 连消 <span className="text-cyan-300 font-bold">+{lastChain.pts}</span>
              </span>
            ) : (
              <span>尚未消除，点击同色方块开始</span>
            )}
          </div>
          <div className="text-[11px] text-slate-600">n²×10 · 至少 2 连</div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes chainpop {
          0% {
            transform: scale(0.9);
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }
        @keyframes floatup {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -160%) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </GameShell>
  );
}
