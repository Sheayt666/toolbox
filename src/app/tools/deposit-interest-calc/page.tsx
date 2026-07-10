"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Landmark } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const RATE_TABLE = [
  { label: "活期", rate: 0.2 },
  { label: "3个月定期", rate: 1.15 },
  { label: "6个月定期", rate: 1.35 },
  { label: "1年定期", rate: 1.45 },
  { label: "2年定期", rate: 1.65 },
  { label: "3年定期", rate: 1.95 },
  { label: "5年定期", rate: 2.0 },
];

export default function DepositInterestCalcPage() {
  const [principal, setPrincipal] = useState(100000);
  const [typeIdx, setTypeIdx] = useState(3);
  const [customRate, setCustomRate] = useState(1.45);
  const [useCustom, setUseCustom] = useState(false);

  const result = useMemo(() => {
    const rate = useCustom ? customRate : RATE_TABLE[typeIdx].rate;
    const r = rate / 100;
    // 简单利息
    const yearsMap = [0, 0.25, 0.5, 1, 2, 3, 5];
    const years = useCustom ? 1 : yearsMap[typeIdx];
    const simpleInterest = principal * r * years;
    // 复利（利滚利）
    const compoundInterest = principal * Math.pow(1 + r, years) - principal;
    // 利息税（暂免）
    const tax = 0;
    return { rate, years, simpleInterest, compoundInterest, tax, simpleTotal: principal + simpleInterest, compoundTotal: principal + compoundInterest };
  }, [principal, typeIdx, customRate, useCustom]);

  return (
    <ToolLayout title="存款利息计算" description="计算银行定期活期存款利息，支持多种存期" toolId="deposit-interest-calc" icon={Landmark} category="金融理财" slug="deposit-interest-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">存款金额 (元)</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <button onClick={() => setUseCustom(false)} className={`px-4 py-2.5 rounded-lg text-sm border transition-all ${!useCustom ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>选择存期</button>
            <button onClick={() => setUseCustom(true)} className={`px-4 py-2.5 rounded-lg text-sm border transition-all ${useCustom ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>自定义利率</button>
          </div>
        </div>

        {!useCustom ? (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">存款类型</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {RATE_TABLE.map((t, i) => (
                <button key={i} onClick={() => setTypeIdx(i)} className={`px-3 py-2.5 rounded-lg text-xs border text-center transition-all ${typeIdx === i ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400 hover:text-white"}`}>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-[10px] mt-0.5">{t.rate}%</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">自定义年利率 (%)</label>
              <input type="number" step="0.01" value={customRate} onChange={(e) => setCustomRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">年利率</div>
            <div className="text-xl font-bold text-white">{result.rate}%</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">存期</div>
            <div className="text-xl font-bold text-white">{result.years} 年</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">单利利息</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.simpleInterest)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">复利利息</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.compoundInterest)}</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">到期详情</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">单利到期本息</span><span className="text-white font-bold text-lg">{fmt(result.simpleTotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">复利到期本息</span><span className="text-white font-bold text-lg">{fmt(result.compoundTotal)}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#3f3f46] text-xs text-slate-500">注：储蓄存款利息税目前暂免征收</div>
        </div>
      </div>
    </ToolLayout>
  );
}
