"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Sparkles, Copy, Check, Trash2, Info, ArrowRightLeft } from "lucide-react";

type LeetLevel = "basic" | "medium" | "advanced";

const LEET_BASIC: Record<string, string> = {
  a: "4", e: "3", i: "1", o: "0", s: "5", t: "7",
};

const LEET_MEDIUM: Record<string, string> = {
  a: "4", b: "8", e: "3", g: "6", i: "1",
  l: "1", o: "0", s: "5", t: "7", z: "2",
};

const LEET_ADVANCED: Record<string, string> = {
  a: "/\\", b: "|3", c: "(", d: "|)", e: "3",
  f: "|=", g: "6", h: "|-|", i: "1", j: "_|",
  k: "|<", l: "|_", m: "|\\/|", n: "|\\|", o: "0",
  p: "|2", q: "0_", r: "|2", s: "5", t: "7",
  u: "|_|", v: "\\/", w: "\\/\\/", x: "><", y: "`/",
  z: "2",
};

function toLeet(text: string, level: LeetLevel): string {
  if (!text) return "";
  const map = level === "basic" ? LEET_BASIC : level === "medium" ? LEET_MEDIUM : LEET_ADVANCED;
  
  if (level === "advanced") {
    let result = "";
    for (const char of text) {
      const lower = char.toLowerCase();
      result += map[lower] || char;
    }
    return result;
  }
  
  return text
    .split("")
    .map(char => {
      const lower = char.toLowerCase();
      if (map[lower]) {
        return char === char.toUpperCase() ? map[lower] : map[lower].toLowerCase();
      }
      return char;
    })
    .join("");
}

function fromLeet(text: string): string {
  if (!text) return "";
  const advancedReverse: Record<string, string> = {};
  for (const [k, v] of Object.entries(LEET_ADVANCED)) {
    if (!advancedReverse[v]) {
      advancedReverse[v] = k;
    }
  }
  const basicReverse: Record<string, string> = {};
  for (const [k, v] of Object.entries(LEET_BASIC)) {
    basicReverse[v] = k;
  }
  
  let result = text;
  const sortedKeys = Object.keys(advancedReverse).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    result = result.split(key).join(advancedReverse[key]);
  }
  for (const [k, v] of Object.entries(basicReverse)) {
    result = result.split(k).join(v);
  }
  return result;
}

export default function LeetSpeakPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"toLeet" | "fromLeet">("toLeet");
  const [level, setLevel] = useState<LeetLevel>("basic");
  const [copied, setCopied] = useState(false);

  const result = mode === "toLeet" ? toLeet(input, level) : fromLeet(input);

  const handleClear = () => {
    setInput("");
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const levels = [
    { value: "basic", label: "简单模式" },
    { value: "medium", label: "中等模式" },
    { value: "advanced", label: "高级模式" },
  ];

  return (
    <ToolLayout
      title="Leet 语转换"
      description="将普通文本转换为火星文/Leet语，支持多种转换强度，也可以将Leet语还原为普通文本，纯前端实时转换"
      toolId="leet-speak"
      icon={Sparkles}
      category="文本工具"
      slug="leet-speak"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                转换设置
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("toLeet")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === "toLeet"
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                文本转 Leet
              </button>
              <button
                onClick={() => setMode("fromLeet")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === "fromLeet"
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                Leet 转文本
              </button>
            </div>
            {mode === "toLeet" && (
              <div className="flex flex-wrap gap-2">
                {levels.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLevel(l.value as LeetLevel)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      level === l.value
                        ? "bg-pink-500 text-white shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {mode === "toLeet" ? "输入文本" : "输入 Leet 语"}
                  </span>
                </div>
                <button
                  onClick={handleClear}
                  disabled={!input}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === "toLeet" ? "输入要转换为 Leet 语的英文文本..." : "输入 Leet 语进行还原..."}
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {mode === "toLeet" ? "Leet 语结果" : "还原结果"}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!result}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-500" /> 已复制</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> 复制</>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={result}
              readOnly
              placeholder="结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              什么是 Leet 语？
            </h3>
          </div>
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
            <p className="text-pink-700 dark:text-pink-400 text-sm leading-relaxed mb-4">
              Leet（L337），又称黑客语、火星语，是指发源于欧美地区的 BBS、
              部落格和线上游戏的族群所使用的异体字。通常用数字或特殊符号来代替英文字母。
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Object.entries(LEET_BASIC).map(([letter, code]) => (
                <div key={letter} className="bg-white/60 dark:bg-black/20 rounded-lg p-2 text-center">
                  <div className="text-pink-800 dark:text-pink-300 font-bold text-sm uppercase">{letter}</div>
                  <div className="text-pink-600 dark:text-pink-400 text-xs font-mono">→ {code}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
