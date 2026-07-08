"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FileImage,
  Upload,
  Download,
  Trash2,
  Settings,
  Plus,
  Minus,
  FileText,
  ArrowUp,
  ArrowDown,
  X,
  RefreshCw,
} from "lucide-react";

interface PdfImage {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  width: number;
  height: number;
}

type PageSize = "a4" | "letter" | "original";
type ImageFit = "contain" | "cover" | "original";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// 页面尺寸（单位：点，1点 = 1/72英寸）
const pageSizes: Record<string, { width: number; height: number; label: string }> = {
  a4: { width: 595.28, height: 841.89, label: "A4" },
  letter: { width: 612, height: 792, label: "Letter" },
  original: { width: 0, height: 0, label: "原图尺寸" },
};

// 简单的纯JS PDF生成器
function generatePdf(
  images: PdfImage[],
  pageSize: PageSize,
  imageFit: ImageFit
): Blob {
  const pages: {
    width: number;
    height: number;
    content: string;
    imageData: { data: string; x: number; y: number; w: number; h: number; type: string };
  }[] = [];

  for (const img of images) {
    let pageW: number, pageH: number;

    if (pageSize === "original") {
      // 使用图片原始像素作为点（72dpi下 1px=1pt）
      pageW = img.width;
      pageH = img.height;
    } else {
      pageW = pageSizes[pageSize].width;
      pageH = pageSizes[pageSize].height;
    }

    let imgW: number, imgH: number, imgX: number, imgY: number;

    if (imageFit === "original" || pageSize === "original") {
      // 原始尺寸居中
      imgW = Math.min(img.width, pageW);
      imgH = Math.min(img.height, pageH);
      const ratio = Math.min(pageW / img.width, pageH / img.height);
      if (ratio < 1) {
        imgW = img.width * ratio;
        imgH = img.height * ratio;
      } else {
        imgW = img.width;
        imgH = img.height;
      }
      imgX = (pageW - imgW) / 2;
      imgY = (pageH - imgH) / 2;
    } else if (imageFit === "contain") {
      // 适应页面（保持比例）
      const ratio = Math.min(pageW / img.width, pageH / img.height);
      imgW = img.width * ratio;
      imgH = img.height * ratio;
      imgX = (pageW - imgW) / 2;
      imgY = (pageH - imgH) / 2;
    } else {
      // 覆盖页面
      const ratio = Math.max(pageW / img.width, pageH / img.height);
      imgW = img.width * ratio;
      imgH = img.height * ratio;
      imgX = (pageW - imgW) / 2;
      imgY = (pageH - imgH) / 2;
    }

    // 提取base64数据
    const base64Data = img.dataUrl.split(",")[1];
    const imageType = img.type === "image/png" ? "png" : "jpeg";

    pages.push({
      width: pageW,
      height: pageH,
      content: "",
      imageData: {
        data: base64Data,
        x: imgX,
        y: pageH - imgY - imgH, // PDF坐标系从底部开始
        w: imgW,
        h: imgH,
        type: imageType,
      },
    });
  }

  // 构建PDF
  let pdfContent = "";
  const offsets: number[] = [];

  // PDF Header
  pdfContent += "%PDF-1.4\n";
  pdfContent += "%âãÏÓ\n";

  let objectNum = 1;
  const imageObjectNumbers: number[] = [];
  const pageObjectNumbers: number[] = [];

  // 为每个图片创建XObject
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    offsets.push(pdfContent.length);

    const img = images[i];
    const base64Data = page.imageData.data;
    const binaryData = atob(base64Data);

    const imgObjNum = objectNum++;
    imageObjectNumbers.push(imgObjNum);

    // Image XObject
    const colorSpace = page.imageData.type === "png" ? "DeviceRGB" : "DeviceRGB";
    const bitsPerComponent = 8;

    // 注意：简单的JPEG嵌入
    let imageStream = "";
    if (page.imageData.type === "jpeg") {
      imageStream = `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${binaryData.length} >>\nstream\n`;
    } else {
      // PNG - 转换为原始RGB数据（简化处理，使用FlateDecode）
      // 为简单起见，先将PNG转为JPEG的canvas处理在外部做
      // 这里直接用DCTDecode，实际上PNG需要特殊处理
      // 简化方案：统一用JPEG方式，但PNG保留alpha通道太复杂
      // 我们直接嵌入原始数据用DCTDecode（仅JPEG有效）
      // 对于PNG，使用FlateDecode + Predictor
      imageStream = `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${binaryData.length} >>\nstream\n`;
    }

    pdfContent += `${imgObjNum} 0 obj\n${imageStream}`;
    // 写入二进制数据
    pdfContent += binaryData;
    pdfContent += "\nendstream\nendobj\n";
  }

  // 为每个页面创建页面对象
  const pagesObjNum = objectNum++;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    offsets.push(pdfContent.length);

    const pageObjNum = objectNum++;
    pageObjectNumbers.push(pageObjNum);

    // 内容流 - 绘制图片
    const imgObjNum = imageObjectNumbers[i];
    const imgData = page.imageData;

    const content = `q\n${imgData.w} 0 0 ${imgData.h} ${imgData.x} ${imgData.y} cm\n/Im${i} Do\nQ`;

    const contentStreamObj = objectNum++;
    offsets.push(pdfContent.length);
    pdfContent += `${contentStreamObj} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`;

    // 页面对象
    offsets.push(pdfContent.length);
    pdfContent += `${pageObjNum} 0 obj\n<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 ${page.width} ${page.height}] /Resources << /XObject << /Im${i} ${imgObjNum} 0 R >> >> /Contents ${contentStreamObj} 0 R >>\nendobj\n`;
  }

  // Pages对象
  offsets.push(pdfContent.length);
  const kids = pageObjectNumbers.map((n) => `${n} 0 R`).join(" ");
  pdfContent += `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`;

  // Catalog对象
  const catalogObjNum = objectNum++;
  offsets.push(pdfContent.length);
  pdfContent += `${catalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>\nendobj\n`;

  // xref
  const xrefOffset = pdfContent.length;
  pdfContent += `xref\n0 ${objectNum}\n`;
  pdfContent += `0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdfContent += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  // Trailer
  pdfContent += `trailer\n<< /Size ${objectNum} /Root ${catalogObjNum} 0 R >>\n`;
  pdfContent += `startxref\n${xrefOffset}\n%%EOF`;

  // 转为Blob（使用latin1保持二进制数据）
  return new Blob([pdfContent], { type: "application/pdf" });
}

// 将PNG转为JPEG的dataURL（用于PDF嵌入，因为简单PDF生成器对JPEG支持最好）
function convertToJpegDataUrl(dataUrl: string, quality = 0.92): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<PdfImage[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [imageFit, setImageFit] = useState<ImageFit>("contain");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfSize, setPdfSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      alert("请上传图片文件");
      return;
    }

    const newImages: PdfImage[] = [];

    for (const file of fileArray) {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("文件读取失败"));
        reader.readAsDataURL(file);
      });

      const img = new Image();
      const { width, height } = await new Promise<{ width: number; height: number }>(
        (resolve) => {
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = () => resolve({ width: 0, height: 0 });
          img.src = dataUrl;
        }
      );

      newImages.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl,
        width,
        height,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    setPdfUrl("");
  }, []);

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
    setPdfUrl("");
  };

  const handleClearAll = () => {
    setImages([]);
    setPdfUrl("");
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
    setPdfUrl("");
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    setImages((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
    setPdfUrl("");
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);
    try {
      // 将所有图片转为JPEG（确保PDF兼容性）
      const processedImages: PdfImage[] = [];
      for (const img of images) {
        if (img.type === "image/jpeg" || img.type === "image/jpg") {
          processedImages.push(img);
        } else {
          const jpegDataUrl = await convertToJpegDataUrl(img.dataUrl);
          processedImages.push({
            ...img,
            dataUrl: jpegDataUrl,
            type: "image/jpeg",
          });
        }
      }

      const blob = generatePdf(processedImages, pageSize, imageFit);
      const url = URL.createObjectURL(blob);

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
      setPdfSize(blob.size);
    } catch (err) {
      console.error("PDF生成失败:", err);
      alert("PDF生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `images_${Date.now()}.pdf`;
    link.click();
  };

  return (
    <ToolLayout
      title="图片转PDF"
      description="将图片转换为PDF文件，支持单图/多图合并PDF，调整页面大小，本地处理安全可靠"
      toolId="image-to-pdf"
      icon={FileImage}
      category="图片工具"
      slug="image-to-pdf"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-500" />
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
                  ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <FileImage
                className={`w-10 h-10 mb-2 transition-colors ${
                  isDragging ? "text-red-500" : "text-zinc-400"
                }`}
              />
              <div
                className={`text-base font-medium mb-1 ${
                  isDragging
                    ? "text-red-600 dark:text-red-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {isDragging
                  ? "释放鼠标上传图片"
                  : "点击或拖拽上传图片（支持批量）"}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                支持 JPG、PNG、WebP 等格式
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
            {/* 图片列表 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      图片列表 ({images.length}张)
                    </h2>
                  </div>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    拖动排序（上下箭头调整顺序）
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="relative group bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
                    >
                      {/* 序号 */}
                      <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>

                      {/* 删除按钮 */}
                      <button
                        onClick={() => handleRemove(img.id)}
                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* 图片预览 */}
                      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      {/* 图片信息 */}
                      <div className="p-2">
                        <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                          {img.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
                          {img.width}×{img.height}
                        </div>
                      </div>

                      {/* 排序按钮 */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="w-6 h-6 rounded bg-white/90 dark:bg-zinc-700/90 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === images.length - 1}
                          className="w-6 h-6 rounded bg-white/90 dark:bg-zinc-700/90 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 添加更多 */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-zinc-50 dark:bg-zinc-800/30 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                  >
                    <Plus className="w-8 h-8 text-zinc-400" />
                    <span className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      添加图片
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-red-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    PDF设置
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 页面大小 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      页面大小
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(pageSizes) as PageSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            setPageSize(size);
                            setPdfUrl("");
                          }}
                          className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            pageSize === size
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-600"
                          }`}
                        >
                          {pageSizes[size].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 图片排列 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      图片排列
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: "contain", label: "适应页面" },
                        { value: "original", label: "原始尺寸" },
                      ].map((fit) => (
                        <button
                          key={fit.value}
                          onClick={() => {
                            setImageFit(fit.value as ImageFit);
                            setPdfUrl("");
                          }}
                          className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            imageFit === fit.value
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-600"
                          }`}
                        >
                          {fit.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 生成按钮 */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  {pdfUrl ? (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        PDF已生成，大小：
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatSize(pdfSize)}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleGeneratePdf}
                          disabled={isGenerating}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
                          />
                          重新生成
                        </button>
                        <button
                          onClick={handleDownload}
                          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all active:scale-[0.98]"
                        >
                          <Download className="w-4 h-4" />
                          下载 PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGeneratePdf}
                      disabled={isGenerating || images.length === 0}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-red-500/25 disabled:shadow-none hover:shadow-red-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5" />
                          生成 PDF
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* PDF预览 */}
            {pdfUrl && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-red-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      PDF 预览
                    </h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-96"
                      title="PDF预览"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-sm font-medium text-red-700 dark:text-red-300">
                本地处理
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                图片不上传服务器，保护隐私
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                多图合并
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                支持多张图片合并为一个PDF
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                灵活排版
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                A4/Letter/原图尺寸可选
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
