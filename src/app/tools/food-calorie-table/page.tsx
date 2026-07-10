"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { UtensilsCrossed, Search } from "lucide-react";

interface Food {
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
}

const FOODS: Food[] = [
  { name: "米饭", category: "主食", calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3, unit: "100g" },
  { name: "面条", category: "主食", calories: 137, protein: 4.5, carbs: 28.2, fat: 0.5, unit: "100g" },
  { name: "馒头", category: "主食", calories: 223, protein: 7.0, carbs: 47.0, fat: 1.1, unit: "100g" },
  { name: "面包", category: "主食", calories: 313, protein: 8.3, carbs: 58.6, fat: 5.1, unit: "100g" },
  { name: "燕麦", category: "主食", calories: 377, protein: 13.0, carbs: 67.0, fat: 6.7, unit: "100g" },
  { name: "红薯", category: "主食", calories: 99, protein: 1.1, carbs: 23.1, fat: 0.2, unit: "100g" },
  { name: "玉米", category: "主食", calories: 112, protein: 4.0, carbs: 22.8, fat: 1.2, unit: "100g" },
  { name: "鸡蛋", category: "蛋类", calories: 144, protein: 13.3, carbs: 1.5, fat: 8.8, unit: "100g" },
  { name: "牛奶", category: "奶制品", calories: 54, protein: 3.0, carbs: 3.4, fat: 3.2, unit: "100ml" },
  { name: "酸奶", category: "奶制品", calories: 72, protein: 2.5, carbs: 9.3, fat: 2.7, unit: "100g" },
  { name: "奶酪", category: "奶制品", calories: 328, protein: 25.7, carbs: 3.5, fat: 23.5, unit: "100g" },
  { name: "鸡胸肉", category: "肉类", calories: 133, protein: 31.0, carbs: 0, fat: 1.2, unit: "100g" },
  { name: "猪里脊", category: "肉类", calories: 155, protein: 20.2, carbs: 1.5, fat: 7.9, unit: "100g" },
  { name: "牛肉", category: "肉类", calories: 125, protein: 20.0, carbs: 0, fat: 4.2, unit: "100g" },
  { name: "羊肉", category: "肉类", calories: 203, protein: 19.0, carbs: 0, fat: 14.1, unit: "100g" },
  { name: "三文鱼", category: "水产", calories: 139, protein: 17.2, carbs: 0, fat: 7.8, unit: "100g" },
  { name: "虾", category: "水产", calories: 87, protein: 16.4, carbs: 0, fat: 1.3, unit: "100g" },
  { name: "豆腐", category: "豆制品", calories: 81, protein: 8.1, carbs: 1.9, fat: 4.2, unit: "100g" },
  { name: "豆浆", category: "豆制品", calories: 31, protein: 3.0, carbs: 1.2, fat: 1.6, unit: "100ml" },
  { name: "苹果", category: "水果", calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, unit: "100g" },
  { name: "香蕉", category: "水果", calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, unit: "100g" },
  { name: "橙子", category: "水果", calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, unit: "100g" },
  { name: "西瓜", category: "水果", calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, unit: "100g" },
  { name: "葡萄", category: "水果", calories: 67, protein: 0.6, carbs: 16.8, fat: 0.2, unit: "100g" },
  { name: "西兰花", category: "蔬菜", calories: 34, protein: 2.8, carbs: 4.3, fat: 0.4, unit: "100g" },
  { name: "菠菜", category: "蔬菜", calories: 23, protein: 2.9, carbs: 2.8, fat: 0.3, unit: "100g" },
  { name: "番茄", category: "蔬菜", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: "100g" },
  { name: "黄瓜", category: "蔬菜", calories: 15, protein: 0.7, carbs: 2.9, fat: 0.1, unit: "100g" },
  { name: "胡萝卜", category: "蔬菜", calories: 39, protein: 1.0, carbs: 8.8, fat: 0.2, unit: "100g" },
  { name: "巧克力", category: "零食", calories: 546, protein: 7.3, carbs: 57.0, fat: 31.0, unit: "100g" },
  { name: "薯片", category: "零食", calories: 547, protein: 6.6, carbs: 50.0, fat: 35.6, unit: "100g" },
  { name: "可乐", category: "饮料", calories: 42, protein: 0, carbs: 10.6, fat: 0, unit: "100ml" },
];

export default function FoodCalorieTablePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");

  const categories = useMemo(() => ["全部", ...Array.from(new Set(FOODS.map((f) => f.category)))], []);
  const filtered = useMemo(() => {
    let r = FOODS;
    if (category !== "全部") r = r.filter((f) => f.category === category);
    if (query.trim()) r = r.filter((f) => f.name.includes(query));
    return r;
  }, [query, category]);

  return (
    <ToolLayout title="食物热量表" description="查询常见食物的热量、蛋白质、碳水、脂肪含量" icon={UtensilsCrossed} category="查询工具" slug="food-calorie-table">
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索食物名称..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{c}</button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#27272a] text-slate-400">
                <th className="text-left py-3 px-3 font-medium">食物</th>
                <th className="text-left py-3 px-3 font-medium">分类</th>
                <th className="text-right py-3 px-3 font-medium">热量(kcal)</th>
                <th className="text-right py-3 px-3 font-medium">蛋白质(g)</th>
                <th className="text-right py-3 px-3 font-medium">碳水(g)</th>
                <th className="text-right py-3 px-3 font-medium">脂肪(g)</th>
                <th className="text-right py-3 px-3 font-medium">单位</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => (
                <tr key={i} className="border-b border-[#1e1e21] hover:bg-[#1c1c1f] transition-colors">
                  <td className="py-3 px-3 text-white font-medium">{f.name}</td>
                  <td className="py-3 px-3"><span className="text-xs px-2 py-0.5 bg-[#27272a] text-slate-400 rounded">{f.category}</span></td>
                  <td className="py-3 px-3 text-right font-mono text-orange-400 font-bold">{f.calories}</td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-400">{f.protein}</td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400">{f.carbs}</td>
                  <td className="py-3 px-3 text-right font-mono text-red-400">{f.fat}</td>
                  <td className="py-3 px-3 text-right text-slate-500 text-xs">{f.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
