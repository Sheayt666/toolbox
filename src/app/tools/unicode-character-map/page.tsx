"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Search } from "lucide-react";

interface UnicodeBlock {
  name: string;
  start: number;
  end: number;
  description: string;
}

const BLOCKS: UnicodeBlock[] = [
  { name: "基本拉丁文", start: 0x0020, end: 0x007F, description: "ASCII字符，包含英文字母、数字和基本符号" },
  { name: "拉丁文补充", start: 0x0080, end: 0x00FF, description: "扩展拉丁字符，包含欧洲语言特殊字符" },
  { name: "希腊字母", start: 0x0370, end: 0x03FF, description: "希腊语字母" },
  { name: "西里尔字母", start: 0x0400, end: 0x04FF, description: "俄语等斯拉夫语字母" },
  { name: "标点符号", start: 0x2000, end: 0x206F, description: "通用标点符号" },
  { name: "货币符号", start: 0x20A0, end: 0x20CF, description: "货币符号" },
  { name: "字母符号", start: 0x2100, end: 0x214F, description: "字母类符号" },
  { name: "箭头符号", start: 0x2190, end: 0x21FF, description: "箭头符号" },
  { name: "数学运算符", start: 0x2200, end: 0x22FF, description: "数学运算符" },
  { name: "几何图形", start: 0x25A0, end: 0x25FF, description: "几何图形" },
  { name: "CJK统一汉字", start: 0x4E00, end: 0x9FFF, description: "中日韩统一表意文字" },
  { name: "emoji表情", start: 0x1F600, end: 0x1F64F, description: "表情符号" },
];

const SAMPLE_CHARS = [
  { char: "A", code: "U+0041", name: "拉丁大写字母A" },
  { char: "a", code: "U+0061", name: "拉丁小写字母a" },
  { char: "0", code: "U+0030", name: "数字0" },
  { char: "@", code: "U+0040", name: "商业AT符号" },
  { char: "©", code: "U+00A9", name: "版权符号" },
  { char: "®", code: "U+00AE", name: "注册商标" },
  { char: "™", code: "U+2122", name: "商标符号" },
  { char: "€", code: "U+20AC", name: "欧元符号" },
  { char: "¥", code: "U+00A5", name: "日元符号" },
  { char: "°", code: "U+00B0", name: "度数符号" },
  { char: "×", code: "U+00D7", name: "乘号" },
  { char: "÷", code: "U+00F7", name: "除号" },
  { char: "→", code: "U+2192", name: "向右箭头" },
  { char: "←", code: "U+2190", name: "向左箭头" },
  { char: "↑", code: "U+2191", name: "向上箭头" },
  { char: "↓", code: "U+2193", name: "向下箭头" },
  { char: "∞", code: "U+221E", name: "无穷大" },
  { char: "√", code: "U+221A", name: "平方根" },
  { char: "∑", code: "U+2211", name: "求和符号" },
  { char: "∫", code: "U+222B", name: "积分符号" },
  { char: "≈", code: "U+2248", name: "约等于" },
  { char: "≠", code: "U+2260", name: "不等于" },
  { char: "≤", code: "U+2264", name: "小于等于" },
  { char: "≥", code: "U+2265", name: "大于等于" },
  { char: "★", code: "U+2605", name: "实心星号" },
  { char: "☆", code: "U+2606", name: "空心星号" },
  { char: "○", code: "U+25CB", name: "空心圆" },
  { char: "●", code: "U+25CF", name: "实心圆" },
  { char: "□", code: "U+25A1", name: "空心方块" },
  { char: "■", code: "U+25A0", name: "实心方块" },
  { char: "△", code: "U+25B3", name: "空心三角" },
  { char: "▲", code: "U+25B2", name: "实心三角" },
  { char: "中", code: "U+4E2D", name: "CJK汉字\"中\"" },
  { char: "文", code: "U+6587", name: "CJK汉字\"文\"" },
  { char: "😀", code: "U+1F600", name: "笑脸表情" },
];

export default function UnicodeCharacterMapPage() {
  const [query, setQuery] = useState("");
  const [inputChar, setInputChar] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return SAMPLE_CHARS;
    return SAMPLE_CHARS.filter((c) => c.char.includes(query) || c.code.toLowerCase().includes(query.toLowerCase()) || c.name.includes(query));
  }, [query]);

  const charInfo = useMemo(() => {
    if (!inputChar) return null;
    const code = inputChar.codePointAt(0);
    if (code === undefined) return null;
    return { char: inputChar[0], code: `U+${code.toString(16).toUpperCase().padStart(4, "0")}, decimal: ${code}` };
  }, [inputChar]);

  return (
    <ToolLayout title="Unicode字符映射" description="浏览和搜索Unicode字符，查看编码和字符详情" icon={Type} category="查询工具" slug="unicode-character-map">
      <div className="p-6 space-y-6">
        <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
          <h4 className="text-sm font-medium text-slate-400 mb-3">字符编码查询</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputChar}
              onChange={(e) => setInputChar(e.target.value)}
              placeholder="输入一个字符查看其Unicode编码"
              maxLength={2}
              className="flex-1 px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-center text-2xl"
            />
          </div>
          {charInfo && (
            <div className="mt-3 p-3 bg-[#18181b] rounded-lg flex items-center gap-4">
              <span className="text-4xl text-primary-400">{charInfo.char}</span>
              <span className="font-mono text-slate-300">{charInfo.code}</span>
            </div>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索字符、编码或名称..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filtered.map((c, i) => (
            <div key={i} className="p-3 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors text-center">
              <div className="text-3xl mb-1">{c.char}</div>
              <div className="text-xs text-primary-400 font-mono">{c.code}</div>
              <div className="text-xs text-slate-500 mt-1 truncate">{c.name}</div>
            </div>
          ))}
        </div>

        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-3">Unicode区块</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BLOCKS.map((b) => (
              <div key={b.name} className="p-3 bg-[#09090b] border border-[#27272a] rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{b.name}</span>
                  <span className="text-xs font-mono text-primary-400">{b.start.toString(16).toUpperCase()}-{b.end.toString(16).toUpperCase()}</span>
                </div>
                <div className="text-xs text-slate-500">{b.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
