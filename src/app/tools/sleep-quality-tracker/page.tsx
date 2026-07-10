"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Moon, Plus, Trash2 } from "lucide-react";

interface SleepRecord {
  date: string;
  bedtime: string;
  wakeTime: string;
  quality: number;
}

export default function SleepQualityTrackerPage() {
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [form, setForm] = useState({ bedtime: "23:00", wakeTime: "07:00", quality: 4 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sleep-records");
    if (saved) setRecords(JSON.parse(saved));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("sleep-records", JSON.stringify(records)); }, [records, hydrated]);

  const addRecord = () => {
    const today = new Date().toISOString().slice(0, 10);
    setRecords([{ date: today, ...form }, ...records]);
  };
  const removeRecord = (i: number) => setRecords(records.filter((_, idx) => idx !== i));

  const calcDuration = (bed: string, wake: string) => {
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 24 * 60;
    return mins / 60;
  };

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const durations = records.map((r) => calcDuration(r.bedtime, r.wakeTime));
    const avgDuration = durations.reduce((s, d) => s + d, 0) / durations.length;
    const avgQuality = records.reduce((s, r) => s + r.quality, 0) / records.length;
    return { avgDuration: avgDuration.toFixed(1), avgQuality: avgQuality.toFixed(1) };
  }, [records]);

  const maxDur = records.length > 0 ? Math.max(...records.map((r) => calcDuration(r.bedtime, r.wakeTime))) : 8;

  return (
    <ToolLayout title="睡眠质量记录" description="记录每日睡眠时间和质量，分析睡眠规律" toolId="sleep-quality-tracker" icon={Moon} category="健康医疗" slug="sleep-quality-tracker">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">入睡时间</label><input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">起床时间</label><input type="time" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">质量(1-5)</label><input type="number" min="1" max="5" value={form.quality} onChange={(e) => setForm({ ...form, quality: +e.target.value })} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div className="flex items-end"><button onClick={addRecord} className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm h-[42px]"><Plus className="w-4 h-4" />记录</button></div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均睡眠时长</div><div className="text-xl font-bold text-purple-400">{stats.avgDuration} 小时</div></div>
            <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均睡眠质量</div><div className="text-xl font-bold text-sky-400">{stats.avgQuality} / 5</div></div>
          </div>
        )}

        {records.length > 0 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">睡眠时长趋势</h3>
            <div className="flex items-end gap-1 h-32">
              {records.slice(0, 14).reverse().map((r, i) => {
                const dur = calcDuration(r.bedtime, r.wakeTime);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-purple-400">{dur.toFixed(1)}</span>
                    <div className="w-full bg-[#0d0d0f] rounded-t flex items-end" style={{ height: "80px" }}>
                      <div className="w-full bg-gradient-to-t from-purple-500 to-sky-500 rounded-t" style={{ height: `${(dur / maxDur) * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-500">{r.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3f3f46]"><h3 className="text-sm font-semibold text-white">历史记录</h3></div>
          {records.length === 0 ? <div className="px-4 py-8 text-center text-sm text-slate-500">暂无记录</div> : (
            <div className="divide-y divide-[#3f3f46]">
              {records.map((r, i) => {
                const dur = calcDuration(r.bedtime, r.wakeTime);
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3"><span className="text-sm text-slate-300">{r.date}</span><span className="text-xs text-slate-500">{r.bedtime} - {r.wakeTime}</span></div>
                    <div className="flex items-center gap-3"><span className="text-sm text-purple-400">{dur.toFixed(1)}h</span><span className="text-xs text-amber-400">{"★".repeat(r.quality)}</span><button onClick={() => removeRecord(i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
