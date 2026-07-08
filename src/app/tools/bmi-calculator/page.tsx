"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Scale, Ruler, Weight, Heart, AlertTriangle, CheckCircle, Info, TrendingUp, TrendingDown } from "lucide-react";

interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  categoryBgColor: string;
  description: string;
  suggestions: string[];
  idealWeightMin: number;
  idealWeightMax: number;
}

function calculateBMI(height: number, weight: number, gender: "male" | "female"): BMIResult | null {
  if (height <= 0 || weight <= 0) return null;

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  let category = "";
  let categoryColor = "";
  let categoryBgColor = "";
  let description = "";
  let suggestions: string[] = [];

  const idealWeightMin = 18.5 * heightInMeters * heightInMeters;
  const idealWeightMax = 23.9 * heightInMeters * heightInMeters;

  if (bmi < 18.5) {
    category = "偏瘦";
    categoryColor = "text-sky-600 dark:text-sky-400";
    categoryBgColor = "from-sky-400 to-cyan-500";
    description = "您的体重低于正常范围，建议适当增加营养摄入";
    suggestions = [
      "适当增加热量摄入，多吃优质蛋白质食物",
      "进行力量训练，增加肌肉量",
      "保持规律作息，避免过度劳累",
      "定期体检，排除可能的健康问题",
    ];
  } else if (bmi < 24) {
    category = "正常";
    categoryColor = "text-emerald-600 dark:text-emerald-400";
    categoryBgColor = "from-emerald-400 to-green-500";
    description = "恭喜！您的体重在健康范围内，请继续保持";
    suggestions = [
      "继续保持均衡饮食，多吃蔬菜水果",
      "坚持规律运动，每周至少150分钟中等强度运动",
      "保持良好的睡眠质量",
      "定期测量体重，维持健康状态",
    ];
  } else if (bmi < 28) {
    category = "偏胖";
    categoryColor = "text-amber-600 dark:text-amber-400";
    categoryBgColor = "from-amber-400 to-orange-500";
    description = "您的体重略高于正常范围，建议适当控制体重";
    suggestions = [
      "控制热量摄入，减少高糖高脂食物",
      "增加有氧运动，如快走、跑步、游泳",
      "保证充足睡眠，避免熬夜",
      "循序渐进减重，每周减重不超过0.5-1公斤",
    ];
  } else {
    category = "肥胖";
    categoryColor = "text-rose-600 dark:text-rose-400";
    categoryBgColor = "from-rose-500 to-red-600";
    description = "您的体重明显超标，建议采取积极措施减重";
    suggestions = [
      "严格控制饮食，减少热量和碳水摄入",
      "制定科学的运动计划，循序渐进",
      "建议咨询专业医生或营养师",
      "关注血压、血糖等健康指标",
    ];
  }

  return {
    bmi,
    category,
    categoryColor,
    categoryBgColor,
    description,
    suggestions,
    idealWeightMin,
    idealWeightMax,
  };
}

export default function BMICalculatorPage() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(25);

  const result = useMemo(() => calculateBMI(height, weight, gender), [height, weight, gender]);

  const bmiPercentage = result ? Math.min(100, Math.max(0, ((result.bmi - 15) / 25) * 100)) : 0;

  return (
    <ToolLayout
      title="BMI计算器"
      description="根据身高体重计算身体质量指数（BMI），评估体重健康状况，给出专业健康建议"
      toolId="bmi-calculator"
      icon={Scale}
      category="计算工具"
      slug="bmi-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-orange-500" />
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
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>120cm</span>
                <span>220cm</span>
              </div>
            </div>

            {/* 体重 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Weight className="w-4 h-4 text-orange-500" />
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
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>30kg</span>
                <span>150kg</span>
              </div>
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
                min={6}
                max={100}
                step={1}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>6岁</span>
                <span>100岁</span>
              </div>
            </div>
          </div>
        </div>

        {/* 计算结果 */}
        {result && (
          <>
            <div className={`bg-gradient-to-br ${result.categoryBgColor} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="text-center">
                <div className="text-sm text-white/80 mb-2">您的BMI指数</div>
                <div className="text-6xl font-bold mb-2">{result.bmi.toFixed(1)}</div>
                <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-4">
                  {result.category}
                </div>
                <p className="text-white/90 text-sm">{result.description}</p>
              </div>

              {/* BMI 刻度 */}
              <div className="mt-8">
                <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-white/40 rounded-full transition-all"
                    style={{ width: `${bmiPercentage}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg transition-all"
                    style={{ left: `calc(${bmiPercentage}% - 10px)` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/70">
                  <span>偏瘦</span>
                  <span>正常</span>
                  <span>偏胖</span>
                  <span>肥胖</span>
                </div>
                <div className="flex justify-between mt-1 text-xs text-white/50">
                  <span>18.5</span>
                  <span>24</span>
                  <span>28</span>
                </div>
              </div>

              {/* 理想体重 */}
              <div className="mt-6 flex items-center justify-center gap-6 text-center">
                <div>
                  <div className="text-xs text-white/70 mb-1">理想体重范围</div>
                  <div className="text-lg font-semibold">
                    {result.idealWeightMin.toFixed(1)} - {result.idealWeightMax.toFixed(1)} kg
                  </div>
                </div>
              </div>
            </div>

            {/* 健康建议 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    健康建议
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${result.categoryBgColor} flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pt-0.5">
                        {suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BMI标准参考 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  中国成人BMI标准
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
                  <div className="text-sm font-medium text-sky-700 dark:text-sky-300 mb-1">偏瘦</div>
                  <div className="text-lg font-bold text-sky-600 dark:text-sky-400">{'< 18.5'}</div>
                  <div className="text-xs text-sky-500 dark:text-sky-400/70 mt-1">
                    <TrendingDown className="w-3 h-3 inline mr-1" />
                    体重过低
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">正常</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">18.5 - 23.9</div>
                  <div className="text-xs text-emerald-500 dark:text-emerald-400/70 mt-1">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    健康范围
                  </div>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">偏胖</div>
                  <div className="text-lg font-bold text-amber-600 dark:text-amber-400">24 - 27.9</div>
                  <div className="text-xs text-amber-500 dark:text-amber-400/70 mt-1">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    体重超标
                  </div>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                  <div className="text-sm font-medium text-rose-700 dark:text-rose-300 mb-1">肥胖</div>
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{'≥ 28'}</div>
                  <div className="text-xs text-rose-500 dark:text-rose-400/70 mt-1">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    需重视
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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
                BMI的计算公式是什么？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                BMI = 体重(kg) ÷ 身高(m)²。例如身高170cm、体重65kg，BMI = 65 ÷ (1.7 × 1.7) ≈ 22.5。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                BMI标准对所有人都适用吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                BMI标准主要适用于18-65岁的成年人。儿童、孕妇、老年人和运动员等特殊人群可能不适用，
                因为肌肉量、身体构成等因素会影响BMI的解读。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                BMI正常就代表健康吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                BMI只是衡量体重的一个指标，不能完全代表健康状况。体脂率、肌肉量、腰臀比等指标同样重要，
                建议综合多个指标评估健康状况。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
