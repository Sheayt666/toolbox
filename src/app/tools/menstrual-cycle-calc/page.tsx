"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CalendarHeart } from "lucide-react";

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MenstrualCycleCalcPage() {
  const [lastPeriod, setLastPeriod] = useState("2026-06-01");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  const result = useMemo(() => {
    const last = new Date(lastPeriod);
    if (isNaN(last.getTime())) return null;

    const nextPeriod = new Date(last);
    nextPeriod.setDate(last.getDate() + cycleLength);

    const ovulation = new Date(last);
    ovulation.setDate(last.getDate() + cycleLength - 14);

    // 易孕期: 排卵日前5天到后4天
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(ovulation.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(ovulation.getDate() + 4);

    const periodEnd = new Date(last);
    periodEnd.setDate(last.getDate() + periodLength - 1);

    // 未来3个月经期
    const futurePeriods: Date[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(last);
      d.setDate(last.getDate() + cycleLength * i);
      futurePeriods.push(d);
    }

    return { nextPeriod, ovulation, fertileStart, fertileEnd, periodEnd, futurePeriods };
  }, [lastPeriod, cycleLength, periodLength]);

  return (
    <ToolLayout title="经期计算器" description="预测月经周期和排卵期，记录经期健康数据" toolId="menstrual-cycle-calc" icon={CalendarHeart} category="健康医疗" slug="menstrual-cycle-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">上次月经开始日期</label><input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">周期长度 (天)</label><input type="number" value={cycleLength} onChange={(e) => setCycleLength(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">经期长度 (天)</label><input type="number" value={periodLength} onChange={(e) => setPeriodLength(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        {result && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4"><div className="text-xs text-slate-400 mb-1">下次月经预计</div><div className="text-lg font-bold text-rose-400">{formatDate(result.nextPeriod)}</div></div>
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-4"><div className="text-xs text-slate-400 mb-1">排卵日预计</div><div className="text-lg font-bold text-purple-400">{formatDate(result.ovulation)}</div></div>
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 p-4"><div className="text-xs text-slate-400 mb-1">易孕期</div><div className="text-sm font-bold text-amber-400">{formatDate(result.fertileStart)} ~ {formatDate(result.fertileEnd)}</div></div>
              <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">本次经期结束</div><div className="text-lg font-bold text-sky-400">{formatDate(result.periodEnd)}</div></div>
            </div>

            <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">未来3个月经期预测</h3>
              <div className="space-y-2">
                {result.futurePeriods.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold">{i + 1}</div>
                    <span className="text-sm text-slate-300">{formatDate(d)}</span>
                    <span className="text-xs text-slate-500">(第 {cycleLength * (i + 1)} 天)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-slate-300">排卵日通常在下次月经前14天。易孕期为排卵日前5天到后4天，共约10天。此为估算值，实际可能因压力、饮食等因素而变化。</p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
