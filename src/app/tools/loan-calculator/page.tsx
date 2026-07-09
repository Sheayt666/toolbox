"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  DollarSign,
  Percent,
  Calendar,
  CreditCard,
  Info,
  Calculator,
} from "lucide-react";

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [annualRate, setAnnualRate] = useState(4.5);
  const [months, setMonths] = useState(24);

  const result = useMemo(() => {
    if (loanAmount <= 0 || annualRate < 0 || months <= 0) return null;

    const monthlyRate = annualRate / 100 / 12;
    let monthlyPayment: number;

    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / months;
    } else {
      monthlyPayment =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    const schedule = [];
    let remainingPrincipal = loanAmount;
    for (let i = 1; i <= months; i++) {
      const interest = remainingPrincipal * monthlyRate;
      const principalPart = monthlyPayment - interest;
      remainingPrincipal -= principalPart;
      schedule.push({
        month: i,
        payment: monthlyPayment,
        principal: principalPart,
        interest,
        remaining: Math.max(0, remainingPrincipal),
      });
    }

    return { monthlyPayment, totalPayment, totalInterest, schedule };
  }, [loanAmount, annualRate, months]);

  return (
    <ToolLayout
      title="贷款计算器"
      description="等额本息贷款计算器，计算月供、总利息和还款总额，支持查看还款明细"
      toolId="loan-calculator"
      icon={CreditCard}
      category="计算工具"
      slug="loan-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                贷款信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-violet-500" />
                  贷款金额
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  ¥ {formatCurrency(loanAmount)}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={5000000}
                step={10000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1万</span>
                <span>500万</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-violet-500" />
                  年利率
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  {annualRate} %
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={24}
                step={0.01}
                value={annualRate}
                onChange={(e) => setAnnualRate(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>0.5%</span>
                <span>24%</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Calendar className="w-4 h-4 text-violet-500" />
                  贷款期限
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  {months} 期 ({(months / 12).toFixed(1)}年)
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={360}
                step={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>3期</span>
                <span>360期</span>
              </div>
              <div className="grid grid-cols-6 gap-2 mt-4">
                {[6, 12, 24, 36, 60, 120].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      months === m
                        ? "bg-violet-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600"
                    }`}
                  >
                    {m}期
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {result && (
          <>
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/25">
              <div className="text-center mb-6">
                <div className="text-sm text-violet-100 mb-1">每月还款</div>
                <div className="text-4xl font-bold">
                  ¥ {formatCurrency(result.monthlyPayment)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-violet-100 mb-1">贷款总额</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(loanAmount / 10000)}万
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-violet-100 mb-1">总利息</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(result.totalInterest / 10000)}万
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-violet-100 mb-1">还款总额</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(result.totalPayment / 10000)}万
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    还款明细
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                        期数
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        月供
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        本金
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                        利息
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {result.schedule.slice(0, 12).map((item) => (
                      <tr
                        key={item.month}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                      >
                        <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                          第{item.month}期
                        </td>
                        <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-white font-mono">
                          {formatCurrency(item.payment)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatCurrency(item.principal)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-rose-600 dark:text-rose-400 font-mono">
                          {formatCurrency(item.interest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.schedule.length > 12 && (
                  <div className="p-3 text-center text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                    显示前12期，共{result.schedule.length}期
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              计算公式
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>等额本息还款：每月还款额固定，前期利息占比高，后期本金占比高。</p>
            <div className="mt-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl font-mono text-center">
              月供 = 本金 × 月利率 × (1+月利率)^还款月数 ÷ [(1+月利率)^还款月数 - 1]
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
