"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Files, Upload, GitCompare, Check, X, Info, Copy } from "lucide-react";

interface PdfTextResult {
  fileName: string;
  text: string;
  lines: string[];
  charCount: number;
  wordCount: number;
}

function extractPdfText(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let text = "";
  let inText = false;
  let currentStr = "";

  for (let i = 0; i < bytes.length - 1; i++) {
    const char = String.fromCharCode(bytes[i]);

    if (char === "B" && String.fromCharCode(bytes[i + 1]) === "T") {
      inText = true;
      continue;
    }
    if (char === "E" && String.fromCharCode(bytes[i + 1]) === "T") {
      inText = false;
      if (currentStr.trim()) {
        const decoded = currentStr
          .replace(/\(([^)]*)\)/g, "$1")
          .replace(/\[(.*?)\]/g, "")
          .replace(/\\/g, "")
          .replace(/Tj|TJ|Td|TD|Tf|Tc|Tw|TL|Tm|Ts|T\*|rg|RG|g|G|k|K|re|W|n|q|Q|cm|gs|ri|cs|CS|sc|SC|scn|SCN|sh|f|F|f\*|S|B|B\*|b|b\*/g, " ");
        text += decoded + " ";
      }
      currentStr = "";
      continue;
    }
    if (inText) {
      currentStr += char;
    }
  }

  text = text
    .replace(/[^\x20-\x7E\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function diffLines(lines1: string[], lines2: string[]): { type: "same" | "add" | "del" | "mod"; text: string; line1?: number; line2?: number }[] {
  const result: { type: "same" | "add" | "del" | "mod"; text: string; line1?: number; line2?: number }[] = [];
  const maxLen = Math.max(lines1.length, lines2.length);
  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i] || "";
    const l2 = lines2[i] || "";
    if (l1 === l2 && l1) {
      result.push({ type: "same", text: l1, line1: i + 1, line2: i + 1 });
    } else if (l1 && !l2) {
      result.push({ type: "del", text: l1, line1: i + 1 });
    } else if (!l1 && l2) {
      result.push({ type: "add", text: l2, line2: i + 1 });
    } else if (l1 && l2) {
      result.push({ type: "mod", text: `文件A: ${l1} | 文件B: ${l2}`, line1: i + 1, line2: i + 1 });
    }
  }
  return result;
}

export default function PdfComparePage() {
  const [file1, setFile1] = useState<PdfTextResult | null>(null);
  const [file2, setFile2] = useState<PdfTextResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [diffResult, setDiffResult] = useState<ReturnType<typeof diffLines> | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFile1 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setComparing(true);
    try {
      const buf = await f.arrayBuffer();
      const text = extractPdfText(buf);
      const lines = text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
      setFile1({ fileName: f.name, text, lines, charCount: text.length, wordCount: text.split(/\s+/).filter(Boolean).length });
    } catch {
      setFile1({ fileName: f.name, text: "解析失败", lines: [], charCount: 0, wordCount: 0 });
    }
    setComparing(false);
  };

  const handleFile2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setComparing(true);
    try {
      const buf = await f.arrayBuffer();
      const text = extractPdfText(buf);
      const lines = text.split(/(?<=[.!?。！？])\s+/).filter(Boolean);
      setFile2({ fileName: f.name, text, lines, charCount: text.length, wordCount: text.split(/\s+/).filter(Boolean).length });
    } catch {
      setFile2({ fileName: f.name, text: "解析失败", lines: [], charCount: 0, wordCount: 0 });
    }
    setComparing(false);
  };

  const compare = () => {
    if (!file1 || !file2) return;
    setDiffResult(diffLines(file1.lines, file2.lines));
  };

  const stats = diffResult ? {
    same: diffResult.filter(d => d.type === "same").length,
    add: diffResult.filter(d => d.type === "add").length,
    del: diffResult.filter(d => d.type === "del").length,
    mod: diffResult.filter(d => d.type === "mod").length,
  } : null;

  return (
    <ToolLayout
      title="PDF对比工具"
      description="对比两个PDF文件内容差异，高亮显示新增、删除和修改内容"
      icon={Files}
      category="PDF工具"
      slug="pdf-compare"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">PDF对比工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              上传两个PDF文件，工具会提取文本内容并逐句对比差异。支持按句子级别对比，高亮显示新增、删除和修改内容。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">文件 A（原始）</label>
            {!file1 ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#27272a] rounded-xl py-10 cursor-pointer hover:border-primary-500/50 transition-colors">
                <Upload className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs text-slate-400">上传 PDF 文件</span>
                <input type="file" accept=".pdf" onChange={handleFile1} className="hidden" />
              </label>
            ) : (
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3">
                <p className="text-sm text-white truncate mb-1">{file1.fileName}</p>
                <p className="text-xs text-slate-500">{file1.charCount} 字符 / {file1.wordCount} 词 / {file1.lines.length} 句</p>
                <button onClick={() => { setFile1(null); setDiffResult(null); }} className="text-xs text-red-400 hover:text-red-300 mt-2">移除</button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">文件 B（对比）</label>
            {!file2 ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#27272a] rounded-xl py-10 cursor-pointer hover:border-primary-500/50 transition-colors">
                <Upload className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-xs text-slate-400">上传 PDF 文件</span>
                <input type="file" accept=".pdf" onChange={handleFile2} className="hidden" />
              </label>
            ) : (
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3">
                <p className="text-sm text-white truncate mb-1">{file2.fileName}</p>
                <p className="text-xs text-slate-500">{file2.charCount} 字符 / {file2.wordCount} 词 / {file2.lines.length} 句</p>
                <button onClick={() => { setFile2(null); setDiffResult(null); }} className="text-xs text-red-400 hover:text-red-300 mt-2">移除</button>
              </div>
            )}
          </div>
        </div>

        {file1 && file2 && (
          <button
            onClick={compare}
            disabled={comparing}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
          >
            <GitCompare className="w-4 h-4" />
            开始对比
          </button>
        )}

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
              <Check className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500">相同</p>
              <p className="text-lg font-bold text-emerald-400">{stats.same}</p>
            </div>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
              <span className="inline-block w-4 h-4 text-green-400 text-center">+</span>
              <p className="text-xs text-slate-500">新增</p>
              <p className="text-lg font-bold text-green-400">{stats.add}</p>
            </div>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
              <X className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <p className="text-xs text-slate-500">删除</p>
              <p className="text-lg font-bold text-red-400">{stats.del}</p>
            </div>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
              <span className="inline-block w-4 h-4 text-amber-400 text-center">~</span>
              <p className="text-xs text-slate-500">修改</p>
              <p className="text-lg font-bold text-amber-400">{stats.mod}</p>
            </div>
          </div>
        )}

        {diffResult && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-300">差异详情</p>
              <button
                onClick={() => {
                  const text = diffResult.map(d => `[${d.type === "same" ? "=" : d.type === "add" ? "+" : d.type === "del" ? "-" : "~"}] ${d.text}`).join("\n");
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="text-xs text-slate-500 hover:text-white inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                复制差异
              </button>
            </div>
            <div className="rounded-lg border border-[#27272a] overflow-hidden max-h-[400px] overflow-y-auto">
              {diffResult.map((d, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 text-xs border-b border-[#27272a] font-mono ${
                    d.type === "same" ? "bg-[#0a0a0b] text-slate-400" :
                    d.type === "add" ? "bg-green-500/10 text-green-300" :
                    d.type === "del" ? "bg-red-500/10 text-red-300" :
                    "bg-amber-500/10 text-amber-300"
                  }`}
                >
                  <span className="text-slate-600 mr-2">
                    {d.type === "same" ? "  " : d.type === "add" ? "+ " : d.type === "del" ? "- " : "~ "}
                  </span>
                  {d.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
