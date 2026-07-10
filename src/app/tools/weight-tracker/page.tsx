"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Scale, Plus, Trash2 } from "lucide-react";

interface WeightRecord {
  date: string;
  weight: number;
  note: string;
}

export default function WeightTrackerPage() {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [weight, setWeight] = useState(65);
  const [note, setNote] = useState("");
  const [goal, setGoal] = useState(60);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("weight-records");
    if (saved) setRecords(JSON.parse(saved));
    const g = localStorage.getItem("weight-goal");
    if (g) setGoal(+g);
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) { localStorage.setItem("weight-records", JSON.stringify(records)); localStorage.setItem("weight-goal", goal.toString()); } }, [records, goal, hydrated]);

  const addRecord = () => {
    const today = new Date().toISOString().slice(0, 10);
    setRecords([...records, { date: today, weight, note }].sort((a, b) => a.date.localeCompare(b.date)));
    setNote("");
  };
  const removeRecord = (i: number) => setRecords(records.filter((_, idx) => idx !== i));

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const latest = records[records.length - 1].weight;
    const first = records[0].weight;
    const change = latest - first;
    const min = Math.min(...records.map((r) => r.weight));
    const max = Math.max(...records.map((r) => r.weight));
    const avg = records.reduce((s, r) => s + r.weight, 0) / records.length;
    const toGoal = latest - goal;
    return { latest, first, change, min, max, avg: avg.toFixed(1), toGoal };
  }, [records, goal]);

  const maxW = records.length > 0 ? Math.max(...records.map((r) => r.weight)) : 100;
  const minW = records.length > 0 ? Math.min(...records.map((r) => r.weight)) : 50;

  return (
    <ToolLayout title="体重记录追踪" description="记录每日体重变化，生成趋势曲线图表" toolId="weight-tracker" icon={Scale} category="生活工具" slug="weight-tracker">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">备注</label><input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="如：运动后称重" className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div className="flex items-end"><button onClick={addRecord} className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-1 text-sm h-[42px]"><Plus className="w-4 h-4" />记录</button></div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">目标体重 (kg)</label>
          <input type="number" step="0.1" value={goal} onChange={(e) => setGoal(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">当前体重</div><div className="text-xl font-bold text-white">{stats.latest} kg</div></div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">总变化</div><div className={`text-xl font-bold ${stats.change <= 0 ? "text-emerald-400" : "text-amber-400"}`}>{stats.change > 0 ? "+" : ""}{stats.change.toFixed(1)} kg</div></div>
            <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">距目标</div><div className={`text-xl font-bold ${stats.toGoal <= 0 ? "text-emerald-400" : "text-amber-400"}`}>{Math.abs(stats.toGoal).toFixed(1)} kg</div></div>
            <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均体重</div><div className="text-xl font-bold text-purple-400">{stats.avg} kg</div></div>
          </div>
        )}

        {records.length > 1 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">体重趋势</h3>
            <div className="flex items-end gap-1 h-40">
              {records.slice(-20).map((r, i, arr) => {
                const pct = maxW > minW ? ((r.weight - minW) / (maxW - minW)) * 100 : 50;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-primary-400">{r.weight}</span>
                    <div className="w-full bg-[#0d0d0f] rounded-t flex items-end" style={{ height: "100px" }}>
                      <div className="w-full bg-gradient-to-t from-primary-500 to-emerald-500 rounded-t" style={{ height: `${Math.max(5, pct)}%` }} />
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
              {records.slice().reverse().map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div><span className="text-sm text-slate-300">{r.date}</span>{r.note && <span className="ml-2 text-xs text-slate-500">{r.note}</span>}</div>
                  <div className="flex items-center gap-3"><span className="text-sm font-bold text-primary-400">{r.weight} kg</span><button onClick={() => removeRecord(records.length - 1 - i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
