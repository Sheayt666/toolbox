"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Eraser,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
  
} from "lucide-react";

function processText(text: string): string {
  const accentMap: Record<string, string> = {
    "\u00e0": "a", "\u00e1": "a", "\u00e2": "a", "\u00e3": "a", "\u00e4": "a", "\u00e5": "a",
    "\u00c0": "A", "\u00c1": "A", "\u00c2": "A", "\u00c3": "A", "\u00c4": "A", "\u00c5": "A",
    "\u00e8": "e", "\u00e9": "e", "\u00ea": "e", "\u00eb": "e",
    "\u00c8": "E", "\u00c9": "E", "\u00ca": "E", "\u00cb": "E",
    "\u00ec": "i", "\u00ed": "i", "\u00ee": "i", "\u00ef": "i",
    "\u00cc": "I", "\u00cd": "I", "\u00ce": "I", "\u00cf": "I",
    "\u00f2": "o", "\u00f3": "o", "\u00f4": "o", "\u00f5": "o", "\u00f6": "o", "\u00f8": "o",
    "\u00d2": "O", "\u00d3": "O", "\u00d4": "O", "\u00d5": "O", "\u00d6": "O", "\u00d8": "O",
    "\u00f9": "u", "\u00fa": "u", "\u00fb": "u", "\u00fc": "u",
    "\u00d9": "U", "\u00da": "U", "\u00db": "U", "\u00dc": "U",
    "\u00f1": "n", "\u00d1": "N",
    "\u00e7": "c", "\u00c7": "C",
    "\u00df": "ss",
    "\u00fe": "th", "\u00f0": "dh",
    "\u00dd": "Y", "\u00fd": "y", "\u00ff": "y",
    "\u0105": "a", "\u0107": "c", "\u0119": "e", "\u0142": "l",
    "\u0144": "n", "\u015b": "s", "\u017a": "z", "\u017c": "z",
    "\u0104": "A", "\u0106": "C", "\u0118": "E", "\u0141": "L",
    "\u0143": "N", "\u015a": "S", "\u0179": "Z", "\u017b": "Z",
    "\u00e6": "ae", "\u00c6": "AE",
    "\u0153": "oe", "\u0152": "OE",
  };
  
  let result = text;
  for (const [accented, plain] of Object.entries(accentMap)) {
    result = result.replace(new RegExp(accented, "g"), plain);
  }
  return result;
}

export default function AccentRemoverPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  

  const handleProcess = useCallback(() => {
    if (!input.trim()) return;
    try {
      setOutput(processText(input));
    } catch {
      setOutput("处理失败");
    }
  }, [input]);

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
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accent-remover.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="去除重音符号"
      description="去除文字中的重音符号和变音符号，将带重音的字符转换为普通字符"
      toolId="accent-remover"
      icon={Eraser}
      category="文本工具"
      slug="accent-remover"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleProcess}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Eraser className="w-4 h-4" />
              去除重音
            </button>
            
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
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Eraser className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">处理结果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="处理结果将显示在这里..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            去除文字中的重音符号和变音符号，将带重音的字符转换为普通字符。操作简单，一键处理，支持复制和下载结果。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
