"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Backpack, Plus, Trash2, Check, RotateCcw, Plane } from "lucide-react";

interface PackingItem {
  id: string;
  name: string;
  packed: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  items: PackingItem[];
}

const DEFAULT_CATEGORIES: Omit<Category, "items">[] = [
  { id: "documents", name: "证件文件", icon: "📄" },
  { id: "clothing", name: "衣物服饰", icon: "👕" },
  { id: "toiletries", name: "洗漱用品", icon: "🧴" },
  { id: "electronics", name: "电子产品", icon: "🔌" },
  { id: "medicine", name: "药品急救", icon: "💊" },
  { id: "misc", name: "其他杂物", icon: "🎒" },
];

const DEFAULT_ITEMS: Record<string, string[]> = {
  documents: ["身份证", "护照", "机票/车票", "酒店预订单", "银行卡", "现金"],
  clothing: ["内衣裤", "袜子", "T恤", "外套", "裤子", "睡衣", "拖鞋"],
  toiletries: ["牙刷", "牙膏", "毛巾", "洗发水", "沐浴露", "防晒霜", "剃须刀"],
  electronics: ["手机", "充电器", "充电宝", "耳机", "数据线", "转换插头"],
  medicine: ["感冒药", "肠胃药", "创可贴", "晕车药", "消炎药"],
  misc: ["雨伞", "水杯", "零食", " plastic袋", "记事本", "笔"],
};

export default function TravelPackingListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItem, setNewItem] = useState("");
  const [activeCategory, setActiveCategory] = useState("documents");

  useEffect(() => {
    const saved = localStorage.getItem("travel-packing-list");
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch {
        initDefaults();
      }
    } else {
      initDefaults();
    }
  }, []);

  const initDefaults = () => {
    const initial: Category[] = DEFAULT_CATEGORIES.map((cat) => ({
      ...cat,
      items: DEFAULT_ITEMS[cat.id].map((name, idx) => ({
        id: `${cat.id}-${idx}`,
        name,
        packed: false,
      })),
    }));
    setCategories(initial);
  };

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem("travel-packing-list", JSON.stringify(categories));
    }
  }, [categories]);

  const addItem = () => {
    if (!newItem.trim()) return;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === activeCategory
          ? {
              ...cat,
              items: [
                ...cat.items,
                { id: `${cat.id}-${Date.now()}`, name: newItem.trim(), packed: false },
              ],
            }
          : cat
      )
    );
    setNewItem("");
  };

  const togglePacked = (catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, packed: !item.packed } : item
              ),
            }
          : cat
      )
    );
  };

  const deleteItem = (catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      )
    );
  };

  const resetAll = () => {
    if (confirm("确定要重置所有打包清单吗？")) {
      initDefaults();
    }
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const packedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((item) => item.packed).length,
    0
  );
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  return (
    <ToolLayout
      title="旅行打包清单"
      description="旅行出行必备物品清单，分类管理打包物品，确保不遗漏重要物品"
      icon={Backpack}
      category="生活工具"
      slug="travel-packing-list"
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Progress */}
        <div className="bg-[#27272a] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary-400" />
              <span className="text-sm font-semibold text-white">打包进度</span>
            </div>
            <span className="text-sm font-bold text-primary-400">
              {packedItems} / {totalItems} ({progress}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#3f3f46] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {progress === 100 && totalItems > 0 && (
            <p className="text-xs text-emerald-400 mt-2 text-center font-medium">
              全部打包完成，祝旅途愉快！
            </p>
          )}
        </div>

        {/* Add item */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="添加物品..."
            className="flex-1 px-4 py-2.5 bg-[#27272a] border border-[#3f3f46] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
          />
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="px-3 py-2.5 bg-[#27272a] border border-[#3f3f46] rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={addItem}
            className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const catPacked = cat.items.filter((i) => i.packed).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-primary-500 text-white"
                    : "bg-[#27272a] text-slate-400 hover:text-white"
                }`}
              >
                {cat.icon} {cat.name} ({catPacked}/{cat.items.length})
              </button>
            );
          })}
        </div>

        {/* Items list */}
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`transition-all ${activeCategory === cat.id ? "block" : "hidden"}`}
          >
            <div className="bg-[#27272a] rounded-xl divide-y divide-[#3f3f46]">
              {cat.items.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">暂无物品，点击上方添加</p>
              ) : (
                cat.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3.5 hover:bg-[#3f3f46]/50 transition-colors"
                  >
                    <button
                      onClick={() => togglePacked(cat.id, item.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors flex-shrink-0 ${
                        item.packed
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-[#52525b] hover:border-primary-400"
                      }`}
                    >
                      {item.packed && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        item.packed
                          ? "text-slate-500 line-through"
                          : "text-slate-200"
                      }`}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={() => deleteItem(cat.id, item.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        {/* Reset button */}
        <button
          onClick={resetAll}
          className="w-full py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置清单
        </button>
      </div>
    </ToolLayout>
  );
}
