"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Gift, Calendar, Sparkles } from "lucide-react";

export default function HolidayFinderPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const fixedHolidays = [
    { name: "元旦", date: "01-01", type: "法定" },
    { name: "情人节", date: "02-14", type: "国际" },
    { name: "妇女节", date: "03-08", type: "国际" },
    { name: "植树节", date: "03-12", type: "国内" },
    { name: "愚人节", date: "04-01", type: "国际" },
    { name: "劳动节", date: "05-01", type: "法定" },
    { name: "青年节", date: "05-04", type: "国内" },
    { name: "母亲节", date: null, type: "国际", calc: (y: number) => {
      const d = new Date(y, 4, 1);
      const day = d.getDay();
      return `05-${14 - day}`;
    }},
    { name: "儿童节", date: "06-01", type: "国际" },
    { name: "父亲节", date: null, type: "国际", calc: (y: number) => {
      const d = new Date(y, 5, 1);
      const day = d.getDay();
      return `06-${15 + (day === 0 ? 0 : 7 - day)}`;
    }},
    { name: "建党节", date: "07-01", type: "国内" },
    { name: "建军节", date: "08-01", type: "国内" },
    { name: "七夕", date: null, type: "传统", calc: (y: number) => {
      const lunarDates: Record<number, string> = { 2024: "08-10", 2025: "08-29", 2026: "08-19" };
      return lunarDates[y] || "08-10";
    }},
    { name: "教师节", date: "09-10", type: "国内" },
    { name: "中秋节", date: null, type: "法定", calc: (y: number) => {
      const lunarDates: Record<number, string> = { 2024: "09-17", 2025: "10-06", 2026: "09-25" };
      return lunarDates[y] || "09-17";
    }},
    { name: "国庆节", date: "10-01", type: "法定" },
    { name: "重阳节", date: null, type: "传统", calc: (y: number) => {
      const lunarDates: Record<number, string> = { 2024: "10-11", 2025: "10-29", 2026: "10-19" };
      return lunarDates[y] || "10-11";
    }},
    { name: "万圣节", date: "10-31", type: "国际" },
    { name: "光棍节", date: "11-11", type: "国内" },
    { name: "感恩节", date: null, type: "国际", calc: (y: number) => {
      const d = new Date(y, 10, 1);
      const day = d.getDay();
      const firstThu = day <= 4 ? 5 - day : 12 - day;
      const fourthThu = firstThu + 21;
      return `11-${fourthThu}`;
    }},
    { name: "圣诞节", date: "12-25", type: "国际" },
    { name: "春节", date: null, type: "法定", calc: (y: number) => {
      const lunarDates: Record<number, string> = { 2024: "02-10", 2025: "01-29", 2026: "02-17" };
      return lunarDates[y] || "02-10";
    }},
    { name: "元宵节", date: null, type: "传统", calc: (y: number) => {
      const lunarDates: Record<number, string> = { 2024: "02-24", 2025: "02-12", 2026: "03-03" };
      return lunarDates[y] || "02-24";
    }},
    { name: "清明节", date: null, type: "法定", calc: (y: number) => {
      return `04-05`;
    }},
    { name: "端午节", date: null, type: "法定", calc: (y: number) => {
      const lunarDates: Record<number, string> = { 2024: "06-10", 2025: "05-31", 2026: "06-19" };
      return lunarDates[y] || "06-10";
    }},
  ];

  const getDateStr = (h: any): string => {
    if (h.date) return h.date;
    if (h.calc) return h.calc(year);
    return "";
  };

  const today = new Date();
  const todayStr = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const holidaysWithDates = fixedHolidays
    .map(h => ({ ...h, dateStr: getDateStr(h) }))
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  const typeColors: Record<string, string> = {
    "法定": "bg-red-500/20 text-red-400 border-red-500/30",
    "传统": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "国际": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "国内": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  const getNextHoliday = () => {
    const next = holidaysWithDates.find(h => h.dateStr >= todayStr);
    if (next) return next;
    return holidaysWithDates[0];
  };

  const nextHoliday = getNextHoliday();

  const getDaysUntil = (dateStr: string) => {
    const [m, d] = dateStr.split("-").map(Number);
    let targetYear = year;
    const target = new Date(targetYear, m - 1, d);
    if (target < new Date(year, today.getMonth(), today.getDate())) {
      target.setFullYear(year + 1);
    }
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <ToolLayout
      title="节日查询"
      description="全年节日查询，包含法定节假日、传统节日、国际节日，显示距离下一个节日天数"
      toolId="holiday-finder"
      icon={Gift}
      category="生活工具"
      slug="holiday-finder"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* 年份选择 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold">选择年份</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setYear(year - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm"
              >
                -
              </button>
              <span className="w-16 text-center text-xl font-bold text-amber-400 font-mono">{year}</span>
              <button
                onClick={() => setYear(year + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700 transition-colors text-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 下一个节日 */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-semibold">距离下一个节日</h2>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-amber-400 mb-2">
              {getDaysUntil(nextHoliday.dateStr)} <span className="text-2xl">天</span>
            </div>
            <div className="text-xl text-amber-300">{nextHoliday.name}</div>
            <div className="text-sm text-zinc-500 mt-1">{year}年 {nextHoliday.dateStr.replace("-", "月")}日</div>
          </div>
        </div>

        {/* 节日列表 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold">{year}年节日大全</h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {holidaysWithDates.map((h) => (
              <div
                key={h.name}
                className={`p-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors ${
                  h.dateStr === todayStr ? "bg-amber-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-zinc-800 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-xs text-zinc-500">{h.dateStr.split("-")[0]}月</span>
                    <span className="text-lg font-bold text-zinc-300">{h.dateStr.split("-")[1]}</span>
                  </div>
                  <div>
                    <div className="font-medium text-zinc-200">{h.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[h.type]}`}>
                      {h.type}
                    </span>
                  </div>
                </div>
                {h.dateStr >= todayStr && (
                  <div className="text-sm text-zinc-500">
                    {getDaysUntil(h.dateStr)}天后
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
