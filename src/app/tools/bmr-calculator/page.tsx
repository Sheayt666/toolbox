"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Flame,
  Ruler,
  Scale,
  Heart,
  Calculator,
  Info,
} from "lucide-react";

function calculateBMR(
  height: number,
  weight: number,
  age: number,
  gender: "male" | "female"
): number {
  // Mifflin-St Jeor 公式
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export default function BmrCalculatorPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<"male" | "female">("male");

  const result = useMemo(() => {
    if (height <= 0 || weight <= 0 || age <= 0) return null;

    const bmr = calculateBMR(height, weight, age, gender);

    // 活动水平对应的TDEE
    const activityLevels = [
      { level: "久坐不动", factor: 1.2, desc: "几乎不运动" },
      { level: "轻度活动", factor: 1.375, desc: "每周1-3次运动" },
      { level: "中度活动", factor: 1.55, desc: "每周3-5次运动" },
      { level: "高度活动", factor: 1.725, desc: "每周6-7次运动" },
      { level: "极高活动", factor: 1.9, desc: "体力劳动+运动" },
    ].map((item) => ({
      ...item,
      tdee: bmr * item.factor,
    }));

    return { bmr, activityLevels };
  }, [height, weight, age, gender]);

  return (
    <ToolLayout
      title="基础代谢率(BMR)计算器"
      description="使用Mifflin-St Jeor公式计算基础代谢率，了解每日静息消耗热量，助您科学管理体重"
      toolId="bmr-calculator"
      icon={Flame}
      category="计算工具"
      slug="bmr-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-500" />
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
                    gender === "male" ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"
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
                    gender === "female" ? "text-pink-700 dark:text-pink-300" : "text-zinc-700 dark:text-zinc-300"
                  }`}>女生</span>
                </button>
              </div>
            </div>

            {/* 身高 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Ruler className="w-4 h-4 text-orange-500" />
                  身高
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  {height} cm
                </span>
              </div>
              <input
                type="range"
                min={120}
                max={220}
                step={0.1}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* 体重 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Scale className="w-4 h-4 text-orange-500" />
                  体重
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  {weight} kg
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={150}
                step={0.1}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* 年龄 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Heart className="w-4 h-4 text-orange-500" />
                  年龄
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                  {age} 岁
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>
        </div>

        {result && (
          <>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/25">
              <div className="text-center">
                <div className="text-sm text-orange-100 mb-1">基础代谢率 (BMR)</div>
                <div className="text-5xl font-bold">
                  {result.bmr.toFixed(0)}
                  <span className="text-2xl ml-2">千卡/天</span>
                </div>
                <p className="text-sm text-orange-100 mt-2">
                  您每天静息状态下消耗的热量
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    每日总消耗 (TDEE)
                  </h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {result.activityLevels.map((item) => (
                  <div
                    key={item.level}
                    className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                  >
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {item.level}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.desc}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {item.tdee.toFixed(0)} kcal
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              计算公式
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>使用 Mifflin-St Jeor 公式计算：</p>
            <p>男性：BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 + 5</p>
            <p>女性：BMR = 10 × 体重(kg) + 6.25 × 身高(cm) - 5 × 年龄 - 161</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
