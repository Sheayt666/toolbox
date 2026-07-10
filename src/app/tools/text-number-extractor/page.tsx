"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Hash, Copy, Check, Eraser, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface ExtractedNumber {
  value: string;
  raw: string;
  type: string;
  numeric: number;
}

function extract(text: string): ExtractedNumber[] {
  const results: ExtractedNumber[] = [];
  // 匹配金额(¥/$/€ + 数字)、百分比、普通数字(含小数、负数、千分位)
  const regex = /(?:[¥$€£]\s?\d[\d,]*\.?\d*)|(?:-?\d[\d,]*\.?\d*\s?%)|(?:-?\d[\d,]*\.?\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const raw = m[0];
    let type = "数字";
    if (/[¥$€£]/.test(raw)) type = "金额";
    else if (/%/.test(raw)) type = "百分比";
    const numStr = raw.replace(/[¥$€£%\s,]/g, "");
    const numeric = parseFloat(numStr);
    results.push({ value: raw.trim(), raw, type, numeric: isNaN(numeric) ? 0 : numeric });
  }
  return results;
}

export default function TextNumberExtractorPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const numbers = useMemo(() => extract(text), [text]);
  const sum = useMemo(() => numbers.reduce((a, b) => a + b.numeric, 0), [numbers]);
  const avg = numbers.length ? sum / numbers.length : 0;
  const max = numbers.length ? Math.max(...numbers.map((n) => n.numeric)) : 0;
  const min = numbers.length ? Math.min(...numbers.map((n) => n.numeric)) : 0;

  const copyAll = () => {
    navigator.clipboard.writeText(numbers.map((n) => n.value).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([numbers.map((n) => `${n.value}\t${n.type}`).join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "numbers.txt";
    a.click();
  };

  return (
    <ToolLayout
      title="数字提取器"
      description="从文本中提取所有数字，支持金额和百分比识别"
      icon={Hash}
      category="文本工具"
      slug="text-number-extractor"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">输入文本</label>
            <button onClick={() => setText("")} className="text-xs text-slate-500 hover:text-white inline-flex items-center gap-1">
              <Eraser className="w-3.5 h-3.5" /> 清空
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴包含数字的文本，如：订单金额¥1,299.00，增长率15.2%，数量42..."
            rows={5}
            className={inputClass + " resize-y"}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "数量", value: numbers.length },
            { label: "求和", value: sum.toLocaleString() },
            { label: "平均", value: avg.toFixed(2) },
            { label: "最大", value: max.toLocaleString() },
            { label: "最小", value: min.toLocaleString() },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className="text-sm font-semibold text-white truncate">{s.value}</p>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">提取结果（{numbers.length}）</label>
            <div className="flex gap-2">
              <button onClick={copyAll} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
              </button>
              <button onClick={download} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> 下载
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-[#27272a] overflow-hidden max-h-72 overflow-y-auto">
            {numbers.length === 0 ? (
              <p className="text-sm text-slate-600 p-4 text-center">暂无提取结果</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#0a0a0b] sticky top-0">
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left p-2.5 font-medium">#</th>
                    <th className="text-left p-2.5 font-medium">值</th>
                    <th className="text-left p-2.5 font-medium">类型</th>
                  </tr>
                </thead>
                <tbody>
                  {numbers.map((n, i) => (
                    <tr key={i} className="border-t border-[#1f1f23]">
                      <td className="p-2.5 text-slate-500">{i + 1}</td>
                      <td className="p-2.5 text-white font-mono">{n.value}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 text-xs rounded bg-primary-500/10 text-primary-400">{n.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
