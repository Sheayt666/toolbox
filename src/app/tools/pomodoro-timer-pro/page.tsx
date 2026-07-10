"use client";

import { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

export default function PomodoroTimerProPage() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            // Session ended
            if (mode === "work") {
              setCompletedSessions((c) => c + 1);
              setMode("break");
              return breakMinutes * 60;
            } else {
              setMode("work");
              return workMinutes * 60;
            }
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, secondsLeft, mode, workMinutes, breakMinutes]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => { setIsRunning(false); setMode("work"); setSecondsLeft(workMinutes * 60); };
  const handleSetWork = (min: number) => { setWorkMinutes(min); if (mode === "work") setSecondsLeft(min * 60); };
  const handleSetBreak = (min: number) => { setBreakMinutes(min); if (mode === "break") setSecondsLeft(min * 60); };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((mode === "work" ? workMinutes * 60 - secondsLeft : breakMinutes * 60 - secondsLeft) / (mode === "work" ? workMinutes * 60 : breakMinutes * 60)) * 100;

  return (
    <ToolLayout title="番茄钟专业版" description="专业番茄工作法计时器" icon={Timer} category="生活工具" slug="pomodoro-timer-pro">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-center gap-3 mb-6">
            <button onClick={() => { setMode("work"); setSecondsLeft(workMinutes * 60); setIsRunning(false); }} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${mode === "work" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a]"}`}>
              <Brain className="w-4 h-4" /> 专注时间
            </button>
            <button onClick={() => { setMode("break"); setSecondsLeft(breakMinutes * 60); setIsRunning(false); }} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${mode === "break" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a]"}`}>
              <Coffee className="w-4 h-4" /> 休息时间
            </button>
          </div>

          <div className="relative p-8 bg-[#09090b] border border-[#27272a] rounded-2xl text-center mb-6">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="#27272a" strokeWidth="8" />
              <circle cx="100" cy="100" r="90" fill="none" stroke={mode === "work" ? "#ef4444" : "#10b981"} strokeWidth="8" strokeLinecap="round" strokeDasharray={2 * Math.PI * 90} strokeDashoffset={2 * Math.PI * 90 * (1 - progress / 100)} className="transition-all duration-1000" />
            </svg>
            <div className="relative z-10 py-8">
              <div className="text-xs text-slate-500 mb-2">{mode === "work" ? "专注中" : "休息中"}</div>
              <div className={`text-6xl font-bold font-mono ${mode === "work" ? "text-red-400" : "text-emerald-400"}`}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-sm text-slate-500 mt-2">已完成 {completedSessions} 个番茄钟</div>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            {!isRunning ? (
              <button onClick={handleStart} className="flex-1 px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-colors inline-flex items-center justify-center gap-2"><Play className="w-5 h-5" /> 开始</button>
            ) : (
              <button onClick={handlePause} className="flex-1 px-6 py-4 bg-[#09090b] border border-[#27272a] text-white rounded-xl font-bold transition-colors inline-flex items-center justify-center gap-2"><Pause className="w-5 h-5" /> 暂停</button>
            )}
            <button onClick={handleReset} className="px-6 py-4 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl font-medium transition-colors hover:border-[#3f3f46] inline-flex items-center justify-center gap-2"><RotateCcw className="w-5 h-5" /> 重置</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
              <div className="text-sm text-slate-400 mb-2">专注时长（分钟）</div>
              <div className="flex gap-2">
                {[15, 25, 30, 45].map((m) => (
                  <button key={m} onClick={() => handleSetWork(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${workMinutes === m ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-[#18181b] text-slate-400 border border-[#27272a]"}`}>{m}</button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
              <div className="text-sm text-slate-400 mb-2">休息时长（分钟）</div>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((m) => (
                  <button key={m} onClick={() => handleSetBreak(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${breakMinutes === m ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#18181b] text-slate-400 border border-[#27272a]"}`}>{m}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
