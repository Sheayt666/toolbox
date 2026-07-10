"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { AppWindow, Upload, Download } from "lucide-react";

const SIZES = [16, 32, 48, 64];

export default function ImageToIconPage() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [bg, setBg] = useState("#000000");
  const [useTransparent, setUseTransparent] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<Record<number, string>>({});

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
    if (!img) return;
    const newPreviews: Record<number, string> = {};
    SIZES.forEach((size) => {
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d")!;
      if (!useTransparent) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
      }
      // 居中缩放
      const scale = Math.min(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      newPreviews[size] = c.toDataURL("image/png");
    });
    setPreviews(newPreviews);

    // 主预览
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, 128, 128);
      if (!useTransparent) { ctx.fillStyle = bg; ctx.fillRect(0, 0, 128, 128); }
      const scale = Math.min(128 / img.width, 128 / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (128 - w) / 2, (128 - h) / 2, w, h);
    }
  }, [img, bg, useTransparent]);

  const downloadIco = () => {
    // 多尺寸 ICO
    const sizes = SIZES;
    let offset = 6 + sizes.length * 16;
    const entries: { size: number; png: Uint8Array }[] = [];
    let totalPngLen = 0;
    sizes.forEach((size) => {
      const c = document.createElement("canvas");
      c.width = size; c.height = size;
      const ctx = c.getContext("2d")!;
      if (!useTransparent) { ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size); }
      const scale = Math.min(size / img!.width, size / img!.height);
      const w = img!.width * scale, h = img!.height * scale;
      ctx.drawImage(img!, (size - w) / 2, (size - h) / 2, w, h);
      // 同步获取（canvas 小）
      const dataUrl = c.toDataURL("image/png");
      const b64 = dataUrl.split(",")[1];
      const png = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
      entries.push({ size, png });
      totalPngLen += png.length;
    });
    const ico = new Uint8Array(6 + sizes.length * 16 + totalPngLen);
    const dv = new DataView(ico.buffer);
    dv.setUint16(0, 0, true);
    dv.setUint16(2, 1, true);
    dv.setUint16(4, sizes.length, true);
    let curOffset = offset;
    entries.forEach((e, i) => {
      const base = 6 + i * 16;
      dv.setUint8(base, e.size); dv.setUint8(base + 1, e.size);
      dv.setUint8(base + 2, 0); dv.setUint8(base + 3, 0);
      dv.setUint16(base + 4, 1, true);
      dv.setUint16(base + 6, 32, true);
      dv.setUint32(base + 8, e.png.length, true);
      dv.setUint32(base + 12, curOffset, true);
      ico.set(e.png, curOffset);
      curOffset += e.png.length;
    });
    const url = URL.createObjectURL(new Blob([ico]));
    const a = document.createElement("a");
    a.href = url; a.download = "favicon.ico"; a.click();
  };

  return (
    <ToolLayout
      title="图片转图标"
      description="将图片转换为ICO图标"
      icon={AppWindow}
      category="图片工具"
      slug="image-to-icon"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50"
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">{img ? "点击重新上传" : "点击上传图片（PNG/JPG）"}</p>
        </div>

        {img && (
          <>
            <div className="flex items-center gap-4">
              <button onClick={() => setUseTransparent(!useTransparent)} className={`px-3 py-2 text-xs rounded-lg border ${useTransparent ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                {useTransparent ? "透明背景" : "纯色背景"}
              </button>
              {!useTransparent && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">背景色</span>
                  <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded border border-[#27272a] bg-transparent cursor-pointer" />
                </div>
              )}
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-6 flex flex-col items-center gap-4" style={{ backgroundImage: useTransparent ? "linear-gradient(45deg,#1a1a1d 25%,transparent 25%),linear-gradient(-45deg,#1a1a1d 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1d 75%),linear-gradient(-45deg,transparent 75%,#1a1a1d 75%)" : "none", backgroundSize: "20px 20px" }}>
              <canvas ref={canvasRef} className="rounded" />
              <div className="flex items-end gap-4">
                {SIZES.map((s) => (
                  <div key={s} className="flex flex-col items-center gap-1">
                    {previews[s] && <img src={previews[s]} alt={String(s)} className="border border-[#27272a] rounded" style={{ width: Math.max(s, 20), height: Math.max(s, 20) }} />}
                    <span className="text-xs text-slate-600">{s}px</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={downloadIco} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
              <Download className="w-4 h-4" /> 下载 ICO 文件（多尺寸）
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
