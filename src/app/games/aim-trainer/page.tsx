"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Crosshair, RotateCcw, Trophy, Flame } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "aim-trainer";
const GAME_DURATION = 30;
const TARGET_SIZE = 80;
const TARGET_LIFETIME = 1500;
const BEST_KEY = "toolbox_aim_best";

type Phase = "ready" | "playing" | "over";

interface TargetData {
  id: number;
  x: number;
  y: number;
}

interface BurstEffect {
  id: number;
  x: number;
  y: number;
  type: "hit" | "miss";
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
  hits: number;
  misses: number;
  accuracy: number;
  avgReaction: number;
  bestReaction: number;
  maxCombo: number;
  score: number;
  isNewBest: boolean;
}

export default function AimTrainerPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("ready");
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [target, setTarget] = useState<TargetData | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bursts, setBursts] = useState<BurstEffect[]>([]);

  const arenaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const targetSpawnTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstIdRef = useRef(0);

  // 用 ref 防止 endGame 闭包过期（修复旧代码中 hits 始终为 0 的 bug）
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const submittedRef = useRef(false);

  useEffect(() => {
    try {
      const b = localStorage.getItem(BEST_KEY);
      if (b) setBestScore(parseInt(b, 10) || 0);
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  const addBurst = useCallback((x: number, y: number, type: "hit" | "miss") => {
    const id = ++burstIdRef.current;
    setBursts((prev) => [...prev, { id, x, y, type }]);
    window.setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 600);
  }, []);

  const spawnTarget = useCallback(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const maxX = rect.width - TARGET_SIZE - 8;
    const maxY = rect.height - TARGET_SIZE - 8;
    const x = Math.max(4, Math.random() * maxX);
    const y = Math.max(4, Math.random() * maxY);
    targetIdRef.current++;
    targetSpawnTimeRef.current = Date.now();
    setTarget({ id: targetIdRef.current, x, y });

    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    autoHideRef.current = setTimeout(() => {
      missesRef.current += 1;
      setMisses(missesRef.current);
      comboRef.current = 0;
      setCombo(0);
      spawnTarget();
    }, TARGET_LIFETIME);
  }, []);

  const endGame = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setPhase("over");
    setTarget(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoHideRef.current) {
      clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    }

    const h = hitsRef.current;
    const m = missesRef.current;
    const rt = reactionTimesRef.current;
    const totalShots = h + m;
    const accuracy = totalShots > 0 ? Math.round((h / totalShots) * 100) : 0;
    const avgReaction =
      rt.length > 0 ? Math.round(rt.reduce((a, b) => a + b, 0) / rt.length) : 0;
    const bestReaction = rt.length > 0 ? Math.min(...rt) : 0;
    const score = h;
    const r = submitScore(GAME_ID, score, `命中 ${h} 次`);
    const isNewBest = score > bestScore;
    if (isNewBest) {
      setBestScore(score);
      try {
        localStorage.setItem(BEST_KEY, String(score));
      } catch {
        /* ignore */
      }
    }
    setResult({
      ...r,
      hits: h,
      misses: m,
      accuracy,
      avgReaction,
      bestReaction,
      maxCombo: maxComboRef.current,
      score,
      isNewBest,
    });
    setRefreshKey((k) => k + 1);
  }, [bestScore]);

  // P 键暂停/继续
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") {
          setPaused((p) => {
            if (!p) {
              // 暂停时清除自动隐藏计时器
              if (autoHideRef.current) { clearTimeout(autoHideRef.current); autoHideRef.current = null; }
              if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
            } else {
              // 恢复时重启倒计时
              timerRef.current = setInterval(() => {
                setTimeLeft((t) => {
                  if (t <= 1) { endGame(); return 0; }
                  return t - 1;
                });
              }, 1000);
              // 重启目标自动隐藏
              if (target) {
                autoHideRef.current = setTimeout(() => {
                  missesRef.current += 1;
                  setMisses(missesRef.current);
                  comboRef.current = 0;
                  setCombo(0);
                  spawnTarget();
                }, TARGET_LIFETIME);
              }
            }
            return !p;
          });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, target, endGame, spawnTarget]);

  const startGame = useCallback(() => {
    submittedRef.current = false;
    hitsRef.current = 0;
    missesRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    reactionTimesRef.current = [];
    setHits(0);
    setMisses(0);
    setCombo(0);
    setMaxCombo(0);
    setBursts([]);
    setResult(null);
    setPaused(false);
    setTimeLeft(GAME_DURATION);
    setPhase("playing");
    // 等待下一帧让 arena 渲染
    window.setTimeout(() => spawnTarget(), 50);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [spawnTarget, endGame]);

  const handleHit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!target || paused) return;
    const reactionTime = Date.now() - targetSpawnTimeRef.current;
    reactionTimesRef.current.push(reactionTime);
    hitsRef.current += 1;
    setHits(hitsRef.current);
    comboRef.current += 1;
    if (comboRef.current > maxComboRef.current) {
      maxComboRef.current = comboRef.current;
      setMaxCombo(maxComboRef.current);
    }
    setCombo(comboRef.current);

    // 爆炸效果在目标中心
    addBurst(target.x + TARGET_SIZE / 2, target.y + TARGET_SIZE / 2, "hit");

    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    spawnTarget();
  };

  const handleMiss = (e: React.MouseEvent) => {
    if (phase !== "playing" || paused) return;
    missesRef.current += 1;
    setMisses(missesRef.current);
    comboRef.current = 0;
    setCombo(0);

    // 涟漪效果在点击位置
    const rect = arenaRef.current?.getBoundingClientRect();
    if (rect) {
      addBurst(e.clientX - rect.left, e.clientY - rect.top, "miss");
    }
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    },
    [],
  );

  const totalShots = hits + misses;
  const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;

  const stats: GameStat[] =
    phase === "ready"
      ? []
      : [
          { label: "剩余时间", value: `${timeLeft}s` },
          { label: "命中", value: hits },
          { label: "命中率", value: `${accuracy}%` },
          { label: "连击", value: combo },
        ];

  const timePercent = (timeLeft / GAME_DURATION) * 100;

  // === 加载状态 ===
  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="瞄准训练器"
        description="30 秒倒计时，随机位置出现圆形目标。点击目标得分，目标会在 1.5 秒后自动消失。统计命中数、命中率与反应时间。"
        instructions="加载中..."
        icon={Crosshair}
        iconEmoji="🎯"
        iconGradient="from-red-500 to-orange-500"
        stats={[]}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="瞄准训练器"
      description="30 秒倒计时，随机位置出现圆形目标。点击目标得分，目标会在 1.5 秒后自动消失。统计命中数、命中率与反应时间。"
      instructions={`点击"开始训练"启动 30 秒倒计时，圆形目标会在随机位置出现。
尽快点击目标得分，每个目标最多停留 1.5 秒，超时自动消失并计为未命中。
连续命中可累积连击，未命中或超时则连击清零。
游戏结束后，命中数将自动提交到排行榜。`}
      icon={Crosshair}
      iconEmoji="🎯"
      iconGradient="from-red-500 to-orange-500"
      stats={stats}
      shareScore={result?.score ?? 0}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes aim-target-in {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .aim-target-in { animation: aim-target-in 0.2s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes aim-hit-burst {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 1; border-width: 4px; }
          100% { transform: translate(-50%, -50%) scale(3); opacity: 0; border-width: 1px; }
        }
        .aim-hit-burst { animation: aim-hit-burst 0.5s ease-out forwards; }
        @keyframes aim-miss-burst {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        .aim-miss-burst { animation: aim-miss-burst 0.4s ease-out forwards; }
        @keyframes aim-float-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aim-float-in { animation: aim-float-in 0.4s ease-out forwards; }
      `}</style>

      <div className="flex flex-col items-center">
        {/* 进度条（仅游戏中显示） */}
        {phase === "playing" && (
          <div className="w-full h-2 bg-[#27272a] rounded-full mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${timePercent}%`,
                background:
                  timePercent > 33
                    ? "linear-gradient(90deg, #8b5cf6, #c084fc)"
                    : "linear-gradient(90deg, #ef4444, #f59e0b)",
                boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)",
              }}
            />
          </div>
        )}

        {/* 准备界面 */}
        {phase === "ready" && (
          <div className="flex flex-col items-center py-12">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-sm text-slate-400 mb-6 text-center max-w-sm">
              30 秒内尽可能多地命中目标。目标会在 1.5 秒后自动消失，手要快！
            </p>
            {bestScore > 0 && (
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                <Trophy className="w-4 h-4" /> 历史最佳: {bestScore} 命中
              </div>
            )}
            <button
              onClick={startGame}
              aria-label="开始训练"
              className="h-12 px-8 text-base font-bold text-white bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#8b5cf6]/30"
            >
              开始训练
            </button>
          </div>
        )}

        {/* 游戏中 */}
        {phase === "playing" && (
          <div
            ref={arenaRef}
            onClick={handleMiss}
            className="relative w-full min-h-[400px] sm:min-h-[520px] lg:min-h-[580px] bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden mb-4 select-none cursor-crosshair bg-dot"
          >
            {/* 连击显示 */}
            {combo >= 2 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <div
                  key={combo}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-bold animate-scale-in backdrop-blur-sm"
                >
                  <Flame className="w-4 h-4" /> {combo} 连击
                </div>
              </div>
            )}

            {/* 目标 */}
            {target && (
              <button
                key={target.id}
                onClick={handleHit}
                aria-label="点击目标"
                className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] hover:from-[#c084fc] hover:to-[#8b5cf6] transition-transform active:scale-90 shadow-lg shadow-[#8b5cf6]/50 aim-target-in flex items-center justify-center"
                style={{
                  left: `${target.x}px`,
                  top: `${target.y}px`,
                }}
              >
                <span className="w-3 h-3 rounded-full bg-white/90 shadow-sm" />
              </button>
            )}

            {/* 命中/未中特效 */}
            {bursts.map((b) => (
              <div
                key={b.id}
                className={`absolute pointer-events-none rounded-full ${b.type === "hit" ? "aim-hit-burst" : "aim-miss-burst"}`}
                style={{
                  left: `${b.x}px`,
                  top: `${b.y}px`,
                  width: `${b.type === "hit" ? TARGET_SIZE : 30}px`,
                  height: `${b.type === "hit" ? TARGET_SIZE : 30}px`,
                  border: b.type === "hit" ? "3px solid #22c55e" : "2px solid #ef4444",
                  backgroundColor: b.type === "hit" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
                }}
              />
            ))}

            {/* 暂停覆盖层 */}
            {paused && (
              <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="text-5xl mb-3">⏸</div>
                <h3 className="text-xl font-bold mb-2">已暂停</h3>
                <p className="text-sm text-slate-400 mb-4">按 P 键继续游戏</p>
                <button
                  onClick={() => {
                    setPaused(false);
                    timerRef.current = setInterval(() => {
                      setTimeLeft((t) => {
                        if (t <= 1) { endGame(); return 0; }
                        return t - 1;
                      });
                    }, 1000);
                    if (target) {
                      autoHideRef.current = setTimeout(() => {
                        missesRef.current += 1;
                        setMisses(missesRef.current);
                        comboRef.current = 0;
                        setCombo(0);
                        spawnTarget();
                      }, TARGET_LIFETIME);
                    }
                  }}
                  aria-label="继续游戏"
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors active:scale-95"
                >
                  继续
                </button>
              </div>
            )}
          </div>
        )}

        {/* 结果界面 */}
        {phase === "over" && result && (
          <div className="w-full max-w-md aim-float-in">
            <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-center">
              <div className="text-5xl mb-3">
                {result.hits >= 25 ? "🎯" : result.hits >= 15 ? "👍" : "💪"}
              </div>
              <h3 className="text-xl font-bold mb-1">
                {result.hits >= 25
                  ? "神枪手！"
                  : result.hits >= 15
                    ? "不错！"
                    : "继续训练！"}
              </h3>
              {result.isNewBest && (
                <div className="inline-flex items-center gap-1 mt-2 mb-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium animate-scale-in">
                  <Trophy className="w-3 h-3" /> 新纪录！
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">命中</div>
                  <div className="text-2xl font-bold text-emerald-400">{result.hits}</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">命中率</div>
                  <div className="text-2xl font-bold text-[#a78bfa]">{result.accuracy}%</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">平均反应</div>
                  <div className="text-2xl font-bold text-white">{result.avgReaction}ms</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">最高连击</div>
                  <div className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5" />
                    {result.maxCombo}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 mb-4 text-xs text-slate-400 flex-wrap">
                <span>
                  未中 <span className="text-red-400 font-medium">{result.misses}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  最快反应 <span className="text-white font-medium">{result.bestReaction}ms</span>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  排名第 <span className="text-white font-medium">{result.rank}</span>/
                  {result.total}
                </span>
                <span className="text-slate-600">|</span>
                <span>超越 {result.beatPercent}% 玩家</span>
              </div>
              <button
                onClick={startGame}
                aria-label="再来一局"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}
