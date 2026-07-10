"use client";

import { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Glasses, Play, Pause, RotateCcw } from "lucide-react";

export default function EyeCareTimerPage() {
  const [mode, setMode] = useState<"work" | "break">("work");
  const [running, setRunning] = useState(false);
  const [workTime, setWorkTime] = useState(20 * 60); // 20分钟工作
  const [breakTime, setBreakTime] = useState(20); // 20秒休息
  const [countdown, setCountdown] = useState(workTime);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCountdown((cd) => {
        if (cd <= 1) {
          if (mode === "work") {
            setMode("break");
            return breakTime;
          } else {
            setMode("work");
            setCycle((c) => c + 1);
            return workTime;
          }
        }
        return cd - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, mode, workTime, breakTime]);

  const reset = () => {
    setRunning(false); setMode("work"); setCountdown(workTime); setCycle(0);
  };

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <ToolLayout title="护眼提醒" description="20-20-20护眼法则提醒，保护视力健康" toolId="eye-care-timer" icon={Glasses} category="健康医疗" slug="eye-care-timer">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300"><span className="text-amber-400 font-bold">20-20-20 法则：</span>每使用屏幕20分钟，看向20英尺（约6米）外的物体20秒，可有效缓解眼疲劳。</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">工作时长 (分钟)</label><input type="number" value={workTime / 60} onChange={(e) => { const v = +e.target.value * 60; setWorkTime(v); if (mode === "work") setCountdown(v); }} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">休息时长 (秒)</label><input type="number" value={breakTime} onChange={(e) => { const v = +e.target.value; setBreakTime(v); if (mode === "break") setCountdown(v); }} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className={`rounded-xl border p-8 text-center transition-all ${mode === "work" ? "bg-[#27272a] border-primary-500/30" : "bg-emerald-500/5 border-emerald-500/30"}`}>
          <div className={`text-sm font-medium mb-4 ${mode === "work" ? "text-primary-400" : "text-emerald-400"}`}>
            {mode === "work" ? "工作中..." : "请眺望远处休息！"}
          </div>
          <div className={`text-7xl font-bold mb-2 ${mode === "work" ? "text-white" : "text-emerald-400"}`}>{fmtTime(countdown)}</div>
          <div className="text-sm text-slate-500 mb-6">{mode === "work" ? `工作 ${workTime / 60} 分钟` : `休息 ${breakTime} 秒`}</div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setRunning(!running)} className={`px-6 py-3 text-white rounded-lg flex items-center gap-2 text-sm font-medium ${mode === "work" ? "bg-primary-500 hover:bg-primary-600" : "bg-emerald-500 hover:bg-emerald-600"}`}>
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? "暂停" : "开始"}
            </button>
            <button onClick={reset} className="px-6 py-3 bg-[#3f3f46] hover:bg-[#52525b] text-white rounded-lg flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" />重置</button>
          </div>
          {cycle > 0 && <div className="text-xs text-slate-500 mt-4">已完成 {cycle} 个循环</div>}
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">护眼小贴士</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-start gap-2"><span className="text-emerald-400">1.</span> 保持屏幕与眼睛50-70cm距离</div>
            <div className="flex items-start gap-2"><span className="text-emerald-400">2.</span> 屏幕亮度与周围环境光线一致</div>
            <div className="flex items-start gap-2"><span className="text-emerald-400">3.</span> 多眨眼，保持眼部湿润</div>
            <div className="flex items-start gap-2"><span className="text-emerald-400">4.</span> 适当使用人工泪液缓解干涩</div>
            <div className="flex items-start gap-2"><span className="text-emerald-400">5.</span> 保证充足睡眠，避免在暗处看屏幕</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
