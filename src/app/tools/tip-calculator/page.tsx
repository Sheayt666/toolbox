"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Coffee,
  DollarSign,
  Percent,
  Users,
  Calculator,
  Info,
} from "lucide-react";

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TipCalculatorPage() {
  const [billAmount, setBillAmount] = useState(200);
  const [tipPercent, setTipPercent] = useState(15);
  const [peopleCount, setPeopleCount] = useState(2);

  const result = useMemo(() => {
    if (billAmount <= 0 || tipPercent < 0 || peopleCount <= 0) return null;

    const tipAmount = billAmount * (tipPercent / 100);
    const totalAmount = billAmount + tipAmount;
    const tipPerPerson = tipAmount / peopleCount;
    const totalPerPerson = totalAmount / peopleCount;

    return { tipAmount, totalAmount, tipPerPerson, totalPerPerson };
  }, [billAmount, tipPercent, peopleCount]);

  const quickTips = [5, 10, 15, 18, 20, 25];

  return (
    <ToolLayout
      title="小费计算器"
      description="快速计算小费金额和人均分摊，支持自定义小费比例，聚餐买单好帮手"
      toolId="tip-calculator"
      icon={Coffee}
      category="计算工具"
      slug="tip-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                小费计算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 账单金额 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-pink-500" />
                  账单金额
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                  ¥ {formatCurrency(billAmount)}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={5000}
                step={1}
                value={billAmount}
                onChange={(e) => setBillAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>¥10</span>
                <span>¥5,000</span>
              </div>
            </div>

            {/* 小费比例 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-pink-500" />
                  小费比例
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                  {tipPercent} %
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={tipPercent}
                onChange={(e) => setTipPercent(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>0%</span>
                <span>50%</span>
              </div>
              <div className="grid grid-cols-6 gap-2 mt-4">
                {quickTips.map((tip) => (
                  <button
                    key={tip}
                    onClick={() => setTipPercent(tip)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      tipPercent === tip
                        ? "bg-pink-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600"
                    }`}
                  >
                    {tip}%
                  </button>
                ))}
              </div>
            </div>

            {/* 人数 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Users className="w-4 h-4 text-pink-500" />
                  分摊人数
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                  {peopleCount} 人
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1人</span>
                <span>20人</span>
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-pink-500/25">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-pink-100 mb-1">小费金额</div>
                <div className="text-2xl font-bold">
                  ¥{formatCurrency(result.tipAmount)}
                </div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-pink-100 mb-1">总金额</div>
                <div className="text-2xl font-bold">
                  ¥{formatCurrency(result.totalAmount)}
                </div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-pink-100 mb-1">人均小费</div>
                <div className="text-2xl font-bold">
                  ¥{formatCurrency(result.tipPerPerson)}
                </div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-xl">
                <div className="text-sm text-pink-100 mb-1">人均总付</div>
                <div className="text-2xl font-bold">
                  ¥{formatCurrency(result.totalPerPerson)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              小费小贴士
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>小费金额 = 账单金额 × 小费比例</p>
            <p>常见小费比例：普通服务10-15%，优质服务15-20%，特别满意20%+</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
