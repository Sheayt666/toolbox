"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CalendarDays, Plus, Minus, Info, CalendarClock } from "lucide-react";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function addDaysToDate(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonthsToDate(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYearsToDate(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function dateDiff(date1: Date, date2: Date): {
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalYears: number;
  years: number;
  months: number;
  days: number;
  weekdays: number;
  weekends: number;
} {
  const start = new Date(Math.min(date1.getTime(), date2.getTime()));
  const end = new Date(Math.max(date1.getTime(), date2.getTime()));
  const sign = date1 > date2 ? -1 : 1;

  const totalMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = Math.floor(totalDays / 30.44);
  const totalYears = Math.floor(totalDays / 365.25);

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  let weekdays = 0;
  let weekends = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekends++;
    } else {
      weekdays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return {
    totalDays: totalDays * sign,
    totalWeeks: totalWeeks * sign,
    totalMonths: totalMonths * sign,
    totalYears: totalYears * sign,
    years: years * sign,
    months: months * sign,
    days: days * sign,
    weekdays: weekdays * sign,
    weekends: weekends * sign,
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default function DateCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"diff" | "add">("diff");

  // 日期差
  const [startDate, setStartDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });

  // 日期加减
  const [baseDate, setBaseDate] = useState(getTodayString());
  const [addYears, setAddYears] = useState(0);
  const [addMonths, setAddMonths] = useState(3);
  const [addDays, setAddDays] = useState(0);
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  const diffResult = useMemo(() => {
    if (!startDate || !endDate) return null;
    return dateDiff(new Date(startDate), new Date(endDate));
  }, [startDate, endDate]);

  const addResult = useMemo(() => {
    if (!baseDate) return null;
    let result = new Date(baseDate);
    const sign = operation === "add" ? 1 : -1;
    result = addYearsToDate(result, addYears * sign);
    result = addMonthsToDate(result, addMonths * sign);
    result = addDaysToDate(result, addDays * sign);
    return result;
  }, [baseDate, addYears, addMonths, addDays, operation]);

  const setToday = (setter: (v: string) => void) => {
    setter(getTodayString());
  };

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <ToolLayout
      title="日期计算器"
      description="日期加减计算、计算两个日期之间的差值，精确到天、周、月、年，含工作日统计"
      toolId="date-calculator"
      icon={CalendarDays}
      category="生活工具"
      slug="date-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 模式切换 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-lime-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                日期计算
              </h2>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button
                onClick={() => setActiveTab("diff")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "diff"
                    ? "bg-white dark:bg-zinc-700 text-lime-600 dark:text-lime-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <CalendarClock className="w-4 h-4" />
                日期差计算
              </button>
              <button
                onClick={() => setActiveTab("add")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "add"
                    ? "bg-white dark:bg-zinc-700 text-lime-600 dark:text-lime-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Plus className="w-4 h-4" />
                日期加减
              </button>
            </div>
          </div>
        </div>

        {/* 日期差模式 */}
        {activeTab === "diff" && (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      开始日期
                    </label>
                    <button
                      onClick={() => setToday(setStartDate)}
                      className="text-xs text-lime-600 dark:text-lime-400 hover:underline"
                    >
                      今天
                    </button>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      结束日期
                    </label>
                    <button
                      onClick={() => setToday(setEndDate)}
                      className="text-xs text-lime-600 dark:text-lime-400 hover:underline"
                    >
                      今天
                    </button>
                  </div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {diffResult && (
              <div className="bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-lime-500/25">
                <div className="text-center mb-6">
                  <div className="text-sm text-lime-100 mb-2">两个日期相差</div>
                  <div className="flex items-end justify-center gap-2 flex-wrap">
                    <span className="text-5xl font-bold">{Math.abs(diffResult.years)}</span>
                    <span className="text-lg mb-2">年</span>
                    <span className="text-3xl font-semibold ml-2 mb-1">{Math.abs(diffResult.months)}</span>
                    <span className="text-base mb-2">个月</span>
                    <span className="text-2xl font-semibold ml-2 mb-1">{Math.abs(diffResult.days)}</span>
                    <span className="text-base mb-2">天</span>
                  </div>
                  {diffResult.totalDays < 0 && (
                    <div className="text-sm text-lime-200 mt-2">（结束日期早于开始日期）</div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatBox label="总天数" value={Math.abs(diffResult.totalDays).toLocaleString()} />
                  <StatBox label="总周数" value={Math.abs(diffResult.totalWeeks).toLocaleString()} />
                  <StatBox label="总月数" value={Math.abs(diffResult.totalMonths).toLocaleString()} />
                  <StatBox label="总年数" value={Math.abs(diffResult.totalYears).toLocaleString()} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-white/10 rounded-xl text-center">
                    <div className="text-xs text-lime-100 mb-1">工作日</div>
                    <div className="text-xl font-bold">{Math.abs(diffResult.weekdays).toLocaleString()} 天</div>
                  </div>
                  <div className="p-3 bg-white/10 rounded-xl text-center">
                    <div className="text-xs text-lime-100 mb-1">周末</div>
                    <div className="text-xl font-bold">{Math.abs(diffResult.weekends).toLocaleString()} 天</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 日期加减模式 */}
        {activeTab === "add" && (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      基准日期
                    </label>
                    <button
                      onClick={() => setToday(setBaseDate)}
                      className="text-xs text-lime-600 dark:text-lime-400 hover:underline"
                    >
                      今天
                    </button>
                  </div>
                  <input
                    type="date"
                    value={baseDate}
                    onChange={(e) => setBaseDate(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setOperation("add")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      operation === "add"
                        ? "bg-lime-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    加上
                  </button>
                  <button
                    onClick={() => setOperation("subtract")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      operation === "subtract"
                        ? "bg-lime-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    减去
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">年</label>
                    <input
                      type="number"
                      value={addYears}
                      onChange={(e) => setAddYears(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      className="w-full px-3 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-center font-mono text-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">月</label>
                    <input
                      type="number"
                      value={addMonths}
                      onChange={(e) => setAddMonths(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      className="w-full px-3 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-center font-mono text-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">天</label>
                    <input
                      type="number"
                      value={addDays}
                      onChange={(e) => setAddDays(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      className="w-full px-3 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white text-center font-mono text-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">快捷:</span>
                  {[
                    { label: "7天", y: 0, m: 0, d: 7 },
                    { label: "30天", y: 0, m: 0, d: 30 },
                    { label: "3个月", y: 0, m: 3, d: 0 },
                    { label: "6个月", y: 0, m: 6, d: 0 },
                    { label: "1年", y: 1, m: 0, d: 0 },
                    { label: "100天", y: 0, m: 0, d: 100 },
                    { label: "1000天", y: 0, m: 0, d: 1000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setAddYears(p.y);
                        setAddMonths(p.m);
                        setAddDays(p.d);
                      }}
                      className="px-2.5 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-lime-50 dark:hover:bg-lime-900/20 hover:text-lime-600 dark:hover:text-lime-400 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {addResult && (
              <div className="bg-gradient-to-br from-lime-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-lime-500/25">
                <div className="text-center mb-6">
                  <div className="text-sm text-lime-100 mb-2">
                    {operation === "add" ? "加上" : "减去"} {addYears}年{addMonths}月{addDays}天后
                  </div>
                  <div className="text-4xl font-bold mb-2">{formatDate(addResult)}</div>
                  <div className="text-lime-100 text-sm">
                    距离基准日{operation === "add" ? "之后" : "之前"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <StatBox
                    label="总天数"
                    value={Math.abs(
                      Math.floor(
                        (addResult.getTime() - new Date(baseDate).getTime()) / (1000 * 60 * 60 * 24)
                      )
                    ).toLocaleString()}
                  />
                  <StatBox
                    label="总周数"
                    value={Math.floor(
                      Math.abs(
                        (addResult.getTime() - new Date(baseDate).getTime()) / (1000 * 60 * 60 * 24 * 7)
                      )
                    ).toLocaleString()}
                  />
                  <StatBox
                    label="星期"
                    value={weekdays[addResult.getDay()]}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              日期计算器是一款实用的在线日期计算工具，支持两种计算模式：
              日期差计算可以计算两个日期之间相差的年、月、日、周数，并统计工作日和周末天数；
              日期加减可以计算某个日期加上或减去指定年月日之后的日期。
              适用于项目排期、纪念日计算、年龄计算等多种场景。
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                工作日是怎么计算的？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                工作日指周一到周五，周末指周六和周日。
                不考虑法定节假日和调休，仅按照常规的周一至周五为工作日计算。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                日期加减包含起始日期吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                日期加减是从基准日期的次日开始计算的。例如：1日加1天是2日。
                日期差计算包含开始日期和结束日期当天。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                可以计算很久以前的日期吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                可以。本工具支持JavaScript Date对象范围内的所有日期，
                大约公元前271821年到公元275760年，完全满足日常使用需求。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white/10 rounded-xl text-center">
      <div className="text-xs text-lime-100 mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}
