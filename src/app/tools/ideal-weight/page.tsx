"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Scale, Ruler, Heart, Info, TrendingUp, Target, Activity } from "lucide-react";

interface IdealWeightResult {
  robinson: number;
  miller: number;
  devine: number;
  hamwi: number;
  average: number;
  rangeMin: number;
  rangeMax: number;
  bmiIdealMin: number;
  bmiIdealMax: number;
}

function calculateIdealWeight(
  height: number,
  gender: "male" | "female"
): IdealWeightResult | null {
  if (height <= 0) return null;

  const heightInInches = height / 2.54;
  const baseHeight = 60; // 5 feet = 60 inches
  const inchesOver5Feet = Math.max(0, heightInInches - baseHeight);

  // Robinson公式 (1983)
  const robinson = gender === "male"
    ? 52 + 1.9 * inchesOver5Feet
    : 49 + 1.7 * inchesOver5Feet;

  // Miller公式 (1983)
  const miller = gender === "male"
    ? 56.2 + 1.41 * inchesOver5Feet
    : 53.1 + 1.36 * inchesOver5Feet;

  // Devine公式 (1974) - 最常用
  const devine = gender === "male"
    ? 50 + 2.3 * inchesOver5Feet
    : 45.5 + 2.3 * inchesOver5Feet;

  // Hamwi公式 (1964)
  const hamwi = gender === "male"
    ? 48 + 2.7 * inchesOver5Feet
    : 45.5 + 2.2 * inchesOver5Feet;

  const average = (robinson + miller + devine + hamwi) / 4;
  const rangeMin = Math.min(robinson, miller, devine, hamwi);
  const rangeMax = Math.max(robinson, miller, devine, hamwi);

  // BMI理想范围 (18.5 - 23.9)
  const heightInMeters = height / 100;
  const bmiIdealMin = 18.5 * heightInMeters * heightInMeters;
  const bmiIdealMax = 23.9 * heightInMeters * heightInMeters;

  return {
    robinson,
    miller,
    devine,
    hamwi,
    average,
    rangeMin,
    rangeMax,
    bmiIdealMin,
    bmiIdealMax,
  };
}

const formulaInfo = [
  { name: "Robinson公式", year: "1983", desc: "基于大量人群统计数据" },
  { name: "Miller公式", year: "1983", desc: "适用于中等体型人群" },
  { name: "Devine公式", year: "1974", desc: "临床最常用的计算公式" },
  { name: "Hamwi公式", year: "1964", desc: "最早的理想体重公式之一" },
];

export default function IdealWeightPage() {
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState<"male" | "female">("male");

  const result = useMemo(() => calculateIdealWeight(height, gender), [height, gender]);

  return (
    <ToolLayout
      title="理想体重计算器"
      description="使用多种科学公式计算您的理想体重范围，包括Robinson、Miller、Devine、Hamwi等经典公式"
      toolId="ideal-weight"
      icon={Target}
      category="计算工具"
      slug="ideal-weight"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-teal-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                基本信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 性别 */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                性别
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender("male")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    gender === "male"
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <span className={`text-lg ${gender === "male" ? "text-blue-500" : "text-zinc-400"}`}>♂</span>
                  <span className={`text-sm font-medium ${
                    gender === "male"
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}>男生</span>
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                    gender === "female"
                      ? "bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600"
                  }`}
                >
                  <span className={`text-lg ${gender === "female" ? "text-pink-500" : "text-zinc-400"}`}>♀</span>
                  <span className={`text-sm font-medium ${
                    gender === "female"
                      ? "text-pink-700 dark:text-pink-300"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}>女生</span>
                </button>
              </div>
            </div>

            {/* 身高 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Ruler className="w-4 h-4 text-teal-500" />
                  身高
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                  {height} cm
                </span>
              </div>
              <input
                type="range"
                min={140}
                max={220}
                step={0.1}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>140cm</span>
                <span>220cm</span>
              </div>
            </div>
          </div>
        </div>

        {/* 计算结果 */}
        {result && (
          <>
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-center">
                <div className="text-sm text-white/80 mb-2">您的理想体重（平均值）</div>
                <div className="text-6xl font-bold mb-2">{result.average.toFixed(1)}</div>
                <div className="text-xl text-white/70 mb-4">公斤 (kg)</div>
                <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium">
                  范围: {result.rangeMin.toFixed(1)} - {result.rangeMax.toFixed(1)} kg
                </div>
              </div>
            </div>

            {/* 各公式结果 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    各公式计算结果
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Robinson", value: result.robinson, year: "1983" },
                    { name: "Miller", value: result.miller, year: "1983" },
                    { name: "Devine", value: result.devine, year: "1974" },
                    { name: "Hamwi", value: result.hamwi, year: "1964" },
                  ].map((item, index) => {
                    const deviation = ((item.value - result.average) / result.average) * 100;
                    return (
                      <div
                        key={index}
                        className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                      >
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{item.name}</div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                          {item.value.toFixed(1)}
                        </div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">kg</div>
                        <div className={`text-xs mt-2 ${
                          deviation > 0 ? "text-emerald-500" : deviation < 0 ? "text-rose-500" : "text-zinc-400"
                        }`}>
                          {deviation > 0 ? "+" : ""}{deviation.toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BMI理想范围 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    BMI健康体重范围
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">最低理想体重</div>
                    <div className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                      {result.bmiIdealMin.toFixed(1)}
                    </div>
                    <div className="text-sm text-zinc-400 dark:text-zinc-500">kg (BMI 18.5)</div>
                  </div>
                  <div className="text-zinc-300 dark:text-zinc-700 text-2xl">~</div>
                  <div className="text-center">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">最高理想体重</div>
                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {result.bmiIdealMax.toFixed(1)}
                    </div>
                    <div className="text-sm text-zinc-400 dark:text-zinc-500">kg (BMI 23.9)</div>
                  </div>
                </div>

                {/* 体重区间条 */}
                <div className="mt-6">
                  <div className="relative h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-sky-400/50" style={{ width: "25%" }} />
                    <div className="absolute inset-y-0 bg-emerald-400/50" style={{ left: "25%", width: "50%" }} />
                    <div className="absolute inset-y-0 right-0 bg-amber-400/50" style={{ width: "25%" }} />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-teal-500 transition-all"
                      style={{ left: "calc(50% - 12px)" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    <span>偏瘦</span>
                    <span>正常</span>
                    <span>偏胖</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 公式说明 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  计算公式说明
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formulaInfo.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.year}</span>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                注意：理想体重公式仅供参考，实际健康体重受多种因素影响，包括体脂率、肌肉量、骨骼密度等。建议结合BMI和体脂率综合评估。
              </p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
