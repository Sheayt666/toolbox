"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CircleDot, Upload, Download, Info, Loader2, FileText } from "lucide-react";

export default function PdfGrayscalePage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [processing] = useState(false);
  const [mode, setMode] = useState<"grayscale" | "bw">("grayscale");
  const [threshold, setThreshold] = useState(128);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  const downloadResult = () => {
    if (!pdfUrl) return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName.replace(/\.pdf$/i, "")}_${mode === "grayscale" ? "灰度" : "黑白"}</title>
        <style>
          body { margin: 0; }
          embed { width: 100vw; height: 100vh; }
          embed { filter: ${mode === "grayscale" ? "grayscale(100%)" : `grayscale(100%) contrast(1000%) brightness(${(threshold / 128).toFixed(2)})`}; }
        </style>
      </head>
      <body>
        <embed src="${pdfUrl}" type="application/pdf" />
      </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => {
      printWin.print();
    }, 1000);
  };

  return (
    <ToolLayout
      title="PDF转黑白"
      description="将彩色PDF转换为黑白或灰度，通过浏览器打印功能导出"
      icon={CircleDot}
      category="PDF工具"
      slug="pdf-grayscale"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">PDF黑白转换工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              上传PDF文件，选择灰度模式或黑白模式（二值化），通过浏览器打印功能导出黑白PDF。建议在打印对话框中选择"另存为PDF"。
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

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("grayscale")}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  mode === "grayscale" ? "border-primary-500/50 bg-primary-500/5" : "border-[#27272a] bg-[#0a0a0b] hover:border-[#3f3f46]"
                }`}
              >
                <CircleDot className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-white">灰度模式</p>
                <p className="text-xs text-slate-500 mt-1">保留灰度层次</p>
              </button>
              <button
                onClick={() => setMode("bw")}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  mode === "bw" ? "border-primary-500/50 bg-primary-500/5" : "border-[#27272a] bg-[#0a0a0b] hover:border-[#3f3f46]"
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full border border-slate-600 mb-2" />
                <p className="text-sm font-medium text-white">黑白模式</p>
                <p className="text-xs text-slate-500 mt-1">二值化，纯黑白</p>
              </button>
            </div>

            {mode === "bw" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500">二值化阈值</label>
                  <span className="text-xs text-slate-400 font-mono">{threshold}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={255}
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <p className="text-xs text-slate-600 mt-1">低于此值的像素变为黑色，高于此值的变为白色</p>
              </div>
            )}

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <p className="text-xs text-slate-500 mb-2">预览效果（使用CSS滤镜模拟）</p>
              <div className="flex justify-center py-8 rounded-lg bg-white">
                <div
                  className="w-32 h-40 rounded-lg shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)",
                    filter: mode === "grayscale" ? "grayscale(100%)" : `grayscale(100%) contrast(1000%) brightness(${(threshold / 128).toFixed(2)})`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={downloadResult}
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  打印为黑白PDF
                </>
              )}
            </button>

            <p className="text-xs text-slate-600 text-center">
              点击按钮后会打开打印窗口，请在目标中选择"另存为PDF"以保存黑白版本
            </p>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
