"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CalendarDays, ArrowRight, Calendar, RefreshCw } from "lucide-react";

export default function DaysBetweenPage() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  const calculateDiff = useCallback(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30.44);
    const diffYears = Math.floor(diffDays / 365.25);

    const remainingDaysAfterWeeks = diffDays % 7;
    const remainingDaysAfterMonths = Math.floor(diffDays % 30.44);
    const remainingMonthsAfterYears = Math.floor((diffDays % 365.25) / 30.44);
    const remainingDaysAfterYears = Math.floor((diffDays % 365.25) % 30.44);

    // 计算工作日（排除周末）
    let workDays = 0;
    const tempDate = new Date(start);
    const step = end > start ? 1 : -1;
    const totalSteps = diffDays;
    for (let i = 0; i <= totalSteps; i++) {
      const day = tempDate.getDay();
      if (day !== 0 && day !== 6) {
        workDays++;
      }
      tempDate.setDate(tempDate.getDate() + step);
    }

    // 周末天数
    const weekendDays = diffDays + 1 - workDays;

    return {
      diffDays,
      diffWeeks,
      remainingDaysAfterWeeks,
      diffMonths,
      remainingDaysAfterMonths,
      diffYears,
      remainingMonthsAfterYears,
      remainingDaysAfterYears,
      workDays,
      weekendDays,
      isNegative: end < start,
    };
  }, [startDate, endDate]);

  const result = calculateDiff();

  const swapDates = () => {
    setStartDate(endDate);
    setEndDate(startDate);
  };

  const setToday = (field: "start" | "end") => {
    const today = new Date().toISOString().split("T")[0];
    if (field === "start") setStartDate(today);
    else setEndDate(today);
  };

  return (
    <ToolLayout
      title="日期差计算器"
      description="计算两个日期之间相差的天数、周数、月数、年数，以及工作日和周末天数"
      icon={CalendarDays}
      category="生活工具"
      slug="days-between"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 日期输入 */}
        <div className="bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-lime-500/25">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-5 h-5" />
            <h2 className="text-base font-semibold">日期差计算</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/80">开始日期</label>
                <button
                  onClick={() => setToday("start")}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  今天
                </button>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all [color-scheme:dark]"
              />
            </div>

            <button
              onClick={swapDates}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors self-center"
              title="交换日期"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-white/80">结束日期</label>
                <button
                  onClick={() => setToday("end")}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  今天
                </button>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/50 focus:border-transparent outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* 结果展示 */}
        {result && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
            <div className="p-4 border-b border-[#27272a] bg-[#09090b]">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-lime-400" />
                计算结果
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* 主要结果 */}
              <div className="text-center py-4">
                <div className="text-sm text-slate-500 mb-2">相差天数</div>
                <div className="text-5xl font-bold text-lime-400">
                  {result.diffDays}
                  <span className="text-2xl text-slate-400 ml-2">天</span>
                </div>
                {result.isNegative && (
                  <div className="text-xs text-slate-500 mt-2">（结束日期早于开始日期）</div>
                )}
              </div>

              {/* 详细结果 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] text-center">
                  <div className="text-xs text-slate-500 mb-1">周数</div>
                  <div className="text-xl font-bold text-white">
                    {result.diffWeeks}
                    <span className="text-sm text-slate-400 ml-1">周</span>
                    {result.remainingDaysAfterWeeks > 0 && (
                      <span className="text-sm text-slate-400 ml-1">
                        {result.remainingDaysAfterWeeks}天
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] text-center">
                  <div className="text-xs text-slate-500 mb-1">月数</div>
                  <div className="text-xl font-bold text-white">
                    {result.diffMonths}
                    <span className="text-sm text-slate-400 ml-1">个月</span>
                    {result.remainingDaysAfterMonths > 0 && (
                      <span className="text-sm text-slate-400 ml-1">
                        {result.remainingDaysAfterMonths}天
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] text-center">
                  <div className="text-xs text-slate-500 mb-1">年数</div>
                  <div className="text-xl font-bold text-white">
                    {result.diffYears}
                    <span className="text-sm text-slate-400 ml-1">年</span>
                    {result.remainingMonthsAfterYears > 0 && (
                      <span className="text-sm text-slate-400 ml-1">
                        {result.remainingMonthsAfterYears}月
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] text-center">
                  <div className="text-xs text-slate-500 mb-1">总小时数</div>
                  <div className="text-xl font-bold text-white">
                    {(result.diffDays * 24).toLocaleString()}
                    <span className="text-sm text-slate-400 ml-1">小时</span>
                  </div>
                </div>
              </div>

              {/* 工作日/周末 */}
              <div className="pt-4 border-t border-[#27272a]">
                <div className="text-sm font-medium text-slate-400 mb-3">工作日与周末统计</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
                    <div className="text-xs text-blue-400 mb-1">工作日</div>
                    <div className="text-2xl font-bold text-blue-400">{result.workDays} 天</div>
                  </div>
                  <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20 text-center">
                    <div className="text-xs text-orange-400 mb-1">周末</div>
                    <div className="text-2xl font-bold text-orange-400">{result.weekendDays} 天</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 常用计算 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">快捷计算</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const today = new Date();
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                setStartDate(today.toISOString().split("T")[0]);
                setEndDate(nextWeek.toISOString().split("T")[0]);
              }}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
            >
              一周后
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const nextMonth = new Date(today);
                nextMonth.setMonth(today.getMonth() + 1);
                setStartDate(today.toISOString().split("T")[0]);
                setEndDate(nextMonth.toISOString().split("T")[0]);
              }}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
            >
              一个月后
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const nextYear = new Date(today);
                nextYear.setFullYear(today.getFullYear() + 1);
                setStartDate(today.toISOString().split("T")[0]);
                setEndDate(nextYear.toISOString().split("T")[0]);
              }}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
            >
              一年后
            </button>
            <button
              onClick={() => {
                const today = new Date();
                const yearStart = new Date(today.getFullYear(), 0, 1);
                setStartDate(yearStart.toISOString().split("T")[0]);
                setEndDate(today.toISOString().split("T")[0]);
              }}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
            >
              今年已过
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
