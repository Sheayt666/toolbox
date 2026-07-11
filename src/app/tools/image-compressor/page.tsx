"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  ImageDown,
  Upload,
  Download,
  Trash2,
  Settings,
  Percent,
  FileImage,
  ArrowRight,
  RefreshCw,
  X,
  History,
  Plus,
  Check,
  Zap,
  Maximize2,
  Layers,
  TrendingDown,
  Clipboard,
  Sparkles,
  Eye,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Wand2,
  Package,
} from "lucide-react";

// ==================== Types ====================

interface ImageItem {
  id: string;
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  compressedSize: number;
  compressedDataUrl: string;
  compressedWidth: number;
  compressedHeight: number;
  type: string;
  status: "pending" | "processing" | "done" | "error";
  errorMessage?: string;
}

interface HistoryRecord {
  id: string;
  name: string;
  imageCount: number;
  totalOriginalSize: number;
  totalCompressedSize: number;
  ratio: number;
  date: string;
  format: string;
}

interface UserSettings {
  quality: number;
  outputFormat: string;
  resizeMode: ResizeMode;
  resizeValue: number;
  smartMode: boolean;
}

type ResizeMode = "none" | "width" | "height" | "percentage";

// ==================== Constants ====================

const MAX_IMAGES = 20;
const SETTINGS_KEY = "ic-pro-settings";
const HISTORY_KEY = "ic-pro-history";
const MAX_HISTORY = 10;

// ==================== Utility Functions ====================

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
  };
  return map[format] || "image/jpeg";
}

function getExtension(format: string): string {
  return format === "jpeg" ? "jpg" : format;
}

function getEffectiveFormat(imageType: string, outputFormat: string): string {
  if (outputFormat !== "auto") return outputFormat;
  if (imageType === "image/png") return "png";
  if (imageType === "image/webp") return "webp";
  return "jpg";
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function computeTargetDimensions(
  origW: number,
  origH: number,
  resizeMode: ResizeMode,
  resizeValue: number
): { width: number; height: number } {
  if (resizeMode === "none" || resizeValue <= 0) {
    return { width: origW, height: origH };
  }
  if (resizeMode === "width") {
    const ratio = resizeValue / origW;
    return { width: Math.round(resizeValue), height: Math.round(origH * ratio) };
  }
  if (resizeMode === "height") {
    const ratio = resizeValue / origH;
    return { width: Math.round(origW * ratio), height: Math.round(resizeValue) };
  }
  if (resizeMode === "percentage") {
    const ratio = resizeValue / 100;
    return {
      width: Math.max(1, Math.round(origW * ratio)),
      height: Math.max(1, Math.round(origH * ratio)),
    };
  }
  return { width: origW, height: origH };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
  });
}

// ==================== Core Compression Functions ====================

async function compressImage(
  dataUrl: string,
  quality: number,
  format: string,
  resizeMode: ResizeMode,
  resizeValue: number
): Promise<{ dataUrl: string; size: number; width: number; height: number }> {
  const img = await loadImage(dataUrl);
  const { width, height } = computeTargetDimensions(
    img.naturalWidth,
    img.naturalHeight,
    resizeMode,
    resizeValue
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法创建Canvas上下文");
  }

  // For JPEG, fill white background to handle transparency
  const mimeType = getMimeType(format);
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  // Use high quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  // PNG is lossless, quality parameter is ignored
  const qualityValue = format === "png" ? undefined : quality / 100;
  const compressedDataUrl = canvas.toDataURL(mimeType, qualityValue);

  // Calculate size from base64
  const base64 = compressedDataUrl.split(",")[1] || "";
  const size = Math.round((base64.length * 3) / 4);

  return { dataUrl: compressedDataUrl, size, width, height };
}

async function smartCompress(
  dataUrl: string,
  originalSize: number,
  format: string,
  resizeMode: ResizeMode,
  resizeValue: number
): Promise<{ dataUrl: string; size: number; width: number; height: number }> {
  // PNG is lossless, quality doesn't affect compression
  if (format === "png") {
    return compressImage(dataUrl, 100, format, resizeMode, resizeValue);
  }

  // Try quality levels from high to low, pick the best balance
  const qualities = [85, 70, 55];
  let bestResult = await compressImage(dataUrl, 85, format, resizeMode, resizeValue);

  // If already well-compressed at 85, use it
  if (bestResult.size < originalSize * 0.75) {
    return bestResult;
  }

  for (const q of qualities) {
    const result = await compressImage(dataUrl, q, format, resizeMode, resizeValue);
    // Accept if compression achieves < 75% of original
    if (result.size < originalSize * 0.75) {
      // But don't over-compress - if 85 quality was within 90%, prefer it
      if (q === 70 && bestResult.size < originalSize * 0.9) {
        return bestResult;
      }
      return result;
    }
    if (result.size < bestResult.size) {
      bestResult = result;
    }
  }

  return bestResult;
}

function loadSettings(): UserSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserSettings;
    return {
      quality: typeof parsed.quality === "number" ? parsed.quality : 80,
      outputFormat: parsed.outputFormat || "auto",
      resizeMode: parsed.resizeMode || "none",
      resizeValue: typeof parsed.resizeValue === "number" ? parsed.resizeValue : 100,
      smartMode: typeof parsed.smartMode === "boolean" ? parsed.smartMode : false,
    };
  } catch {
    return null;
  }
}

function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryRecord[];
  } catch {
    return [];
  }
}

function saveHistory(records: HistoryRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
  } catch {
    // ignore
  }
}

// ==================== Main Component ====================

export default function ImageCompressorPage() {
  // --- State ---
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState("auto");
  const [resizeMode, setResizeMode] = useState<ResizeMode>("none");
  const [resizeValue, setResizeValue] = useState(100);
  const [smartMode, setSmartMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecompressing, setIsRecompressing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<"side" | "slider">("slider");
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showResizePanel, setShowResizePanel] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const settingsRef = useRef({ quality, outputFormat, resizeMode, resizeValue, smartMode });

  // Keep refs in sync
  imagesRef.current = images;
  settingsRef.current = { quality, outputFormat, resizeMode, resizeValue, smartMode };

  // --- Load settings and history on mount ---
  useEffect(() => {
    const saved = loadSettings();
    if (saved) {
      setQuality(saved.quality);
      setOutputFormat(saved.outputFormat);
      setResizeMode(saved.resizeMode);
      setResizeValue(saved.resizeValue);
      setSmartMode(saved.smartMode);
      if (saved.resizeMode !== "none") {
        setShowResizePanel(true);
      }
    }
    setHistory(loadHistory());
  }, []);

  // --- Save settings when they change ---
  useEffect(() => {
    saveSettings({ quality, outputFormat, resizeMode, resizeValue, smartMode });
  }, [quality, outputFormat, resizeMode, resizeValue, smartMode]);

  // --- Show toast ---
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // --- Slider drag handlers ---
  const updateSliderFromEvent = useCallback((clientX: number) => {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  }, []);

  useEffect(() => {
    if (!isDraggingSlider) return;

    const onMouseMove = (e: MouseEvent) => updateSliderFromEvent(e.clientX);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) updateSliderFromEvent(e.touches[0].clientX);
    };
    const onEnd = () => setIsDraggingSlider(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDraggingSlider, updateSliderFromEvent]);

  // --- Handle files (upload + compress) ---
  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      showToast("请上传图片文件（JPG/PNG/WebP）");
      return;
    }

    const currentCount = imagesRef.current.length;
    const remainingSlots = MAX_IMAGES - currentCount;
    if (remainingSlots <= 0) {
      showToast(`最多支持 ${MAX_IMAGES} 张图片`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      showToast(`已达到 ${MAX_IMAGES} 张上限，仅处理前 ${remainingSlots} 张`);
    }

    const { quality: q, outputFormat: fmt, resizeMode: rm, resizeValue: rv, smartMode: sm } =
      settingsRef.current;

    setIsProcessing(true);
    setProcessingProgress(0);

    const newImages: ImageItem[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const img = await loadImage(dataUrl);

        const format = getEffectiveFormat(file.type, fmt);
        const result = sm
          ? await smartCompress(dataUrl, file.size, format, rm, rv)
          : await compressImage(dataUrl, q, format, rm, rv);

        const newItem: ImageItem = {
          id: generateId(),
          name: file.name,
          originalSize: file.size,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          originalDataUrl: dataUrl,
          compressedSize: result.size,
          compressedDataUrl: result.dataUrl,
          compressedWidth: result.width,
          compressedHeight: result.height,
          type: file.type,
          status: "done",
        };
        newImages.push(newItem);
      } catch (err) {
        const newItem: ImageItem = {
          id: generateId(),
          name: file.name,
          originalSize: file.size,
          originalWidth: 0,
          originalHeight: 0,
          originalDataUrl: "",
          compressedSize: 0,
          compressedDataUrl: "",
          compressedWidth: 0,
          compressedHeight: 0,
          type: file.type,
          status: "error",
          errorMessage: err instanceof Error ? err.message : "处理失败",
        };
        newImages.push(newItem);
      }

      setProcessingProgress(((i + 1) / filesToProcess.length) * 100);
      // Yield to let UI update
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setImages((prev) => {
      const updated = [...prev, ...newImages];
      // Auto-select first new image if none selected
      if (!selectedImageId && updated.length > 0) {
        setSelectedImageId(updated[0].id);
      }
      return updated;
    });

    setIsProcessing(false);
    setProcessingProgress(0);
  }, [selectedImageId, showToast]);

  // --- Paste handler ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFiles]);

  // --- Re-compress all images when settings change (debounced) ---
  useEffect(() => {
    if (imagesRef.current.length === 0) return;

    const timer = setTimeout(async () => {
      setIsRecompressing(true);
      try {
        const currentImages = imagesRef.current;
        const updated: ImageItem[] = [];

        for (let i = 0; i < currentImages.length; i++) {
          const imgItem = currentImages[i];
          if (imgItem.status === "error" || !imgItem.originalDataUrl) {
            updated.push(imgItem);
            continue;
          }
          try {
            const format = getEffectiveFormat(imgItem.type, outputFormat);
            const result = smartMode
              ? await smartCompress(
                  imgItem.originalDataUrl,
                  imgItem.originalSize,
                  format,
                  resizeMode,
                  resizeValue
                )
              : await compressImage(
                  imgItem.originalDataUrl,
                  quality,
                  format,
                  resizeMode,
                  resizeValue
                );

            updated.push({
              ...imgItem,
              compressedDataUrl: result.dataUrl,
              compressedSize: result.size,
              compressedWidth: result.width,
              compressedHeight: result.height,
              status: "done" as const,
              errorMessage: undefined,
            });
          } catch {
            updated.push({
              ...imgItem,
              status: "error" as const,
              errorMessage: "重新压缩失败",
            });
          }
          // Yield to UI
          if (i % 3 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        setImages(updated);
      } finally {
        setIsRecompressing(false);
      }
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, outputFormat, resizeMode, resizeValue, smartMode]);

  // --- File input handlers ---
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // --- Download handlers ---
  const handleDownload = useCallback(
    (image: ImageItem) => {
      if (image.status !== "done" || !image.compressedDataUrl) return;
      const format = getEffectiveFormat(image.type, outputFormat);
      const link = document.createElement("a");
      link.download = `${image.name.replace(/\.[^.]+$/, "")}_compressed.${getExtension(format)}`;
      link.href = image.compressedDataUrl;
      link.click();

      // Save to history
      const record: HistoryRecord = {
        id: generateId(),
        name: image.name,
        imageCount: 1,
        totalOriginalSize: image.originalSize,
        totalCompressedSize: image.compressedSize,
        ratio: (1 - image.compressedSize / image.originalSize) * 100,
        date: new Date().toISOString(),
        format: format.toUpperCase(),
      };
      const newHistory = [record, ...history].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);
    },
    [outputFormat, history]
  );

  const handleDownloadAll = useCallback(async () => {
    const downloadable = images.filter((img) => img.status === "done" && img.compressedDataUrl);
    if (downloadable.length === 0) return;

    for (let i = 0; i < downloadable.length; i++) {
      const img = downloadable[i];
      const format = getEffectiveFormat(img.type, outputFormat);
      const link = document.createElement("a");
      link.download = `${img.name.replace(/\.[^.]+$/, "")}_compressed.${getExtension(format)}`;
      link.href = img.compressedDataUrl;
      link.click();
      if (i < downloadable.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    // Save batch to history
    const totalOriginal = downloadable.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressed = downloadable.reduce((sum, img) => sum + img.compressedSize, 0);
    const record: HistoryRecord = {
      id: generateId(),
      name:
        downloadable.length === 1
          ? downloadable[0].name
          : `批量压缩 (${downloadable.length}张)`,
      imageCount: downloadable.length,
      totalOriginalSize: totalOriginal,
      totalCompressedSize: totalCompressed,
      ratio: (1 - totalCompressed / totalOriginal) * 100,
      date: new Date().toISOString(),
      format: "混合",
    };
    const newHistory = [record, ...history].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    saveHistory(newHistory);

    showToast(`已下载 ${downloadable.length} 张图片`);
  }, [images, outputFormat, history, showToast]);

  // --- Image management ---
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    setImages([]);
    setSelectedImageId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  // --- Computed values ---
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) || null,
    [images, selectedImageId]
  );

  const stats = useMemo(() => {
    const done = images.filter((img) => img.status === "done");
    const totalOriginal = done.reduce((sum, img) => sum + img.originalSize, 0);
    const totalCompressed = done.reduce((sum, img) => sum + img.compressedSize, 0);
    const saved = totalOriginal - totalCompressed;
    const avgRatio = totalOriginal > 0 ? (1 - totalCompressed / totalOriginal) * 100 : 0;
    return {
      count: done.length,
      totalOriginal,
      totalCompressed,
      saved,
      avgRatio,
    };
  }, [images]);

  const isQualityDisabled = smartMode || outputFormat === "png";

  // ==================== Render ====================

  return (
    <ToolLayout
      title="图片压缩工具 Pro"
      description="批量图片压缩，支持JPG/PNG/WebP格式互转、智能优化、尺寸调整、Before/After滑块对比，本地处理安全可靠，超越TinyPNG和Squoosh的在线图片压缩工具"
      toolId="image-compressor"
      icon={ImageDown}
      category="图片工具"
      slug="image-compressor"
    >
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* === Upload Zone === */}
        {images.length === 0 ? (
          <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageDown className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    上传图片
                  </h2>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:flex items-center gap-1">
                  <Clipboard className="w-3.5 h-3.5" />
                  支持 Ctrl+V 粘贴上传
                </span>
              </div>
            </div>
            <div className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 sm:h-80 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20"
                    : "border-zinc-300 dark:border-zinc-600 hover:border-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                      isDragging
                        ? "bg-rose-500 text-white scale-110"
                        : "bg-rose-500/10 text-rose-500"
                    }`}
                  >
                    <Upload className="w-8 h-8" />
                  </div>
                  <div
                    className={`text-lg font-semibold mb-1.5 ${
                      isDragging
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-zinc-700 dark:text-zinc-200"
                    }`}
                  >
                    {isDragging ? "释放鼠标上传图片" : "点击、拖拽或粘贴上传图片"}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
                    支持 JPG、PNG、WebP 格式，最多 {MAX_IMAGES} 张，批量压缩一键下载
                  </div>
                  <div className="flex items-center gap-3 mt-4 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      批量处理
                    </span>
                    <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-600" />
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      智能优化
                    </span>
                    <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-600" />
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      滑块对比
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* === Compact Add More Bar === */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                添加图片
                <span className="text-xs opacity-75">
                  ({images.length}/{MAX_IMAGES})
                </span>
              </button>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-medium rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                清空全部
              </button>
              <div className="hidden sm:block flex-1" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 text-sm rounded-xl transition-all"
              >
                <Clipboard className="w-4 h-4" />
                或按 Ctrl+V 粘贴
              </button>
            </div>

            {/* === Processing Progress === */}
            {(isProcessing || isRecompressing) && (
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800/50 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />
                  <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    {isProcessing
                      ? `正在处理图片... ${Math.round(processingProgress)}%`
                      : "正在重新压缩..."}
                  </span>
                </div>
                <div className="h-2 bg-rose-200 dark:bg-rose-900/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{
                      width: isProcessing ? `${processingProgress}%` : "100%",
                    }}
                  />
                </div>
              </div>
            )}

            {/* === Settings Panel === */}
            <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    压缩设置
                  </h2>
                  {isRecompressing && (
                    <span className="ml-auto flex items-center gap-1.5 text-xs text-rose-500">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      更新中...
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-5">
                {/* Smart Mode Toggle */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Wand2 className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        智能优化模式
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        自动选择最佳质量参数，肉眼无损最大化压缩
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSmartMode(!smartMode)}
                    className={`relative w-11 h-6 rounded-full transition-all ${
                      smartMode ? "bg-violet-500" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                    aria-label="切换智能优化模式"
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                        smartMode ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Quality Slider */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <Percent className="w-4 h-4 text-rose-500" />
                      压缩质量
                    </label>
                    <span
                      className={`text-sm font-bold ${
                        isQualityDisabled
                          ? "text-zinc-400 dark:text-zinc-600"
                          : "text-rose-500"
                      }`}
                    >
                      {smartMode ? "智能" : `${quality}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    disabled={isQualityDisabled}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                  <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    <span>体积小</span>
                    <span>平衡</span>
                    <span>画质高</span>
                  </div>
                  {outputFormat === "png" && !smartMode && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      PNG 为无损格式，质量设置不影响压缩结果
                    </p>
                  )}
                </div>

                {/* Output Format */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    <FileImage className="w-4 h-4 text-rose-500" />
                    输出格式
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "auto", label: "自动" },
                      { value: "jpg", label: "JPG" },
                      { value: "png", label: "PNG" },
                      { value: "webp", label: "WebP" },
                    ].map((fmt) => (
                      <button
                        key={fmt.value}
                        onClick={() => setOutputFormat(fmt.value)}
                        className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          outputFormat === fmt.value
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                            : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resize Options */}
                <div>
                  <button
                    onClick={() => setShowResizePanel(!showResizePanel)}
                    className="flex items-center justify-between w-full text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3"
                  >
                    <span className="flex items-center gap-2">
                      <Maximize2 className="w-4 h-4 text-rose-500" />
                      尺寸调整
                      {resizeMode !== "none" && (
                        <span className="px-2 py-0.5 text-xs bg-rose-500/10 text-rose-500 rounded-md">
                          已启用
                        </span>
                      )}
                    </span>
                    {showResizePanel ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showResizePanel && (
                    <div className="space-y-3 p-3 bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: "none", label: "原始" },
                          { value: "width", label: "按宽度" },
                          { value: "height", label: "按高度" },
                          { value: "percentage", label: "按百分比" },
                        ].map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() =>
                              setResizeMode(mode.value as ResizeMode)
                            }
                            className={`px-2 py-2 rounded-lg font-medium text-xs transition-all ${
                              resizeMode === mode.value
                                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                                : "bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>

                      {resizeMode !== "none" && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={resizeMode === "percentage" ? "100" : "10000"}
                            value={resizeValue}
                            onChange={(e) =>
                              setResizeValue(Math.max(1, Number(e.target.value)))
                            }
                            className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-rose-400"
                            placeholder={
                              resizeMode === "width"
                                ? "目标宽度（像素）"
                                : resizeMode === "height"
                                ? "目标高度（像素）"
                                : "缩放百分比（1-100）"
                            }
                          />
                          <span className="text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            {resizeMode === "percentage" ? "%" : "px"}
                          </span>
                        </div>
                      )}

                      {resizeMode !== "none" && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          自动保持宽高比，不会变形
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* === Statistics Panel === */}
            {stats.count > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    处理图片
                  </div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stats.count}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-1">
                      张
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    节省空间
                  </div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatSize(stats.saved)}
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    平均压缩率
                  </div>
                  <div className="text-xl font-bold text-rose-500">
                    {stats.avgRatio > 0 ? "-" : "+"}
                    {Math.abs(stats.avgRatio).toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
                    <Package className="w-3.5 h-3.5" />
                    压缩后总大小
                  </div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {formatSize(stats.totalCompressed)}
                  </div>
                </div>
              </div>
            )}

            {/* === Preview Area (Before/After Comparison) === */}
            {selectedImage && selectedImage.status === "done" && (
              <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/50 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Eye className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      画质对比
                    </h2>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {selectedImage.name}
                    </span>
                  </div>
                  <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-0.5">
                    <button
                      onClick={() => setCompareMode("slider")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        compareMode === "slider"
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      滑块对比
                    </button>
                    <button
                      onClick={() => setCompareMode("side")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        compareMode === "side"
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      左右对比
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {compareMode === "slider" ? (
                    /* === Slider Comparison (Squoosh-style) === */
                    <div
                      ref={compareRef}
                      className="relative aspect-video bg-zinc-900 dark:bg-black rounded-xl overflow-hidden cursor-ew-resize select-none group"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsDraggingSlider(true);
                        updateSliderFromEvent(e.clientX);
                      }}
                      onTouchStart={(e) => {
                        setIsDraggingSlider(true);
                        if (e.touches.length > 0)
                          updateSliderFromEvent(e.touches[0].clientX);
                      }}
                    >
                      {/* After (compressed) - bottom layer */}
                      <div
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${selectedImage.compressedDataUrl})`,
                        }}
                      />
                      {/* Before (original) - top layer, clipped */}
                      <div
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${selectedImage.originalDataUrl})`,
                          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                        }}
                      />
                      {/* Slider line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-zinc-600 rotate-90" />
                        </div>
                      </div>
                      {/* Labels */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-md z-20 pointer-events-none font-medium">
                        原图 {formatSize(selectedImage.originalSize)}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 text-white text-xs rounded-md z-20 pointer-events-none font-medium">
                        压缩后 {formatSize(selectedImage.compressedSize)}
                      </div>
                      {/* Hint */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/40 text-white/80 text-xs rounded-full z-20 pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity">
                        拖动滑块对比画质
                      </div>
                    </div>
                  ) : (
                    /* === Side by Side === */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                            原图
                          </span>
                          <span className="text-sm text-zinc-500 dark:text-zinc-500">
                            {formatSize(selectedImage.originalSize)}
                          </span>
                        </div>
                        <div className="aspect-video bg-zinc-900 dark:bg-black rounded-xl overflow-hidden flex items-center justify-center">
                          <img
                            src={selectedImage.originalDataUrl}
                            alt="原图"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                          {selectedImage.originalWidth} ×{" "}
                          {selectedImage.originalHeight}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            压缩后
                          </span>
                          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatSize(selectedImage.compressedSize)}
                          </span>
                        </div>
                        <div className="aspect-video bg-zinc-900 dark:bg-black rounded-xl overflow-hidden flex items-center justify-center relative">
                          {isRecompressing && (
                            <div className="absolute inset-0 bg-white/10 dark:bg-black/50 flex items-center justify-center z-10">
                              <RefreshCw className="w-6 h-6 text-rose-500 animate-spin" />
                            </div>
                          )}
                          <img
                            src={selectedImage.compressedDataUrl}
                            alt="压缩后"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                          {selectedImage.compressedWidth} ×{" "}
                          {selectedImage.compressedHeight}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected image info */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <span className="text-zinc-400 dark:text-zinc-500">压缩率:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedImage.compressedSize < selectedImage.originalSize
                          ? "-"
                          : "+"}
                        {Math.abs(
                          (1 -
                            selectedImage.compressedSize /
                              selectedImage.originalSize) *
                            100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    {selectedImage.compressedWidth !== selectedImage.originalWidth && (
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                        <span className="text-zinc-400 dark:text-zinc-500">尺寸:</span>
                        <span>
                          {selectedImage.originalWidth}×{selectedImage.originalHeight} →{" "}
                          {selectedImage.compressedWidth}×{selectedImage.compressedHeight}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDownload(selectedImage)}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-lg transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      下载此图
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* === Image List === */}
            <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-100/50 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-rose-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      图片列表
                    </h2>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {images.length} 张
                    </span>
                  </div>
                  <button
                    onClick={handleDownloadAll}
                    disabled={stats.count === 0 || isProcessing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-zinc-300 disabled:to-zinc-400 dark:disabled:from-zinc-700 dark:disabled:to-zinc-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-rose-500/20 disabled:shadow-none transition-all active:scale-[0.98] disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    下载全部
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                {images.map((img) => {
                  const ratio =
                    img.originalSize > 0
                      ? (1 - img.compressedSize / img.originalSize) * 100
                      : 0;
                  const isSelected = img.id === selectedImageId;

                  return (
                    <div
                      key={img.id}
                      onClick={() => img.status === "done" && setSelectedImageId(img.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20"
                          : "border-zinc-200 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600 cursor-pointer"
                      } ${img.status === "done" ? "cursor-pointer" : ""}`}
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 flex items-center justify-center">
                        {img.status === "done" && img.compressedDataUrl ? (
                          <img
                            src={img.compressedDataUrl}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        ) : img.status === "error" ? (
                          <X className="w-6 h-6 text-red-400" />
                        ) : (
                          <RefreshCw className="w-5 h-5 text-zinc-400 animate-spin" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {img.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                          )}
                        </div>
                        {img.status === "error" ? (
                          <span className="text-xs text-red-500">
                            {img.errorMessage || "处理失败"}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                            <span>{formatSize(img.originalSize)}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {formatSize(img.compressedSize)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded-md font-medium ${
                                ratio > 0
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {ratio > 0 ? "-" : "+"}
                              {Math.abs(ratio).toFixed(0)}%
                            </span>
                            {img.compressedWidth !== img.originalWidth && (
                              <span className="hidden sm:inline">
                                {img.compressedWidth}×{img.compressedHeight}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {img.status === "done" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(img);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-rose-500 hover:text-white text-zinc-500 dark:text-zinc-400 transition-all"
                            aria-label="下载"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(img.id);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-700 hover:bg-red-500 hover:text-white text-zinc-500 dark:text-zinc-400 transition-all"
                          aria-label="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* === History Panel === */}
        <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 flex items-center justify-between hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                压缩历史
              </h2>
              {history.length > 0 && (
                <span className="px-2 py-0.5 text-xs bg-rose-500/10 text-rose-500 rounded-md">
                  {history.length}
                </span>
              )}
            </div>
            {showHistory ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </button>

          {showHistory && (
            <div className="border-t border-zinc-200 dark:border-zinc-700/50">
              {history.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  暂无压缩历史
                </div>
              ) : (
                <>
                  <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto">
                    {history.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50"
                      >
                        <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                          <ImageDown className="w-4 h-4 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                            {record.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{formatSize(record.totalOriginalSize)}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-emerald-600 dark:text-emerald-400">
                              {formatSize(record.totalCompressedSize)}
                            </span>
                            <span className="text-rose-500 font-medium">
                              {record.ratio > 0 ? "-" : "+"}
                              {Math.abs(record.ratio).toFixed(0)}%
                            </span>
                            {record.imageCount > 1 && (
                              <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400">
                                {record.imageCount}张
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap flex-shrink-0">
                          {formatDate(record.date)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-zinc-200 dark:border-zinc-700/50">
                    <button
                      onClick={handleClearHistory}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      清除历史
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* === Features Intro === */}
        <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Pro 版特性
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: Layers,
                title: "批量处理",
                desc: "最多20张图片同时压缩",
                iconBg: "bg-rose-500/10",
                iconColor: "text-rose-500",
              },
              {
                icon: Wand2,
                title: "智能优化",
                desc: "自动选择最佳质量参数",
                iconBg: "bg-violet-500/10",
                iconColor: "text-violet-500",
              },
              {
                icon: Eye,
                title: "滑块对比",
                desc: "Before/After实时对比画质",
                iconBg: "bg-blue-500/10",
                iconColor: "text-blue-500",
              },
              {
                icon: Maximize2,
                title: "尺寸调整",
                desc: "按宽度/高度/百分比缩放",
                iconBg: "bg-emerald-500/10",
                iconColor: "text-emerald-500",
              },
              {
                icon: FileImage,
                title: "格式互转",
                desc: "JPG/PNG/WebP任意转换",
                iconBg: "bg-amber-500/10",
                iconColor: "text-amber-500",
              },
              {
                icon: History,
                title: "历史记录",
                desc: "自动保存最近10次记录",
                iconBg: "bg-cyan-500/10",
                iconColor: "text-cyan-500",
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${feature.iconBg}`}
                    >
                      <Icon className={`w-4 h-4 ${feature.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {feature.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {feature.desc}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              本地处理，图片不上传服务器
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              自动记忆设置
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              完全免费
            </span>
          </div>
        </div>
      </div>

      {/* === Toast Notification === */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-700 text-white text-sm rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}
    </ToolLayout>
  );
}
