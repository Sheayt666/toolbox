"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ArrowDownRight } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InflationCalcPage() {
  const [amount, setAmount] = useState(10000);
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const r = inflationRate / 100;
    // 未来购买力 = 现在金额 / (1+r)^n
    const futureValue = amount / Math.pow(1 + r, years);
    const purchasingPowerLoss = amount - futureValue;
    const lossPct = (purchasingPowerLoss / amount) * 100;

    // 要保持购买力需要的未来金额
    const neededAmount = amount * Math.pow(1 + r, years);

    const yearly: { year: number; value: number; loss: number }[] = [];
    for (let y = 1; y <= years; y++) {
      const v = amount / Math.pow(1 + r, y);
      yearly.push({ year: y, value: v, loss: amount - v });
    }

    return { futureValue, purchasingPowerLoss, lossPct, neededAmount, yearly };
  }, [amount, inflationRate, years]);

  const maxLoss = result.yearly.length > 0 ? result.yearly[result.yearly.length - 1].loss : 1;

  return (
    <ToolLayout title="通胀计算器" description="计算通货膨胀对购买力的影响，对比不同年份" toolId="inflation-calc" icon={ArrowDownRight} category="金融理财" slug="inflation-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">当前金额 (元)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年均通胀率 (%)</label>
            <input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">年数</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">{years}年后实际购买力</div>
            <div className="text-xl font-bold text-rose-400">{fmt(result.futureValue)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">购买力损失</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.purchasingPowerLoss)}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">保持购买力需达到</div>
            <div className="text-xl font-bold text-amber-400">{fmt(result.neededAmount)}</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">购买力逐年变化</h3>
          <div className="space-y-1.5">
            {result.yearly.map((d) => (
              <div key={d.year} className="flex items-center gap-3 text-xs">
                <span className="text-slate-400 w-16">第{d.year}年</span>
                <div className="flex-1 bg-[#0d0d0f] rounded-full h-5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${(d.loss / maxLoss) * 100}%` }}>
                    <span className="text-[10px] text-white font-medium">损失 {fmt(d.loss)}</span>
                  </div>
                </div>
                <span className="text-slate-500 w-24 text-right">购买力 {fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
