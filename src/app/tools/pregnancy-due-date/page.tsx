"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Baby } from "lucide-react";

function fmt(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function PregnancyDueDatePage() {
  const [lmp, setLmp] = useState("2026-01-01");
  const [method, setMethod] = useState<"lmp" | "conception">("lmp");

  const result = useMemo(() => {
    const base = new Date(lmp);
    if (isNaN(base.getTime())) return null;

    let dueDate: Date;
    if (method === "lmp") {
      // 内格莱法则: LMP + 280天
      dueDate = new Date(base);
      dueDate.setDate(base.getDate() + 280);
    } else {
      // 受孕日 + 266天
      dueDate = new Date(base);
      dueDate.setDate(base.getDate() + 266);
    }

    const now = new Date();
    const daysPregnant = Math.floor((now.getTime() - base.getTime()) / 86400000);
    const weeksPregnant = Math.floor(daysPregnant / 7);
    const daysRemainder = daysPregnant % 7;
    const daysToDue = Math.floor((dueDate.getTime() - now.getTime()) / 86400000);

    let trimester = "第一孕期";
    if (weeksPregnant >= 28) trimester = "第三孕期";
    else if (weeksPregnant >= 14) trimester = "第二孕期";

    // 各孕期里程碑
    const milestones = [
      { week: 6, event: "首次B超检查", date: new Date(base.getTime() + 6 * 7 * 86400000) },
      { week: 12, event: "NT检查", date: new Date(base.getTime() + 12 * 7 * 86400000) },
      { week: 16, event: "唐筛/无创DNA", date: new Date(base.getTime() + 16 * 7 * 86400000) },
      { week: 24, event: "大排畸B超", date: new Date(base.getTime() + 24 * 7 * 86400000) },
      { week: 28, event: "糖耐量测试", date: new Date(base.getTime() + 28 * 7 * 86400000) },
      { week: 36, event: "产前检查", date: new Date(base.getTime() + 36 * 7 * 86400000) },
      { week: 40, event: "预产期", date: dueDate },
    ];

    return { dueDate, daysPregnant, weeksPregnant, daysRemainder, daysToDue, trimester, milestones };
  }, [lmp, method]);

  return (
    <ToolLayout title="预产期计算器" description="根据末次月经或受孕日期计算预产期和孕周" toolId="pregnancy-due-date" icon={Baby} category="健康医疗" slug="pregnancy-due-date">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">计算方式</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as "lmp" | "conception")} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
              <option value="lmp">末次月经日</option>
              <option value="conception">受孕日期</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{method === "lmp" ? "末次月经日期" : "受孕日期"}</label>
            <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        {result && (
          <>
            <div className="bg-gradient-to-br from-pink-500/10 to-transparent rounded-xl border border-pink-500/20 p-6 text-center">
              <div className="text-sm text-slate-400 mb-2">预产期</div>
              <div className="text-3xl font-bold text-pink-400">{fmt(result.dueDate)}</div>
              <div className="text-sm text-slate-500 mt-2">距离预产期还有 {Math.max(0, result.daysToDue)} 天</div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">当前孕周</div><div className="text-xl font-bold text-white">{result.weeksPregnant}周+{result.daysRemainder}天</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">已怀孕天数</div><div className="text-xl font-bold text-white">{result.daysPregnant} 天</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">当前孕期</div><div className="text-xl font-bold text-pink-400">{result.trimester}</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">进度</div><div className="text-xl font-bold text-emerald-400">{Math.min(100, Math.round((result.daysPregnant / 280) * 100))}%</div></div>
            </div>

            <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">产检时间表</h3>
              <div className="space-y-2">
                {result.milestones.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${result.weeksPregnant >= m.week ? "bg-emerald-500/20 text-emerald-400" : "bg-[#0d0d0f] text-slate-500"}`}>{m.week}周</div>
                      <span className="text-slate-300">{m.event}</span>
                    </div>
                    <span className="text-xs text-slate-500">{fmt(m.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
