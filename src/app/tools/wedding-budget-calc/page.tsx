"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Heart, Plus, Trash2 } from "lucide-react";

interface WeddingItem {
  name: string;
  amount: number;
  category: string;
}

const DEFAULT_ITEMS: WeddingItem[] = [
  { name: "婚纱摄影", amount: 8000, category: "摄影" },
  { name: "婚宴酒席", amount: 50000, category: "婚宴" },
  { name: "婚礼策划", amount: 15000, category: "策划" },
  { name: "婚戒首饰", amount: 20000, category: "首饰" },
  { name: "婚车租赁", amount: 3000, category: "其他" },
  { name: "喜糖喜帖", amount: 2000, category: "其他" },
];

const CATEGORIES = ["婚宴", "摄影", "策划", "首饰", "礼服", "其他"];

export default function WeddingBudgetCalcPage() {
  const [items, setItems] = useState<WeddingItem[]>(DEFAULT_ITEMS);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState(0);
  const [newCategory, setNewCategory] = useState("其他");
  const [budget, setBudget] = useState(100000);

  const result = useMemo(() => {
    const total = items.reduce((s, i) => s + i.amount, 0);
    const byCat: Record<string, number> = {};
    items.forEach((i) => { byCat[i.category] = (byCat[i.category] || 0) + i.amount; });
    const categories = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const remaining = budget - total;
    return { total, categories, remaining, pct: budget > 0 ? (total / budget) * 100 : 0 };
  }, [items, budget]);

  const addItem = () => {
    if (!newName || newAmount <= 0) return;
    setItems([...items, { name: newName, amount: newAmount, category: newCategory }]);
    setNewName(""); setNewAmount(0);
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const colors = ["from-rose-500 to-pink-500", "from-purple-500 to-violet-500", "from-amber-500 to-orange-500", "from-sky-500 to-blue-500", "from-emerald-500 to-green-500", "from-cyan-500 to-teal-500"];

  return (
    <ToolLayout title="婚礼预算规划" description="婚礼各项开支预算管理，控制总花费不超支" toolId="wedding-budget-calc" icon={Heart} category="金融理财" slug="wedding-budget-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="项目名称" className="bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          <input type="number" value={newAmount} onChange={(e) => setNewAmount(+e.target.value)} placeholder="金额" className="bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={addItem} className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-1 text-sm"><Plus className="w-4 h-4" />添加</button>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">婚礼预算总额 (元)</label><input type="number" value={budget} onChange={(e) => setBudget(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">预计总花费</div><div className="text-xl font-bold text-white">{result.total.toLocaleString()}</div></div>
          <div className={`bg-gradient-to-br to-transparent rounded-xl border p-4 ${result.remaining >= 0 ? "from-emerald-500/10 border-emerald-500/20" : "from-rose-500/10 border-rose-500/20"}`}><div className="text-xs text-slate-400 mb-1">{result.remaining >= 0 ? "预算剩余" : "超支"}</div><div className={`text-xl font-bold ${result.remaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{Math.abs(result.remaining).toLocaleString()}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">预算使用率</div><div className="text-xl font-bold text-sky-400">{result.pct.toFixed(1)}%</div></div>
        </div>
        <div className="w-full bg-[#0d0d0f] rounded-full h-3 overflow-hidden"><div className={`h-full rounded-full ${result.pct > 100 ? "bg-gradient-to-r from-rose-500 to-red-500" : "bg-gradient-to-r from-rose-400 to-pink-500"}`} style={{ width: `${Math.min(100, result.pct)}%` }} /></div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">分类统计</h3>
          <div className="space-y-3">
            {result.categories.map(([cat, amt], i) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{cat}</span><span className="text-slate-400">{amt.toLocaleString()} ({((amt / result.total) * 100).toFixed(1)}%)</span></div>
                <div className="w-full bg-[#0d0d0f] rounded-full h-3 overflow-hidden"><div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full`} style={{ width: `${(amt / result.total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] divide-y divide-[#3f3f46]">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div><span className="text-sm text-white">{item.name}</span><span className="ml-2 text-xs text-slate-500">{item.category}</span></div>
              <div className="flex items-center gap-3"><span className="text-sm text-slate-300">¥{item.amount.toLocaleString()}</span><button onClick={() => removeItem(i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
