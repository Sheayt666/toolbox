"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Calculator,
  Info,
  PiggyBank,
} from "lucide-react";

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function RoiCalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [finalValue, setFinalValue] = useState(150000);
  const [years, setYears] = useState(3);

  const result = useMemo(() => {
    if (initialInvestment <= 0 || years <= 0) return null;

    const netProfit = finalValue - initialInvestment;
    const roi = (netProfit / initialInvestment) * 100;
    const annualizedRoi = years > 0 
      ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100 
      : 0;
    const isProfit = netProfit >= 0;

    return { netProfit, roi, annualizedRoi, isProfit };
  }, [initialInvestment, finalValue, years]);

  return (
    <ToolLayout
      title="投资回报率(ROI)计算器"
      description="计算投资回报率和年化收益率，评估投资收益表现，投资决策好帮手"
      toolId="roi-calculator"
      icon={TrendingUp}
      category="计算工具"
      slug="roi-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                ROI计算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  初始投资
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  ¥ {formatCurrency(initialInvestment)}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={10000000}
                step={1000}
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥1,000</span>
                <span>¥1,000万</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <PiggyBank className="w-4 h-4 text-emerald-500" />
                  最终价值
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  ¥ {formatCurrency(finalValue)}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={20000000}
                step={1000}
                value={finalValue}
                onChange={(e) => setFinalValue(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥1,000</span>
                <span>¥2,000万</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  投资期限
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {years} 年
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={50}
                step={0.5}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>半年</span>
                <span>50年</span>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div
            className={`rounded-2xl p-6 text-white shadow-lg ${
              result.isProfit
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
                : "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25"
            }`}
          >
            <div className="text-center mb-6">
              <div className="text-sm opacity-80 mb-1">投资回报率 (ROI)</div>
              <div className="text-5xl font-bold">
                {result.isProfit ? "+" : ""}
                {result.roi.toFixed(2)}%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">净利润</div>
                <div className="text-lg font-semibold">
                  {result.isProfit ? "+" : ""}
                  ¥{formatCurrency(result.netProfit / 10000)}万
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">年化收益率</div>
                <div className="text-lg font-semibold">
                  {result.annualizedRoi.toFixed(2)}%
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">投资期限</div>
                <div className="text-lg font-semibold">
                  {years}年
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              计算公式
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
            <p><strong>投资回报率 (ROI)</strong> = (最终价值 - 初始投资) ÷ 初始投资 × 100%</p>
            <p><strong>年化收益率</strong> = (最终价值/初始投资)^(1/年数) - 1</p>
            <p className="text-zinc-500 mt-2">
              ROI是衡量投资效率的重要指标，正值表示盈利，负值表示亏损。
              年化收益率用于比较不同期限投资的收益水平。
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
