"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PaintBucket, Upload, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

export default function ImageBackgroundColorPage() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [threshold, setThreshold] = useState(30);
  const [tolerance, setTolerance] = useState(40);
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
    const maxW = 800;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const px = data.data;
    // 采样左上角像素作为背景色参考
    const bgR = px[0], bgG = px[1], bgB = px[2];
    const target = hexToRgb(bgColor);
    for (let i = 0; i < px.length; i += 4) {
      const dist = Math.sqrt((px[i] - bgR) ** 2 + (px[i + 1] - bgG) ** 2 + (px[i + 2] - bgB) ** 2);
      if (dist < tolerance) {
        // 软边缘混合
        const blend = Math.max(0, dist / tolerance);
        px[i] = px[i] * blend + target[0] * (1 - blend);
        px[i + 1] = px[i + 1] * blend + target[1] * (1 - blend);
        px[i + 2] = px[i + 2] * blend + target[2] * (1 - blend);
      }
      // 去除透明
      if (px[i + 3] < threshold * 5) {
        px[i] = target[0]; px[i + 1] = target[1]; px[i + 2] = target[2]; px[i + 3] = 255;
      }
    }
    ctx.putImageData(data, 0, 0);
  }, [img, bgColor, threshold, tolerance]);

  const download = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = "image-bg-changed.png";
    a.click();
  };

  function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  return (
    <ToolLayout
      title="图片背景换色"
      description="更换图片背景颜色"
      icon={PaintBucket}
      category="图片工具"
      slug="image-background-color"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">点击上传图片</p>
          <p className="text-xs text-slate-600 mt-1">工具会自动识别背景区域并替换颜色</p>
        </div>

        {img && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">替换颜色</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">容差 {tolerance}</label>
                <input type="range" min={5} max={120} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className="w-full accent-primary-500 mt-3.5" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">透明阈值 {threshold}</label>
                <input type="range" min={0} max={50} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-primary-500 mt-3.5" />
              </div>
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 flex items-center justify-center overflow-auto" style={{ backgroundImage: "linear-gradient(45deg,#1a1a1d 25%,transparent 25%),linear-gradient(-45deg,#1a1a1d 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1d 75%),linear-gradient(-45deg,transparent 75%,#1a1a1d 75%)", backgroundSize: "20px 20px", backgroundPosition: "0 0,0 10px,10px -10px,-10px 0" }}>
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
