"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, ArrowRightLeft, Link } from "lucide-react";

export default function UrlEncoderPage() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = () => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = encodeURIComponent(input);
        setOutput(encoded);
      } else {
        const decoded = decodeURIComponent(input);
        setOutput(decoded);
      }
    } catch (e) {
      setError(
        mode === "decode"
          ? "解码失败：输入的内容包含无效的URL 编码序列"
          : "编码失败：请检查输入内容"
      );
      setOutput("");
    }
  };

  const handleModeToggle = () => {
    const newMode = mode === "encode" ? "decode" : "encode";
    setMode(newMode);
    setInput(output);
    setOutput(input);
    setError("");
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("复制失败", e);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolLayout
      title="URL 编解码工具"
      description="URL编码和解码工具，处理特殊字符转义，支持encodeURIComponent"
      icon={Link}
      category="开发工具"
      slug="url-encoder"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mode toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMode("encode");
                setError("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "encode"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              编码
            </button>
            <button
              onClick={() => {
                setMode("decode");
                setError("");
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "decode"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              解码
            </button>
          </div>
          <button
            onClick={handleModeToggle}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="交换输入输出"
          >
            <ArrowRightLeft className="w-4 h-4" />
            交换
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
          {/* Input section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {mode === "encode" ? "原始文本" : "编码后的 URL"}
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {input.length} 字符
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "请输入要编码的URL 或文本..."
                  : "请输入要解码的URL 编码字符串.."
              }
              className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all code-editor"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleConvert}
                className="flex-1 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                {mode === "encode" ? "编码" : "解码"}
              </button>
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-xl transition-colors"
                title="清空"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>

          {/* Output section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {mode === "encode" ? "编码结果" : "解码结果"}
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {output.length} 字符
              </span>
            </div>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                placeholder="转换结果将显示在这里..."
                className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 resize-none code-editor"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
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

        {/* Error message */}
        {error && (
          <div className="px-4 pb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          使用提示
        </h3>
        <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1.5">
          <li>• URL 编码（Percent-Encoding）用于将 URL 中的特殊字符转换为安全格式</li>
          <li>• 空格会被编码为%20，中文等非ASCII 字符也会被正确编码</li>
          <li>• 使用 encodeURIComponent / decodeURIComponent 进行完整的字符编解码</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
