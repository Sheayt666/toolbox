"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Flame,
  Ruler,
  Scale,
  Heart,
  Target,
  Calculator,
  Info,
} from "lucide-react";

function calculateBMR(
  height: number,
  weight: number,
  age: number,
  gender: "male" | "female"
): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

const activityOptions = [
  { value: 1.2, label: "久坐不动", desc: "办公室工作" },
  { value: 1.375, label: "轻度活动", desc: "每周1-3次运动" },
  { value: 1.55, label: "中度活动", desc: "每周3-5次运动" },
  { value: 1.725, label: "高度活动", desc: "每周6-7次运动" },
  { value: 1.9, label: "极高活动", desc: "体力劳动" },
];

const goalOptions = [
  { value: 0.8, label: "快速减重", desc: "每周减0.5kg" },
  { value: 0.9, label: "温和减重", desc: "每周减0.25kg" },
  { value: 1, label: "维持体重", desc: "保持当前体重" },
  { value: 1.1, label: "温和增重", desc: "每周增0.25kg" },
  { value: 1.2, label: "快速增重", desc: "每周增0.5kg" },
];

export default function CalorieCalculatorPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activityLevel, setActivityLevel] = useState(1.55);
  const [goal, setGoal] = useState(1);

  const result = useMemo(() => {
    if (height <= 0 || weight <= 0 || age <= 0) return null;

    const bmr = calculateBMR(height, weight, age, gender);
    const tdee = bmr * activityLevel;
    const targetCalories = tdee * goal;
    const dailyDiff = targetCalories - tdee;

    return { bmr, tdee, targetCalories, dailyDiff };
  }, [height, weight, age, gender, activityLevel, goal]);

  return (
    <ToolLayout
      title="卡路里计算器"
      description="计算每日所需热量，根据活动水平和减重/增重目标，科学制定饮食计划"
      toolId="calorie-calculator"
      icon={Flame}
      category="计算工具"
      slug="calorie-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                个人信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                性别
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGender("male")}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    gender === "male"
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600"
                  }`}
                >
                  <span className={`text-lg ${gender === "male" ? "text-blue-500" : "text-zinc-400"}`}>♂</span>
                  <span className={`block text-sm font-medium mt-1 ${
                    gender === "male" ? "text-blue-700 dark:text-blue-300" : "text-zinc-700 dark:text-zinc-300"
                  }`}>男生</span>
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`p-3 rounded-xl border transition-all text-center ${
                    gender === "female"
                      ? "bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600"
                  }`}
                >
                  <span className={`text-lg ${gender === "female" ? "text-pink-500" : "text-zinc-400"}`}>♀</span>
                  <span className={`block text-sm font-medium mt-1 ${
                    gender === "female" ? "text-pink-700 dark:text-pink-300" : "text-zinc-700 dark:text-zinc-300"
                  }`}>女生</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  <Ruler className="w-3.5 h-3.5 text-rose-500" />
                  身高
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 text-sm"
                />
                <div className="text-xs text-zinc-500 mt-1">cm</div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  <Scale className="w-3.5 h-3.5 text-rose-500" />
                  体重
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 text-sm"
                />
                <div className="text-xs text-zinc-500 mt-1">kg</div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  年龄
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 text-sm"
                />
                <div className="text-xs text-zinc-500 mt-1">岁</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                活动水平
              </label>
              <div className="grid grid-cols-5 gap-2">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setActivityLevel(opt.value)}
                    className={`p-2.5 rounded-lg border transition-all text-center ${
                      activityLevel === opt.value
                        ? "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700"
                        : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                    }`}
                  >
                    <div className={`text-xs font-medium ${
                      activityLevel === opt.value ? "text-rose-700 dark:text-rose-300" : "text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                <Target className="w-4 h-4 inline mr-1 text-rose-500" />
                目标
              </label>
              <div className="grid grid-cols-5 gap-2">
                {goalOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`p-2.5 rounded-lg border transition-all text-center ${
                      goal === opt.value
                        ? "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700"
                        : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                    }`}
                  >
                    <div className={`text-xs font-medium ${
                      goal === opt.value ? "text-rose-700 dark:text-rose-300" : "text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/25">
            <div className="text-center mb-6">
              <div className="text-sm text-rose-100 mb-1">每日目标热量摄入</div>
              <div className="text-5xl font-bold">
                {result.targetCalories.toFixed(0)}
                <span className="text-2xl ml-2">千卡</span>
              </div>
              <p className="text-sm text-rose-100 mt-2">
                {result.dailyDiff > 0 ? `每日多摄入 ${result.dailyDiff.toFixed(0)} 千卡` : result.dailyDiff < 0 ? `每日少摄入 ${Math.abs(result.dailyDiff).toFixed(0)} 千卡` : "维持当前体重"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-rose-100 mb-1">基础代谢 (BMR)</div>
                <div className="text-xl font-semibold">{result.bmr.toFixed(0)} kcal</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs text-rose-100 mb-1">总消耗 (TDEE)</div>
                <div className="text-xl font-semibold">{result.tdee.toFixed(0)} kcal</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              小知识
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>• 1公斤脂肪约等于7700千卡热量</p>
            <p>• 健康减重速度：每周0.5-1公斤</p>
            <p>• 建议每日热量摄入不低于基础代谢率</p>
            <p>• 配合运动可以更高效地达到目标</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
