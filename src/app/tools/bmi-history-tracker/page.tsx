"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { LineChart, Plus, Trash2 } from "lucide-react";

interface Record {
  date: string;
  weight: number;
  height: number;
}

export default function BMIHistoryTrackerPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [weight, setWeight] = useState(65);
  const [height, setHeight] = useState(170);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bmi-history");
    if (saved) setRecords(JSON.parse(saved));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("bmi-history", JSON.stringify(records));
  }, [records, hydrated]);

  const addRecord = () => {
    const today = new Date().toISOString().slice(0, 10);
    setRecords([...records, { date: today, weight, height }].sort((a, b) => a.date.localeCompare(b.date)));
  };
  const removeRecord = (i: number) => setRecords(records.filter((_, idx) => idx !== i));

  const data = useMemo(() => {
    return records.map((r) => {
      const h = r.height / 100;
      const bmi = r.weight / (h * h);
      let cat = "正常", color = "text-emerald-400";
      if (bmi < 18.5) { cat = "偏瘦"; color = "text-sky-400"; }
      else if (bmi < 24) { cat = "正常"; color = "text-emerald-400"; }
      else if (bmi < 28) { cat = "偏胖"; color = "text-amber-400"; }
      else { cat = "肥胖"; color = "text-rose-400"; }
      return { ...r, bmi: Math.round(bmi * 10) / 10, cat, color };
    });
  }, [records]);

  const minBMI = data.length > 0 ? Math.min(...data.map((d) => d.bmi)) : 15;
  const maxBMI = data.length > 0 ? Math.max(...data.map((d) => d.bmi)) : 30;

  return (
    <ToolLayout title="BMI变化追踪" description="记录BMI变化历史，以图表展示体重变化趋势" toolId="bmi-history-tracker" icon={LineChart} category="健康医疗" slug="bmi-history-tracker">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">身高 (cm)</label><input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div className="flex items-end"><button onClick={addRecord} className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-1 text-sm h-[42px]"><Plus className="w-4 h-4" />记录</button></div>
          </div>
        </div>

        {data.length > 0 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">BMI趋势图</h3>
            <div className="flex items-end gap-1 h-40">
              {data.map((d, i) => {
                const pct = maxBMI > minBMI ? ((d.bmi - minBMI) / (maxBMI - minBMI)) * 100 : 50;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-[10px] ${d.color}`}>{d.bmi}</span>
                    <div className="w-full bg-[#0d0d0f] rounded-t flex items-end" style={{ height: "100px" }}>
                      <div className="w-full bg-gradient-to-t from-primary-500 to-emerald-500 rounded-t" style={{ height: `${Math.max(10, pct)}%` }} />
                    </div>
                    <span className="text-[9px] text-slate-500">{d.date.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3f3f46]"><h3 className="text-sm font-semibold text-white">历史记录</h3></div>
          {data.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">暂无记录，开始记录您的BMI变化吧</div>
          ) : (
            <div className="divide-y divide-[#3f3f46]">
              {data.slice().reverse().map((d, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-300">{d.date}</span>
                    <span className="text-xs text-slate-500">{d.weight}kg / {d.height}cm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${d.color}`}>{d.bmi}</span>
                    <span className={`text-xs ${d.color}`}>{d.cat}</span>
                    <button onClick={() => removeRecord(records.length - 1 - i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
