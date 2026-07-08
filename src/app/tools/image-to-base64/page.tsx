"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Image as ImageIcon, Upload, Copy, Check, Download, Trash2, Info, FileImage } from "lucide-react";

interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  base64: string;
  dataUrl: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageToBase64Page() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [copied, setCopied] = useState<"base64" | "dataUrl" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1] || "";

      const img = new Image();
      img.onload = () => {
        setImageInfo({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          base64,
          dataUrl,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

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
    setImageInfo(null);
    setCopied(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopy = async (text: string, type: "base64" | "dataUrl") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleDownload = () => {
    if (!imageInfo) return;
    const blob = new Blob([imageInfo.base64], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = imageInfo.name.replace(/\.[^.]+$/, "") + "_base64.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="图片转Base64"
      description="上传图片快速转换为Base64编码字符串，本地处理安全可靠，支持多种图片格式"
      toolId="image-to-base64"
      icon={ImageIcon}
      category="转换工具"
      slug="image-to-base64"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                上传图片
              </h2>
            </div>
          </div>

          <div className="p-6">
            {!imageInfo ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-emerald-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isDragging ? "释放鼠标上传图片" : "点击或拖拽上传图片"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 JPG、PNG、GIF、WebP、SVG 等格式
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
                      src={imageInfo.dataUrl}
                      alt="preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      onClick={handleClear}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      重新上传
                    </button>
                  </div>
                </div>

                {/* 图片信息 */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem label="文件名" value={imageInfo.name} />
                    <InfoItem label="文件大小" value={formatSize(imageInfo.size)} />
                    <InfoItem label="图片尺寸" value={`${imageInfo.width} × ${imageInfo.height}`} />
                    <InfoItem label="文件类型" value={imageInfo.type} />
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      Base64 长度: {imageInfo.base64.length.toLocaleString()} 字符
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Data URL 长度: {imageInfo.dataUrl.length.toLocaleString()} 字符
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Base64 结果 */}
        {imageInfo && (
          <>
            {/* Data URL */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Data URL (可直接用于 img src)
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(imageInfo.dataUrl, "dataUrl")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    {copied === "dataUrl" ? (
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
              </div>
              <div className="p-4">
                <textarea
                  readOnly
                  value={imageInfo.dataUrl}
                  className="w-full h-24 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 resize-none break-all"
                />
              </div>
            </div>

            {/* Base64 纯文本 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Base64 纯文本
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-emerald-500 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                  <button
                    onClick={() => handleCopy(imageInfo.base64, "base64")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    {copied === "base64" ? (
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
              </div>
              <div className="p-4">
                <textarea
                  readOnly
                  value={imageInfo.base64}
                  className="w-full h-40 p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono text-zinc-700 dark:text-zinc-300 resize-none break-all"
                />
              </div>
            </div>
          </>
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
              图片转Base64工具可以将图片文件快速转换为Base64编码的字符串。
              所有转换在浏览器本地完成，图片不会上传到服务器，保护您的隐私安全。
              Base64编码的图片可以直接嵌入到HTML、CSS、JSON等文件中，
              适用于网页开发、邮件发送、数据传输等场景。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">本地处理</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">不上传服务器，保护隐私</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">多格式支持</div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">JPG/PNG/GIF/WebP/SVG</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">一键复制</div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">快速复制Base64编码</p>
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
                什么是Base64编码？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Base64是一种将二进制数据编码为ASCII字符串的方法。
                图片转Base64后，可以直接嵌入到HTML、CSS中，无需额外的HTTP请求。
                但会使文件大小增加约33%。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                图片会被上传到服务器吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                不会。所有转换都在您的浏览器本地完成，图片数据不会上传到任何服务器，
                完全保护您的隐私和数据安全。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                支持哪些图片格式？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                支持所有主流图片格式，包括JPG、PNG、GIF、WebP、SVG、BMP等。
                只要是浏览器能够识别的图片格式都可以转换。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</div>
      <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
