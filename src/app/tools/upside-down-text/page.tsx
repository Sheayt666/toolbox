"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FlipVertical,
  Copy,
  Check,
  Trash2,
  Type,
  ArrowLeftRight,
} from "lucide-react";

const flipMap: Record<string, string> = {
  "a": "\u0250", "b": "q", "c": "\u0254", "d": "p", "e": "\u01DD",
  "f": "\u025F", "g": "\u0183", "h": "\u0265", "i": "\u0131", "j": "\u027E",
  "k": "\u029E", "l": "\u0283", "m": "\u026F", "n": "u", "o": "o",
  "p": "d", "q": "b", "r": "\u0279", "s": "s", "t": "\u0287",
  "u": "n", "v": "\u028C", "w": "\u028D", "x": "x", "y": "\u028E",
  "z": "z",
  "A": "\u2200", "B": "q", "C": "\u0186", "D": "p", "E": "\u018E",
  "F": "\u2132", "G": "\u01E4", "H": "H", "I": "I", "J": "\u017F",
  "K": "\u029E", "L": "\u02E5", "M": "W", "N": "N", "O": "O",
  "P": "d", "Q": "Q", "R": "\u0279", "S": "S", "T": "\u2534",
  "U": "\u2229", "V": "\u039B", "W": "M", "X": "X", "Y": "\u2144",
  "Z": "Z",
  "0": "0", "1": "1", "2": "\u218A", "3": "\u0190", "4": "\u3122",
  "5": "\u03DB", "6": "9", "7": "\u3125", "8": "8", "9": "6",
  ".": "\u02D9", ",": "'", "'": ",", "!": "\u00A1", "?": "\u00BF",
  '"': ',,', "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{",
  "<": ">", ">": "<", "&": "\u214B", "_": "\u203E", "-": "-",
  " ": " ", "\n": "\n", "\t": "\t",
};

function flipText(text: string): string {
  let result = "";
  for (const ch of text) {
    result = (flipMap[ch] ?? ch) + result;
  }
  return result;
}

export default function UpsideDownTextPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleFlip = useCallback(() => {
    if (!input.trim()) return;
    setOutput(flipText(input));
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const handleSwap = useCallback(() => {
    setInput(output);
    setOutput(input);
  }, [input, output]);

  return (
    <ToolLayout
      title="倒字/翻转文字"
      description="将文字上下颠倒翻转，生成倒字效果，趣味文字转换工具"
      toolId="upside-down-text"
      icon={FlipVertical}
      category="文本工具"
      slug="upside-down-text"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleFlip}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <FlipVertical className="w-4 h-4" />
              翻转文字
            </button>
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              互换
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">原始文本</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"在此输入文字...\n\n例如：Hello World!"}
                className="w-full h-48 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FlipVertical className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">翻转结果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="翻转后的文字将显示在这里..."
                className="w-full h-48 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>

          {output && (
            <div className="px-4 pb-4">
              <div className="p-6 bg-gradient-to-r from-violet-500 to-purple-500/10 border border-[#27272a] rounded-xl text-center">
                <div className="text-2xl text-zinc-100 rotate-180 inline-block">
                  {output}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            将文字上下颠倒翻转，生成倒字效果，趣味文字转换工具。使用Unicode翻转字符实现文字上下颠倒效果，
            支持英文字母、数字和常用符号。可用于社交媒体创意文案、
            趣味聊天、愚人节玩笑等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
