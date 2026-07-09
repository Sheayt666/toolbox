"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  DollarSign,
  Percent,
  Calendar,
  PiggyBank,
  Info,
  Calculator,
} from "lucide-react";

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function SimpleInterestPage() {
  const [principal, setPrincipal] = useState(100000);
  const [annualRate, setAnnualRate] = useState(5);
  const [years, setYears] = useState(3);

  const result = useMemo(() => {
    if (principal <= 0 || annualRate < 0 || years <= 0) return null;

    const totalInterest = (principal * annualRate * years) / 100;
    const finalAmount = principal + totalInterest;
    const monthlyInterest = totalInterest / (years * 12);
    const dailyInterest = totalInterest / (years * 365);

    return { finalAmount, totalInterest, monthlyInterest, dailyInterest };
  }, [principal, annualRate, years]);

  return (
    <ToolLayout
      title="单利计算器"
      description="计算单利利息，支持按年/月/日查看利息，简单直观的利息计算工具"
      toolId="simple-interest"
      icon={PiggyBank}
      category="计算工具"
      slug="simple-interest"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                存款信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  本金
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  ¥ {formatCurrency(principal)}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={1000000}
                step={1000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥1,000</span>
                <span>¥1,000,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-blue-500" />
                  年利率
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {annualRate} %
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={15}
                step={0.1}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>0.5%</span>
                <span>15%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  存期
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  {years} 年
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={30}
                step={0.5}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>半年</span>
                <span>30年</span>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25">
            <div className="text-center mb-6">
              <div className="text-sm text-blue-100 mb-1">到期本息合计</div>
              <div className="text-4xl font-bold">
                ¥ {formatCurrency(result.finalAmount)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-blue-100 mb-1">本金</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(principal / 10000)}万
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-blue-100 mb-1">总利息</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(result.totalInterest)}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-blue-100 mb-1">月利息</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(result.monthlyInterest)}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-blue-100 mb-1">日利息</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(result.dailyInterest)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              单利计算公式
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>单利是指按照固定的本金计算利息，利息不会加入本金重复计息。</p>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-mono text-center">
              <p className="text-lg">利息 = 本金 × 利率 × 时间</p>
              <p className="text-zinc-500 mt-2">I = P × r × t</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
