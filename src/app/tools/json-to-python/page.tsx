"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Braces,
  Copy,
  Check,
  Trash2,
  Download,
  FileJson,
  ArrowRight,
} from "lucide-react";

function jsonToPython(obj: any, className: string = "Root"): string {
  const classes: string[] = [];
  const generated: Record<string, boolean> = {};
  
  function pyType(val: any, name: string): string {
    if (val === null) return "Optional[Any]";
    if (Array.isArray(val)) {
      if (val.length === 0) return "List[Any]";
      return "List[" + pyType(val[0], name) + "]";
    }
    if (typeof val === "object") {
      const cName = name.charAt(0).toUpperCase() + name.slice(1);
      generateClass(val, cName);
      return cName;
    }
    if (typeof val === "string") return "str";
    if (typeof val === "number") {
      if (Number.isInteger(val)) return "int";
      return "float";
    }
    if (typeof val === "boolean") return "bool";
    return "Any";
  }
  
  function generateClass(obj: Record<string, any>, name: string) {
    if (generated[name]) return;
    generated[name] = true;
    
    let lines = `@dataclass\nclass ${name}:`;
    const fields: string[] = [];
    
    for (const [key, val] of Object.entries(obj)) {
      const t = pyType(val, key);
      // 转换为蛇形命名的字段名
      const fieldName = key.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
      fields.push({ name: fieldName, type: t, original: key });
      lines += `\n    ${fieldName}: ${t}`;
    }
    
    classes.push(lines);
  }
  
  generateClass(obj, className);
  
  const imports = "from dataclasses import dataclass\nfrom typing import List, Optional, Any\n";
  return imports + "\n" + classes.join("\n\n");
}

export default function JsonToPythonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入JSON数据");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const result = jsonToPython(parsed);
      setOutput(result);
    } catch (e) {
      setError("转换失败: " + (e as Error).message);
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
    a.download = "models.py";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const sampleJson = JSON.stringify({ name: "张三", age: 25, skills: ["React", "TypeScript"], address: { city: "北京", zip: "100000" } }, null, 2);

  return (
    <ToolLayout
      title="JSON转Python类"
      description="将JSON数据转换为Python类定义，自动推导字段类型，一键生成dataclass"
      toolId="json-to-python"
      icon={Braces}
      category="开发工具"
      slug="json-to-python"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Braces className="w-4 h-4" />
              JSON转Python
            </button>
            <ArrowRight className="w-4 h-4 text-zinc-500 hidden sm:block" />
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
                <FileJson className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">JSON数据（输入）</span>
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
                <span className="text-sm font-medium text-zinc-300">Python代码（输出）</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="转换后的Python代码将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            将JSON数据转换为Python类定义，自动推导字段类型，一键生成dataclass。自动推导字段类型，支持嵌套对象和数组，
            生成规范的Python类型定义。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
