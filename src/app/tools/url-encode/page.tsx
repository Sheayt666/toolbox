"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Link, ArrowRightLeft } from "lucide-react";

export default function UrlEncodePage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (e) {
      setError(
        mode === "decode"
          ? "解码失败：输入的内容不是有效的 URL 编码字符串"
          : "编码失败：请检查输入内容"
      );
      setOutput("");
    }
  }, [input, mode]);

  const handleModeToggle = useCallback(() => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInput(output);
    setOutput(input);
    setError("");
  }, [mode, input, output]);

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
    if (mode === "encode") {
      setInput("https://example.com/path?name=张三&keyword=你好 世界");
    } else {
      setInput("https%3A%2F%2Fexample.com%2Fpath%3Fname%3D%E5%BC%A0%E4%B8%89%26keyword%3D%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C");
    }
    setOutput("");
    setError("");
  }, [mode]);

  return (
    <ToolLayout
      title="URL 编码工具"
      description="在线 URL 编码解码工具，快速进行 URL 编码和解码，支持中文等特殊字符"
      icon={Link}
      category="开发工具"
      slug="url-encode"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMode("encode");
                setError("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "encode"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-[#27272a]"
              }`}
            >
              编码
            </button>
            <button
              onClick={handleModeToggle}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
              title="交换输入输出"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMode("decode");
                setError("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "decode"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-[#27272a]"
              }`}
            >
              解码
            </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              {mode === "encode" ? "原始 URL / 文本" : "URL 编码字符串"}
            </label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "请输入要编码的 URL 或文本..."
                : "请输入要解码的 URL 编码字符串..."
            }
            spellCheck={false}
            className="w-full h-64 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-green-500/25"
            >
              {mode === "encode" ? "编码" : "解码"}
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              {mode === "encode" ? "编码结果" : "解码结果"}
            </label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="结果将显示在这里..."
            spellCheck={false}
            className="w-full h-64 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
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
            {error}
          </div>
        </div>
      )}

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• URL 编码将特殊字符转换为 %XX 格式，确保 URL 的正确传输</li>
          <li>• 使用 encodeURIComponent 进行编码，支持中文等多语言字符</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
