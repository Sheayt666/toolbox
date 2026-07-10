"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Pill, Plus, Trash2, Check } from "lucide-react";

interface MedItem {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  taken: Record<string, boolean>;
}

export default function MedicineReminderPage() {
  const [meds, setMeds] = useState<MedItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("1片");
  const [newTimes, setNewTimes] = useState("08:00,20:00");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("medicine-reminders");
    if (saved) setMeds(JSON.parse(saved));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) localStorage.setItem("medicine-reminders", JSON.stringify(meds)); }, [meds, hydrated]);

  const today = new Date().toISOString().slice(0, 10);

  const addMed = () => {
    if (!newName) return;
    const times = newTimes.split(",").map((t) => t.trim()).filter(Boolean);
    setMeds([...meds, { id: Date.now().toString(), name: newName, dosage: newDosage, times, taken: {} }]);
    setNewName(""); setNewDosage("1片"); setNewTimes("08:00,20:00");
  };
  const removeMed = (id: string) => setMeds(meds.filter((m) => m.id !== id));
  const toggleTaken = (id: string, time: string) => {
    setMeds(meds.map((m) => {
      if (m.id !== id) return m;
      const key = `${today}-${time}`;
      return { ...m, taken: { ...m.taken, [key]: !m.taken[key] } };
    }));
  };

  return (
    <ToolLayout title="用药提醒" description="设置用药提醒，记录服药历史和用药计划" toolId="medicine-reminder" icon={Pill} category="健康医疗" slug="medicine-reminder">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <h3 className="text-sm font-semibold text-white mb-3">添加药品</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="药品名称" className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            <input type="text" value={newDosage} onChange={(e) => setNewDosage(e.target.value)} placeholder="剂量" className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            <input type="text" value={newTimes} onChange={(e) => setNewTimes(e.target.value)} placeholder="时间(逗号分隔)" className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            <button onClick={addMed} className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-1 text-sm"><Plus className="w-4 h-4" />添加</button>
          </div>
        </div>

        <div className="space-y-4">
          {meds.length === 0 && <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-8 text-center text-sm text-slate-500">暂无药品记录，请添加您的用药计划</div>}
          {meds.map((med) => (
            <div key={med.id} className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center"><Pill className="w-5 h-5 text-primary-400" /></div>
                  <div>
                    <div className="text-sm font-bold text-white">{med.name}</div>
                    <div className="text-xs text-slate-500">每次 {med.dosage}</div>
                  </div>
                </div>
                <button onClick={() => removeMed(med.id)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {med.times.map((t) => {
                  const taken = med.taken[`${today}-${t}`];
                  return (
                    <button key={t} onClick={() => toggleTaken(med.id, t)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${taken ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-[#0d0d0f] border-[#3f3f46] text-slate-400 hover:text-white"}`}>
                      {taken ? <Check className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
                      <span>{t}</span>
                      <span className="text-xs ml-auto">{taken ? "已服" : "未服"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {meds.length > 0 && (
          <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
            <p className="text-sm text-slate-300">今日用药计划：{meds.length} 种药品，共 {meds.reduce((s, m) => s + m.times.length, 0)} 次用药。已服 {meds.reduce((s, m) => s + m.times.filter((t) => m.taken[`${today}-${t}`]).length, 0)} 次。</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
