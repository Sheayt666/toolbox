"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ruler, Scale, Square, Box, Thermometer, Info, ArrowRightLeft } from "lucide-react";

type Category = "length" | "weight" | "area" | "volume" | "temperature";

interface Unit {
  id: string;
  name: string;
  factor: number;
  symbol: string;
}

const unitData: Record<Category, { name: string; icon: typeof Ruler; units: Unit[]}> = {
  length: {
    name: "长度",
    icon: Ruler,
    units: [
      { id: "m", name: "米", factor: 1, symbol: "m" },
      { id: "km", name: "千米", factor: 1000, symbol: "km" },
      { id: "cm", name: "厘米", factor: 0.01, symbol: "cm" },
      { id: "mm", name: "毫米", factor: 0.001, symbol: "mm" },
      { id: "mi", name: "英里", factor: 1609.344, symbol: "mi" },
      { id: "yd", name: "码", factor: 0.9144, symbol: "yd" },
      { id: "ft", name: "英尺", factor: 0.3048, symbol: "ft" },
      { id: "in", name: "英寸", factor: 0.0254, symbol: "in" },
      { id: "nmi", name: "海里", factor: 1852, symbol: "nmi" },
      { id: "li", name: "里", factor: 500, symbol: "里" },
      { id: "zhang", name: "丈", factor: 3.333, symbol: "丈" },
      { id: "chi", name: "尺", factor: 0.333, symbol: "尺" },
    ],
  },
  weight: {
    name: "重量",
    icon: Scale,
    units: [
      { id: "kg", name: "千克", factor: 1, symbol: "kg" },
      { id: "g", name: "克", factor: 0.001, symbol: "g" },
      { id: "mg", name: "毫克", factor: 0.000001, symbol: "mg" },
      { id: "t", name: "吨", factor: 1000, symbol: "t" },
      { id: "lb", name: "磅", factor: 0.453592, symbol: "lb" },
      { id: "oz", name: "盎司", factor: 0.0283495, symbol: "oz" },
      { id: "jin", name: "斤", factor: 0.5, symbol: "斤" },
      { id: "liang", name: "两", factor: 0.05, symbol: "两" },
    ],
  },
  area: {
    name: "面积",
    icon: Square,
    units: [
      { id: "m2", name: "平方米", factor: 1, symbol: "m²" },
      { id: "km2", name: "平方千米", factor: 1000000, symbol: "km²" },
      { id: "cm2", name: "平方厘米", factor: 0.0001, symbol: "cm²" },
      { id: "ha", name: "公顷", factor: 10000, symbol: "ha" },
      { id: "mu", name: "亩", factor: 666.667, symbol: "亩" },
      { id: "acre", name: "英亩", factor: 4046.86, symbol: "acre" },
      { id: "ft2", name: "平方英尺", factor: 0.092903, symbol: "ft²" },
    ],
  },
  volume: {
    name: "体积",
    icon: Box,
    units: [
      { id: "l", name: "升", factor: 1, symbol: "L" },
      { id: "ml", name: "毫升", factor: 0.001, symbol: "mL" },
      { id: "m3", name: "立方米", factor: 1000, symbol: "m³" },
      { id: "gal", name: "加仑(美)", factor: 3.78541, symbol: "gal" },
      { id: "qt", name: "夸脱", factor: 0.946353, symbol: "qt" },
      { id: "pt", name: "品脱", factor: 0.473176, symbol: "pt" },
      { id: "cup", name: "杯", factor: 0.236588, symbol: "cup" },
    ],
  },
  temperature: {
    name: "温度",
    icon: Thermometer,
    units: [
      { id: "c", name: "摄氏度", factor: 1, symbol: "°C" },
      { id: "f", name: "华氏度", factor: 1, symbol: "°F" },
      { id: "k", name: "开尔文", factor: 1, symbol: "K" },
    ],
  },
};

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number;
  switch (from) {
    case "c": celsius = value; break;
    case "f": celsius = (value - 32) * 5 / 9; break;
    case "k": celsius = value - 273.15; break;
    default: celsius = value;
  }
  switch (to) {
    case "c": return celsius;
    case "f": return celsius * 9 / 5 + 32;
    case "k": return celsius + 273.15;
    default: return celsius;
  }
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [toUnit, setToUnit] = useState("km");
  const [value, setValue] = useState("1");

  const result = useMemo(() => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return "";

    if (category === "temperature") {
      return convertTemperature(numValue, fromUnit, toUnit).toFixed(6).replace(/\.?0+$/, "");
    }

    const fromUnitData = unitData[category].units.find(u => u.id === fromUnit);
    const toUnitData = unitData[category].units.find(u => u.id === toUnit);
    if (!fromUnitData || !toUnitData) return "";

    const baseValue = numValue * fromUnitData.factor;
    const converted = baseValue / toUnitData.factor;
    return converted.toFixed(10).replace(/\.?0+$/, "");
  }, [value, fromUnit, toUnit, category]);

  const categories: Category[] = ["length", "weight", "area", "volume", "temperature"];

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setValue(result);
  };

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    const units = unitData[cat].units;
    setFromUnit(units[0].id);
    setToUnit(units[1]?.id || units[0].id);
  };

  return (
    <ToolLayout
      title="单位换算器"
      description="长度、重量、面积、体积、温度等多种单位在线换算，支持公制英制互相转换"
      toolId="unit-converter"
      icon={Ruler}
      category="计算工具"
      slug="unit-converter"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 分类选择 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                单位换算
              </h2>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-5 gap-2">
              {categories.map((cat) => {
                const catData = unitData[cat];
                const Icon = catData.icon;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all ${
                      category === cat
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{catData.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 换算区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            {/* 从 */}
            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              从
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="输入数值"
                className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-lg"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[120px]"
              >
                {unitData[category].units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 交换按钮 */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* 到 */}
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
              到
            </label>
            <div className="flex gap-3">
              <div className="flex-1 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-100 font-mono text-lg font-semibold overflow-x-auto">
                {result || "0"}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[120px]"
              >
                {unitData[category].units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

        {/* 常用换算 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常用换算关系
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {category === "length" && (
              <>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 千米 = 1000 米</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 英里 ≈ 1.609 千米</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 英尺 = 30.48 厘米</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 里 = 500 米</div>
              </>
            )}
            {category === "weight" && (
              <>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 千克 = 1000 克</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 磅 ≈ 0.454 千克</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 斤 = 500 克</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 盎司 ≈ 28.35 克</div>
              </>
            )}
            {category === "area" && (
              <>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 平方千米 = 100 公顷</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 亩 ≈ 666.67 平方米</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 公顷 = 15 亩</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 英亩 ≈ 4046.86 平方米</div>
              </>
            )}
            {category === "volume" && (
              <>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 升 = 1000 毫升</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 加仑 ≈ 3.785 升</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 立方米 = 1000 升</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">1 夸脱 ≈ 0.946 升</div>
              </>
            )}
            {category === "temperature" && (
              <>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">0°C = 32°F = 273.15K</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">100°C = 212°F = 373.15K</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">人体常温 25°C ≈ 77°F</div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">绝对零度 0K = -273.15°C</div>
              </>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                单位换算的精度如何？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                本工具采用国际标准换算系数，计算结果保留最多10位有效数字，并自动去除末尾多余的零。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                温度换算为什么不直接用系数？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                摄氏度、华氏度和开尔文之间的换算不是简单的比例关系，存在零点偏移，
                所以温度换算需要专门的计算公式。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
