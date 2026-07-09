"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { HardDrive, ArrowRightLeft, Copy, Check } from "lucide-react";

const units = [
  { value: "b", label: "字节 (B)", factor: 1 },
  { value: "kb", label: "千字节 (KB)", factor: 1024 },
  { value: "mb", label: "兆字节 (MB)", factor: 1048576 },
  { value: "gb", label: "吉字节 (GB)", factor: 1073741824 },
  { value: "tb", label: "太字节 (TB)", factor: 1099511627776 },
  { value: "pb", label: "拍字节 (PB)", factor: 1125899906842624 },
  { value: "eb", label: "艾字节 (EB)", factor: 1152921504606846976 },
  { value: "bit", label: "比特 (bit)", factor: 0.125 },
  { value: "kbit", label: "千比特 (Kbit)", factor: 128 },
  { value: "mbit", label: "兆比特 (Mbit)", factor: 131072 },
];

function convertDataSize(value: number, from: string, to: string): number {
  const fromUnit = units.find((u) => u.value === from);
  const toUnit = units.find((u) => u.value === to);
  if (!fromUnit || !toUnit || isNaN(value)) return 0;
  return (value * fromUnit.factor) / toUnit.factor;
}

export default function DataSizeConverterPage() {
  const [fromValue, setFromValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("gb");
  const [toUnit, setToUnit] = useState("mb");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertDataSize(num, fromUnit, toUnit);
    if (converted > 1e15) return converted.toExponential(6);
    if (converted < 0.0001 && converted > 0) return converted.toExponential(6);
    return converted.toFixed(10).replace(/\.?0+$/, "");
  }, [fromValue, fromUnit, toUnit]);

  const allConversions = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return [];
    return units
      .filter((u) => u.value !== fromUnit)
      .map((unit) => {
        const val = convertDataSize(num, fromUnit, unit.value);
        let display: string;
        if (val > 1e12 || (val < 0.0001 && val > 0)) {
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

  const quickValues = ["1", "10", "100", "1024", "0.5", "0.25"];

  return (
    <ToolLayout
      title="数据容量换算"
      description="支持字节、KB、MB、GB、TB、PB、EB以及比特等数据存储单位的快速换算"
      toolId="data-size-converter"
      icon={HardDrive}
      category="计算工具"
      slug="data-size-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <HardDrive className="w-6 h-6" />
            <h2 className="text-lg font-semibold">数据容量换算</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/80 mb-2">输入数值</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-xl font-semibold text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="请输入数值"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[140px] [&>option]:text-zinc-900"
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
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm text-white/80 mb-2">换算结果</label>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-xl font-semibold text-white flex items-center justify-between">
                  <span className="truncate">{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0 ml-2"
                    title="复制结果"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="px-4 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/50 min-w-[140px] [&>option]:text-zinc-900"
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
              <label className="block text-sm text-white/70 mb-2">快捷输入</label>
              <div className="flex flex-wrap gap-2">
                {quickValues.map((val) => (
                  <button
                    key={val}
                    onClick={() => setFromValue(val)}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-sm transition-colors"
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
              全部单位换算结果
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

        {/* 说明 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            换算说明
          </h3>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>• 本工具使用二进制换算（1 KB = 1024 Bytes），这是计算机存储的标准换算方式。</p>
            <p>• 1 字节 (Byte) = 8 比特 (bit)</p>
            <p>• 1 KB = 1024 B，1 MB = 1024 KB，1 GB = 1024 MB，1 TB = 1024 GB</p>
            <p>• 注意：硬盘厂商通常使用十进制（1 KB = 1000 Bytes），这就是为什么实际可用容量会比标称值小。</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
