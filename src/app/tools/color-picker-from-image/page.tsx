"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Pipette, Upload, Copy, Check } from "lucide-react";

interface Color { hex: string; rgb: string; count: number; }

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export default function ColorPickerFromImagePage() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [hoverColor, setHoverColor] = useState<string>("");
  const [pickedColor, setPickedColor] = useState<Color | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const im = new Image();
      im.onload = () => { setImg(im); setPickedColor(null); };
      im.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const maxW = 500;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 提取主色调（量化：每个颜色按 32 分组）
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const map: Record<string, number> = {};
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 125) continue;
      const r = Math.floor(data[i] / 32) * 32;
      const g = Math.floor(data[i + 1] / 32) * 32;
      const b = Math.floor(data[i + 2] / 32) * 32;
      const key = `${r},${g},${b}`;
      map[key] = (map[key] || 0) + 1;
    }
    const sorted = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([k, count]) => {
        const [r, g, b] = k.split(",").map(Number);
        return { hex: rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, count };
      });
    setColors(sorted);
  }, [img]);

  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext("2d")!;
    const px = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(px[0], px[1], px[2]);
    setPickedColor({ hex, rgb: `rgb(${px[0]}, ${px[1]}, ${px[2]})`, count: 0 });
  };

  const hover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext("2d")!;
    const px = ctx.getImageData(x, y, 1, 1).data;
    setHoverColor(rgbToHex(px[0], px[1], px[2]));
  };

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="图片取色器"
      description="从图片中提取颜色"
      icon={Pipette}
      category="设计工具"
      slug="color-picker-from-image"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">{img ? "点击重新上传" : "点击上传图片取色"}</p>
        </div>

        {img && (
          <>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-500">悬停颜色：</span>
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 rounded border border-[#27272a]" style={{ backgroundColor: hoverColor }} />
                <span className="text-xs text-white font-mono">{hoverColor || "—"}</span>
              </span>
              <span className="text-xs text-slate-500 ml-auto">点击图片任意位置取色</span>
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2 flex items-center justify-center overflow-auto">
              <canvas ref={canvasRef} onMouseMove={hover} onClick={pick} className="max-w-full cursor-crosshair" />
            </div>

            {pickedColor && (
              <div className="flex items-center gap-4 rounded-lg bg-[#0a0a0b] border border-primary-500/30 p-4">
                <div className="w-16 h-16 rounded-lg border border-[#27272a] flex-shrink-0" style={{ backgroundColor: pickedColor.hex }} />
                <div className="flex-1">
                  <p className="text-sm text-white font-mono">{pickedColor.hex.toUpperCase()}</p>
                  <p className="text-xs text-slate-400 font-mono">{pickedColor.rgb}</p>
                </div>
                <button onClick={() => copy(pickedColor.hex)} className="text-slate-400 hover:text-white">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">主色调提取（前 12 色）</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {colors.map((c, i) => (
                  <button key={i} onClick={() => copy(c.hex)} className="rounded-lg overflow-hidden border border-[#27272a] hover:border-[#3f3f46] text-left">
                    <div className="h-12" style={{ backgroundColor: c.hex }} />
                    <div className="p-1.5">
                      <p className="text-xs text-white font-mono truncate">{c.hex}</p>
                      <p className="text-[10px] text-slate-500">{((c.count / colors.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1)}%</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
