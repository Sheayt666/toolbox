"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ChefHat, Plus, Trash2, Users } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export default function RecipeConverterPage() {
  const [originalServings, setOriginalServings] = useState(2);
  const [targetServings, setTargetServings] = useState(4);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: "1", name: "面粉", amount: 200, unit: "克" },
    { id: "2", name: "鸡蛋", amount: 2, unit: "个" },
    { id: "3", name: "牛奶", amount: 150, unit: "毫升" },
  ]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("克");

  const handleAdd = () => {
    if (!name.trim() || !amount.trim()) return;
    setIngredients([...ingredients, { id: Date.now().toString(), name: name.trim(), amount: parseFloat(amount), unit }]);
    setName(""); setAmount("");
  };

  const handleDelete = (id: string) => setIngredients(ingredients.filter((i) => i.id !== id));

  const ratio = originalServings > 0 ? targetServings / originalServings : 1;

  const formatAmount = (original: number, ratio: number) => {
    const converted = original * ratio;
    if (converted % 1 === 0) return converted.toString();
    return converted.toFixed(1);
  };

  return (
    <ToolLayout title="食谱分量换算" description="根据用餐人数自动换算食谱用量" icon={ChefHat} category="生活工具" slug="recipe-converter">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
            <div className="flex items-center gap-4 justify-center">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">原始人数</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setOriginalServings(Math.max(1, originalServings - 1))} className="w-8 h-8 rounded-lg bg-[#18181b] text-slate-400 hover:text-white transition-colors">-</button>
                  <span className="text-2xl font-bold text-white w-10 text-center">{originalServings}</span>
                  <button onClick={() => setOriginalServings(originalServings + 1)} className="w-8 h-8 rounded-lg bg-[#18181b] text-slate-400 hover:text-white transition-colors">+</button>
                </div>
              </div>
              <div className="text-2xl text-primary-400">→</div>
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">目标人数</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setTargetServings(Math.max(1, targetServings - 1))} className="w-8 h-8 rounded-lg bg-[#18181b] text-slate-400 hover:text-white transition-colors">-</button>
                  <span className="text-2xl font-bold text-primary-400 w-10 text-center">{targetServings}</span>
                  <button onClick={() => setTargetServings(targetServings + 1)} className="w-8 h-8 rounded-lg bg-[#18181b] text-slate-400 hover:text-white transition-colors">+</button>
                </div>
              </div>
            </div>
            <div className="text-center mt-3 text-sm text-slate-400">
              换算比例: <span className="text-primary-400 font-bold">1 : {(ratio).toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl mb-4">
            <div className="flex gap-3 flex-wrap">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="食材名称" className="flex-1 min-w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="用量" className="w-24 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm">
                <option value="克">克</option><option value="毫升">毫升</option><option value="个">个</option><option value="勺">勺</option><option value="杯">杯</option>
              </select>
              <button onClick={handleAdd} disabled={!name.trim() || !amount.trim()} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-1"><Plus className="w-4 h-4" />添加</button>
            </div>
          </div>

          <div className="space-y-2">
            {ingredients.map((ing) => (
              <div key={ing.id} className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-xl group">
                <ChefHat className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-white text-sm font-medium flex-1">{ing.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 line-through">{ing.amount}{ing.unit}</span>
                  <span className="text-primary-400">→</span>
                  <span className="text-sm text-emerald-400 font-bold">{formatAmount(ing.amount, ratio)}{ing.unit}</span>
                </div>
                <button onClick={() => handleDelete(ing.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {ingredients.length === 0 && <div className="text-center py-12 text-slate-500">请添加食材</div>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
