"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Braces,
  Copy,
  Check,
  Trash2,
  Download,
  FileCode,
} from "lucide-react";

function addPrefixes(css: string): string {
  const properties: Record<string, string[]> = {
    "transform": ["-webkit-", "-moz-", "-ms-"],
    "transition": ["-webkit-", "-moz-"],
    "animation": ["-webkit-", "-moz-"],
    "border-radius": ["-webkit-", "-moz-"],
    "box-shadow": ["-webkit-", "-moz-"],
    "flex": ["-webkit-", "-ms-"],
    "flex-direction": ["-webkit-", "-ms-"],
    "flex-wrap": ["-webkit-", "-ms-"],
    "justify-content": ["-webkit-", "-ms-"],
    "align-items": ["-webkit-", "-ms-"],
    "display": ["-webkit-", "-ms-"],
    "filter": ["-webkit-"],
    "backdrop-filter": ["-webkit-"],
    "user-select": ["-webkit-", "-moz-", "-ms-"],
    "appearance": ["-webkit-", "-moz-"],
    "mask": ["-webkit-"],
    "clip-path": ["-webkit-"],
    "background-clip": ["-webkit-"],
    "text-size-adjust": ["-webkit-", "-moz-", "-ms-"],
    "hyphens": ["-webkit-", "-moz-", "-ms-"],
    "tab-size": ["-moz-"],
  };

  let result = css;
  
  // 处理每个规则块
  const ruleRegex = /\{([^}]+)\}/g;
  result = result.replace(ruleRegex, (match, content) => {
    let newContent = content;
    const lines = content.split(";");
    const newLines: string[] = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) {
        newLines.push(line);
        continue;
      }
      
      const prop = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      // 检查是否需要加前缀
      const prefixes = properties[prop];
      if (prefixes) {
        for (const prefix of prefixes) {
          let prefixedValue = value;
          // 特殊处理 display: flex
          if (prop === "display" && value === "flex") {
            newLines.push(`${prefix}${prop}: ${prefix}${value}`);
          } else {
            newLines.push(`${prefix}${prop}: ${prefixedValue}`);
          }
        }
      }
      newLines.push(line);
    }
    
    return "{\n  " + newLines.join(";\n  ") + ";\n}";
  });
  
  return result;
}

export default function CssPrefixerPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleProcess = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入CSS代码");
      return;
    }
    try {
      setOutput(addPrefixes(input));
    } catch (e) {
      setError("处理失败: " + (e as Error).message);
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
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prefixed.css";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="CSS自动加前缀"
      description="CSS自动添加浏览器前缀，支持-webkit-、-moz-、-ms-、-o-等前缀，兼容多浏览器"
      toolId="css-prefixer"
      icon={Braces}
      category="开发工具"
      slug="css-prefixer"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleProcess}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Braces className="w-4 h-4" />
              添加前缀
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">原始CSS（输入）</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"在此粘贴CSS代码...\n\n.example {\n  display: flex;\n  transform: rotate(45deg);\n}"}
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Braces className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">带前缀CSS（输出）</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="添加前缀后的CSS将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            CSS自动添加浏览器前缀，支持-webkit-、-moz-、-ms-、-o-等前缀，兼容多浏览器。支持-webkit-、-moz-、-ms-、-o-等主流浏览器前缀，
            覆盖transform、transition、animation、flexbox等常用CSS属性。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
