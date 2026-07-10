"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { RefreshCw, ArrowRightLeft } from "lucide-react";

// 参考汇率（相对人民币 CNY）
const RATES: Record<string, { name: string; rate: number; symbol: string }> = {
  CNY: { name: "人民币", rate: 1, symbol: "¥" },
  USD: { name: "美元", rate: 0.1389, symbol: "$" },
  EUR: { name: "欧元", rate: 0.1275, symbol: "€" },
  GBP: { name: "英镑", rate: 0.1098, symbol: "£" },
  JPY: { name: "日元", rate: 21.52, symbol: "¥" },
  HKD: { name: "港币", rate: 1.083, symbol: "HK$" },
  KRW: { name: "韩元", rate: 191.5, symbol: "₩" },
  AUD: { name: "澳元", rate: 0.2125, symbol: "A$" },
  CAD: { name: "加元", rate: 0.1895, symbol: "C$" },
  SGD: { name: "新加坡元", rate: 0.1875, symbol: "S$" },
  TWD: { name: "新台币", rate: 4.462, symbol: "NT$" },
  THB: { name: "泰铢", rate: 4.985, symbol: "฿" },
  RUB: { name: "俄罗斯卢布", rate: 12.15, symbol: "₽" },
};

export default function CurrencyExchangeCalcPage() {
  const [amount, setAmount] = useState(1000);
  const [from, setFrom] = useState("CNY");
  const [to, setTo] = useState("USD");

  const result = useMemo(() => {
    const fromRate = RATES[from].rate;
    const toRate = RATES[to].rate;
    // amount in CNY = amount / fromRate, then to target = cny * toRate
    const cny = amount / fromRate;
    const converted = cny * toRate;
    return { converted, cny };
  }, [amount, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <ToolLayout title="汇率换算器" description="多种货币汇率换算，支持常用货币对快速转换" toolId="currency-exchange-calc" icon={RefreshCw} category="金融理财" slug="currency-exchange-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">原始金额</label>
              <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500 mb-2" />
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
                {Object.entries(RATES).map(([k, v]) => <option key={k} value={k}>{v.symbol} {v.name} ({k})</option>)}
              </select>
            </div>
            <button onClick={swap} className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-400 hover:bg-primary-500/30 transition-all">
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">兑换金额</label>
              <div className="w-full bg-[#0d0d0f] border border-emerald-500/30 text-emerald-400 rounded-lg px-3 py-2.5 mb-2 text-lg font-bold">{result.converted.toFixed(2)}</div>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
                {Object.entries(RATES).map(([k, v]) => <option key={k} value={k}>{v.symbol} {v.name} ({k})</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">兑换详情</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">1 {from} =</span><span className="text-white font-semibold">{(RATES[to].rate / RATES[from].rate).toFixed(4)} {to}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">1 {to} =</span><span className="text-white font-semibold">{(RATES[from].rate / RATES[to].rate).toFixed(4)} {from}</span></div>
            <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">折合人民币</span><span className="text-primary-400 font-semibold">¥{result.cny.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-slate-400 leading-relaxed">汇率数据仅供参考，实际交易以银行挂牌汇率为准。更新日期：2026年7月。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
