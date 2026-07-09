"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Layers, Copy, Check, Shuffle, Code } from "lucide-react";

interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

const presetShadows = [
  { name: "轻柔", config: { offsetX: 0, offsetY: 2, blur: 8, spread: 0, color: "#000000", opacity: 10, inset: false } },
  { name: "中等", config: { offsetX: 0, offsetY: 4, blur: 16, spread: 0, color: "#000000", opacity: 15, inset: false } },
  { name: "浓重", config: { offsetX: 0, offsetY: 10, blur: 30, spread: 0, color: "#000000", opacity: 20, inset: false } },
  { name: "彩色", config: { offsetX: 0, offsetY: 8, blur: 24, spread: 4, color: "#6366f1", opacity: 30, inset: false } },
  { name: "内阴影", config: { offsetX: 0, offsetY: 2, blur: 8, spread: 0, color: "#000000", opacity: 30, inset: true } },
  { name: "多层阴影", config: { offsetX: 0, offsetY: 20, blur: 40, spread: -10, color: "#000000", opacity: 25, inset: false } },
];

function generateShadowCSS(config: ShadowConfig): string {
  const rgbaColor = hexToRgba(config.color, config.opacity / 100);
  const inset = config.inset ? "inset " : "";
  return `box-shadow: ${inset}${config.offsetX}px ${config.offsetY}px ${config.blur}px ${config.spread}px ${rgbaColor};`;
}

function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function generateTailwindShadow(config: ShadowConfig): string {
  if (config.inset) return "shadow-inner";
  // 简化映射
  if (config.blur <= 4 && config.offsetY <= 1) return "shadow-sm";
  if (config.blur <= 8 && config.offsetY <= 2) return "shadow";
  if (config.blur <= 12 && config.offsetY <= 4) return "shadow-md";
  if (config.blur <= 20 && config.offsetY <= 8) return "shadow-lg";
  if (config.blur <= 30 && config.offsetY <= 12) return "shadow-xl";
  return "shadow-2xl";
}

export default function ShadowGeneratorPage() {
  const [config, setConfig] = useState<ShadowConfig>({
    offsetX: 0,
    offsetY: 8,
    blur: 24,
    spread: 0,
    color: "#000000",
    opacity: 20,
    inset: false,
  });
  const [copied, setCopied] = useState(false);
  const [copiedTW, setCopiedTW] = useState(false);

  const cssCode = generateShadowCSS(config);
  const tailwindClass = generateTailwindShadow(config);

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const copyTailwind = useCallback(() => {
    navigator.clipboard.writeText(tailwindClass);
    setCopiedTW(true);
    setTimeout(() => setCopiedTW(false), 2000);
  }, [tailwindClass]);

  const randomize = () => {
    setConfig({
      offsetX: Math.floor(Math.random() * 20) - 10,
      offsetY: Math.floor(Math.random() * 30),
      blur: Math.floor(Math.random() * 60) + 4,
      spread: Math.floor(Math.random() * 20) - 10,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"),
      opacity: Math.floor(Math.random() * 40) + 10,
      inset: Math.random() > 0.8,
    });
  };

  const applyPreset = (preset: typeof presetShadows[0]) => {
    setConfig(preset.config);
  };

  const updateConfig = <K extends keyof ShadowConfig>(key: K, value: ShadowConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    applyPreset(presetShadows[1]);
  }, []);

  const shadowStyle = {
    boxShadow: config.inset
      ? `inset ${config.offsetX}px ${config.offsetY}px ${config.blur}px ${config.spread}px ${hexToRgba(config.color, config.opacity / 100)}`
      : `${config.offsetX}px ${config.offsetY}px ${config.blur}px ${config.spread}px ${hexToRgba(config.color, config.opacity / 100)}`,
  };

  return (
    <ToolLayout
      title="CSS 阴影生成器"
      description="可视化生成 CSS box-shadow 代码，自定义偏移、模糊、扩散和颜色，支持内阴影"
      icon={Layers}
      category="生成工具"
      slug="shadow-generator"
      toolId="shadow-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">阴影生成</span>
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
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
            className="w-48 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center"
            style={shadowStyle}
          >
            <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
              阴影预览
            </span>
          </div>
        </div>

        {/* 预设 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            预设阴影
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {presetShadows.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="group p-3 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl transition-colors"
              >
                <div className="h-12 flex items-center justify-center">
                  <div
                    className="w-12 h-6 bg-white rounded-md"
                    style={{
                      boxShadow: preset.config.inset
                        ? `inset ${preset.config.offsetX}px ${preset.config.offsetY}px ${preset.config.blur}px ${preset.config.spread}px ${hexToRgba(preset.config.color, preset.config.opacity / 100)}`
                        : `${preset.config.offsetX}px ${preset.config.offsetY}px ${preset.config.blur}px ${preset.config.spread}px ${hexToRgba(preset.config.color, preset.config.opacity / 100)}`,
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

        {/* 参数设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* X 偏移 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">X 偏移</label>
              <span className="text-sm font-mono text-emerald-400">
                {config.offsetX}px
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={config.offsetX}
              onChange={(e) => updateConfig("offsetX", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Y 偏移 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">Y 偏移</label>
              <span className="text-sm font-mono text-emerald-400">
                {config.offsetY}px
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={100}
              value={config.offsetY}
              onChange={(e) => updateConfig("offsetY", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 模糊半径 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">模糊半径</label>
              <span className="text-sm font-mono text-emerald-400">
                {config.blur}px
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.blur}
              onChange={(e) => updateConfig("blur", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 扩散半径 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">扩散半径</label>
              <span className="text-sm font-mono text-emerald-400">
                {config.spread}px
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={50}
              value={config.spread}
              onChange={(e) => updateConfig("spread", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 不透明度 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">不透明度</label>
              <span className="text-sm font-mono text-emerald-400">
                {config.opacity}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={config.opacity}
              onChange={(e) => updateConfig("opacity", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* 颜色 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">阴影颜色</label>
              <span className="text-sm font-mono text-emerald-400 uppercase">
                {config.color}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.color}
                onChange={(e) => updateConfig("color", e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.inset}
                  onChange={(e) => updateConfig("inset", e.target.checked)}
                  className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-emerald-500 focus:ring-emerald-500/50"
                />
                <span className="text-sm text-slate-400">内阴影</span>
              </label>
            </div>
          </div>
        </div>

        {/* CSS 代码 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              CSS 代码
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={copyTailwind}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
              >
                {copiedTW ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /> 已复制</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> 复制 Tailwind</>
                )}
              </button>
            </div>
          </div>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-emerald-300 break-all">
              {cssCode}
            </pre>
            <div className="mt-3 pt-3 border-t border-[#27272a]">
              <span className="text-xs text-slate-500">Tailwind 类名: </span>
              <code className="text-xs font-mono text-emerald-400">{tailwindClass}</code>
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 调整滑块实时预览阴影效果，支持自定义颜色和不透明度</li>
          <li>• X/Y 偏移控制阴影位置，模糊半径控制柔和程度</li>
          <li>• 扩散半径为正值放大阴影，负值缩小阴影</li>
          <li>• 勾选「内阴影」可生成 inset 内阴影效果</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
