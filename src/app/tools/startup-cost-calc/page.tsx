"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Rocket, Plus, Trash2 } from "lucide-react";

interface CostItem {
  name: string;
  amount: number;
  category: string;
}

const DEFAULT_ITEMS: CostItem[] = [
  { name: "店面租金", amount: 50000, category: "场地" },
  { name: "装修费用", amount: 80000, category: "场地" },
  { name: "设备采购", amount: 60000, category: "设备" },
  { name: "首批库存", amount: 40000, category: "库存" },
  { name: "营业执照", amount: 2000, category: "行政" },
  { name: "市场推广", amount: 20000, category: "营销" },
  { name: "员工工资(3月)", amount: 60000, category: "人力" },
];

export default function StartupCostCalcPage() {
  const [items, setItems] = useState<CostItem[]>(DEFAULT_ITEMS);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState(0);
  const [newCategory, setNewCategory] = useState("其他");

  const result = useMemo(() => {
    const total = items.reduce((s, i) => s + i.amount, 0);
    const byCategory: Record<string, number> = {};
    items.forEach((i) => { byCategory[i.category] = (byCategory[i.category] || 0) + i.amount; });
    const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    return { total, categories };
  }, [items]);

  const addItem = () => {
    if (!newName || newAmount <= 0) return;
    setItems([...items, { name: newName, amount: newAmount, category: newCategory }]);
    setNewName(""); setNewAmount(0);
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const colors = ["from-rose-500 to-red-500", "from-sky-500 to-blue-500", "from-emerald-500 to-green-500", "from-amber-500 to-orange-500", "from-purple-500 to-violet-500", "from-cyan-500 to-teal-500"];

  return (
    <ToolLayout title="创业成本计算" description="估算创业启动成本，各项初始投入分类统计" toolId="startup-cost-calc" icon={Rocket} category="金融理财" slug="startup-cost-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">添加成本项</h3>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="项目名称" className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            <input type="number" value={newAmount} onChange={(e) => setNewAmount(+e.target.value)} placeholder="金额" className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
              {["场地", "设备", "库存", "行政", "营销", "人力", "其他"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={addItem} className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-1 text-sm"><Plus className="w-4 h-4" />添加</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4 col-span-2 lg:col-span-1"><div className="text-xs text-slate-400 mb-1">启动总成本</div><div className="text-xl font-bold text-white">{result.total.toLocaleString()}</div></div>
          {result.categories.slice(0, 3).map(([cat, amt], i) => (
            <div key={cat} className="bg-gradient-to-br to-transparent rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">{cat}</div><div className="text-xl font-bold text-white">{amt.toLocaleString()}</div></div>
          ))}
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">成本分类占比</h3>
          <div className="space-y-3">
            {result.categories.map(([cat, amt], i) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{cat}</span><span className="text-slate-400">{amt.toLocaleString()} ({((amt / result.total) * 100).toFixed(1)}%)</span></div>
                <div className="w-full bg-[#0d0d0f] rounded-full h-3 overflow-hidden"><div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full`} style={{ width: `${(amt / result.total) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3f3f46]"><h3 className="text-sm font-semibold text-white">成本明细</h3></div>
          <div className="divide-y divide-[#3f3f46]">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div><span className="text-sm text-white">{item.name}</span><span className="ml-2 text-xs text-slate-500">{item.category}</span></div>
                <div className="flex items-center gap-3"><span className="text-sm text-slate-300">¥{item.amount.toLocaleString()}</span><button onClick={() => removeItem(i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
