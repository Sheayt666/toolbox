"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Copy,
  Check,
  Trash2,
  Download,
  Type,
  Search,
} from "lucide-react";

interface DuplicateInfo {
  content: string;
  count: number;
  lines: number[];
}

function findDuplicateLines(text: string): DuplicateInfo[] {
  const lines = text.split("\n");
  const map = new Map<string, { count: number; lines: number[] }>();
  
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const key = line.trim();
    if (!map.has(key)) {
      map.set(key, { count: 0, lines: [] });
    }
    const info = map.get(key)!;
    info.count++;
    info.lines.push(index + 1);
  });
  
  const result: DuplicateInfo[] = [];
  map.forEach((info, content) => {
    if (info.count > 1) {
      result.push({ content, count: info.count, lines: info.lines });
    }
  });
  
  return result.sort((a, b) => b.count - a.count);
}

export default function DuplicateFinderPage() {
  const [input, setInput] = useState("");
  const [duplicates, setDuplicates] = useState<DuplicateInfo[]>([]);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"lines" | "words">("lines");

  const handleFind = useCallback(() => {
    if (!input.trim()) return;
    
    if (mode === "lines") {
      const dups = findDuplicateLines(input);
      setDuplicates(dups);
      if (dups.length === 0) {
        setOutput("未发现重复内容");
      } else {
        setOutput(dups.map(d => `[${d.count}次] ${d.content} (行: ${d.lines.join(", ")})`).join("\n"));
      }
    } else {
      const words = input.toLowerCase().match(/[\u4e00-\u9fa5a-zA-Z]+/g) || [];
      const map = new Map<string, number>();
      words.forEach(w => map.set(w, (map.get(w) || 0) + 1));
      const dups = Array.from(map.entries())
        .filter(([, c]) => c > 1)
        .sort((a, b) => b[1] - a[1]);
      setDuplicates([]);
      if (dups.length === 0) {
        setOutput("未发现重复词语");
      } else {
        setOutput(dups.map(([w, c]) => `[${c}次] ${w}`).join("\n"));
      }
    }
  }, [input, mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setDuplicates([]);
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "duplicates.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const totalDupCount = duplicates.reduce((sum, d) => sum + d.count - 1, 0);

  return (
    <ToolLayout
      title="重复内容查找"
      description="查找文本中的重复行、重复单词，高亮显示重复内容，支持去重"
      toolId="duplicate-finder"
      icon={Copy}
      category="文本工具"
      slug="duplicate-finder"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-1 bg-[#27272a] rounded-xl p-1">
              <button
                onClick={() => setMode("lines")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  mode === "lines" ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                按行查找
              </button>
              <button
                onClick={() => setMode("words")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  mode === "words" ? "bg-gradient-to-r from-red-500 to-orange-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                按词查找
              </button>
            </div>
            <button
              onClick={handleFind}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Search className="w-4 h-4" />
              查找重复
            </button>
            {duplicates.length > 0 && (
              <span className="text-sm text-zinc-400">
                发现 <span className="text-red-400 font-semibold">{duplicates.length}</span> 组重复，
                共 <span className="text-red-400 font-semibold">{totalDupCount}</span> 行重复
              </span>
            )}
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">输入文本</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入或粘贴文本..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Copy className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">重复内容</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="重复内容将显示在这里..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            查找文本中的重复行、重复单词，高亮显示重复内容，支持去重。支持按行和按词两种查找模式，
            显示重复次数和所在行号。常用于文本去重、数据分析、
            内容审核等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
