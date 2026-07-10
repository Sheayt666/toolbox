"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FlipHorizontal, Upload, Download } from "lucide-react";

export default function ImageMirrorPage() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [flipH, setFlipH] = useState(true);
  const [flipV, setFlipV] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => setImg(im);
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
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();
  }, [img, flipH, flipV]);

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = "image-mirror.png";
    a.click();
  };

  return (
    <ToolLayout
      title="图片镜像翻转"
      description="水平或垂直镜像翻转图片"
      icon={FlipHorizontal}
      category="图片工具"
      slug="image-mirror"
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
            <div className="flex gap-3">
              <button onClick={() => setFlipH(!flipH)} className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg border ${flipH ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                <FlipHorizontal className="w-4 h-4" /> 水平翻转 {flipH ? "开" : "关"}
              </button>
              <button onClick={() => setFlipV(!flipV)} className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg border ${flipV ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                <FlipHorizontal className="w-4 h-4 rotate-90" /> 垂直翻转 {flipV ? "开" : "关"}
              </button>
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 flex items-center justify-center overflow-auto">
              <canvas ref={canvasRef} className="max-w-full" />
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
