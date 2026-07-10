"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Code2, Search, Check } from "lucide-react";

interface HtmlEntity {
  char: string;
  name: string;
  decimal: string;
  hex: string;
  description: string;
}

const ENTITIES: HtmlEntity[] = [
  { char: "<", name: "&lt;", decimal: "&#60;", hex: "&#x3C;", description: "小于号" },
  { char: ">", name: "&gt;", decimal: "&#62;", hex: "&#x3E;", description: "大于号" },
  { char: "&", name: "&amp;", decimal: "&#38;", hex: "&#x26;", description: "和号" },
  { char: '"', name: "&quot;", decimal: "&#34;", hex: "&#x22;", description: "双引号" },
  { char: "'", name: "&apos;", decimal: "&#39;", hex: "&#x27;", description: "单引号" },
  { char: " ", name: "&nbsp;", decimal: "&#160;", hex: "&#xA0;", description: "不间断空格" },
  { char: "©", name: "&copy;", decimal: "&#169;", hex: "&#xA9;", description: "版权符号" },
  { char: "®", name: "&reg;", decimal: "&#174;", hex: "&#xAE;", description: "注册商标" },
  { char: "™", name: "&trade;", decimal: "&#8482;", hex: "&#x2122;", description: "商标" },
  { char: "€", name: "&euro;", decimal: "&#8364;", hex: "&#x20AC;", description: "欧元符号" },
  { char: "£", name: "&pound;", decimal: "&#163;", hex: "&#xA3;", description: "英镑符号" },
  { char: "¥", name: "&yen;", decimal: "&#165;", hex: "&#xA5;", description: "日元/人民币" },
  { char: "¢", name: "&cent;", decimal: "&#162;", hex: "&#xA2;", description: "美分符号" },
  { char: "§", name: "&sect;", decimal: "&#167;", hex: "&#xA7;", description: "章节符号" },
  { char: "°", name: "&deg;", decimal: "&#176;", hex: "&#xB0;", description: "度数符号" },
  { char: "±", name: "&plusmn;", decimal: "&#177;", hex: "&#xB1;", description: "正负号" },
  { char: "×", name: "&times;", decimal: "&#215;", hex: "&#xD7;", description: "乘号" },
  { char: "÷", name: "&divide;", decimal: "&#247;", hex: "&#xF7;", description: "除号" },
  { char: "←", name: "&larr;", decimal: "&#8592;", hex: "&#x2190;", description: "左箭头" },
  { char: "→", name: "&rarr;", decimal: "&#8594;", hex: "&#x2192;", description: "右箭头" },
  { char: "↑", name: "&uarr;", decimal: "&#8593;", hex: "&#x2191;", description: "上箭头" },
  { char: "↓", name: "&darr;", decimal: "&#8595;", hex: "&#x2193;", description: "下箭头" },
  { char: "★", name: "&starf;", decimal: "&#9733;", hex: "&#x2605;", description: "实心星" },
  { char: "☆", name: "&star;", decimal: "&#9734;", hex: "&#x2606;", description: "空心星" },
  { char: "♥", name: "&hearts;", decimal: "&#9829;", hex: "&#x2665;", description: "心形" },
  { char: "♦", name: "&diams;", decimal: "&#9830;", hex: "&#x2666;", description: "方块" },
  { char: "♣", name: "&clubs;", decimal: "&#9827;", hex: "&#x2663;", description: "梅花" },
  { char: "♠", name: "&spades;", decimal: "&#9824;", hex: "&#x2660;", description: "黑桃" },
  { char: "∞", name: "&infin;", decimal: "&#8734;", hex: "&#x221E;", description: "无穷大" },
  { char: "√", name: "&radic;", decimal: "&#8730;", hex: "&#x221A;", description: "平方根" },
];

export default function HtmlEntityTablePage() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return ENTITIES;
    return ENTITIES.filter(
      (e) => e.char.includes(query) || e.name.includes(query) || e.description.includes(query)
    );
  }, [query]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <ToolLayout title="HTML实体表" description="查询常用HTML特殊字符实体编码，支持复制粘贴" icon={Code2} category="查询工具" slug="html-entity-table">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索字符、实体名或描述..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条，点击实体名可复制</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#27272a] text-slate-400">
                <th className="text-left py-3 px-3 font-medium">字符</th>
                <th className="text-left py-3 px-3 font-medium">实体名</th>
                <th className="text-left py-3 px-3 font-medium">十进制</th>
                <th className="text-left py-3 px-3 font-medium">十六进制</th>
                <th className="text-left py-3 px-3 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={i} className="border-b border-[#1e1e21] hover:bg-[#1c1c1f] transition-colors">
                  <td className="py-3 px-3 text-2xl text-white">{e.char}</td>
                  <td className="py-3 px-3">
                    <button onClick={() => handleCopy(e.name)} className="font-mono text-primary-400 hover:text-primary-300 transition-colors">
                      {copied === e.name ? <Check className="w-4 h-4 text-emerald-400" /> : e.name}
                    </button>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{e.decimal}</td>
                  <td className="py-3 px-3 font-mono text-slate-400">{e.hex}</td>
                  <td className="py-3 px-3 text-slate-400">{e.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配结果</div>
        )}
      </div>
    </ToolLayout>
  );
}
