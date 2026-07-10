"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Repeat, TrendingUp } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DollarCostAveragingPage() {
  const [monthly, setMonthly] = useState(2000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(20);

  const result = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    // 定投终值公式 FV = PMT * [((1+r)^n - 1) / r]
    const fv = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r);
    const totalInvested = monthly * n;
    const totalReturn = fv - totalInvested;
    const returnRate = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    const yearly: { year: number; value: number; invested: number }[] = [];
    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      const val = r === 0 ? monthly * months : monthly * ((Math.pow(1 + r, months) - 1) / r);
      yearly.push({ year: y, value: val, invested: monthly * months });
    }

    return { fv, totalInvested, totalReturn, returnRate, yearly };
  }, [monthly, rate, years]);

  const maxVal = result.yearly.length > 0 ? result.yearly[result.yearly.length - 1].value : 1;

  return (
    <ToolLayout title="定投收益计算" description="基金定投收益计算器，展示复利效应和收益曲线" toolId="dollar-cost-averaging" icon={Repeat} category="金融理财" slug="dollar-cost-averaging">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">每月定投 (元)</label>
            <input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">预期年化收益率 (%)</label>
            <input type="number" step="0.1" value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">定投年限 (年)</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">期末总金额</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.fv)}</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">累计投入</div>
            <div className="text-xl font-bold text-white">{fmt(result.totalInvested)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">投资收益</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.totalReturn)}</div>
          </div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">收益率</div>
            <div className="text-xl font-bold text-sky-400">{result.returnRate.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">收益增长曲线</h3>
          </div>
          <div className="space-y-1.5">
            {result.yearly.map((d) => (
              <div key={d.year} className="flex items-center gap-3 text-xs">
                <span className="text-slate-400 w-12">第{d.year}年</span>
                <div className="flex-1 bg-[#0d0d0f] rounded-full h-5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${(d.value / maxVal) * 100}%` }}>
                    <span className="text-[10px] text-white font-medium">{fmt(d.value)}</span>
                  </div>
                </div>
                <span className="text-slate-500 w-20 text-right">投入{fmt(d.invested)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
