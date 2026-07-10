"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Target } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SavingsGoalCalcPage() {
  const [goal, setGoal] = useState(100000);
  const [currentSavings, setCurrentSavings] = useState(10000);
  const [monthlySave, setMonthlySave] = useState(3000);
  const [rate, setRate] = useState(4);

  const result = useMemo(() => {
    const r = rate / 100 / 12;

    // 1. 已知月存，算需要多少月
    let bal = currentSavings;
    let months = 0;
    while (bal < goal && months < 1200) {
      bal = bal * (1 + r) + monthlySave;
      months++;
    }

    // 2. 已知目标月数，算每月需存
    const targetMonths = 36;
    const futureCurrent = currentSavings * Math.pow(1 + r, targetMonths);
    const need = Math.max(0, goal - futureCurrent);
    const monthlyNeeded = r === 0 ? need / targetMonths : need / ((Math.pow(1 + r, targetMonths) - 1) / r);

    return { months, monthlyNeeded, futureCurrent, targetMonths };
  }, [goal, currentSavings, monthlySave, rate]);

  return (
    <ToolLayout title="储蓄目标计算" description="设定储蓄目标，计算每月需存金额和达成时间" toolId="savings-goal-calc" icon={Target} category="金融理财" slug="savings-goal-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">储蓄目标 (元)</label><input type="number" value={goal} onChange={(e) => setGoal(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">现有储蓄 (元)</label><input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">每月存入 (元)</label><input type="number" value={monthlySave} onChange={(e) => setMonthlySave(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">年化利率 (%)</label><input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">按当前月存计算</h3>
            <div className="text-3xl font-bold text-emerald-400 mb-2">{Math.floor(result.months / 12)}年{result.months % 12}月</div>
            <p className="text-xs text-slate-400">达成 {fmt(goal)} 元目标需要的时间</p>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">3年内达成需月存</h3>
            <div className="text-3xl font-bold text-primary-400 mb-2">{fmt(result.monthlyNeeded)}</div>
            <p className="text-xs text-slate-400">在 {result.targetMonths} 个月内达成目标的每月储蓄额</p>
          </div>
        </div>

        <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">按每月存 <span className="text-primary-400 font-bold">{fmt(monthlySave)}</span> 元、年利率 {rate}% 计算，约 <span className="text-emerald-400 font-bold">{Math.floor(result.months / 12)}年{result.months % 12}月</span> 可达成 {fmt(goal)} 元储蓄目标。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
