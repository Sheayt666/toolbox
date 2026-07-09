"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Flame, Plus, Trash2, Target, Activity, Utensils } from "lucide-react";

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
}

const mealLabels = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

const commonFoods = [
  { name: "米饭(1碗)", calories: 200 },
  { name: "鸡蛋(1个)", calories: 70 },
  { name: "牛奶(250ml)", calories: 150 },
  { name: "苹果(1个)", calories: 95 },
  { name: "香蕉(1根)", calories: 105 },
  { name: "面包(1片)", calories: 80 },
  { name: "鸡胸肉(100g)", calories: 165 },
  { name: "牛肉面(1碗)", calories: 550 },
  { name: "汉堡(1个)", calories: 550 },
  { name: "薯条(中)", calories: 365 },
  { name: "可乐(330ml)", calories: 140 },
  { name: "咖啡(美式)", calories: 5 },
];

export default function CalorieTrackerPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [meal, setMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [targetCalories, setTargetCalories] = useState(2000);
  const today = new Date().toISOString().split("T")[0];

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const saved = localStorage.getItem("calorie-tracker-data");
      if (saved) {
        setEntries(JSON.parse(saved));
      }
      const savedTarget = localStorage.getItem("calorie-target");
      if (savedTarget) {
        setTargetCalories(parseInt(savedTarget));
      }
    } catch {
      // ignore
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem("calorie-tracker-data", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("calorie-target", String(targetCalories));
  }, [targetCalories]);

  const addEntry = () => {
    if (!foodName.trim() || !calories || parseFloat(calories) <= 0) return;
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: foodName.trim(),
      calories: parseFloat(calories),
      meal,
      date: today,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setFoodName("");
    setCalories("");
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addQuickFood = (food: { name: string; calories: number }) => {
    const newEntry: FoodEntry = {
      id: Date.now().toString() + Math.random(),
      name: food.name,
      calories: food.calories,
      meal,
      date: today,
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  // 今日摄入
  const todayEntries = entries.filter((e) => e.date === today);
  const totalCalories = todayEntries.reduce((s, e) => s + e.calories, 0);
  const remaining = targetCalories - totalCalories;

  // 按餐次分组
  const mealGroups = {
    breakfast: todayEntries.filter((e) => e.meal === "breakfast"),
    lunch: todayEntries.filter((e) => e.meal === "lunch"),
    dinner: todayEntries.filter((e) => e.meal === "dinner"),
    snack: todayEntries.filter((e) => e.meal === "snack"),
  };

  const progressPercent = Math.min((totalCalories / targetCalories) * 100, 100);
  const isOverLimit = totalCalories > targetCalories;

  return (
    <ToolLayout
      title="卡路里记录"
      description="记录每日饮食摄入的卡路里，管理体重，健康饮食从记录开始"
      icon={Flame}
      category="生活工具"
      slug="calorie-tracker"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 今日概览 */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/25">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-white/70 mb-1">今日摄入</div>
              <div className="text-4xl font-bold">
                {Math.round(totalCalories)}
                <span className="text-xl text-white/60 ml-1">kcal</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70 mb-1">目标</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(Math.max(500, parseInt(e.target.value) || 2000))}
                  className="w-20 bg-transparent border-b border-white/30 text-right text-xl font-bold focus:outline-none focus:border-white/60"
                />
                <span className="text-sm text-white/60">kcal</span>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverLimit ? "bg-red-300" : "bg-white/80"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className={isOverLimit ? "text-red-200" : "text-white/70"}>
              {isOverLimit ? `超出 ${Math.abs(Math.round(remaining))} kcal` : `还可摄入 ${Math.round(remaining)} kcal`}
            </span>
            <span className="text-white/70">{Math.round(progressPercent)}%</span>
          </div>
        </div>

        {/* 快速添加 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-400" />
              快速添加
            </h3>
            <div className="flex gap-1 bg-[#09090b] p-1 rounded-lg">
              {(Object.keys(mealLabels) as Array<keyof typeof mealLabels>).map((m) => (
                <button
                  key={m}
                  onClick={() => setMeal(m)}
                  className={`px-2 py-1 text-xs rounded-md transition-all ${
                    meal === m
                      ? "bg-orange-500/20 text-orange-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {mealLabels[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {commonFoods.map((food) => (
              <button
                key={food.name}
                onClick={() => addQuickFood(food)}
                className="p-3 bg-[#09090b] hover:bg-[#27272a] rounded-xl border border-[#27272a] hover:border-orange-500/30 transition-all text-left group"
              >
                <div className="text-sm text-white group-hover:text-orange-400 transition-colors truncate">
                  {food.name}
                </div>
                <div className="text-xs text-orange-400 mt-1">{food.calories} kcal</div>
              </button>
            ))}
          </div>

          {showForm ? (
            <div className="mt-4 pt-4 border-t border-[#27272a] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="食物名称"
                  className="px-3 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                />
                <div className="relative">
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="热量"
                    className="w-full px-3 py-2.5 pr-12 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">kcal</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 bg-[#09090b] text-slate-400 hover:text-white rounded-lg text-sm border border-[#27272a]"
                >
                  取消
                </button>
                <button
                  onClick={addEntry}
                  disabled={!foodName.trim() || !calories}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  添加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-4 py-2.5 bg-[#09090b] border border-[#27272a] border-dashed rounded-xl text-slate-500 hover:text-white hover:border-slate-600 transition-all text-sm flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              自定义添加
            </button>
          )}
        </div>

        {/* 今日记录 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              今日记录
            </h3>
          </div>

          {todayEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">今日还没有记录，开始记录吧</p>
            </div>
          ) : (
            <div className="divide-y divide-[#27272a]">
              {(Object.keys(mealGroups) as Array<keyof typeof mealGroups>).map((m) => {
                const group = mealGroups[m];
                if (group.length === 0) return null;
                const groupTotal = group.reduce((s, e) => s + e.calories, 0);
                return (
                  <div key={m}>
                    <div className="px-4 py-2 bg-[#09090b]/50 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">
                        {mealLabels[m]}
                      </span>
                      <span className="text-xs text-slate-500">
                        {Math.round(groupTotal)} kcal
                      </span>
                    </div>
                    {group.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#09090b] transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <Flame className="w-4 h-4 text-orange-400" />
                        </div>
                        <span className="flex-1 text-sm text-white">{entry.name}</span>
                        <span className="text-sm text-orange-400 font-mono">
                          {entry.calories} kcal
                        </span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 小知识 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-400" />
            热量小知识
          </h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>• 成年女性每日推荐摄入约 1800-2000 kcal</p>
            <p>• 成年男性每日推荐摄入约 2200-2500 kcal</p>
            <p>• 每减少约 7700 kcal 摄入，约可减少 1kg 体重</p>
            <p>• 数据保存在浏览器本地，清除数据会丢失</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
