"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Shuffle, Sparkles } from "lucide-react";

function generateRandomString(
  length: number,
  includeUppercase: boolean,
  includeLowercase: boolean,
  includeNumbers: boolean,
  includeSymbols: boolean,
  customChars: string,
  count: number
): string[] {
  let chars = "";
  if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
  if (includeNumbers) chars += "0123456789";
  if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  chars += customChars;

  if (chars.length === 0) {
    return [];
  }

  const results: string[] = [];
  const array = new Uint32Array(length * count);
  crypto.getRandomValues(array);

  for (let i = 0; i < count; i++) {
    let result = "";
    for (let j = 0; j < length; j++) {
      result += chars[array[i * length + j] % chars.length];
    }
    results.push(result);
  }

  return results;
}

export default function RandomStringGeneratorPage() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [customChars, setCustomChars] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = useCallback(() => {
    const result = generateRandomString(
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      customChars,
      count
    );
    setResults(result);
  }, [length, count, includeUppercase, includeLowercase, includeNumbers, includeSymbols, customChars]);

  const handleCopy = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  }, []);

  const handleCopyAll = useCallback(async () => {
    if (results.length === 0) return;
    try {
      await navigator.clipboard.writeText(results.join("\n"));
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  }, [results]);

  const hasAnyOption = includeUppercase || includeLowercase || includeNumbers || includeSymbols || customChars.length > 0;

  return (
    <ToolLayout
      title="随机字符串生成器"
      description="在线随机字符串生成器，支持自定义长度、字符类型和数量，安全加密随机"
      icon={Shuffle}
      category="开发工具"
      slug="random-string-generator"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">随机字符串生成</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={handleGenerate}
            disabled={!hasAnyOption}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" />
            生成
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-[#27272a]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">字符串长度</label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              min={1}
              max={1000}
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">生成数量</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              min={1}
              max={100}
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">自定义字符</label>
            <input
              type="text"
              value={customChars}
              onChange={(e) => setCustomChars(e.target.value)}
              placeholder="可选"
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className="text-sm text-slate-300">大写字母 A-Z</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className="text-sm text-slate-300">小写字母 a-z</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className="text-sm text-slate-300">数字 0-9</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-cyan-500 focus:ring-cyan-500/50"
            />
            <span className="text-sm text-slate-300">特殊符号</span>
          </label>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-300">生成结果</label>
          {results.length > 0 && (
            <button
              onClick={handleCopyAll}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {copiedIndex === -1 ? "已全部复制" : "复制全部"}
            </button>
          )}
        </div>
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-center text-slate-600 py-10">
              点击生成按钮生成随机字符串
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[#18181b] rounded-lg border border-[#27272a] group hover:border-cyan-500/30 transition-colors"
                >
                  {count > 1 && (
                    <span className="text-xs text-slate-500 w-8 flex-shrink-0">{index + 1}.</span>
                  )}
                  <code className="flex-1 text-sm font-mono text-white break-all">
                    {result}
                  </code>
                  <button
                    onClick={() => handleCopy(result, index)}
                    className="flex-shrink-0 p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                    title="复制"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 使用浏览器的 crypto API 生成加密安全的随机字符串</li>
          <li>• 支持自定义字符类型、长度和数量，满足不同场景需求</li>
          <li>• 所有生成都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
