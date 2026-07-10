"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Gift, TrendingUp, TrendingDown, Info } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 年终奖单独计税税率表
const BONUS_BRACKETS = [
  { max: 36000, rate: 0.03, deduction: 0 },
  { max: 144000, rate: 0.1, deduction: 2520 },
  { max: 300000, rate: 0.2, deduction: 16920 },
  { max: 420000, rate: 0.25, deduction: 31920 },
  { max: 660000, rate: 0.3, deduction: 52920 },
  { max: 960000, rate: 0.35, deduction: 85920 },
  { max: Infinity, rate: 0.45, deduction: 181920 },
];

// 综合所得税率表
const INCOME_BRACKETS = [
  { max: 36000, rate: 0.03, deduction: 0 },
  { max: 144000, rate: 0.1, deduction: 2520 },
  { max: 300000, rate: 0.2, deduction: 16920 },
  { max: 420000, rate: 0.25, deduction: 31920 },
  { max: 660000, rate: 0.3, deduction: 52920 },
  { max: 960000, rate: 0.35, deduction: 85920 },
  { max: Infinity, rate: 0.45, deduction: 181920 },
];

function calcBonusTaxSeparate(bonus: number) {
  if (bonus <= 0) return { tax: 0, rate: 0, deduction: 0 };
  const monthly = bonus / 12;
  for (const b of BONUS_BRACKETS) {
    if (monthly <= b.max / 12 + 0.01) {
      return { tax: Math.max(0, bonus * b.rate - b.deduction), rate: b.rate, deduction: b.deduction };
    }
  }
  return { tax: 0, rate: 0, deduction: 0 };
}

function calcIncomeTax(taxable: number) {
  for (const b of INCOME_BRACKETS) {
    if (taxable <= b.max) {
      return Math.max(0, taxable * b.rate - b.deduction);
    }
  }
  return 0;
}

export default function AnnualBonusTaxPage() {
  const [bonus, setBonus] = useState(50000);
  const [annualIncome, setAnnualIncome] = useState(150000);
  const [annualSocial, setAnnualSocial] = useState(24000);
  const [annualSpecial, setAnnualSpecial] = useState(36000);

  const result = useMemo(() => {
    // 单独计税
    const separate = calcBonusTaxSeparate(bonus);
    const separateBonusTax = separate.tax;
    const separateAfterTax = bonus - separateBonusTax;

    // 合并计税
    const annualTaxable = Math.max(0, annualIncome - 60000 - annualSocial - annualSpecial);
    const mergedTaxable = annualTaxable + bonus;
    const mergedTotalTax = calcIncomeTax(mergedTaxable);
    const originalTax = calcIncomeTax(annualTaxable);
    const mergedBonusTax = mergedTotalTax - originalTax;
    const mergedAfterTax = bonus - mergedBonusTax;

    const better = separateBonusTax <= mergedBonusTax ? "separate" : "merged";
    const saved = Math.abs(separateBonusTax - mergedBonusTax);

    return {
      separateBonusTax,
      separateAfterTax,
      separateRate: separate.rate,
      mergedBonusTax,
      mergedAfterTax,
      better,
      saved,
    };
  }, [bonus, annualIncome, annualSocial, annualSpecial]);

  return (
    <ToolLayout
      title="年终奖个税"
      description="计算年终奖个人所得税，单独计税与合并对比"
      toolId="annual-bonus-tax"
      icon={Gift}
      category="金融理财"
      slug="annual-bonus-tax"
    >
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年终奖金额 (元)</label>
            <input type="number" value={bonus} onChange={(e) => setBonus(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年度工资总额 (元)</label>
            <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年度五险一金 (元)</label>
            <input type="number" value={annualSocial} onChange={(e) => setAnnualSocial(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年度专项附加扣除 (元)</label>
            <input type="number" value={annualSpecial} onChange={(e) => setAnnualSpecial(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 单独计税 */}
          <div className={`rounded-xl border p-5 ${result.better === "separate" ? "bg-emerald-500/5 border-emerald-500/30" : "bg-[#27272a] border-[#3f3f46]"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">单独计税</h3>
              {result.better === "separate" && <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">推荐</span>}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">适用税率</span><span className="text-white">{(result.separateRate * 100).toFixed(0)}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">应纳税额</span><span className="text-orange-400 font-semibold">{fmt(result.separateBonusTax)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">税后年终奖</span><span className="text-emerald-400 font-bold text-lg">{fmt(result.separateAfterTax)}</span></div>
            </div>
          </div>

          {/* 合并计税 */}
          <div className={`rounded-xl border p-5 ${result.better === "merged" ? "bg-emerald-500/5 border-emerald-500/30" : "bg-[#27272a] border-[#3f3f46]"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">合并计税</h3>
              {result.better === "merged" && <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">推荐</span>}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">年终奖部分税额</span><span className="text-orange-400 font-semibold">{fmt(result.mergedBonusTax)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">税后年终奖</span><span className="text-emerald-400 font-bold text-lg">{fmt(result.mergedAfterTax)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4 flex items-center gap-3">
          <Info className="w-5 h-5 text-primary-400 flex-shrink-0" />
          <div className="text-sm">
            <span className="text-slate-300">建议选择</span>
            <span className="text-primary-400 font-bold mx-1">{result.better === "separate" ? "单独计税" : "合并计税"}</span>
            <span className="text-slate-300">，可少缴税</span>
            <span className="text-emerald-400 font-bold mx-1">{fmt(result.saved)}</span>
            <span className="text-slate-300">元</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
