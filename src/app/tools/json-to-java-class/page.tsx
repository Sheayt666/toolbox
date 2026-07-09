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

function jsonToJava(obj: any, className: string = "Root"): string {
  const classes: string[] = [];
  const generated: Record<string, boolean> = {};
  
  function javaType(val: any, name: string): string {
    if (val === null) return "Object";
    if (Array.isArray(val)) {
      if (val.length === 0) return "List<Object>";
      return "List<" + javaType(val[0], name) + ">";
    }
    if (typeof val === "object") {
      const cName = name.charAt(0).toUpperCase() + name.slice(1);
      generateClass(val, cName);
      return cName;
    }
    if (typeof val === "string") return "String";
    if (typeof val === "number") {
      if (Number.isInteger(val)) return "Integer";
      return "Double";
    }
    if (typeof val === "boolean") return "Boolean";
    return "Object";
  }
  
  function generateClass(obj: Record<string, any>, name: string) {
    if (generated[name]) return;
    generated[name] = true;
    
    let lines = `public class ${name} {`;
    const fields: Array<{ name: string; type: string }> = [];
    
    for (const [key, val] of Object.entries(obj)) {
      const t = javaType(val, key);
      fields.push({ name: key, type: t });
      lines += `\n    private ${t} ${key};`;
    }
    
    // Add constructor
    lines += `\n\n    public ${name}() {}`;
    
    // Add getters and setters
    for (const f of fields) {
      const cap = f.name.charAt(0).toUpperCase() + f.name.slice(1);
      lines += `\n\n    public ${f.type} get${cap}() { return ${f.name}; }`;
      lines += `\n    public void set${cap}(${f.type} ${f.name}) { this.${f.name} = ${f.name}; }`;
    }
    
    lines += "\n}";
    classes.push(lines);
  }
  
  generateClass(obj, className);
  return classes.join("\n\n");
}

export default function JsonToJavaClassPage() {
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
      const result = jsonToJava(parsed);
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
    a.download = "Model.java";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const sampleJson = JSON.stringify({ name: "张三", age: 25, skills: ["React", "TypeScript"], address: { city: "北京", zip: "100000" } }, null, 2);

  return (
    <ToolLayout
      title="JSON转Java类"
      description="将JSON数据转换为Java类定义，自动生成getter/setter，一键生成POJO类"
      toolId="json-to-java-class"
      icon={Braces}
      category="开发工具"
      slug="json-to-java-class"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Braces className="w-4 h-4" />
              JSON转Java
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
                <span className="text-sm font-medium text-zinc-300">Java代码（输出）</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="转换后的Java代码将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            将JSON数据转换为Java类定义，自动生成getter/setter，一键生成POJO类。自动推导字段类型，支持嵌套对象和数组，
            生成规范的Java类型定义。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
