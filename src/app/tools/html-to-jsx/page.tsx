"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Code2,
  Copy,
  Check,
  Trash2,
  Download,
  FileCode,
} from "lucide-react";

function htmlToJsx(html: string): string {
  let result = html;
  
  // class -> className
  result = result.replace(/class=/g, "className=");
  // for -> htmlFor
  result = result.replace(/ for=/g, " htmlFor=");
  // tabindex -> tabIndex
  result = result.replace(/tabindex=/g, "tabIndex=");
  // onclick -> onClick (and other event handlers)
  const events = ["click", "change", "input", "submit", "focus", "blur", "mouseover", "mouseout", "keydown", "keyup", "keypress", "load", "error"];
  for (const ev of events) {
    const re = new RegExp(`on${ev}=`, "g");
    result = result.replace(re, `on${ev.charAt(0).toUpperCase() + ev.slice(1)}=`);
  }
  // style="color: red" -> style={{ color: "red" }}
  result = result.replace(/style="([^"]+)"/g, (match, styleStr) => {
    const styles: string[] = [];
    const pairs = styleStr.split(";").filter(s => s.trim());
    for (const pair of pairs) {
      const [prop, val] = pair.split(":").map(s => s.trim());
      // kebab-case to camelCase
      const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      styles.push(`${camelProp}: "${val}"`);
    }
    return `style={{ ${styles.join(", ")} }}`;
  });
  // self-closing tags: <img> -> <img />, <br> -> <br />, <hr> -> <hr />, <input> -> <input />, <meta> -> <meta />, <link> -> <link />
  const selfClosing = ["img", "br", "hr", "input", "meta", "link", "area", "base", "col", "embed", "source", "track", "wbr"];
  for (const tag of selfClosing) {
    const re = new RegExp(`<${tag}([^>]*)>`, "g");
    result = result.replace(re, (match, attrs) => {
      if (attrs.trim().endsWith("/")) return match;
      return `<${tag}${attrs} />`;
    });
  }
  
  return result;
}

export default function HtmlToJsxPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入代码");
      return;
    }
    try {
      setOutput(convert(input));
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
    a.download = "converted.jsx";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="HTML转JSX"
      description="将HTML代码转换为JSX语法，自动转换class/className、style等属性，React开发必备"
      toolId="html-to-jsx"
      icon={Code2}
      category="开发工具"
      slug="html-to-jsx"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Code2 className="w-4 h-4" />
              转换为JSX
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
                <span className="text-sm font-medium text-zinc-300">HTML代码（输入）</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sampleInput}
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">JSX代码（输出）</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="转换结果将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            将HTML代码转换为JSX语法，自动转换class/className、style等属性，React开发必备。支持class/className转换、style对象/字符串转换、
            事件处理函数命名转换、自闭合标签转换等。是React开发者的效率工具。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
