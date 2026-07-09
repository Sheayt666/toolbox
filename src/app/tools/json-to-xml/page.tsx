"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, FileJson, Code, Download } from "lucide-react";

function jsonToXml(jsonStr: string, rootName: string = "root"): { xml: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);

    const escapeXml = (str: string): string => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const isValidTagName = (name: string): boolean => {
      return /^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(name);
    };

    const toXml = (value: any, tagName: string, indent: number): string => {
      const pad = "  ".repeat(indent);
      const safeTagName = isValidTagName(tagName) ? tagName : "item";

      if (value === null || value === undefined) {
        return `${pad}<${safeTagName} null="true"/>`;
      }

      if (typeof value === "boolean") {
        return `${pad}<${safeTagName} type="boolean">${value}</${safeTagName}>`;
      }

      if (typeof value === "number") {
        return `${pad}<${safeTagName} type="number">${value}</${safeTagName}>`;
      }

      if (typeof value === "string") {
        return `${pad}<${safeTagName} type="string">${escapeXml(value)}</${safeTagName}>`;
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `${pad}<${safeTagName} type="array"/>`;
        }
        const items = value.map((item) => toXml(item, "item", indent + 1)).join("\n");
        return `${pad}<${safeTagName} type="array">\n${items}\n${pad}</${safeTagName}>`;
      }

      if (typeof value === "object") {
        const keys = Object.keys(value);
        if (keys.length === 0) {
          return `${pad}<${safeTagName} type="object"/>`;
        }
        const children = keys.map((key) => toXml(value[key], key, indent + 1)).join("\n");
        return `${pad}<${safeTagName} type="object">\n${children}\n${pad}</${safeTagName}>`;
      }

      return `${pad}<${safeTagName}>${escapeXml(String(value))}</${safeTagName}>`;
    };

    const content = toXml(data, rootName, 0);
    const xmlDecl = '<?xml version="1.0" encoding="UTF-8"?>';
    return { xml: `${xmlDecl}\n${content}` };
  } catch (e) {
    return { xml: "", error: (e as Error).message };
  }
}

export default function JsonToXmlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [rootName, setRootName] = useState("root");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = jsonToXml(input, rootName || "root");
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.xml);
    }
  }, [input, rootName]);

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

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.xml";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput(JSON.stringify({
      name: "工具箱",
      version: "1.0.0",
      features: ["格式化", "转换", "生成"],
      config: {
        theme: "dark",
        language: "zh-CN",
        autoSave: true
      }
    }, null, 2));
  }, []);

  return (
    <ToolLayout
      title="JSON 转 XML"
      description="在线 JSON 转 XML 工具，快速将 JSON 数据转换为 XML 格式，自定义根节点名称"
      icon={Code}
      category="开发工具"
      slug="json-to-xml"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">JSON → XML 转换</span>
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

      <div className="p-4 border-b border-[#27272a]">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-slate-400">根节点名称：</label>
          <input
            type="text"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            placeholder="root"
            className="px-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none transition-all w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">JSON 输入</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='在此输入 JSON 数据，例如：
{
  "name": "工具箱",
  "version": "1.0.0"
}'
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25"
            >
              转换为 XML
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">XML 输出</label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="转换结果将显示在这里..."
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
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
            <button
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="下载 XML 文件"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 border-t border-[#27272a]">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            转换错误：{error}
          </div>
        </div>
      )}

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持对象、数组、字符串、数字、布尔值、null 等数据类型</li>
          <li>• XML 标签名会自动进行合法性检查，不合法的名称将替换为 item</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
