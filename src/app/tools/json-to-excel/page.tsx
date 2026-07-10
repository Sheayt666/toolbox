"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Table2, Copy, Check, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function escapeCsv(v: unknown): string {
  const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function jsonToCsv(jsonStr: string, flat: boolean): { csv: string; error: string | null } {
  try {
    const data = JSON.parse(jsonStr);
    const arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return { csv: "", error: null };

    if (flat) {
      // 扁平化嵌套对象
      const flatObj = (obj: Record<string, unknown>, prefix = ""): Record<string, string> => {
        const result: Record<string, string> = {};
        Object.entries(obj).forEach(([k, v]) => {
          const key = prefix ? `${prefix}.${k}` : k;
          if (v !== null && typeof v === "object" && !Array.isArray(v)) {
            Object.assign(result, flatObj(v as Record<string, unknown>, key));
          } else if (Array.isArray(v)) {
            result[key] = v.map((x) => (typeof x === "object" ? JSON.stringify(x) : String(x))).join(";");
          } else {
            result[key] = String(v);
          }
        });
        return result;
      };
      const flatArr = arr.map((o) => flatObj(o as Record<string, unknown>));
      const headers: string[] = [];
      flatArr.forEach((o) => Object.keys(o).forEach((k) => { if (!headers.includes(k)) headers.push(k); }));
      const lines = [headers.map(escapeCsv).join(",")];
      flatArr.forEach((o) => lines.push(headers.map((h) => escapeCsv(o[h])).join(",")));
      return { csv: lines.join("\n"), error: null };
    }

    const headers: string[] = [];
    arr.forEach((obj) => {
      if (typeof obj === "object" && obj !== null) {
        Object.keys(obj).forEach((k) => { if (!headers.includes(k)) headers.push(k); });
      }
    });
    const lines = [headers.map(escapeCsv).join(",")];
    arr.forEach((obj) => {
      const row = headers.map((h) => escapeCsv((obj as Record<string, unknown>)?.[h]));
      lines.push(row.join(","));
    });
    return { csv: lines.join("\n"), error: null };
  } catch (e) {
    return { csv: "", error: (e as Error).message };
  }
}

export default function JsonToExcelPage() {
  const [json, setJson] = useState(`[
  {"商品": "苹果", "价格": 5.5, "库存": 120, "供应商": {"名称": "果园A", "地区": "山东"}},
  {"商品": "香蕉", "价格": 3.2, "库存": 85, "供应商": {"名称": "果园B", "地区": "海南"}},
  {"商品": "橙子", "价格": 6.8, "库存": 60, "供应商": {"名称": "果园C", "地区": "江西"}}
]`);
  const [flat, setFlat] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => jsonToCsv(json, flat), [json, flat]);

  const copy = () => {
    navigator.clipboard.writeText(result.csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob(["\uFEFF" + result.csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.csv";
    a.click();
  };

  const previewRows = useMemo(() => {
    if (!result.csv) return [];
    const lines = result.csv.split("\n");
    return lines.map((line) => {
      const cells: string[] = [];
      let cur = "", inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inQ) {
          if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
          else if (c === '"') inQ = false;
          else cur += c;
        } else {
          if (c === '"') inQ = true;
          else if (c === ",") { cells.push(cur); cur = ""; }
          else cur += c;
        }
      }
      cells.push(cur);
      return cells;
    });
  }, [result.csv]);

  return (
    <ToolLayout
      title="JSON转Excel"
      description="将JSON数据转换为Excel表格"
      icon={Table2}
      category="转换工具"
      slug="json-to-excel"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">JSON 输入</label>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input type="checkbox" checked={flat} onChange={(e) => setFlat(e.target.checked)} className="accent-primary-500" />
            扁平化嵌套字段
          </label>
        </div>
        <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={8} className={inputClass + " resize-y font-mono"} />

        {result.error && <p className="text-sm text-red-400">{result.error}</p>}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">表格预览（CSV，可用 Excel 打开）</label>
            <div className="flex gap-3">
              <button onClick={copy} disabled={!result.csv} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 disabled:opacity-30">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
              </button>
              <button onClick={download} disabled={!result.csv} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 disabled:opacity-30">
                <Download className="w-3.5 h-3.5" /> 下载 CSV
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-[#27272a] overflow-auto max-h-80">
            {previewRows.length === 0 ? (
              <p className="text-sm text-slate-600 p-4 text-center">暂无数据</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? "bg-[#16161a] border-b border-[#27272a]" : "border-b border-[#1f1f23]"}>
                      {row.map((cell, ci) => (
                        <td key={ci} className={`p-2.5 border-r border-[#1f1f23] last:border-0 whitespace-nowrap ${ri === 0 ? "text-primary-300 font-medium" : "text-slate-200"}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
