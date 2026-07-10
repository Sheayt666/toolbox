"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Droplet, Plus, Minus, RotateCcw } from "lucide-react";

export default function WaterIntakeReminderPage() {
  const [weight, setWeight] = useState(65);
  const [intake, setIntake] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("water-intake-today");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === new Date().toISOString().slice(0, 10)) setIntake(data.intake);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("water-intake-today", JSON.stringify({ date: new Date().toISOString().slice(0, 10), intake }));
  }, [intake, hydrated]);

  const goal = useMemo(() => Math.round(weight * 30), [weight]);
  const pct = goal > 0 ? Math.min(100, (intake / goal) * 100) : 0;
  const remaining = Math.max(0, goal - intake);

  const add = (ml: number) => setIntake(Math.max(0, intake + ml));
  const reset = () => setIntake(0);

  const cups = [150, 200, 250, 300, 500];

  return (
    <ToolLayout title="饮水提醒" description="根据体重计算每日饮水量，定时提醒喝水" toolId="water-intake-reminder" icon={Droplet} category="健康医疗" slug="water-intake-reminder">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div className="flex items-end"><div className="w-full bg-[#27272a] rounded-lg border border-[#3f3f46] px-3 py-2.5"><div className="text-xs text-slate-400">每日目标</div><div className="text-lg font-bold text-sky-400">{goal} ml</div></div></div>
        </div>

        <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-6 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#27272a" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#38bdf8" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`} className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplet className="w-8 h-8 text-sky-400 mb-1" />
              <span className="text-2xl font-bold text-white">{pct.toFixed(0)}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-400">{intake} <span className="text-sm text-slate-500">/ {goal} ml</span></div>
          {remaining > 0 ? <div className="text-sm text-slate-400 mt-1">还需 {remaining} ml</div> : <div className="text-sm text-emerald-400 mt-1">已达成今日目标！</div>}
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">快速记录</h3>
          <div className="flex flex-wrap gap-2">
            {cups.map((c) => (
              <button key={c} onClick={() => add(c)} className="flex items-center gap-1 px-4 py-2.5 bg-[#0d0d0f] hover:bg-sky-500/20 border border-[#3f3f46] hover:border-sky-500 text-sky-400 rounded-lg text-sm transition-all"><Plus className="w-4 h-4" />{c}ml</button>
            ))}
            <button onClick={() => add(-100)} className="flex items-center gap-1 px-4 py-2.5 bg-[#0d0d0f] hover:bg-rose-500/20 border border-[#3f3f46] hover:border-rose-500 text-rose-400 rounded-lg text-sm transition-all"><Minus className="w-4 h-4" />100ml</button>
            <button onClick={reset} className="flex items-center gap-1 px-4 py-2.5 bg-[#0d0d0f] hover:bg-[#3f3f46] border border-[#3f3f46] text-slate-400 rounded-lg text-sm transition-all"><RotateCcw className="w-4 h-4" />重置</button>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">建议饮水时间</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["07:00 起床后", "09:00 工作中", "11:30 午饭前", "13:00 午饭后", "15:00 下午茶", "17:00 下班前", "19:00 晚饭后", "21:00 睡前1h"].map((t) => (
              <div key={t} className="bg-[#0d0d0f] rounded-lg px-3 py-2 text-xs text-slate-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-400" />{t}</div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
