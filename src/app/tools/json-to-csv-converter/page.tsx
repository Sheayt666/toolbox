"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileJson, ArrowRightLeft, Copy, Check, Download, AlertCircle } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function jsonToCsv(jsonStr: string): { csv: string; error: string | null } {
  try {
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return { csv: "", error: null };
    const headers: string[] = [];
    arr.forEach((obj) => {
      if (typeof obj === "object" && obj !== null) {
        Object.keys(obj).forEach((k) => { if (!headers.includes(k)) headers.push(k); });
      }
    });
    const escape = (v: unknown) => {
      if (v === null || v === undefined) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    arr.forEach((obj) => {
      const row = headers.map((h) => escape((obj as Record<string, unknown>)?.[h]));
      lines.push(row.join(","));
    });
    return { csv: lines.join("\n"), error: null };
  } catch (e) {
    return { csv: "", error: (e as Error).message };
  }
}

function csvToJson(csvStr: string): { json: string; error: string | null } {
  try {
    const lines = csvStr.trim().split(/\r?\n/);
    if (lines.length < 1) return { json: "[]", error: null };
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inQ) {
          if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
          else if (c === '"') inQ = false;
          else cur += c;
        } else {
          if (c === '"') inQ = true;
          else if (c === ",") { result.push(cur); cur = ""; }
          else cur += c;
        }
      }
      result.push(cur);
      return result;
    };
    const headers = parseLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const cells = parseLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
      return obj;
    });
    return { json: JSON.stringify(rows, null, 2), error: null };
  } catch (e) {
    return { json: "", error: (e as Error).message };
  }
}

export default function JsonToCsvConverterPage() {
  const [mode, setMode] = useState<"j2c" | "c2j">("j2c");
  const [input, setInput] = useState(`[
  {"name": "张三", "age": "28", "city": "北京"},
  {"name": "李四", "age": "34", "city": "上海"}
]`);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    return mode === "j2c" ? jsonToCsv(input) : csvToJson(input);
  }, [input, mode]);

  const copy = () => {
    navigator.clipboard.writeText(("csv" in result ? result.csv : result.json) || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const content = "csv" in result ? result.csv : result.json;
    const ext = mode === "j2c" ? "csv" : "json";
    const blob = new Blob([mode === "j2c" ? "\uFEFF" + content : content], { type: `text/${ext};charset=utf-8` });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `converted.${ext}`;
    a.click();
  };

  return (
    <ToolLayout
      title="JSON转CSV"
      description="JSON数据与CSV格式互相转换"
      icon={FileJson}
      category="开发工具"
      slug="json-to-csv-converter"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("j2c")}
            className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-colors ${
              mode === "j2c" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"
            }`}
          >
            JSON → CSV
          </button>
          <button
            onClick={() => setMode("c2j")}
            className={`flex-1 px-4 py-2 text-sm rounded-lg border transition-colors ${
              mode === "c2j" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"
            }`}
          >
            CSV → JSON
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">{mode === "j2c" ? "JSON 输入" : "CSV 输入"}</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            className={inputClass + " resize-y font-mono"}
          />
        </div>

        {result.error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {result.error}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">{mode === "j2c" ? "CSV 输出" : "JSON 输出"}</label>
            <div className="flex gap-3">
              <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
              </button>
              <button onClick={download} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> 下载
              </button>
            </div>
          </div>
          <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap break-all min-h-[80px] max-h-80 overflow-auto">
            {result.error ? "" : ("csv" in result ? result.csv : result.json)}
          </pre>
        </div>
      </div>
    </ToolLayout>
  );
}
