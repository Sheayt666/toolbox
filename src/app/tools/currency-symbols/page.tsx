"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Coins, Search } from "lucide-react";

interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
}

const CURRENCIES: Currency[] = [
  { code: "CNY", symbol: "¥", name: "人民币", country: "中国" },
  { code: "USD", symbol: "$", name: "美元", country: "美国" },
  { code: "EUR", symbol: "€", name: "欧元", country: "欧盟" },
  { code: "GBP", symbol: "£", name: "英镑", country: "英国" },
  { code: "JPY", symbol: "¥", name: "日元", country: "日本" },
  { code: "KRW", symbol: "₩", name: "韩元", country: "韩国" },
  { code: "HKD", symbol: "HK$", name: "港币", country: "中国香港" },
  { code: "TWD", symbol: "NT$", name: "新台币", country: "中国台湾" },
  { code: "SGD", symbol: "S$", name: "新加坡元", country: "新加坡" },
  { code: "AUD", symbol: "A$", name: "澳元", country: "澳大利亚" },
  { code: "CAD", symbol: "C$", name: "加元", country: "加拿大" },
  { code: "CHF", symbol: "Fr", name: "瑞士法郎", country: "瑞士" },
  { code: "RUB", symbol: "₽", name: "卢布", country: "俄罗斯" },
  { code: "INR", symbol: "₹", name: "印度卢比", country: "印度" },
  { code: "BRL", symbol: "R$", name: "巴西雷亚尔", country: "巴西" },
  { code: "THB", symbol: "฿", name: "泰铢", country: "泰国" },
  { code: "MYR", symbol: "RM", name: "马来西亚林吉特", country: "马来西亚" },
  { code: "VND", symbol: "₫", name: "越南盾", country: "越南" },
  { code: "PHP", symbol: "₱", name: "菲律宾比索", country: "菲律宾" },
  { code: "IDR", symbol: "Rp", name: "印尼盾", country: "印度尼西亚" },
  { code: "TRY", symbol: "₺", name: "土耳其里拉", country: "土耳其" },
  { code: "ZAR", symbol: "R", name: "南非兰特", country: "南非" },
  { code: "MXN", symbol: "$", name: "墨西哥比索", country: "墨西哥" },
  { code: "AED", symbol: "د.إ", name: "阿联酋迪拉姆", country: "阿联酋" },
  { code: "SEK", symbol: "kr", name: "瑞典克朗", country: "瑞典" },
  { code: "NOK", symbol: "kr", name: "挪威克朗", country: "挪威" },
  { code: "DKK", symbol: "kr", name: "丹麦克朗", country: "丹麦" },
  { code: "PLN", symbol: "zł", name: "波兰兹罗提", country: "波兰" },
  { code: "NZD", symbol: "NZ$", name: "新西兰元", country: "新西兰" },
  { code: "SAR", symbol: "﷼", name: "沙特里亚尔", country: "沙特阿拉伯" },
];

export default function CurrencySymbolsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return CURRENCIES;
    const q = query.toLowerCase();
    return CURRENCIES.filter(
      (c) => c.code.toLowerCase().includes(q) || c.symbol.includes(query) || c.name.includes(query) || c.country.includes(query)
    );
  }, [query]);

  return (
    <ToolLayout title="货币符号大全" description="查询世界各国货币符号、代码和名称对照表" icon={Coins} category="查询工具" slug="currency-symbols">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索货币代码、符号或国家..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 种货币</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.code} className="flex items-center gap-4 p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <span className="text-3xl font-bold text-primary-400 w-12 text-center">{c.symbol}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium">{c.name}</div>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono">{c.code}</span>
                  <span className="text-xs text-slate-500">{c.country}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配结果</div>
        )}
      </div>
    </ToolLayout>
  );
}
