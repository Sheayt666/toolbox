"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TestTube, Plus, Trash2 } from "lucide-react";

interface BSRecord {
  date: string;
  time: string;
  value: number;
  period: string;
}

function classifyBS(value: number, period: string) {
  const isFasting = period === "空腹";
  if (isFasting) {
    if (value < 3.9) return { cat: "偏低", color: "text-sky-400" };
    if (value < 6.1) return { cat: "正常", color: "text-emerald-400" };
    if (value < 7.0) return { cat: "空腹受损", color: "text-amber-400" };
    return { cat: "糖尿病", color: "text-rose-400" };
  } else {
    if (value < 3.9) return { cat: "偏低", color: "text-sky-400" };
    if (value < 7.8) return { cat: "正常", color: "text-emerald-400" };
    if (value < 11.1) return { cat: "糖耐量受损", color: "text-amber-400" };
    return { cat: "糖尿病", color: "text-rose-400" };
  }
}

export default function BloodSugarTrackerPage() {
  const [records, setRecords] = useState<BSRecord[]>([]);
  const [value, setValue] = useState(5.5);
  const [period, setPeriod] = useState("空腹");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bs-records");
    if (saved) setRecords(JSON.parse(saved));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("bs-records", JSON.stringify(records)); }, [records, hydrated]);

  const addRecord = () => {
    const now = new Date();
    setRecords([{ date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5), value, period }, ...records]);
  };
  const removeRecord = (i: number) => setRecords(records.filter((_, idx) => idx !== i));

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const avg = records.reduce((s, r) => s + r.value, 0) / records.length;
    const max = Math.max(...records.map((r) => r.value));
    const min = Math.min(...records.map((r) => r.value));
    return { avg: avg.toFixed(1), max: max.toFixed(1), min: min.toFixed(1) };
  }, [records]);

  const PERIODS = ["空腹", "餐前", "餐后2小时", "睡前", "随机"];
  const maxVal = records.length > 0 ? Math.max(...records.map((r) => r.value)) : 10;

  return (
    <ToolLayout title="血糖记录追踪" description="记录血糖监测数据，帮助管理血糖健康水平" toolId="blood-sugar-tracker" icon={TestTube} category="健康医疗" slug="blood-sugar-tracker">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">血糖值 (mmol/L)</label><input type="number" step="0.1" value={value} onChange={(e) => setValue(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">测量时段</label><select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">{PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
            <div className="flex items-end"><button onClick={addRecord} className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm h-[42px]"><Plus className="w-4 h-4" />记录</button></div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均血糖</div><div className="text-xl font-bold text-white">{stats.avg}</div></div>
            <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4"><div className="text-xs text-slate-400 mb-1">最高值</div><div className="text-xl font-bold text-rose-400">{stats.max}</div></div>
            <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">最低值</div><div className="text-xl font-bold text-sky-400">{stats.min}</div></div>
          </div>
        )}

        {records.length > 0 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">血糖趋势</h3>
            <div className="flex items-end gap-1 h-32">
              {records.slice(0, 20).reverse().map((r, i) => {
                const cat = classifyBS(r.value, r.period);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-[10px] ${cat.color}`}>{r.value}</span>
                    <div className="w-full bg-[#0d0d0f] rounded-t flex items-end" style={{ height: "80px" }}>
                      <div className={`w-full rounded-t ${cat.color.includes("rose") ? "bg-rose-500" : cat.color.includes("amber") ? "bg-amber-500" : "bg-emerald-500"}`} style={{ height: `${(r.value / maxVal) * 100}%` }} />
                    </div>
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
                const cat = classifyBS(r.value, r.period);
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3"><span className="text-sm text-slate-300">{r.date} {r.time}</span><span className="text-xs text-slate-500">{r.period} · {r.value} mmol/L</span></div>
                    <div className="flex items-center gap-3"><span className={`text-xs ${cat.color}`}>{cat.cat}</span><button onClick={() => removeRecord(i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>
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
