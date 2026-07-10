"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Flower2 } from "lucide-react";

function fmt(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function OvulationCalcPage() {
  const [lastPeriod, setLastPeriod] = useState("2026-06-01");
  const [cycleLength, setCycleLength] = useState(28);

  const result = useMemo(() => {
    const last = new Date(lastPeriod);
    if (isNaN(last.getTime())) return null;
    const ovulation = new Date(last);
    ovulation.setDate(last.getDate() + cycleLength - 14);
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 1);
    const safeBefore = new Date(fertileStart);
    safeBefore.setDate(fertileStart.getDate() - 1);
    const safeAfter = new Date(fertileEnd);
    safeAfter.setDate(fertileEnd.getDate() + 1);
    const nextPeriod = new Date(last);
    nextPeriod.setDate(last.getDate() + cycleLength);

    const cycle = [];
    for (let i = 0; i < cycleLength; i++) {
      const d = new Date(last);
      d.setDate(last.getDate() + i);
      let type = "safe";
      let label = "安全期";
      if (i < 5) { type = "period"; label = "经期"; }
      else if (i >= cycleLength - 14 - 5 && i <= cycleLength - 14 + 1) { type = "fertile"; label = "易孕期"; }
      else if (i === cycleLength - 14) { type = "ovulation"; label = "排卵日"; }
      cycle.push({ day: i + 1, date: fmt(d), type, label });
    }
    return { ovulation, fertileStart, fertileEnd, nextPeriod, cycle };
  }, [lastPeriod, cycleLength]);

  const typeColors: Record<string, string> = { period: "bg-rose-500/30 text-rose-400", fertile: "bg-amber-500/30 text-amber-400", ovulation: "bg-purple-500/40 text-purple-400", safe: "bg-[#0d0d0f] text-slate-400" };

  return (
    <ToolLayout title="排卵期计算器" description="预测排卵期和易孕期，帮助备孕或避孕规划" toolId="ovulation-calc" icon={Flower2} category="健康医疗" slug="ovulation-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">上次月经开始日期</label><input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">月经周期 (天)</label><input type="number" value={cycleLength} onChange={(e) => setCycleLength(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        {result && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-4"><div className="text-xs text-slate-400 mb-1">排卵日</div><div className="text-lg font-bold text-purple-400">{fmt(result.ovulation)}</div></div>
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 p-4"><div className="text-xs text-slate-400 mb-1">易孕期</div><div className="text-sm font-bold text-amber-400">{fmt(result.fertileStart)} ~ {fmt(result.fertileEnd)}</div></div>
              <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4"><div className="text-xs text-slate-400 mb-1">下次月经</div><div className="text-lg font-bold text-rose-400">{fmt(result.nextPeriod)}</div></div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">距排卵日</div><div className="text-lg font-bold text-emerald-400">{Math.ceil((result.ovulation.getTime() - new Date().getTime()) / 86400000)} 天</div></div>
            </div>

            <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">周期日历</h3>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
                {result.cycle.map((c) => (
                  <div key={c.day} className={`rounded-lg p-2 text-center text-xs ${typeColors[c.type]}`}>
                    <div className="font-bold">{c.day}</div>
                    <div className="text-[9px] mt-0.5">{c.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 mt-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500/30" /> 经期</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/30" /> 易孕期</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500/40" /> 排卵日</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#0d0d0f] border border-[#3f3f46]" /> 安全期</span>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
