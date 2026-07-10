"use client";

import { useState, useMemo, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileSpreadsheet, Upload, Copy, Check, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function parseCsv(text: string, delimiter = ","): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === delimiter) { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function tryParseValue(v: string): unknown {
  if (v === "") return "";
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  const num = Number(v);
  if (v !== "" && !isNaN(num)) return num;
  return v;
}

export default function ExcelToJsonPage() {
  const [csvText, setCsvText] = useState("姓名,年龄,城市,薪资\n张三,28,北京,15000\n李四,34,上海,22000\n王五,22,广州,9000");
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeader, setHasHeader] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const json = useMemo(() => {
    const rows = parseCsv(csvText, delimiter);
    if (rows.length === 0) return "[]";
    if (hasHeader) {
      const headers = rows[0];
      const data = rows.slice(1).map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => { obj[h] = tryParseValue(row[i] ?? ""); });
        return obj;
      });
      return JSON.stringify(data, null, 2);
    }
    return JSON.stringify(rows.map((r) => r.map(tryParseValue)), null, 2);
  }, [csvText, delimiter, hasHeader]);

  const onFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCsvText(reader.result as string);
    reader.readAsText(file);
  };

  const copy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (fileName || "data").replace(/\.\w+$/, "") + ".json";
    a.click();
  };

  const rowCount = parseCsv(csvText, delimiter).length;

  return (
    <ToolLayout
      title="Excel转JSON"
      description="将Excel表格数据转换为JSON"
      icon={FileSpreadsheet}
      category="转换工具"
      slug="excel-to-json"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-5 text-center cursor-pointer hover:border-primary-500/50"
        >
          <input ref={fileRef} type="file" accept=".csv,.txt,.tsv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1" />
          <p className="text-sm text-slate-400">{fileName ? `已加载：${fileName}` : "上传 CSV/TSV 文件（Excel 可另存为 CSV）"}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">分隔符</label>
            <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className={inputClass}>
              <option value=",">逗号 ,</option>
              <option value={"\t"}>制表符 Tab</option>
              <option value=";">分号 ;</option>
              <option value="|">竖线 |</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer pb-2.5">
              <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="accent-primary-500" />
              首行为表头
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">表格内容（{rowCount} 行）</label>
          <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={6} className={inputClass + " resize-y font-mono"} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">JSON 输出</label>
            <div className="flex gap-3">
              <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
              </button>
              <button onClick={download} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> 下载
              </button>
            </div>
          </div>
          <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-emerald-300 font-mono whitespace-pre-wrap break-all max-h-80 overflow-auto">{json}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
