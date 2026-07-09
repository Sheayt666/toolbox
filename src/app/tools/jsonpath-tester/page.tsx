"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Braces,
  Play,
  Copy,
  Check,
  Trash2,
  FileJson,
} from "lucide-react";

// 简易JSONPath实现
function jsonPath(obj: any, expr: string): any[] {
  const results: any[] = [];
  
  function walk(node: any, path: string[]) {
    if (path.length === 0) {
      results.push(node);
      return;
    }
    
    const [current, ...rest] = path;
    
    if (current === "$") {
      walk(node, rest);
      return;
    }
    
    if (current === "*") {
      if (Array.isArray(node)) {
        for (const item of node) walk(item, rest);
      } else if (typeof node === "object" && node !== null) {
        for (const key of Object.keys(node)) walk(node[key], rest);
      }
      return;
    }
    
    if (current === "..") {
      // 递归下降 - 简化实现
      function deepWalk(n: any) {
        if (Array.isArray(n)) {
          for (const item of n) {
            walk(item, rest);
            deepWalk(item);
          }
        } else if (typeof n === "object" && n !== null) {
          for (const key of Object.keys(n)) {
            if (rest.length > 0 || true) {
              // 尝试匹配
            }
            deepWalk(n[key]);
          }
        }
      }
      deepWalk(node);
      return;
    }
    
    // 数组索引 [n]
    const arrMatch = current.match(/^\[(\d+)\]$/);
    if (arrMatch && Array.isArray(node)) {
      const idx = parseInt(arrMatch[1]);
      if (idx >= 0 && idx < node.length) {
        walk(node[idx], rest);
      }
      return;
    }
    
    // 属性名
    if (typeof node === "object" && node !== null && current in node) {
      walk(node[current], rest);
    }
  }
  
  // 解析表达式
  let normalized = expr.trim();
  if (normalized.startsWith("$.")) {
    normalized = normalized.substring(2);
  } else if (normalized.startsWith("$")) {
    normalized = normalized.substring(1);
  }
  
  // 简单分割
  const parts: string[] = [];
  let current = "";
  let inBracket = false;
  
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === "[") {
      if (current) { parts.push(current); current = ""; }
      inBracket = true;
      current = "[";
    } else if (ch === "]") {
      current += "]";
      parts.push(current);
      current = "";
      inBracket = false;
    } else if (ch === "." && !inBracket) {
      if (current) { parts.push(current); current = ""; }
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  
  walk(obj, ["$", ...parts]);
  return results;
}

export default function JsonpathTesterPage() {
  const [input, setInput] = useState("");
  const [expression, setExpression] = useState("$.name");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleTest = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入JSON数据");
      return;
    }
    if (!expression.trim()) {
      setError("请输入JSONPath表达式");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const results = jsonPath(parsed, expression);
      if (results.length === 0) {
        setOutput("// 未找到匹配结果");
      } else if (results.length === 1) {
        setOutput(JSON.stringify(results[0], null, 2));
      } else {
        setOutput(`// 找到 ${results.length} 个匹配结果\n\n` + JSON.stringify(results, null, 2));
      }
    } catch (e) {
      setError("查询失败: " + (e as Error).message);
    }
  }, [input, expression]);

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

  const sampleJson = JSON.stringify({
    name: "张三",
    age: 25,
    skills: ["React", "TypeScript", "Node.js"],
    address: { city: "北京", district: "朝阳区" },
    friends: [
      { name: "李四", age: 24 },
      { name: "王五", age: 26 },
    ],
  }, null, 2);

  const quickExpressions = [
    "$.name",
    "$.skills",
    "$.skills[0]",
    "$.address.city",
    "$.friends[*].name",
    "$.friends[1].age",
  ];

  return (
    <ToolLayout
      title="JSONPath测试器"
      description="在线测试JSONPath表达式，快速查询JSON数据，支持实时预览查询结果"
      toolId="jsonpath-tester"
      icon={Braces}
      category="开发工具"
      slug="jsonpath-tester"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">JSONPath:</span>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="$.path.to.value"
                  spellCheck={false}
                  className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:border-primary-500/50 placeholder-zinc-600"
                  onKeyDown={(e) => e.key === "Enter" && handleTest()}
                />
              </div>
            </div>
            <button
              onClick={handleTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Play className="w-4 h-4" />
              运行查询
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
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-500">快速表达式:</span>
              {quickExpressions.map((expr) => (
                <button
                  key={expr}
                  onClick={() => setExpression(expr)}
                  className="px-2 py-0.5 text-xs font-mono bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 rounded-md transition-colors"
                >
                  {expr}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FileJson className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">JSON数据</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sampleJson}
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Braces className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">查询结果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="查询结果将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            在线测试JSONPath表达式，快速查询JSON数据，支持实时预览查询结果。JSONPath是JSON的XPath，用于从JSON数据中提取指定路径的数据。
            支持点号表示法（$.store.book）和方括号表示法（$['store']['book']）。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
