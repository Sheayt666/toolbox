"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Wind, Copy, Check, Shuffle, Code } from "lucide-react";

const tailwindColors = [
  { name: "slate", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "gray", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "zinc", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "neutral", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "stone", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "red", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "orange", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "amber", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "yellow", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "lime", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "green", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "emerald", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "teal", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "cyan", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "sky", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "blue", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "indigo", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "violet", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "purple", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "fuchsia", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "pink", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
  { name: "rose", hues: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"] },
];

type GradientType = "linear" | "radial" | "conic";
type Direction = "to-r" | "to-l" | "to-t" | "to-b" | "to-tr" | "to-tl" | "to-br" | "to-bl";

const directions: { label: string; value: Direction }[] = [
  { label: "→", value: "to-r" },
  { label: "←", value: "to-l" },
  { label: "↑", value: "to-t" },
  { label: "↓", value: "to-b" },
  { label: "↗", value: "to-tr" },
  { label: "↖", value: "to-tl" },
  { label: "↘", value: "to-br" },
  { label: "↙", value: "to-bl" },
];

const presetGradients = [
  { name: "紫罗兰梦境", from: "from-violet-500", to: "to-purple-600" },
  { name: "海洋深处", from: "from-blue-600", to: "to-cyan-400" },
  { name: "日落黄昏", from: "from-orange-500", to: "to-rose-500" },
  { name: "森林清晨", from: "from-emerald-500", to: "to-teal-600" },
  { name: "糖果粉紫", from: "from-pink-500", to: "to-violet-500" },
  { name: "深邃星空", from: "from-slate-800", to: "to-indigo-900" },
];

export default function TailwindGradientPage() {
  const [type, setType] = useState<GradientType>("linear");
  const [direction, setDirection] = useState<Direction>("to-br");
  const [fromColor, setFromColor] = useState("violet");
  const [fromShade, setFromShade] = useState("500");
  const [toColor, setToColor] = useState("purple");
  const [toShade, setToShade] = useState("600");
  const [copied, setCopied] = useState(false);

  const gradientClass =
    type === "linear"
      ? `bg-gradient-to-${direction.slice(3)} from-${fromColor}-${fromShade} to-${toColor}-${toShade}`
      : type === "radial"
      ? `bg-gradient-radial from-${fromColor}-${fromShade} to-${toColor}-${toShade}`
      : `bg-gradient-conic from-${fromColor}-${fromShade} to-${toColor}-${toShade}`;

  const cssCode = `className="${gradientClass}"`;

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(gradientClass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [gradientClass]);

  const randomize = () => {
    const colorPairs = tailwindColors;
    const fromIdx = Math.floor(Math.random() * colorPairs.length);
    let toIdx = Math.floor(Math.random() * colorPairs.length);
    while (toIdx === fromIdx) {
      toIdx = Math.floor(Math.random() * colorPairs.length);
    }
    setFromColor(colorPairs[fromIdx].name);
    setToColor(colorPairs[toIdx].name);
    setFromShade(["400", "500", "600", "700"][Math.floor(Math.random() * 4)]);
    setToShade(["500", "600", "700", "800"][Math.floor(Math.random() * 4)]);
    const dirs = directions.map((d) => d.value);
    setDirection(dirs[Math.floor(Math.random() * dirs.length)]);
  };

  const applyPreset = (preset: typeof presetGradients[0]) => {
    const fromParts = preset.from.replace("from-", "").split("-");
    const toParts = preset.to.replace("to-", "").split("-");
    setFromColor(fromParts[0]);
    setFromShade(fromParts[1]);
    setToColor(toParts[0]);
    setToShade(toParts[1]);
  };

  useEffect(() => {
    randomize();
  }, []);

  const previewStyle =
    type === "linear"
      ? {
          background: `linear-gradient(var(--tw-gradient-stops))`,
        }
      : type === "radial"
      ? { background: `radial-gradient(circle, var(--tw-gradient-stops))` }
      : { background: `conic-gradient(var(--tw-gradient-stops))` };

  return (
    <ToolLayout
      title="Tailwind 渐变生成器"
      description="快速生成 Tailwind CSS 渐变类名，支持多种方向和颜色，一键复制到项目中使用"
      icon={Wind}
      category="生成工具"
      slug="tailwind-gradient"
      toolId="tailwind-gradient"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-white">Tailwind 渐变</span>
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
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-sky-500/25"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制类名
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div
          className={`w-full h-64 rounded-2xl border border-[#27272a] ${gradientClass}`}
        >
          <div className="w-full h-full flex items-center justify-center">
            <code className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-lg text-white text-sm font-mono">
              {gradientClass}
            </code>
          </div>
        </div>

        {/* 渐变类型 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            渐变类型
          </label>
          <div className="flex gap-2">
            {(["linear", "radial", "conic"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  type === t
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                }`}
              >
                {t === "linear" ? "线性渐变" : t === "radial" ? "径向渐变" : "锥形渐变"}
              </button>
            ))}
          </div>
        </div>

        {/* 方向（仅线性渐变） */}
        {type === "linear" && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              方向
            </label>
            <div className="grid grid-cols-8 gap-2">
              {directions.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDirection(d.value)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    direction === d.value
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 颜色选择 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              起始色 (from)
            </label>
            <div className="space-y-3">
              <select
                value={fromColor}
                onChange={(e) => setFromColor(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none appearance-none cursor-pointer"
              >
                {tailwindColors.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-1.5 flex-wrap">
                {tailwindColors
                  .find((c) => c.name === fromColor)
                  ?.hues.map((hue) => (
                    <button
                      key={hue}
                      onClick={() => setFromShade(hue)}
                      className={`px-2 py-1 rounded-md text-xs font-mono transition-all ${
                        fromShade === hue
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : "bg-[#09090b] text-slate-500 border border-[#27272a] hover:text-white"
                      }`}
                    >
                      {hue}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              结束色 (to)
            </label>
            <div className="space-y-3">
              <select
                value={toColor}
                onChange={(e) => setToColor(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none appearance-none cursor-pointer"
              >
                {tailwindColors.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-1.5 flex-wrap">
                {tailwindColors
                  .find((c) => c.name === toColor)
                  ?.hues.map((hue) => (
                    <button
                      key={hue}
                      onClick={() => setToShade(hue)}
                      className={`px-2 py-1 rounded-md text-xs font-mono transition-all ${
                        toShade === hue
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : "bg-[#09090b] text-slate-500 border border-[#27272a] hover:text-white"
                      }`}
                    >
                      {hue}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* 预设方案 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            预设方案
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presetGradients.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="group"
              >
                <div
                  className={`h-14 rounded-xl border border-[#27272a] group-hover:border-[#3f3f46] transition-colors ${preset.from} ${preset.to} bg-gradient-to-br`}
                />
                <span className="text-xs text-slate-500 group-hover:text-slate-300 mt-1.5 block text-center">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 代码输出 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Code className="w-4 h-4 text-sky-400" />
              Tailwind 类名
            </label>
          </div>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-sky-300 break-all">
              {gradientClass}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 选择起始色和结束色，自动生成 Tailwind CSS 渐变类名</li>
          <li>• 支持线性、径向、锥形三种渐变类型，8种方向选择</li>
          <li>• 涵盖 Tailwind 全部 22 种色系，每色 11 个色阶</li>
          <li>• 点击复制按钮即可复制类名到剪贴板</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
