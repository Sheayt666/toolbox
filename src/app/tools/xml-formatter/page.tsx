"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Code, Minimize2, Maximize2 } from "lucide-react";

type IndentSize = 2 | 4;

function formatXml(xml: string, indentSize: number): { result: string; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      return { result: "", error: "XML 格式错误：" + parseError.textContent?.trim() };
    }

    const indent = " ".repeat(indentSize);

    const formatNode = (node: Node, level: number): string => {
      const pad = indent.repeat(level);
      const result: string[] = [];

      if (node.nodeType === Node.COMMENT_NODE) {
        result.push(`${pad}<!--${node.textContent}-->`);
        return result.join("\n");
      }

      if (node.nodeType === Node.CDATA_SECTION_NODE) {
        result.push(`${pad}<![CDATA[${node.textContent}]]>`);
        return result.join("\n");
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          result.push(pad + text);
        }
        return result.join("\n");
      }

      const element = node as Element;
      const childElements = Array.from(element.childNodes).filter(
        (n) => n.nodeType === Node.ELEMENT_NODE
      );
      const textContent = element.textContent?.trim() || "";

      // Build opening tag with attributes
      let tag = `<${element.tagName}`;
      if (element.attributes.length > 0) {
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          tag += ` ${attr.name}="${attr.value}"`;
        }
      }

      if (childElements.length === 0 && textContent === "") {
        // Self-closing tag
        result.push(`${pad}${tag}/>`);
      } else if (childElements.length === 0) {
        // Tag with only text content
        result.push(`${pad}${tag}>${textContent}</${element.tagName}>`);
      } else {
        // Tag with child elements
        result.push(`${pad}${tag}>`);
        for (const child of element.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && !child.textContent?.trim()) continue;
          const childFormatted = formatNode(child, level + 1);
          if (childFormatted) {
            result.push(childFormatted);
          }
        }
        result.push(`${pad}</${element.tagName}>`);
      }

      return result.join("\n");
    };

    const formatted = formatNode(xmlDoc.documentElement, 0);
    const xmlDecl = xml.match(/^<\?xml[^?]*\?>/)?.[0] || '<?xml version="1.0" encoding="UTF-8"?>';
    
    return { result: xmlDecl + "\n" + formatted };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function minifyXml(xml: string): { result: string; error?: string } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      return { result: "", error: "XML 格式错误：" + parseError.textContent?.trim() };
    }

    const serializer = new XMLSerializer();
    let result = serializer.serializeToString(xmlDoc);
    // Remove whitespace between tags
    result = result.replace(/>\s+</g, "><");
    result = result.trim();

    return { result };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export default function XmlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleFormat = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = formatXml(input, indentSize);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.result);
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = minifyXml(input);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.result);
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

  const handleLoadExample = useCallback(() => {
    setInput(`<?xml version="1.0" encoding="UTF-8"?><root><name>工具箱</name><version>1.0.0</version><features><item>格式化</item><item>转换</item><item>生成</item></features><config theme="dark" language="zh-CN"><autoSave>true</autoSave></config></root>`);
  }, []);

  const lineCount = useMemo(() => {
    return output ? output.split("\n").length : 0;
  }, [output]);

  return (
    <ToolLayout
      title="XML 格式化"
      description="在线 XML 格式化/压缩工具，支持美化和压缩 XML 代码，自定义缩进大小"
      icon={Code}
      category="开发工具"
      slug="xml-formatter"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">XML 格式化/压缩</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">缩进:</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setIndentSize(2)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 2
                    ? "bg-[#27272a] text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2 空格
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 4
                    ? "bg-[#27272a] text-blue-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                4 空格
              </button>
            </div>
          </div>

          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            <Maximize2 className="w-4 h-4" />
            格式化
          </button>

          <button
            onClick={handleMinify}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            压缩
          </button>

          <button
            onClick={handleLoadExample}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors"
          >
            示例
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输入 XML</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`在此粘贴或输入 XML 数据...`}
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输出结果</label>
            <span className="text-xs text-slate-500">{lineCount} 行 · {output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化或压缩后的结果将显示在这里..."
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
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
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 border-t border-[#27272a]">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            错误：{error}
          </div>
        </div>
      )}

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持 XML 格式化（美化）和压缩两种模式，一键切换</li>
          <li>• 支持自定义缩进大小（2 空格或 4 空格）</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
