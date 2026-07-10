"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Building2 } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RentVsBuyPage() {
  const [price, setPrice] = useState(2000000);
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(4.1);
  const [years, setYears] = useState(30);
  const [rent, setRent] = useState(5000);
  const [rentGrowth, setRentGrowth] = useState(3);
  const [houseGrowth, setHouseGrowth] = useState(3);
  const [investReturn, setInvestReturn] = useState(5);

  const result = useMemo(() => {
    const downPayment = (price * downPct) / 100;
    const loan = price - downPayment;
    const r = rate / 100 / 12;
    const n = years * 12;
    const monthly = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalInterest = monthly * n - loan;

    // 买房总成本 = 首付 + 月供总额 + 维护费(1%/年) - 房屋增值
    const maintenance = price * 0.01 * years;
    const houseValue = price * Math.pow(1 + houseGrowth / 100, years);
    const buyTotalCost = downPayment + monthly * n + maintenance - (houseValue - price) + totalInterest;
    const buyNetCost = downPayment + monthly * n + maintenance - (houseValue - price);

    // 租房总成本 = 租金(逐年增长) - 首付投资收益
    let totalRent = 0;
    let currentRent = rent;
    for (let y = 0; y < years; y++) {
      totalRent += currentRent * 12;
      currentRent *= (1 + rentGrowth / 100);
    }
    const downPaymentInvest = downPayment * Math.pow(1 + investReturn / 100, years);
    const investGain = downPaymentInvest - downPayment;
    const rentNetCost = totalRent - investGain;

    return { downPayment, loan, monthly, totalInterest, maintenance, houseValue, buyNetCost, totalRent, downPaymentInvest, rentNetCost, better: buyNetCost < rentNetCost ? "buy" : "rent", diff: Math.abs(buyNetCost - rentNetCost) };
  }, [price, downPct, rate, years, rent, rentGrowth, houseGrowth, investReturn]);

  return (
    <ToolLayout title="租房vs买房" description="对比租房和买房的成本收益，辅助决策分析" toolId="rent-vs-buy" icon={Building2} category="金融理财" slug="rent-vs-buy">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">房屋总价 (元)</label>
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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">月租金 (元)</label>
            <input type="number" value={rent} onChange={(e) => setRent(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">贷款年限</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">租金年增长率 (%)</label>
            <input type="number" step="0.1" value={rentGrowth} onChange={(e) => setRentGrowth(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">房价年增长率 (%)</label>
            <input type="number" step="0.1" value={houseGrowth} onChange={(e) => setHouseGrowth(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">投资年化收益 (%)</label>
            <input type="number" step="0.1" value={investReturn} onChange={(e) => setInvestReturn(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`rounded-xl border p-5 ${result.better === "buy" ? "bg-emerald-500/5 border-emerald-500/30" : "bg-[#27272a] border-[#3f3f46]"}`}>
            <h3 className="text-sm font-semibold text-white mb-3">买房</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">首付</span><span className="text-white">{fmt(result.downPayment)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">月供</span><span className="text-white">{fmt(result.monthly)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">{years}年后房屋价值</span><span className="text-white">{fmt(result.houseValue)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">净成本</span><span className="text-emerald-400 font-bold">{fmt(result.buyNetCost)}</span></div>
            </div>
          </div>
          <div className={`rounded-xl border p-5 ${result.better === "rent" ? "bg-emerald-500/5 border-emerald-500/30" : "bg-[#27272a] border-[#3f3f46]"}`}>
            <h3 className="text-sm font-semibold text-white mb-3">租房</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">{years}年总租金</span><span className="text-white">{fmt(result.totalRent)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">首付投资终值</span><span className="text-white">{fmt(result.downPaymentInvest)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">净成本</span><span className="text-emerald-400 font-bold">{fmt(result.rentNetCost)}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">综合分析，<span className="text-primary-400 font-bold">{result.better === "buy" ? "买房" : "租房"}</span> 更划算，可节省约 <span className="text-emerald-400 font-bold">{fmt(result.diff)}</span> 元。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
