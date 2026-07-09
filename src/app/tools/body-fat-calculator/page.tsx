"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Droplets,
  Ruler,
  Scale,
  Heart,
  Calculator,
  Info,
} from "lucide-react";

// 使用美国海军体脂公式
function calculateBodyFat(
  height: number,
  weight: number,
  waist: number,
  neck: number,
  hip: number,
  gender: "male" | "female"
): number {
  if (gender === "male") {
    // 男性公式: 495 / (1.0324 - 0.19077 * log10(腰围-颈围) + 0.15456 * log10(身高)) - 450
    const log1 = Math.log10(waist - neck);
    const log2 = Math.log10(height);
    return 495 / (1.0324 - 0.19077 * log1 + 0.15456 * log2) - 450;
  } else {
    // 女性公式: 495 / (1.29579 - 0.35004 * log10(腰围+臀围-颈围) + 0.22100 * log10(身高)) - 450
    const log1 = Math.log10(waist + hip - neck);
    const log2 = Math.log10(height);
    return 495 / (1.29579 - 0.35004 * log1 + 0.221 * log2) - 450;
  }
}

function getBodyFatCategory(bf: number, gender: "male" | "female") {
  if (gender === "male") {
    if (bf < 6) return { label: "必需脂肪", color: "text-blue-600", bg: "from-blue-400 to-cyan-500" };
    if (bf < 14) return { label: "运动员水平", color: "text-emerald-600", bg: "from-emerald-400 to-green-500" };
    if (bf < 18) return { label: "健康范围", color: "text-green-600", bg: "from-green-400 to-emerald-500" };
    if (bf < 25) return { label: "可接受范围", color: "text-amber-600", bg: "from-amber-400 to-orange-500" };
    return { label: "肥胖", color: "text-rose-600", bg: "from-rose-500 to-red-600" };
  } else {
    if (bf < 14) return { label: "必需脂肪", color: "text-blue-600", bg: "from-blue-400 to-cyan-500" };
    if (bf < 21) return { label: "运动员水平", color: "text-emerald-600", bg: "from-emerald-400 to-green-500" };
    if (bf < 25) return { label: "健康范围", color: "text-green-600", bg: "from-green-400 to-emerald-500" };
    if (bf < 32) return { label: "可接受范围", color: "text-amber-600", bg: "from-amber-400 to-orange-500" };
    return { label: "肥胖", color: "text-rose-600", bg: "from-rose-500 to-red-600" };
  }
}

export default function BodyFatCalculatorPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [waist, setWaist] = useState(80);
  const [neck, setNeck] = useState(38);
  const [hip, setHip] = useState(95);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(25);

  const result = useMemo(() => {
    if (height <= 0 || weight <= 0 || waist <= 0 || neck <= 0) return null;
    if (gender === "female" && hip <= 0) return null;
    if (waist <= neck) return null;

    try {
      const bodyFat = calculateBodyFat(height, weight, waist, neck, hip, gender);
      if (bodyFat < 0 || bodyFat > 100) return null;

      const category = getBodyFatCategory(bodyFat, gender);
      const fatMass = weight * (bodyFat / 100);
      const leanMass = weight - fatMass;
      const bmi = weight / Math.pow(height / 100, 2);

      return { bodyFat, category, fatMass, leanMass, bmi };
    } catch {
      return null;
    }
  }, [height, weight, waist, neck, hip, gender, age]);

  return (
    <ToolLayout
      title="体脂率计算器"
      description="使用美国海军体脂公式，通过身高体重和围度数据估算体脂率，了解身体脂肪含量"
      toolId="body-fat-calculator"
      icon={Droplets}
      category="计算工具"
      slug="body-fat-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                身体数据
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  <Ruler className="w-3.5 h-3.5 text-cyan-500" />
                  身高
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
                <div className="text-xs text-zinc-500 mt-1">cm</div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  <Scale className="w-3.5 h-3.5 text-cyan-500" />
                  体重
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
                <div className="text-xs text-zinc-500 mt-1">kg</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                  腰围
                </label>
                <input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
                <div className="text-xs text-zinc-500 mt-1">cm</div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                  颈围
                </label>
                <input
                  type="number"
                  value={neck}
                  onChange={(e) => setNeck(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 text-sm"
                />
                <div className="text-xs text-zinc-500 mt-1">cm</div>
              </div>
              {gender === "female" && (
                <div>
                  <label className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-2 block">
                    臀围
                  </label>
                  <input
                    type="number"
                    value={hip}
                    onChange={(e) => setHip(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 text-sm"
                  />
                  <div className="text-xs text-zinc-500 mt-1">cm</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {result && (
          <div className={`bg-gradient-to-br ${result.category.bg} rounded-2xl p-6 text-white shadow-lg`}>
            <div className="text-center mb-6">
              <div className="text-sm opacity-80 mb-1">体脂率</div>
              <div className="text-5xl font-bold">
                {result.bodyFat.toFixed(1)}%
              </div>
              <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mt-3">
                {result.category.label}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">脂肪重量</div>
                <div className="text-lg font-semibold">{result.fatMass.toFixed(1)} kg</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">瘦体重</div>
                <div className="text-lg font-semibold">{result.leanMass.toFixed(1)} kg</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl">
                <div className="text-xs opacity-80 mb-1">BMI</div>
                <div className="text-lg font-semibold">{result.bmi.toFixed(1)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              测量说明
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>• 腰围：在肚脐上方约2.5cm处水平测量，保持自然呼吸</p>
            <p>• 颈围：在喉结下方、肩颈上方水平测量</p>
            <p>• 臀围（女性）：在臀部最宽处水平测量</p>
            <p>• 本工具使用美国海军体脂公式估算，仅供参考</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
