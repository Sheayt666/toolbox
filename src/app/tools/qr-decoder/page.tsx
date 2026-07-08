"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  ScanLine,
  Upload,
  Copy,
  Check,
  Trash2,
  Image as ImageIcon,
  Info,
  AlertCircle,
  Clipboard,
} from "lucide-react";

interface DecodeResult {
  text: string;
  imageUrl: string;
  fileName: string;
}

// jsQR 类型声明
declare global {
  interface Window {
    jsQR?: (data: Uint8ClampedArray, width: number, height: number) => { data: string } | null;
  }
}

let jsQRLoaded = false;
let jsQRPromise: Promise<void> | null = null;

// 动态加载 jsQR 库
function loadJsQR(): Promise<void> {
  if (jsQRLoaded) return Promise.resolve();
  if (jsQRPromise) return jsQRPromise;

  jsQRPromise = new Promise((resolve, reject) => {
    // 检查是否已加载
    if (typeof window !== "undefined" && window.jsQR) {
      jsQRLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    script.async = true;
    script.onload = () => {
      jsQRLoaded = true;
      resolve();
    };
    script.onerror = () => {
      jsQRPromise = null;
      reject(new Error("加载二维码解码库失败"));
    };
    document.head.appendChild(script);
  });

  return jsQRPromise;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function QrDecoderPage() {
  const [result, setResult] = useState<DecodeResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 解析二维码
  const decodeQR = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件");
      return;
    }

    setIsDecoding(true);
    setError("");
    setLibraryLoading(true);

    try {
      // 加载 jsQR 库
      await loadJsQR();
      setLibraryLoading(false);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) {
            setError("画布初始化失败");
            setIsDecoding(false);
            return;
          }

          // 限制最大尺寸以提高性能
          const maxSize = 1000;
          let width = img.width;
          let height = img.height;
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            setError("画布上下文获取失败");
            setIsDecoding(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);

          // 使用 jsQR 解码
          if (window.jsQR) {
            const code = window.jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
              setResult({
                text: code.data,
                imageUrl: dataUrl,
                fileName: file.name,
              });
              setError("");
            } else {
              setError("未能识别二维码，请确保图片清晰且包含完整的二维码");
              setResult(null);
            }
          } else {
            setError("二维码解码库加载失败，请刷新页面重试");
          }

          setIsDecoding(false);
        };
        img.onerror = () => {
          setError("图片加载失败");
          setIsDecoding(false);
        };
        img.src = dataUrl;
      };
      reader.onerror = () => {
        setError("文件读取失败");
        setIsDecoding(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "解码失败");
      setIsDecoding(false);
      setLibraryLoading(false);
    }
  }, []);

  // 文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeQR(file);
  };

  // 拖拽处理
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) decodeQR(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // 粘贴图片
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            decodeQR(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [decodeQR]);

  // 复制结果
  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 清空
  const handleClear = () => {
    setResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ToolLayout
      title="二维码解码器"
      description="从图片中解析二维码内容，支持上传和拖拽，快速识别二维码信息，本地处理安全可靠"
      toolId="qr-decoder"
      icon={ScanLine}
      category="生成工具"
      slug="qr-decoder"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 隐藏的 Canvas 用于解码 */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 上传区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  上传二维码图片
                </h2>
              </div>
              {result && (
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  重新上传
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {!result ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-cyan-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-cyan-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isDecoding
                    ? libraryLoading
                      ? "正在加载解码库..."
                      : "正在解析二维码..."
                    : isDragging
                    ? "释放鼠标上传图片"
                    : "点击或拖拽上传图片"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 JPG、PNG、GIF、WebP 等格式，也可直接粘贴图片 (Ctrl+V)
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-6">
                {/* 图片预览 */}
                <div className="flex-shrink-0">
                  <div className="w-full sm:w-48 h-48 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={result.imageUrl}
                      alt="二维码"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {result.fileName}
                  </div>
                </div>

                {/* 结果信息 */}
                <div className="flex-1 space-y-3">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        识别成功
                      </span>
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">
                      内容长度: {result.text.length} 字符
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                识别失败
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* 解码结果 */}
        {result && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-cyan-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  解码结果
                </h2>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </button>
            </div>
            <div className="p-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                <pre className="text-sm text-zinc-800 dark:text-zinc-200 font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {result.text}
                </pre>
              </div>
              {/* 如果是链接，提供打开按钮 */}
              {/^https?:\/\//i.test(result.text) && (
                <a
                  href={result.text}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  <Clipboard className="w-4 h-4" />
                  在新窗口打开链接
                </a>
              )}
            </div>
          </div>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              二维码解码器可以从图片中快速识别并解析二维码内容。
              支持上传图片、拖拽上传和粘贴图片三种方式，
              所有解析都在浏览器本地完成，图片不会上传到服务器，保护您的隐私安全。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">本地处理</div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">不上传服务器，保护隐私</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">多种上传方式</div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">点击/拖拽/粘贴</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">快速识别</div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">毫秒级解析速度</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                二维码图片会被上传到服务器吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                不会。所有二维码解析都在您的浏览器本地完成，使用 jsQR 库进行解码，
                图片数据不会上传到任何服务器，完全保护您的隐私和数据安全。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                支持哪些图片格式？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                支持所有主流图片格式，包括 JPG、PNG、GIF、WebP、BMP 等。
                只要是浏览器能够识别的图片格式都可以解析。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                识别不出来怎么办？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                请确保图片清晰、二维码完整、光线充足。
                如果二维码过小或模糊，可以尝试使用更高分辨率的图片。
                同时确保二维码周围有足够的空白边距。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
