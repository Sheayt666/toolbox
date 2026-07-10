"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Activity, Plus, Trash2 } from "lucide-react";

interface BPRecord {
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
  pulse: number;
}

function classifyBP(sys: number, dia: number) {
  if (sys < 90 || dia < 60) return { cat: "偏低", color: "text-sky-400" };
  if (sys < 120 && dia < 80) return { cat: "理想", color: "text-emerald-400" };
  if (sys < 130 && dia < 85) return { cat: "正常", color: "text-emerald-400" };
  if (sys < 140 && dia < 90) return { cat: "正常高值", color: "text-amber-400" };
  if (sys < 160 && dia < 100) return { cat: "1级高血压", color: "text-orange-400" };
  if (sys < 180 && dia < 110) return { cat: "2级高血压", color: "text-rose-400" };
  return { cat: "3级高血压", color: "text-rose-400" };
}

export default function BloodPressureChartPage() {
  const [records, setRecords] = useState<BPRecord[]>([]);
  const [form, setForm] = useState({ systolic: 120, diastolic: 80, pulse: 72 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bp-records");
    if (saved) setRecords(JSON.parse(saved));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("bp-records", JSON.stringify(records)); }, [records, hydrated]);

  const addRecord = () => {
    const now = new Date();
    setRecords([{ date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5), ...form }, ...records]);
  };
  const removeRecord = (i: number) => setRecords(records.filter((_, idx) => idx !== i));

  const stats = useMemo(() => {
    if (records.length === 0) return null;
    const avgSys = records.reduce((s, r) => s + r.systolic, 0) / records.length;
    const avgDia = records.reduce((s, r) => s + r.diastolic, 0) / records.length;
    const avgPulse = records.reduce((s, r) => s + r.pulse, 0) / records.length;
    return { avgSys: Math.round(avgSys), avgDia: Math.round(avgDia), avgPulse: Math.round(avgPulse) };
  }, [records]);

  const maxSys = records.length > 0 ? Math.max(...records.map((r) => r.systolic)) : 120;

  return (
    <ToolLayout title="血压记录图表" description="记录每日血压数据，生成趋势图表辅助监测" toolId="blood-pressure-chart" icon={Activity} category="健康医疗" slug="blood-pressure-chart">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">收缩压</label><input type="number" value={form.systolic} onChange={(e) => setForm({ ...form, systolic: +e.target.value })} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">舒张压</label><input type="number" value={form.diastolic} onChange={(e) => setForm({ ...form, diastolic: +e.target.value })} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">脉搏</label><input type="number" value={form.pulse} onChange={(e) => setForm({ ...form, pulse: +e.target.value })} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div className="flex items-end"><button onClick={addRecord} className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm h-[42px]"><Plus className="w-4 h-4" />记录</button></div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均收缩压</div><div className="text-xl font-bold text-white">{stats.avgSys}</div></div>
            <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均舒张压</div><div className="text-xl font-bold text-sky-400">{stats.avgDia}</div></div>
            <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均脉搏</div><div className="text-xl font-bold text-rose-400">{stats.avgPulse}</div></div>
          </div>
        )}

        {records.length > 0 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">收缩压趋势</h3>
            <div className="flex items-end gap-1 h-32">
              {records.slice(0, 20).reverse().map((r, i) => {
                const cat = classifyBP(r.systolic, r.diastolic);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-[10px] ${cat.color}`}>{r.systolic}</span>
                    <div className="w-full bg-[#0d0d0f] rounded-t flex items-end" style={{ height: "80px" }}>
                      <div className={`w-full rounded-t ${cat.color.includes("rose") ? "bg-rose-500" : cat.color.includes("orange") ? "bg-orange-500" : cat.color.includes("amber") ? "bg-amber-500" : "bg-emerald-500"}`} style={{ height: `${(r.systolic / maxSys) * 100}%` }} />
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
                const cat = classifyBP(r.systolic, r.diastolic);
                return (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-300">{r.date} {r.time}</span>
                      <span className="text-xs text-slate-500">{r.systolic}/{r.diastolic} mmHg · {r.pulse}bpm</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs ${cat.color}`}>{cat.cat}</span>
                      <button onClick={() => removeRecord(i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
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
