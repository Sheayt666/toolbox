"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ShieldCheck } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function InsuranceNeedsCalcPage() {
  const [annualIncome, setAnnualIncome] = useState(200000);
  const [years, setYears] = useState(10);
  const [debt, setDebt] = useState(800000);
  const [kidsEdu, setKidsEdu] = useState(500000);
  const [elderly, setElderly] = useState(300000);
  const [savings, setSavings] = useState(200000);
  const [funeral, setFuneral] = useState(100000);

  const result = useMemo(() => {
    // 寿险需求 = 未来收入替代 + 负债 + 子女教育 + 赡养老人 + 丧葬 - 现有储蓄
    const incomeNeed = annualIncome * years;
    const totalNeed = incomeNeed + debt + kidsEdu + elderly + funeral;
    const netNeed = Math.max(0, totalNeed - savings);
    return { incomeNeed, totalNeed, netNeed, ratio: annualIncome > 0 ? netNeed / annualIncome : 0 };
  }, [annualIncome, years, debt, kidsEdu, elderly, savings, funeral]);

  return (
    <ToolLayout title="保险需求评估" description="根据收入负债家庭情况估算保险需求额度" toolId="insurance-needs-calc" icon={ShieldCheck} category="金融理财" slug="insurance-needs-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年收入 (元)</label>
            <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">需保障年限</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">负债总额 (元)</label>
            <input type="number" value={debt} onChange={(e) => setDebt(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">子女教育金 (元)</label>
            <input type="number" value={kidsEdu} onChange={(e) => setKidsEdu(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">赡养老人 (元)</label>
            <input type="number" value={elderly} onChange={(e) => setElderly(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">现有储蓄 (元)</label>
            <input type="number" value={savings} onChange={(e) => setSavings(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">收入替代需求</div>
            <div className="text-xl font-bold text-white">{fmt(result.incomeNeed)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">总保障需求</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.totalNeed)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">建议保额</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.netNeed)}</div>
          </div>
        </div>

        <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">建议寿险保额约为年收入的 <span className="text-primary-400 font-bold">{result.ratio.toFixed(0)}</span> 倍。优先配置定期寿险，性价比最高。同时建议补充重疾险和医疗险。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
