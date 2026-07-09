"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Scale, ArrowRightLeft, Copy, Check } from "lucide-react";

const units = [
  { value: "kg", label: "千克 (kg)", factor: 1 },
  { value: "g", label: "克 (g)", factor: 0.001 },
  { value: "mg", label: "毫克 (mg)", factor: 0.000001 },
  { value: "t", label: "吨 (t)", factor: 1000 },
  { value: "lb", label: "磅 (lb)", factor: 0.45359237 },
  { value: "oz", label: "盎司 (oz)", factor: 0.02834952 },
  { value: "jin", label: "斤", factor: 0.5 },
  { value: "liang", label: "两", factor: 0.05 },
  { value: "stone", label: "英石 (st)", factor: 6.35029318 },
];

function convertWeight(value: number, from: string, to: string): number {
  const fromUnit = units.find((u) => u.value === from);
  const toUnit = units.find((u) => u.value === to);
  if (!fromUnit || !toUnit || isNaN(value)) return 0;
  return (value * fromUnit.factor) / toUnit.factor;
}

export default function WeightConverterPage() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("kg");
  const [toUnit, setToUnit] = useState("lb");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertWeight(num, fromUnit, toUnit);
    return converted.toFixed(6).replace(/\.?0+$/, "");
  }, [fromValue, fromUnit, toUnit]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const quickValues = ["1", "10", "100", "1000", "0.5", "0.25"];

  return (
    <ToolLayout
      title="重量单位换算"
      description="支持千克、克、毫克、吨、磅、盎司、斤、两、英石等多种重量单位的快速换算"
      toolId="weight-converter"
      icon={Scale}
      category="计算工具"
      slug="weight-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 换算区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                重量换算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                输入数值
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  placeholder="请输入数值"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 min-w-[140px]"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                换算结果
              </label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-lg font-semibold text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                  <span>{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 transition-colors"
                    title="复制结果"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-emerald-500" />
                    )}
                  </button>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 min-w-[140px]"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                快捷输入
              </label>
              <div className="flex flex-wrap gap-2">
                {quickValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => setFromValue(val)}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 常用换算表 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常用换算参考
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { from: "1 千克", to: "2.205 磅" },
                { from: "1 磅", to: "0.454 千克" },
                { from: "1 斤", to: "500 克" },
                { from: "1 千克", to: "2 斤" },
                { from: "1 盎司", to: "28.35 克" },
                { from: "1 吨", to: "1000 千克" },
                { from: "1 两", to: "50 克" },
                { from: "1 英石", to: "6.35 千克" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                >
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{item.from}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 my-1">=</div>
                  <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{item.to}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
