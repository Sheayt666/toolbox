"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ShoppingCart, Plus, Trash2, Check } from "lucide-react";

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
}

const CATEGORIES = ["蔬果", "肉蛋", "乳制品", "零食", "饮料", "日用", "其他"];

export default function GroceryListPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("蔬果");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("grocery-list-data");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("grocery-list-data", JSON.stringify(items));
  }, [items]);

  const handleAdd = () => {
    if (!name.trim()) return;
    setItems([...items, { id: Date.now().toString(), name: name.trim(), category, quantity: quantity.trim() || "1", checked: false }]);
    setName(""); setQuantity("");
  };

  const handleToggle = (id: string) => setItems(items.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
  const handleDelete = (id: string) => setItems(items.filter((i) => i.id !== id));
  const handleClearChecked = () => setItems(items.filter((i) => !i.checked));

  const grouped = CATEGORIES.map((cat) => ({ category: cat, items: items.filter((i) => i.category === cat) })).filter((g) => g.items.length > 0);
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <ToolLayout title="购物清单" description="创建购物清单，分类管理待购买物品" icon={ShoppingCart} category="生活工具" slug="grocery-list">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">共 {items.length} 项，已购 {checkedCount} 项</span>
            {checkedCount > 0 && <button onClick={handleClearChecked} className="text-sm text-red-400 hover:text-red-300 transition-colors">清除已购</button>}
          </div>

          <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
            <div className="flex gap-3 flex-wrap">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="商品名称" className="flex-1 min-w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="数量" className="w-20 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
              <button onClick={handleAdd} disabled={!name.trim()} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-1"><Plus className="w-4 h-4" />添加</button>
            </div>
          </div>

          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.category}>
                <h4 className="text-sm font-medium text-slate-400 mb-2">{group.category}</h4>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-xl group">
                      <button onClick={() => handleToggle(item.id)} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${item.checked ? "bg-emerald-500 border-emerald-500" : "border-[#3f3f46] hover:border-primary-500"}`}>
                        {item.checked && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <span className={`flex-1 text-sm ${item.checked ? "text-slate-600 line-through" : "text-white"}`}>{item.name}</span>
                      <span className="text-xs text-slate-500">×{item.quantity}</span>
                      <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="text-center py-12 text-slate-500">购物清单为空，开始添加吧！</div>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
