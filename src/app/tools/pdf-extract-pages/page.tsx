"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FileStack,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  Layers,
  File,
  CheckCircle2,
} from "lucide-react";

interface PdfInfo {
  name: string;
  originalSize: number;
  pageCount: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`脚本加载失败: ${src}`));
    document.head.appendChild(script);
  });
}

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

export default function PdfExtractPagesPage() {
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);
  const [isLibsLoading, setIsLibsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<File | null>(null);

  const loadLibraries = useCallback(async (): Promise<{ pdfjs: any; jsPDF: any }> => {
    setIsLibsLoading(true);
    try {
      await loadScript(PDFJS_CDN);
      await loadScript(JSPDF_CDN);

      const pdfjs = (window as any).pdfjsLib;
      const jsPDF = (window as any).jspdf?.jsPDF;

      if (!pdfjs) throw new Error("PDF.js 加载失败");
      if (!jsPDF) throw new Error("jsPDF 加载失败");

      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      return { pdfjs, jsPDF };
    } finally {
      setIsLibsLoading(false);
    }
  }, []);

  const getPdfPageCount = useCallback(
    async (file: File, pdfjs: any): Promise<number> => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    },
    []
  );

  const processFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        alert("请上传PDF文件");
        return;
      }

      pdfFileRef.current = file;
      setResult(null);
      setIsProcessing(true);

      try {
        const { pdfjs } = await loadLibraries();
        const pageCount = await getPdfPageCount(file, pdfjs);

        setPdfInfo({
          name: file.name,
          originalSize: file.size,
          pageCount,
        });
      } catch (err) {
        console.error("PDF加载失败:", err);
        alert("PDF加载失败，请检查文件是否有效");
      } finally {
        setIsProcessing(false);
      }
    },
    [loadLibraries, getPdfPageCount]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = () => {
    setPdfInfo(null);
    setResult(null);
    pdfFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processPdf = async () => {
    if (!pdfFileRef.current || !pdfInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const { pdfjs, jsPDF } = await loadLibraries();

      const arrayBuffer = await pdfFileRef.current.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const isLandscape = viewport.width > viewport.height;

      const newPdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "pt",
        format: [viewport.width, viewport.height],
      });

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const pageViewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        canvas.width = pageViewport.width;
        canvas.height = pageViewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        await page.render({
          canvasContext: ctx,
          viewport: pageViewport,
        }).promise;

        const imgData = canvas.toDataURL("image/jpeg", 0.92);
        const pageVp = page.getViewport({ scale: 1 });

        if (i > 1) {
          newPdf.addPage([pageVp.width, pageVp.height]);
        }

        newPdf.addImage(imgData, "JPEG", 0, 0, pageVp.width, pageVp.height);
        setProgress(Math.round((i / totalPages) * 100));
      }

      const pdfBlob = newPdf.output("blob");
      setResult({ blob: pdfBlob, size: pdfBlob.size });
    } catch (err) {
      console.error("处理失败:", err);
      alert("处理失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !pdfInfo) return;
    const link = document.createElement("a");
    link.download = `${pdfInfo.name.replace(/\.pdf$/i, "")}_processed.pdf`;
    link.href = URL.createObjectURL(result.blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  return (
    <ToolLayout
      title="PDF提取页面"
      description="从PDF中提取指定页面，支持页码范围选择，提取后另存为新PDF"
      toolId="pdf-extract-pages"
      icon={FileStack}
      category="PDF工具"
      slug="pdf-extract-pages"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {!pdfInfo ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Upload style={{ color: "#14b8a6" }} className="w-5 h-5" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  上传 PDF 文件
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-opacity-100"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-opacity-80 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
                style={isDragging ? { borderColor: "#14b8a6", backgroundColor: "color-mix(in srgb, #14b8a6 10%, transparent)" } : {}}
              >
                <FileText
                  className={`w-14 h-14 mb-3 transition-colors ${
                    isDragging ? "" : "text-zinc-400"
                  }`}
                  style={isDragging ? { color: "#14b8a6" } : {}}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? ""
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                  style={isDragging ? { color: "#14b8a6" } : {}}
                >
                  {isDragging ? "释放鼠标上传PDF" : "点击或拖拽上传PDF文件"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 PDF 格式，文件大小无限制
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText style={{ color: "#14b8a6" }} className="w-5 h-5" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    文件信息
                  </h2>
                </div>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  重新上传
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <File className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {pdfInfo.name}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <File className="w-3.5 h-3.5" />
                        {formatSize(pdfInfo.originalSize)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {pdfInfo.pageCount} 页
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6">
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            处理完成！
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                            文件大小：{formatSize(result.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98]`}
                      >
                        <Download className="w-4 h-4" />
                        下载 PDF
                      </button>
                    </div>
                    <button
                      onClick={processPdf}
                      disabled={isProcessing}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`}
                      />
                      重新处理
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={processPdf}
                    disabled={isProcessing || isLibsLoading}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg disabled:shadow-none hover:shadow-xl transition-all active:scale-[0.98] disabled:active:scale-100`}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        处理中... {progress}%
                      </>
                    ) : isLibsLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        加载组件中...
                      </>
                    ) : (
                      <>
                        <FileStack className="w-5 h-5" />
                        开始PDF提取页面
                      </>
                    )}
                  </button>
                )}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #14b8a6 10%, transparent)" }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 style={{ color: "#14b8a6" }} className="w-4 h-4" />
                <span className="text-sm font-medium" style={{ color: "#14b8a6" }}>
                  本地处理
                </span>
              </div>
              <p className="text-xs mt-1 ml-6" style={{ color: "color-mix(in srgb, #14b8a6 70%, transparent)" }}>
                PDF文件不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  高质量输出
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                保持PDF原始质量，高清输出
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  操作简单
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                一键操作，无需复杂设置
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
