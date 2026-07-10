"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Archive, Copy, Check } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const ROMAN_MAP: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

function toRoman(num: number): string {
  if (num < 1 || num > 3999 || !Number.isInteger(num)) return "超出范围（1-3999 整数）";
  let result = "";
  for (const [v, s] of ROMAN_MAP) {
    while (num >= v) { result += s; num -= v; }
  }
  return result;
}

function fromRoman(str: string): number | null {
  const valid = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i.test(str.trim());
  if (!valid) return null;
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  const upper = str.trim().toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const cur = map[upper[i]];
    const next = map[upper[i + 1]];
    if (next && cur < next) { total += next - cur; i++; }
    else total += cur;
  }
  return total;
}

export default function RomanNumeralConverterPage() {
  const [mode, setMode] = useState<"n2r" | "r2n">("n2r");
  const [input, setInput] = useState("2024");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "n2r") {
      const n = parseInt(input);
      if (isNaN(n)) return "请输入数字";
      return toRoman(n);
    } else {
      const n = fromRoman(input);
      return n === null ? "无效罗马数字" : String(n);
    }
  }, [input, mode]);

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const reference = [
    { n: 1, r: "I" }, { n: 5, r: "V" }, { n: 10, r: "X" }, { n: 50, r: "L" },
    { n: 100, r: "C" }, { n: 500, r: "D" }, { n: 1000, r: "M" },
  ];

  return (
    <ToolLayout
      title="罗马数字转换"
      description="阿拉伯数字与罗马数字互转"
      icon={Archive}
      category="转换工具"
      slug="roman-numeral-converter"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex gap-2">
          <button onClick={() => { setMode("n2r"); setInput("2024"); }} className={`flex-1 px-4 py-2 text-sm rounded-lg border ${mode === "n2r" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
            数字 → 罗马
          </button>
          <button onClick={() => { setMode("r2n"); setInput("MMXXIV"); }} className={`flex-1 px-4 py-2 text-sm rounded-lg border ${mode === "r2n" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
            罗马 → 数字
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">{mode === "n2r" ? "阿拉伯数字（1-3999）" : "罗马数字"}</label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "n2r" ? "如：2024" : "如：MMXXIV"}
            className={inputClass + " font-mono text-lg text-center uppercase"}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">转换结果</label>
            <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
            </button>
          </div>
          <div className="rounded-lg bg-primary-500/5 border border-primary-500/20 p-6 text-center">
            <p className="text-3xl font-bold text-white font-mono">{result}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">基本符号对照</label>
          <div className="grid grid-cols-7 gap-2">
            {reference.map((r) => (
              <button key={r.n} onClick={() => { setMode("r2n"); setInput(r.r); }} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2.5 text-center hover:border-primary-500/50">
                <p className="text-lg font-bold text-primary-400 font-mono">{r.r}</p>
                <p className="text-xs text-slate-500">{r.n}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
