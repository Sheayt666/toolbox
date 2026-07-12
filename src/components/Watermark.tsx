/**
 * Watermark
 *
 * A small canvas utility used by image-related tools when exporting results.
 * Calling `addWatermark(canvas)` stamps a semi-transparent "99gongju.online"
 * text in the bottom-right corner of the given canvas, in-place.
 *
 * Spec:
 *  - text:        "99gongju.online"
 *  - font size:   3% of the canvas width (clamped to a readable minimum)
 *  - color:       white (#ffffff)
 *  - opacity:     0.3
 *  - position:    bottom-right corner with a small padding
 *
 * The function is safe to call from client components (e.g. inside a download
 * / export handler). It mutates the passed canvas directly and returns nothing.
 */

export const WATERMARK_TEXT = "99gongju.online";

export function addWatermark(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width, height } = canvas;
  if (!width || !height) return;

  // Font size is 3% of the canvas width, clamped so it stays legible.
  const fontSize = Math.max(12, Math.round(width * 0.03));
  const padding = Math.round(fontSize * 0.7);

  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${fontSize}px sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(WATERMARK_TEXT, width - padding, height - padding);
  ctx.restore();
}

export default addWatermark;
