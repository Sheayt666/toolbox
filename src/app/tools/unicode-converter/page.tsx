"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Hash,
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  Type,
} from "lucide-react";

export default function UnicodeConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [format, setFormat] = useState<"unicode" | "hex" | "decimal">("unicode");
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) return;
    
    if (mode === "encode") {
      let result = "";
      for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);
        if (format === "unicode") {
          result += "\\u" + code.toString(16).padStart(4, "0");
        } else if (format === "hex") {
          result += "&#x" + code.toString(16).toUpperCase() + ";";
        } else {
          result += "&#" + code + ";";
        }
      }
      setOutput(result);
    } else {
      try {
        let result = input;
        if (format === "unicode") {
          result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );
        } else if (format === "hex") {
          result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );
        } else {
          result = result.replace(/&#(\d+);/g, (_, dec) =>
            String.fromCharCode(parseInt(dec, 10))
          );
        }
        setOutput(result);
      } catch {
        setOutput("解码失败");
      }
    }
  }, [input, mode, format]);

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
  }, []);

  const handleSwap = useCallback(() => {
    setInput(output);
    setOutput(input);
    setMode(mode === "encode" ? "decode" : "encode");
  }, [input, output, mode]);

  return (
    <ToolLayout
      title="Unicode转换"
      description="Unicode编码转换工具，支持Unicode编码解码、字符转Unicode、Unicode转字符"
      toolId="unicode-converter"
      icon={Hash}
      category="开发工具"
      slug="unicode-converter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-1 bg-[#27272a] rounded-xl p-1">
              <button
                onClick={() => setMode("encode")}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  mode === "encode"
                    ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                编码
              </button>
              <button
                onClick={() => setMode("decode")}
                className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                  mode === "decode"
                    ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                解码
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">格式:</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as "unicode" | "hex" | "decimal")}
                className="bg-transparent text-zinc-300 text-sm outline-none cursor-pointer"
              >
                <option value="unicode" className="bg-[#18181b]">\\uXXXX</option>
                <option value="hex" className="bg-[#18181b]">&#xXXXX;</option>
                <option value="decimal" className="bg-[#18181b]">&#DDDD;</option>
              </select>
            </div>
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Hash className="w-4 h-4" />
              转换
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
                <span className="text-sm font-medium text-zinc-300">
                  {mode === "encode" ? "原始文本" : "Unicode编码"}
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === "encode" ? "在此输入要编码的文本...\n\n例如: 你好世界" : "在此输入Unicode编码...\n\n例如: \\u4f60\\u597d"}
                spellCheck={false}
                className="w-full h-64 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Hash className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">
                  {mode === "encode" ? "Unicode编码" : "解码结果"}
                </span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="转换结果将显示在这里..."
                spellCheck={false}
                className="w-full h-64 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Unicode编码转换工具，支持Unicode编码解码、字符转Unicode、Unicode转字符。支持\\uXXXX、&#xXXXX;、&#DDDD;三种Unicode格式，
            可进行编码和解码双向转换。常用于国际化开发、字符编码分析等场景。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
