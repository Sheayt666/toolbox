"use client";

import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Table2, Copy, Check, Trash2, Info, Download, ArrowRightLeft, FileJson, Table } from "lucide-react";

type ConvertDirection = "json-to-csv" | "csv-to-json";
type Delimiter = "," | "\t" | ";";

const sampleJson = `[
  { "name": "张三", "age": 28, "city": "北京", "score": 95 },
  { "name": "李四", "age": 32, "city": "上海", "score": 88 },
  { "name": "王五", "age": 25, "city": "广州", "score": 92 }
]`;

const sampleCsv = `name,age,city,score
张三,28,北京,95
李四,32,上海,88
王五,25,广州,92`;

// JSON to CSV conversion
function jsonToCsv(jsonStr: string, delimiter: string): { csv: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);

    if (!Array.isArray(data)) {
      return { csv: "", error: "JSON 必须是数组格式" };
    }

    if (data.length === 0) {
      return { csv: "", error: "JSON 数组不能为空" };
    }

    // Collect all keys from all objects
    const headers = new Set<string>();
    for (const item of data) {
      if (typeof item !== "object" || item === null) {
        return { csv: "", error: "数组元素必须是对象" };
      }
      for (const key of Object.keys(item)) {
        headers.add(key);
      }
    }

    const headerArray = Array.from(headers);

    // Escape CSV value
    const escapeValue = (value: any): string => {
      if (value === null || value === undefined) return "";
      let str = String(value);
      if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    // Build CSV rows
    const rows: string[] = [];
    rows.push(headerArray.map((h) => escapeValue(h)).join(delimiter));

    for (const item of data) {
      const row = headerArray.map((key) => {
        const value = item[key];
        if (typeof value === "object" && value !== null) {
          return escapeValue(JSON.stringify(value));
        }
        return escapeValue(value);
      });
      rows.push(row.join(delimiter));
    }

    return { csv: rows.join("\n") };
  } catch (e) {
    return { csv: "", error: (e as Error).message };
  }
}

// CSV to JSON conversion
function csvToJson(csvStr: string, delimiter: string): { json: string; error?: string } {
  try {
    if (!csvStr.trim()) {
      return { json: "", error: "请输入 CSV 数据" };
    }

    // Parse CSV with proper quote handling
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (inQuotes) {
          if (char === '"') {
            if (line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            current += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === delimiter) {
            result.push(current);
            current = "";
          } else {
            current += char;
          }
        }
      }
      result.push(current);
      return result;
    };

    // Handle both \n and \r\n line endings
    const lines = csvStr.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim() !== "");

    if (lines.length < 2) {
      return { json: "", error: "CSV 至少需要表头和一行数据" };
    }

    const headers = parseLine(lines[0]);
    const data: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const obj: Record<string, any> = {};

      for (let j = 0; j < headers.length; j++) {
        const key = headers[j] || `column${j}`;
        const value = values[j] ?? "";

        // Try to auto-convert numbers
        if (value !== "" && !isNaN(Number(value)) && value.trim() !== "") {
          obj[key] = Number(value);
        } else if (value === "true") {
          obj[key] = true;
        } else if (value === "false") {
          obj[key] = false;
        } else if (value === "null") {
          obj[key] = null;
        } else {
          obj[key] = value;
        }
      }

      data.push(obj);
    }

    return { json: JSON.stringify(data, null, 2) };
  } catch (e) {
    return { json: "", error: (e as Error).message };
  }
}

export default function JsonCsvConverterPage() {
  const [direction, setDirection] = useState<ConvertDirection>("json-to-csv");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [input, setInput] = useState(sampleJson);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const output = useMemo(() => {
    setError(null);
    if (!input.trim()) return "";

    if (direction === "json-to-csv") {
      const result = jsonToCsv(input, delimiter);
      if (result.error) {
        setError(result.error);
        return "";
      }
      return result.csv;
    } else {
      const result = csvToJson(input, delimiter);
      if (result.error) {
        setError(result.error);
        return "";
      }
      return result.json;
    }
  }, [input, direction, delimiter]);

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
    const filename = direction === "json-to-csv" ? "output.csv" : "output.json";
    const mimeType = direction === "json-to-csv" ? "text/csv" : "application/json";
    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, direction]);

  const handleClear = () => {
    setInput("");
    setError(null);
  };

  const handleLoadExample = () => {
    if (direction === "json-to-csv") {
      setInput(sampleJson);
    } else {
      setInput(sampleCsv);
    }
  };

  const handleSwap = () => {
    const newDirection = direction === "json-to-csv" ? "csv-to-json" : "json-to-csv";
    setDirection(newDirection);
    // Swap input and output if output exists
    if (output && !error) {
      setInput(output);
    } else {
      setInput(newDirection === "json-to-csv" ? sampleJson : sampleCsv);
    }
  };

  const delimiterLabel: Record<Delimiter, string> = {
    ",": "逗号 (,)",
    "\t": "制表符 (Tab)",
    ";": "分号 (;)",
  };

  return (
    <ToolLayout
      title="JSON CSV 转换"
      description="JSON和CSV格式互转，支持自定义分隔符，格式化输出和文件下载，数据本地处理安全可靠"
      toolId="json-csv-converter"
      icon={Table2}
      category="开发工具"
      slug="json-csv-converter"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 转换模式选择 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-teal-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  转换设置
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                >
                  <FileJson className="w-4 h-4" />
                  加载示例
                </button>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* 转换方向 */}
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
              <button
                onClick={() => {
                  setDirection("json-to-csv");
                  if (direction === "csv-to-json") {
                    setInput(sampleJson);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  direction === "json-to-csv"
                    ? "bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <FileJson className="w-4 h-4" />
                JSON → CSV
              </button>
              <button
                onClick={handleSwap}
                className="p-2 text-zinc-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                title="交换方向"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setDirection("csv-to-json");
                  if (direction === "json-to-csv") {
                    setInput(sampleCsv);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  direction === "csv-to-json"
                    ? "bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Table className="w-4 h-4" />
                CSV → JSON
              </button>
            </div>

            {/* 分隔符选择 */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">分隔符：</span>
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                {(Object.keys(delimiterLabel) as Delimiter[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDelimiter(d)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      delimiter === d
                        ? "bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    {delimiterLabel[d]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                转换错误
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 输入 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {direction === "json-to-csv" ? (
                    <FileJson className="w-4 h-4 text-teal-500" />
                  ) : (
                    <Table className="w-4 h-4 text-teal-500" />
                  )}
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {direction === "json-to-csv" ? "JSON 输入" : "CSV 输入"}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {input.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === "json-to-csv" ? '在此输入 JSON 数组，例如：\n[\n  { "name": "张三", "age": 28 }\n]' : '在此输入 CSV 数据，例如：\nname,age\n张三,28'}
              spellCheck={false}
              className="w-full h-80 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          {/* 输出 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {direction === "json-to-csv" ? (
                    <Table className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <FileJson className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {direction === "json-to-csv" ? "CSV 输出" : "JSON 输出"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={!output}
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载
                  </button>
                  <button
                    onClick={handleCopy}
                    disabled={!output}
                    className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {copied ? (
                      <><Check className="w-3.5 h-3.5" /> 已复制</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> 复制</>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="转换结果将显示在这里..."
              spellCheck={false}
              className="w-full h-80 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none font-mono text-sm"
            />
          </div>
        </div>

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              JSON CSV 转换工具可以快速在 JSON 和 CSV 两种数据格式之间互相转换。
              JSON 结构灵活，适合复杂数据；CSV 简单直观，适合表格数据和 Excel 导入导出。
              所有转换在浏览器本地完成，数据不会上传到服务器，保护您的隐私安全。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
                <div className="text-sm font-medium text-teal-700 dark:text-teal-300">双向转换</div>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">JSON转CSV / CSV转JSON</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">自定义分隔符</div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">逗号 / 制表符 / 分号</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">文件下载</div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">一键下载转换结果</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
