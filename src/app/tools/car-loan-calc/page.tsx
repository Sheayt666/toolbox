"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Car, Calendar } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CarLoanCalcPage() {
  const [price, setPrice] = useState(150000);
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(3);

  const result = useMemo(() => {
    const downPayment = (price * downPct) / 100;
    const loan = price - downPayment;
    const r = rate / 100 / 12;
    const n = years * 12;
    const monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - loan;
    return { downPayment, loan, monthly, totalPayment, totalInterest, n };
  }, [price, downPct, rate, years]);

  return (
    <ToolLayout title="车贷计算器" description="计算汽车贷款月供和总利息，支持首付比例调整" toolId="car-loan-calc" icon={Car} category="金融理财" slug="car-loan-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">车辆总价 (元)</label>
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">首付比例 (%)</label>
            <input type="number" value={downPct} onChange={(e) => setDownPct(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">贷款利率 (%)</label>
            <input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">贷款年限 (年)</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">首付金额</div>
            <div className="text-xl font-bold text-white">{fmt(result.downPayment)}</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">贷款金额</div>
            <div className="text-xl font-bold text-white">{fmt(result.loan)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">月供</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.monthly)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">总利息</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.totalInterest)}</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">还款概览</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">还款期数</span><span className="text-white font-semibold">{result.n} 期</span></div>
            <div className="flex justify-between"><span className="text-slate-400">还款总额</span><span className="text-white font-semibold">{fmt(result.totalPayment)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">利息占比</span><span className="text-orange-400 font-semibold">{result.totalPayment > 0 ? ((result.totalInterest / result.totalPayment) * 100).toFixed(1) : 0}%</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
