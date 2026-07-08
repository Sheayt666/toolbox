"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, ArrowRightLeft, Binary } from "lucide-react";

export default function Base64Page() {
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
        // 处理中文：先 encodeURIComponent，再转义 %XX 为字节，最后用btoa
        const encoded = btoa(
          encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
            String.fromCharCode(parseInt(p1, 16))
          )
        );
        setOutput(encoded);
      } else {
        // 解码：先 atob，再拼接字节，最后用decodeURIComponent
        const decoded = decodeURIComponent(
          atob(input)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        setOutput(decoded);
      }
    } catch (e) {
      setError(
        mode === "decode"
          ? "解码失败：输入的内容不是有效的Base64 字符串"
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
      title="Base64 编解码工具"
      description="快速进行Base64编码和解码，支持文本和图片转换，数据安全不传输"
      icon={Binary}
      category="开发工具"
      slug="base64"
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
                {mode === "encode" ? "原始文本" : "Base64 字符串"}
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
                  ? "请输入要编码的文本..."
                  : "请输入要解码的Base64 字符串.."
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
                {mode === "encode" ? "Base64 结果" : "解码结果"}
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
          <li>• Base64 是一种用 64 个可打印字符来表示二进制数据的编码方式</li>
          <li>• 支持中文、日文、韩文等多语言字符的编解码</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
