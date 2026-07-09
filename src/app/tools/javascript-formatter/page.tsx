"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Code2, Minimize2, Maximize2 } from "lucide-react";

type IndentSize = 2 | 4;

// Simple JavaScript formatter using basic tokenization
function formatJs(code: string, indentSize: number): { result: string; error?: string } {
  try {
    if (!code.trim()) {
      return { result: "" };
    }

    // Try to validate JS parser approach: use a simple formatting algorithm
    const indent = " ".repeat(indentSize);
    let result = "";
    let indentLevel = 0;
    let inString = false;
    let stringChar = "";
    let inComment = false;
    let commentType = "";
    let currentLine = "";
    let prevChar = "";

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const nextChar = code[i + 1];

      // Handle comments
      if (!inString && !inComment) {
        if (char === "/" && nextChar === "/") {
          inComment = true;
          commentType = "//";
          currentLine += "//";
          i++;
          continue;
        }
        if (char === "/" && nextChar === "*") {
          inComment = true;
          commentType = "/*";
          currentLine += "/*";
          i++;
          continue;
        }
      }

      if (inComment) {
        currentLine += char;
        if (commentType === "//" && char === "\n") {
          result += currentLine;
          currentLine = "";
          inComment = false;
          commentType = "";
        } else if (commentType === "/*" && prevChar === "*" && char === "/") {
          inComment = false;
          commentType = "";
        }
        prevChar = char;
        continue;
      }

      // Handle strings
      if (inString) {
        currentLine += char;
        if (char === stringChar && prevChar !== "\\") {
          inString = false;
        }
        prevChar = char;
        continue;
      }

      if (char === "'" || char === '"' || char === "`") {
        inString = true;
        stringChar = char;
        currentLine += char;
        prevChar = char;
        continue;
      }

      // Handle braces
      if (char === "{") {
        currentLine += " {";
        result += currentLine.trimStart() ? indent.repeat(indentLevel) + currentLine.trimStart() + "\n" : "";
        if (result.endsWith("\n")) {}
        indentLevel++;
        currentLine = "";
        prevChar = char;
        continue;
      }

      if (char === "}") {
        if (currentLine.trim()) {
          result += indent.repeat(indentLevel) + currentLine.trim() + "\n";
          currentLine = "";
        }
        indentLevel = Math.max(0, indentLevel - 1);
        result += indent.repeat(indentLevel) + "}";
        // Check for next non-whitespace
        let j = i + 1;
        while (j < code.length && /\s/.test(code[j])) j++;
        if (code[j] === "," || code[j] === ";") {
          // keep on same line logic
        } else {
          result += "\n";
        }
        prevChar = char;
        continue;
      }

      // Handle semicolons
      if (char === ";") {
        currentLine += ";";
        if (currentLine.trim()) {
          result += indent.repeat(indentLevel) + currentLine.trim() + "\n";
          currentLine = "";
        }
        prevChar = char;
        continue;
      }

      // Handle newlines in input
      if (char === "\n") {
        if (currentLine.trim()) {
          result += indent.repeat(indentLevel) + currentLine.trim() + "\n";
          currentLine = "";
        }
        prevChar = char;
        continue;
      }

      // Regular character
      currentLine += char;
      prevChar = char;
    }

    if (currentLine.trim()) {
      result += indent.repeat(indentLevel) + currentLine.trim() + "\n";
    }

    // Second pass: better formatting
    result = result
      .split("\n")
      .map(line => line.trimEnd())
      .filter((line, index, arr) => {
        // Remove multiple empty lines
        if (line === "" && index > 0 && arr[index - 1] === "") return false;
        return true;
      })
      .join("\n")
      .trim();

    return { result };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function minifyJs(code: string): { result: string; error?: string } {
  try {
    if (!code.trim()) {
      return { result: "" };
    }

    let result = code;
    
    // Remove single-line comments
    result = result.replace(/\/\/.*$/gm, "");
    // Remove multi-line comments
    result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    // Remove newlines and extra whitespace
    result = result.replace(/\s+/g, " ");
    // Remove spaces around operators and punctuation
    result = result.replace(/\s*([{};,=+\-*/<>!&|?:])\s*/g, "$1");
    // Fix some edge cases
    result = result.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, "$1(");

    return { result: result.trim() };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export default function JavascriptFormatterPage() {
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
    const result = formatJs(input, indentSize);
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
    const result = minifyJs(input);
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
    setInput(`function greet(name) {
if (name) {
console.log("Hello, " + name + "!");
} else {
console.log("Hello, World!");
}
}
const user = {name: "张三",age: 28,city: "北京"};
greet(user.name);`);
  }, []);

  return (
    <ToolLayout
      title="JavaScript 格式化"
      description="在线 JavaScript 代码格式化/压缩工具，美化 JS 代码，一键压缩减小体积"
      icon={Code2}
      category="开发工具"
      slug="javascript-formatter"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">JavaScript 格式化/压缩</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">缩进:</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setIndentSize(2)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 2
                    ? "bg-[#27272a] text-yellow-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2 空格
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 4
                    ? "bg-[#27272a] text-yellow-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                4 空格
              </button>
            </div>
          </div>

          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-yellow-500/25"
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
            <label className="text-sm font-medium text-slate-300">输入 JS 代码</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴或输入 JavaScript 代码..."
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 outline-none resize-none transition-all"
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
          <li>• 支持 JavaScript 代码美化和压缩，一键切换</li>
          <li>• 自动识别代码结构，调整缩进和换行</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
