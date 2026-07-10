"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Square, Copy, Check } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

export default function GlassmorphismGeneratorPage() {
  const [bgColor, setBgColor] = useState("#6366f1");
  const [glassColor, setGlassColor] = useState("#ffffff");
  const [opacity, setOpacity] = useState(20);
  const [blur, setBlur] = useState(12);
  const [border, setBorder] = useState(1);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [radius, setRadius] = useState(16);
  const [shadow, setShadow] = useState(20);
  const [copied, setCopied] = useState(false);

  const css = `.glass {
  background: rgba(${parseInt(glassColor.slice(1, 3), 16)}, ${parseInt(glassColor.slice(3, 5), 16)}, ${parseInt(glassColor.slice(5, 7), 16)}, ${opacity / 100});
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: ${border}px solid rgba(${parseInt(borderColor.slice(1, 3), 16)}, ${parseInt(borderColor.slice(3, 5), 16)}, ${parseInt(borderColor.slice(5, 7), 16)}, 0.2);
  border-radius: ${radius}px;
  box-shadow: 0 8px ${shadow}px rgba(0, 0, 0, 0.2);
}`;

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="毛玻璃效果生成"
      description="生成CSS毛玻璃效果"
      icon={Square}
      category="设计工具"
      slug="glassmorphism-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">背景颜色</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">玻璃颜色</label>
              <input type="color" value={glassColor} onChange={(e) => setGlassColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">透明度 {opacity}%</label>
              <input type="range" min={5} max={80} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">模糊半径 {blur}px</label>
              <input type="range" min={0} max={40} value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">边框宽度 {border}px</label>
              <input type="range" min={0} max={5} value={border} onChange={(e) => setBorder(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">圆角 {radius}px</label>
                <input type="range" min={0} max={50} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-primary-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">阴影 {shadow}px</label>
                <input type="range" min={0} max={60} value={shadow} onChange={(e) => setShadow(Number(e.target.value))} className="w-full accent-primary-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">实时预览</label>
            <div
              className="rounded-lg h-64 flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: bgColor }}
            >
              <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 20% 30%, #ffffff40 0%, transparent 40%), radial-gradient(circle at 80% 70%, #00000040 0%, transparent 40%)` }} />
              <div
                className="relative px-6 py-8 text-center"
                style={{
                  background: `rgba(${parseInt(glassColor.slice(1, 3), 16)}, ${parseInt(glassColor.slice(3, 5), 16)}, ${parseInt(glassColor.slice(5, 7), 16)}, ${opacity / 100})`,
                  backdropFilter: `blur(${blur}px)`,
                  WebkitBackdropFilter: `blur(${blur}px)`,
                  border: `${border}px solid rgba(255,255,255,0.2)`,
                  borderRadius: `${radius}px`,
                  boxShadow: `0 8px ${shadow}px rgba(0,0,0,0.2)`,
                }}
              >
                <p className="text-white font-bold text-lg">Glass Effect</p>
                <p className="text-white/70 text-sm mt-1">毛玻璃预览效果</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">CSS 代码</label>
            <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
            </button>
          </div>
          <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-emerald-300 font-mono whitespace-pre-wrap">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
