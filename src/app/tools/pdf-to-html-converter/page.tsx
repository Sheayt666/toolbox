"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileCode, Upload, Download, Info, FileText, Copy, Check, Code2 } from "lucide-react";

interface ExtractedContent {
  text: string;
  paragraphs: string[];
  html: string;
  metaInfo: string;
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
    .replace(/[^\x20-\x7E\u4e00-\u9fff\u3000-\u303f\uff00-\uffef\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function textToHtml(text: string, title: string): { html: string; paragraphs: string[] } {
  const sentences = text.split(/(?<=[.!?。！？])\s+/).filter(s => s.trim().length > 0);
  const paragraphs: string[] = [];
  let currentPara: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    currentPara.push(sentences[i]);
    if (currentPara.length >= 3 || i === sentences.length - 1) {
      paragraphs.push(currentPara.join(" "));
      currentPara = [];
    }
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.8; color: #333; }
    h1 { text-align: center; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 15px; }
    p { text-indent: 2em; margin: 15px 0; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
${paragraphs.map(p => `  <p>${p}</p>`).join("\n")}
  <div class="footer">由 99工具 PDF转HTML 工具生成</div>
</body>
</html>`;

  return { html, paragraphs };
}

export default function PdfToHtmlConverterPage() {
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [fileName, setFileName] = useState("");
  const [view, setView] = useState<"html" | "text">("html");
  const [copied, setCopied] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const text = extractPdfText(buf);
      const title = file.name.replace(/\.pdf$/i, "");
      const { html, paragraphs } = textToHtml(text, title);
      setContent({
        text,
        paragraphs,
        html,
        metaInfo: `字符数: ${text.length} | 段落数: ${paragraphs.length}`,
      });
    } catch {
      setContent(null);
    }
  };

  const downloadHtml = () => {
    if (!content) return;
    const blob = new Blob([content.html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.pdf$/i, "") + ".html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = () => {
    if (!content) return;
    navigator.clipboard.writeText(content.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="PDF转HTML"
      description="将PDF文件内容提取并转换为HTML网页格式"
      icon={FileCode}
      category="PDF工具"
      slug="pdf-to-html-converter"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">PDF转HTML工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              上传PDF文件，工具会提取文本内容并自动分段，生成结构化的HTML网页。可下载HTML文件或直接复制代码。
            </p>
          </div>
        </div>

        {!content ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#27272a] rounded-xl py-14 cursor-pointer hover:border-primary-500/50 transition-colors">
            <Upload className="w-10 h-10 text-slate-600 mb-3" />
            <span className="text-sm text-slate-400">点击上传 PDF 文件</span>
            <span className="text-xs text-slate-600 mt-1">仅支持 .pdf 格式</span>
            <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 truncate flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                {fileName}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">{content.metaInfo}</span>
                <button
                  onClick={() => { setContent(null); }}
                  className="text-xs text-slate-500 hover:text-white"
                >
                  重新上传
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("html")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  view === "html" ? "bg-primary-500 text-white" : "bg-[#0a0a0b] border border-[#27272a] text-slate-400 hover:text-white"
                }`}
              >
                <Code2 className="w-3.5 h-3.5 inline mr-1" />HTML代码
              </button>
              <button
                onClick={() => setView("text")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  view === "text" ? "bg-primary-500 text-white" : "bg-[#0a0a0b] border border-[#27272a] text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" />纯文本
              </button>
            </div>

            {view === "html" ? (
              <div>
                <div className="flex items-center justify-end gap-2 mb-2">
                  <button
                    onClick={copyHtml}
                    className="text-xs text-slate-500 hover:text-white inline-flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    复制代码
                  </button>
                </div>
                <pre className="bg-[#0a0a0b] border border-[#27272a] rounded-lg p-4 overflow-x-auto max-h-[400px] overflow-y-auto text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {content.html}
                </pre>
              </div>
            ) : (
              <div className="bg-[#0a0a0b] border border-[#27272a] rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <p className="text-sm text-slate-300 leading-relaxed">{content.text || "(未提取到文本内容)"}</p>
              </div>
            )}

            {view === "html" && (
              <div>
                <p className="text-xs text-slate-500 mb-2">预览效果</p>
                <div
                  className="bg-white rounded-lg p-6 max-h-[300px] overflow-y-auto text-sm text-slate-800"
                  dangerouslySetInnerHTML={{ __html: content.html }}
                />
              </div>
            )}

            <button
              onClick={downloadHtml}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg"
            >
              <Download className="w-4 h-4" />
              下载HTML文件
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
