"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Receipt,
  DollarSign,
  Percent,
  Calculator,
  Info,
} from "lucide-react";

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function VatCalculatorPage() {
  const [amount, setAmount] = useState(10000);
  const [vatRate, setVatRate] = useState(13);
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const result = useMemo(() => {
    if (amount <= 0 || vatRate < 0) return null;

    let priceExcludingVat: number;
    let priceIncludingVat: number;
    let vatAmount: number;

    if (mode === "exclusive") {
      priceExcludingVat = amount;
      vatAmount = amount * (vatRate / 100);
      priceIncludingVat = amount + vatAmount;
    } else {
      priceIncludingVat = amount;
      vatAmount = amount - amount / (1 + vatRate / 100);
      priceExcludingVat = amount - vatAmount;
    }

    return { priceExcludingVat, priceIncludingVat, vatAmount };
  }, [amount, vatRate, mode]);

  const vatRates = [3, 6, 9, 13, 16, 17];

  return (
    <ToolLayout
      title="增值税计算器"
      description="快速计算增值税金额，支持含税价和不含税价互转，覆盖常见税率"
      toolId="vat-calculator"
      icon={Receipt}
      category="计算工具"
      slug="vat-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                增值税计算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 计算模式 */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                计算模式
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode("exclusive")}
                  className={`p-4 rounded-xl border transition-all text-center ${
                    mode === "exclusive"
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      mode === "exclusive"
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    不含税金额
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    计算含税价和税额
                  </div>
                </button>
                <button
                  onClick={() => setMode("inclusive")}
                  className={`p-4 rounded-xl border transition-all text-center ${
                    mode === "inclusive"
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      mode === "inclusive"
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    含税金额
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    计算不含税价和税额
                  </div>
                </button>
              </div>
            </div>

            {/* 金额 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-indigo-500" />
                  {mode === "exclusive" ? "不含税金额" : "含税金额"}
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  ¥ {formatCurrency(amount)}
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={1000000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥100</span>
                <span>¥1,000,000</span>
              </div>
            </div>

            {/* 税率 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-indigo-500" />
                  增值税税率
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {vatRate} %
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={0.5}
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1%</span>
                <span>25%</span>
              </div>
              <div className="grid grid-cols-6 gap-2 mt-4">
                {vatRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setVatRate(rate)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      vatRate === rate
                        ? "bg-indigo-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/25">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-indigo-100 mb-1">不含税金额</div>
                <div className="text-2xl font-bold">
                  ¥{formatCurrency(result.priceExcludingVat)}
                </div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-indigo-100 mb-1">增值税额</div>
                <div className="text-2xl font-bold">
                  ¥{formatCurrency(result.vatAmount)}
                </div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-indigo-100 mb-1">含税金额</div>
                <div className="text-2xl font-bold">
                  ¥{formatCurrency(result.priceIncludingVat)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              计算公式
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>不含税价 × 税率 = 增值税额</p>
            <p>不含税价 + 增值税额 = 含税价</p>
            <p className="text-zinc-500 mt-2">
              中国增值税常见税率：13%（销售货物）、9%（交通运输、建筑）、6%（现代服务）、3%（小规模）
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
