"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Circle, Copy, Check, Shuffle, Code2 } from "lucide-react";

interface RadiusConfig {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

const presets = [
  { name: "无圆角", values: [0, 0, 0, 0] },
  { name: "小圆角", values: [6, 6, 6, 6] },
  { name: "中等圆角", values: [12, 12, 12, 12] },
  { name: "大圆角", values: [24, 24, 24, 24] },
  { name: "药丸形", values: [999, 999, 999, 999] },
  { name: "左上右下", values: [24, 0, 24, 0] },
  { name: "右上左下", values: [0, 24, 0, 24] },
  { name: "叶子形", values: [30, 0, 30, 0] },
];

export default function CssBorderRadiusPage() {
  const [radius, setRadius] = useState<RadiusConfig>({
    topLeft: 16,
    topRight: 16,
    bottomRight: 16,
    bottomLeft: 16,
  });
  const [linked, setLinked] = useState(true);
  const [copied, setCopied] = useState(false);
  const [unit, setUnit] = useState<"px" | "%">("px");

  const generateCSS = useCallback((): string => {
    const tl = `${radius.topLeft}${unit}`;
    const tr = `${radius.topRight}${unit}`;
    const br = `${radius.bottomRight}${unit}`;
    const bl = `${radius.bottomLeft}${unit}`;

    // Check if all same
    if (
      radius.topLeft === radius.topRight &&
      radius.topRight === radius.bottomRight &&
      radius.bottomRight === radius.bottomLeft
    ) {
      return `border-radius: ${tl};`;
    }

    return `border-radius: ${tl} ${tr} ${br} ${bl};`;
  }, [radius, unit]);

  const cssCode = generateCSS();

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const updateRadius = (key: keyof RadiusConfig, value: number) => {
    if (linked) {
      setRadius({
        topLeft: value,
        topRight: value,
        bottomRight: value,
        bottomLeft: value,
      });
    } else {
      setRadius((prev) => ({ ...prev, [key]: value }));
    }
  };

  const randomize = () => {
    setLinked(false);
    setRadius({
      topLeft: Math.floor(Math.random() * 60),
      topRight: Math.floor(Math.random() * 60),
      bottomRight: Math.floor(Math.random() * 60),
      bottomLeft: Math.floor(Math.random() * 60),
    });
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setLinked(
      preset.values[0] === preset.values[1] &&
        preset.values[1] === preset.values[2] &&
        preset.values[2] === preset.values[3]
    );
    setRadius({
      topLeft: preset.values[0],
      topRight: preset.values[1],
      bottomRight: preset.values[2],
      bottomLeft: preset.values[3],
    });
  };

  useEffect(() => {
    applyPreset(presets[2]);
  }, []);

  const radiusStyle = {
    borderTopLeftRadius: `${radius.topLeft}${unit}`,
    borderTopRightRadius: `${radius.topRight}${unit}`,
    borderBottomRightRadius: `${radius.bottomRight}${unit}`,
    borderBottomLeftRadius: `${radius.bottomLeft}${unit}`,
  };

  return (
    <ToolLayout
      title="CSS 圆角生成器"
      description="可视化生成 CSS border-radius 代码，支持四角独立调节，预设多种圆角效果"
      icon={Circle}
      category="生成工具"
      slug="css-border-radius"
      toolId="css-border-radius"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">圆角生成</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
            <button
              onClick={() => setUnit("px")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                unit === "px"
                  ? "bg-[#27272a] text-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              px
            </button>
            <button
              onClick={() => setUnit("%")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                unit === "%"
                  ? "bg-[#27272a] text-amber-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              %
            </button>
          </div>
          <button
            onClick={randomize}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
          >
            <Shuffle className="w-4 h-4" />
            随机
          </button>
          <button
            onClick={copyCSS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
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
            className="w-48 h-48 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
            style={radiusStyle}
          >
            <span className="text-white text-sm font-medium">圆角预览</span>
          </div>
        </div>

        {/* 预设 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            预设圆角
          </label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="group p-3 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl transition-colors"
              >
                <div className="h-10 flex items-center justify-center">
                  <div
                    className="w-10 h-10 bg-amber-500/50"
                    style={{
                      borderTopLeftRadius: `${preset.values[0]}${unit}`,
                      borderTopRightRadius: `${preset.values[1]}${unit}`,
                      borderBottomRightRadius: `${preset.values[2]}${unit}`,
                      borderBottomLeftRadius: `${preset.values[3]}${unit}`,
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

        {/* 控制区 */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-slate-300">
              圆角参数
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={linked}
                onChange={(e) => setLinked(e.target.checked)}
                className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-amber-500 focus:ring-amber-500/50"
              />
              <span className="text-sm text-slate-400">四角联动</span>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-2">左上</div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={radius.topLeft}
                  onChange={(e) => updateRadius("topLeft", Number(e.target.value))}
                  min={0}
                  max={500}
                  className="w-full px-3 py-2 bg-transparent border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none"
                />
                <span className="text-xs text-slate-500">{unit}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={radius.topLeft}
                onChange={(e) => updateRadius("topLeft", Number(e.target.value))}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-2">右上</div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={radius.topRight}
                  onChange={(e) => updateRadius("topRight", Number(e.target.value))}
                  min={0}
                  max={500}
                  className="w-full px-3 py-2 bg-transparent border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none"
                />
                <span className="text-xs text-slate-500">{unit}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={radius.topRight}
                onChange={(e) => updateRadius("topRight", Number(e.target.value))}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-2">右下</div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={radius.bottomRight}
                  onChange={(e) => updateRadius("bottomRight", Number(e.target.value))}
                  min={0}
                  max={500}
                  className="w-full px-3 py-2 bg-transparent border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none"
                />
                <span className="text-xs text-slate-500">{unit}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={radius.bottomRight}
                onChange={(e) => updateRadius("bottomRight", Number(e.target.value))}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-2">左下</div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={radius.bottomLeft}
                  onChange={(e) => updateRadius("bottomLeft", Number(e.target.value))}
                  min={0}
                  max={500}
                  className="w-full px-3 py-2 bg-transparent border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none"
                />
                <span className="text-xs text-slate-500">{unit}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={radius.bottomLeft}
                onChange={(e) => updateRadius("bottomLeft", Number(e.target.value))}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* CSS 代码 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            CSS 代码
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-amber-300 break-all">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持 px 和 % 两种单位，可切换使用</li>
          <li>• 开启「四角联动」可同时调整四个角的圆角大小</li>
          <li>• 关闭联动后可独立调整每个角的圆角值</li>
          <li>• 50% 圆角配合正方形可生成圆形效果</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
