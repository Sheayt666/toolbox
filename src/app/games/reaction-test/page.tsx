"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Zap, RotateCcw, Trophy } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "reaction-test";
const ROUNDS = 5;
const BEST_KEY = "toolbox_reaction_best";

type Phase = "idle" | "waiting" | "ready" | "tooSoon" | "done";

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
  avg: number;
  best: number;
  worst: number;
  score: number;
  times: number[];
  isNewBest: boolean;
}

// 根据反应时间返回颜色（快=绿，中=黄，慢=红）
function timeColor(ms: number): string {
  if (ms < 200) return "#22c55e";
  if (ms < 300) return "#84cc16";
  if (ms < 400) return "#eab308";
  if (ms < 500) return "#f59e0b";
  return "#ef4444";
}

export default function ReactionTestPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const timesRef = useRef<number[]>([]);
  const submittedRef = useRef(false);

  // 读取历史最佳
  useEffect(() => {
    try {
      const b = localStorage.getItem(BEST_KEY);
      if (b) setBest(parseInt(b, 10) || null);
    } catch {
      /* ignore */
    }
  }, []);

  const scheduleGreen = useCallback(() => {
    setPhase("waiting");
    const delay = 1200 + Math.random() * 2800; // 1.2s - 4s
    timeoutRef.current = window.setTimeout(() => {
      setPhase("ready");
      startTimeRef.current = performance.now();
    }, delay);
  }, []);

  const finish = useCallback((all: number[]) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
    const bestTime = Math.min(...all);
    const worstTime = Math.max(...all);
    const score = Math.max(0, Math.round(1000 - avg / 10));
    const r = submitScore(GAME_ID, score, `平均 ${avg}ms`);
    const isNewBest = best === null || bestTime < best;
    if (isNewBest) {
      setBest(bestTime);
      try {
        localStorage.setItem(BEST_KEY, String(bestTime));
      } catch {
        /* ignore */
      }
    }
    setResult({
      ...r,
      avg,
      best: bestTime,
      worst: worstTime,
      score,
      times: [...all],
      isNewBest,
    });
    setPhase("done");
    setRefreshKey((k) => k + 1);
  }, [best]);

  const handleClick = () => {
    if (phase === "done") return;

    if (phase === "idle" || phase === "tooSoon") {
      scheduleGreen();
      return;
    }

    if (phase === "waiting") {
      // 提前点击
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setPhase("tooSoon");
      return;
    }

    if (phase === "ready") {
      const t = Math.round(performance.now() - startTimeRef.current);
      const all = [...timesRef.current, t];
      timesRef.current = all;
      setTimes(all);
      setLastTime(t);
      if (all.length >= ROUNDS) {
        finish(all);
      } else {
        // 进入下一轮等待
        scheduleGreen();
      }
    }
  };

  const restart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    submittedRef.current = false;
    timesRef.current = [];
    setTimes([]);
    setLastTime(null);
    setResult(null);
    setPhase("idle");
  };

  // 卸载清理
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // 区域背景色
  const areaBg: Record<Phase, string> = {
    idle: "bg-[#27272a]",
    waiting: "bg-red-500",
    ready: "bg-emerald-500",
    tooSoon: "bg-amber-500",
    done: "bg-[#27272a]",
  };
  const areaText: Record<Phase, string> = {
    idle: "点击开始",
    waiting: "等待变绿…",
    ready: "点击！",
    tooSoon: "太早了！",
    done: "测试完成",
  };
  const areaSub: Record<Phase, string> = {
    idle: `共 ${ROUNDS} 轮，取平均反应时间`,
    waiting: "看到绿色再点击",
    ready: "现在就点！",
    tooSoon: "点击重试该轮",
    done: "查看下方结果",
  };

  const avg =
    times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : null;
  const bestThisGame = times.length > 0 ? Math.min(...times) : null;

  const stats: GameStat[] = [
    { label: "已完成轮次", value: `${times.length}/${ROUNDS}` },
    { label: "本轮反应", value: lastTime !== null ? `${lastTime}ms` : "—" },
    { label: "平均反应", value: avg !== null ? `${avg}ms` : "—" },
    { label: "最佳反应", value: bestThisGame !== null ? `${bestThisGame}ms` : "—" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="反应力测试"
      description="测量你的毫秒级反应速度，5 轮取平均值，分数 = 1000 - 平均反应时间/10"
      instructions={`点击下方区域开始，屏幕会先变红，等待随机时间后突然变绿。
看到绿色后立即点击，系统记录你的反应时间（毫秒）。
共 5 轮，取平均反应时间计算最终分数。
如果在变绿之前点击，会提示"太早了！"并重新开始该轮。`}
      icon={Zap}
      stats={stats}
      shareScore={result?.score ?? 0}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes reaction-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .reaction-pulse { animation: reaction-pulse 0.8s ease-in-out infinite; }
        @keyframes reaction-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .reaction-shake { animation: reaction-shake 0.3s ease-in-out; }
        @keyframes reaction-float-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reaction-float-in { animation: reaction-float-in 0.4s ease-out forwards; }
        @keyframes reaction-bar-grow {
          from { height: 0; }
        }
        .reaction-bar { animation: reaction-bar-grow 0.4s ease-out; }
      `}</style>

      <div className="flex flex-col items-center">
        {/* 反应区域 */}
        <button
          onClick={handleClick}
          className={`w-full max-w-[480px] h-56 sm:h-64 rounded-xl flex flex-col items-center justify-center select-none transition-colors ${areaBg[phase]} ${
            phase === "ready"
              ? "reaction-pulse"
              : phase === "tooSoon"
                ? "reaction-shake"
                : "hover:brightness-110"
          }`}
          style={{
            transitionDuration: phase === "ready" ? "0ms" : "300ms",
          }}
        >
          <span className="text-2xl sm:text-3xl font-bold text-white">
            {areaText[phase]}
          </span>
          <span className="mt-2 text-sm text-white/80">{areaSub[phase]}</span>
          {phase === "waiting" && (
            <span className="mt-1 text-xs text-white/60 animate-pulse">耐心等待…</span>
          )}
          {phase === "ready" && lastTime !== null && (
            <span className="mt-2 text-lg font-bold text-white/90">
              上一轮: {lastTime}ms
            </span>
          )}
        </button>

        {/* 轮次记录 */}
        <div className="mt-5 flex items-center gap-2 flex-wrap justify-center">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${
                i < times.length
                  ? "border-[#8b5cf6]/40 text-white"
                  : "bg-[#27272a] border-[#27272a] text-slate-500"
              }`}
              style={
                i < times.length
                  ? {
                      backgroundColor: `${timeColor(times[i])}25`,
                      borderColor: `${timeColor(times[i])}60`,
                    }
                  : {}
              }
            >
              {i < times.length ? (
                <span style={{ color: timeColor(times[i]) }}>{times[i]}</span>
              ) : (
                `${i + 1}`
              )}
            </div>
          ))}
        </div>

        {/* 结果界面 */}
        {phase === "done" && result && (
          <div className="mt-6 w-full max-w-md reaction-float-in">
            <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-center">
              <div className="text-5xl mb-3">⚡</div>
              <h3 className="text-xl font-bold mb-1">测试完成</h3>
              {result.isNewBest && (
                <div className="inline-flex items-center gap-1 mt-2 mb-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium animate-scale-in">
                  <Trophy className="w-3 h-3" /> 新纪录！
                </div>
              )}

              {/* 反应时间柱状图 */}
              <div className="flex items-end justify-center gap-2 h-24 mb-4 mt-4 px-2">
                {result.times.map((t, i) => {
                  const maxT = Math.max(...result.times, 600);
                  const h = Math.max(10, (t / maxT) * 80);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-xs font-bold" style={{ color: timeColor(t) }}>
                        {t}
                      </span>
                      <div
                        className="w-full rounded-t-md reaction-bar"
                        style={{
                          height: `${h}px`,
                          backgroundColor: timeColor(t),
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">平均</div>
                  <div className="text-xl font-bold text-[#a78bfa]">{result.avg}ms</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">最快</div>
                  <div className="text-xl font-bold text-emerald-400">{result.best}ms</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">最慢</div>
                  <div className="text-xl font-bold text-amber-400">{result.worst}ms</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 mb-4 text-xs text-slate-400 flex-wrap">
                <span>
                  分数 <span className="text-white font-medium">{result.score}</span>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  排名第 <span className="text-white font-medium">{result.rank}</span>/
                  {result.total}
                </span>
                <span className="text-slate-600">|</span>
                <span>超越 {result.beatPercent}% 玩家</span>
                {best !== null && (
                  <>
                    <span className="text-slate-600">|</span>
                    <span>
                      历史最佳 <span className="text-amber-400 font-medium">{best}ms</span>
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再测一次
              </button>
            </div>
          </div>
        )}

        {/* 重新开始按钮 */}
        {phase !== "done" && (
          <button
            onClick={restart}
            className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        )}
      </div>
    </GameShell>
  );
}
