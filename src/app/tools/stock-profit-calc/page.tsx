"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { LineChart } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function StockProfitCalcPage() {
  const [buyPrice, setBuyPrice] = useState(10.5);
  const [sellPrice, setSellPrice] = useState(13.8);
  const [shares, setShares] = useState(1000);
  const [commissionRate, setCommissionRate] = useState(0.025);
  const [stampTax, setStampTax] = useState(0.05);
  const [transferFee, setTransferFee] = useState(0.001);

  const result = useMemo(() => {
    const buyAmount = buyPrice * shares;
    const sellAmount = sellPrice * shares;

    // 买入佣金（最低5元）
    const buyCommission = Math.max(5, buyAmount * (commissionRate / 100));
    const buyTransfer = buyAmount * (transferFee / 1000);

    // 卖出佣金 + 印花税 + 过户费
    const sellCommission = Math.max(5, sellAmount * (commissionRate / 100));
    const sellStampTax = sellAmount * (stampTax / 1000);
    const sellTransfer = sellAmount * (transferFee / 1000);

    const totalCost = buyAmount + buyCommission + buyTransfer;
    const totalRevenue = sellAmount - sellCommission - sellStampTax - sellTransfer;
    const profit = totalRevenue - totalCost;
    const profitRate = (profit / totalCost) * 100;
    const totalFees = buyCommission + buyTransfer + sellCommission + sellStampTax + sellTransfer;

    return { buyAmount, sellAmount, buyCommission, buyTransfer, sellCommission, sellStampTax, sellTransfer, totalCost, totalRevenue, profit, profitRate, totalFees };
  }, [buyPrice, sellPrice, shares, commissionRate, stampTax, transferFee]);

  return (
    <ToolLayout title="股票收益计算" description="计算股票买卖盈亏，包含手续费印花税等成本" toolId="stock-profit-calc" icon={LineChart} category="金融理财" slug="stock-profit-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">买入价 (元)</label><input type="number" step="0.01" value={buyPrice} onChange={(e) => setBuyPrice(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">卖出价 (元)</label><input type="number" step="0.01" value={sellPrice} onChange={(e) => setSellPrice(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">股数</label><input type="number" value={shares} onChange={(e) => setShares(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">佣金费率 (%)</label><input type="number" step="0.001" value={commissionRate} onChange={(e) => setCommissionRate(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">印花税 (%)</label><input type="number" step="0.001" value={stampTax} onChange={(e) => setStampTax(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">过户费 (%)</label><input type="number" step="0.0001" value={transferFee} onChange={(e) => setTransferFee(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">买入金额</div><div className="text-xl font-bold text-white">{fmt(result.buyAmount)}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">总手续费</div><div className="text-xl font-bold text-sky-400">{fmt(result.totalFees)}</div></div>
          <div className={`bg-gradient-to-br to-transparent rounded-xl border p-4 ${result.profit >= 0 ? "from-emerald-500/10 border-emerald-500/20" : "from-rose-500/10 border-rose-500/20"}`}><div className="text-xs text-slate-400 mb-1">盈亏金额</div><div className={`text-xl font-bold ${result.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{fmt(result.profit)}</div></div>
          <div className={`bg-gradient-to-br to-transparent rounded-xl border p-4 ${result.profit >= 0 ? "from-emerald-500/10 border-emerald-500/20" : "from-rose-500/10 border-rose-500/20"}`}><div className="text-xs text-slate-400 mb-1">收益率</div><div className={`text-xl font-bold ${result.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{result.profitRate.toFixed(2)}%</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">费用明细</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">买入佣金</span><span className="text-slate-300">{fmt(result.buyCommission)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">买入过户费</span><span className="text-slate-300">{fmt(result.buyTransfer)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">总成本</span><span className="text-white font-medium">{fmt(result.totalCost)}</span></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">卖出佣金</span><span className="text-slate-300">{fmt(result.sellCommission)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">印花税</span><span className="text-slate-300">{fmt(result.sellStampTax)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">卖出过户费</span><span className="text-slate-300">{fmt(result.sellTransfer)}</span></div>
              <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">净收入</span><span className="text-white font-medium">{fmt(result.totalRevenue)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
