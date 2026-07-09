"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CalendarHeart, Gift, Star, Heart } from "lucide-react";

export default function AnniversaryCalculatorPage() {
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const target = targetDate ? new Date(targetDate) : now;

  const calculate = () => {
    if (!startDate) return null;
    const start = new Date(startDate);

    const diffMs = target.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // 计算年月日差
    let years = target.getFullYear() - start.getFullYear();
    let months = target.getMonth() - start.getMonth();
    let days = target.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // 重要纪念日
    const milestones = [
      { days: 100, name: "百日纪念" },
      { days: 365, name: "一周年" },
      { days: 500, name: "500天" },
      { days: 730, name: "两周年" },
      { days: 1000, name: "一千天" },
      { days: 1095, name: "三周年" },
      { days: 1825, name: "五周年" },
      { days: 2555, name: "七周年" },
      { days: 3650, name: "十周年" },
    ];

    const nextMilestone = milestones.find(m => m.days > diffDays);
    const pastMilestones = milestones.filter(m => m.days <= diffDays);

    return {
      years,
      months,
      days,
      totalDays: diffDays,
      totalHours: diffHours,
      totalMinutes: diffMinutes,
      nextMilestone,
      pastMilestones,
      isFuture: diffDays < 0,
    };
  };

  const result = calculate();

  const milestones = [
    { days: 100, name: "百日" },
    { days: 365, name: "一周年" },
    { days: 500, name: "500天" },
    { days: 730, name: "两周年" },
    { days: 1000, name: "一千天" },
    { days: 1825, name: "五周年" },
    { days: 2555, name: "七周年" },
    { days: 3650, name: "十周年" },
  ];

  return (
    <ToolLayout
      title="纪念日计算器"
      description="纪念日计算工具，记录重要日子，计算已过天数和下一个纪念日"
      toolId="anniversary-calculator"
      icon={CalendarHeart}
      category="生活工具"
      slug="anniversary-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-semibold">日期设置</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-rose-500 font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">目标日期（默认今天）</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-rose-500 font-mono text-lg"
            />
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 rounded-xl border border-rose-500/20 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-semibold">计算结果</h2>
            </div>

            <div className="text-center mb-6">
              <div className="text-xs text-zinc-500 mb-2">
                {result.isFuture ? "距离开始还有" : "已经一起"}
              </div>
              <div className="text-5xl font-bold text-rose-400 mb-2">
                {Math.abs(result.totalDays)} <span className="text-2xl">天</span>
              </div>
              <div className="text-sm text-zinc-400">
                {result.years}年{result.months}个月{Math.abs(result.days)}天
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">总小时</div>
                <div className="text-xl font-bold text-rose-300 font-mono">{Math.abs(result.totalHours).toLocaleString()}</div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">总分钟</div>
                <div className="text-xl font-bold text-rose-300 font-mono">{Math.abs(result.totalMinutes).toLocaleString()}</div>
              </div>
            </div>

            {result.nextMilestone && (
              <div className="mt-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-300">下一个纪念日</span>
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {result.nextMilestone.name}（{result.nextMilestone.days}天）
                  <span className="text-sm font-normal text-emerald-400/70 ml-2">
                    还有 {result.nextMilestone.days - result.totalDays} 天
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 纪念日列表 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-rose-400" />
            <h3 className="text-base font-semibold">重要纪念日</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {milestones.map((m) => (
              <div
                key={m.days}
                className={`p-3 rounded-xl text-center border transition-colors ${
                  result && result.totalDays >= m.days
                    ? "bg-rose-500/10 border-rose-500/30"
                    : "bg-zinc-900/50 border-zinc-700"
                }`}
              >
                <div className={`text-lg font-bold ${result && result.totalDays >= m.days ? "text-rose-400" : "text-zinc-500"}`}>
                  {m.name}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{m.days}天</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
