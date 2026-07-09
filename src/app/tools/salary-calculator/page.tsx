"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Wallet,
  DollarSign,
  Percent,
  Calculator,
  Info,
  User,
} from "lucide-react";

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// 2026年个税计算
function calculateTax(salary: number, socialInsurance: number, specialDeduction: number) {
  const monthlySalary = salary;
  const threshold = 5000;

  // 应纳税所得额 = 工资 - 五险一金 - 起征点 - 专项附加扣除
  const taxableIncome = Math.max(0, monthlySalary - socialInsurance - threshold - specialDeduction);

  // 月度税率表（简化版，实际按年累计计算）
  let tax = 0;
  if (taxableIncome <= 3000) {
    tax = taxableIncome * 0.03;
  } else if (taxableIncome <= 12000) {
    tax = taxableIncome * 0.1 - 210;
  } else if (taxableIncome <= 25000) {
    tax = taxableIncome * 0.2 - 1410;
  } else if (taxableIncome <= 35000) {
    tax = taxableIncome * 0.25 - 2660;
  } else if (taxableIncome <= 55000) {
    tax = taxableIncome * 0.3 - 4410;
  } else if (taxableIncome <= 80000) {
    tax = taxableIncome * 0.35 - 7160;
  } else {
    tax = taxableIncome * 0.45 - 15160;
  }

  tax = Math.max(0, tax);
  const afterTax = monthlySalary - socialInsurance - tax;
  const annualTax = tax * 12;
  const annualAfterTax = afterTax * 12;

  return {
    monthlyTax: tax,
    afterTax,
    annualTax,
    annualAfterTax,
    taxableIncome,
  };
}

export default function SalaryCalculatorPage() {
  const [salary, setSalary] = useState(15000);
  const [socialInsurance, setSocialInsurance] = useState(2000);
  const [specialDeduction, setSpecialDeduction] = useState(1000);

  const result = useMemo(() => {
    if (salary <= 0) return null;
    return calculateTax(salary, socialInsurance, specialDeduction);
  }, [salary, socialInsurance, specialDeduction]);

  return (
    <ToolLayout
      title="税前税后工资计算器"
      description="2026年最新个税计算，支持五险一金和专项附加扣除，快速计算税后工资"
      toolId="salary-calculator"
      icon={Wallet}
      category="计算工具"
      slug="salary-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-teal-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                工资信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-teal-500" />
                  税前月薪
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  ¥ {formatCurrency(salary)}
                </span>
              </div>
              <input
                type="range"
                min={3000}
                max={100000}
                step={100}
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥3,000</span>
                <span>¥100,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <User className="w-4 h-4 text-teal-500" />
                  五险一金
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  ¥ {formatCurrency(socialInsurance)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15000}
                step={100}
                value={socialInsurance}
                onChange={(e) => setSocialInsurance(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥0</span>
                <span>¥15,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-teal-500" />
                  专项附加扣除
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  ¥ {formatCurrency(specialDeduction)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={8000}
                step={100}
                value={specialDeduction}
                onChange={(e) => setSpecialDeduction(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥0</span>
                <span>¥8,000</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[0, 1000, 2000, 3000].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSpecialDeduction(d)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      specialDeduction === d
                        ? "bg-teal-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600"
                    }`}
                  >
                    {d === 0 ? "无" : `¥${d}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-500/25">
            <div className="text-center mb-6">
              <div className="text-sm text-teal-100 mb-1">税后月薪</div>
              <div className="text-5xl font-bold">
                ¥ {formatCurrency(result.afterTax)}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-teal-100 mb-1">月个税</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(result.monthlyTax)}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-teal-100 mb-1">年税后</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(result.annualAfterTax / 10000)}万
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-teal-100 mb-1">年个税</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(result.annualTax)}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-teal-100 mb-1">应纳税所得</div>
                <div className="text-base font-semibold">
                  ¥{formatCurrency(result.taxableIncome)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              个税税率表（月度）
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">级数</th>
                  <th className="py-2 px-3 text-left font-medium text-zinc-600 dark:text-zinc-400">应纳税所得额</th>
                  <th className="py-2 px-3 text-right font-medium text-zinc-600 dark:text-zinc-400">税率</th>
                  <th className="py-2 px-3 text-right font-medium text-zinc-600 dark:text-zinc-400">速算扣除</th>
                </tr>
              </thead>
              <tbody className="text-zinc-700 dark:text-zinc-300">
                {[
                  { range: "不超过3000元", rate: "3%", deduct: "0" },
                  { range: "3000-12000元", rate: "10%", deduct: "210" },
                  { range: "12000-25000元", rate: "20%", deduct: "1410" },
                  { range: "25000-35000元", rate: "25%", deduct: "2660" },
                  { range: "35000-55000元", rate: "30%", deduct: "4410" },
                  { range: "55000-80000元", rate: "35%", deduct: "7160" },
                  { range: "超过80000元", rate: "45%", deduct: "15160" },
                ].map((item, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 px-3">{i + 1}</td>
                    <td className="py-2 px-3">{item.range}</td>
                    <td className="py-2 px-3 text-right">{item.rate}</td>
                    <td className="py-2 px-3 text-right">{item.deduct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            注：起征点5000元/月，应纳税所得额 = 工资 - 五险一金 - 起征点 - 专项附加扣除。实际个税按年度累计计算，本工具为简化估算。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
