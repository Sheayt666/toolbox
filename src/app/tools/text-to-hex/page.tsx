"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Hash, ArrowUpDown } from "lucide-react";

function textToHex(text: string, separator: string = " ", uppercase: boolean = false): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(separator);
  return uppercase ? hex.toUpperCase() : hex;
}

function hexToText(hex: string): { result: string; error?: string } {
  try {
    let cleaned = hex.replace(/\s+/g, "").replace(/0x/gi, "");
    cleaned = cleaned.replace(/[^0-9a-fA-F]/g, "");

    if (cleaned.length === 0) {
      return { result: "" };
    }

    if (cleaned.length % 2 !== 0) {
      return { result: "", error: "十六进制数据长度不是偶数，请检查输入" };
    }

    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = parseInt(cleaned.substring(i, i + 2), 16);
    }

    const decoder = new TextDecoder("utf-8");
    return { result: decoder.decode(bytes) };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export default function TextToHexPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [separator, setSeparator] = useState(" ");
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(textToHex(input, separator, uppercase));
  }, [input, separator, uppercase]);

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

  const handleLoadExample = useCallback(() => {
    setInput("Hello, World! 你好，世界！");
  }, []);

  return (
    <ToolLayout
      title="文本转十六进制"
      description="在线文本转十六进制工具，支持中英文等多语言字符转换为十六进制编码"
      icon={Hash}
      category="开发工具"
      slug="text-to-hex"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">文本 → 十六进制</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadExample}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              加载示例
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-[#27272a]">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">分隔符：</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              {[
                { value: " ", label: "空格" },
                { value: "", label: "无" },
                { value: "\n", label: "换行" },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSeparator(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    separator === opt.value
                      ? "bg-[#27272a] text-purple-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">大小写：</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setUppercase(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  !uppercase
                    ? "bg-[#27272a] text-purple-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                小写
              </button>
              <button
                onClick={() => setUppercase(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  uppercase
                    ? "bg-[#27272a] text-purple-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                大写
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输入文本</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入要转换的文本..."
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
            >
              转换为十六进制
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">十六进制结果</label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="转换结果将显示在这里..."
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
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
          <li>• 支持中英文等多语言字符，使用 UTF-8 编码转换</li>
          <li>• 可自定义分隔符（空格、无、换行）和大小写格式</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
