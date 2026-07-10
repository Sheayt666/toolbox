"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Barcode, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

// Code 39 patterns: 9 elements (5 bars + 4 spaces), '1'=wide
const CODE39: Record<string, string> = {
  "0": "000110100", "1": "100100001", "2": "001100001", "3": "101100000",
  "4": "000110001", "5": "100110000", "6": "001110000", "7": "000100101",
  "8": "100100100", "9": "001100100", A: "100001001", B: "001001001",
  C: "101001000", D: "000011001", E: "100011000", F: "001011000",
  G: "000001101", H: "100001100", I: "001001100", J: "000011100",
  K: "100000011", L: "001000011", M: "101000010", N: "000010011",
  O: "100010010", P: "001010010", Q: "000000111", R: "100000110",
  S: "001000110", T: "000010110", U: "110000001", V: "011000001",
  W: "111000000", X: "010010001", Y: "110010000", Z: "011010000",
  "-": "010000101", ".": "110000100", " ": "011000100", $: "010101000",
  "/": "010100010", "+": "010001010", "%": "000101010", "*": "010010100",
};

// ITF (Interleaved 2 of 5) digit patterns: 5 bars
const ITF: Record<string, string> = {
  "0": "00110", "1": "10001", "2": "01001", "3": "11000", "4": "00101",
  "5": "10100", "6": "01100", "7": "00011", "8": "10010", "9": "01010",
};

function drawCode39(ctx: CanvasRenderingContext2D, text: string, opts: { barColor: string; bgColor: string; showText: boolean }) {
  const NW = 2, WW = 5, H = 120;
  const upper = text.toUpperCase().split("").filter((c) => CODE39[c]);
  const chars = ["*", ...upper, "*"];
  let pattern = "";
  chars.forEach((c, i) => {
    pattern += CODE39[c];
    if (i < chars.length - 1) pattern += "0"; // inter-character narrow space
  });
  let width = 0;
  pattern.split("").forEach((p, i) => { width += p === "1" ? WW : NW; });
  const padding = 20;
  const totalW = width + padding * 2;
  const canvas = ctx.canvas;
  canvas.width = totalW;
  canvas.height = opts.showText ? H + 24 : H;
  ctx.fillStyle = opts.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = opts.barColor;
  let x = padding;
  pattern.split("").forEach((p, i) => {
    const w = p === "1" ? WW : NW;
    if (i % 2 === 0) ctx.fillRect(x, 0, w, H); // bar
    x += w;
  });
  if (opts.showText) {
    ctx.fillStyle = opts.barColor;
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(text.toUpperCase(), canvas.width / 2, H + 18);
  }
}

function drawITF(ctx: CanvasRenderingContext2D, text: string, opts: { barColor: string; bgColor: string; showText: boolean }) {
  let digits = text.replace(/\D/g, "");
  if (digits.length % 2 !== 0) digits += "0";
  const NW = 2, WW = 5, H = 120;
  let pattern = "0000"; // start (narrow bar, narrow space, narrow bar, narrow space)
  for (let i = 0; i < digits.length; i += 2) {
    const b = ITF[digits[i]];
    const s = ITF[digits[i + 1]];
    for (let j = 0; j < 5; j++) {
      pattern += b[j] + s[j];
    }
  }
  pattern += "100"; // stop: wide bar, narrow space, wide bar -> actually W N W
  let width = 0;
  pattern.split("").forEach((p) => { width += p === "1" ? WW : NW; });
  const padding = 20;
  const canvas = ctx.canvas;
  canvas.width = width + padding * 2;
  canvas.height = opts.showText ? H + 24 : H;
  ctx.fillStyle = opts.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = opts.barColor;
  let x = padding;
  pattern.split("").forEach((p, i) => {
    const w = p === "1" ? WW : NW;
    if (i % 2 === 0) ctx.fillRect(x, 0, w, H);
    x += w;
  });
  if (opts.showText) {
    ctx.fillStyle = opts.barColor;
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(digits, canvas.width / 2, H + 18);
  }
}

export default function BarcodeGeneratorProPage() {
  const [text, setText] = useState("HELLO-123");
  const [format, setFormat] = useState<"code39" | "itf">("code39");
  const [barColor, setBarColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [showText, setShowText] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (format === "code39") drawCode39(ctx, text || "HELLO", { barColor, bgColor, showText });
    else drawITF(ctx, text || "123456", { barColor, bgColor, showText });
  }, [text, format, barColor, bgColor, showText]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `barcode-${text || "code"}.png`;
    a.click();
  };

  const valid = format === "code39" ? text.toUpperCase().split("").every((c) => CODE39[c]) : /^\d+$/.test(text);

  return (
    <ToolLayout
      title="条形码生成器"
      description="生成多种格式条形码"
      icon={Barcode}
      category="生成工具"
      slug="barcode-generator-pro"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">条码内容</label>
            <input value={text} onChange={(e) => setText(e.target.value)} className={inputClass + " font-mono"} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">条码格式</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className={inputClass}>
              <option value="code39">Code 39（字母数字）</option>
              <option value="itf">ITF（纯数字）</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">条色</label>
            <input type="color" value={barColor} onChange={(e) => setBarColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">底色</label>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">显示文字</label>
            <button onClick={() => setShowText(!showText)} className={`w-full h-10 rounded-lg border text-sm ${showText ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
              {showText ? "已显示" : "已隐藏"}
            </button>
          </div>
        </div>

        {valid ? (
          <div className="rounded-lg bg-white border border-[#27272a] p-4 flex items-center justify-center overflow-auto">
            <canvas ref={canvasRef} />
          </div>
        ) : (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 text-center">
            {format === "code39" ? "Code 39 仅支持字母 A-Z、数字 0-9 及 - . $ / + % 空格" : "ITF 格式仅支持纯数字"}
          </div>
        )}

        <button onClick={download} disabled={!valid} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
          <Download className="w-4 h-4" /> 下载 PNG
        </button>
      </div>
    </ToolLayout>
  );
}
