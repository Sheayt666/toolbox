"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Percent,
  Calculator,
  Info,
  ArrowRight,
} from "lucide-react";

export default function PercentageCalculatorPage() {
  const [value, setValue] = useState(200);
  const [percentage, setPercentage] = useState(15);
  const [mode, setMode] = useState<"find-pct" | "find-value" | "find-total">("find-pct");
  const [partValue, setPartValue] = useState(30);
  const [totalValue, setTotalValue] = useState(200);

  const result = useMemo(() => {
    if (mode === "find-pct") {
      if (totalValue === 0) return null;
      const pct = (partValue / totalValue) * 100;
      return { label: "百分比", value: pct, unit: "%" };
    } else if (mode === "find-value") {
      const result = (value * percentage) / 100;
      return { label: "计算结果", value: result, unit: "" };
    } else {
      if (percentage === 0) return null;
      const total = (value / percentage) * 100;
      return { label: "总数", value: total, unit: "" };
    }
  }, [mode, value, percentage, partValue, totalValue]);

  const modes = [
    { id: "find-value", label: "求百分比值", desc: "X的Y%是多少" },
    { id: "find-pct", label: "求百分比", desc: "X是Y的百分之几" },
    { id: "find-total", label: "求总数", desc: "X是总数的Y%，求总数" },
  ];

  return (
    <ToolLayout
      title="百分比计算器"
      description="多功能百分比计算器，支持求百分比值、求百分比、求总数三种模式，快速准确"
      toolId="percentage-calculator"
      icon={Percent}
      category="计算工具"
      slug="percentage-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                百分比计算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 模式选择 */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                计算模式
              </label>
              <div className="grid grid-cols-3 gap-3">
                {modes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as typeof mode)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      mode === m.id
                        ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-700"
                        : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-cyan-300 dark:hover:border-cyan-600"
                    }`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        mode === m.id
                          ? "text-cyan-700 dark:text-cyan-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {m.label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {m.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 输入区域 */}
            {mode === "find-value" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    数值
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="请输入数值"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    百分比 (%)
                  </label>
                  <input
                    type="number"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="请输入百分比"
                  />
                </div>
              </div>
            )}

            {mode === "find-pct" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    部分值
                  </label>
                  <input
                    type="number"
                    value={partValue}
                    onChange={(e) => setPartValue(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="请输入部分值"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    总数
                  </label>
                  <input
                    type="number"
                    value={totalValue}
                    onChange={(e) => setTotalValue(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="请输入总数"
                  />
                </div>
              </div>
            )}

            {mode === "find-total" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    部分值
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="请输入部分值"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    占比 (%)
                  </label>
                  <input
                    type="number"
                    value={percentage}
                    onChange={(e) => setPercentage(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="请输入占比"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-500/25">
            <div className="text-center">
              <div className="text-sm text-cyan-100 mb-1">{result.label}</div>
              <div className="text-5xl font-bold">
                {result.value.toFixed(2)}{result.unit}
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
            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              <span>求百分比值：结果 = 数值 × 百分比 ÷ 100</span>
            </div>
            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              <span>求百分比：百分比 = 部分值 ÷ 总数 × 100%</span>
            </div>
            <div className="flex items-center gap-3">
              <ArrowRight className="w-4 h-4 text-cyan-500 flex-shrink-0" />
              <span>求总数：总数 = 部分值 ÷ 百分比 × 100</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
