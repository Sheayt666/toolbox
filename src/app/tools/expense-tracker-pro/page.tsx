"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  type: "收入" | "支出";
  category: string;
  note: string;
  date: string;
}

const CATEGORIES: Record<string, string[]> = {
  "支出": ["餐饮", "交通", "购物", "娱乐", "住房", "医疗", "教育", "其他"],
  "收入": ["工资", "兼职", "投资", "红包", "其他"],
};

export default function ExpenseTrackerProPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [type, setType] = useState<"收入" | "支出">("支出");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐饮");
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("expense-tracker-data");
    if (saved) setExpenses(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("expense-tracker-data", JSON.stringify(expenses));
  }, [expenses]);

  const handleAdd = () => {
    if (!amount.trim()) return;
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type,
      category,
      note: note.trim() || category,
      date: new Date().toLocaleDateString("zh-CN"),
    };
    setExpenses([newExpense, ...expenses]);
    setAmount(""); setNote("");
  };

  const handleDelete = (id: string) => setExpenses(expenses.filter((e) => e.id !== id));

  const totalIncome = expenses.filter((e) => e.type === "收入").reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.filter((e) => e.type === "支出").reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <ToolLayout title="记账本进阶版" description="收支分类记账，生成月度报表" icon={Wallet} category="生活工具" slug="expense-tracker-pro">
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs text-slate-500">总收入</div>
            <div className="text-lg font-bold text-emerald-400">¥{totalIncome.toFixed(2)}</div>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <TrendingDown className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <div className="text-xs text-slate-500">总支出</div>
            <div className="text-lg font-bold text-red-400">¥{totalExpense.toFixed(2)}</div>
          </div>
          <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl text-center">
            <Wallet className="w-5 h-5 text-primary-400 mx-auto mb-1" />
            <div className="text-xs text-slate-500">结余</div>
            <div className="text-lg font-bold text-primary-400">¥{balance.toFixed(2)}</div>
          </div>
        </div>

        <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
          <div className="flex gap-2 mb-3">
            {(["支出", "收入"] as const).map((t) => (
              <button key={t} onClick={() => { setType(t); setCategory(CATEGORIES[t][0]); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === t ? (t === "支出" ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30") : "bg-[#18181b] text-slate-400 border border-[#27272a]"}`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="金额" className="w-28 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm">
              {CATEGORIES[type].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注" className="flex-1 min-w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
            <button onClick={handleAdd} disabled={!amount.trim()} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-1"><Plus className="w-4 h-4" />添加</button>
          </div>
        </div>

        <div className="space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-xl group">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${e.type === "支出" ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                <span className="text-xs font-bold">{e.category}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{e.note}</div>
                <div className="text-xs text-slate-500">{e.date}</div>
              </div>
              <span className={`font-bold text-sm ${e.type === "支出" ? "text-red-400" : "text-emerald-400"}`}>{e.type === "支出" ? "-" : "+"}¥{e.amount.toFixed(2)}</span>
              <button onClick={() => handleDelete(e.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {expenses.length === 0 && <div className="text-center py-12 text-slate-500">暂无记录，开始记账吧！</div>}
        </div>
      </div>
    </ToolLayout>
  );
}
