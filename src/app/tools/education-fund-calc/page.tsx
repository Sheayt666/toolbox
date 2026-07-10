"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { GraduationCap } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function EducationFundCalcPage() {
  const [currentAge, setCurrentAge] = useState(3);
  const [collegeAge, setCollegeAge] = useState(18);
  const [targetAmount, setTargetAmount] = useState(300000);
  const [rate, setRate] = useState(6);
  const [lumpSum, setLumpSum] = useState(0);

  const result = useMemo(() => {
    const years = Math.max(0, collegeAge - currentAge);
    const r = rate / 100 / 12;
    const n = years * 12;
    // 目标金额终值 = 一次性投入终值 + 月定投终值
    // target = lumpSum*(1+r)^n + PMT*[((1+r)^n -1)/r]
    const lumpFV = lumpSum * Math.pow(1 + r, n);
    const needFromMonthly = Math.max(0, targetAmount - lumpFV);
    const monthlyNeeded = r === 0 ? needFromMonthly / n : needFromMonthly / ((Math.pow(1 + r, n) - 1) / r);

    // 如果按某月定投金额反算终值
    const totalInvested = monthlyNeeded * n + lumpSum * 1;
    const totalReturn = targetAmount - totalInvested;

    return { years, monthlyNeeded, lumpFV, totalInvested, totalReturn };
  }, [currentAge, collegeAge, targetAmount, rate, lumpSum]);

  return (
    <ToolLayout title="教育金规划" description="规划子女教育金，计算每月定投和预期收益" toolId="education-fund-calc" icon={GraduationCap} category="金融理财" slug="education-fund-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">孩子当前年龄</label>
            <input type="number" value={currentAge} onChange={(e) => setCurrentAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">上大学年龄</label>
            <input type="number" value={collegeAge} onChange={(e) => setCollegeAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">教育金目标 (元)</label>
            <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">预期年化收益率 (%)</label>
            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">已有一次性投入 (元)</label>
            <input type="number" value={lumpSum} onChange={(e) => setLumpSum(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">投资年限</div>
            <div className="text-xl font-bold text-white">{result.years} 年</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">每月需定投</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.monthlyNeeded)}</div>
          </div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">一次性投入终值</div>
            <div className="text-xl font-bold text-sky-400">{fmt(result.lumpFV)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">投资收益</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.totalReturn)}</div>
          </div>
        </div>

        <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">为了在孩子 {result.years} 年后上大学时积累 <span className="text-primary-400 font-bold">{fmt(targetAmount)}</span> 元教育金，在年化收益率 {rate}% 的前提下，您需要每月定投 <span className="text-emerald-400 font-bold">{fmt(result.monthlyNeeded)}</span> 元。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
