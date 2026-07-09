"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Grid3X3, Copy, Check, Plus, X, Shuffle, Code2 } from "lucide-react";

interface GridConfig {
  columns: number;
  rows: number;
  gap: number;
  columnGap: number;
  rowGap: number;
  useUniformGap: boolean;
  justifyItems: "start" | "end" | "center" | "stretch";
  alignItems: "start" | "end" | "center" | "stretch";
  justifyContent: "start" | "end" | "center" | "space-between" | "space-around" | "space-evenly";
  alignContent: "start" | "end" | "center" | "space-between" | "space-around" | "space-evenly" | "stretch";
}

const defaultItems = 9;

export default function CssGridGeneratorPage() {
  const [config, setConfig] = useState<GridConfig>({
    columns: 3,
    rows: 3,
    gap: 12,
    columnGap: 12,
    rowGap: 12,
    useUniformGap: true,
    justifyItems: "stretch",
    alignItems: "stretch",
    justifyContent: "start",
    alignContent: "start",
  });
  const [itemCount, setItemCount] = useState(defaultItems);
  const [copied, setCopied] = useState(false);

  const generateCSS = useCallback((): string => {
    const gap = config.useUniformGap
      ? `  gap: ${config.gap}px;`
      : `  column-gap: ${config.columnGap}px;\n  row-gap: ${config.rowGap}px;`;

    return `.grid-container {
  display: grid;
  grid-template-columns: repeat(${config.columns}, 1fr);
  grid-template-rows: repeat(${config.rows}, 1fr);
${gap}
  justify-items: ${config.justifyItems};
  align-items: ${config.alignItems};
  justify-content: ${config.justifyContent};
  align-content: ${config.alignContent};
}`;
  }, [config]);

  const cssCode = generateCSS();

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const updateConfig = <K extends keyof GridConfig>(key: K, value: GridConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const randomize = () => {
    setConfig({
      columns: 2 + Math.floor(Math.random() * 4),
      rows: 2 + Math.floor(Math.random() * 3),
      gap: Math.floor(Math.random() * 30) + 4,
      columnGap: Math.floor(Math.random() * 30) + 4,
      rowGap: Math.floor(Math.random() * 30) + 4,
      useUniformGap: Math.random() > 0.3,
      justifyItems: ["start", "end", "center", "stretch"][Math.floor(Math.random() * 4)] as any,
      alignItems: ["start", "end", "center", "stretch"][Math.floor(Math.random() * 4)] as any,
      justifyContent: ["start", "end", "center", "space-between", "space-around", "space-evenly"][Math.floor(Math.random() * 6)] as any,
      alignContent: ["start", "end", "center", "space-between", "space-around", "space-evenly", "stretch"][Math.floor(Math.random() * 7)] as any,
    });
  };

  useEffect(() => {
    // 初始化
  }, []);

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
    gridTemplateRows: `repeat(${config.rows}, 1fr)`,
    gap: config.useUniformGap ? `${config.gap}px` : undefined,
    columnGap: !config.useUniformGap ? `${config.columnGap}px` : undefined,
    rowGap: !config.useUniformGap ? `${config.rowGap}px` : undefined,
    justifyItems: config.justifyItems,
    alignItems: config.alignItems,
    justifyContent: config.justifyContent,
    alignContent: config.alignContent,
    minHeight: "200px",
  };

  return (
    <ToolLayout
      title="CSS Grid 生成器"
      description="可视化生成 CSS Grid 布局代码，自定义行列数、间距和对齐方式，快速构建网格布局"
      icon={Grid3X3}
      category="生成工具"
      slug="css-grid-generator"
      toolId="css-grid-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">CSS Grid</span>
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
        <div className="bg-[#09090b] rounded-2xl border border-[#27272a] p-6">
          <div style={gridStyle}>
            {Array.from({ length: itemCount }, (_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-300 text-sm font-medium h-16"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* 基本设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300">列数</label>
                <span className="text-sm font-mono text-emerald-400">
                  {config.columns}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={config.columns}
                onChange={(e) => updateConfig("columns", Number(e.target.value))}
                className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300">行数</label>
                <span className="text-sm font-mono text-emerald-400">
                  {config.rows}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                value={config.rows}
                onChange={(e) => updateConfig("rows", Number(e.target.value))}
                className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300">子项数量</label>
                <span className="text-sm font-mono text-emerald-400">
                  {itemCount}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={24}
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-300">间距类型</label>
              <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
                <button
                  onClick={() => updateConfig("useUniformGap", true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    config.useUniformGap
                      ? "bg-[#27272a] text-emerald-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  统一
                </button>
                <button
                  onClick={() => updateConfig("useUniformGap", false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    !config.useUniformGap
                      ? "bg-[#27272a] text-emerald-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  分开
                </button>
              </div>
            </div>

            {config.useUniformGap ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-300">间距</label>
                  <span className="text-sm font-mono text-emerald-400">
                    {config.gap}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={config.gap}
                  onChange={(e) => updateConfig("gap", Number(e.target.value))}
                  className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-300">列间距</label>
                    <span className="text-sm font-mono text-emerald-400">
                      {config.columnGap}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={config.columnGap}
                    onChange={(e) => updateConfig("columnGap", Number(e.target.value))}
                    className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-slate-300">行间距</label>
                    <span className="text-sm font-mono text-emerald-400">
                      {config.rowGap}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={config.rowGap}
                    onChange={(e) => updateConfig("rowGap", Number(e.target.value))}
                    className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* 对齐方式 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              justify-items (主轴对齐)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["start", "end", "center", "stretch"].map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("justifyItems", v as any)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.justifyItems === v
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              align-items (交叉轴对齐)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {["start", "end", "center", "stretch"].map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("alignItems", v as any)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.alignItems === v
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              justify-content (主轴内容)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["start", "end", "center", "space-between", "space-around", "space-evenly"].map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("justifyContent", v as any)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.justifyContent === v
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              align-content (交叉轴内容)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["start", "end", "center", "space-between", "space-around", "space-evenly", "stretch"].map((v) => (
                <button
                  key={v}
                  onClick={() => updateConfig("alignContent", v as any)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    config.alignContent === v
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CSS 代码 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            CSS 代码
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-emerald-300 whitespace-pre-wrap">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 调整列数、行数和间距，实时预览 Grid 布局效果</li>
          <li>• justify-items / align-items 控制单元格内元素的对齐</li>
          <li>• justify-content / align-content 控制整体网格的对齐</li>
          <li>• 生成的 CSS 代码可直接复制到项目中使用</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
