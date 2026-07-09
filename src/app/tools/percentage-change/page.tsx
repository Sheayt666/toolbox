"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Info,
  Minus,
} from "lucide-react";

export default function PercentageChangePage() {
  const [oldValue, setOldValue] = useState(100);
  const [newValue, setNewValue] = useState(150);

  const result = useMemo(() => {
    if (oldValue === 0) return null;

    const difference = newValue - oldValue;
    const percentageChange = (difference / Math.abs(oldValue)) * 100;
    const isIncrease = percentageChange >= 0;

    return { difference, percentageChange, isIncrease };
  }, [oldValue, newValue]);

  return (
    <ToolLayout
      title="百分比变化计算器"
      description="计算两个数值之间的百分比增减变化，快速了解数值变动幅度"
      toolId="percentage-change"
      icon={TrendingUp}
      category="计算工具"
      slug="percentage-change"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                百分比变化计算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  原始值
                </label>
                <input
                  type="number"
                  value={oldValue}
                  onChange={(e) => setOldValue(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors text-lg"
                  placeholder="请输入原始值"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  新值
                </label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors text-lg"
                  placeholder="请输入新值"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              <Minus className="w-5 h-5 text-zinc-400" />
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>
        </div>

        {result && (
          <div
            className={`rounded-2xl p-6 text-white shadow-lg ${
              result.isIncrease
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25"
                : "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/25"
            }`}
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                {result.isIncrease ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <span className="text-sm opacity-80">
                  {result.isIncrease ? "增长" : "下降"}
                </span>
              </div>
              <div className="text-6xl font-bold">
                {result.isIncrease ? "+" : ""}
                {result.percentageChange.toFixed(2)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">变化量</div>
                <div className="text-lg font-semibold">
                  {result.isIncrease ? "+" : ""}
                  {result.difference.toFixed(2)}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">变化幅度</div>
                <div className="text-lg font-semibold">
                  {Math.abs(result.percentageChange).toFixed(2)}%
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
            <p>百分比变化 = (新值 - 原始值) ÷ |原始值| × 100%</p>
            <p className="text-zinc-500">
              正值表示增长，负值表示下降。百分比变化常用于比较数据在不同时期的变化幅度。
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
