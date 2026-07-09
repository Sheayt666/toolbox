"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Building2, Calculator, DollarSign, TrendingUp } from "lucide-react";

export default function HousingFundCalculatorPage() {
  const [salary, setSalary] = useState("10000");
  const [personalRate, setPersonalRate] = useState(12);
  const [companyRate, setCompanyRate] = useState(12);

  const calculate = () => {
    const s = parseFloat(salary) || 0;
    const personal = s * (personalRate / 100);
    const company = s * (companyRate / 100);
    const total = personal + company;
    const yearly = total * 12;

    return {
      personal: personal.toFixed(2),
      company: company.toFixed(2),
      total: total.toFixed(2),
      yearly: yearly.toFixed(2),
      monthly: s,
    };
  };

  const result = calculate();

  return (
    <ToolLayout
      title="公积金计算器"
      description="住房公积金计算工具，计算个人和单位缴纳金额，支持自定义缴费比例"
      toolId="housing-fund-calculator"
      icon={Building2}
      category="计算工具"
      slug="housing-fund-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold">缴费基数与比例</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">月缴费基数（元）</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-blue-500 font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-zinc-400">个人缴费比例</label>
              <span className="text-sm font-bold text-blue-400">{personalRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="12"
              step="1"
              value={personalRate}
              onChange={(e) => setPersonalRate(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm text-zinc-400">单位缴费比例</label>
              <span className="text-sm font-bold text-cyan-400">{companyRate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="12"
              step="1"
              value={companyRate}
              onChange={(e) => setCompanyRate(parseInt(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* 结果 */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold">计算结果（月）</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">个人缴纳</div>
              <div className="text-2xl font-bold text-blue-400 font-mono">¥ {result.personal}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">单位缴纳</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">¥ {result.company}</div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-center">
            <div className="text-xs text-blue-400/70 mb-1">月缴存总额</div>
            <div className="text-3xl font-bold text-blue-400 font-mono">¥ {result.total}</div>
          </div>
        </div>

        {/* 年度汇总 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold">年度累计</h3>
          </div>
          <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="text-xs text-emerald-400/70 mb-1">年缴存总额</div>
            <div className="text-3xl font-bold text-emerald-400 font-mono">¥ {result.yearly}</div>
            <div className="text-xs text-zinc-500 mt-2">个人+单位 合计</div>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-3">说明</h3>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• 公积金缴存比例一般在5%-12%之间，由单位和个人共同缴纳</li>
            <li>• 个人和单位缴纳的公积金全部计入个人账户</li>
            <li>• 公积金可用于购房、租房、装修等住房消费</li>
            <li>• 具体缴存比例以当地政策为准</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
