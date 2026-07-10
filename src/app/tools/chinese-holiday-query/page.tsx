"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Calendar } from "lucide-react";

interface Holiday {
  name: string;
  date: string;
  days: number;
  type: string;
}

const HOLIDAYS: Holiday[] = [
  { name: "元旦", date: "2026-01-01", days: 3, type: "法定节假日" },
  { name: "春节", date: "2026-02-17", days: 7, type: "法定节假日" },
  { name: "清明节", date: "2026-04-05", days: 3, type: "法定节假日" },
  { name: "劳动节", date: "2026-05-01", days: 5, type: "法定节假日" },
  { name: "端午节", date: "2026-06-19", days: 3, type: "法定节假日" },
  { name: "中秋节", date: "2026-09-25", days: 3, type: "法定节假日" },
  { name: "国庆节", date: "2026-10-01", days: 7, type: "法定节假日" },
  { name: "元宵节", date: "2026-03-03", days: 0, type: "传统节日" },
  { name: "情人节", date: "2026-02-14", days: 0, type: "其他节日" },
  { name: "妇女节", date: "2026-03-08", days: 0, type: "其他节日" },
  { name: "植树节", date: "2026-03-12", days: 0, type: "其他节日" },
  { name: "愚人节", date: "2026-04-01", days: 0, type: "其他节日" },
  { name: "母亲节", date: "2026-05-10", days: 0, type: "其他节日" },
  { name: "儿童节", date: "2026-06-01", days: 0, type: "其他节日" },
  { name: "父亲节", date: "2026-06-21", days: 0, type: "其他节日" },
  { name: "教师节", date: "2026-09-10", days: 0, type: "其他节日" },
  { name: "重阳节", date: "2026-10-18", days: 0, type: "传统节日" },
  { name: "万圣节", date: "2026-10-31", days: 0, type: "其他节日" },
  { name: "感恩节", date: "2026-11-26", days: 0, type: "其他节日" },
  { name: "圣诞节", date: "2026-12-25", days: 0, type: "其他节日" },
];

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ChineseHolidayQueryPage() {
  const [filter, setFilter] = useState("全部");

  const filtered = useMemo(() => {
    let result = HOLIDAYS.map((h) => ({ ...h, daysUntil: getDaysUntil(h.date) }));
    if (filter !== "全部") result = result.filter((h) => h.type === filter);
    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [filter]);

  return (
    <ToolLayout title="节假日查询" description="查询中国法定节假日、调休安排及节日倒计时" icon={Calendar} category="查询工具" slug="chinese-holiday-query">
      <div className="p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {["全部", "法定节假日", "传统节日", "其他节日"].map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === t ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{t}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((h, i) => {
            const isPast = h.daysUntil < 0;
            const isToday = h.daysUntil === 0;
            return (
              <div key={i} className={`p-4 bg-[#09090b] border rounded-xl flex items-center justify-between transition-colors ${isToday ? "border-emerald-500/30" : "border-[#27272a]"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-500">{h.date.split("-")[1]}月</span>
                    <span className="text-lg font-bold text-primary-400">{h.date.split("-")[2]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{h.name}</span>
                      {h.days > 0 && <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded">放假{h.days}天</span>}
                      <span className="text-xs px-2 py-0.5 bg-[#27272a] text-slate-400 rounded">{h.type}</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">{h.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  {isPast ? (
                    <span className="text-slate-500 text-sm">已过</span>
                  ) : isToday ? (
                    <span className="text-emerald-400 font-bold">今天</span>
                  ) : (
                    <div><span className="text-2xl font-bold text-primary-400">{h.daysUntil}</span><span className="text-sm text-slate-500 ml-1">天后</span></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}
