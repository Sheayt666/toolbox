"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Code2,
  Minimize2,
  Maximize2,
  Copy,
  Trash2,
  CheckCircle,
  Download,
  FileCode,
  Sparkles,
} from "lucide-react";

type IndentSize = 2 | 4;

const sampleCSS = `.container{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;}
.card{background:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.1);padding:32px;max-width:480px;width:100%;}
.card h1{font-size:24px;color:#333;margin-bottom:16px;}
.card p{font-size:14px;color:#666;line-height:1.6;}
.btn{display:inline-block;padding:12px 24px;background:#667eea;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;transition:all 0.3s ease;}
.btn:hover{background:#5568d3;transform:translateY(-2px);}`;

// CSS 格式化（美化）
function formatCSS(css: string, indentSize: number): string {
  if (!css.trim()) return "";

  const indent = " ".repeat(indentSize);
  let result = "";
  let indentLevel = 0;
  let inString = false;
  let stringChar = "";
  let i = 0;

  // 先进行基本清理
  css = css.replace(/\r\n/g, "\n");

  while (i < css.length) {
    const char = css[i];

    // 处理字符串
    if ((char === '"' || char === "'") && css[i - 1] !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      result += char;
      i++;
      continue;
    }

    if (inString) {
      result += char;
      i++;
      continue;
    }

    // 跳过多余空白
    if (/\s/.test(char)) {
      // 保留字符串内的空格已在上面处理
      // 这里处理代码中的空格
      if (char === "\n") {
        // 跳过换行
        i++;
        continue;
      }
      // 合并多个空格为一个
      if (result.length > 0 && /\s/.test(result[result.length - 1])) {
        i++;
        continue;
      }
      result += " ";
      i++;
      continue;
    }

    // 处理注释 /* ... */
    if (char === "/" && css[i + 1] === "*") {
      // 找到注释结束
      const endIndex = css.indexOf("*/", i + 2);
      if (endIndex !== -1) {
        const comment = css.substring(i, endIndex + 2);
        // 保留注释，放在合适的位置
        result += "\n" + indent.repeat(indentLevel) + comment + "\n";
        i = endIndex + 2;
        continue;
      }
    }

    // 处理 {
    if (char === "{") {
      result = result.trimEnd() + " {\n";
      indentLevel++;
      i++;
      continue;
    }

    // 处理 }
    if (char === "}") {
      indentLevel = Math.max(0, indentLevel - 1);
      result = result.trimEnd() + "\n" + indent.repeat(indentLevel) + "}\n";
      i++;
      continue;
    }

    // 处理 ;
    if (char === ";") {
      result += ";\n" + indent.repeat(indentLevel);
      i++;
      continue;
    }

    // 处理 : （在属性中）
    if (char === ":") {
      // 检查是否在选择器中（简单判断：前面没有 { 或者有 }）
      result += ": ";
      i++;
      continue;
    }

    // 处理 , （选择器分隔）
    if (char === ",") {
      result = result.trimEnd() + ",\n" + indent.repeat(indentLevel);
      i++;
      continue;
    }

    result += char;
    i++;
  }

  // 清理多余空行
  result = result.replace(/\n\s*\n\s*\n/g, "\n\n");
  result = result.replace(/^\s+|\s+$/g, "");

  return result;
}

// CSS 压缩（最小化）
function minifyCSS(css: string): string {
  if (!css.trim()) return "";

  let result = css;

  // 移除注释 /* ... */
  result = result.replace(/\/\*[\s\S]*?\*\//g, "");

  // 移除多余空白
  result = result.replace(/\s+/g, " ");

  // 移除 { 前后的空格
  result = result.replace(/\s*{\s*/g, "{");

  // 移除 } 前后的空格
  result = result.replace(/\s*}\s*/g, "}");

  // 移除 ; 前后的空格（但保留属性值中的空格）
  result = result.replace(/\s*;\s*/g, ";");

  // 移除 : 前后的空格（属性名和属性值之间）
  result = result.replace(/:\s*/g, ":");

  // 移除 , 前后的空格（选择器之间）
  result = result.replace(/\s*,\s*/g, ",");

  // 移除最后一个 ; 在 } 之前
  result = result.replace(/;}/g, "}");

  // 移除首尾空白
  result = result.trim();

  return result;
}

export default function CssFormatterPage() {
  const [input, setInput] = useState<string>(sampleCSS);
  const [output, setOutput] = useState<string>("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // 格式化 CSS
  const handleFormat = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(formatCSS(input, indentSize));
  }, [input, indentSize]);

  // 压缩 CSS
  const handleMinify = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(minifyCSS(input));
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
    const blob = new Blob([output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-${Date.now()}.css`;
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
    setInput(sampleCSS);
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
      title="CSS 格式化/压缩工具"
      description="在线CSS代码格式化和压缩工具，支持美化、最小化、自定义缩进，一键复制和下载"
      toolId="css-formatter"
      icon={Code2}
      category="开发工具"
      slug="css-formatter"
    >
      {/* 工具栏 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* 主要操作按钮 */}
          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
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
              <Code2 className="w-4 h-4 text-sky-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                输入 CSS
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {inputLineCount} 行
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴或输入 CSS 代码..."
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
          <span className="w-2 h-2 rounded-full bg-sky-400" />
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
