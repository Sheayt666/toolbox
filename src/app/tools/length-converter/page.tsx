"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ruler, ArrowRightLeft, Copy, Check } from "lucide-react";

const units = [
  { value: "m", label: "米 (m)", factor: 1 },
  { value: "km", label: "千米 (km)", factor: 1000 },
  { value: "cm", label: "厘米 (cm)", factor: 0.01 },
  { value: "mm", label: "毫米 (mm)", factor: 0.001 },
  { value: "in", label: "英寸 (in)", factor: 0.0254 },
  { value: "ft", label: "英尺 (ft)", factor: 0.3048 },
  { value: "yd", label: "码 (yd)", factor: 0.9144 },
  { value: "mi", label: "英里 (mi)", factor: 1609.344 },
  { value: "nm", label: "海里 (nm)", factor: 1852 },
];

function convertLength(value: number, from: string, to: string): number {
  const fromUnit = units.find((u) => u.value === from);
  const toUnit = units.find((u) => u.value === to);
  if (!fromUnit || !toUnit || isNaN(value)) return 0;
  return (value * fromUnit.factor) / toUnit.factor;
}

export default function LengthConverterPage() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("cm");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertLength(num, fromUnit, toUnit);
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
      title="长度单位换算"
      description="支持米、千米、厘米、毫米、英寸、英尺、码、英里、海里等多种长度单位的快速换算"
      toolId="length-converter"
      icon={Ruler}
      category="计算工具"
      slug="length-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 换算区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                长度换算
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* 输入 */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                输入数值
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  placeholder="请输入数值"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 min-w-[140px]"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 交换按钮 */}
            <div className="flex justify-center">
              <button
                onClick={handleSwap}
                className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* 结果 */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                换算结果
              </label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-lg font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-between">
                  <span>{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-blue-200/50 dark:hover:bg-blue-800/50 transition-colors"
                    title="复制结果"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 min-w-[140px]"
                >
                  {units.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 快捷值 */}
            <div>
              <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                快捷输入
              </label>
              <div className="flex flex-wrap gap-2">
                {quickValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => setFromValue(val)}
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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
                { from: "1 米", to: "100 厘米" },
                { from: "1 千米", to: "1000 米" },
                { from: "1 英寸", to: "2.54 厘米" },
                { from: "1 英尺", to: "30.48 厘米" },
                { from: "1 码", to: "0.9144 米" },
                { from: "1 英里", to: "1.609 千米" },
                { from: "1 海里", to: "1852 米" },
                { from: "1 米", to: "3.28 英尺" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                >
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{item.from}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 my-1">=</div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{item.to}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
