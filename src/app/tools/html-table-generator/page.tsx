"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Table2, Copy, Check, Plus, X, Shuffle, Code2 } from "lucide-react";

interface TableConfig {
  rows: number;
  cols: number;
  headerRow: boolean;
  headerCol: boolean;
  striped: boolean;
  bordered: boolean;
  hoverable: boolean;
  compact: boolean;
}

export default function HtmlTableGeneratorPage() {
  const [config, setConfig] = useState<TableConfig>({
    rows: 4,
    cols: 3,
    headerRow: true,
    headerCol: false,
    striped: true,
    bordered: true,
    hoverable: false,
    compact: false,
  });
  const [copied, setCopied] = useState(false);

  const generateHTML = useCallback((): string => {
    let html = `<table${config.bordered ? ' border="1" cellpadding="8" cellspacing="0"' : ""} style="border-collapse: collapse; width: 100%;">\n`;

    if (config.headerRow) {
      html += "  <thead>\n    <tr>\n";
      for (let c = 0; c < config.cols; c++) {
        html += `      <th style="background: #1e293b; color: #f1f5f9; padding: ${config.compact ? "8px" : "12px"}; text-align: left;">表头 ${c + 1}</th>\n`;
      }
      html += "    </tr>\n  </thead>\n";
    }

    html += "  <tbody>\n";
    const dataRows = config.headerRow ? config.rows - 1 : config.rows;

    for (let r = 0; r < dataRows; r++) {
      const isEven = r % 2 === 0;
      const bgColor = config.striped && !isEven
        ? "background: #1e293b; "
        : "";
      html += `    <tr${config.hoverable ? ' onmouseover="this.style.background=\'#334155\'" onmouseout="this.style.background=\'${config.striped && !isEven ? "#1e293b" : "transparent"}\'"' : ""} style="${bgColor}">\n`;

      for (let c = 0; c < config.cols; c++) {
        const isHeaderCol = config.headerCol && c === 0;
        const tag = isHeaderCol ? "th" : "td";
        const style = isHeaderCol
          ? `style="background: #1e293b; color: #f1f5f9; padding: ${config.compact ? "8px" : "12px"}; text-align: left;"`
          : `style="padding: ${config.compact ? "8px" : "12px"}; color: #cbd5e1;"`;
        html += `      <${tag} ${style}>${isHeaderCol ? `行标题 ${r + 1}` : `数据 ${r + 1}-${c + 1}`}</${tag}>\n`;
      }
      html += "    </tr>\n";
    }

    html += "  </tbody>\n</table>";
    return html;
  }, [config]);

  const htmlCode = generateHTML();

  const copyHTML = useCallback(() => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [htmlCode]);

  const updateConfig = <K extends keyof TableConfig>(key: K, value: TableConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const randomize = () => {
    setConfig({
      rows: 3 + Math.floor(Math.random() * 5),
      cols: 2 + Math.floor(Math.random() * 4),
      headerRow: Math.random() > 0.2,
      headerCol: Math.random() > 0.7,
      striped: Math.random() > 0.4,
      bordered: Math.random() > 0.3,
      hoverable: Math.random() > 0.5,
      compact: Math.random() > 0.7,
    });
  };

  useEffect(() => {
    // 初始化
  }, []);

  return (
    <ToolLayout
      title="HTML 表格生成器"
      description="在线生成 HTML 表格代码，自定义行列数、样式和功能，一键复制可用的表格代码"
      icon={Table2}
      category="生成工具"
      slug="html-table-generator"
      toolId="html-table-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">HTML 表格</span>
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
            onClick={copyHTML}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制 HTML
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div className="bg-[#09090b] rounded-2xl border border-[#27272a] p-6 overflow-x-auto">
          <table
            className="w-full"
            style={{ borderCollapse: "collapse" }}
          >
            {config.headerRow && (
              <thead>
                <tr>
                  {Array.from({ length: config.cols }, (_, c) => (
                    <th
                      key={c}
                      className="text-left"
                      style={{
                        background: "#1e293b",
                        color: "#f1f5f9",
                        padding: config.compact ? "8px" : "12px",
                        border: config.bordered ? "1px solid #334155" : "none",
                      }}
                    >
                      表头 {c + 1}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {Array.from(
                { length: config.headerRow ? config.rows - 1 : config.rows },
                (_, r) => {
                  const isEven = r % 2 === 0;
                  return (
                    <tr
                      key={r}
                      className={config.hoverable ? "hover:bg-[#334155]" : ""}
                      style={{
                        background: config.striped && !isEven ? "#1e293b" : "transparent",
                      }}
                    >
                      {Array.from({ length: config.cols }, (_, c) => {
                        const isHeaderCol = config.headerCol && c === 0;
                        return (
                          <td
                            key={c}
                            style={{
                              padding: config.compact ? "8px" : "12px",
                              color: isHeaderCol ? "#f1f5f9" : "#cbd5e1",
                              background: isHeaderCol ? "#1e293b" : "transparent",
                              fontWeight: isHeaderCol ? 600 : 400,
                              border: config.bordered ? "1px solid #334155" : "none",
                            }}
                          >
                            {isHeaderCol ? `行标题 ${r + 1}` : `数据 ${r + 1}-${c + 1}`}
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>

        {/* 基本设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">行数</label>
              <span className="text-sm font-mono text-orange-400">{config.rows}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={config.rows}
              onChange={(e) => updateConfig("rows", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">列数</label>
              <span className="text-sm font-mono text-orange-400">{config.cols}</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={config.cols}
              onChange={(e) => updateConfig("cols", Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>

        {/* 样式选项 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            表格样式
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: "headerRow", label: "表头行" },
              { key: "headerCol", label: "表头列" },
              { key: "striped", label: "斑马纹" },
              { key: "bordered", label: "边框" },
              { key: "hoverable", label: "悬停效果" },
              { key: "compact", label: "紧凑模式" },
            ].map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={config[opt.key as keyof TableConfig] as boolean}
                  onChange={(e) =>
                    updateConfig(opt.key as keyof TableConfig, e.target.checked as any)
                  }
                  className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-orange-500 focus:ring-orange-500/50"
                />
                <span className="text-sm text-slate-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* HTML 代码 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            HTML 代码
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 max-h-80 overflow-auto">
            <pre className="font-mono text-sm text-orange-300 whitespace-pre">
              {htmlCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 自定义表格行列数，最多支持 20 行 10 列</li>
          <li>• 支持表头行、表头列、斑马纹、边框等多种样式</li>
          <li>• 生成的 HTML 代码带内联样式，可直接复制使用</li>
          <li>• 悬停效果使用原生 onmouseover 事件，无需额外 CSS</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
