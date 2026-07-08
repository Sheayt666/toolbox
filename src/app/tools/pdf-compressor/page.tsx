"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Settings,
  Zap,
  Gauge,
  Battery,
  RefreshCw,
  File,
  Layers,
  CheckCircle2,
} from "lucide-react";

type CompressionLevel = "high" | "standard" | "strong";

interface PdfInfo {
  name: string;
  originalSize: number;
  pageCount: number;
}

interface CompressionResult {
  blob: Blob;
  size: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// CDN 脚本加载工具
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查是否已加载
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

const compressionLevels: Record<CompressionLevel, { label: string; quality: number; scale: number; description: string; icon: typeof Zap }> = {
  high: {
    label: "高质量",
    quality: 0.9,
    scale: 2,
    description: "保持高清画质，体积略有减少",
    icon: Zap,
  },
  standard: {
    label: "标准压缩",
    quality: 0.6,
    scale: 1.5,
    description: "画质与体积的平衡之选",
    icon: Gauge,
  },
  strong: {
    label: "强力压缩",
    quality: 0.3,
    scale: 1,
    description: "最大程度减小体积，画质有所下降",
    icon: Battery,
  },
};

export default function PdfCompressorPage() {
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("standard");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isLibsLoading, setIsLibsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<File | null>(null);

  // 加载 CDN 库
  const loadLibraries = useCallback(async (): Promise<{ pdfjs: any; jsPDF: any }> => {
    setIsLibsLoading(true);
    try {
      await loadScript(PDFJS_CDN);
      await loadScript(JSPDF_CDN);

      const pdfjs = (window as any).pdfjsLib;
      const jsPDF = (window as any).jspdf?.jsPDF;

      if (!pdfjs) {
        throw new Error("PDF.js 加载失败");
      }
      if (!jsPDF) {
        throw new Error("jsPDF 加载失败");
      }

      // 设置 worker
      pdfjs.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

      return { pdfjs, jsPDF };
    } finally {
      setIsLibsLoading(false);
    }
  }, []);

  // 获取 PDF 页数
  const getPdfPageCount = useCallback(
    async (file: File, pdfjs: any): Promise<number> => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    },
    []
  );

  // 压缩 PDF
  const compressPdf = useCallback(
    async (file: File, level: CompressionLevel) => {
      const { pdfjs, jsPDF } = await loadLibraries();

      const levelConfig = compressionLevels[level];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      // 获取第一页尺寸以确定 PDF 页面方向和大小
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      const isLandscape = viewport.width > viewport.height;

      // 创建新的 PDF
      const newPdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "pt",
        format: [viewport.width, viewport.height],
      });

      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const pageViewport = page.getViewport({ scale: levelConfig.scale });

        // 创建 canvas 渲染页面
        const canvas = document.createElement("canvas");
        canvas.width = pageViewport.width;
        canvas.height = pageViewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        // 渲染 PDF 页面到 canvas
        await page.render({
          canvasContext: ctx,
          viewport: pageViewport,
        }).promise;

        // 将 canvas 转为 JPEG 图片 dataURL
        const imgData = canvas.toDataURL("image/jpeg", levelConfig.quality);

        // 如果不是第一页，添加新页面
        if (i > 1) {
          const pageVp = page.getViewport({ scale: 1 });
          newPdf.addPage([pageVp.width, pageVp.height]);
        }

        // 添加图片到 PDF（使用页面原始尺寸）
        const pageVp = page.getViewport({ scale: 1 });
        newPdf.addImage(imgData, "JPEG", 0, 0, pageVp.width, pageVp.height);

        // 更新进度
        setProgress(Math.round((i / totalPages) * 100));
      }

      // 输出 PDF
      const pdfBlob = newPdf.output("blob");
      return { blob: pdfBlob, size: pdfBlob.size };
    },
    [loadLibraries]
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
      setProgress(0);

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

  const handleCompress = async () => {
    if (!pdfFileRef.current) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const compressionResult = await compressPdf(
        pdfFileRef.current,
        compressionLevel
      );
      setResult(compressionResult);
    } catch (err) {
      console.error("PDF压缩失败:", err);
      alert("PDF压缩失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

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

  const handleDownload = () => {
    if (!result || !pdfInfo) return;

    const link = document.createElement("a");
    link.download = `${pdfInfo.name.replace(/\.pdf$/i, "")}_compressed.pdf`;
    link.href = URL.createObjectURL(result.blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const compressionRatio =
    pdfInfo && result
      ? ((1 - result.size / pdfInfo.originalSize) * 100).toFixed(1)
      : "0";

  return (
    <ToolLayout
      title="PDF压缩工具"
      description="在线压缩PDF文件大小，支持高质量/标准/强力压缩模式，本地处理安全可靠，一键下载压缩后的PDF"
      toolId="pdf-compressor"
      icon={FileText}
      category="实用工具"
      slug="pdf-compressor"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 上传区域 */}
        {!pdfInfo ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-500" />
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
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <FileText
                  className={`w-14 h-14 mb-3 transition-colors ${
                    isDragging ? "text-indigo-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
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
            {/* 文件信息 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
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

            {/* 压缩设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    压缩设置
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(Object.keys(compressionLevels) as CompressionLevel[]).map(
                    (level) => {
                      const config = compressionLevels[level];
                      const Icon = config.icon;
                      return (
                        <button
                          key={level}
                          onClick={() => {
                            setCompressionLevel(level);
                            setResult(null);
                          }}
                          className={`p-4 rounded-xl text-left transition-all border-2 ${
                            compressionLevel === level
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                              : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-zinc-50 dark:bg-zinc-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon
                              className={`w-5 h-5 ${
                                compressionLevel === level
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-zinc-500 dark:text-zinc-400"
                              }`}
                            />
                            <span
                              className={`font-semibold ${
                                compressionLevel === level
                                  ? "text-indigo-700 dark:text-indigo-300"
                                  : "text-zinc-700 dark:text-zinc-300"
                              }`}
                            >
                              {config.label}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            {config.description}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>

                {/* 压缩按钮 / 结果 */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  {result ? (
                    <div className="space-y-4">
                      {/* 压缩结果信息 */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                            原始大小
                          </div>
                          <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {formatSize(pdfInfo.originalSize)}
                          </div>
                        </div>
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                            压缩后大小
                          </div>
                          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {formatSize(result.size)}
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                            压缩率
                          </div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {Number(compressionRatio) > 0 ? "-" : "+"}
                            {Math.abs(Number(compressionRatio))}%
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleCompress}
                          disabled={isProcessing}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${
                              isProcessing ? "animate-spin" : ""
                            }`}
                          />
                          重新压缩
                        </button>
                        <button
                          onClick={handleDownload}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
                        >
                          <Download className="w-4 h-4" />
                          下载压缩 PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleCompress}
                      disabled={isProcessing || isLibsLoading}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 disabled:shadow-none hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          压缩中... {progress}%
                        </>
                      ) : isLibsLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          加载组件中...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          开始压缩
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* 进度条 */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
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
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  本地处理
                </span>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 ml-6">
                PDF文件不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  多档压缩
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                高质量/标准/强力三档模式，按需选择
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  实时进度
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                显示压缩进度，随时了解处理状态
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
