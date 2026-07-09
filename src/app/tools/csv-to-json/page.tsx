"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Table2, FileJson, Download } from "lucide-react";

type Delimiter = "," | "\t" | ";";

const sampleCsv = `name,age,city,score
张三,28,北京,95
李四,32,上海,88
王五,25,广州,92`;

function csvToJson(csvStr: string, delimiter: string): { json: string; error?: string } {
  try {
    if (!csvStr.trim()) {
      return { json: "", error: "请输入 CSV 数据" };
    }

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

export default function CsvToJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState<Delimiter>(",");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = csvToJson(input, delimiter);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.json);
    }
  }, [input, delimiter]);

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
    setInput(sampleCsv);
  }, []);

  const delimiterLabel: Record<Delimiter, string> = {
    ",": "逗号 (,)",
    "\t": "制表符 (Tab)",
    ";": "分号 (;)",
  };

  return (
    <ToolLayout
      title="CSV 转 JSON"
      description="在线 CSV 转 JSON 工具，快速将 CSV 表格数据转换为 JSON 数组格式，支持自定义分隔符"
      icon={Table2}
      category="开发工具"
      slug="csv-to-json"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">CSV → JSON 转换</span>
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
          <span className="text-sm text-slate-400">分隔符：</span>
          <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
            {(Object.keys(delimiterLabel) as Delimiter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDelimiter(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  delimiter === d
                    ? "bg-[#27272a] text-amber-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {delimiterLabel[d]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">CSV 输入</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`在此输入 CSV 数据，例如：
name,age
张三,28
李四,32`}
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
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
          <li>• CSV 第一行作为表头，后续行作为数据，自动识别数字和布尔值</li>
          <li>• 支持逗号、制表符、分号三种分隔符，可根据需要选择</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
