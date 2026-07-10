"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PiggyBank } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RetirementCalcPage() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [monthlyExpense, setMonthlyExpense] = useState(8000);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [monthlyContribute, setMonthlyContribute] = useState(2000);
  const [rate, setRate] = useState(6);
  const [pension, setPension] = useState(3000);

  const result = useMemo(() => {
    const workYears = Math.max(0, retireAge - currentAge);
    const retireYears = Math.max(0, lifeExpectancy - retireAge);
    const r = rate / 100 / 12;

    // 退休时积累的储蓄
    const workMonths = workYears * 12;
    const savingsFV = currentSavings * Math.pow(1 + r, workMonths);
    const contributeFV = r === 0 ? monthlyContribute * workMonths : monthlyContribute * ((Math.pow(1 + r, workMonths) - 1) / r);
    const totalAtRetire = savingsFV + contributeFV;

    // 退休后每月需要 = 月支出 - 养老金
    const monthlyNeed = Math.max(0, monthlyExpense - pension);
    // 退休期间总需求（考虑投资收益，用年金现值）
    const retireMonths = retireYears * 12;
    const totalNeed = r === 0 ? monthlyNeed * retireMonths : monthlyNeed * ((1 - Math.pow(1 + r, -retireMonths)) / r);

    const shortfall = totalNeed - totalAtRetire;
    const monthlyShortfall = shortfall > 0 && workMonths > 0 && r > 0 ? shortfall / ((Math.pow(1 + r, workMonths) - 1) / r) : 0;
    const canRetire = shortfall <= 0;

    return { workYears, retireYears, totalAtRetire, monthlyNeed, totalNeed, shortfall, monthlyShortfall, canRetire };
  }, [currentAge, retireAge, lifeExpectancy, monthlyExpense, currentSavings, monthlyContribute, rate, pension]);

  return (
    <ToolLayout title="退休金计算器" description="估算退休后所需储蓄和每月可领取金额规划" toolId="retirement-calc" icon={PiggyBank} category="金融理财" slug="retirement-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">当前年龄</label><input type="number" value={currentAge} onChange={(e) => setCurrentAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">退休年龄</label><input type="number" value={retireAge} onChange={(e) => setRetireAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">预期寿命</label><input type="number" value={lifeExpectancy} onChange={(e) => setLifeExpectancy(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">退休后月支出 (元)</label><input type="number" value={monthlyExpense} onChange={(e) => setMonthlyExpense(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">现有储蓄 (元)</label><input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">每月定投 (元)</label><input type="number" value={monthlyContribute} onChange={(e) => setMonthlyContribute(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">年化收益率 (%)</label><input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">预期养老金/月 (元)</label><input type="number" value={pension} onChange={(e) => setPension(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">工作年限</div><div className="text-xl font-bold text-white">{result.workYears} 年</div></div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">退休时储蓄</div><div className="text-xl font-bold text-emerald-400">{fmt(result.totalAtRetire)}</div></div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4"><div className="text-xs text-slate-400 mb-1">退休总需求</div><div className="text-xl font-bold text-orange-400">{fmt(result.totalNeed)}</div></div>
          <div className={`bg-gradient-to-br to-transparent rounded-xl border p-4 ${result.canRetire ? "from-emerald-500/10 border-emerald-500/20" : "from-rose-500/10 border-rose-500/20"}`}><div className="text-xs text-slate-400 mb-1">资金缺口</div><div className={`text-xl font-bold ${result.canRetire ? "text-emerald-400" : "text-rose-400"}`}>{fmt(Math.abs(result.shortfall))}</div></div>
        </div>

        <div className={`rounded-xl border p-5 ${result.canRetire ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
          <p className="text-sm text-slate-300">{result.canRetire ? "恭喜！按当前规划，您的退休储蓄充足。" : `您的退休储蓄存在缺口，建议每月增加定投 ${fmt(result.monthlyShortfall)} 元。`}</p>
          <p className="text-xs text-slate-500 mt-2">退休后每月还需自筹 {fmt(result.monthlyNeed)} 元（月支出扣除养老金）。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
