"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Zap, RotateCcw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "reaction-test";
const ROUNDS = 5;

type Phase = "idle" | "waiting" | "ready" | "tooSoon" | "done";

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
  avg: number;
  score: number;
}

export default function ReactionTestPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const timesRef = useRef<number[]>([]);
  const submittedRef = useRef(false);

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
    const score = Math.max(0, Math.round(1000 - avg / 10));
    const r = submitScore(GAME_ID, score, `平均 ${avg}ms`);
    setResult({ ...r, avg, score });
    setPhase("done");
    setRefreshKey((k) => k + 1);
  }, []);

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

  const areaStyle: Record<Phase, string> = {
    idle: "bg-[#27272a] hover:bg-[#3f3f46]",
    waiting: "bg-red-500",
    ready: "bg-emerald-500",
    tooSoon: "bg-amber-500",
    done: "bg-[#27272a]",
  };
  const areaText: Record<Phase, string> = {
    idle: "点击开始",
    waiting: "等待变绿…",
    ready: "点击！",
    tooSoon: "太早了！点击重试",
    done: "测试完成",
  };
  const areaSub: Record<Phase, string> = {
    idle: `共 ${ROUNDS} 轮，取平均反应时间`,
    waiting: "看到绿色再点击",
    ready: "现在就点！",
    tooSoon: "别急，等屏幕变绿",
    done: "查看下方结果",
  };

  const avg =
    times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : null;
  const best = times.length > 0 ? Math.min(...times) : null;

  const stats: GameStat[] = [
    { label: "已完成轮次", value: `${times.length}/${ROUNDS}` },
    { label: "本轮反应", value: lastTime !== null ? `${lastTime}ms` : "—" },
    { label: "平均反应", value: avg !== null ? `${avg}ms` : "—" },
    { label: "最佳反应", value: best !== null ? `${best}ms` : "—" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="反应力测试"
      description="测量你的毫秒级反应速度，5 轮取平均值，分数 = 1000 - 平均反应时间/10"
      instructions={`点击下方区域开始，屏幕会先变红，等待随机时间后突然变绿。
看到绿色后立即点击，系统记录你的反应时间（毫秒）。
共 5 轮，取平均反应时间计算最终分数。
如果在变绿之前点击，会提示“太早了！”并重新开始该轮。`}
      icon={Zap}
      stats={stats}
      shareScore={result?.score ?? 0}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <button
          onClick={handleClick}
          className={`w-full max-w-[480px] h-56 sm:h-64 rounded-xl flex flex-col items-center justify-center transition-colors select-none ${areaStyle[phase]}`}
        >
          <span className="text-2xl sm:text-3xl font-bold text-white">
            {areaText[phase]}
          </span>
          <span className="mt-2 text-sm text-white/80">{areaSub[phase]}</span>
          {phase === "waiting" && (
            <span className="mt-1 text-xs text-white/60">耐心等待…</span>
          )}
        </button>

        {/* 轮次记录 */}
        <div className="mt-5 flex items-center gap-2">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border ${
                i < times.length
                  ? "bg-[#8b5cf6]/20 border-[#8b5cf6]/40 text-[#a78bfa]"
                  : "bg-[#27272a] border-[#27272a] text-slate-500"
              }`}
            >
              {i < times.length ? `${times[i]}` : `${i + 1}`}
            </div>
          ))}
        </div>

        {phase === "done" && result && (
          <div className="mt-6 w-full max-w-md rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-lg font-bold mb-3">测试完成</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-500">平均反应</div>
                <div className="text-2xl font-bold text-[#a78bfa]">
                  {result.avg}ms
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">最终分数</div>
                <div className="text-2xl font-bold text-[#a78bfa]">
                  {result.score}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              排名第 {result.rank}/{result.total}，超越了 {result.beatPercent}% 的玩家
            </p>
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 再测一次
            </button>
          </div>
        )}

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
