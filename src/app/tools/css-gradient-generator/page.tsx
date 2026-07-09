"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Paintbrush, Copy, Check, Plus, X, Shuffle, Code2 } from "lucide-react";

type GradientType = "linear" | "radial" | "conic" | "repeating-linear" | "repeating-radial";

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const typeLabels: Record<GradientType, string> = {
  linear: "线性渐变",
  radial: "径向渐变",
  conic: "锥形渐变",
  "repeating-linear": "重复线性",
  "repeating-radial": "重复径向",
};

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function generateRandomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

export default function CssGradientGeneratorPage() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(135);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: generateId(), color: "#667eea", position: 0 },
    { id: generateId(), color: "#764ba2", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const generateCSS = useCallback((): string => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");

    switch (type) {
      case "linear":
        return `background: linear-gradient(${angle}deg, ${stopsStr});`;
      case "radial":
        return `background: radial-gradient(circle at center, ${stopsStr});`;
      case "conic":
        return `background: conic-gradient(from ${angle}deg at center, ${stopsStr});`;
      case "repeating-linear":
        return `background: repeating-linear-gradient(${angle}deg, ${stopsStr});`;
      case "repeating-radial":
        return `background: repeating-radial-gradient(circle at center, ${stopsStr});`;
    }
  }, [type, angle, colorStops]);

  const cssCode = generateCSS();

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const addColorStop = () => {
    if (colorStops.length >= 8) return;
    const newStop: ColorStop = {
      id: generateId(),
      color: generateRandomColor(),
      position: 50,
    };
    setColorStops([...colorStops, newStop]);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length <= 2) return;
    setColorStops(colorStops.filter((s) => s.id !== id));
  };

  const updateColorStop = (id: string, key: keyof ColorStop, value: string | number) => {
    setColorStops(
      colorStops.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const randomize = () => {
    const count = 2 + Math.floor(Math.random() * 4);
    const newStops: ColorStop[] = [];
    for (let i = 0; i < count; i++) {
      newStops.push({
        id: generateId(),
        color: generateRandomColor(),
        position: Math.round((i / (count - 1)) * 100),
      });
    }
    setColorStops(newStops);
    setAngle(Math.floor(Math.random() * 360));
  };

  useEffect(() => {
    randomize();
  }, []);

  const getBackgroundStyle = (): React.CSSProperties => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");

    switch (type) {
      case "linear":
        return { background: `linear-gradient(${angle}deg, ${stopsStr})` };
      case "radial":
        return { background: `radial-gradient(circle at center, ${stopsStr})` };
      case "conic":
        return { background: `conic-gradient(from ${angle}deg at center, ${stopsStr})` };
      case "repeating-linear":
        return { background: `repeating-linear-gradient(${angle}deg, ${stopsStr})` };
      case "repeating-radial":
        return { background: `repeating-radial-gradient(circle at center, ${stopsStr})` };
    }
  };

  return (
    <ToolLayout
      title="CSS 渐变生成器"
      description="专业 CSS 渐变代码生成器，支持线性、径向、锥形、重复渐变，多色节点精确控制"
      icon={Paintbrush}
      category="生成工具"
      slug="css-gradient-generator"
      toolId="css-gradient-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">CSS 渐变生成</span>
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-cyan-500/25"
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
        <div
          className="w-full h-56 rounded-2xl border border-[#27272a]"
          style={getBackgroundStyle()}
        />

        {/* 渐变类型 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            渐变类型
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(typeLabels) as GradientType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  type === t
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                }`}
              >
                {typeLabels[t]}
              </button>
            ))}
          </div>
        </div>

        {/* 角度（线性/锥形/重复线性） */}
        {(type === "linear" || type === "conic" || type === "repeating-linear") && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">角度</label>
              <span className="text-sm font-mono text-cyan-400">{angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between mt-1 text-xs text-slate-600">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>
        )}

        {/* 颜色节点 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              颜色节点 ({colorStops.length}/8)
            </label>
            <button
              onClick={addColorStop}
              disabled={colorStops.length >= 8}
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              添加节点
            </button>
          </div>

          <div className="space-y-3">
            {colorStops
              .sort((a, b) => a.position - b.position)
              .map((stop, idx) => (
                <div
                  key={stop.id}
                  className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-xl"
                >
                  <span className="text-xs text-slate-500 w-6">#{idx + 1}</span>
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, "color", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
                  />
                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, "color", e.target.value)}
                    className="w-24 px-3 py-2 bg-transparent border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none"
                  />
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={stop.position}
                      onChange={(e) =>
                        updateColorStop(stop.id, "position", Number(e.target.value))
                      }
                      className="flex-1 h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <span className="text-xs font-mono text-slate-400 w-10 text-right">
                      {stop.position}%
                    </span>
                  </div>
                  <button
                    onClick={() => removeColorStop(stop.id)}
                    disabled={colorStops.length <= 2}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* CSS 代码 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            生成的 CSS 代码
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-cyan-300 whitespace-pre-wrap break-all">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持 5 种渐变类型：线性、径向、锥形、重复线性、重复径向</li>
          <li>• 最多添加 8 个颜色节点，可精确调整每个节点的位置百分比</li>
          <li>• 点击「复制 CSS」按钮即可复制完整的 CSS 代码</li>
          <li>• 重复渐变适合创建条纹、网格等图案效果</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
