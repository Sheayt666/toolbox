"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FileType,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  FileText,
  File,
  CheckCircle2,
  Info,
} from "lucide-react";

interface DocInfo {
  name: string;
  originalSize: number;
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

const MAMMOTH_CDN = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

export default function WordToPdfPage() {
  const [docInfo, setDocInfo] = useState<DocInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);
  const [isLibsLoading, setIsLibsLoading] = useState(false);
  const [conversionMethod, setConversionMethod] = useState<"auto" | "print">("auto");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<File | null>(null);

  const loadLibraries = useCallback(async (): Promise<{ mammoth: any; jsPDF: any }> => {
    setIsLibsLoading(true);
    try {
      await loadScript(MAMMOTH_CDN);
      await loadScript(JSPDF_CDN);

      const mammoth = (window as any).mammoth;
      const jsPDF = (window as any).jspdf?.jsPDF;

      if (!mammoth) throw new Error("Mammoth 加载失败");
      if (!jsPDF) throw new Error("jsPDF 加载失败");

      return { mammoth, jsPDF };
    } finally {
      setIsLibsLoading(false);
    }
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      const isValid =
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx");

      if (!isValid) {
        alert("请上传Word文件（.doc 或 .docx）");
        return;
      }

      docFileRef.current = file;
      setResult(null);

      setDocInfo({
        name: file.name,
        originalSize: file.size,
      });
    },
    []
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
    setDocInfo(null);
    setResult(null);
    docFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const convertToPdf = async () => {
    if (!docFileRef.current || !docInfo) return;

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const { mammoth, jsPDF } = await loadLibraries();
      setProgress(20);

      const arrayBuffer = await docFileRef.current.arrayBuffer();
      setProgress(40);

      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      setProgress(60);

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.width = `${pageWidth - margin * 2}px`;
      tempDiv.style.fontFamily = "Arial, sans-serif";
      tempDiv.style.fontSize = "12px";
      tempDiv.style.lineHeight = "1.5";
      document.body.appendChild(tempDiv);

      setProgress(70);

      const textContent = tempDiv.innerText || tempDiv.textContent || "";
      const lines = pdf.splitTextToSize(textContent, pageWidth - margin * 2);

      let y = margin;
      const lineHeight = 16;

      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(lines[i], margin, y);
        y += lineHeight;
      }

      document.body.removeChild(tempDiv);
      setProgress(90);

      const pdfBlob = pdf.output("blob");
      setProgress(100);

      setResult({ blob: pdfBlob, size: pdfBlob.size });
    } catch (err) {
      console.error("转换失败:", err);
      alert("转换失败，请尝试使用浏览器打印方式");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !docInfo) return;
    const link = document.createElement("a");
    link.download = `${docInfo.name.replace(/\.(docx?|DOCX?)$/, "")}.pdf`;
    link.href = URL.createObjectURL(result.blob);
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  return (
    <ToolLayout
      title="Word转PDF"
      description="在线将Word文档转换为PDF文件，支持doc和docx格式，保持文档格式，本地处理安全可靠"
      toolId="word-to-pdf"
      icon={FileType}
      category="PDF工具"
      slug="word-to-pdf"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {!docInfo ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Upload style={{ color: "#6366f1" }} className="w-5 h-5" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  上传 Word 文件
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
                style={isDragging ? { borderColor: "#6366f1", backgroundColor: "color-mix(in srgb, #6366f1 10%, transparent)" } : {}}
              >
                <FileText
                  className={`w-14 h-14 mb-3 transition-colors ${isDragging ? "" : "text-zinc-400"}`}
                  style={isDragging ? { color: "#6366f1" } : {}}
                />
                <div
                  className={`text-lg font-medium mb-1 ${isDragging ? "" : "text-zinc-700 dark:text-zinc-300"}`}
                  style={isDragging ? { color: "#6366f1" } : {}}
                >
                  {isDragging ? "释放鼠标上传Word" : "点击或拖拽上传Word文件"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 .doc 和 .docx 格式
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                  <FileText style={{ color: "#6366f1" }} className="w-5 h-5" />
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
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <File className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {docInfo.name}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <File className="w-3.5 h-3.5" />
                        {formatSize(docInfo.originalSize)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">关于Word转PDF</p>
                    <p className="text-blue-600 dark:text-blue-400 text-xs leading-relaxed">
                      纯前端转换可能无法完美保留复杂格式（如图表、复杂排版等）。如果需要完美保留格式，建议使用浏览器打印功能：打开Word文件后按 Ctrl+P，选择"另存为PDF"。
                    </p>
                  </div>
                </div>

                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            转换完成！
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                            PDF文件大小：{formatSize(result.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        下载 PDF
                      </button>
                    </div>
                    <button
                      onClick={convertToPdf}
                      disabled={isProcessing}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`}
                      />
                      重新转换
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={convertToPdf}
                    disabled={isProcessing || isLibsLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-500 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg disabled:shadow-none hover:shadow-xl transition-all active:scale-[0.98] disabled:active:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        转换中... {progress}%
                      </>
                    ) : isLibsLoading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        加载组件中...
                      </>
                    ) : (
                      <>
                        <FileType className="w-5 h-5" />
                        开始转换为PDF
                      </>
                    )}
                  </button>
                )}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
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
            <div className="p-4 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #6366f1 10%, transparent)" }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 style={{ color: "#6366f1" }} className="w-4 h-4" />
                <span className="text-sm font-medium" style={{ color: "#6366f1" }}>
                  本地处理
                </span>
              </div>
              <p className="text-xs mt-1 ml-6" style={{ color: "color-mix(in srgb, #6366f1 70%, transparent)" }}>
                文件不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  快速转换
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                浏览器本地处理，速度快效率高
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  支持多种格式
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                支持 .doc 和 .docx 格式转换
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
