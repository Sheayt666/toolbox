"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Wallet } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TAX_BRACKETS = [
  { max: 36000, rate: 0.03, deduction: 0 },
  { max: 144000, rate: 0.1, deduction: 2520 },
  { max: 300000, rate: 0.2, deduction: 16920 },
  { max: 420000, rate: 0.25, deduction: 31920 },
  { max: 660000, rate: 0.3, deduction: 52920 },
  { max: 960000, rate: 0.35, deduction: 85920 },
  { max: Infinity, rate: 0.45, deduction: 181920 },
];

function calcTax(taxable: number) {
  for (const b of TAX_BRACKETS) {
    if (taxable <= b.max) return Math.max(0, taxable * b.rate - b.deduction);
  }
  return 0;
}

export default function SalaryAfterTaxPage() {
  const [salary, setSalary] = useState(15000);
  const [socialPct, setSocialPct] = useState(10.5);
  const [housingFundPct, setHousingFundPct] = useState(12);
  const [specialDeduction, setSpecialDeduction] = useState(2000);

  const result = useMemo(() => {
    const socialBase = Math.min(salary, 30000); // 社保基数上限
    const socialInsurance = socialBase * (socialPct / 100);
    const housingFund = socialBase * (housingFundPct / 100);
    const totalSocial = socialInsurance + housingFund;

    const monthlyTaxable = Math.max(0, salary - totalSocial - 5000 - specialDeduction);
    const annualTaxable = monthlyTaxable * 12;
    const annualTax = calcTax(annualTaxable);
    const monthlyTax = annualTax / 12;
    const afterTax = salary - totalSocial - monthlyTax;

    return { socialInsurance, housingFund, totalSocial, monthlyTaxable, annualTax, monthlyTax, afterTax };
  }, [salary, socialPct, housingFundPct, specialDeduction]);

  return (
    <ToolLayout title="税后工资计算" description="计算税后到手工资，包含五险一金和专项扣除" toolId="salary-after-tax" icon={Wallet} category="金融理财" slug="salary-after-tax">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">税前月薪 (元)</label><input type="number" value={salary} onChange={(e) => setSalary(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">社保比例 (%)</label><input type="number" step="0.1" value={socialPct} onChange={(e) => setSocialPct(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">公积金比例 (%)</label><input type="number" value={housingFundPct} onChange={(e) => setHousingFundPct(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">专项附加扣除/月 (元)</label><input type="number" value={specialDeduction} onChange={(e) => setSpecialDeduction(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">五险一金</div><div className="text-xl font-bold text-white">{fmt(result.totalSocial)}</div></div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4"><div className="text-xs text-slate-400 mb-1">个人所得税/月</div><div className="text-xl font-bold text-orange-400">{fmt(result.monthlyTax)}</div></div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">到手工资</div><div className="text-xl font-bold text-emerald-400">{fmt(result.afterTax)}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">年缴税</div><div className="text-xl font-bold text-sky-400">{fmt(result.annualTax)}</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">工资明细</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">税前工资</span><span className="text-white">{fmt(salary)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">- 社保</span><span className="text-rose-400">{fmt(result.socialInsurance)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">- 住房公积金</span><span className="text-rose-400">{fmt(result.housingFund)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">- 起征点</span><span className="text-slate-500">5,000.00</span></div>
            <div className="flex justify-between"><span className="text-slate-400">- 专项附加扣除</span><span className="text-slate-500">{fmt(specialDeduction)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">应纳税所得额</span><span className="text-white">{fmt(result.monthlyTaxable * 12)}/年</span></div>
            <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-300 font-medium">到手工资</span><span className="text-emerald-400 font-bold text-lg">{fmt(result.afterTax)}</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
