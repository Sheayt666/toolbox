"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, FileText, Minimize2, Maximize2 } from "lucide-react";

type IndentSize = 2 | 4;

// Simple YAML formatter (normalizes indentation)
function formatYaml(yaml: string, indentSize: number): { result: string; error?: string } {
  try {
    const lines = yaml.replace(/\r\n/g, "\n").split("\n");
    const indentUnit = " ".repeat(indentSize);

    // Parse YAML and re-format with consistent indentation
    const result: string[] = [];
    let currentIndent = 0;

    // Track indent levels based on content
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty lines
      if (trimmed === "") {
        result.push("");
        continue;
      }

      // Comments
      if (trimmed.startsWith("#")) {
        result.push(indentUnit.repeat(currentIndent) + trimmed);
        continue;
      }

      // Calculate original indent
      const originalIndent = line.length - line.trimStart().length;

      // List item
      if (trimmed.startsWith("- ")) {
        // Adjust indent level
        const indentLevel = Math.floor(originalIndent / 2);
        currentIndent = indentLevel;
        result.push(indentUnit.repeat(indentLevel) + "- " + trimmed.substring(2).trim());
      } else if (trimmed === "-") {
        const indentLevel = Math.floor(originalIndent / 2);
        currentIndent = indentLevel;
        result.push(indentUnit.repeat(indentLevel) + "-");
      } else {
        // Key: value pair
        const colonIndex = findColon(trimmed);
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();

          const indentLevel = Math.floor(originalIndent / 2);
          currentIndent = indentLevel;

          if (value === "") {
            result.push(indentUnit.repeat(indentLevel) + key + ":");
          } else {
            result.push(indentUnit.repeat(indentLevel) + key + ": " + value);
          }
        } else {
          // Continuation line or other
          const indentLevel = Math.floor(originalIndent / 2);
          result.push(indentUnit.repeat(indentLevel) + trimmed);
        }
      }
    }

    return { result: result.join("\n") };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function findColon(str: string): number {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
    if (str[i] === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
    if (str[i] === ":" && !inSingleQuote && !inDoubleQuote) {
      return i;
    }
  }
  return -1;
}

function minifyYaml(yaml: string): { result: string; error?: string } {
  try {
    // Convert YAML to single-line JSON-like representation
    // For YAML minification, we'll just remove comments and empty lines
    const lines = yaml.replace(/\r\n/g, "\n").split("\n");
    const result: string[] = [];

    for (const line of lines) {
      let processed = line;
      // Remove comments (but not inside quotes)
      let inSingleQuote = false;
      let inDoubleQuote = false;
      let commentPos = -1;
      for (let j = 0; j < processed.length; j++) {
        if (processed[j] === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
        if (processed[j] === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if (processed[j] === "#" && !inSingleQuote && !inDoubleQuote) {
          commentPos = j;
          break;
        }
      }
      if (commentPos >= 0) {
        processed = processed.substring(0, commentPos);
      }
      // Trim trailing whitespace
      processed = processed.trimEnd();
      if (processed.trim() !== "") {
        result.push(processed);
      }
    }

    return { result: result.join("\n") };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export default function YamlFormatterPage() {
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
    const result = formatYaml(input, indentSize);
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
    const result = minifyYaml(input);
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
    setInput(`name: 工具箱
version: 1.0.0
features:
  - 格式化
  - 转换
  - 生成
config:
  theme: dark
  language: zh-CN
  autoSave: true
  # 这是注释
  plugins:
    - name: plugin1
      enabled: true
    - name: plugin2
      enabled: false`);
  }, []);

  return (
    <ToolLayout
      title="YAML 格式化"
      description="在线 YAML 格式化工具，支持美化和清理 YAML 代码，统一缩进风格"
      icon={FileText}
      category="开发工具"
      slug="yaml-formatter"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">YAML 格式化/清理</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">缩进:</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setIndentSize(2)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 2
                    ? "bg-[#27272a] text-purple-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2 空格
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 4
                    ? "bg-[#27272a] text-purple-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                4 空格
              </button>
            </div>
          </div>

          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
          >
            <Maximize2 className="w-4 h-4" />
            格式化
          </button>

          <button
            onClick={handleMinify}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            清理
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
            <label className="text-sm font-medium text-slate-300">输入 YAML</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴或输入 YAML 数据..."
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输出结果</label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化结果将显示在这里..."
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
          <li>• 格式化功能统一缩进风格，支持 2 空格和 4 空格两种缩进</li>
          <li>• 清理功能可移除注释和空行，保留核心配置内容</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
