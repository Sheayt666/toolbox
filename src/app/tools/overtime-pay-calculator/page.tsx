"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Clock, Calculator, DollarSign } from "lucide-react";

export default function OvertimePayCalculatorPage() {
  const [monthlySalary, setMonthlySalary] = useState("8000");
  const [weekdayHours, setWeekdayHours] = useState("0");
  const [weekendHours, setWeekendHours] = useState("0");
  const [holidayHours, setHolidayHours] = useState("0");

  const calculate = () => {
    const salary = parseFloat(monthlySalary) || 0;
    const wdHours = parseFloat(weekdayHours) || 0;
    const weHours = parseFloat(weekendHours) || 0;
    const hdHours = parseFloat(holidayHours) || 0;

    // 月计薪天数 21.75
    const dailyWage = salary / 21.75;
    const hourlyWage = dailyWage / 8;

    // 工作日加班 1.5倍
    const weekdayPay = hourlyWage * wdHours * 1.5;
    // 周末加班 2倍
    const weekendPay = hourlyWage * weHours * 2;
    // 法定节假日加班 3倍
    const holidayPay = hourlyWage * hdHours * 3;

    const totalOvertimePay = weekdayPay + weekendPay + holidayPay;
    const totalSalary = salary + totalOvertimePay;

    return {
      hourlyWage: hourlyWage.toFixed(2),
      dailyWage: dailyWage.toFixed(2),
      weekdayPay: weekdayPay.toFixed(2),
      weekendPay: weekendPay.toFixed(2),
      holidayPay: holidayPay.toFixed(2),
      totalOvertimePay: totalOvertimePay.toFixed(2),
      totalSalary: totalSalary.toFixed(2),
      totalHours: wdHours + weHours + hdHours,
    };
  };

  const result = calculate();

  return (
    <ToolLayout
      title="加班工资计算器"
      description="加班工资计算工具，支持工作日、周末、法定节假日不同倍率计算"
      toolId="overtime-pay-calculator"
      icon={Clock}
      category="计算工具"
      slug="overtime-pay-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold">工资信息</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">月基本工资（元）</label>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono text-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-zinc-900/50 rounded-lg text-center">
              <div className="text-xs text-zinc-500">日薪</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">¥{result.dailyWage}</div>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg text-center">
              <div className="text-xs text-zinc-500">时薪</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">¥{result.hourlyWage}</div>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg text-center">
              <div className="text-xs text-zinc-500">计薪天数</div>
              <div className="text-lg font-bold text-zinc-400 font-mono">21.75</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <h2 className="text-base font-semibold">加班时长</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-zinc-400 flex-shrink-0">
                工作日加班
                <div className="text-xs text-blue-400">1.5倍</div>
              </div>
              <input
                type="number"
                value={weekdayHours}
                onChange={(e) => setWeekdayHours(e.target.value)}
                className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-zinc-500 w-8">小时</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-zinc-400 flex-shrink-0">
                周末加班
                <div className="text-xs text-purple-400">2倍</div>
              </div>
              <input
                type="number"
                value={weekendHours}
                onChange={(e) => setWeekendHours(e.target.value)}
                className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-purple-500 font-mono"
              />
              <span className="text-zinc-500 w-8">小时</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-28 text-sm text-zinc-400 flex-shrink-0">
                节假日加班
                <div className="text-xs text-red-400">3倍</div>
              </div>
              <input
                type="number"
                value={holidayHours}
                onChange={(e) => setHolidayHours(e.target.value)}
                className="flex-1 bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-300 focus:outline-none focus:border-red-500 font-mono"
              />
              <span className="text-zinc-500 w-8">小时</span>
            </div>
          </div>
        </div>

        {/* 结果 */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold">计算结果</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <span className="text-sm text-zinc-400">工作日加班费</span>
              <span className="font-mono text-blue-400 font-bold">¥ {result.weekdayPay}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <span className="text-sm text-zinc-400">周末加班费</span>
              <span className="font-mono text-purple-400 font-bold">¥ {result.weekendPay}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
              <span className="text-sm text-zinc-400">节假日加班费</span>
              <span className="font-mono text-red-400 font-bold">¥ {result.holidayPay}</span>
            </div>
            <div className="border-t border-zinc-700 pt-3 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">加班费合计 ({result.totalHours}小时)</span>
                <span className="font-mono text-xl text-orange-400 font-bold">¥ {result.totalOvertimePay}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="text-sm font-medium text-emerald-300">月工资总计</span>
              <span className="font-mono text-2xl text-emerald-400 font-bold">¥ {result.totalSalary}</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-3">计算依据</h3>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• 月计薪天数：21.75天（365天-104天休息日）/ 12月</li>
            <li>• 工作日加班：不低于工资的150%</li>
            <li>• 休息日加班：不低于工资的200%</li>
            <li>• 法定节假日加班：不低于工资的300%</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
