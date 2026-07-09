"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Code, FileJson, Download } from "lucide-react";

function xmlToJson(xmlStr: string): { json: string; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, "text/xml");

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      return { json: "", error: "XML 格式错误：" + parseError.textContent?.trim() };
    }

    const parseNode = (node: Node): any => {
      // Element nodes
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const result: Record<string, any> = {};

        // Add attributes
        if (element.attributes.length > 0) {
          const attrs: Record<string, string> = {};
          for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[attr.name] = attr.value;
          }
          result["@attributes"] = attrs;
        }

        // Get child elements
        const childElements = Array.from(element.childNodes).filter(
          (n) => n.nodeType === Node.ELEMENT_NODE
        ) as Element[];

        // Get text content
        const textContent = Array.from(element.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent || "")
          .join("")
          .trim();

        if (childElements.length === 0) {
          // No child elements - return text value or attributes
          if (element.attributes.length > 0) {
            if (textContent) {
              result["#text"] = convertValue(textContent);
            }
            return result;
          }
          return convertValue(textContent);
        }

        // Process child elements
        const childGroups: Record<string, Element[]> = {};
        for (const child of childElements) {
          if (!childGroups[child.nodeName]) {
            childGroups[child.nodeName] = [];
          }
          childGroups[child.nodeName].push(child);
        }

        for (const [name, elements] of Object.entries(childGroups)) {
          if (elements.length === 1) {
            result[name] = parseNode(elements[0]);
          } else {
            result[name] = elements.map((el) => parseNode(el));
          }
        }

        // Add text content if present and there are child elements
        if (textContent && childElements.length > 0) {
          result["#text"] = convertValue(textContent);
        }

        return result;
      }

      return null;
    };

    const convertValue = (str: string): any => {
      if (str === "" || str === "null") return null;
      if (str === "true") return true;
      if (str === "false") return false;
      if (!isNaN(Number(str)) && str.trim() !== "") return Number(str);
      return str;
    };

    const root = xmlDoc.documentElement;
    if (!root) {
      return { json: "", error: "XML 文档为空" };
    }

    const result = { [root.nodeName]: parseNode(root) };
    return { json: JSON.stringify(result, null, 2) };
  } catch (e) {
    return { json: "", error: (e as Error).message };
  }
}

export default function XmlToJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = xmlToJson(input);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.json);
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

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput(`<?xml version="1.0" encoding="UTF-8"?>
<root type="object">
  <name type="string">工具箱</name>
  <version type="string">1.0.0</version>
  <features type="array">
    <item type="string">格式化</item>
    <item type="string">转换</item>
    <item type="string">生成</item>
  </features>
  <config type="object">
    <theme type="string">dark</theme>
    <language type="string">zh-CN</language>
    <autoSave type="boolean">true</autoSave>
  </config>
</root>`);
  }, []);

  return (
    <ToolLayout
      title="XML 转 JSON"
      description="在线 XML 转 JSON 工具，快速将 XML 数据转换为 JSON 格式，支持属性和嵌套结构"
      icon={Code}
      category="开发工具"
      slug="xml-to-json"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">XML → JSON 转换</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">XML 输入</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`在此输入 XML 数据，例如：
<?xml version="1.0"?>
<root>
  <name>工具箱</name>
</root>`}
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-cyan-500/25"
            >
              转换为 JSON
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">JSON 输出</label>
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
              title="下载 JSON 文件"
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
          <li>• 支持 XML 属性和嵌套元素，属性会放在 @attributes 对象中</li>
          <li>• 自动识别数字、布尔值等数据类型，文本内容保留原始格式</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
