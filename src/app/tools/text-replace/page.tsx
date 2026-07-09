"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Replace, Type } from "lucide-react";

function replaceText(
  text: string,
  find: string,
  replace: string,
  useRegex: boolean,
  caseSensitive: boolean
): { result: string; count: number } {
  if (!find) {
    return { result: text, count: 0 };
  }

  let count = 0;
  let result = "";

  if (useRegex) {
    try {
      const flags = caseSensitive ? "g" : "gi";
      const regex = new RegExp(find, flags);
      result = text.replace(regex, (match) => {
        count++;
        return replace;
      });
      return { result, count };
    } catch {
      return { result: text, count: 0 };
    }
  } else {
    if (caseSensitive) {
      let i = 0;
      let lastIndex = 0;
      while (i < text.length) {
        const idx = text.indexOf(find, i);
        if (idx === -1) break;
        result += text.substring(lastIndex, idx) + replace;
        count++;
        i = idx + find.length;
        lastIndex = idx + find.length;
      }
      result += text.substring(lastIndex);
    } else {
      const lowerText = text.toLowerCase();
      const lowerFind = find.toLowerCase();
      let i = 0;
      let lastIndex = 0;
      while (i < lowerText.length) {
        const idx = lowerText.indexOf(lowerFind, i);
        if (idx === -1) break;
        result += text.substring(lastIndex, idx) + replace;
        count++;
        i = idx + find.length;
        lastIndex = idx + find.length;
      }
      result += text.substring(lastIndex);
    }
    return { result, count };
  }
}

export default function TextReplacePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [find, setFind] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [replaceCount, setReplaceCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleReplace = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      setReplaceCount(0);
      return;
    }
    const result = replaceText(input, find, replaceWith, useRegex, caseSensitive);
    if (useRegex && result.result === input && find) {
      // Check if regex is valid
      try {
        new RegExp(find);
      } catch (e) {
        setError("正则表达式错误：" + (e as Error).message);
        return;
      }
    }
    setOutput(result.result);
    setReplaceCount(result.count);
  }, [input, find, replaceWith, useRegex, caseSensitive]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setReplaceCount(0);
    setError("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput("Hello World!\nHello everyone!\nThe world is beautiful.\nHELLO WORLD!");
    setFind("hello");
    setReplaceWith("Hi");
  }, []);

  return (
    <ToolLayout
      title="文本批量替换"
      description="在线文本批量替换工具，支持普通替换和正则表达式替换，大小写敏感设置"
      icon={Type}
      category="开发工具"
      slug="text-replace"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Replace className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">文本批量替换</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useRegex}
                onChange={(e) => setUseRegex(e.target.checked)}
                className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-amber-500 focus:ring-amber-500/50"
              />
              <span className="text-sm text-slate-400">正则表达式</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-amber-500 focus:ring-amber-500/50"
              />
              <span className="text-sm text-slate-400">区分大小写</span>
            </label>
          </div>

          <button
            onClick={handleReplace}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
          >
            <Replace className="w-4 h-4" />
            替换
          </button>

          <button
            onClick={handleLoadExample}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors"
          >
            示例
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-[#27272a]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">查找内容</label>
            <input
              type="text"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              placeholder="输入要查找的内容..."
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-2 block">替换为</label>
            <input
              type="text"
              value={replaceWith}
              onChange={(e) => setReplaceWith(e.target.value)}
              placeholder="输入替换后的内容..."
              className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 pt-4">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输入文本</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入要替换的文本..."
            spellCheck={false}
            className="w-full h-72 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">替换结果</label>
            <span className="text-xs text-slate-500">
              {output.length} 字符 · 替换 {replaceCount} 处
            </span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="替换结果将显示在这里..."
            spellCheck={false}
            className="w-full h-72 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制结果
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持普通文本替换和正则表达式替换两种模式</li>
          <li>• 可选择是否区分大小写，灵活控制替换精度</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
