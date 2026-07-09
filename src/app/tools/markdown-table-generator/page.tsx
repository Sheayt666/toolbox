"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Table2, Copy, Check, Plus, Minus, Wand2 } from "lucide-react";

export default function MarkdownTableGeneratorPage() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [headers, setHeaders] = useState<string[]>(["列1", "列2", "列3"]);
  const [alignments, setAlignments] = useState<string[]>(["left", "left", "left"]);
  const [data, setData] = useState<string[][]>([
    ["内容1", "内容2", "内容3"],
    ["内容4", "内容5", "内容6"],
  ]);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generateTable = () => {
    let md = "| ";
    // 表头
    md += headers.join(" | ") + " |\n";
    // 分隔线
    md += "| ";
    md += alignments.map(align => {
      if (align === "center") return ":---:";
      if (align === "right") return "---:";
      return "---";
    }).join(" | ");
    md += " |\n";
    // 数据行
    for (const row of data) {
      md += "| " + row.join(" | ") + " |\n";
    }
    setOutput(md);
  };

  const handleRowsChange = (delta: number) => {
    const newRows = Math.max(1, Math.min(20, rows + delta));
    if (newRows > rows) {
      setData([...data, Array(cols).fill("")]);
    } else {
      setData(data.slice(0, -1));
    }
    setRows(newRows);
  };

  const handleColsChange = (delta: number) => {
    const newCols = Math.max(1, Math.min(10, cols + delta));
    if (newCols > cols) {
      setHeaders([...headers, `列${newCols}`]);
      setAlignments([...alignments, "left"]);
      setData(data.map(row => [...row, ""]));
    } else {
      setHeaders(headers.slice(0, -1));
      setAlignments(alignments.slice(0, -1));
      setData(data.map(row => row.slice(0, -1)));
    }
    setCols(newCols);
  };

  const updateHeader = (idx: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[idx] = value;
    setHeaders(newHeaders);
  };

  const updateAlignment = (idx: number, align: string) => {
    const newAlign = [...alignments];
    newAlign[idx] = align;
    setAlignments(newAlign);
  };

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newData = data.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => ci === colIdx ? value : cell) : row
    );
    setData(newData);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="Markdown表格生成器"
      description="在线Markdown表格生成工具，支持调整行列、对齐方式，快速生成表格代码"
      toolId="markdown-table-generator"
      icon={Table2}
      category="开发工具"
      slug="markdown-table-generator"
    >
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* 配置栏 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">行数:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRowsChange(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono text-lg font-bold text-cyan-400">{rows}</span>
                <button
                  onClick={() => handleRowsChange(1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">列数:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleColsChange(-1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-mono text-lg font-bold text-cyan-400">{cols}</span>
                <button
                  onClick={() => handleColsChange(1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1" />

            <button
              onClick={generateTable}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm font-medium"
            >
              <Wand2 className="w-4 h-4" />
              生成表格
            </button>
          </div>
        </div>

        {/* 表格编辑器 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <Table2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold">表格编辑器</h3>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="p-2 border border-zinc-700">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => updateHeader(idx, e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-600 rounded px-2 py-1.5 text-sm text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
                    />
                    <select
                      value={alignments[idx]}
                      onChange={(e) => updateAlignment(idx, e.target.value)}
                      className="w-full mt-2 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-400 focus:outline-none"
                    >
                      <option value="left">左对齐</option>
                      <option value="center">居中</option>
                      <option value="right">右对齐</option>
                    </select>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="p-2 border border-zinc-700">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="w-full bg-zinc-900/30 border border-zinc-700 rounded px-2 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-cyan-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 输出结果 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table2 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-semibold">Markdown代码</h3>
            </div>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-cyan-400 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          <div className="p-4">
            <pre className="w-full h-48 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-300 font-mono text-sm overflow-auto">
              {output || <span className="text-zinc-600">点击生成按钮查看结果...</span>}
            </pre>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">工具特性</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-cyan-500/10 rounded-xl">
              <div className="text-sm font-medium text-cyan-300">可视化编辑</div>
              <p className="text-xs text-cyan-400/70 mt-1">直接在表格中编辑内容</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <div className="text-sm font-medium text-emerald-300">灵活调整</div>
              <p className="text-xs text-emerald-400/70 mt-1">支持增减行列、调整对齐</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="text-sm font-medium text-blue-300">一键复制</div>
              <p className="text-xs text-blue-400/70 mt-1">生成后一键复制Markdown代码</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
