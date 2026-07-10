"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Scale, TrendingUp, Info } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BreakEvenCalcPage() {
  const [fixedCost, setFixedCost] = useState(50000);
  const [unitPrice, setUnitPrice] = useState(100);
  const [unitVarCost, setUnitVarCost] = useState(60);
  const [targetProfit, setTargetProfit] = useState(20000);

  const result = useMemo(() => {
    const contributionMargin = unitPrice - unitVarCost;
    const contributionRate = unitPrice > 0 ? contributionMargin / unitPrice : 0;
    const breakEvenUnits = contributionMargin > 0 ? fixedCost / contributionMargin : 0;
    const breakEvenRevenue = breakEvenUnits * unitPrice;
    const targetUnits = contributionMargin > 0 ? (fixedCost + targetProfit) / contributionMargin : 0;
    const targetRevenue = targetUnits * unitPrice;
    const marginOfSafety = targetUnits > 0 ? ((targetUnits - breakEvenUnits) / targetUnits) * 100 : 0;

    return {
      contributionMargin,
      contributionRate,
      breakEvenUnits,
      breakEvenRevenue,
      targetUnits,
      targetRevenue,
      marginOfSafety,
    };
  }, [fixedCost, unitPrice, unitVarCost, targetProfit]);

  return (
    <ToolLayout
      title="盈亏平衡计算"
      description="计算项目保本点，分析销量价格成本关系"
      toolId="break-even-calc"
      icon={Scale}
      category="金融理财"
      slug="break-even-calc"
    >
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">固定成本 (元)</label>
            <input type="number" value={fixedCost} onChange={(e) => setFixedCost(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">单位售价 (元)</label>
            <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">单位变动成本 (元)</label>
            <input type="number" value={unitVarCost} onChange={(e) => setUnitVarCost(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">目标利润 (元)</label>
            <input type="number" value={targetProfit} onChange={(e) => setTargetProfit(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">单位边际贡献</div>
            <div className="text-xl font-bold text-white">{fmt(result.contributionMargin)}</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">边际贡献率</div>
            <div className="text-xl font-bold text-white">{(result.contributionRate * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">盈亏平衡销量</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.breakEvenUnits)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">盈亏平衡收入</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.breakEvenRevenue)}</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">目标利润分析</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">达成目标利润所需销量</div>
              <div className="text-2xl font-bold text-primary-400">{fmt(result.targetUnits)}</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">所需销售收入</div>
              <div className="text-2xl font-bold text-white">{fmt(result.targetRevenue)}</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">安全边际率</div>
              <div className="text-2xl font-bold text-emerald-400">{result.marginOfSafety.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <p className="text-amber-400 font-medium mb-1">计算说明</p>
            <p>盈亏平衡点 = 固定成本 / (单位售价 - 单位变动成本)。边际贡献率 = (单位售价 - 单位变动成本) / 单位售价。安全边际率越高，经营风险越小。</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
