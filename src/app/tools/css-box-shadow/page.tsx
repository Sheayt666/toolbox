"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Layers, Copy, Check, Plus, X, Shuffle, Code2 } from "lucide-react";

interface ShadowLayer {
  id: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const presets = [
  {
    name: "精致浮动",
    layers: [
      { offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: "#000000", opacity: 5, inset: false },
      { offsetX: 0, offsetY: 10, blur: 15, spread: -3, color: "#000000", opacity: 10, inset: false },
      { offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: "#000000", opacity: 8, inset: false },
    ],
  },
  {
    name: "梦幻光晕",
    layers: [
      { offsetX: 0, offsetY: 0, blur: 30, spread: 5, color: "#8b5cf6", opacity: 30, inset: false },
      { offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: "#000000", opacity: 10, inset: false },
    ],
  },
  {
    name: "Neumorphism",
    layers: [
      { offsetX: 8, offsetY: 8, blur: 16, spread: 0, color: "#000000", opacity: 15, inset: false },
      { offsetX: -8, offsetY: -8, blur: 16, spread: 0, color: "#ffffff", opacity: 80, inset: false },
    ],
  },
  {
    name: "内凹陷",
    layers: [
      { offsetX: 2, offsetY: 2, blur: 5, spread: 0, color: "#000000", opacity: 30, inset: true },
      { offsetX: -1, offsetY: -1, blur: 3, spread: 0, color: "#ffffff", opacity: 50, inset: true },
    ],
  },
];

export default function CssBoxShadowPage() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: generateId(), offsetX: 0, offsetY: 8, blur: 24, spread: 0, color: "#000000", opacity: 20, inset: false },
  ]);
  const [activeLayer, setActiveLayer] = useState(0);
  const [copied, setCopied] = useState(false);

  const generateCSS = useCallback((): string => {
    const shadows = layers
      .map((l) => {
        const inset = l.inset ? "inset " : "";
        return `${inset}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity / 100)}`;
      })
      .join(",\n    ");
    return `box-shadow: ${shadows};`;
  }, [layers]);

  const cssCode = generateCSS();

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const addLayer = () => {
    if (layers.length >= 5) return;
    const newLayer: ShadowLayer = {
      id: generateId(),
      offsetX: 0,
      offsetY: 4,
      blur: 12,
      spread: 0,
      color: "#000000",
      opacity: 15,
      inset: false,
    };
    setLayers([...layers, newLayer]);
    setActiveLayer(layers.length);
  };

  const removeLayer = (index: number) => {
    if (layers.length <= 1) return;
    const newLayers = layers.filter((_, i) => i !== index);
    setLayers(newLayers);
    setActiveLayer(Math.min(activeLayer, newLayers.length - 1));
  };

  const updateLayer = (index: number, key: keyof ShadowLayer, value: number | string | boolean) => {
    const newLayers = [...layers];
    newLayers[index] = { ...newLayers[index], [key]: value };
    setLayers(newLayers);
  };

  const randomize = () => {
    const count = 1 + Math.floor(Math.random() * 3);
    const newLayers: ShadowLayer[] = [];
    for (let i = 0; i < count; i++) {
      newLayers.push({
        id: generateId(),
        offsetX: Math.floor(Math.random() * 20) - 10,
        offsetY: Math.floor(Math.random() * 30),
        blur: Math.floor(Math.random() * 50) + 4,
        spread: Math.floor(Math.random() * 20) - 10,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
        opacity: Math.floor(Math.random() * 35) + 10,
        inset: Math.random() > 0.85,
      });
    }
    setLayers(newLayers);
    setActiveLayer(0);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    const newLayers = preset.layers.map((l) => ({ ...l, id: generateId() }));
    setLayers(newLayers);
    setActiveLayer(0);
  };

  useEffect(() => {
    applyPreset(presets[0]);
  }, []);

  const currentLayer = layers[activeLayer];

  const getShadowStyle = (): React.CSSProperties => {
    const shadowStr = layers
      .map((l) => {
        const inset = l.inset ? "inset " : "";
        return `${inset}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity / 100)}`;
      })
      .join(", ");
    return { boxShadow: shadowStr };
  };

  return (
    <ToolLayout
      title="CSS Box Shadow 生成器"
      description="多层 CSS box-shadow 生成器，支持叠加多层阴影，预设多种精美效果，一键复制代码"
      icon={Layers}
      category="生成工具"
      slug="css-box-shadow"
      toolId="css-box-shadow"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">Box Shadow</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={randomize}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
          >
            <Shuffle className="w-4 h-4" />
            随机
          </button>
          <button
            onClick={copyCSS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制 CSS
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div className="flex items-center justify-center py-12 bg-[#09090b] rounded-2xl border border-[#27272a]">
          <div
            className="w-40 h-24 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center"
            style={getShadowStyle()}
          >
            <span className="text-slate-600 dark:text-slate-200 text-sm font-medium">
              预览效果
            </span>
          </div>
        </div>

        {/* 预设 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            预设效果
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="group p-3 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl transition-colors"
              >
                <div className="h-14 flex items-center justify-center">
                  <div
                    className="w-16 h-8 bg-white rounded-md"
                    style={{
                      boxShadow: preset.layers
                        .map((l) => {
                          const inset = l.inset ? "inset " : "";
                          return `${inset}${l.offsetX}px ${l.offsetY}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity / 100)}`;
                        })
                        .join(", "),
                    }}
                  />
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-300 mt-2 block text-center">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 图层管理 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              阴影图层 ({layers.length}/5)
            </label>
            <button
              onClick={addLayer}
              disabled={layers.length >= 5}
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              添加图层
            </button>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            {layers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveLayer(idx)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeLayer === idx
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                }`}
              >
                图层 {idx + 1}
                {layers.length > 1 && (
                  <X
                    className="w-3 h-3 text-slate-500 hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(idx);
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* 当前图层参数 */}
          {currentLayer && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">X 偏移</span>
                  <span className="text-xs font-mono text-violet-400">
                    {currentLayer.offsetX}px
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={50}
                  value={currentLayer.offsetX}
                  onChange={(e) => updateLayer(activeLayer, "offsetX", Number(e.target.value))}
                  className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">Y 偏移</span>
                  <span className="text-xs font-mono text-violet-400">
                    {currentLayer.offsetY}px
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={100}
                  value={currentLayer.offsetY}
                  onChange={(e) => updateLayer(activeLayer, "offsetY", Number(e.target.value))}
                  className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">模糊</span>
                  <span className="text-xs font-mono text-violet-400">
                    {currentLayer.blur}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={currentLayer.blur}
                  onChange={(e) => updateLayer(activeLayer, "blur", Number(e.target.value))}
                  className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">扩散</span>
                  <span className="text-xs font-mono text-violet-400">
                    {currentLayer.spread}px
                  </span>
                </div>
                <input
                  type="range"
                  min={-30}
                  max={50}
                  value={currentLayer.spread}
                  onChange={(e) => updateLayer(activeLayer, "spread", Number(e.target.value))}
                  className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-slate-400">不透明度</span>
                  <span className="text-xs font-mono text-violet-400">
                    {currentLayer.opacity}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={currentLayer.opacity}
                  onChange={(e) => updateLayer(activeLayer, "opacity", Number(e.target.value))}
                  className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentLayer.color}
                    onChange={(e) => updateLayer(activeLayer, "color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-[#27272a]"
                  />
                  <span className="text-xs font-mono text-slate-500 uppercase">
                    {currentLayer.color}
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentLayer.inset}
                    onChange={(e) => updateLayer(activeLayer, "inset", e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-[#27272a] bg-[#09090b] text-violet-500 focus:ring-violet-500/50"
                  />
                  <span className="text-xs text-slate-400">内阴影</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* CSS 代码 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            CSS 代码
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-violet-300 whitespace-pre-wrap break-all">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持最多 5 层阴影叠加，创造丰富的视觉层次</li>
          <li>• 提供多种预设效果：精致浮动、梦幻光晕、Neumorphism、内凹陷</li>
          <li>• 每层阴影可独立调整偏移、模糊、扩散、颜色和不透明度</li>
          <li>• 勾选「内阴影」可生成 inset 内阴影效果</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
