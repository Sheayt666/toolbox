"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Hash, Copy, Check } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const ONES = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
const SCALES = ["", "thousand", "million", "billion", "trillion"];

function threeDigitsToWords(n: number): string {
  let words = "";
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  if (hundreds > 0) words += ONES[hundreds] + " hundred";
  if (rest > 0) {
    if (words) words += " and ";
    if (rest < 20) words += ONES[rest];
    else {
      words += TENS[Math.floor(rest / 10)];
      if (rest % 10 > 0) words += "-" + ONES[rest % 10];
    }
  }
  return words;
}

function numberToWords(num: number): string {
  if (num === 0) return "zero";
  if (isNaN(num)) return "无效数字";
  let negative = false;
  if (num < 0) { negative = true; num = -num; }

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let words = "";
  let n = intPart;
  const groups: number[] = [];
  if (n === 0) groups.push(0);
  while (n > 0) { groups.push(n % 1000); n = Math.floor(n / 1000); }

  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] > 0) {
      if (words) words += " ";
      words += threeDigitsToWords(groups[i]);
      if (SCALES[i]) words += " " + SCALES[i];
    }
  }

  if (decPart > 0) {
    words += " point";
    const decStr = decPart.toString().padStart(2, "0");
    for (const d of decStr) {
      words += " " + ONES[parseInt(d)];
    }
  }

  return (negative ? "negative " : "") + words;
}

export default function NumberToWordsPage() {
  const [num, setNum] = useState("12345.67");
  const [copied, setCopied] = useState(false);

  const parsed = parseFloat(num);
  const words = useMemo(() => numberToWords(parsed), [parsed]);
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="数字转英文"
      description="将阿拉伯数字转换为英文单词"
      icon={Hash}
      category="转换工具"
      slug="number-to-words"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">输入数字</label>
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            step="any"
            className={inputClass + " font-mono text-lg"}
          />
        </div>

        {words !== "无效数字" ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500">小写英文</p>
                <button onClick={() => copy(words)} className="text-slate-400 hover:text-white">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-base text-white">{words}</p>
            </div>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <p className="text-xs text-slate-500 mb-1">首字母大写</p>
              <p className="text-base text-white">{capitalized}</p>
            </div>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <p className="text-xs text-slate-500 mb-1">全部大写</p>
              <p className="text-base text-white uppercase">{words}</p>
            </div>
            {Number.isInteger(parsed) && parsed > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">位数</p>
                  <p className="text-sm text-white font-mono">{Math.abs(parsed).toString().length}</p>
                </div>
                <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">数量级</p>
                  <p className="text-sm text-white font-mono">10^{Math.floor(Math.log10(Math.abs(parsed)))}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-400">请输入有效数字</p>
        )}
      </div>
    </ToolLayout>
  );
}
