"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shield, Calculator, DollarSign } from "lucide-react";

export default function SocialInsuranceCalculatorPage() {
  const [salary, setSalary] = useState("10000");
  const [city, setCity] = useState("beijing");

  const cityRates: Record<string, { name: string; personal: Record<string, number>; company: Record<string, number> }> = {
    beijing: {
      name: "北京",
      personal: { 养老: 8, 医疗: 2, 失业: 0.5 },
      company: { 养老: 16, 医疗: 9.8, 失业: 0.5, 工伤: 0.4, 生育: 0.8 },
    },
    shanghai: {
      name: "上海",
      personal: { 养老: 8, 医疗: 2, 失业: 0.5 },
      company: { 养老: 16, 医疗: 9.5, 失业: 0.5, 工伤: 0.26, 生育: 1 },
    },
    shenzhen: {
      name: "深圳",
      personal: { 养老: 8, 医疗: 2, 失业: 0.3 },
      company: { 养老: 14, 医疗: 5.2, 失业: 0.7, 工伤: 0.2, 生育: 0.45 },
    },
    guangzhou: {
      name: "广州",
      personal: { 养老: 8, 医疗: 2, 失业: 0.2 },
      company: { 养老: 14, 医疗: 5.5, 失业: 0.32, 工伤: 0.2, 生育: 0.45 },
    },
    hangzhou: {
      name: "杭州",
      personal: { 养老: 8, 医疗: 2, 失业: 0.5 },
      company: { 养老: 14, 医疗: 9.5, 失业: 0.5, 工伤: 0.4, 生育: 1.2 },
    },
  };

  const rates = cityRates[city];

  const calculate = () => {
    const s = parseFloat(salary) || 0;

    let personalTotal = 0;
    const personalItems: Record<string, number> = {};
    for (const [name, rate] of Object.entries(rates.personal)) {
      const amount = s * (rate / 100);
      personalItems[name] = amount;
      personalTotal += amount;
    }

    let companyTotal = 0;
    const companyItems: Record<string, number> = {};
    for (const [name, rate] of Object.entries(rates.company)) {
      const amount = s * (rate / 100);
      companyItems[name] = amount;
      companyTotal += amount;
    }

    return {
      personalTotal: personalTotal.toFixed(2),
      companyTotal: companyTotal.toFixed(2),
      total: (personalTotal + companyTotal).toFixed(2),
      personalItems,
      companyItems,
      netSalary: (s - personalTotal).toFixed(2),
    };
  };

  const result = calculate();

  return (
    <ToolLayout
      title="社保计算器"
      description="五险一金社保计算工具，支持多个城市，计算个人和单位缴纳明细"
      toolId="social-insurance-calculator"
      icon={Shield}
      category="计算工具"
      slug="social-insurance-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">基本信息</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">选择城市</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              {Object.entries(cityRates).map(([key, val]) => (
                <option key={key} value={key}>{val.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">月缴费基数（元）</label>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-indigo-500 font-mono text-lg"
            />
          </div>
        </div>

        {/* 个人缴纳 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-indigo-500/5">
            <h3 className="text-base font-semibold text-indigo-300">个人缴纳明细</h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(result.personalItems).map(([name, amount]) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-sm text-zinc-400">{name}保险 ({rates.personal[name]}%)</span>
                <span className="font-mono text-zinc-300">¥ {amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-indigo-300">个人合计</span>
              <span className="font-mono text-lg font-bold text-indigo-400">¥ {result.personalTotal}</span>
            </div>
          </div>
        </div>

        {/* 单位缴纳 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 bg-cyan-500/5">
            <h3 className="text-base font-semibold text-cyan-300">单位缴纳明细</h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(result.companyItems).map(([name, amount]) => (
              <div key={name} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-sm text-zinc-400">{name}保险 ({rates.company[name]}%)</span>
                <span className="font-mono text-zinc-300">¥ {amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-cyan-300">单位合计</span>
              <span className="font-mono text-lg font-bold text-cyan-400">¥ {result.companyTotal}</span>
            </div>
          </div>
        </div>

        {/* 汇总 */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-xl border border-indigo-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold">汇总</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">社保总缴纳</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono">¥ {result.total}</div>
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
              <div className="text-xs text-zinc-500 mb-1">税后工资(仅扣社保)</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">¥ {result.netSalary}</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-3">说明</h3>
          <ul className="text-sm text-zinc-400 space-y-2">
            <li>• 社保缴费比例因地区而异，以上数据仅供参考</li>
            <li>• 社保包含：养老、医疗、失业、工伤、生育五险</li>
            <li>• 缴费基数有上下限，具体以当地社保局公布为准</li>
            <li>• 本计算未包含公积金和个人所得税</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
