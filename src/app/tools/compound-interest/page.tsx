"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  TrendingUp,
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

export default function CompoundInterestPage() {
  const [principal, setPrincipal] = useState(100000);
  const [annualRate, setAnnualRate] = useState(5);
  const [years, setYears] = useState(10);
  const [compoundFrequency, setCompoundFrequency] = useState(12);

  const result = useMemo(() => {
    if (principal <= 0 || annualRate < 0 || years <= 0) return null;

    const r = annualRate / 100;
    const n = compoundFrequency;
    const t = years;

    const finalAmount = principal * Math.pow(1 + r / n, n * t);
    const totalInterest = finalAmount - principal;
    const effectiveRate = (Math.pow(1 + r / n, n) - 1) * 100;

    const yearlyData = [];
    for (let year = 1; year <= t; year++) {
      const amount = principal * Math.pow(1 + r / n, n * year);
      yearlyData.push({
        year,
        amount,
        interest: amount - principal,
      });
    }

    return { finalAmount, totalInterest, effectiveRate, yearlyData };
  }, [principal, annualRate, years, compoundFrequency]);

  const frequencyOptions = [
    { value: 1, label: "年复利" },
    { value: 4, label: "季复利" },
    { value: 12, label: "月复利" },
    { value: 365, label: "日复利" },
  ];

  return (
    <ToolLayout
      title="复利计算器"
      description="计算复利收益，支持年/季/月/日复利，实时查看收益增长曲线，助您规划投资"
      toolId="compound-interest"
      icon={TrendingUp}
      category="计算工具"
      slug="compound-interest"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                投资信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 本金 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  初始本金
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
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
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥1,000</span>
                <span>¥1,000,000</span>
              </div>
            </div>

            {/* 年利率 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-emerald-500" />
                  年利率
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {annualRate} %
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={20}
                step={0.1}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>0.5%</span>
                <span>20%</span>
              </div>
            </div>

            {/* 投资期限 */}
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
                min={1}
                max={50}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1年</span>
                <span>50年</span>
              </div>
            </div>

            {/* 复利频率 */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                复利频率
              </label>
              <div className="grid grid-cols-4 gap-2">
                {frequencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCompoundFrequency(opt.value)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      compoundFrequency === opt.value
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 dark:hover:border-emerald-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 计算结果 */}
        {result && (
          <>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25">
              <div className="flex items-center gap-2 mb-6">
                <PiggyBank className="w-5 h-5" />
                <h2 className="text-base font-semibold">计算结果</h2>
              </div>

              <div className="text-center mb-6">
                <div className="text-sm text-emerald-100 mb-1">最终金额</div>
                <div className="text-4xl font-bold">
                  ¥ {formatCurrency(result.finalAmount)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-emerald-100 mb-1">初始本金</div>
                  <div className="text-lg font-semibold">
                    ¥{formatCurrency(principal / 10000)}万
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-emerald-100 mb-1">总收益</div>
                  <div className="text-lg font-semibold">
                    ¥{formatCurrency(result.totalInterest / 10000)}万
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-emerald-100 mb-1">实际年化</div>
                  <div className="text-lg font-semibold">
                    {result.effectiveRate.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 年度收益表 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    年度收益明细
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                        年份
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        本息合计
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        累计收益
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {result.yearlyData.map((item) => (
                      <tr
                        key={item.year}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                      >
                        <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                          第{item.year}年
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-white font-mono">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                          +{formatCurrency(item.interest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              复利计算器是一款专业的投资收益计算工具，支持年复利、季复利、月复利和日复利多种计息方式。
              通过输入本金、年利率和投资期限，您可以快速计算出复利收益，直观感受"利滚利"的威力。
            </p>
            <p>
              复利公式：F = P × (1 + r/n)^(n×t)，其中 P 为本金，r 为年利率，n 为每年复利次数，t 为年数。
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
