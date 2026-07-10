"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PenTool, Upload, Download, Copy, Check } from "lucide-react";

export default function ImageToSvgPage() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [svg, setSvg] = useState("");
  const [threshold, setThreshold] = useState(128);
  const [blockSize, setBlockSize] = useState(8);
  const [copied, setCopied] = useState(false);
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
    const maxW = 400;
    const scale = Math.min(1, maxW / img.width);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);
    canvas.width = w; canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);

    // 将图像分块，每块取平均色，生成矩形 SVG（简化矢量转换）
    const bs = blockSize;
    const rects: string[] = [];
    for (let y = 0; y < h; y += bs) {
      for (let x = 0; x < w; x += bs) {
        let r = 0, g = 0, b = 0, a = 0, count = 0;
        for (let dy = 0; dy < bs && y + dy < h; dy++) {
          for (let dx = 0; dx < bs && x + dx < w; dx++) {
            const i = ((y + dy) * w + (x + dx)) * 4;
            r += data.data[i]; g += data.data[i + 1]; b += data.data[i + 2]; a += data.data[i + 3]; count++;
          }
        }
        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count); a = Math.round(a / count);
        // 透明跳过；接近纯白且高于阈值跳过以减小体积
        if (a < 30) continue;
        if (r > threshold && g > threshold && b > threshold) continue;
        const color = `rgb(${r},${g},${b})`;
        rects.push(`<rect x="${x}" y="${y}" width="${bs}" height="${bs}" fill="${color}"/>`);
      }
    }
    setSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rects.join("")}</svg>`);
  }, [img, threshold, blockSize]);

  const downloadSvg = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "image.svg";
    a.click();
  };

  const copy = () => {
    navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="图片转SVG"
      description="将位图转换为SVG矢量图"
      icon={PenTool}
      category="图片工具"
      slug="image-to-svg"
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

        <canvas ref={canvasRef} className="hidden" />

        {img && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">色块大小 {blockSize}px（越小越精细）</label>
                <input type="range" min={2} max={20} value={blockSize} onChange={(e) => setBlockSize(Number(e.target.value))} className="w-full accent-primary-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">白色过滤阈值 {threshold}</label>
                <input type="range" min={200} max={255} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-primary-500" />
              </div>
            </div>

            {svg && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">SVG 预览</label>
                  <div className="rounded-lg bg-white border border-[#27272a] p-4 flex items-center justify-center min-h-[200px]">
                    <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">SVG 代码</label>
                    <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
                    </button>
                  </div>
                  <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-xs text-slate-300 font-mono overflow-auto max-h-[200px]">{svg.slice(0, 2000)}{svg.length > 2000 ? "\n..." : ""}</pre>
                </div>
              </div>
            )}

            <button onClick={downloadSvg} disabled={!svg} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              <Download className="w-4 h-4" /> 下载 SVG
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
