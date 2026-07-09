"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { AlignJustify, Copy, Check, Shuffle, Code2 } from "lucide-react";

interface FlexConfig {
  direction: "row" | "row-reverse" | "column" | "column-reverse";
  justifyContent: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
  alignItems: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  flexWrap: "nowrap" | "wrap" | "wrap-reverse";
  gap: number;
}

const defaultItems = 5;

export default function CssFlexGeneratorPage() {
  const [config, setConfig] = useState<FlexConfig>({
    direction: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  });
  const [itemCount, setItemCount] = useState(defaultItems);
  const [copied, setCopied] = useState(false);

  const generateCSS = useCallback((): string => {
    return `.flex-container {
  display: flex;
  flex-direction: ${config.direction};
  justify-content: ${config.justifyContent};
  align-items: ${config.alignItems};
  flex-wrap: ${config.flexWrap};
  gap: ${config.gap}px;
}`;
  }, [config]);

  const cssCode = generateCSS();

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const updateConfig = <K extends keyof FlexConfig>(key: K, value: FlexConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const randomize = () => {
    setConfig({
      direction: ["row", "row-reverse", "column", "column-reverse"][Math.floor(Math.random() * 4)] as any,
      justifyContent: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"][Math.floor(Math.random() * 6)] as any,
      alignItems: ["flex-start", "flex-end", "center", "stretch", "baseline"][Math.floor(Math.random() * 5)] as any,
      flexWrap: ["nowrap", "wrap", "wrap-reverse"][Math.floor(Math.random() * 3)] as any,
      gap: Math.floor(Math.random() * 40) + 4,
    });
    setItemCount(3 + Math.floor(Math.random() * 5));
  };

  useEffect(() => {
    // 初始化
  }, []);

  const flexStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: config.direction,
    justifyContent: config.justifyContent,
    alignItems: config.alignItems,
    flexWrap: config.flexWrap,
    gap: `${config.gap}px`,
    minHeight: "200px",
  };

  return (
    <ToolLayout
      title="CSS Flexbox 生成器"
      description="可视化生成 CSS Flexbox 布局代码，自定义方向、对齐和换行，快速构建弹性布局"
      icon={AlignJustify}
      category="生成工具"
      slug="css-flex-generator"
      toolId="css-flex-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-white">CSS Flexbox</span>
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
                复制 CSS
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div className="bg-[#09090b] rounded-2xl border border-[#27272a] p-6">
          <div style={flexStyle} className="bg-[#18181b]/50 rounded-xl p-4 min-h-[200px] border border-dashed border-[#27272a]">
            {Array.from({ length: itemCount }, (_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-sky-500/30 to-blue-500/30 border border-sky-500/30 rounded-lg flex items-center justify-center text-sky-300 text-sm font-medium w-16 h-16 flex-shrink-0"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* flex-direction */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              flex-direction (主轴方向)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["row", "row-reverse", "column", "column-reverse"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("direction", v)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.direction === v
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* flex-wrap */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              flex-wrap (换行方式)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["nowrap", "wrap", "wrap-reverse"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("flexWrap", v)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.flexWrap === v
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* justify-content */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              justify-content (主轴对齐)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("justifyContent", v)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.justifyContent === v
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* align-items */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              align-items (交叉轴对齐)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["flex-start", "flex-end", "center", "stretch", "baseline"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("alignItems", v)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.alignItems === v
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 间距和数量 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">间距 (gap)</label>
              <span className="text-sm font-mono text-sky-400">{config.gap}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={config.gap}
              onChange={(e) => updateConfig("gap", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">子项数量</label>
              <span className="text-sm font-mono text-sky-400">{itemCount}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* CSS 代码 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            CSS 代码
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-sky-300 whitespace-pre-wrap">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• Flexbox 是一维布局系统，适合处理行或列中的元素排列</li>
          <li>• justify-content 控制主轴方向的对齐方式</li>
          <li>• align-items 控制交叉轴方向的对齐方式</li>
          <li>• flex-wrap 控制子元素是否换行显示</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
