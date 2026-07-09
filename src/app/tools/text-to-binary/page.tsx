"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Binary, ArrowUpDown } from "lucide-react";

function textToBinary(text: string, separator: string = " "): string {
  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code < 128) {
        return code.toString(2).padStart(8, "0");
      } else if (code < 2048) {
        const byte1 = (0xc0 | (code >> 6)).toString(2);
        const byte2 = (0x80 | (code & 0x3f)).toString(2);
        return byte1 + separator + byte2;
      } else {
        const byte1 = (0xe0 | (code >> 12)).toString(2);
        const byte2 = (0x80 | ((code >> 6) & 0x3f)).toString(2);
        const byte3 = (0x80 | (code & 0x3f)).toString(2);
        return byte1 + separator + byte2 + separator + byte3;
      }
    })
    .join(separator);
}

function binaryToText(binary: string, separator: string = " "): { result: string; error?: string } {
  try {
    let cleaned = binary.replace(/\s+/g, "");
    if (separator && separator !== " ") {
      cleaned = binary.split(separator).join("");
    }
    cleaned = cleaned.replace(/[^01]/g, "");

    if (cleaned.length === 0) {
      return { result: "" };
    }

    if (cleaned.length % 8 !== 0) {
      return { result: "", error: "二进制数据长度不是 8 的倍数" };
    }

    let result = "";
    let i = 0;
    while (i < cleaned.length) {
      const byte1 = parseInt(cleaned.substring(i, i + 8), 2);

      if (byte1 < 0x80) {
        result += String.fromCharCode(byte1);
        i += 8;
      } else if (byte1 < 0xe0) {
        if (i + 16 > cleaned.length) break;
        const byte2 = parseInt(cleaned.substring(i + 8, i + 16), 2);
        const code = ((byte1 & 0x1f) << 6) | (byte2 & 0x3f);
        result += String.fromCharCode(code);
        i += 16;
      } else if (byte1 < 0xf0) {
        if (i + 24 > cleaned.length) break;
        const byte2 = parseInt(cleaned.substring(i + 8, i + 16), 2);
        const byte3 = parseInt(cleaned.substring(i + 16, i + 24), 2);
        const code = ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f);
        result += String.fromCharCode(code);
        i += 24;
      } else {
        i += 8;
      }
    }

    return { result };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export default function TextToBinaryPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [separator, setSeparator] = useState(" ");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(textToBinary(input, separator));
  }, [input, separator]);

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
    setError("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput("Hello, World! 你好，世界！");
  }, []);

  return (
    <ToolLayout
      title="文本转二进制"
      description="在线文本转二进制工具，支持中英文等多语言字符转换为二进制编码"
      icon={Binary}
      category="开发工具"
      slug="text-to-binary"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">文本 → 二进制</span>
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
        <div className="flex items-center gap-3 flex-wrap">
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
                    ? "bg-[#27272a] text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
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
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
            >
              转换为二进制
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">二进制结果</label>
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

      {error && (
        <div className="p-4 border-t border-[#27272a]">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            错误：{error}
          </div>
        </div>
      )}

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持中英文等多语言字符，自动使用 UTF-8 编码</li>
          <li>• ASCII 字符使用 1 字节，中文等字符使用 2-3 字节编码</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
