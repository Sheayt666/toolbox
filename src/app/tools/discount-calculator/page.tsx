"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Tag,
  DollarSign,
  Percent,
  ShoppingBag,
  Info,
  Calculator,
} from "lucide-react";

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DiscountCalculatorPage() {
  const [originalPrice, setOriginalPrice] = useState(299);
  const [discount, setDiscount] = useState(8);

  const result = useMemo(() => {
    if (originalPrice <= 0 || discount <= 0 || discount > 10) return null;

    const discountRate = (discount / 10) * 100;
    const discountAmount = originalPrice * (1 - discount / 10);
    const finalPrice = originalPrice - discountAmount;
    const savedPercentage = (discountAmount / originalPrice) * 100;

    return { finalPrice, discountAmount, discountRate, savedPercentage };
  }, [originalPrice, discount]);

  const quickDiscounts = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <ToolLayout
      title="折扣计算器"
      description="快速计算打折后的价格和节省金额，支持一键切换常见折扣，购物比价必备"
      toolId="discount-calculator"
      icon={Tag}
      category="计算工具"
      slug="discount-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                折扣计算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  原价
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  ¥ {formatCurrency(originalPrice)}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={10000}
                step={1}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥10</span>
                <span>¥10,000</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-orange-500" />
                  折扣
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  {discount} 折
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={9.9}
                step={0.1}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1折</span>
                <span>9.9折</span>
              </div>
              <div className="grid grid-cols-9 gap-2 mt-4">
                {quickDiscounts.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiscount(d)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      discount === d
                        ? "bg-orange-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-600"
                    }`}
                  >
                    {d}折
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/25">
            <div className="text-center mb-6">
              <div className="text-sm text-orange-100 mb-1">折后价格</div>
              <div className="text-5xl font-bold">
                ¥ {formatCurrency(result.finalPrice)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-orange-100 mb-1">原价</div>
                <div className="text-lg font-semibold">
                  ¥{formatCurrency(originalPrice)}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-orange-100 mb-1">节省</div>
                <div className="text-lg font-semibold">
                  ¥{formatCurrency(result.discountAmount)}
                </div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-orange-100 mb-1">优惠幅度</div>
                <div className="text-lg font-semibold">
                  {result.savedPercentage.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见折扣速查
            </h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[9, 8.5, 8, 7.5, 7, 6.5, 6, 5.5, 5, 3].map((d) => {
              const finalPrice = originalPrice * (d / 10);
              const saved = originalPrice - finalPrice;
              return (
                <div
                  key={d}
                  onClick={() => setDiscount(d)}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border border-transparent hover:border-orange-300 dark:hover:border-orange-700"
                >
                  <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {d}折
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    ¥{formatCurrency(finalPrice)}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    省¥{formatCurrency(saved)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              计算方法
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p>折后价格 = 原价 × 折扣 ÷ 10</p>
            <p className="mt-2">例如：原价299元，打8折，折后价 = 299 × 8 ÷ 10 = 239.2元</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
