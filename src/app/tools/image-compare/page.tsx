"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Columns2, Upload, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

export default function ImageComparePage() {
  const [imgA, setImgA] = useState<HTMLImageElement | null>(null);
  const [imgB, setImgB] = useState<HTMLImageElement | null>(null);
  const [slider, setSlider] = useState(50);
  const [diffData, setDiffData] = useState<{ total: number; diff: number; percent: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileARef = useRef<HTMLInputElement>(null);
  const fileBRef = useRef<HTMLInputElement>(null);

  const loadImage = (file: File, setter: (img: HTMLImageElement) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => setter(im);
      im.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imgA || !imgB || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const w = Math.min(imgA.width, imgB.width, 800);
    const scale = w / Math.max(imgA.width, imgB.width);
    const h = Math.min(imgA.height, imgB.height) * scale;
    canvas.width = w; canvas.height = h;
    ctx.drawImage(imgA, 0, 0, w, h);
    const a = ctx.getImageData(0, 0, w, h);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(imgB, 0, 0, w, h);
    const b = ctx.getImageData(0, 0, w, h);
    let diff = 0;
    const out = ctx.createImageData(w, h);
    for (let i = 0; i < a.data.length; i += 4) {
      const dr = Math.abs(a.data[i] - b.data[i]);
      const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
      const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
      const d = (dr + dg + db) / 3;
      diff += d;
      // 差异图：差异处红色高亮
      out.data[i] = d > 20 ? 255 : a.data[i] * 0.3;
      out.data[i + 1] = d > 20 ? 50 : a.data[i + 1] * 0.3;
      out.data[i + 2] = d > 20 ? 50 : a.data[i + 2] * 0.3;
      out.data[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    const total = (w * h);
    setDiffData({ total, diff: Math.round(diff), percent: Math.round((diff / (total * 255)) * 100) });
  }, [imgA, imgB]);

  const downloadDiff = () => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = "image-diff.png";
    a.click();
  };

  const containerW = containerRef.current?.clientWidth || 600;
  const sliderPx = (slider / 100) * containerW;

  return (
    <ToolLayout
      title="图片对比工具"
      description="对比两张图片的差异"
      icon={Columns2}
      category="图片工具"
      slug="image-compare"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <button onClick={() => fileARef.current?.click()} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-4 text-center hover:border-primary-500/50">
              <input ref={fileARef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0], setImgA)} />
              <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1" />
              <p className="text-xs text-slate-400">{imgA ? "图片 A 已加载" : "上传图片 A"}</p>
            </button>
          </div>
          <div>
            <button onClick={() => fileBRef.current?.click()} className="w-full border-2 border-dashed border-[#27272a] rounded-lg p-4 text-center hover:border-primary-500/50">
              <input ref={fileBRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && loadImage(e.target.files[0], setImgB)} />
              <Upload className="w-6 h-6 mx-auto text-slate-500 mb-1" />
              <p className="text-xs text-slate-400">{imgB ? "图片 B 已加载" : "上传图片 B"}</p>
            </button>
          </div>
        </div>

        {imgA && imgB && (
          <>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">滑动对比</label>
                <input type="range" min={0} max={100} value={slider} onChange={(e) => setSlider(Number(e.target.value))} className="flex-1 accent-primary-500" />
                <span className="text-xs text-white font-mono w-10">{slider}%</span>
              </div>
              <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-[#27272a] select-none" style={{ height: 360 }}>
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0b]">
                  <img src={imgB.src} alt="B" className="max-h-full max-w-full object-contain absolute inset-0 m-auto" />
                </div>
                <div className="absolute inset-0 overflow-hidden" style={{ width: sliderPx }}>
                  <img src={imgA.src} alt="A" className="absolute inset-0 m-auto max-h-full" style={{ width: containerW, objectFit: "contain" }} />
                </div>
                <div className="absolute top-0 bottom-0 w-0.5 bg-primary-400" style={{ left: sliderPx }}>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <Columns2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">差异分析图</label>
                <button onClick={downloadDiff} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> 下载差异图
                </button>
              </div>
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2 flex items-center justify-center">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
              {diffData && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                    <p className="text-xs text-slate-500">总像素</p>
                    <p className="text-sm text-white font-mono">{diffData.total.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                    <p className="text-xs text-slate-500">差异值</p>
                    <p className="text-sm text-white font-mono">{diffData.diff.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                    <p className="text-xs text-slate-500">差异占比</p>
                    <p className="text-sm font-mono" style={{ color: diffData.percent > 20 ? "#ef4444" : "#10b981" }}>{diffData.percent}%</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {(!imgA || !imgB) && (
          <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-10 text-center">
            <Columns2 className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">请上传两张图片进行对比</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
