"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Layers, Copy, Check, Trash2, Wand2, Minimize2 } from "lucide-react";

export default function GraphQLFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const formatGraphQL = (query: string): string => {
    if (!query.trim()) return "";
    let result = "";
    let indent = 0;
    let inString = false;
    let stringChar = "";
    let i = 0;

    while (i < query.length) {
      const char = query[i];

      if (inString) {
        result += char;
        if (char === "\\" && i + 1 < query.length) {
          result += query[i + 1];
          i += 2;
          continue;
        }
        if (char === stringChar) {
          inString = false;
        }
        i++;
        continue;
      }

      if (char === '"' || char === "'") {
        inString = true;
        stringChar = char;
        result += char;
        i++;
        continue;
      }

      if (char === "{" || char === "(") {
        result += char + "\n";
        indent++;
        result += "  ".repeat(indent);
        i++;
        continue;
      }

      if (char === "}" || char === ")") {
        indent = Math.max(0, indent - 1);
        if (result.endsWith("  ".repeat(indent + 1))) {
          result = result.slice(0, -(indent + 1) * 2);
        }
        result += "\n" + "  ".repeat(indent) + char;
        i++;
        continue;
      }

      if (char === ",") {
        result += char + "\n" + "  ".repeat(indent);
        i++;
        continue;
      }

      if (char === "\n" || char === "\r") {
        i++;
        continue;
      }

      if (char === " " && (result.endsWith("\n") || result.endsWith(" "))) {
        i++;
        continue;
      }

      result += char;
      i++;
    }

    return result.trim();
  };

  const minifyGraphQL = (query: string): string => {
    return query.replace(/\s+/g, " ").trim();
  };

  const handleFormat = () => {
    setError("");
    try {
      setOutput(formatGraphQL(input));
    } catch (e) {
      setError("格式化失败");
    }
  };

  const handleMinify = () => {
    setError("");
    setOutput(minifyGraphQL(input));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const sampleQuery = `query GetUser($id: ID!) {
user(id: $id) {
id
name
email
posts {
id
title
comments {
id
body
author { name }
}
}
}
}`;

  const loadSample = () => {
    setInput(sampleQuery);
    setOutput(formatGraphQL(sampleQuery));
  };

  return (
    <ToolLayout
      title="GraphQL格式化"
      description="GraphQL查询语句格式化和压缩工具，支持美化和压缩，语法高亮显示"
      toolId="graphql-formatter"
      icon={Layers}
      category="开发工具"
      slug="graphql-formatter"
    >
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleFormat}
            disabled={!input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Wand2 className="w-4 h-4" />
            格式化
          </button>
          <button
            onClick={handleMinify}
            disabled={!input.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium border border-zinc-700"
          >
            <Minimize2 className="w-4 h-4" />
            压缩
          </button>
          <button
            onClick={loadSample}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium border border-zinc-700"
          >
            加载示例
          </button>
          <div className="flex-1" />
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-500 hover:text-red-400 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        </div>

        {/* 输入输出 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-400" />
              <h2 className="text-base font-semibold">输入</h2>
            </div>
            <div className="p-4">
              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(""); }}
                placeholder="粘贴GraphQL查询或变更语句..."
                className="w-full h-96 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-pink-500 resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-pink-400" />
                <h2 className="text-base font-semibold">输出</h2>
              </div>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-pink-400 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="p-4">
              <pre className="w-full h-96 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-300 font-mono text-sm overflow-auto">
                {error ? (
                  <span className="text-red-400">{error}</span>
                ) : output ? (
                  output
                ) : (
                  <span className="text-zinc-600">结果将显示在这里...</span>
                )}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">工具特性</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-pink-500/10 rounded-xl">
              <div className="text-sm font-medium text-pink-300">格式化美化</div>
              <p className="text-xs text-pink-400/70 mt-1">一键美化GraphQL查询语句</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <div className="text-sm font-medium text-emerald-300">压缩精简</div>
              <p className="text-xs text-emerald-400/70 mt-1">去除多余空格，减小体积</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="text-sm font-medium text-blue-300">本地处理</div>
              <p className="text-xs text-blue-400/70 mt-1">所有操作在浏览器本地完成</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
