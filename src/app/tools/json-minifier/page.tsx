"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Minimize2,
  Copy,
  Check,
  Trash2,
  Download,
  FileCode,
  ArrowDown,
} from "lucide-react";

export default function JsonMinifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const minify = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入JSON代码");
      return;
    }
    try {
      const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError("压缩失败: " + (e as Error).message);
    }
  }, [input]);

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

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const inputSize = new Blob([input]).size;
  const outputSize = new Blob([output]).size;
  const savedPercent = inputSize > 0 ? Math.round((1 - outputSize / inputSize) * 100) : 0;

  return (
    <ToolLayout
      title="JSON压缩工具"
      description="在线JSON数据压缩工具，一键压缩JSON数据，减小体积便于传输"
      toolId="json-minifier"
      icon={Minimize2}
      category="开发工具"
      slug="json-minifier"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={minify}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Minimize2 className="w-4 h-4" />
              压缩JSON
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {output && (
            <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">原始大小:</span>
                  <span className="text-zinc-300 font-mono">{(inputSize / 1024).toFixed(2)} KB</span>
                </div>
                <ArrowDown className="w-4 h-4 text-emerald-400" />
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">压缩后:</span>
                  <span className="text-emerald-400 font-mono font-semibold">{(outputSize / 1024).toFixed(2)} KB</span>
                </div>
                <div className="ml-auto px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-400 font-semibold">
                  节省 {savedPercent}%
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">JSON代码（输入）</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`在此粘贴JSON数据...

{
  "name": "test",
  "value": 123
}"
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600`}
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Minimize2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">压缩结果（输出）</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="压缩后的代码将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            在线JSON数据压缩工具，一键压缩JSON数据，减小体积便于传输。本工具在浏览器本地运行，数据不会上传到服务器，安全可靠。
            支持一键复制和下载压缩后的代码，方便集成到项目中使用。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
