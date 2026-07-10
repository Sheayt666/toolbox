"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Hash, Upload, Download, Info, FileText } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

export default function PdfPageNumberPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [position, setPosition] = useState<"bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left">("bottom-center");
  const [format, setFormat] = useState<"1" | "1/1" | "第X页" | "Page X" | "X of Y">("1/1");
  const [startNum, setStartNum] = useState(1);
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState(20);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  const formatPageNum = (page: number) => {
    switch (format) {
      case "1": return `${page}`;
      case "1/1": return `${page}`;
      case "第X页": return `第 ${page} 页`;
      case "Page X": return `Page ${page}`;
      case "X of Y": return `${page} of ...`;
      default: return `${page}`;
    }
  };

  const getPositionStyle = (): React.CSSProperties => {
    const pos = position;
    const m = margin;
    const styles: React.CSSProperties = { position: "fixed", fontSize: `${fontSize}px`, fontFamily: "Arial, sans-serif", color: "#333" };
    if (pos.includes("bottom")) styles.bottom = `${m}px`;
    if (pos.includes("top")) styles.top = `${m}px`;
    if (pos.includes("center")) { styles.left = "50%"; styles.transform = "translateX(-50%)"; }
    if (pos.includes("right")) styles.right = `${m}px`;
    if (pos.includes("left")) styles.left = `${m}px`;
    return styles;
  };

  const generatePdf = () => {
    if (!pdfUrl) return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const posStyle = getPositionStyle();
    const styleStr = Object.entries(posStyle).map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${v}`).join("; ");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName.replace(/\.pdf$/i, "")}_带页码</title>
        <style>
          @page { margin: 0; }
          body { margin: 0; }
          .pdf-container { width: 100vw; height: 100vh; }
          embed { width: 100vw; height: 100vh; }
          .page-number { ${styleStr}; z-index: 9999; font-size: ${fontSize}px; }
        </style>
      </head>
      <body>
        <div class="pdf-container">
          <embed src="${pdfUrl}" type="application/pdf" />
          <div class="page-number">${formatPageNum(startNum)}</div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 1500);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <ToolLayout
      title="PDF添加页码"
      description="为PDF文件添加页码，支持多种位置和格式，通过浏览器打印导出"
      icon={Hash}
      category="PDF工具"
      slug="pdf-page-number"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">PDF页码添加工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              上传PDF文件，自定义页码位置、格式、字号和边距，通过浏览器打印功能导出带页码的PDF。请在打印对话框中选择"另存为PDF"。
            </p>
          </div>
        </div>

        {!pdfUrl ? (
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
              <button
                onClick={() => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }}
                className="text-xs text-slate-500 hover:text-white"
              >
                重新上传
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-2">页码位置</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as typeof position)}
                  className={inputClass}
                >
                  <option value="bottom-center">底部居中</option>
                  <option value="bottom-right">底部右侧</option>
                  <option value="bottom-left">底部左侧</option>
                  <option value="top-center">顶部居中</option>
                  <option value="top-right">顶部右侧</option>
                  <option value="top-left">顶部左侧</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-2">页码格式</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as typeof format)}
                  className={inputClass}
                >
                  <option value="1">1, 2, 3</option>
                  <option value="1/1">1/N</option>
                  <option value="第X页">第 X 页</option>
                  <option value="Page X">Page X</option>
                  <option value="X of Y">X of Y</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-2">起始页码</label>
                <input
                  type="number"
                  min={0}
                  value={startNum}
                  onChange={(e) => setStartNum(Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-2">字号 (px)</label>
                <input
                  type="number"
                  min={6}
                  max={72}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-slate-500">页边距 (px)</label>
                <span className="text-xs text-slate-400 font-mono">{margin}px</span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <p className="text-xs text-slate-500 mb-3">预览</p>
              <div className="relative bg-white rounded-lg mx-auto" style={{ width: "200px", height: "280px" }}>
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">PDF 内容区域</div>
                <div
                  className="absolute text-slate-700 font-mono"
                  style={{
                    fontSize: `${Math.min(fontSize, 14)}px`,
                    ...(position.includes("bottom") ? { bottom: `${Math.min(margin / 3, 15)}px` } : {}),
                    ...(position.includes("top") ? { top: `${Math.min(margin / 3, 15)}px` } : {}),
                    ...(position.includes("center") ? { left: "50%", transform: "translateX(-50%)" } : {}),
                    ...(position.includes("right") ? { right: `${Math.min(margin / 3, 15)}px` } : {}),
                    ...(position.includes("left") ? { left: `${Math.min(margin / 3, 15)}px` } : {}),
                  }}
                >
                  {formatPageNum(startNum)}
                </div>
              </div>
            </div>

            <button
              onClick={generatePdf}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg"
            >
              <Download className="w-4 h-4" />
              生成带页码PDF
            </button>

            <p className="text-xs text-slate-600 text-center">
              点击按钮后会打开打印窗口，请在目标中选择"另存为PDF"以保存
            </p>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
