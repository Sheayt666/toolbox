"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Baby, Calendar, Heart } from "lucide-react";

export default function DueDateCalculatorPage() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycle, setCycle] = useState(28);

  const calculate = () => {
    if (!lastPeriod) return null;

    const lastDate = new Date(lastPeriod);
    // 预产期 = 末次月经 + 280天（40周）
    const dueDate = new Date(lastDate);
    dueDate.setDate(dueDate.getDate() + 280 - (28 - cycle));

    const now = new Date();
    const diffTime = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const week = Math.floor(diffDays / 7);
    const day = diffDays % 7;

    const totalDays = 280 - (28 - cycle);
    const daysLeft = totalDays - diffDays;
    const progress = Math.min(100, Math.max(0, (diffDays / totalDays) * 100));

    //  trimester
    let trimester = 1;
    if (diffDays > 182) trimester = 3;
    else if (diffDays > 91) trimester = 2;

    return {
      dueDate: dueDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
      week,
      day,
      daysLeft: Math.max(0, daysLeft),
      progress: progress.toFixed(1),
      trimester,
      current: diffDays >= 0 && diffDays <= totalDays,
      daysPassed: diffDays,
    };
  };

  const result = calculate();

  const trimesterNames = ["第一孕期 (1-12周)", "第二孕期 (13-27周)", "第三孕期 (28-40周)"];

  return (
    <ToolLayout
      title="预产期计算器"
      description="根据末次月经日期计算预产期，实时显示当前孕周和孕期进度"
      toolId="due-date-calculator"
      icon={Baby}
      category="生活工具"
      slug="due-date-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Baby className="w-5 h-5 text-pink-400" />
            <h2 className="text-base font-semibold">基本信息</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">末次月经日期</label>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-pink-500 font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">月经周期：{cycle} 天</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="21"
                max="35"
                step="1"
                value={cycle}
                onChange={(e) => setCycle(parseInt(e.target.value))}
                className="flex-1 accent-pink-500"
              />
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-pink-400" />
              <h2 className="text-base font-semibold">计算结果</h2>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-5 text-center mb-4">
              <div className="text-xs text-zinc-500 mb-2">预产期</div>
              <div className="text-2xl font-bold text-pink-400">{result.dueDate}</div>
            </div>

            {result.current && (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                    <div className="text-xs text-zinc-500 mb-1">当前孕周</div>
                    <div className="text-2xl font-bold text-pink-400">
                      {result.week}<span className="text-sm">周</span>{result.day}<span className="text-sm">天</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                    <div className="text-xs text-zinc-500 mb-1">距离预产期</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {result.daysLeft}<span className="text-sm">天</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">孕期进度</span>
                    <span className="text-pink-400 font-medium">{result.progress}%</span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${result.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-pink-500/10 rounded-xl">
                  <div className="text-sm font-medium text-pink-300">{trimesterNames[result.trimester - 1]}</div>
                </div>
              </>
            )}

            {!result.current && result.daysPassed > 0 && (
              <div className="text-center text-zinc-400 p-4">
                已超过预产期 {result.daysPassed - 280 + (28 - cycle)} 天
              </div>
            )}

            {!result.current && result.daysPassed < 0 && (
              <div className="text-center text-zinc-400 p-4">
                怀孕尚未开始
              </div>
            )}
          </div>
        )}

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-pink-400" />
            <h3 className="text-base font-semibold">计算说明</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            预产期计算基于Naegele法则，即从末次月经第一天算起，月份减3或加9，日期加7。
            整个孕期约280天（40周）。实际分娩日期可能与预产期相差1-2周，属于正常范围。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
