"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Grid3X3, ArrowRightLeft, Copy, Check } from "lucide-react";

const units = [
  { value: "m2", label: "平方米 (m²)", factor: 1 },
  { value: "km2", label: "平方千米 (km²)", factor: 1000000 },
  { value: "cm2", label: "平方厘米 (cm²)", factor: 0.0001 },
  { value: "mm2", label: "平方毫米 (mm²)", factor: 0.000001 },
  { value: "ha", label: "公顷 (ha)", factor: 10000 },
  { value: "mu", label: "亩", factor: 666.6666667 },
  { value: "sqft", label: "平方英尺 (sq ft)", factor: 0.09290304 },
  { value: "sqin", label: "平方英寸 (sq in)", factor: 0.00064516 },
  { value: "acre", label: "英亩 (acre)", factor: 4046.8564224 },
  { value: "sqmi", label: "平方英里 (sq mi)", factor: 2589988.1103 },
];

function convertArea(value: number, from: string, to: string): number {
  const fromUnit = units.find((u) => u.value === from);
  const toUnit = units.find((u) => u.value === to);
  if (!fromUnit || !toUnit || isNaN(value)) return 0;
  return (value * fromUnit.factor) / toUnit.factor;
}

export default function AreaConverterPage() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("m2");
  const [toUnit, setToUnit] = useState("sqft");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertArea(num, fromUnit, toUnit);
    return converted.toFixed(8).replace(/\.?0+$/, "");
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

  const quickValues = ["1", "10", "100", "1000", "10000", "0.5"];

  return (
    <ToolLayout
      title="面积单位换算"
      description="支持平方米、平方千米、公顷、亩、平方英尺、平方英寸、英亩等多种面积单位的快速换算"
      toolId="area-converter"
      icon={Grid3X3}
      category="计算工具"
      slug="area-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                面积换算
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
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                  placeholder="请输入数值"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 min-w-[160px]"
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
                className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                换算结果
              </label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl text-lg font-semibold text-violet-700 dark:text-violet-300 flex items-center justify-between">
                  <span>{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-violet-200/50 dark:hover:bg-violet-800/50 transition-colors"
                    title="复制结果"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-violet-500" />
                    )}
                  </button>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 min-w-[160px]"
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
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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
                { from: "1 平方米", to: "10.764 平方英尺" },
                { from: "1 平方千米", to: "100 公顷" },
                { from: "1 公顷", to: "15 亩" },
                { from: "1 亩", to: "666.67 平方米" },
                { from: "1 英亩", to: "4046.86 平方米" },
                { from: "1 平方英里", to: "2.59 平方千米" },
                { from: "1 平方英尺", to: "144 平方英寸" },
                { from: "1 公顷", to: "10000 平方米" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                >
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{item.from}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 my-1">=</div>
                  <div className="text-sm font-medium text-violet-600 dark:text-violet-400">{item.to}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
