"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Briefcase, Clock, Calculator } from "lucide-react";

export default function WorkHoursCalculatorPage() {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakTime, setBreakTime] = useState(1);
  const [hourlyWage, setHourlyWage] = useState("");

  const calculateHours = () => {
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    let startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalMinutes = endMinutes - startMinutes;
    const workMinutes = totalMinutes - breakTime * 60;
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;

    const totalHoursDecimal = (workMinutes / 60).toFixed(2);

    return {
      totalMinutes,
      workMinutes,
      hours,
      minutes,
      totalHoursDecimal,
      wage: hourlyWage ? (parseFloat(hourlyWage) * parseFloat(totalHoursDecimal)).toFixed(2) : null,
    };
  };

  const result = calculateHours();

  return (
    <ToolLayout
      title="工时计算器"
      description="工时计算工具，根据上下班时间计算工作时长，支持休息时间扣除和时薪计算"
      toolId="work-hours-calculator"
      icon={Briefcase}
      category="生活工具"
      slug="work-hours-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-semibold">工作时间设置</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">上班时间</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-orange-500 font-mono text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">下班时间</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-orange-500 font-mono text-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">休息时间（小时）</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="4"
                step="0.5"
                value={breakTime}
                onChange={(e) => setBreakTime(parseFloat(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="w-16 text-center text-lg font-bold text-orange-400 font-mono">{breakTime}h</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">时薪（可选，元/小时）</label>
            <input
              type="number"
              value={hourlyWage}
              onChange={(e) => setHourlyWage(e.target.value)}
              placeholder="输入时薪计算工资..."
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>
        </div>

        {/* 结果 */}
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-semibold">计算结果</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 rounded-xl p-5 text-center">
              <div className="text-xs text-zinc-500 mb-2">工作时长</div>
              <div className="text-3xl font-bold text-orange-400">
                {result.hours}<span className="text-lg">时</span>{result.minutes}<span className="text-lg">分</span>
              </div>
              <div className="text-xs text-zinc-500 mt-1">约 {result.totalHoursDecimal} 小时</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-5 text-center">
              <div className="text-xs text-zinc-500 mb-2">总时长</div>
              <div className="text-3xl font-bold text-zinc-400">
                {Math.floor(result.totalMinutes / 60)}<span className="text-lg">时</span>{result.totalMinutes % 60}<span className="text-lg">分</span>
              </div>
              <div className="text-xs text-zinc-500 mt-1">含休息时间</div>
            </div>
          </div>

          {result.wage && (
            <div className="mt-4 bg-emerald-500/10 rounded-xl p-5 text-center border border-emerald-500/20">
              <div className="text-xs text-emerald-400/70 mb-2">预估工资</div>
              <div className="text-3xl font-bold text-emerald-400">
                ¥ {result.wage}
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">工具特性</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-orange-500/10 rounded-xl text-center">
              <Clock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-orange-300">精确计算</div>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl text-center">
              <Calculator className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-emerald-300">工资计算</div>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-xl text-center">
              <Briefcase className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-blue-300">休息扣除</div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
