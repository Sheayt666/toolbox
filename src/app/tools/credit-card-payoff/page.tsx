"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CreditCard, Info } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CreditCardPayoffPage() {
  const [balance, setBalance] = useState(20000);
  const [apr, setApr] = useState(18);
  const [minPct, setMinPct] = useState(5);
  const [monthlyPay, setMonthlyPay] = useState(2000);
  const [installmentMonths, setInstallmentMonths] = useState(12);

  const result = useMemo(() => {
    const r = apr / 100 / 12;

    // 最低还款
    const minPay = Math.max(balance * (minPct / 100), 10);
    let bal = balance;
    let minTotalInterest = 0;
    let minMonths = 0;
    while (bal > 0 && minMonths < 600) {
      const interest = bal * r;
      let pay = Math.max(minPay, interest + 1);
      if (pay > bal + interest) pay = bal + interest;
      minTotalInterest += interest;
      bal -= pay - interest;
      minMonths++;
    }

    // 固定月供还清
    bal = balance;
    let fixedTotalInterest = 0;
    let fixedMonths = 0;
    while (bal > 0 && fixedMonths < 600) {
      const interest = bal * r;
      let pay = monthlyPay;
      if (pay > bal + interest) pay = bal + interest;
      fixedTotalInterest += interest;
      bal -= pay - interest;
      fixedMonths++;
    }

    // 分期还款（假设分期手续费率 = 年利率）
    const installmentFee = balance * (apr / 100) * (installmentMonths / 12);
    const installmentMonthly = (balance + installmentFee) / installmentMonths;
    const installmentTotal = balance + installmentFee;

    return {
      minPay, minTotalInterest, minMonths,
      fixedTotalInterest, fixedMonths,
      installmentMonthly, installmentFee, installmentTotal,
    };
  }, [balance, apr, minPct, monthlyPay, installmentMonths]);

  return (
    <ToolLayout title="信用卡还款计算" description="计算信用卡最低还款和分期还款的利息对比" toolId="credit-card-payoff" icon={CreditCard} category="金融理财" slug="credit-card-payoff">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">账单金额 (元)</label>
            <input type="number" value={balance} onChange={(e) => setBalance(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年利率 (%)</label>
            <input type="number" step="0.01" value={apr} onChange={(e) => setApr(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">最低还款比例 (%)</label>
            <input type="number" value={minPct} onChange={(e) => setMinPct(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">每月固定还款 (元)</label>
            <input type="number" value={monthlyPay} onChange={(e) => setMonthlyPay(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">分期期数 (月)</label>
            <input type="number" value={installmentMonths} onChange={(e) => setInstallmentMonths(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">最低还款</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">最低还款额</span><span className="text-white">{fmt(result.minPay)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">还清时间</span><span className="text-white">{result.minMonths} 个月</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">总利息</span><span className="text-rose-400 font-bold">{fmt(result.minTotalInterest)}</span></div>
            </div>
          </div>
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">固定月供还款</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">每月还款</span><span className="text-white">{fmt(monthlyPay)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">还清时间</span><span className="text-white">{result.fixedMonths} 个月</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">总利息</span><span className="text-emerald-400 font-bold">{fmt(result.fixedTotalInterest)}</span></div>
            </div>
          </div>
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">分期还款</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">每期还款</span><span className="text-white">{fmt(result.installmentMonthly)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">分期手续费</span><span className="text-white">{fmt(result.installmentFee)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">总还款额</span><span className="text-orange-400 font-bold">{fmt(result.installmentTotal)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="text-amber-400 font-medium mb-1">温馨提示</p>
            <p>最低还款利息最高，建议尽量多还款。固定月供还款可在 {result.fixedMonths} 个月内还清，比分期还款总成本{result.fixedTotalInterest < result.installmentFee ? "更低" : "相近"}。</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
