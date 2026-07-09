"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Clock, ArrowRightLeft, Copy, Check } from "lucide-react";

const units = [
  { value: "ms", label: "毫秒 (ms)", factor: 0.001 },
  { value: "s", label: "秒 (s)", factor: 1 },
  { value: "min", label: "分钟 (min)", factor: 60 },
  { value: "h", label: "小时 (h)", factor: 3600 },
  { value: "d", label: "天 (d)", factor: 86400 },
  { value: "w", label: "周 (w)", factor: 604800 },
  { value: "mo", label: "月 (30天)", factor: 2592000 },
  { value: "y", label: "年 (365天)", factor: 31536000 },
  { value: "century", label: "世纪", factor: 3153600000 },
];

function convertTime(value: number, from: string, to: string): number {
  const fromUnit = units.find((u) => u.value === from);
  const toUnit = units.find((u) => u.value === to);
  if (!fromUnit || !toUnit || isNaN(value)) return 0;
  return (value * fromUnit.factor) / toUnit.factor;
}

export default function TimeConverterPage() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("h");
  const [toUnit, setToUnit] = useState("min");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertTime(num, fromUnit, toUnit);
    if (converted > 1e12 || (converted < 0.000001 && converted > 0)) {
      return converted.toExponential(6);
    }
    return converted.toFixed(8).replace(/\.?0+$/, "");
  }, [fromValue, fromUnit, toUnit]);

  const allConversions = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return [];
    return units
      .filter((u) => u.value !== fromUnit)
      .map((unit) => {
        const val = convertTime(num, fromUnit, unit.value);
        let display: string;
        if (val > 1e10 || (val < 0.0001 && val > 0)) {
          display = val.toExponential(4);
        } else {
          display = val.toFixed(6).replace(/\.?0+$/, "");
        }
        return { ...unit, display };
      });
  }, [fromValue, fromUnit]);

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

  const quickValues = ["1", "10", "60", "100", "3600", "86400"];

  return (
    <ToolLayout
      title="时间单位换算"
      description="支持毫秒、秒、分钟、小时、天、周、月、年、世纪等时间单位的快速换算"
      toolId="time-converter"
      icon={Clock}
      category="计算工具"
      slug="time-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                时间换算
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
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500"
                  placeholder="请输入数值"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 min-w-[140px]"
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
                className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                换算结果
              </label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-lg font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <span className="truncate">{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-rose-200/50 dark:hover:bg-rose-800/50 transition-colors flex-shrink-0 ml-2"
                    title="复制结果"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-rose-500" />
                    )}
                  </button>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 min-w-[140px]"
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
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 全部换算结果 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              全部单位换算
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allConversions.map((unit) => (
                <div
                  key={unit.value}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                >
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{unit.label}</span>
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                    {unit.display}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 常用参考 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常用换算参考
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { from: "1 分钟", to: "60 秒" },
                { from: "1 小时", to: "60 分钟" },
                { from: "1 天", to: "24 小时" },
                { from: "1 周", to: "7 天" },
                { from: "1 天", to: "86400 秒" },
                { from: "1 年", to: "365 天" },
                { from: "1 小时", to: "3600 秒" },
                { from: "1 毫秒", to: "0.001 秒" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                >
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{item.from}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 my-1">=</div>
                  <div className="text-sm font-medium text-rose-600 dark:text-rose-400">{item.to}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
