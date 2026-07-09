"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Beaker, ArrowRightLeft, Copy, Check } from "lucide-react";

const units = [
  { value: "l", label: "升 (L)", factor: 1 },
  { value: "ml", label: "毫升 (mL)", factor: 0.001 },
  { value: "m3", label: "立方米 (m³)", factor: 1000 },
  { value: "cm3", label: "立方厘米 (cm³)", factor: 0.001 },
  { value: "gal_us", label: "美制加仑 (gal)", factor: 3.785411784 },
  { value: "gal_uk", label: "英制加仑 (gal)", factor: 4.54609 },
  { value: "qt", label: "夸脱 (qt)", factor: 0.946352946 },
  { value: "pt", label: "品脱 (pt)", factor: 0.473176473 },
  { value: "cup", label: "杯 (cup)", factor: 0.236588236 },
  { value: "oz_fl", label: "液盎司 (fl oz)", factor: 0.02957353 },
];

function convertVolume(value: number, from: string, to: string): number {
  const fromUnit = units.find((u) => u.value === from);
  const toUnit = units.find((u) => u.value === to);
  if (!fromUnit || !toUnit || isNaN(value)) return 0;
  return (value * fromUnit.factor) / toUnit.factor;
}

export default function VolumeConverterPage() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("l");
  const [toUnit, setToUnit] = useState("ml");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertVolume(num, fromUnit, toUnit);
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
      title="体积单位换算"
      description="支持升、毫升、立方米、加仑、夸脱、品脱、杯、液盎司等多种体积单位的快速换算"
      toolId="volume-converter"
      icon={Beaker}
      category="计算工具"
      slug="volume-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                体积换算
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
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  placeholder="请输入数值"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 min-w-[160px]"
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
                className="p-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                换算结果
              </label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl text-lg font-semibold text-cyan-700 dark:text-cyan-300 flex items-center justify-between">
                  <span>{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-cyan-200/50 dark:hover:bg-cyan-800/50 transition-colors"
                    title="复制结果"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-cyan-500" />
                    )}
                  </button>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 min-w-[160px]"
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
                    className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
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
                { from: "1 升", to: "1000 毫升" },
                { from: "1 立方米", to: "1000 升" },
                { from: "1 美制加仑", to: "3.785 升" },
                { from: "1 英制加仑", to: "4.546 升" },
                { from: "1 夸脱", to: "0.946 升" },
                { from: "1 品脱", to: "473 毫升" },
                { from: "1 杯", to: "236 毫升" },
                { from: "1 液盎司", to: "29.57 毫升" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                >
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">{item.from}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 my-1">=</div>
                  <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400">{item.to}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
