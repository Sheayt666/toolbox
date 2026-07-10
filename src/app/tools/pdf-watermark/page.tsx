"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Droplet, Upload, Download, Info, FileText } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

export default function PdfWatermarkPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(60);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState("#ff0000");
  const [position, setPosition] = useState<"center" | "tile" | "top-left" | "bottom-right">("center");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
  };

  const getWatermarkElements = () => {
    if (position === "tile") {
      const items = [];
      for (let y = 10; y < 100; y += 25) {
        for (let x = 10; x < 100; x += 30) {
          items.push({ left: `${x}%`, top: `${y}%` });
        }
      }
      return items;
    }
    if (position === "center") return [{ left: "50%", top: "50%" }];
    if (position === "top-left") return [{ left: "15%", top: "20%" }];
    if (position === "bottom-right") return [{ left: "75%", top: "75%" }];
    return [{ left: "50%", top: "50%" }];
  };

  const generatePdf = () => {
    if (!pdfUrl) return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    const positions = getWatermarkElements();
    const watermarkHtml = positions.map(p => `
      <div style="
        position: absolute;
        left: ${p.left};
        top: ${p.top};
        transform: translate(-50%, -50%) rotate(${rotation}deg);
        font-size: ${fontSize}px;
        color: ${color};
        opacity: ${opacity};
        font-family: Arial, sans-serif;
        font-weight: bold;
        white-space: nowrap;
        pointer-events: none;
        z-index: 9999;
      ">${watermarkText}</div>
    `).join("");

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName.replace(/\.pdf$/i, "")}_水印版</title>
        <style>
          @page { margin: 0; }
          body { margin: 0; position: relative; }
          .pdf-container { width: 100vw; height: 100vh; position: relative; }
          embed { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div class="pdf-container">
          <embed src="${pdfUrl}" type="application/pdf" />
          ${watermarkHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 1500);
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <ToolLayout
      title="PDF添加水印"
      description="为PDF文件添加文字水印，支持自定义位置、角度、颜色和透明度"
      icon={Droplet}
      category="PDF工具"
      slug="pdf-watermark"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">PDF水印工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              上传PDF文件，自定义水印文字、字号、颜色、透明度、旋转角度和位置布局，通过浏览器打印功能导出水印版PDF。
            </p>
          </div>
        </div>

        {!pdfUrl ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#27272a] rounded-xl py-14 cursor-pointer hover:border-primary-500/50 transition-colors">
            <Upload className="w-10 h-10 text-slate-600 mb-3" />
            <span className="text-sm text-slate-400">点击上传 PDF 文件</span>
            <span className="text-xs text-slate-600 mt-1">仅支持 .pdf 格式</span>
            <input type="file" accept=".pdf" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 truncate flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-400" />
                {fileName}
              </span>
              <button
                onClick={() => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }}
                className="text-xs text-slate-500 hover:text-white"
              >
                重新上传
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-2">水印文字</label>
              <input
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="输入水印文字..."
                className={inputClass}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500">字号</label>
                  <span className="text-xs text-slate-400 font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={150}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500">旋转角度</label>
                  <span className="text-xs text-slate-400 font-mono">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-500">透明度</label>
                  <span className="text-xs text-slate-400 font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={Math.round(opacity * 100)}
                  onChange={(e) => setOpacity(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-2">水印颜色</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#27272a] bg-[#0a0a0b] cursor-pointer"
                  />
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className={inputClass + " font-mono"}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 block mb-2">水印位置</label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { v: "center", l: "居中" },
                  { v: "tile", l: "平铺" },
                  { v: "top-left", l: "左上" },
                  { v: "bottom-right", l: "右下" },
                ] as const).map((p) => (
                  <button
                    key={p.v}
                    onClick={() => setPosition(p.v)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      position === p.v ? "bg-primary-500 text-white" : "bg-[#0a0a0b] border border-[#27272a] text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <p className="text-xs text-slate-500 mb-3">预览效果</p>
              <div className="relative bg-white rounded-lg mx-auto overflow-hidden" style={{ width: "100%", maxWidth: "400px", height: "250px" }}>
                <div className="absolute inset-0 flex items-center justify-center text-slate-200 text-xs">PDF 内容区域</div>
                {getWatermarkElements().map((p, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: p.left,
                      top: p.top,
                      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                      fontSize: `${Math.min(fontSize, 40)}px`,
                      color: color,
                      opacity: opacity,
                      fontFamily: "Arial, sans-serif",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                    }}
                  >
                    {watermarkText}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={generatePdf}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg"
            >
              <Download className="w-4 h-4" />
              生成水印PDF
            </button>

            <p className="text-xs text-slate-600 text-center">
              点击按钮后会打开打印窗口，请在目标中选择"另存为PDF"以保存
            </p>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
