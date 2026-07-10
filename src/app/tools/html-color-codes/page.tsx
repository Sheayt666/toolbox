"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Palette, Copy, Check } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{6}|[a-f\d]{3})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export default function HtmlColorCodesPage() {
  const [hex, setHex] = useState("#6366f1");
  const [copied, setCopied] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb[0], rgb[1], rgb[2]) : null), [rgb]);

  const updateRgb = (r: number, g: number, b: number) => setHex(rgbToHex(r, g, b));
  const updateHsl = (h: number, s: number, l: number) => {
    const [r, g, b] = hslToRgb(h, s, l);
    setHex(rgbToHex(r, g, b));
  };

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const formats = rgb && hsl ? [
    { k: "hex", l: "HEX", v: hex.toUpperCase() },
    { k: "rgb", l: "RGB", v: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` },
    { k: "rgba", l: "RGBA", v: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)` },
    { k: "hsl", l: "HSL", v: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
    { k: "hsla", l: "HSLA", v: `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, 1)` },
  ] : [];

  const shades = useMemo(() => {
    if (!hsl) return [];
    return [90, 75, 60, 45, 30, 15].map((l) => {
      const [r, g, b] = hslToRgb(hsl[0], hsl[1], l);
      return { hex: rgbToHex(r, g, b), l };
    });
  }, [hsl]);

  return (
    <ToolLayout
      title="颜色代码转换"
      description="HEX/RGB/HSL颜色代码互相转换"
      icon={Palette}
      category="开发工具"
      slug="html-color-codes"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0">
            <label className="text-sm font-medium text-slate-300 mb-2 block">颜色选择</label>
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-24 h-24 rounded-lg border border-[#27272a] bg-transparent cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-300 mb-2 block">HEX</label>
            <input value={hex} onChange={(e) => setHex(e.target.value)} className={inputClass + " font-mono text-lg"} />
            <div className="mt-3 rounded-lg" style={{ backgroundColor: hex, height: "48px" }} />
          </div>
        </div>

        {rgb && hsl && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 block">RGB</label>
              {(["R", "G", "B"] as const).map((label, i) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4">{label}</span>
                  <input
                    type="range" min={0} max={255} value={rgb[i]}
                    onChange={(e) => { const n = [...rgb] as number[]; n[i] = Number(e.target.value); updateRgb(n[0], n[1], n[2]); }}
                    className="flex-1 accent-primary-500"
                  />
                  <input
                    type="number" min={0} max={255} value={rgb[i]}
                    onChange={(e) => { const n = [...rgb] as number[]; n[i] = Math.max(0, Math.min(255, Number(e.target.value))); updateRgb(n[0], n[1], n[2]); }}
                    className="w-16 bg-[#0a0a0b] border border-[#27272a] rounded px-2 py-1 text-sm text-white text-center"
                  />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300 block">HSL</label>
              {(["H", "S", "L"] as const).map((label, i) => {
                const max = i === 0 ? 360 : 100;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-4">{label}</span>
                    <input
                      type="range" min={0} max={max} value={hsl[i]}
                      onChange={(e) => { const n = [...hsl] as number[]; n[i] = Number(e.target.value); updateHsl(n[0], n[1], n[2]); }}
                      className="flex-1 accent-primary-500"
                    />
                    <input
                      type="number" min={0} max={max} value={hsl[i]}
                      onChange={(e) => { const n = [...hsl] as number[]; n[i] = Math.max(0, Math.min(max, Number(e.target.value))); updateHsl(n[0], n[1], n[2]); }}
                      className="w-16 bg-[#0a0a0b] border border-[#27272a] rounded px-2 py-1 text-sm text-white text-center"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {formats.map((f) => (
            <button key={f.k} onClick={() => copy(f.k, f.v)} className="flex items-center justify-between rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 hover:border-[#3f3f46] text-left">
              <div>
                <p className="text-xs text-slate-500">{f.l}</p>
                <p className="text-sm text-white font-mono">{f.v}</p>
              </div>
              {copied === f.k ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">明度渐变</label>
          <div className="flex gap-1 rounded-lg overflow-hidden h-12">
            {shades.map((s) => (
              <button key={s.l} onClick={() => setHex(s.hex)} className="flex-1 transition-transform hover:scale-y-110" style={{ backgroundColor: s.hex }} title={s.hex} />
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
