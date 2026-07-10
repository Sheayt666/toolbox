"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ruler, Plus, Trash2 } from "lucide-react";

interface Measurement {
  date: string;
  chest: number;
  waist: number;
  hip: number;
  arm: number;
  thigh: number;
}

export default function BodyMeasurementsPage() {
  const [records, setRecords] = useState<Measurement[]>([]);
  const [form, setForm] = useState({ chest: 90, waist: 75, hip: 95, arm: 30, thigh: 55 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("body-measurements");
    if (saved) setRecords(JSON.parse(saved));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("body-measurements", JSON.stringify(records)); }, [records, hydrated]);

  const addRecord = () => {
    const today = new Date().toISOString().slice(0, 10);
    setRecords([...records, { date: today, ...form }].sort((a, b) => a.date.localeCompare(b.date)));
  };
  const removeRecord = (i: number) => setRecords(records.filter((_, idx) => idx !== i));

  const fields: { key: keyof typeof form; label: string; unit: string }[] = [
    { key: "chest", label: "胸围", unit: "cm" },
    { key: "waist", label: "腰围", unit: "cm" },
    { key: "hip", label: "臀围", unit: "cm" },
    { key: "arm", label: "上臂围", unit: "cm" },
    { key: "thigh", label: "大腿围", unit: "cm" },
  ];

  return (
    <ToolLayout title="围度记录" description="记录胸围腰围臀围等身体围度，追踪体型变化" toolId="body-measurements" icon={Ruler} category="健康医疗" slug="body-measurements">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{f.label}</label>
                <input type="number" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: +e.target.value })} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
              </div>
            ))}
            <div className="flex items-end">
              <button onClick={addRecord} className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm h-[42px]"><Plus className="w-4 h-4" />记录</button>
            </div>
          </div>
        </div>

        {records.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {fields.map((f) => {
              const latest = records[records.length - 1][f.key];
              const first = records[0][f.key];
              const diff = latest - first;
              return (
                <div key={f.key} className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
                  <div className="text-xs text-slate-400 mb-1">{f.label}</div>
                  <div className="text-xl font-bold text-white">{latest} <span className="text-xs text-slate-500">cm</span></div>
                  {diff !== 0 && <div className={`text-xs mt-1 ${diff < 0 ? "text-emerald-400" : "text-amber-400"}`}>{diff > 0 ? "+" : ""}{diff.toFixed(1)} cm</div>}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3f3f46]"><h3 className="text-sm font-semibold text-white">历史记录</h3></div>
          {records.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">暂无记录</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0d0d0f] text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">日期</th>
                    {fields.map((f) => <th key={f.key} className="px-3 py-2 text-right">{f.label}</th>)}
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice().reverse().map((r, i) => (
                    <tr key={i} className="border-t border-[#3f3f46]">
                      <td className="px-3 py-2 text-slate-300">{r.date}</td>
                      {fields.map((f) => <td key={f.key} className="px-3 py-2 text-right text-slate-300">{r[f.key]}</td>)}
                      <td className="px-3 py-2"><button onClick={() => removeRecord(records.length - 1 - i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
