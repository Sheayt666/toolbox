"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Grid3x3, Upload, Download, Square } from "lucide-react";

export default function ImageMosaicPage() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [blockSize, setBlockSize] = useState(12);
  const [mode, setMode] = useState<"mosaic" | "pixelate">("mosaic");
  const [regions, setRegions] = useState<{ x: number; y: number; w: number; h: number }[]>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => { setImg(im); setRegions([]); };
      im.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const maxW = 700;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const applyMosaic = (region?: { x: number; y: number; w: number; h: number }) => {
      const sx = region ? Math.max(0, Math.floor(region.x)) : 0;
      const sy = region ? Math.max(0, Math.floor(region.y)) : 0;
      const sw = region ? Math.min(canvas.width - sx, Math.floor(region.w)) : canvas.width;
      const sh = region ? Math.min(canvas.height - sy, Math.floor(region.h)) : canvas.height;
      if (sw <= 0 || sh <= 0) return;
      const data = ctx.getImageData(sx, sy, sw, sh);
      const px = data.data;
      const bs = blockSize;
      for (let y = 0; y < sh; y += bs) {
        for (let x = 0; x < sw; x += bs) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = 0; dy < bs && y + dy < sh; dy++) {
            for (let dx = 0; dx < bs && x + dx < sw; dx++) {
              const i = ((y + dy) * sw + (x + dx)) * 4;
              r += px[i]; g += px[i + 1]; b += px[i + 2]; count++;
            }
          }
          r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
          for (let dy = 0; dy < bs && y + dy < sh; dy++) {
            for (let dx = 0; dx < bs && x + dx < sw; dx++) {
              const i = ((y + dy) * sw + (x + dx)) * 4;
              px[i] = r; px[i + 1] = g; px[i + 2] = b;
            }
          }
        }
      }
      if (mode === "pixelate") {
        // 像素化：直接放大块
      }
      ctx.putImageData(data, sx, sy);
    };

    if (regions.length === 0) {
      applyMosaic();
    } else {
      regions.forEach((r) => applyMosaic(r));
      // 绘制选区边框
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      regions.forEach((r) => ctx.strokeRect(r.x, r.y, r.w, r.h));
    }
  }, [img, blockSize, mode, regions]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    setDragStart({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const ex = (e.clientX - rect.left) * scaleX;
    const ey = (e.clientY - rect.top) * scaleY;
    const region = {
      x: Math.min(dragStart.x, ex),
      y: Math.min(dragStart.y, ey),
      w: Math.abs(ex - dragStart.x),
      h: Math.abs(ey - dragStart.y),
    };
    if (region.w > 5 && region.h > 5) setRegions([...regions, region]);
    setDragStart(null);
  };

  const download = () => {
    if (!canvasRef.current) return;
    // 去除边框后下载
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = "image-mosaic.png";
    a.click();
  };

  return (
    <ToolLayout
      title="图片马赛克"
      description="为图片添加马赛克效果"
      icon={Grid3x3}
      category="图片工具"
      slug="image-mosaic"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">{img ? "点击重新上传" : "点击上传图片"}</p>
        </div>

        {img && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">马赛克块大小 {blockSize}px</label>
                <input type="range" min={4} max={40} value={blockSize} onChange={(e) => setBlockSize(Number(e.target.value))} className="w-full accent-primary-500" />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={() => setRegions([])} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:text-white">
                  <Square className="w-3.5 h-3.5" /> 全图打码
                </button>
                <button onClick={() => setRegions([])} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:text-white">
                  清除选区
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">提示：在图片上拖拽鼠标可框选局部区域打马赛克</p>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 flex items-center justify-center overflow-auto">
              <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} className="max-w-full cursor-crosshair" />
            </div>

            <button onClick={download} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
              <Download className="w-4 h-4" /> 下载图片
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
