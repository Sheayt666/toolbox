"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, PieChart, Calendar } from "lucide-react";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  date: string;
}

const expenseCategories = ["餐饮", "交通", "购物", "娱乐", "居住", "医疗", "教育", "其他"];
const incomeCategories = ["工资", "奖金", "投资", "兼职", "红包", "其他"];

export default function ExpenseTrackerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐饮");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const saved = localStorage.getItem("expense-tracker-data");
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem("expense-tracker-data", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      type,
      amount: numAmount,
      category,
      note: note.trim(),
      date,
    };
    setTransactions((prev) => [newTx, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setAmount("");
    setNote("");
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // 计算统计
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // 按日期分组
  const groupedByDate = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  return (
    <ToolLayout
      title="记账本"
      description="简单易用的在线记账工具，记录收支明细，掌握财务状况"
      icon={Wallet}
      category="生活工具"
      slug="expense-tracker"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 总览卡片 */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25">
          <div className="text-sm text-white/70 mb-1">本月结余</div>
          <div className="text-4xl font-bold mb-6">
            ¥{balance.toFixed(2)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                收入
              </div>
              <div className="text-xl font-bold">¥{totalIncome.toFixed(2)}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                <TrendingDown className="w-4 h-4" />
                支出
              </div>
              <div className="text-xl font-bold">¥{totalExpense.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* 添加记录按钮 */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 bg-[#18181b] border border-[#27272a] border-dashed rounded-2xl text-slate-400 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            添加一笔记录
          </button>
        )}

        {/* 添加表单 */}
        {showForm && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
            <div className="flex gap-1 p-1 bg-[#09090b] rounded-xl mb-4">
              <button
                onClick={() => { setType("expense"); setCategory("餐饮"); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  type === "expense"
                    ? "bg-rose-500/20 text-rose-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                支出
              </button>
              <button
                onClick={() => { setType("income"); setCategory("工资"); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  type === "income"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                收入
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">金额</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">¥</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">分类</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        category === c
                          ? type === "expense"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">备注</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加备注（可选）"
                  className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-[#09090b] text-slate-400 hover:text-white rounded-xl transition-colors border border-[#27272a]"
                >
                  取消
                </button>
                <button
                  onClick={addTransaction}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    type === "expense"
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 交易明细 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              收支明细
            </h3>
            <span className="text-xs text-slate-500">{transactions.length} 条记录</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">暂无记录，点击上方按钮开始记账</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {Object.entries(groupedByDate).map(([date, txs]) => (
                <div key={date}>
                  <div className="px-4 py-2 bg-[#09090b]/50 text-xs text-slate-500 flex items-center gap-2 sticky top-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {date}
                  </div>
                  <div className="divide-y divide-[#27272a]">
                    {txs.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[#09090b] transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === "expense" ? "bg-rose-500/20" : "bg-emerald-500/20"
                        }`}>
                          {tx.type === "expense" ? (
                            <TrendingDown className="w-5 h-5 text-rose-400" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white">{tx.category}</div>
                          {tx.note && (
                            <div className="text-xs text-slate-500 truncate">{tx.note}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            tx.type === "expense" ? "text-rose-400" : "text-emerald-400"
                          }`}>
                            {tx.type === "expense" ? "-" : "+"}¥{tx.amount.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">使用说明</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>1. 数据保存在浏览器本地存储中，清除浏览器数据会导致记录丢失</p>
            <p>2. 支持记录收入和支出，可选择不同分类和添加备注</p>
            <p>3. 建议每天记录，养成记账好习惯</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
