"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Braces,
  Minimize2,
  Maximize2,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type IndentSize = 2 | 4;

interface ValidationResult {
  valid: boolean;
  error?: string;
  errorLine?: number;
  errorColumn?: number;
}

export default function JsonFormatterPage() {
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // 校验 JSON 是否合法
  const validateJson = useCallback((text: string): ValidationResult => {
    if (!text.trim()) {
      return { valid: false, error: "请输入 JSON 数据" };
    }
    try {
      JSON.parse(text);
      return { valid: true };
    } catch (e) {
      const err = e as SyntaxError;
      const match = err.message.match(/position (\d+)/);
      let errorLine: number | undefined;
      let errorColumn: number | undefined;

      if (match) {
        const position = parseInt(match[1], 10);
        const lines = text.substring(0, position).split("\n");
        errorLine = lines.length;
        errorColumn = lines[lines.length - 1].length + 1;
      }

      return {
        valid: false,
        error: err.message,
        errorLine,
        errorColumn,
      };
    }
  }, []);

  // 格式化 JSON（美化）
  const handleFormat = useCallback(() => {
    const result = validateJson(input);
    setValidation(result);

    if (result.valid) {
      try {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed, null, indentSize));
      } catch {
        // should not happen since we already validated
      }
    }
  }, [input, indentSize, validateJson]);

  // 压缩 JSON
  const handleMinify = useCallback(() => {
    const result = validateJson(input);
    setValidation(result);

    if (result.valid) {
      try {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed));
      } catch {
        // should not happen
      }
    }
  }, [input, validateJson]);

  // 复制结果
  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
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

  // 清空
  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setValidation(null);
  }, []);

  // 实时校验（防抖风格，直接计算但不频繁）
  const liveValidation = useMemo(() => {
    if (!input.trim()) return null;
    return validateJson(input);
  }, [input, validateJson]);

  // 计算输入框行数
  const inputLineCount = input ? input.split("\n").length : 1;
  const outputLineCount = output ? output.split("\n").length : 1;

  return (
    <ToolLayout
      title="JSON 格式化工具"
      description="在线JSON格式化、压缩、校验工具，支持树状视图展示，快速美化和压缩JSON数据"
      icon={Braces}
      category="开发工具"
      slug="json-formatter"
    >
      {/* 工具栏 */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* 主要操作按钮 */}
          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors shadow-sm hover:shadow-md"
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
            onClick={handleClear}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 font-medium rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Tab 缩进设置 */}
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

      {/* 校验状态提示 */}
      {validation && !validation.valid && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              JSON 格式错误
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {validation.error}
              {validation.errorLine && (
                <span className="ml-2">
                  （第 {validation.errorLine} 行
                  {validation.errorColumn && `，第 ${validation.errorColumn} 列`}
                  ）
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {validation && validation.valid && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            JSON 格式正确
          </p>
        </div>
      )}

      {/* 实时校验提示（轻量） */}
      {!validation && liveValidation && !liveValidation.valid && input.trim() && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            实时提示：{liveValidation.error}
          </p>
        </div>
      )}

      {/* 编辑器区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 输入框 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Braces className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                输入 JSON
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {inputLineCount} 行
            </span>
          </div>
          <div className="relative">
            {/* 行号 */}
            <div
              className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 text-right pr-3 pt-4 text-xs text-slate-400 dark:text-slate-600 font-mono select-none overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: inputLineCount }, (_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setValidation(null);
              }}
              placeholder='在此粘贴或输入 JSON 数据，例如：
{
  "name": "工具箱",
  "version": "1.0.0",
  "features": ["格式化", "压缩", "校验"]
}'
              spellCheck={false}
              className="w-full h-[500px] pl-14 pr-4 py-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-sm leading-6 resize-none outline-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>
        </div>

        {/* 中间箭头（仅移动端显示在上方） */}
        <div className="lg:hidden flex justify-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-indigo-500 rotate-90 lg:rotate-0" />
          </div>
        </div>

        {/* 输出框 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Braces className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                输出结果
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {outputLineCount} 行
            </span>
          </div>
          <div className="relative">
            {/* 行号 */}
            <div
              className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 text-right pr-3 pt-4 text-xs text-slate-400 dark:text-slate-600 font-mono select-none overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: outputLineCount }, (_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="格式化或压缩后的结果将显示在这里..."
              spellCheck={false}
              className="w-full h-[500px] pl-14 pr-4 py-4 bg-transparent text-slate-800 dark:text-slate-200 font-mono text-sm leading-6 resize-none outline-none focus:ring-0 placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>
        </div>
      </div>

      {/* 底部统计信息 */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          输入字符数: {input.length}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          输出字符数: {output.length}
        </div>
        {output && input && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            压缩比:{" "}
            {input.length > 0
              ? ((output.length / input.length) * 100).toFixed(1)
              : 0}
            %
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
