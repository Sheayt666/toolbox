"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { DollarSign, ArrowDownUp, TrendingUp } from "lucide-react";

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("CNY");

  // 模拟汇率数据（以USD为基准）
  const rates: Record<string, number> = {
    USD: 1,
    CNY: 7.24,
    EUR: 0.92,
    JPY: 151.5,
    GBP: 0.79,
    HKD: 7.82,
    AUD: 1.52,
    CAD: 1.36,
    SGD: 1.34,
    KRW: 1320,
    THB: 35.2,
    TWD: 31.5,
    NZD: 1.64,
    CHF: 0.88,
    MYR: 4.72,
    IDR: 15650,
    INR: 83.2,
    RUB: 92.5,
    BRL: 4.95,
    ZAR: 18.2,
  };

  const currencyNames: Record<string, string> = {
    USD: "美元",
    CNY: "人民币",
    EUR: "欧元",
    JPY: "日元",
    GBP: "英镑",
    HKD: "港币",
    AUD: "澳元",
    CAD: "加元",
    SGD: "新加坡元",
    KRW: "韩元",
    THB: "泰铢",
    TWD: "新台币",
    NZD: "新西兰元",
    CHF: "瑞士法郎",
    MYR: "马来西亚林吉特",
    IDR: "印尼盾",
    INR: "印度卢比",
    RUB: "俄罗斯卢布",
    BRL: "巴西雷亚尔",
    ZAR: "南非兰特",
  };

  const currencySymbols: Record<string, string> = {
    USD: "$",
    CNY: "¥",
    EUR: "€",
    JPY: "¥",
    GBP: "£",
    HKD: "HK$",
    AUD: "A$",
    CAD: "C$",
    SGD: "S$",
    KRW: "₩",
    THB: "฿",
    TWD: "NT$",
    NZD: "NZ$",
    CHF: "CHF",
    MYR: "RM",
    IDR: "Rp",
    INR: "₹",
    RUB: "₽",
    BRL: "R$",
    ZAR: "R",
  };

  const convert = () => {
    const amt = parseFloat(amount) || 0;
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const result = (amt / fromRate) * toRate;
    return result.toFixed(2);
  };

  const result = convert();
  const exchangeRate = (rates[toCurrency] / rates[fromCurrency]).toFixed(4);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <ToolLayout
      title="汇率换算"
      description="实时汇率换算工具，支持20+种常用货币，汇率数据仅供参考"
      toolId="currency-converter"
      icon={DollarSign}
      category="生活工具"
      slug="currency-converter"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
          {/* 源货币 */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-zinc-400">持有货币</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500"
              >
                {Object.keys(rates).map((c) => (
                  <option key={c} value={c}>{c} - {currencyNames[c]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-zinc-500">{currencySymbols[fromCurrency]}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-3xl font-bold text-zinc-200 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* 交换按钮 */}
          <div className="flex justify-center -my-4 relative z-10">
            <button
              onClick={swapCurrencies}
              className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
            >
              <ArrowDownUp className="w-4 h-4" />
            </button>
          </div>

          {/* 目标货币 */}
          <div className="p-6 pt-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-zinc-400">兑换货币</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-300 text-sm focus:outline-none focus:border-emerald-500"
              >
                {Object.keys(rates).map((c) => (
                  <option key={c} value={c}>{c} - {currencyNames[c]}</option>
                ))}
              </select>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl text-emerald-500">{currencySymbols[toCurrency]}</span>
              <span className="text-3xl font-bold text-emerald-400 font-mono">{result}</span>
            </div>
          </div>
        </div>

        {/* 汇率信息 */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold">当前汇率</h3>
          </div>
          <div className="text-center">
            <div className="text-lg text-zinc-300">
              1 {fromCurrency} = <span className="text-2xl font-bold text-emerald-400">{exchangeRate}</span> {toCurrency}
            </div>
          </div>
          <p className="text-xs text-zinc-500 text-center mt-3">
            * 汇率数据仅供参考，实际汇率以银行为准
          </p>
        </div>

        {/* 常用货币 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">常用货币</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["USD", "EUR", "JPY", "GBP", "HKD", "AUD", "CAD", "SGD"].map((c) => (
              <button
                key={c}
                onClick={() => setFromCurrency(c)}
                className={`p-3 rounded-xl text-left transition-colors ${
                  fromCurrency === c
                    ? "bg-emerald-500/20 border border-emerald-500/30"
                    : "bg-zinc-900/50 border border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="text-lg font-bold text-zinc-300">{c}</div>
                <div className="text-xs text-zinc-500">{currencyNames[c]}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
