"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ArrowUpDown, Copy, Check, Eraser } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function words(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

const converters: { key: string; label: string; fn: (s: string) => string }[] = [
  { key: "upper", label: "全部大写", fn: (s) => s.toUpperCase() },
  { key: "lower", label: "全部小写", fn: (s) => s.toLowerCase() },
  { key: "title", label: "标题格式", fn: (s) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) },
  { key: "sentence", label: "句首大写", fn: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?。！？]\s*\w)/g, (c) => c.toUpperCase()) },
  { key: "camel", label: "驼峰 camelCase", fn: (s) => words(s).map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("") },
  { key: "pascal", label: "帕斯卡 PascalCase", fn: (s) => words(s).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("") },
  { key: "snake", label: "蛇形 snake_case", fn: (s) => words(s).map((w) => w.toLowerCase()).join("_") },
  { key: "kebab", label: "短横线 kebab-case", fn: (s) => words(s).map((w) => w.toLowerCase()).join("-") },
  { key: "constant", label: "常量 CONSTANT_CASE", fn: (s) => words(s).map((w) => w.toUpperCase()).join("_") },
  { key: "dot", label: "点分 dot.case", fn: (s) => words(s).map((w) => w.toLowerCase()).join(".") },
  { key: "path", label: "路径 path/case", fn: (s) => words(s).map((w) => w.toLowerCase()).join("/") },
  { key: "alternating", label: "交替大小写", fn: (s) => s.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join("") },
  { key: "inverse", label: "反转大小写", fn: (s) => s.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("") },
];

export default function TextCaseConverterAdvancedPage() {
  const [text, setText] = useState("");
  const [active, setActive] = useState("upper");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const results = converters.map((c) => ({ ...c, result: text ? c.fn(text) : "" }));

  return (
    <ToolLayout
      title="文本大小写转换"
      description="多种大小写格式转换，支持驼峰蛇形等命名规范"
      icon={ArrowUpDown}
      category="文本工具"
      slug="text-case-converter-advanced"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">输入文本</label>
            <button
              onClick={() => setText("")}
              className="text-xs text-slate-500 hover:text-white inline-flex items-center gap-1"
            >
              <Eraser className="w-3.5 h-3.5" /> 清空
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入需要转换的文本..."
            rows={4}
            className={inputClass + " resize-y font-mono"}
          />
          <p className="text-xs text-slate-500 mt-1.5">{text.length} 个字符</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">转换结果</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((r) => (
              <div
                key={r.key}
                className={`rounded-lg border p-3 transition-colors cursor-pointer ${
                  active === r.key
                    ? "border-primary-500/50 bg-primary-500/5"
                    : "border-[#27272a] bg-[#0a0a0b] hover:border-[#3f3f46]"
                }`}
                onClick={() => setActive(r.key)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-400">{r.label}</span>
                  {r.result && (
                    <button
                      onClick={(e) => { e.stopPropagation(); copy(r.key, r.result); }}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedKey === r.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <p className="text-sm text-white font-mono break-all min-h-[20px]">
                  {r.result || <span className="text-slate-600">—</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">当前选择：{converters.find((c) => c.key === active)?.label}</p>
              <p className="text-sm text-white font-mono break-all">{text ? converters.find((c) => c.key === active)?.fn(text) : ""}</p>
            </div>
            <button
              onClick={() => copy(active, text ? converters.find((c) => c.key === active)!.fn(text) : "")}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg"
            >
              {copiedKey === active ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              复制
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
