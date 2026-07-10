"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Cake } from "lucide-react";

export default function AgeCalculatorDetailPage() {
  const [birthDate, setBirthDate] = useState("2000-01-01");

  const result = useMemo(() => {
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    if (days < 0) { months--; const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0); days += prevMonth.getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / 86400000);
    const totalHours = Math.floor((now.getTime() - birth.getTime()) / 3600000);
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // 下一个生日
    const nextBirthday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
    const daysToBirthday = Math.ceil((nextBirthday.getTime() - now.getTime()) / 86400000);

    return { years, months, days, totalDays, totalHours, totalWeeks, totalMonths, daysToBirthday, nextBirthday };
  }, [birthDate]);

  const fmtDate = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;

  return (
    <ToolLayout title="年龄计算器详细版" description="精确计算年龄到天，显示已活天数和下一个生日倒计时" toolId="age-calculator-detail" icon={Cake} category="计算工具" slug="age-calculator-detail">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">出生日期</label><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>

        {result && (
          <>
            <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-6 text-center">
              <div className="text-sm text-slate-400 mb-2">您的年龄</div>
              <div className="text-4xl font-bold text-primary-400">{result.years}<span className="text-xl text-slate-500">岁</span> {result.months}<span className="text-xl text-slate-500">月</span> {result.days}<span className="text-xl text-slate-500">天</span></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">已活天数</div><div className="text-xl font-bold text-emerald-400">{result.totalDays.toLocaleString()}</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">已活小时</div><div className="text-xl font-bold text-sky-400">{result.totalHours.toLocaleString()}</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">已活周数</div><div className="text-xl font-bold text-amber-400">{result.totalWeeks.toLocaleString()}</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">总月数</div><div className="text-xl font-bold text-purple-400">{result.totalMonths.toLocaleString()}</div></div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 p-5 text-center">
              <div className="text-sm text-slate-400 mb-2">距离下一个生日</div>
              <div className="text-4xl font-bold text-amber-400">{result.daysToBirthday}</div>
              <div className="text-sm text-slate-500 mt-1">天 ({fmtDate(result.nextBirthday)})</div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
