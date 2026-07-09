"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, FileJson, Table2, Download } from "lucide-react";

type Delimiter = "," | "\t" | ";";

const sampleJson = `[
  { "name": "张三", "age": 28, "city": "北京", "score": 95 },
  { "name": "李四", "age": 32, "city": "上海", "score": 88 },
  { "name": "王五", "age": 25, "city": "广州", "score": 92 }
]`;

function jsonToCsv(jsonStr: string, delimiter: string): { csv: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) {
      return { csv: "", error: "JSON 必须是数组格式" };
    }
    if (data.length === 0) {
      return { csv: "", error: "JSON 数组不能为空" };
    }

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

    const escapeValue = (value: any): string => {
      if (value === null || value === undefined) return "";
      let str = String(value);
      if (str.includes(delimiter) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

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

export default function JsonToCsvPage() {
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
    const result = jsonToCsv(input, delimiter);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.csv);
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
    const blob = new Blob(["\ufeff" + output], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput(sampleJson);
  }, []);

  const delimiterLabel: Record<Delimiter, string> = {
    ",": "逗号 (,)",
    "\t": "制表符 (Tab)",
    ";": "分号 (;)",
  };

  return (
    <ToolLayout
      title="JSON 转 CSV"
      description="在线 JSON 转 CSV 工具，快速将 JSON 数组转换为 CSV 表格格式，支持自定义分隔符"
      icon={Table2}
      category="开发工具"
      slug="json-to-csv"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">JSON → CSV 转换</span>
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
                    ? "bg-[#27272a] text-emerald-400"
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
            <label className="text-sm font-medium text-slate-300">JSON 输入</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='在此输入 JSON 数组，例如：
[
  { "name": "张三", "age": 28 }
]'
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
            >
              转换为 CSV
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">CSV 输出</label>
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
              title="下载 CSV 文件"
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
          <li>• JSON 必须是对象数组格式，每个对象的属性将作为 CSV 列</li>
          <li>• 支持逗号、制表符、分号三种分隔符，可根据需要选择</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
