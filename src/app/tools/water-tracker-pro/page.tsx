"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { GlassWater, Plus, Minus, RotateCcw } from "lucide-react";

interface DayRecord {
  date: string;
  intake: number;
  log: { time: string; amount: number }[];
}

export default function WaterTrackerProPage() {
  const [weight, setWeight] = useState(65);
  const [todayRecord, setTodayRecord] = useState<DayRecord>({ date: "", intake: 0, log: [] });
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const saved = localStorage.getItem("water-tracker-pro");
    if (saved) {
      const data: DayRecord[] = JSON.parse(saved);
      setHistory(data);
      const t = data.find((d) => d.date === today);
      if (t) setTodayRecord(t);
      else setTodayRecord({ date: today, intake: 0, log: [] });
    } else {
      setTodayRecord({ date: today, intake: 0, log: [] });
    }
    setHydrated(true);
  }, []);

  const save = (rec: DayRecord) => {
    setTodayRecord(rec);
    const newHistory = [...history.filter((d) => d.date !== rec.date), rec].sort((a, b) => a.date.localeCompare(b.date)).slice(-30);
    setHistory(newHistory);
    localStorage.setItem("water-tracker-pro", JSON.stringify(newHistory));
  };

  const goal = useMemo(() => Math.round(weight * 30), [weight]);
  const pct = goal > 0 ? Math.min(100, (todayRecord.intake / goal) * 100) : 0;

  const addWater = (ml: number) => {
    const time = new Date().toTimeString().slice(0, 5);
    save({ ...todayRecord, intake: Math.max(0, todayRecord.intake + ml), log: ml > 0 ? [...todayRecord.log, { time, amount: ml }] : todayRecord.log.slice(0, -1) });
  };
  const reset = () => save({ date: today, intake: 0, log: [] });

  const cups = [100, 150, 200, 250, 300, 500];
  const weekData = history.slice(-7);

  return (
    <ToolLayout title="饮水记录进阶" description="每日饮水打卡记录，设置目标和提醒通知" toolId="water-tracker-pro" icon={GlassWater} category="生活工具" slug="water-tracker-pro">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div className="flex items-end"><div className="w-full bg-[#27272a] rounded-lg border border-[#3f3f46] px-3 py-2.5"><div className="text-xs text-slate-400">每日目标</div><div className="text-lg font-bold text-sky-400">{goal} ml</div></div></div>
        </div>

        <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-6 text-center">
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="12" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#38bdf8" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50}`} strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`} className="transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <GlassWater className="w-8 h-8 text-sky-400 mb-1" />
              <span className="text-2xl font-bold text-white">{pct.toFixed(0)}%</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-sky-400">{todayRecord.intake} <span className="text-sm text-slate-500">/ {goal} ml</span></div>
          {pct >= 100 ? <div className="text-sm text-emerald-400 mt-1">已达成今日目标！</div> : <div className="text-sm text-slate-400 mt-1">还需 {goal - todayRecord.intake} ml</div>}
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">快速记录</h3>
          <div className="flex flex-wrap gap-2">
            {cups.map((c) => (
              <button key={c} onClick={() => addWater(c)} className="flex items-center gap-1 px-4 py-2.5 bg-[#0d0d0f] hover:bg-sky-500/20 border border-[#3f3f46] hover:border-sky-500 text-sky-400 rounded-lg text-sm transition-all"><Plus className="w-4 h-4" />{c}ml</button>
            ))}
            <button onClick={() => addWater(-100)} className="flex items-center gap-1 px-4 py-2.5 bg-[#0d0d0f] hover:bg-rose-500/20 border border-[#3f3f46] hover:border-rose-500 text-rose-400 rounded-lg text-sm transition-all"><Minus className="w-4 h-4" />100ml</button>
            <button onClick={reset} className="flex items-center gap-1 px-4 py-2.5 bg-[#0d0d0f] hover:bg-[#3f3f46] border border-[#3f3f46] text-slate-400 rounded-lg text-sm transition-all"><RotateCcw className="w-4 h-4" />重置</button>
          </div>
        </div>

        {todayRecord.log.length > 0 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">今日饮水记录</h3>
            <div className="space-y-2">
              {todayRecord.log.map((l, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-slate-300">{l.time}</span>
                  <span className="text-sky-400 ml-auto">+{l.amount} ml</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {weekData.length > 0 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">近7天饮水统计</h3>
            <div className="flex items-end gap-2 h-32">
              {weekData.map((d, i) => {
                const p = goal > 0 ? (d.intake / goal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-sky-400">{d.intake}</span>
                    <div className="w-full bg-[#0d0d0f] rounded-t flex items-end" style={{ height: "80px" }}>
                      <div className="w-full bg-gradient-to-t from-sky-500 to-cyan-400 rounded-t" style={{ height: `${Math.min(100, p)}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-500">{d.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
