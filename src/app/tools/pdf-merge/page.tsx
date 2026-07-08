"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Files,
  Upload,
  Download,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  RefreshCw,
  FileText,
  Layers,
  GripVertical,
  CheckCircle2,
} from "lucide-react";

interface PdfFile {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
  previewUrl: string; // 第一页预览图
}

interface MergeResult {
  blob: Blob;
  size: number;
  totalPages: number;
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

export default function PdfMergePage() {
  const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [isLibsLoading, setIsLibsLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // 获取 PDF 信息和第一页预览
  const getPdfInfo = useCallback(
    async (file: File, pdfjs: any): Promise<{ pageCount: number; previewUrl: string }> => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;

      // 渲染第一页作为预览
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return { pageCount, previewUrl: "" };
      }
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      const previewUrl = canvas.toDataURL("image/jpeg", 0.6);
      return { pageCount, previewUrl };
    },
    []
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type === "application/pdf");
      if (fileArray.length === 0) {
        alert("请上传PDF文件");
        return;
      }

      setIsLibsLoading(true);
      try {
        const { pdfjs } = await loadLibraries();
        const newFiles: PdfFile[] = [];

        for (const file of fileArray) {
          const { pageCount, previewUrl } = await getPdfInfo(file, pdfjs);
          newFiles.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            size: file.size,
            pageCount,
            previewUrl,
          });
        }

        setPdfFiles((prev) => [...prev, ...newFiles]);
        setResult(null);
      } catch (err) {
        console.error("PDF加载失败:", err);
        alert("部分PDF文件加载失败，请检查文件是否有效");
      } finally {
        setIsLibsLoading(false);
      }
    },
    [loadLibraries, getPdfInfo]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (id: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.id !== id));
    setResult(null);
  };

  const handleClearAll = () => {
    setPdfFiles([]);
    setResult(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
    setResult(null);
  };

  const handleMoveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
    setResult(null);
  };

  // 拖拽排序
  const handleItemDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setPdfFiles((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(dragIndex, 1);
      arr.splice(index, 0, removed);
      return arr;
    });
    setDragIndex(index);
    setResult(null);
  };

  const handleItemDragEnd = () => {
    setDragIndex(null);
  };

  // 合并 PDF
  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      alert("请至少上传2个PDF文件进行合并");
      return;
    }

    setIsMerging(true);
    setProgress(0);
    setResult(null);

    try {
      const { pdfjs, jsPDF } = await loadLibraries();

      let newPdf: any = null;
      let totalPages = 0;
      let processedPages = 0;

      // 统计总页数用于进度
      for (const pdfFile of pdfFiles) {
        totalPages += pdfFile.pageCount;
      }

      for (let fileIndex = 0; fileIndex < pdfFiles.length; fileIndex++) {
        const pdfFile = pdfFiles[fileIndex];
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 }); // 高质量渲染

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;

          const imgData = canvas.toDataURL("image/jpeg", 0.92);
          const pageVp = page.getViewport({ scale: 1 });

          if (!newPdf) {
            newPdf = new jsPDF({
              orientation: pageVp.width > pageVp.height ? "landscape" : "portrait",
              unit: "pt",
              format: [pageVp.width, pageVp.height],
            });
          } else {
            newPdf.addPage([pageVp.width, pageVp.height]);
          }

          newPdf.addImage(imgData, "JPEG", 0, 0, pageVp.width, pageVp.height);

          processedPages++;
          setProgress(Math.round((processedPages / totalPages) * 100));
        }
      }

      const pdfBlob = newPdf.output("blob");
      setResult({
        blob: pdfBlob,
        size: pdfBlob.size,
        totalPages,
      });
    } catch (err) {
      console.error("PDF合并失败:", err);
      alert("PDF合并失败，请重试");
    } finally {
      setIsMerging(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.download = `merged_${Date.now()}.pdf`;
    link.href = URL.createObjectURL(result.blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const totalSize = pdfFiles.reduce((sum, f) => sum + f.size, 0);
  const totalPages = pdfFiles.reduce((sum, f) => sum + f.pageCount, 0);

  return (
    <ToolLayout
      title="PDF合并工具"
      description="在线合并多个PDF文件为一个PDF，支持拖拽调整顺序，本地处理安全可靠，一键下载合并后的PDF"
      toolId="pdf-merge"
      icon={Files}
      category="实用工具"
      slug="pdf-merge"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-cyan-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                上传 PDF 文件
              </h2>
            </div>
            {pdfFiles.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空全部
              </button>
            )}
          </div>

          <div className="p-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-40 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-cyan-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <Files
                className={`w-10 h-10 mb-2 transition-colors ${
                  isDragging ? "text-cyan-500" : "text-zinc-400"
                }`}
              />
              <div
                className={`text-base font-medium mb-1 ${
                  isDragging
                    ? "text-cyan-600 dark:text-cyan-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {isDragging
                  ? "释放鼠标上传PDF"
                  : "点击或拖拽上传PDF文件（支持批量）"}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                支持 PDF 格式，可上传多个文件
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {pdfFiles.length > 0 && (
          <>
            {/* 文件列表 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      文件列表 ({pdfFiles.length}个)
                    </h2>
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    共 {totalPages} 页 · {formatSize(totalSize)}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {pdfFiles.map((pdf, index) => (
                    <div
                      key={pdf.id}
                      draggable
                      onDragStart={() => handleItemDragStart(index)}
                      onDragOver={(e) => handleItemDragOver(e, index)}
                      onDragEnd={handleItemDragEnd}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-move ${
                        dragIndex === index
                          ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 opacity-50"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-cyan-300 dark:hover:border-cyan-600 bg-zinc-50 dark:bg-zinc-800/50"
                      }`}
                    >
                      {/* 拖拽手柄 */}
                      <div className="text-zinc-400 dark:text-zinc-500 flex-shrink-0">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      {/* 序号 */}
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </div>

                      {/* 预览图 */}
                      <div className="w-12 h-16 bg-zinc-200 dark:bg-zinc-700 rounded overflow-hidden flex-shrink-0 border border-zinc-300 dark:border-zinc-600">
                        {pdf.previewUrl ? (
                          <img
                            src={pdf.previewUrl}
                            alt={pdf.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-zinc-400" />
                          </div>
                        )}
                      </div>

                      {/* 文件信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {pdf.name}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {pdf.pageCount} 页
                          </span>
                          <span>{formatSize(pdf.size)}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:bg-cyan-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-100 disabled:hover:text-zinc-600 dark:disabled:hover:bg-zinc-700 dark:disabled:hover:text-zinc-300 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === pdfFiles.length - 1}
                          className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center hover:bg-cyan-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-100 disabled:hover:text-zinc-600 dark:disabled:hover:bg-zinc-700 dark:disabled:hover:text-zinc-300 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(pdf.id)}
                          className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 添加更多 */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all"
                  >
                    <Plus className="w-5 h-5 text-zinc-400" />
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      添加更多PDF文件
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 合并按钮 / 结果 */}
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
                            合并成功！
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                            共 {result.totalPages} 页，文件大小 {formatSize(result.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        下载 PDF
                      </button>
                    </div>

                    <button
                      onClick={handleMerge}
                      disabled={isMerging}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isMerging ? "animate-spin" : ""}`}
                      />
                      重新合并
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleMerge}
                      disabled={isMerging || isLibsLoading || pdfFiles.length < 2}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 disabled:shadow-none hover:shadow-cyan-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                    >
                      {isMerging ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          合并中... {progress}%
                        </>
                      ) : isLibsLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          加载组件中...
                        </>
                      ) : (
                        <>
                          <Files className="w-5 h-5" />
                          开始合并 PDF
                        </>
                      )}
                    </button>

                    {isMerging && (
                      <div className="mt-4">
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {pdfFiles.length < 2 && (
                      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-3">
                        请至少上传2个PDF文件
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                  本地处理
                </span>
              </div>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 ml-6">
                PDF文件不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  拖拽排序
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                支持拖拽调整PDF顺序，灵活便捷
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  批量合并
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                支持多个PDF文件一次性合并
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
