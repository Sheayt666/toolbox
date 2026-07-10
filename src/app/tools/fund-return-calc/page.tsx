"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PieChart } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function FundReturnCalcPage() {
  const [lumpAmount, setLumpAmount] = useState(50000);
  const [lumpNAV, setLumpNAV] = useState(1.5);
  const [currentNAV, setCurrentNAV] = useState(1.8);
  const [monthly, setMonthly] = useState(1000);
  const [months, setMonths] = useState(24);

  const result = useMemo(() => {
    // 一次性买入收益
    const lumpShares = lumpAmount / lumpNAV;
    const lumpValue = lumpShares * currentNAV;
    const lumpReturn = lumpValue - lumpAmount;
    const lumpReturnRate = (lumpReturn / lumpAmount) * 100;

    // 定投收益（简化：用平均净值估算）
    const avgNAV = (lumpNAV + currentNAV) / 2;
    const totalShares = monthly / avgNAV * months;
    const dcaValue = totalShares * currentNAV;
    const dcaInvested = monthly * months;
    const dcaReturn = dcaValue - dcaInvested;
    const dcaReturnRate = (dcaReturn / dcaInvested) * 100;

    return { lumpShares, lumpValue, lumpReturn, lumpReturnRate, totalShares, dcaValue, dcaInvested, dcaReturn, dcaReturnRate };
  }, [lumpAmount, lumpNAV, currentNAV, monthly, months]);

  return (
    <ToolLayout title="基金收益计算" description="计算基金投资收益，支持定投和一次性买入对比" toolId="fund-return-calc" icon={PieChart} category="金融理财" slug="fund-return-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">一次性买入金额 (元)</label>
            <input type="number" value={lumpAmount} onChange={(e) => setLumpAmount(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">买入时净值</label>
            <input type="number" step="0.0001" value={lumpNAV} onChange={(e) => setLumpNAV(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">当前净值</label>
            <input type="number" step="0.0001" value={currentNAV} onChange={(e) => setCurrentNAV(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">定投月数</label>
            <input type="number" value={months} onChange={(e) => setMonths(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">每月定投金额 (元)</label>
            <input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">一次性买入</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">持有份额</span><span className="text-white">{result.lumpShares.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">当前市值</span><span className="text-white">{fmt(result.lumpValue)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">投资收益</span><span className={result.lumpReturn >= 0 ? "text-emerald-400" : "text-rose-400"}>{fmt(result.lumpReturn)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">收益率</span><span className={`font-bold ${result.lumpReturnRate >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{result.lumpReturnRate.toFixed(2)}%</span></div>
            </div>
          </div>
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <h3 className="text-sm font-semibold text-white mb-3">定投</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">累计份额</span><span className="text-white">{result.totalShares.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">当前市值</span><span className="text-white">{fmt(result.dcaValue)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">投资收益</span><span className={result.dcaReturn >= 0 ? "text-emerald-400" : "text-rose-400"}>{fmt(result.dcaReturn)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">收益率</span><span className={`font-bold ${result.dcaReturnRate >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{result.dcaReturnRate.toFixed(2)}%</span></div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
