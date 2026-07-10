"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Layers, Upload, Copy, Check } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "darken", "lighten",
  "color-dodge", "color-burn", "hard-light", "soft-light", "difference",
  "exclusion", "hue", "saturation", "color", "luminosity",
];

export default function BlendModeToolPage() {
  const [bgColor, setBgColor] = useState("#6366f1");
  const [layerColor, setLayerColor] = useState("#f59e0b");
  const [useBgImage, setUseBgImage] = useState(false);
  const [bgImage, setBgImage] = useState("");
  const [useLayerImage, setUseLayerImage] = useState(false);
  const [layerImage, setLayerImage] = useState("");
  const [opacity, setOpacity] = useState(100);
  const [copiedMode, setCopiedMode] = useState<string | null>(null);

  const onFile = (setter: (v: string) => void) => (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const copy = (mode: string) => {
    navigator.clipboard.writeText(`mix-blend-mode: ${mode};`);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 1500);
  };

  return (
    <ToolLayout
      title="混合模式预览"
      description="预览CSS各种混合模式效果"
      icon={Layers}
      category="设计工具"
      slug="blend-mode-tool"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">底层颜色</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" disabled={useBgImage} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">混合层颜色</label>
            <input type="color" value={layerColor} onChange={(e) => setLayerColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" disabled={useLayerImage} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">不透明度 {opacity}%</label>
            <input type="range" min={0} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-primary-500 mt-3.5" />
          </div>
          <div className="flex flex-col gap-1.5 justify-end">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={useBgImage} onChange={(e) => setUseBgImage(e.target.checked)} className="accent-primary-500" /> 底层用图片
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={useLayerImage} onChange={(e) => setUseLayerImage(e.target.checked)} className="accent-primary-500" /> 混合层用图片
            </label>
          </div>
        </div>

        {useBgImage && (
          <label className="block">
            <span className="text-xs text-slate-400">底层图片</span>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(setBgImage)(e.target.files[0])} className="block w-full text-xs text-slate-400 mt-1" />
          </label>
        )}
        {useLayerImage && (
          <label className="block">
            <span className="text-xs text-slate-400">混合层图片</span>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onFile(setLayerImage)(e.target.files[0])} className="block w-full text-xs text-slate-400 mt-1" />
          </label>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BLEND_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => copy(mode)}
              className="rounded-lg overflow-hidden border border-[#27272a] hover:border-primary-500/50 text-left"
            >
              <div className="h-20 relative" style={{ backgroundColor: useBgImage ? undefined : bgColor, backgroundImage: useBgImage ? `url(${bgImage})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}>
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: useLayerImage ? undefined : layerColor,
                    backgroundImage: useLayerImage ? `url(${layerImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    mixBlendMode: mode as React.CSSProperties["mixBlendMode"],
                    opacity: opacity / 100,
                  }}
                />
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-xs text-slate-300 font-mono">{mode}</span>
                {copiedMode === mode && <Check className="w-3 h-3 text-emerald-400" />}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3">
          <p className="text-xs text-slate-500 mb-1">CSS 语法</p>
          <code className="text-xs text-primary-300 font-mono">mix-blend-mode: {BLEND_MODES[0]};</code>
          <p className="text-xs text-slate-500 mt-2">点击任意模式卡片复制对应 CSS 代码。支持背景混合模式 mix-blend-mode。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
