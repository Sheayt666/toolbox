"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Scissors,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  Layers,
  File,
  CheckCircle2,
  Settings,
} from "lucide-react";

interface PdfInfo {
  name: string;
  originalSize: number;
  pageCount: number;
}

interface SplitResult {
  blobs: Blob[];
  totalSize: number;
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

type SplitMode = "perPage" | "pages";

export default function PdfSplitterPage() {
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [isLibsLoading, setIsLibsLoading] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>("perPage");
  const [pageRanges, setPageRanges] = useState("");

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

  const parsePageRanges = (input: string, totalPages: number): number[][] => {
    const ranges: number[][] = [];
    const parts = input.split(",").map(s => s.trim()).filter(s => s);

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(s => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
          ranges.push([start, end]);
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
          ranges.push([page, page]);
        }
      }
    }

    return ranges;
  };

  const renderPageToCanvas = async (page: any, scale: number = 2): Promise<string> => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("无法创建Canvas上下文");

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL("image/jpeg", 0.95);
  };

  const splitPdf = async () => {
    if (!pdfFileRef.current || !pdfInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const { pdfjs, jsPDF } = await loadLibraries();

      const arrayBuffer = await pdfFileRef.current.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const blobs: Blob[] = [];
      let totalSize = 0;

      if (splitMode === "perPage") {
        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const pageViewport = page.getViewport({ scale: 1 });
          const isLandscape = pageViewport.width > pageViewport.height;

          const newPdf = new jsPDF({
            orientation: isLandscape ? "landscape" : "portrait",
            unit: "pt",
            format: [pageViewport.width, pageViewport.height],
          });

          const imgData = await renderPageToCanvas(page);
          newPdf.addImage(imgData, "JPEG", 0, 0, pageViewport.width, pageViewport.height);

          const blob = newPdf.output("blob");
          blobs.push(blob);
          totalSize += blob.size;

          setProgress(Math.round((i / totalPages) * 100));
        }
      } else {
        const ranges = parsePageRanges(pageRanges, totalPages);
        if (ranges.length === 0) {
          alert("请输入有效的页码范围，例如：1-3,5,7-9");
          setIsProcessing(false);
          return;
        }

        let processed = 0;
        let totalRangePages = ranges.reduce((sum, r) => sum + (r[1] - r[0] + 1), 0);

        for (const [start, end] of ranges) {
          const firstPage = await pdf.getPage(start);
          const firstViewport = firstPage.getViewport({ scale: 1 });
          const isLandscape = firstViewport.width > firstViewport.height;

          const newPdf = new jsPDF({
            orientation: isLandscape ? "landscape" : "portrait",
            unit: "pt",
            format: [firstViewport.width, firstViewport.height],
          });

          for (let pageNum = start; pageNum <= end; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1 });
            const imgData = await renderPageToCanvas(page);

            if (pageNum > start) {
              newPdf.addPage([viewport.width, viewport.height]);
            }
            newPdf.addImage(imgData, "JPEG", 0, 0, viewport.width, viewport.height);

            processed++;
            setProgress(Math.round((processed / totalRangePages) * 100));
          }

          const blob = newPdf.output("blob");
          blobs.push(blob);
          totalSize += blob.size;
        }
      }

      setResult({ blobs, totalSize });
    } catch (err) {
      console.error("分割失败:", err);
      alert("分割失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (index: number) => {
    if (!result || !pdfInfo) return;
    const link = document.createElement("a");
    link.download = `${pdfInfo.name.replace(/\.pdf$/i, "")}_part${index + 1}.pdf`;
    link.href = URL.createObjectURL(result.blobs[index]);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const handleDownloadAll = () => {
    if (!result || !pdfInfo) return;
    result.blobs.forEach((blob, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.download = `${pdfInfo!.name.replace(/\.pdf$/i, "")}_part${index + 1}.pdf`;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }, index * 200);
    });
  };

  return (
    <ToolLayout
      title="PDF分割工具"
      description="在线将PDF文件分割为多个文件，支持按页数分割和指定范围分割，本地处理安全可靠"
      toolId="pdf-splitter"
      icon={Scissors}
      category="PDF工具"
      slug="pdf-splitter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {!pdfInfo ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Upload style={{ color: "#f43f5e" }} className="w-5 h-5" />
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
                style={isDragging ? { borderColor: "#f43f5e", backgroundColor: "color-mix(in srgb, #f43f5e 10%, transparent)" } : {}}
              >
                <FileText
                  className={`w-14 h-14 mb-3 transition-colors ${isDragging ? "" : "text-zinc-400"}`}
                  style={isDragging ? { color: "#f43f5e" } : {}}
                />
                <div
                  className={`text-lg font-medium mb-1 ${isDragging ? "" : "text-zinc-700 dark:text-zinc-300"}`}
                  style={isDragging ? { color: "#f43f5e" } : {}}
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
                  <FileText style={{ color: "#f43f5e" }} className="w-5 h-5" />
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
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
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings style={{ color: "#f43f5e" }} className="w-5 h-5" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    分割设置
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setSplitMode("perPage")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      splitMode === "perPage"
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                      每页分割
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      每一页保存为独立PDF文件
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode("pages")}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      splitMode === "pages"
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                  >
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                      按范围分割
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      指定页码范围进行分割
                    </div>
                  </button>
                </div>

                {splitMode === "pages" && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      页码范围
                    </label>
                    <input
                      type="text"
                      value={pageRanges}
                      onChange={(e) => setPageRanges(e.target.value)}
                      placeholder="例如：1-3,5,7-9"
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      输入页码范围，多个范围用逗号分隔。例如 1-3,5,7-9 表示将第1-3页、第5页、第7-9页各分割为一个文件。
                    </p>
                  </div>
                )}

                {result ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            分割完成！共 {result.blobs.length} 个文件
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                            总大小：{formatSize(result.totalSize)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadAll}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        全部下载
                      </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {result.blobs.map((blob, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                {pdfInfo.name.replace(/\.pdf$/i, "")}_part{index + 1}.pdf
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatSize(blob.size)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(index)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            下载
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={splitPdf}
                      disabled={isProcessing}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      <RefreshCw className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
                      重新分割
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={splitPdf}
                    disabled={isProcessing || isLibsLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-red-500 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg disabled:shadow-none hover:shadow-xl transition-all active:scale-[0.98] disabled:active:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        分割中... {progress}%
                      </>
                    ) : isLibsLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        加载组件中...
                      </>
                    ) : (
                      <>
                        <Scissors className="w-5 h-5" />
                        开始分割PDF
                      </>
                    )}
                  </button>
                )}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-300"
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
            <div className="p-4 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #f43f5e 10%, transparent)" }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 style={{ color: "#f43f5e" }} className="w-4 h-4" />
                <span className="text-sm font-medium" style={{ color: "#f43f5e" }}>
                  本地处理
                </span>
              </div>
              <p className="text-xs mt-1 ml-6" style={{ color: "color-mix(in srgb, #f43f5e 70%, transparent)" }}>
                PDF文件不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  灵活分割
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                支持按页分割和自定义范围分割
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  批量下载
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                一键下载所有分割后的文件
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
