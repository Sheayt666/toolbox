"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  ImagePlus,
  Upload,
  Download,
  Trash2,
  Settings,
  FileImage,
  RefreshCw,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";

interface ConvertedImage {
  id: string;
  name: string;
  originalSize: number;
  originalType: string;
  originalDataUrl: string;
  convertedSize: number;
  convertedDataUrl: string;
  width: number;
  height: number;
  status: "pending" | "processing" | "done" | "error";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getMimeType(format: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    bmp: "image/bmp",
  };
  return map[format] || "image/jpeg";
}

function getExtension(format: string): string {
  return format === "jpeg" ? "jpg" : format;
}

export default function ImageConverterPage() {
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [outputFormat, setOutputFormat] = useState("webp");
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertImage = useCallback(
    (
      dataUrl: string,
      format: string,
      qualityValue: number
    ): Promise<{ dataUrl: string; size: number; width: number; height: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("无法创建Canvas上下文"));
            return;
          }

          // 对于JPG和BMP格式，先填充白色背景
          const mimeType = getMimeType(format);
          if (mimeType === "image/jpeg" || mimeType === "image/bmp") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue / 100);
          const base64 = convertedDataUrl.split(",")[1];
          const size = Math.round((base64.length * 3) / 4);

          resolve({
            dataUrl: convertedDataUrl,
            size,
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = dataUrl;
      });
    },
    []
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (fileArray.length === 0) {
        alert("请上传图片文件");
        return;
      }

      const newImages: ConvertedImage[] = [];

      for (const file of fileArray) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("文件读取失败"));
          reader.readAsDataURL(file);
        });

        newImages.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          originalSize: file.size,
          originalType: file.type,
          originalDataUrl: dataUrl,
          convertedSize: 0,
          convertedDataUrl: "",
          width: 0,
          height: 0,
          status: "pending",
        });
      }

      setImages((prev) => [...prev, ...newImages]);
    },
    []
  );

  // 当输出格式或质量改变时重新转换所有图片
  useEffect(() => {
    if (images.length === 0) return;

    const convertAll = async () => {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.status === "processing") continue;

        setImages((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "processing" } : item
          )
        );

        try {
          const result = await convertImage(
            img.originalDataUrl,
            outputFormat,
            quality
          );
          setImages((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    convertedSize: result.size,
                    convertedDataUrl: result.dataUrl,
                    width: result.width,
                    height: result.height,
                    status: "done",
                  }
                : item
            )
          );
        } catch {
          setImages((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "error" } : item
            )
          );
        }
      }
    };

    const timer = setTimeout(convertAll, 200);
    return () => clearTimeout(timer);
  }, [outputFormat, quality]);

  // 新增图片时进行转换
  useEffect(() => {
    const pendingImages = images.filter((img) => img.status === "pending");
    if (pendingImages.length === 0) return;

    const convertPending = async () => {
      for (const img of pendingImages) {
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id ? { ...item, status: "processing" } : item
          )
        );

        try {
          const result = await convertImage(
            img.originalDataUrl,
            outputFormat,
            quality
          );
          setImages((prev) =>
            prev.map((item) =>
              item.id === img.id
                ? {
                    ...item,
                    convertedSize: result.size,
                    convertedDataUrl: result.dataUrl,
                    width: result.width,
                    height: result.height,
                    status: "done",
                  }
                : item
            )
          );
        } catch {
          setImages((prev) =>
            prev.map((item) =>
              item.id === img.id ? { ...item, status: "error" } : item
            )
          );
        }
      }
    };

    convertPending();
  }, [images.length, outputFormat, quality, convertImage]);

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
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
  };

  const handleDownload = (img: ConvertedImage) => {
    if (img.status !== "done") return;
    const link = document.createElement("a");
    link.download = `${img.name.replace(/\.[^.]+$/, "")}.${getExtension(outputFormat)}`;
    link.href = img.convertedDataUrl;
    link.click();
  };

  const handleDownloadAll = () => {
    const doneImages = images.filter((img) => img.status === "done");
    doneImages.forEach((img, index) => {
      setTimeout(() => handleDownload(img), index * 200);
    });
  };

  const doneCount = images.filter((img) => img.status === "done").length;

  return (
    <ToolLayout
      title="图片格式转换"
      description="图片格式互转，支持JPG、PNG、WebP、BMP等多种格式，批量转换，质量可调，本地处理安全可靠"
      toolId="image-converter"
      icon={ImagePlus}
      category="图片工具"
      slug="image-converter"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                上传图片
              </h2>
            </div>
            {images.length > 0 && (
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
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <ImagePlus
                className={`w-10 h-10 mb-2 transition-colors ${
                  isDragging ? "text-amber-500" : "text-zinc-400"
                }`}
              />
              <div
                className={`text-base font-medium mb-1 ${
                  isDragging
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {isDragging
                  ? "释放鼠标上传图片"
                  : "点击或拖拽上传图片（支持批量）"}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                支持 JPG、PNG、WebP、BMP、GIF 格式
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <>
            {/* 转换设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    转换设置
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 输出格式 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      <FileImage className="w-4 h-4 text-amber-500" />
                      目标格式
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: "jpg", label: "JPG" },
                        { value: "png", label: "PNG" },
                        { value: "webp", label: "WebP" },
                        { value: "bmp", label: "BMP" },
                      ].map((fmt) => (
                        <button
                          key={fmt.value}
                          onClick={() => setOutputFormat(fmt.value)}
                          className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            outputFormat === fmt.value
                              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-600"
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 输出质量 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <ImageIcon className="w-4 h-4 text-amber-500" />
                        输出质量
                      </label>
                      <span className="text-sm font-bold text-amber-500">
                        {quality}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                      <span>低质量</span>
                      <span>高质量</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                      仅对 JPG 和 WebP 格式有效，PNG/BMP 为无损格式
                    </p>
                  </div>
                </div>

                {/* 批量下载 */}
                {doneCount > 0 && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        已完成{" "}
                        <span className="font-bold text-amber-500">
                          {doneCount}
                        </span>{" "}
                        / {images.length} 张
                      </div>
                      <button
                        onClick={handleDownloadAll}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        全部下载
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 图片列表 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    转换列表
                  </h2>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="relative group bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                    >
                      {/* 删除按钮 */}
                      <button
                        onClick={() => handleRemove(img.id)}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* 图片预览 */}
                      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        {img.status === "processing" ? (
                          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                        ) : img.status === "error" ? (
                          <div className="text-center text-red-500">
                            <X className="w-8 h-8 mx-auto mb-1" />
                            <span className="text-xs">转换失败</span>
                          </div>
                        ) : (
                          <img
                            src={img.convertedDataUrl || img.originalDataUrl}
                            alt={img.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        )}
                      </div>

                      {/* 图片信息 */}
                      <div className="p-3 space-y-2">
                        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {img.name}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 dark:text-zinc-500">
                            {formatSize(img.originalSize)}
                          </span>
                          {img.status === "done" && (
                            <>
                              <span className="text-zinc-400">→</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                {formatSize(img.convertedSize)}
                              </span>
                            </>
                          )}
                          {img.status === "done" && (
                            <Check className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                        {img.status === "done" && (
                          <button
                            onClick={() => handleDownload(img)}
                            className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-amber-500 dark:hover:bg-amber-500 text-zinc-700 dark:text-zinc-300 hover:text-white text-xs font-medium rounded-lg transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            下载
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                批量转换
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                支持批量上传多张图片转换
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                本地处理
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                图片不上传服务器，保护隐私
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                多格式支持
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                JPG/PNG/WebP/BMP 格式互转
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
