"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Thermometer, ArrowRightLeft, Copy, Check, Info } from "lucide-react";

const units = [
  { value: "celsius", label: "摄氏度 (°C)" },
  { value: "fahrenheit", label: "华氏度 (°F)" },
  { value: "kelvin", label: "开尔文 (K)" },
  { value: "rankine", label: "兰氏度 (°R)" },
  { value: "reaumur", label: "列氏度 (°Ré)" },
];

function convertTemperature(value: number, from: string, to: string): number {
  if (isNaN(value)) return 0;

  // 先转换为摄氏度
  let celsius: number;
  switch (from) {
    case "celsius":
      celsius = value;
      break;
    case "fahrenheit":
      celsius = (value - 32) * 5 / 9;
      break;
    case "kelvin":
      celsius = value - 273.15;
      break;
    case "rankine":
      celsius = (value - 491.67) * 5 / 9;
      break;
    case "reaumur":
      celsius = value * 1.25;
      break;
    default:
      celsius = value;
  }

  // 从摄氏度转换为目标单位
  switch (to) {
    case "celsius":
      return celsius;
    case "fahrenheit":
      return celsius * 9 / 5 + 32;
    case "kelvin":
      return celsius + 273.15;
    case "rankine":
      return (celsius + 273.15) * 9 / 5;
    case "reaumur":
      return celsius * 0.8;
    default:
      return celsius;
  }
}

const presetTemperatures = [
  { label: "水的沸点", celsius: 100 },
  { label: "水的冰点", celsius: 0 },
  { label: "人体体温", celsius: 37 },
  { label: "室温", celsius: 25 },
  { label: "绝对零度", celsius: -273.15 },
  { label: "烤箱温度", celsius: 180 },
];

export default function TemperatureConverterPage() {
  const [fromValue, setFromValue] = useState("25");
  const [fromUnit, setFromUnit] = useState("celsius");
  const [toUnit, setToUnit] = useState("fahrenheit");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return "";
    const converted = convertTemperature(num, fromUnit, toUnit);
    return converted.toFixed(4).replace(/\.?0+$/, "");
  }, [fromValue, fromUnit, toUnit]);

  const allConversions = useMemo(() => {
    const num = parseFloat(fromValue);
    if (isNaN(num)) return [];
    return units
      .filter((u) => u.value !== fromUnit)
      .map((unit) => ({
        ...unit,
        value: convertTemperature(num, fromUnit, unit.value),
      }));
  }, [fromValue, fromUnit]);

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    setFromValue(result || "0");
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreset = (celsius: number) => {
    setFromUnit("celsius");
    setFromValue(celsius.toString());
  };

  return (
    <ToolLayout
      title="温度单位换算"
      description="支持摄氏度、华氏度、开尔文、兰氏度、列氏度等温度单位的快速换算"
      toolId="temperature-converter"
      icon={Thermometer}
      category="计算工具"
      slug="temperature-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 换算区域 */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <Thermometer className="w-6 h-6" />
            <h2 className="text-lg font-semibold">温度换算</h2>
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
                  <span>{result || "0"}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
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
                  <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {unit.value.toFixed(4).replace(/\.?0+$/, "")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 常用温度 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                常用温度参考
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {presetTemperatures.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handlePreset(item.celsius)}
                  className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors group"
                >
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {item.label}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {item.celsius} °C
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
