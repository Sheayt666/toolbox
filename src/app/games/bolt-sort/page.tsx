"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Wrench, RotateCcw, Play, ChevronRight, Clock } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "bolt-sort";
const BEST_SCORE_KEY = "gm_bolt_sort_best_score";
const MAX_LEVEL = 10;
const BOLT_COLORS = [
  { bg: "#ef4444", glow: "rgba(239,68,68,0.4)", name: "红" },
  { bg: "#3b82f6", glow: "rgba(59,130,246,0.4)", name: "蓝" },
  { bg: "#22c55e", glow: "rgba(34,197,94,0.4)", name: "绿" },
  { bg: "#f59e0b", glow: "rgba(245,158,11,0.4)", name: "黄" },
  { bg: "#a855f7", glow: "rgba(168,85,247,0.4)", name: "紫" },
  { bg: "#06b6d4", glow: "rgba(6,182,212,0.4)", name: "青" },
  { bg: "#ec4899", glow: "rgba(236,72,153,0.4)", name: "粉" },
  { bg: "#f97316", glow: "rgba(249,115,22,0.4)", name: "橙" },
];

interface Tube {
  id: number;
  bolts: number[]; // color indices, bottom = first
  capacity: number;
}

interface LevelConfig {
  level: number;
  tubeCount: number;
  tubeCapacity: number;
  colorCount: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ============ 确定性随机数生成器（种子）============ */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function getTodaySeed(): number {
  const today = new Date();
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

/* ============ 关卡配置 ============ */
function getLevelConfig(level: number): LevelConfig {
  const configs: LevelConfig[] = [
    { level: 1, tubeCount: 3, tubeCapacity: 4, colorCount: 2 },
    { level: 2, tubeCount: 4, tubeCapacity: 4, colorCount: 3 },
    { level: 3, tubeCount: 5, tubeCapacity: 4, colorCount: 4 },
    { level: 4, tubeCount: 5, tubeCapacity: 5, colorCount: 4 },
    { level: 5, tubeCount: 6, tubeCapacity: 4, colorCount: 5 },
    { level: 6, tubeCount: 7, tubeCapacity: 4, colorCount: 6 },
    { level: 7, tubeCount: 7, tubeCapacity: 5, colorCount: 6 },
    { level: 8, tubeCount: 8, tubeCapacity: 4, colorCount: 7 },
    { level: 9, tubeCount: 9, tubeCapacity: 4, colorCount: 8 },
    { level: 10, tubeCount: 9, tubeCapacity: 5, colorCount: 8 },
  ];
  return configs[Math.min(level - 1, configs.length - 1)];
}

/* ============ 生成关卡 ============ */
function generateLevel(config: LevelConfig, seed: number): Tube[] {
  const rng = seededRandom(seed);
  const { tubeCount, tubeCapacity, colorCount } = config;

  // 每种颜色的螺栓数量 = tubeCapacity（填满一个管子）
  const allBolts: number[] = [];
  for (let c = 0; c < colorCount; c++) {
    for (let i = 0; i < tubeCapacity; i++) {
      allBolts.push(c);
    }
  }

  // 洗牌
  for (let i = allBolts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [allBolts[i], allBolts[j]] = [allBolts[j], allBolts[i]];
  }

  // 分配到管子
  const tubes: Tube[] = [];
  let boltIdx = 0;
  const filledTubes = colorCount; // 填满的管子数 = 颜色数
  for (let t = 0; t < filledTubes; t++) {
    const bolts: number[] = [];
    for (let i = 0; i < tubeCapacity; i++) {
      bolts.push(allBolts[boltIdx++]);
    }
    tubes.push({ id: t, bolts, capacity: tubeCapacity });
  }
  // 空管子
  const emptyTubes = tubeCount - filledTubes;
  for (let t = 0; t < emptyTubes; t++) {
    tubes.push({ id: filledTubes + t, bolts: [], capacity: tubeCapacity });
  }

  // 再次洗牌管子顺序
  for (let i = tubes.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [tubes[i], tubes[j]] = [tubes[j], tubes[i]];
  }
  // 重新分配 id
  tubes.forEach((t, i) => (t.id = i));

  // 确保不是已经排好的状态
  if (isSorted(tubes)) {
    // 交换前两个管子的第一个螺栓
    if (tubes[0].bolts.length > 0 && tubes[1].bolts.length > 0) {
      const tmp = tubes[0].bolts[0];
      tubes[0].bolts[0] = tubes[1].bolts[0];
      tubes[1].bolts[0] = tmp;
    }
  }

  return tubes;
}

function isSorted(tubes: Tube[]): boolean {
  return tubes.every(
    (tube) =>
      tube.bolts.length === 0 ||
      (tube.bolts.length === tube.capacity &&
        tube.bolts.every((b) => b === tube.bolts[0])),
  );
}

function canMove(from: Tube, to: Tube): boolean {
  if (from.bolts.length === 0) return false;
  if (from.id === to.id) return false;
  if (to.bolts.length >= to.capacity) return false;
  if (to.bolts.length === 0) return true;
  // 只能放在同色螺栓上
  return from.bolts[from.bolts.length - 1] === to.bolts[to.bolts.length - 1];
}

function moveBolt(from: Tube, to: Tube): void {
  const bolt = from.bolts.pop()!;
  to.bolts.push(bolt);
}

/* ============ 组件 ============ */

export default function BoltSortPage() {
  const [mounted, setMounted] = useState(false);
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState<Tube[]>([]);
  const [selectedTube, setSelectedTube] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [best, setBest] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [dailyMode, setDailyMode] = useState(false);
  const [score, setScore] = useState(0);

  const tubesRef = useRef<Tube[]>([]);
  const levelRef = useRef(1);
  const movesRef = useRef(0);
  const completedRef = useRef<number[]>([]);
  const startTimeRef = useRef(0);
  const scoreRef = useRef(0);
  const submittedRef = useRef(false);
  const overRef = useRef(false);
  const bestRef = useRef(0);
  const dailyModeRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningRef = useRef(false);

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
    // 读取已通关记录
    try {
      const comp = JSON.parse(localStorage.getItem("gm_bolt_sort_completed") || "[]");
      if (Array.isArray(comp)) {
        completedRef.current = comp;
        setCompleted(comp);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ----- 开始关卡 ----- */
  const startLevel = useCallback((lvl: number, daily: boolean) => {
    const config = getLevelConfig(lvl);
    const seed = daily ? getTodaySeed() + lvl * 1000 : Date.now() + lvl * 1000;
    const newTubes = generateLevel(config, seed);
    tubesRef.current = newTubes;
    levelRef.current = lvl;
    movesRef.current = 0;
    overRef.current = false;
    submittedRef.current = false;
    dailyModeRef.current = daily;
    setTubes(newTubes.map((t) => ({ ...t, bolts: [...t.bolts] })));
    setLevel(lvl);
    setMoves(0);
    setSelectedTube(null);
    setOver(false);
    setResult(null);
    setLevelComplete(false);
    setDailyMode(daily);
    setStartTime(Date.now());
    startTimeRef.current = Date.now();
    setElapsed(0);
    runningRef.current = true;
    setRunning(true);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const el = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(el);
    }, 100);
  }, []);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    startLevel(1, false);
  }, [startLevel]);

  /* ----- 下一关 ----- */
  const nextLevel = useCallback(() => {
    const nextLvl = Math.min(levelRef.current + 1, MAX_LEVEL);
    // 计算当前关分数
    const timeBonus = Math.max(0, Math.floor(100 - elapsed));
    const moveBonus = Math.max(0, Math.floor(50 - movesRef.current * 2));
    const levelScore = 100 + timeBonus + moveBonus;
    scoreRef.current += levelScore;
    setScore(scoreRef.current);

    // 标记通关
    if (!dailyModeRef.current && !completedRef.current.includes(levelRef.current)) {
      completedRef.current = [...completedRef.current, levelRef.current];
      setCompleted(completedRef.current);
      try {
        localStorage.setItem("gm_bolt_sort_completed", JSON.stringify(completedRef.current));
      } catch {
        /* ignore */
      }
    }

    if (levelRef.current >= MAX_LEVEL) {
      // 全部通关
      doGameOver(true);
    } else {
      startLevel(nextLvl, dailyModeRef.current);
    }
  }, [elapsed, startLevel]);

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback((victory: boolean) => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    setOver(true);
    setRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finalScore = scoreRef.current + (victory ? 500 : 0);
    scoreRef.current = finalScore;
    setScore(finalScore);
    const r = submitScore(GAME_ID, finalScore, `第${levelRef.current}关 ${finalScore}分${victory ? " (通关)" : ""}`);
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

  /* ----- 点击管子 ----- */
  const onTubeClick = useCallback((tubeId: number) => {
    if (!runningRef.current || overRef.current || levelComplete) return;

    if (selectedTube === null) {
      // 选择源管子（必须有螺栓）
      const tube = tubesRef.current.find((t) => t.id === tubeId);
      if (!tube || tube.bolts.length === 0) return;
      setSelectedTube(tubeId);
    } else if (selectedTube === tubeId) {
      // 取消选择
      setSelectedTube(null);
    } else {
      // 尝试移动
      const from = tubesRef.current.find((t) => t.id === selectedTube)!;
      const to = tubesRef.current.find((t) => t.id === tubeId)!;
      if (canMove(from, to)) {
        moveBolt(from, to);
        movesRef.current++;
        setMoves(movesRef.current);
        setTubes(tubesRef.current.map((t) => ({ ...t, bolts: [...t.bolts] })));
        setSelectedTube(null);

        // 检查是否完成
        if (isSorted(tubesRef.current)) {
          setLevelComplete(true);
          runningRef.current = false;
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
      } else {
        // 不能移动，切换选择
        const tube = tubesRef.current.find((t) => t.id === tubeId);
        if (tube && tube.bolts.length > 0) {
          setSelectedTube(tubeId);
        } else {
          setSelectedTube(null);
        }
      }
    }
  }, [selectedTube, levelComplete]);

  /* ----- 重置当前关卡 ----- */
  const resetLevel = useCallback(() => {
    startLevel(levelRef.current, dailyModeRef.current);
  }, [startLevel]);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    start();
  }, [start]);

  /* ----- 每日挑战 ----- */
  const startDaily = useCallback(() => {
    scoreRef.current = 0;
    setScore(0);
    startLevel(1, true);
  }, [startLevel]);

  /* ----- 选择关卡 ----- */
  const selectLevel = useCallback((lvl: number) => {
    scoreRef.current = 0;
    setScore(0);
    startLevel(lvl, false);
  }, [startLevel]);

  /* ----- 清理 ----- */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const config = getLevelConfig(level);
  const stats: GameStat[] = [
    { label: "当前关卡", value: `${level}/${MAX_LEVEL}` },
    { label: "步数", value: moves },
    { label: "用时", value: `${elapsed.toFixed(1)}s` },
    { label: "最高记录", value: best },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="螺丝分拣"
        description="将彩色螺丝按颜色分拣到管子中！点击管子选择，再点击目标管子移动。同色螺丝才能叠放，将所有螺丝按颜色排好即可过关！"
        instructions={`玩法：
  1. 点击一个管子选中它（会高亮显示）
  2. 再点击另一个管子，将顶部螺丝移动过去
  3. 螺丝只能放在空管子或同色螺丝上方
  4. 当所有管子内的螺丝都是同色（或空）时通关

10个关卡，难度递增：
  管子数量和颜色种类逐渐增加
  每关有步数和时间奖励分

每日挑战：
  使用固定种子生成关卡，每天一题，可与好友对比

计分：
  每关基础100分 + 时间奖励 + 步数奖励
  通关额外500分奖励`}
        icon={Wrench}
        iconEmoji="🔩"
        iconGradient="from-zinc-400 to-slate-600"
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
      title="螺丝分拣"
      description="将彩色螺丝按颜色分拣到管子中！点击管子选择，再点击目标管子移动。同色螺丝才能叠放，将所有螺丝按颜色排好即可过关！"
      instructions={`玩法：
  1. 点击一个管子选中它（会高亮显示）
  2. 再点击另一个管子，将顶部螺丝移动过去
  3. 螺丝只能放在空管子或同色螺丝上方
  4. 当所有管子内的螺丝都是同色（或空）时通关

10个关卡，难度递增：
  管子数量和颜色种类逐渐增加
  每关有步数和时间奖励分

每日挑战：
  使用固定种子生成关卡，每天一题，可与好友对比

计分：
  每关基础100分 + 时间奖励 + 步数奖励
  通关额外500分奖励`}
      icon={Wrench}
      iconEmoji="🔩"
      iconGradient="from-zinc-400 to-slate-600"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center gap-4">
        {/* 顶部信息 */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">关卡</span>
              <div className="text-lg font-bold text-white">
                {level}/{MAX_LEVEL}
              </div>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">步数</span>
              <div className="text-lg font-bold text-zinc-300 tabular-nums">{moves}</div>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">用时</span>
              <div className="text-lg font-bold text-zinc-300 tabular-nums">
                {elapsed.toFixed(1)}s
              </div>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">总分</span>
              <div className="text-lg font-bold text-amber-400 tabular-nums">{score}</div>
            </div>
          </div>
          {dailyMode && (
            <div className="bg-purple-600/20 border border-purple-600/50 rounded-lg px-3 py-2 text-xs text-purple-300 font-medium">
              每日挑战
            </div>
          )}
        </div>

        {/* 游戏区域 */}
        <div className="relative w-full max-w-2xl">
          <div className="relative bg-gradient-to-b from-zinc-900/50 to-[#0a0a0b] border border-[#27272a] rounded-xl p-6 overflow-hidden min-h-[400px]">
            {/* 管子排列 */}
            <div className="flex items-end justify-center gap-3 flex-wrap">
              {tubes.map((tube) => {
                const isSelected = selectedTube === tube.id;
                const isFull = tube.bolts.length === tube.capacity;
                const isComplete = isFull && tube.bolts.every((b) => b === tube.bolts[0]);
                return (
                  <button
                    key={tube.id}
                    onClick={() => onTubeClick(tube.id)}
                    className={`relative flex flex-col-reverse items-center transition-all active:scale-95 ${
                      isSelected ? "scale-105" : ""
                    }`}
                  >
                    {/* 管子容器 */}
                    <div
                      className={`relative w-12 rounded-b-lg rounded-t-md border-2 transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20"
                          : isComplete
                            ? "border-green-500/50 bg-green-500/5"
                            : "border-zinc-600 bg-zinc-800/30"
                      }`}
                      style={{ height: config.tubeCapacity * 28 + 16, paddingTop: 4, paddingBottom: 4 }}
                    >
                      {/* 螺栓 */}
                      <div className="flex flex-col-reverse items-center gap-1">
                        {tube.bolts.map((bolt, idx) => {
                          const color = BOLT_COLORS[bolt];
                          const isTop = idx === tube.bolts.length - 1;
                          return (
                            <div
                              key={idx}
                              className="relative rounded-full transition-all"
                              style={{
                                width: 32,
                                height: 22,
                                background: `linear-gradient(180deg, ${color.bg}, ${color.bg}dd)`,
                                boxShadow: isTop
                                  ? `0 0 8px ${color.glow}, inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.3)`
                                  : `inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.3)`,
                                border: "1px solid rgba(0,0,0,0.2)",
                              }}
                            >
                              {/* 螺丝十字纹 */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                  className="absolute bg-black/20"
                                  style={{ width: 20, height: 1.5 }}
                                />
                                <div
                                  className="absolute bg-black/20"
                                  style={{ width: 1.5, height: 14 }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 管口 */}
                      <div
                        className={`absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full ${
                          isSelected ? "bg-amber-400" : "bg-zinc-600"
                        }`}
                      />

                      {/* 完成标记 */}
                      {isComplete && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-green-400 text-sm">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* 选中指示器 */}
                    {isSelected && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-amber-400 text-xs font-bold">
                        ▲
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 关卡完成覆盖层 */}
            {levelComplete && !over && (
              <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-overlay-in">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold mb-2 text-green-400">关卡完成！</h3>
                <p className="text-sm text-slate-400 mb-1">
                  第 {level} 关 · {moves} 步 · {elapsed.toFixed(1)}秒
                </p>
                {(() => {
                  const timeBonus = Math.max(0, Math.floor(100 - elapsed));
                  const moveBonus = Math.max(0, Math.floor(50 - moves * 2));
                  return (
                    <p className="text-xs text-slate-500 mb-4">
                      基础100 + 时间{timeBonus} + 步数{moveBonus} = {100 + timeBonus + moveBonus}分
                    </p>
                  );
                })()}
                {level >= MAX_LEVEL ? (
                  <button
                    onClick={() => doGameOver(true)}
                    className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors shadow-lg shadow-green-500/30"
                  >
                    查看最终成绩 🏆
                  </button>
                ) : (
                  <button
                    onClick={nextLevel}
                    className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors shadow-lg shadow-green-500/30"
                  >
                    下一关 <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* 待开始覆盖层 */}
            {!running && !over && !levelComplete && (
              <div className="absolute inset-0 bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in z-30">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <button
                    onClick={start}
                    className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-zinc-600 hover:bg-zinc-700 rounded-xl transition-colors shadow-lg shadow-zinc-500/30"
                  >
                    <Play className="w-5 h-5" /> 从第1关开始
                  </button>
                  <button
                    onClick={startDaily}
                    className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-purple-300 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition-colors border border-purple-600/50"
                  >
                    <Clock className="w-4 h-4" /> 每日挑战
                  </button>
                </div>

                {/* 关卡选择 */}
                <div className="mt-4">
                  <div className="text-xs text-slate-500 mb-2 text-center">选择关卡</div>
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => {
                      const isCompleted = completed.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          onClick={() => selectLevel(lvl)}
                          className={`w-10 h-10 rounded-lg text-sm font-bold transition-all active:scale-95 border ${
                            isCompleted
                              ? "bg-green-600/20 border-green-600/50 text-green-400"
                              : "bg-[#18181b] border-[#3f3f46] text-slate-300 hover:border-zinc-500"
                          }`}
                        >
                          {isCompleted ? "✓" : lvl}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 游戏结束覆盖层 */}
            {over && (
              <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in z-40">
                <div className="text-5xl mb-3">
                  {level >= MAX_LEVEL && !dailyMode ? "🏆" : "🔩"}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {level >= MAX_LEVEL && !dailyMode ? "全部通关！" : "游戏结束"}
                </h3>
                <p className="text-sm text-slate-400 mb-1">最终得分</p>
                <p className="text-4xl font-bold text-zinc-300 mb-1">{score}</p>
                <p className="text-xs text-slate-500 mb-3">
                  {score >= best && score > 0 ? "新纪录！" : `最高记录: ${best}`}
                </p>
                {result && (
                  <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                    排名第 <span className="text-zinc-300 font-bold">{result.rank}</span>/{result.total}
                    ，超越了 <span className="text-zinc-300 font-bold">{result.beatPercent}%</span> 的玩家
                  </p>
                )}
                <button
                  onClick={restart}
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 rounded-xl transition-colors shadow-lg shadow-zinc-500/30"
                >
                  <RotateCcw className="w-4 h-4" /> 重新开始
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {running && !over && !levelComplete && (
            <>
              <button
                onClick={resetLevel}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
              >
                <RotateCcw className="w-4 h-4" /> 重置本关
              </button>
              {selectedTube !== null && (
                <button
                  onClick={() => setSelectedTube(null)}
                  className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-amber-300 bg-amber-600/20 hover:bg-amber-600/30 rounded-xl transition-colors border border-amber-600/50"
                >
                  取消选择
                </button>
              )}
            </>
          )}
          {!running && !over && !levelComplete && (
            <>
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 rounded-xl transition-colors shadow-lg shadow-zinc-500/30"
              >
                <Play className="w-4 h-4" /> 开始
              </button>
              <button
                onClick={startDaily}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-purple-300 bg-purple-600/20 hover:bg-purple-600/30 rounded-xl transition-colors border border-purple-600/50"
              >
                <Clock className="w-4 h-4" /> 每日挑战
              </button>
            </>
          )}
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
          >
            <RotateCcw className="w-4 h-4" /> 从头开始
          </button>
        </div>

        {/* 提示信息 */}
        {running && !over && !levelComplete && (
          <div className="text-xs text-slate-500 text-center max-w-md">
            {selectedTube !== null
              ? "已选中管子，点击目标管子移动顶部螺丝（同色或空管可放置）"
              : "点击一个含有螺丝的管子开始选择"}
          </div>
        )}
      </div>
    </GameShell>
  );
}
