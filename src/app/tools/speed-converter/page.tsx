"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Gauge, ArrowRightLeft, Copy, Check } from "lucide-react";

const units = [
  { value: "m_s", label: "米/秒 (m/s)", factor: 1 },
  { value: "km_h", label: "千米/时 (km/h)", factor: 0.277777778 },
  { value: "mph", label: "英里/时 (mph)", factor: 0.44704 },
  { value: "knot", label: "节 (kn)", factor: 0.514444444 },
  { value: "ft_s", label: "英尺/秒 (ft/s)", factor: 0.3048 },
  { value: "mach", label: "马赫 (Mach)", factor: 340.29 },
  { value: "c", label: "光速 (c)", factor: 299792458 },
];

function convertSpeed(value: number, from: string, to: string): number {
  const fromUnit = units.find((u) => u.value === from);
  const toUnit = units.find((u) => u.value === to);
  if (!fromUnit || !toUnit || isNaN(value)) return 0;
  return (value * fromUnit.factor) / toUnit.factor;
}

export default function SpeedConverterPage() {
  const [fromValue, setFromValue] = useState("100");
  const [fromUnit, setFromUnit] = useState("km_h");
  const [toUnit, setToUnit] = useState("m_s");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertSpeed(num, fromUnit, toUnit);
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

  const quickValues = ["1", "10", "60", "100", "120", "340"];

  return (
    <ToolLayout
      title="速度单位换算"
      description="支持米/秒、千米/时、英里/时、节、英尺/秒、马赫、光速等多种速度单位的快速换算"
      toolId="speed-converter"
      icon={Gauge}
      category="计算工具"
      slug="speed-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                速度换算
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
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  placeholder="请输入数值"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 min-w-[160px]"
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
                className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                换算结果
              </label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-lg font-semibold text-amber-700 dark:text-amber-300 flex items-center justify-between">
                  <span>{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors"
                    title="复制结果"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-amber-500" />
                    )}
                  </button>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 min-w-[160px]"
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
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常用换算参考
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { from: "1 米/秒", to: "3.6 千米/时" },
                { from: "1 千米/时", to: "0.621 英里/时" },
                { from: "1 英里/时", to: "1.609 千米/时" },
                { from: "1 节", to: "1.852 千米/时" },
                { from: "1 马赫", to: "1225 千米/时" },
                { from: "1 英尺/秒", to: "0.682 英里/时" },
                { from: "光速", to: "299792 km/s" },
                { from: "100 km/h", to: "62.1 mph" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                >
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{item.from}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 my-1">=</div>
                  <div className="text-sm font-medium text-amber-600 dark:text-amber-400">{item.to}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
