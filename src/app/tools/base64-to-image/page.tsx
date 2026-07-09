"use client";

import { useState, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Image,
  Upload,
  Download,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

export default function Base64ToImagePage() {
  const [base64Input, setBase64Input] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const [error, setError] = useState("");
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, size: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = useCallback(() => {
    setError("");
    if (!base64Input.trim()) {
      setError("请输入Base64编码字符串");
      return;
    }
    
    try {
      let src = base64Input.trim();
      // 如果没有前缀，自动添加
      if (!src.startsWith("data:image")) {
        // 尝试检测格式
        if (src.startsWith("/9j/")) {
          src = "data:image/jpeg;base64," + src;
        } else if (src.startsWith("iVBOR")) {
          src = "data:image/png;base64," + src;
        } else if (src.startsWith("R0lGOD")) {
          src = "data:image/gif;base64," + src;
        } else {
          src = "data:image/png;base64," + src;
        }
      }
      
      // 创建图片以获取尺寸
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setImageSize({
          width: img.width,
          height: img.height,
          size: Math.round((src.length * 3) / 4 / 1024),
        });
      };
      img.onerror = () => {
        setError("无效的Base64图片数据");
      };
      img.src = src;
    } catch (e) {
      setError("转换失败: " + (e as Error).message);
    }
  }, [base64Input]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64Input(result);
      setImageSrc(result);
      
      const img = new Image();
      img.onload = () => {
        setImageSize({
          width: img.width,
          height: img.height,
          size: Math.round(file.size / 1024),
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClear = useCallback(() => {
    setBase64Input("");
    setImageSrc("");
    setError("");
    setImageSize({ width: 0, height: 0, size: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDownload = useCallback(() => {
    if (!imageSrc) return;
    const a = document.createElement("a");
    a.href = imageSrc;
    a.download = "converted-image.png";
    a.click();
  }, [imageSrc]);

  return (
    <ToolLayout
      title="Base64转图片"
      description="将Base64编码的字符串转换为图片，支持预览和下载，本地处理安全可靠"
      toolId="base64-to-image"
      icon={Image}
      category="开发工具"
      slug="base64-to-image"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleConvert}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Image className="w-4 h-4" />
              转换为图片
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              <Upload className="w-4 h-4" />
              上传图片
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={handleDownload}
              disabled={!imageSrc}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              下载图片
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">Base64编码（输入）</span>
              </div>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="在此粘贴Base64编码字符串...\n\ndata:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-xs font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600 break-all"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Image className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">图片预览（输出）</span>
              </div>
              <div className="h-72 flex items-center justify-center bg-[#09090b] overflow-auto p-4">
                {imageSrc ? (
                  <img src={imageSrc} alt="Preview" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-zinc-600 text-sm">图片预览将显示在这里...</div>
                )}
              </div>
            </div>
          </div>

          {imageSrc && imageSize.width > 0 && (
            <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div>
                  <span className="text-zinc-500">尺寸: </span>
                  <span className="text-zinc-200 font-mono">{imageSize.width} x {imageSize.height} px</span>
                </div>
                <div>
                  <span className="text-zinc-500">大小: </span>
                  <span className="text-emerald-400 font-mono">{imageSize.size} KB</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            将Base64编码的字符串转换为图片，支持预览和下载，本地处理安全可靠。支持JPEG、PNG、GIF、WebP等常见图片格式，
            自动识别图片格式并添加正确的Data URI前缀。所有处理在浏览器本地完成，图片数据不会上传服务器。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
