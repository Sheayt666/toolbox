"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { LayoutGrid, Copy, Check, Eraser, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

export default function TextToColumnsPage() {
  const [text, setText] = useState("姓名,年龄,城市\n张三,28,北京\n李四,34,上海\n王五,22,广州");
  const [delimiter, setDelimiter] = useState(",");
  const [customDelim, setCustomDelim] = useState("");
  const [copied, setCopied] = useState(false);

  const delim = delimiter === "custom" ? customDelim : delimiter;

  const rows = useMemo(() => {
    if (!text.trim()) return [];
    return text.split(/\r?\n/).map((line) => line.split(delim || ","));
  }, [text, delim]);

  const maxCols = useMemo(() => rows.reduce((m, r) => Math.max(m, r.length), 0), [rows]);

  const copyTSV = () => {
    navigator.clipboard.writeText(rows.map((r) => r.join("\t")).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadCSV = () => {
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "columns.csv";
    a.click();
  };

  return (
    <ToolLayout
      title="文本分列"
      description="按分隔符将文本分列"
      icon={LayoutGrid}
      category="文本工具"
      slug="text-to-columns"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">输入文本（每行一条记录）</label>
            <button onClick={() => setText("")} className="text-xs text-slate-500 hover:text-white inline-flex items-center gap-1">
              <Eraser className="w-3.5 h-3.5" /> 清空
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="每行一条数据，用分隔符分隔列..."
            rows={6}
            className={inputClass + " resize-y font-mono"}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { v: ",", l: "逗号" },
            { v: "\t", l: "制表符" },
            { v: " ", l: "空格" },
            { v: "|", l: "竖线" },
            { v: "custom", l: "自定义" },
          ].map((d) => (
            <button
              key={d.v}
              onClick={() => setDelimiter(d.v)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                delimiter === d.v
                  ? "border-primary-500/50 bg-primary-500/10 text-primary-400"
                  : "border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:border-[#3f3f46]"
              }`}
            >
              {d.l}
            </button>
          ))}
        </div>

        {delimiter === "custom" && (
          <input
            value={customDelim}
            onChange={(e) => setCustomDelim(e.target.value)}
            placeholder="输入自定义分隔符，如 ; 或 #"
            className={inputClass}
          />
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">
              分列结果（{rows.length} 行 × {maxCols} 列）
            </label>
            <div className="flex gap-3">
              <button onClick={copyTSV} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制TSV
              </button>
              <button onClick={downloadCSV} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> 导出CSV
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-[#27272a] overflow-auto max-h-80">
            {rows.length === 0 ? (
              <p className="text-sm text-slate-600 p-4 text-center">暂无数据</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-[#1f1f23] last:border-0">
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="p-2.5 text-slate-200 border-r border-[#1f1f23] last:border-0 whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                      {row.length < maxCols &&
                        Array.from({ length: maxCols - row.length }).map((_, i) => (
                          <td key={`e${i}`} className="p-2.5 border-r border-[#1f1f23] last:border-0">
                            <span className="text-slate-700">—</span>
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
