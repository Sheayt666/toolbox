"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FileCode,
  Minimize2,
  Maximize2,
  Copy,
  Trash2,
  CheckCircle,
  Download,
  Code2,
  Sparkles,
} from "lucide-react";

type IndentSize = 2 | 4;

const sampleHTML = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>示例页面</title><style>.container{max-width:1200px;margin:0 auto;padding:20px;}</style></head><body><div class="container"><header><h1>欢迎使用工具箱</h1><nav><ul><li><a href="/">首页</a></li><li><a href="/tools">工具</a></li><li><a href="/about">关于</a></li></ul></nav></header><main><section><h2>功能介绍</h2><p>这是一个功能强大的在线工具箱，提供各种实用工具。</p></section><section><h2>热门工具</h2><div class="card"><h3>JSON格式化</h3><p>快速格式化和压缩JSON数据</p></div><div class="card"><h3>二维码生成</h3><p>自定义二维码颜色和尺寸</p></div></section></main><footer><p>&copy; 2024 工具箱. All rights reserved.</p></footer></div></body></html>`;

// HTML 自闭合标签
const voidElements = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// HTML 格式化（美化）
function formatHTML(html: string, indentSize: number): string {
  if (!html.trim()) return "";

  const indent = " ".repeat(indentSize);
  let result = "";
  let indentLevel = 0;
  let i = 0;

  // 先标准化换行
  html = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // 移除多余空白（但保留标签内的内容）
  html = html.replace(/>\s+</g, "><");

  while (i < html.length) {
    // 处理标签
    if (html[i] === "<") {
      // 找到标签结束位置
      const endIndex = findTagEnd(html, i);
      if (endIndex === -1) {
        result += html.substring(i);
        break;
      }

      const tag = html.substring(i, endIndex + 1);
      const tagInfo = parseTag(tag);

      if (tagInfo.isComment) {
        // 注释
        result += "\n" + indent.repeat(indentLevel) + tag;
      } else if (tagInfo.isClosing) {
        // 闭合标签 - 减少缩进
        indentLevel = Math.max(0, indentLevel - 1);
        result += "\n" + indent.repeat(indentLevel) + tag;
      } else if (tagInfo.isSelfClosing || voidElements.has(tagInfo.tagName?.toLowerCase() || "")) {
        // 自闭合标签或空元素
        result += "\n" + indent.repeat(indentLevel) + tag;
      } else if (tagInfo.isOpening) {
        // 开始标签
        result += "\n" + indent.repeat(indentLevel) + tag;
        indentLevel++;
      } else {
        // DOCTYPE 等
        result += "\n" + indent.repeat(indentLevel) + tag;
      }

      i = endIndex + 1;
      continue;
    }

    // 处理文本内容
    const nextTag = html.indexOf("<", i);
    if (nextTag === -1) {
      const text = html.substring(i).trim();
      if (text) {
        result += "\n" + indent.repeat(indentLevel) + text;
      }
      break;
    }

    const text = html.substring(i, nextTag).trim();
    if (text) {
      // 短文本放在同一行
      if (text.length < 80 && !text.includes("\n")) {
        result += text;
      } else {
        result += "\n" + indent.repeat(indentLevel) + text;
      }
    }
    i = nextTag;
  }

  // 清理多余空行
  result = result.replace(/\n\s*\n\s*\n/g, "\n\n");
  result = result.replace(/^\n+/, "");

  return result;
}

// 找到标签的结束位置
function findTagEnd(html: string, start: number): number {
  let inString = false;
  let stringChar = "";

  for (let i = start + 1; i < html.length; i++) {
    const char = html[i];

    if ((char === '"' || char === "'") && html[i - 1] !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    if (!inString && char === ">") {
      return i;
    }
  }

  return -1;
}

// 解析标签信息
interface TagInfo {
  isOpening: boolean;
  isClosing: boolean;
  isSelfClosing: boolean;
  isComment: boolean;
  tagName: string | null;
}

function parseTag(tag: string): TagInfo {
  const info: TagInfo = {
    isOpening: false,
    isClosing: false,
    isSelfClosing: false,
    isComment: false,
    tagName: null,
  };

  // 注释
  if (tag.startsWith("<!--")) {
    info.isComment = true;
    return info;
  }

  // DOCTYPE
  if (tag.startsWith("<!")) {
    return info;
  }

  // 闭合标签
  if (tag.startsWith("</")) {
    info.isClosing = true;
    const match = tag.match(/^<\/\s*([a-zA-Z0-9-]+)/);
    if (match) info.tagName = match[1];
    return info;
  }

  // 开始标签
  if (tag.startsWith("<")) {
    info.isOpening = true;
    const match = tag.match(/^<\s*([a-zA-Z0-9-]+)/);
    if (match) info.tagName = match[1];
    // 自闭合
    if (tag.endsWith("/>")) {
      info.isSelfClosing = true;
    }
    return info;
  }

  return info;
}

// HTML 压缩（最小化）
function minifyHTML(html: string): string {
  if (!html.trim()) return "";

  let result = html;

  // 移除 HTML 注释（但保留条件注释）
  result = result.replace(/<!--[\s\S]*?-->/g, "");

  // 移除多余空白
  result = result.replace(/\s+/g, " ");

  // 移除标签之间的空白
  result = result.replace(/>\s+</g, "><");

  // 移除首尾空白
  result = result.trim();

  return result;
}

export default function HtmlFormatterPage() {
  const [input, setInput] = useState<string>(sampleHTML);
  const [output, setOutput] = useState<string>("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // 格式化 HTML
  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(formatHTML(input, indentSize));
  }, [input, indentSize]);

  // 压缩 HTML
  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(minifyHTML(input));
  }, [input]);

  // 复制结果
  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  // 下载文件
  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  // 清空
  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  // 加载示例
  const handleLoadExample = useCallback(() => {
    setInput(sampleHTML);
    setOutput("");
  }, []);

  // 计算行数
  const inputLineCount = input ? input.split("\n").length : 1;
  const outputLineCount = output ? output.split("\n").length : 1;

  // 统计信息
  const stats = useMemo(() => {
    const inputSize = new Blob([input]).size;
    const outputSize = new Blob([output]).size;
    const saved = inputSize > 0 && outputSize > 0
      ? (((inputSize - outputSize) / inputSize) * 100).toFixed(1)
      : "0";
    return { inputSize, outputSize, saved };
  }, [input, output]);

  return (
    <ToolLayout
      title="HTML 格式化/压缩工具"
      description="在线HTML代码格式化和压缩工具，支持美化、最小化、自定义缩进，一键复制和下载"
      toolId="html-formatter"
      icon={FileCode}
      category="开发工具"
      slug="html-formatter"
    >
      {/* 工具栏 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* 主要操作按钮 */}
          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
          >
            <Maximize2 className="w-4 h-4" />
            格式化
          </button>

          <button
            onClick={handleMinify}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            压缩
          </button>

          <button
            onClick={handleCopy}
            disabled={!output}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
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
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            下载文件
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={handleLoadExample}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            示例代码
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>

          <div className="flex-1" />

          {/* 缩进设置 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              缩进:
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setIndentSize(2)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  indentSize === 2
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                2 空格
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  indentSize === 4
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                4 空格
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 输入框 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                输入 HTML
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {inputLineCount} 行
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴或输入 HTML 代码..."
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-sm leading-6 resize-none outline-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600"
          />
        </div>

        {/* 输出框 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                输出结果
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {outputLineCount} 行
            </span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化或压缩后的结果将显示在这里..."
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-sm leading-6 resize-none outline-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600"
          />
        </div>
      </div>

      {/* 底部统计信息 */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          输入大小: {(stats.inputSize / 1024).toFixed(2)} KB
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          输出大小: {(stats.outputSize / 1024).toFixed(2)} KB
        </div>
        {output && input && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            体积变化: {stats.saved}%
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
