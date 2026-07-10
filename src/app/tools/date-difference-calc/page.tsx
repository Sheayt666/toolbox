"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CalendarDays } from "lucide-react";

export default function DateDifferenceCalcPage() {
  const [date1, setDate1] = useState("2026-01-01");
  const [date2, setDate2] = useState("2026-07-10");

  const result = useMemo(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMinutes = Math.floor(diffMs / 60000);

    // 计算年月差
    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();
    if (days < 0) { months--; days += 30; }
    if (months < 0) { years--; months += 12; }

    const sign = d2 >= d1 ? 1 : -1;
    return { diffDays, diffWeeks, diffHours, diffMinutes, years: Math.abs(years), months: Math.abs(months), days: Math.abs(days), sign };
  }, [date1, date2]);

  return (
    <ToolLayout title="日期差计算" description="计算两个日期之间相差的天数月数和年数" toolId="date-difference-calc" icon={CalendarDays} category="计算工具" slug="date-difference-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">开始日期</label><input type="date" value={date1} onChange={(e) => setDate1(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">结束日期</label><input type="date" value={date2} onChange={(e) => setDate2(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        {result && (
          <>
            <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-6 text-center">
              <div className="text-sm text-slate-400 mb-2">相差天数</div>
              <div className="text-5xl font-bold text-primary-400">{result.diffDays.toLocaleString()}</div>
              <div className="text-sm text-slate-500 mt-2">天</div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">相差周数</div><div className="text-xl font-bold text-emerald-400">{result.diffWeeks.toLocaleString()}</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">相差小时</div><div className="text-xl font-bold text-sky-400">{result.diffHours.toLocaleString()}</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">相差分钟</div><div className="text-xl font-bold text-amber-400">{result.diffMinutes.toLocaleString()}</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">年月日差</div><div className="text-sm font-bold text-white">{result.years}年{result.months}月{result.days}日</div></div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
