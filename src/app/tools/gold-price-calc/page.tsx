"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Coins } from "lucide-react";

// 1 盎司 = 31.1035 克
const OZ_TO_GRAM = 31.1035;

export default function GoldPriceCalcPage() {
  const [pricePerGram, setPricePerGram] = useState(750);
  const [weight, setWeight] = useState(10);
  const [unit, setUnit] = useState<"gram" | "oz">("gram");
  const [mode, setMode] = useState<"buy" | "sell">("buy");

  const result = useMemo(() => {
    const weightInGram = unit === "gram" ? weight : weight * OZ_TO_GRAM;
    const total = weightInGram * pricePerGram;
    const pricePerOz = pricePerGram * OZ_TO_GRAM;
    // 买入加手续费3%，卖出折价2%
    const fee = mode === "buy" ? total * 0.03 : total * 0.02;
    const finalAmount = mode === "buy" ? total + fee : total - fee;
    return { weightInGram, total, pricePerOz, fee, finalAmount };
  }, [pricePerGram, weight, unit, mode]);

  return (
    <ToolLayout title="黄金价格计算" description="黄金价格换算，克与盎司转换及投资金额计算" toolId="gold-price-calc" icon={Coins} category="金融理财" slug="gold-price-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">金价 (元/克)</label>
            <input type="number" step="0.01" value={pricePerGram} onChange={(e) => setPricePerGram(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">重量</label>
            <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">单位</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as "gram" | "oz")} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
              <option value="gram">克 (g)</option>
              <option value="oz">盎司 (oz)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">交易类型</label>
          <div className="flex gap-2">
            <button onClick={() => setMode("buy")} className={`px-6 py-2.5 rounded-lg text-sm border transition-all ${mode === "buy" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>买入</button>
            <button onClick={() => setMode("sell")} className={`px-6 py-2.5 rounded-lg text-sm border transition-all ${mode === "sell" ? "bg-orange-500/20 border-orange-500 text-orange-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>卖出</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">折合克数</div>
            <div className="text-xl font-bold text-white">{result.weightInGram.toFixed(2)} g</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">每盎司价格</div>
            <div className="text-xl font-bold text-white">¥{result.pricePerOz.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">{mode === "buy" ? "手续费" : "折价"}</div>
            <div className="text-xl font-bold text-sky-400">¥{result.fee.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">{mode === "buy" ? "买入总价" : "卖出所得"}</div>
            <div className="text-xl font-bold text-emerald-400">¥{result.finalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">价格换算</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">1 克 =</span><span className="text-white">¥{pricePerGram.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">1 盎司 =</span><span className="text-white">¥{result.pricePerOz.toFixed(2)} ({OZ_TO_GRAM}克)</span></div>
            <div className="flex justify-between"><span className="text-slate-400">原料总价</span><span className="text-white font-bold">¥{result.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
