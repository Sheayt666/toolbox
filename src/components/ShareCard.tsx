"use client";

/**
 * ShareCard
 *
 * A reusable "generate share card" button. On click it draws a 1080x1080
 * image with the Canvas API (suitable for Xiaohongshu / Instagram) showing the
 * tool name, a Before/After comparison and the 99gongju.online brand, plus a
 * faux QR code in the bottom corner. The generated image can be downloaded.
 */

import { useState } from "react";
import { ImageDown, Download, Loader2 } from "lucide-react";

export interface ShareCardProps {
  /** Card headline, e.g. "压缩结果分享" */
  title: string;
  /** Value before processing, e.g. "2.4 MB" or "1920x1080" */
  beforeValue: string;
  /** Value after processing, e.g. "640 KB" or "800x600" */
  afterValue: string;
  /** Display name of the tool, e.g. "图片压缩" */
  toolName: string;
  /** Tool id, used to build the link/QR target */
  toolId: string;
  /** Optional label for the delta, defaults to "压缩了" when before > after */
  deltaLabel?: string;
}

const SITE_URL = "https://99gongju.online";

/** Extract the leading number (and trailing unit) from a value string. */
function parseNumber(value: string): { num: number; unit: string } | null {
  const match = value.trim().match(/^([\d.]+)\s*(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (Number.isNaN(num)) return null;
  return { num, unit: match[2] || "" };
}

/** Deterministic pseudo-random generator from a string seed (for the faux QR). */
function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** Draw the faux QR code (a square pattern, not a real QR). */
function drawFauxQR(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  seed: string
) {
  const modules = 25;
  const cell = size / modules;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, size, size);

  // Random modules
  const rand = seededRandom(seed);
  ctx.fillStyle = "#09090b";
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (rand() > 0.55) {
        ctx.fillRect(x + c * cell, y + r * cell, cell, cell);
      }
    }
  }

  // Three position-detection patterns (corners) for realism
  const drawFinder = (fx: number, fy: number) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(fx, fy, cell * 7, cell * 7);
    ctx.fillStyle = "#09090b";
    ctx.fillRect(fx, fy, cell * 7, cell * 7);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(fx + cell, fy + cell, cell * 5, cell * 5);
    ctx.fillStyle = "#09090b";
    ctx.fillRect(fx + cell * 2, fy + cell * 2, cell * 3, cell * 3);
  };
  drawFinder(x, y);
  drawFinder(x + size - cell * 7, y);
  drawFinder(x, y + size - cell * 7);
}

/** Render the full share card onto a canvas and return its data URL. */
function renderShareCard(canvas: HTMLCanvasElement, props: ShareCardProps): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;

  // Background
  ctx.fillStyle = "#09090b";
  ctx.fillRect(0, 0, W, H);

  // Subtle accent border
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);

  // Brand (top)
  ctx.fillStyle = "#a855f7";
  ctx.font = "bold 30px sans-serif";
  ctx.fillText("99gongju.online", 80, 110);
  ctx.fillStyle = "#71717a";
  ctx.font = "24px sans-serif";
  ctx.fillText("99工具箱 · 在线免费工具", 80, 150);

  // Tool name (center-top)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px sans-serif";
  ctx.fillText(props.toolName, 80, 280);

  // Card title
  ctx.fillStyle = "#a1a1aa";
  ctx.font = "32px sans-serif";
  ctx.fillText(props.title, 80, 330);

  // Before / After comparison boxes
  const boxY = 400;
  const boxH = 200;
  const gap = 40;
  const boxW = (W - 160 - gap) / 2;

  // Before box
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.roundRect(80, boxY, boxW, boxH, 24);
  ctx.fill();
  ctx.fillStyle = "#71717a";
  ctx.font = "28px sans-serif";
  ctx.fillText("Before", 110, boxY + 50);
  ctx.fillStyle = "#e4e4e7";
  ctx.font = "bold 52px sans-serif";
  ctx.fillText(props.beforeValue, 110, boxY + 130);

  // After box
  ctx.fillStyle = "#1c1a2e";
  ctx.beginPath();
  ctx.roundRect(80 + boxW + gap, boxY, boxW, boxH, 24);
  ctx.fill();
  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(80 + boxW + gap, boxY, boxW, boxH, 24);
  ctx.stroke();
  ctx.fillStyle = "#a855f7";
  ctx.font = "28px sans-serif";
  ctx.fillText("After", 110 + boxW + gap, boxY + 50);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 52px sans-serif";
  ctx.fillText(props.afterValue, 110 + boxW + gap, boxY + 130);

  // Delta line
  const before = parseNumber(props.beforeValue);
  const after = parseNumber(props.afterValue);
  let deltaText = "";
  if (before && after && before.num > 0) {
    const diff = ((before.num - after.num) / before.num) * 100;
    const label = props.deltaLabel ?? (diff >= 0 ? "压缩了" : "提升了");
    deltaText = `${label} ${Math.abs(diff).toFixed(1)}%`;
  }
  if (deltaText) {
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(deltaText, 80, 720);
  }

  // Divider
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 800);
  ctx.lineTo(W - 80, 800);
  ctx.stroke();

  // QR code + call to action (bottom)
  const qrSize = 160;
  drawFauxQR(ctx, 80, 860, qrSize, `${SITE_URL}/tools/${props.toolId}`);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px sans-serif";
  ctx.fillText("扫码立即使用", 280, 920);
  ctx.fillStyle = "#71717a";
  ctx.font = "26px sans-serif";
  ctx.fillText(props.toolName, 280, 960);
  ctx.fillStyle = "#a855f7";
  ctx.font = "26px sans-serif";
  ctx.fillText(`${SITE_URL}/tools/${props.toolId}`, 280, 1000);

  return canvas.toDataURL("image/png");
}

export default function ShareCard(props: ShareCardProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    // Defer to next frame so the spinner can paint on slow devices.
    requestAnimationFrame(() => {
      try {
        const canvas = document.createElement("canvas");
        const url = renderShareCard(canvas, props);
        setDataUrl(url);
      } catch {
        // ignore rendering errors
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${props.toolId}-share.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/15 border border-primary-500/40 text-primary-300 hover:bg-primary-500/25 transition-colors disabled:opacity-60 text-sm"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageDown className="w-4 h-4" />
        )}
        {loading ? "生成中…" : "生成分享卡片"}
      </button>

      {dataUrl && (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="rounded-xl overflow-hidden border border-[#27272a] bg-[#09090b] max-w-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dataUrl}
              alt={`${props.toolName} 分享卡片`}
              className="w-full h-auto"
            />
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#09090b] hover:bg-slate-200 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            下载图片 (1080×1080)
          </button>
        </div>
      )}
    </div>
  );
}
