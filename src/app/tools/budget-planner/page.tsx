"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ClipboardList, Plus, Trash2 } from "lucide-react";

interface BudgetItem {
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

const DEFAULT_ITEMS: BudgetItem[] = [
  { name: "工资", amount: 15000, type: "income", category: "收入" },
  { name: "兼职", amount: 2000, type: "income", category: "收入" },
  { name: "房租", amount: 4000, type: "expense", category: "住房" },
  { name: "餐饮", amount: 3000, type: "expense", category: "生活" },
  { name: "交通", amount: 1000, type: "expense", category: "生活" },
  { name: "购物", amount: 2000, type: "expense", category: "生活" },
  { name: "娱乐", amount: 800, type: "expense", category: "娱乐" },
];

export default function BudgetPlannerPage() {
  const [items, setItems] = useState<BudgetItem[]>(DEFAULT_ITEMS);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState(0);
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCategory, setNewCategory] = useState("生活");

  const result = useMemo(() => {
    const income = items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0);
    const expense = items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0);
    const balance = income - expense;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;
    const byCat: Record<string, number> = {};
    items.filter((i) => i.type === "expense").forEach((i) => { byCat[i.category] = (byCat[i.category] || 0) + i.amount; });
    const categories = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    return { income, expense, balance, savingsRate, categories };
  }, [items]);

  const addItem = () => {
    if (!newName || newAmount <= 0) return;
    setItems([...items, { name: newName, amount: newAmount, type: newType, category: newType === "income" ? "收入" : newCategory }]);
    setNewName(""); setNewAmount(0);
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  return (
    <ToolLayout title="家庭预算规划" description="制定家庭月度收支预算，分类管理各项开支" toolId="budget-planner" icon={ClipboardList} category="金融理财" slug="budget-planner">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="项目名称" className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            <input type="number" value={newAmount} onChange={(e) => setNewAmount(+e.target.value)} placeholder="金额" className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            <select value={newType} onChange={(e) => setNewType(e.target.value as "income" | "expense")} className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
              <option value="income">收入</option><option value="expense">支出</option>
            </select>
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
              {["住房", "生活", "娱乐", "教育", "医疗", "其他"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={addItem} className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-1 text-sm"><Plus className="w-4 h-4" />添加</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">月收入</div><div className="text-xl font-bold text-emerald-400">{result.income.toLocaleString()}</div></div>
          <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4"><div className="text-xs text-slate-400 mb-1">月支出</div><div className="text-xl font-bold text-rose-400">{result.expense.toLocaleString()}</div></div>
          <div className={`bg-gradient-to-br to-transparent rounded-xl border p-4 ${result.balance >= 0 ? "from-emerald-500/10 border-emerald-500/20" : "from-rose-500/10 border-rose-500/20"}`}><div className="text-xs text-slate-400 mb-1">结余</div><div className={`text-xl font-bold ${result.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{result.balance.toLocaleString()}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">储蓄率</div><div className="text-xl font-bold text-sky-400">{result.savingsRate.toFixed(1)}%</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">支出分类</h3>
          <div className="space-y-3">
            {result.categories.map(([cat, amt], i) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{cat}</span><span className="text-slate-400">{amt.toLocaleString()} ({((amt / result.expense) * 100).toFixed(1)}%)</span></div>
                <div className="w-full bg-[#0d0d0f] rounded-full h-3 overflow-hidden"><div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" style={{ width: `${(amt / result.expense) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] divide-y divide-[#3f3f46]">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2"><span className={`text-xs px-2 py-0.5 rounded ${item.type === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>{item.type === "income" ? "收入" : "支出"}</span><span className="text-sm text-white">{item.name}</span><span className="text-xs text-slate-500">{item.category}</span></div>
              <div className="flex items-center gap-3"><span className={`text-sm ${item.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>{item.type === "income" ? "+" : "-"}{item.amount.toLocaleString()}</span><button onClick={() => removeItem(i)} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button></div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
