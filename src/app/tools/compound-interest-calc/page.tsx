"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TrendingUp, Info } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CompoundInterestCalcPage() {
  const [principal, setPrincipal] = useState(10000);
  const [monthlyAdd, setMonthlyAdd] = useState(1000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(10);
  const [compoundFreq, setCompoundFreq] = useState(12);

  const result = useMemo(() => {
    const r = rate / 100 / compoundFreq;
    const n = years * compoundFreq;
    const monthlyAddPerPeriod = monthlyAdd / (compoundFreq / 12);

    // 一次性投入复利
    const lumpSum = principal * Math.pow(1 + r, n);

    // 定期定额复利（年金终值）
    let total = principal;
    const yearlyData: { year: number; value: number; invested: number }[] = [];
    for (let i = 1; i <= n; i++) {
      total = total * (1 + r) + monthlyAddPerPeriod;
      if (i % compoundFreq === 0) {
        const yr = i / compoundFreq;
        const invested = principal + monthlyAdd * 12 * yr;
        yearlyData.push({ year: yr, value: total, invested });
      }
    }
    const totalInvested = principal + monthlyAdd * 12 * years;
    const totalInterest = total - totalInvested;

    return { lumpSum, total, totalInvested, totalInterest, yearlyData };
  }, [principal, monthlyAdd, rate, years, compoundFreq]);

  return (
    <ToolLayout title="复利计算器" description="计算复利投资收益，支持定期定额和一次性投入" toolId="compound-interest-calc" icon={TrendingUp} category="金融理财" slug="compound-interest-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">初始本金 (元)</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">每月定投 (元)</label>
            <input type="number" value={monthlyAdd} onChange={(e) => setMonthlyAdd(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年化收益率 (%)</label>
            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">投资年限 (年)</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">复利频率</label>
          <div className="flex gap-2 flex-wrap">
            {[{ v: 1, l: "年复利" }, { v: 4, l: "季复利" }, { v: 12, l: "月复利" }, { v: 365, l: "日复利" }].map((f) => (
              <button key={f.v} onClick={() => setCompoundFreq(f.v)} className={`px-4 py-2 rounded-lg text-sm border transition-all ${compoundFreq === f.v ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400 hover:text-white"}`}>{f.l}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">期末总金额</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.total)}</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">累计投入</div>
            <div className="text-xl font-bold text-white">{fmt(result.totalInvested)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">净收益</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.totalInterest)}</div>
          </div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">一次性投入终值</div>
            <div className="text-xl font-bold text-sky-400">{fmt(result.lumpSum)}</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3f3f46] flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">逐年收益增长</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0d0d0f] text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">年份</th>
                  <th className="px-4 py-2 text-right">总价值</th>
                  <th className="px-4 py-2 text-right">累计投入</th>
                  <th className="px-4 py-2 text-right">收益</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlyData.map((d) => (
                  <tr key={d.year} className="border-t border-[#3f3f46]">
                    <td className="px-4 py-2 text-slate-300">第 {d.year} 年</td>
                    <td className="px-4 py-2 text-right text-emerald-400">{fmt(d.value)}</td>
                    <td className="px-4 py-2 text-right text-slate-300">{fmt(d.invested)}</td>
                    <td className="px-4 py-2 text-right text-orange-400">{fmt(d.value - d.invested)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
