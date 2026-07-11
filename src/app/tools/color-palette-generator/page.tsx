"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Palette,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Upload,
  Bookmark,
  History,
  Download,
  X,
  Pencil,
  ChevronDown,
  ChevronUp,
  Trash2,
  Keyboard,
  Contrast,
  Type,
  Sparkles,
} from "lucide-react";

/* ============ Types ============ */
type ColorFormat = "hex" | "rgb" | "hsl";
type HarmonyMode =
  | "analogous"
  | "complementary"
  | "triadic"
  | "tetradic"
  | "monochromatic"
  | "random";
type CBMode = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";
type ExportFormat = "css" | "json" | "tailwind" | "scss";

interface SavedPalette {
  id: string;
  colors: string[];
  name: string;
  createdAt: number;
}

/* ============ Color Utilities (pure JS, no DOM) ============ */
function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function randomHexColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0"))
      .join("")
  );
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let { r, g, b } = hexToRgb(hex);
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hn = (((h % 360) + 360) % 360) / 360;
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  let r: number, g: number, b: number;
  if (sn === 0) {
    r = g = b = ln;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    r = hue2rgb(p, q, hn + 1 / 3);
    g = hue2rgb(p, q, hn);
    b = hue2rgb(p, q, hn - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function isValidHex(hex: string): boolean {
  return /^#?[0-9a-f]{6}$/i.test(hex);
}

function normalizeHex(hex: string): string {
  return hex.startsWith("#") ? hex : "#" + hex;
}

/* ============ WCAG Contrast ============ */
function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const cs = c / 255;
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastLabel(ratio: number): { label: string; pass: "aaa" | "aa" | "fail" } {
  if (ratio >= 7) return { label: "AAA", pass: "aaa" };
  if (ratio >= 4.5) return { label: "AA", pass: "aa" };
  if (ratio >= 3) return { label: "AA Large", pass: "aa" };
  return { label: "Fail", pass: "fail" };
}

/* ============ Color Blindness Simulation ============ */
const CB_MATRICES: Record<Exclude<CBMode, "none">, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  achromatopsia: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
};

function simulateColorBlindness(hex: string, mode: CBMode): string {
  if (mode === "none") return hex;
  const { r, g, b } = hexToRgb(hex);
  const m = CB_MATRICES[mode];
  const nr = r * m[0] + g * m[1] + b * m[2];
  const ng = r * m[3] + g * m[4] + b * m[5];
  const nb = r * m[6] + g * m[7] + b * m[8];
  return rgbToHex(nr, ng, nb);
}

/* ============ Auto Text Color ============ */
function getTextColor(bgColor: string): string {
  const { r, g, b } = hexToRgb(bgColor);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0a0a0a" : "#ffffff";
}

/* ============ Harmony Generation ============ */
function generateHarmonyPalette(
  mode: HarmonyMode,
  currentColors: string[],
  locked: boolean[]
): string[] {
  let baseHue: number;
  const lockedIdx = locked.indexOf(true);
  if (lockedIdx !== -1) {
    baseHue = hexToHsl(currentColors[lockedIdx]).h;
  } else {
    baseHue = Math.floor(Math.random() * 360);
  }
  const sat = 55 + Math.floor(Math.random() * 25);

  let scheme: { h: number; s: number; l: number }[];
  switch (mode) {
    case "analogous":
      scheme = [
        { h: baseHue, s: sat, l: 50 },
        { h: (baseHue + 25) % 360, s: sat, l: 65 },
        { h: (baseHue - 25 + 360) % 360, s: sat, l: 35 },
        { h: (baseHue + 50) % 360, s: clamp(sat - 10, 10, 100), l: 78 },
        { h: (baseHue - 50 + 360) % 360, s: clamp(sat - 10, 10, 100), l: 25 },
      ];
      break;
    case "complementary":
      scheme = [
        { h: baseHue, s: sat, l: 45 },
        { h: baseHue, s: clamp(sat - 15, 10, 100), l: 70 },
        { h: (baseHue + 180) % 360, s: sat, l: 50 },
        { h: (baseHue + 180) % 360, s: clamp(sat - 15, 10, 100), l: 75 },
        { h: (baseHue + 180) % 360, s: clamp(sat + 10, 10, 100), l: 30 },
      ];
      break;
    case "triadic":
      scheme = [
        { h: baseHue, s: sat, l: 50 },
        { h: (baseHue + 120) % 360, s: sat, l: 55 },
        { h: (baseHue + 240) % 360, s: sat, l: 45 },
        { h: baseHue, s: clamp(sat - 20, 10, 100), l: 78 },
        { h: (baseHue + 120) % 360, s: clamp(sat - 20, 10, 100), l: 28 },
      ];
      break;
    case "tetradic":
      scheme = [
        { h: baseHue, s: sat, l: 50 },
        { h: (baseHue + 90) % 360, s: sat, l: 55 },
        { h: (baseHue + 180) % 360, s: sat, l: 45 },
        { h: (baseHue + 270) % 360, s: sat, l: 60 },
        { h: baseHue, s: clamp(sat - 25, 10, 100), l: 80 },
      ];
      break;
    case "monochromatic":
      scheme = [
        { h: baseHue, s: sat, l: 22 },
        { h: baseHue, s: sat, l: 38 },
        { h: baseHue, s: sat, l: 52 },
        { h: baseHue, s: sat, l: 66 },
        { h: baseHue, s: sat, l: 82 },
      ];
      break;
    case "random":
    default:
      scheme = [];
      break;
  }

  const result: string[] = [];
  for (let i = 0; i < 5; i++) {
    if (locked[i]) {
      result.push(currentColors[i]);
    } else if (mode === "random") {
      result.push(randomHexColor());
    } else {
      const { h, s, l } = scheme[i];
      result.push(hslToHex(h, s, l));
    }
  }
  return result;
}

/* ============ Image Color Extraction ============ */
function extractColorsFromImage(img: HTMLImageElement, count: number = 5): string[] {
  const canvas = document.createElement("canvas");
  const maxDim = 120;
  const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch {
    return [];
  }

  // quantize to 16 levels per channel
  const buckets = new Map<string, number>();
  const quant = 16;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 125) continue; // skip transparent
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const qr = Math.round(r / quant) * quant;
    const qg = Math.round(g / quant) * quant;
    const qb = Math.round(b / quant) * quant;
    const key = `${qr},${qg},${qb}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const sorted = Array.from(buckets.entries())
    .map(([key, count]) => {
      const [qr, qg, qb] = key.split(",").map(Number);
      return { hex: rgbToHex(qr, qg, qb), count };
    })
    .sort((a, b) => b.count - a.count);

  // greedily pick diverse colors
  const picked: string[] = [];
  const minDist = 40;
  for (const c of sorted) {
    if (picked.length >= count) break;
    const { r: cr, g: cg, b: cb } = hexToRgb(c.hex);
    let ok = true;
    for (const p of picked) {
      const { r: pr, g: pg, b: pb } = hexToRgb(p);
      const dist = Math.sqrt((cr - pr) ** 2 + (cg - pg) ** 2 + (cb - pb) ** 2);
      if (dist < minDist) {
        ok = false;
        break;
      }
    }
    if (ok) picked.push(c.hex);
  }
  for (const c of sorted) {
    if (picked.length >= count) break;
    if (!picked.includes(c.hex)) picked.push(c.hex);
  }
  while (picked.length < count) picked.push(randomHexColor());
  return picked.slice(0, count);
}

/* ============ Export Formats ============ */
function formatColorValue(hex: string, format: ColorFormat): string {
  if (format === "hex") return hex.toUpperCase();
  if (format === "rgb") {
    const { r, g, b } = hexToRgb(hex);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const { h, s, l } = hexToHsl(hex);
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function buildExport(colors: string[], format: ExportFormat): string {
  switch (format) {
    case "css":
      return `:root {\n${colors
        .map((c, i) => `  --color-${i + 1}: ${c.toUpperCase()};`)
        .join("\n")}\n}`;
    case "json":
      return JSON.stringify(
        colors.map((c) => {
          const { r, g, b } = hexToRgb(c);
          const { h, s, l } = hexToHsl(c);
          return {
            hex: c.toUpperCase(),
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: `hsl(${h}, ${s}%, ${l}%)`,
          };
        }),
        null,
        2
      );
    case "tailwind":
      return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${colors
        .map((c, i) => `          ${i + 1}: "${c.toUpperCase()}",`)
        .join("\n")}\n        }\n      }\n    }\n  }\n};`;
    case "scss":
      return colors.map((c, i) => `$color-${i + 1}: ${c.toUpperCase()};`).join("\n");
    default:
      return "";
  }
}

/* ============ Clipboard ============ */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to fallback
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

/* ============ localStorage ============ */
const SAVED_KEY = "palette-saved-v1";
const HISTORY_KEY = "palette-history-v1";

function loadSaved(): SavedPalette[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SavedPalette[]) : [];
  } catch {
    return [];
  }
}

function loadHistory(): string[][] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[][]) : [];
  } catch {
    return [];
  }
}

function persistSaved(list: SavedPalette[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

function persistHistory(list: string[][]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/* ============ Constants ============ */
const DEFAULT_PALETTE = ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];

const HARMONY_LABELS: Record<HarmonyMode, string> = {
  analogous: "类似配色",
  complementary: "互补配色",
  triadic: "三分配色",
  tetradic: "四分配色",
  monochromatic: "单色配色",
  random: "随机配色",
};

const CB_LABELS: Record<CBMode, string> = {
  none: "正常视觉",
  protanopia: "红色盲",
  deuteranopia: "红绿色盲",
  tritanopia: "蓝色盲",
  achromatopsia: "全色盲",
};

/* ============ Main Component ============ */
export default function ColorPaletteGeneratorPage() {
  const [colors, setColors] = useState<string[]>(DEFAULT_PALETTE);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [format, setFormat] = useState<ColorFormat>("hex");
  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>("analogous");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cbMode, setCbMode] = useState<CBMode>("none");
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [history, setHistory] = useState<string[][]>([]);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [exportCopied, setExportCopied] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- load from localStorage on mount ---- */
  useEffect(() => {
    setSavedPalettes(loadSaved());
    setHistory(loadHistory());
  }, []);

  /* ---- persist on change ---- */
  useEffect(() => {
    persistSaved(savedPalettes);
  }, [savedPalettes]);
  useEffect(() => {
    persistHistory(history);
  }, [history]);

  /* ---- generate ---- */
  const generate = useCallback(
    (mode?: HarmonyMode) => {
      const m = mode ?? harmonyMode;
      const newColors = generateHarmonyPalette(m, colors, locked);
      setColors(newColors);
      setEditingIndex(null);
      setHistory((prev) => {
        const next = [
          newColors,
          ...prev.filter((p) => p.join("") !== newColors.join("")),
        ].slice(0, 20);
        return next;
      });
    },
    [colors, locked, harmonyMode]
  );

  /* ---- lock ---- */
  const toggleLock = useCallback((index: number) => {
    setLocked((prev) => prev.map((l, i) => (i === index ? !l : l)));
  }, []);

  /* ---- copy ---- */
  const copyColor = useCallback(
    async (color: string, index: number) => {
      const value = formatColorValue(color, format);
      await copyToClipboard(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((c) => (c === index ? null : c)), 1500);
    },
    [format]
  );

  const copyAll = useCallback(async () => {
    const text = colors.map((c) => formatColorValue(c, format)).join("\n");
    await copyToClipboard(text);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex((c) => (c === -1 ? null : c)), 1500);
  }, [colors, format]);

  /* ---- keyboard shortcuts ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping =
        tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if (isTyping) return;
      if (e.code === "Space") {
        e.preventDefault();
        generate();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        if (hoveredIndex !== null) toggleLock(hoveredIndex);
      } else if (e.key === "Escape") {
        setEditingIndex(null);
        setExportOpen(false);
        setShowShortcuts(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generate, hoveredIndex, toggleLock]);

  /* ---- edit ---- */
  const openEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(colors[index]);
  };
  const closeEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };
  const onEditChange = (index: number, value: string) => {
    setEditValue(value);
    const v = normalizeHex(value);
    if (isValidHex(v)) {
      setColors((prev) => prev.map((c, i) => (i === index ? v.toLowerCase() : c)));
    }
  };

  /* ---- display colors (with CB simulation) ---- */
  const displayColors = colors.map((c) => simulateColorBlindness(c, cbMode));

  /* ---- image upload ---- */
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);
    if (!file.type.startsWith("image/")) {
      setImageError("请上传图片文件");
      return;
    }
    setExtracting(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const extracted = extractColorsFromImage(img, 5);
        if (extracted.length) {
          setColors(extracted);
          setLocked([false, false, false, false, false]);
          setEditingIndex(null);
          setHistory((prev) => {
            const next = [
              extracted,
              ...prev.filter((p) => p.join("") !== extracted.join("")),
            ].slice(0, 20);
            return next;
          });
        } else {
          setImageError("无法提取颜色，请尝试其他图片");
        }
        setExtracting(false);
      };
      img.onerror = () => {
        setImageError("图片加载失败");
        setExtracting(false);
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setImageError("文件读取失败");
      setExtracting(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ---- saved palettes ---- */
  const saveCurrent = () => {
    const entry: SavedPalette = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      colors: [...colors],
      name: `配色 ${savedPalettes.length + 1}`,
      createdAt: Date.now(),
    };
    setSavedPalettes((prev) => [entry, ...prev]);
    setShowSaved(true);
  };
  const loadSavedPalette = (p: SavedPalette) => {
    setColors([...p.colors]);
    setLocked([false, false, false, false, false]);
    setEditingIndex(null);
  };
  const deleteSaved = (id: string) => {
    setSavedPalettes((prev) => prev.filter((p) => p.id !== id));
  };
  const loadFromHistory = (p: string[]) => {
    setColors([...p]);
    setLocked([false, false, false, false, false]);
    setEditingIndex(null);
  };
  const clearHistory = () => {
    setHistory([]);
  };

  /* ---- export ---- */
  const exportText = buildExport(colors, exportFormat);
  const copyExport = async () => {
    await copyToClipboard(exportText);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 1500);
  };

  const textColor = (hex: string) => getTextColor(hex);

  return (
    <ToolLayout
      title="调色板生成器 Pro"
      description="超越 Coolors 的专业配色工具：空格生成、锁定颜色、和谐配色、图片取色、色盲模拟、WCAG 对比度检查、多格式导出"
      icon={Palette}
      category="生成工具"
      slug="color-palette-generator"
      toolId="color-palette-generator"
    >
      {/* ===== Toolbar ===== */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-1">
            <Palette className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white hidden sm:inline">
              调色板 Pro
            </span>
          </div>

          {/* Harmony mode select */}
          <div className="relative">
            <select
              value={harmonyMode}
              onChange={(e) => {
                const m = e.target.value as HarmonyMode;
                setHarmonyMode(m);
                generate(m);
              }}
              className="appearance-none bg-[#09090b] border border-[#27272a] text-slate-200 text-xs font-medium rounded-lg pl-3 pr-8 py-2 hover:border-[#3f3f46] focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {(Object.keys(HARMONY_LABELS) as HarmonyMode[]).map((m) => (
                <option key={m} value={m}>
                  {HARMONY_LABELS[m]}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Color blind select */}
          <div className="relative">
            <select
              value={cbMode}
              onChange={(e) => setCbMode(e.target.value as CBMode)}
              className="appearance-none bg-[#09090b] border border-[#27272a] text-slate-200 text-xs font-medium rounded-lg pl-3 pr-8 py-2 hover:border-[#3f3f46] focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              {(Object.keys(CB_LABELS) as CBMode[]).map((m) => (
                <option key={m} value={m}>
                  {CB_LABELS[m]}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Format toggle */}
          <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
            {(["hex", "rgb", "hsl"] as ColorFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-all uppercase ${
                  format === f
                    ? "bg-[#27272a] text-violet-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-all disabled:opacity-50"
            title="从图片提取配色"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {extracting ? "提取中..." : "图片取色"}
            </span>
          </button>

          {/* Save */}
          <button
            onClick={saveCurrent}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-all"
            title="收藏当前配色"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">收藏</span>
          </button>

          {/* Export */}
          <button
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-all"
            title="导出配色"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">导出</span>
          </button>

          {/* Generate */}
          <button
            onClick={() => generate()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-violet-500/25"
            title="生成新配色 (空格键)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            生成
            <kbd className="hidden md:inline-block ml-1 px-1.5 py-0.5 bg-black/20 rounded text-[9px] font-mono">
              Space
            </kbd>
          </button>
        </div>

        {imageError && <div className="mt-2 text-xs text-red-400">{imageError}</div>}
      </div>

      {/* ===== Palette Display ===== */}
      <div
        className="flex flex-col md:flex-row md:h-[68vh] min-h-[420px]"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {displayColors.map((dColor, index) => {
          const realColor = colors[index];
          const isLocked = locked[index];
          const isEditing = editingIndex === index;
          const fg = textColor(dColor);
          return (
            <div
              key={index}
              className="relative flex-1 flex flex-col group transition-all duration-300 min-h-[90px] md:min-h-0"
              style={{ backgroundColor: dColor, color: fg }}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              {/* Top bar: lock + edit */}
              <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(index);
                  }}
                  className={`p-2 rounded-lg bg-black/15 hover:bg-black/30 transition-colors backdrop-blur-sm ${
                    isLocked ? "opacity-100" : "opacity-70"
                  }`}
                  style={{ color: fg }}
                  title={`锁定/解锁 (L) — 当前${isLocked ? "已锁定" : "未锁定"}`}
                  aria-label={isLocked ? "解锁颜色" : "锁定颜色"}
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isEditing ? closeEdit() : openEdit(index);
                  }}
                  className="p-2 rounded-lg bg-black/15 hover:bg-black/30 transition-colors backdrop-blur-sm"
                  style={{ color: fg }}
                  title="精确调整颜色"
                  aria-label="编辑颜色"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
              </div>

              {/* Always show lock indicator when locked */}
              {isLocked && (
                <div className="absolute top-3 left-3 z-10 group-hover:opacity-0 transition-opacity">
                  <div
                    className="p-2 rounded-lg bg-black/15 backdrop-blur-sm"
                    style={{ color: fg }}
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              )}

              {/* Center content */}
              <div className="flex-1 flex flex-col items-center justify-center p-4">
                {isEditing ? (
                  <div
                    className="w-full max-w-[180px] flex flex-col items-center gap-2"
                    style={{ color: fg }}
                  >
                    <label className="text-[10px] uppercase tracking-wider opacity-70">
                      HEX
                    </label>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => onEditChange(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") closeEdit();
                        if (e.key === "Escape") closeEdit();
                      }}
                      onBlur={closeEdit}
                      autoFocus
                      maxLength={7}
                      className="w-full text-center bg-black/20 border border-white/30 rounded-lg px-2 py-1.5 font-mono text-sm font-bold outline-none focus:bg-black/30"
                      style={{ color: fg }}
                      placeholder="#000000"
                    />
                    <div className="text-[10px] opacity-70 font-mono">
                      {formatColorValue(realColor, "rgb")}
                    </div>
                    <div className="text-[10px] opacity-70 font-mono">
                      {(() => {
                        const { h, s, l } = hexToHsl(realColor);
                        return `hsl(${h}, ${s}%, ${l}%)`;
                      })()}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyColor(realColor, index);
                    }}
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    style={{ color: fg }}
                  >
                    <span className="font-mono text-base sm:text-lg font-bold tracking-wide drop-shadow-sm">
                      {formatColorValue(realColor, format)}
                    </span>
                    <span className="text-[10px] opacity-70 flex items-center gap-1">
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3" /> 已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> 点击复制
                        </>
                      )}
                    </span>
                  </button>
                )}
              </div>

              {/* Bottom: index + text simulation */}
              <div className="p-3 flex flex-col gap-1.5">
                <div className="text-[10px] uppercase tracking-wider opacity-50 text-center">
                  {index + 1} / 5
                </div>
                <div className="flex items-center justify-center gap-2 text-[11px] font-semibold">
                  <span
                    className="px-1.5 py-0.5 rounded bg-black/20"
                    style={{ color: "#000000" }}
                  >
                    Aa
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded bg-black/20"
                    style={{ color: "#ffffff" }}
                  >
                    Aa
                  </span>
                </div>
              </div>

              {/* divider line between columns (desktop) */}
              {index < 4 && (
                <div className="hidden md:block absolute top-1/4 bottom-1/4 right-0 w-px bg-black/10 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* ===== Accessibility / Contrast ===== */}
      <div className="p-4 sm:p-5 border-t border-[#27272a] bg-[#0f0f12]">
        <div className="flex items-center gap-2 mb-3">
          <Contrast className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">无障碍 &amp; 对比度检查</h3>
          <span className="text-[11px] text-slate-500">(WCAG 2.1)</span>
        </div>

        {/* Text contrast per color */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          {colors.map((c, i) => {
            const cWhite = getContrastRatio(c, "#ffffff");
            const cBlack = getContrastRatio(c, "#000000");
            const best = cWhite >= cBlack ? "white" : "black";
            const bestRatio = Math.max(cWhite, cBlack);
            const { label, pass } = contrastLabel(bestRatio);
            const badgeColor =
              pass === "aaa"
                ? "bg-emerald-500/20 text-emerald-400"
                : pass === "aa"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-red-500/20 text-red-400";
            return (
              <div key={i} className="rounded-lg overflow-hidden border border-[#27272a]">
                <div
                  className="p-2.5 flex items-center justify-center"
                  style={{ backgroundColor: c }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{ color: best === "white" ? "#fff" : "#000" }}
                  >
                    Aa 文字
                  </span>
                </div>
                <div className="p-2 bg-[#18181b] text-center">
                  <div className="text-[11px] text-slate-400">
                    对比度 {bestRatio.toFixed(2)}:1
                  </div>
                  <span
                    className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${badgeColor}`}
                  >
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Adjacent contrast */}
        <div className="text-[11px] text-slate-500 mb-2 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5" />
          相邻颜色对比度（可区分性）
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => {
            const ratio = getContrastRatio(colors[i], colors[i + 1]);
            const { label, pass } = contrastLabel(ratio);
            const badgeColor =
              pass === "aaa"
                ? "bg-emerald-500/20 text-emerald-400"
                : pass === "aa"
                ? "bg-amber-500/20 text-amber-400"
                : "bg-red-500/20 text-red-400";
            return (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-[#18181b] border border-[#27272a] rounded-lg"
              >
                <div className="flex -space-x-1">
                  <div
                    className="w-5 h-5 rounded-l border border-[#27272a]"
                    style={{ backgroundColor: colors[i] }}
                  />
                  <div
                    className="w-5 h-5 rounded-r border border-[#27272a]"
                    style={{ backgroundColor: colors[i + 1] }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-400">{ratio.toFixed(2)}:1</div>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${badgeColor}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Library: Saved + History ===== */}
      <div className="p-4 sm:p-5 border-t border-[#27272a] space-y-4">
        {/* Saved */}
        <div className="bg-[#0f0f12] border border-[#27272a] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowSaved((s) => !s)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#18181b] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">收藏配色</span>
              <span className="text-[11px] text-slate-500">
                ({savedPalettes.length})
              </span>
            </div>
            {showSaved ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          {showSaved && (
            <div className="p-3 pt-0">
              {savedPalettes.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  暂无收藏，点击工具栏「收藏」保存当前配色
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedPalettes.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 p-2 bg-[#18181b] border border-[#27272a] rounded-lg group"
                    >
                      <button
                        onClick={() => loadSavedPalette(p)}
                        className="flex items-stretch h-8 rounded overflow-hidden border border-[#27272a] hover:border-violet-500 transition-colors"
                        title="加载此配色"
                      >
                        {p.colors.map((c, i) => (
                          <div key={i} className="w-5" style={{ backgroundColor: c }} />
                        ))}
                      </button>
                      <span className="text-[11px] text-slate-400 flex-1 truncate">
                        {p.name}
                      </span>
                      <button
                        onClick={() => deleteSaved(p.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        <div className="bg-[#0f0f12] border border-[#27272a] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="w-full flex items-center justify-between p-3 hover:bg-[#18181b] transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">配色历史</span>
              <span className="text-[11px] text-slate-500">
                ({history.length}/20)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    clearHistory();
                  }}
                  className="text-[11px] text-slate-500 hover:text-red-400 transition-colors"
                >
                  清空
                </span>
              )}
              {showHistory ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </button>
          {showHistory && (
            <div className="p-3 pt-0">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  暂无历史，按空格键或点击「生成」开始
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {history.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadFromHistory(p)}
                      className="flex items-center gap-2 p-2 bg-[#18181b] border border-[#27272a] rounded-lg hover:border-violet-500 transition-colors"
                    >
                      <div className="flex items-stretch h-8 rounded overflow-hidden border border-[#27272a]">
                        {p.map((c, i) => (
                          <div key={i} className="w-5" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">#{idx + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== Copy all + shortcuts ===== */}
      <div className="p-4 sm:p-5 border-t border-[#27272a] flex flex-wrap items-center gap-3">
        <button
          onClick={copyAll}
          className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors"
        >
          {copiedIndex === -1 ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              已复制全部
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              复制全部颜色 ({format.toUpperCase()})
            </>
          )}
        </button>
        <button
          onClick={() => setShowShortcuts((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors"
        >
          <Keyboard className="w-4 h-4" />
          快捷键
        </button>
      </div>

      {/* ===== Tips / Shortcuts panel ===== */}
      <div className="px-4 sm:px-5 pb-5">
        {showShortcuts ? (
          <div className="bg-[#0f0f12] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">键盘快捷键</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(
                [
                  ["Space", "生成新配色"],
                  ["L", "锁定/解锁当前悬停颜色"],
                  ["Esc", "关闭编辑框/弹窗"],
                  ["点击颜色值", "复制颜色 (HEX/RGB/HSL)"],
                  ["点击铅笔", "打开 HEX 输入框精确调整"],
                  ["点击锁图标", "锁定颜色 (生成时保持不变)"],
                ] as [string, string][]
              ).map(([k, d]) => (
                <div
                  key={k}
                  className="flex items-center gap-2 p-2 bg-[#18181b] rounded-lg"
                >
                  <kbd className="px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded text-[10px] font-mono text-violet-400 min-w-[60px] text-center">
                    {k}
                  </kbd>
                  <span className="text-slate-400">{d}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#0f0f12] border border-[#27272a] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              使用提示
            </h3>
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li>
                • 按{" "}
                <kbd className="px-1.5 py-0.5 bg-[#27272a] rounded text-[10px] font-mono text-violet-400">
                  空格键
                </kbd>{" "}
                快速生成新配色（Coolors 标志性交互）
              </li>
              <li>
                • 锁定满意的颜色后再生，锁定色保持不变；支持类似/互补/三分/四分/单色 5
                种和谐模式
              </li>
              <li>• 上传图片可自动提取主色调；支持色盲模拟与 WCAG 对比度检查</li>
              <li>
                • 一键导出 CSS 变量 / JSON / Tailwind / SCSS，所有处理在浏览器本地完成
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* ===== Export Modal ===== */}
      {exportOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setExportOpen(false)}
        >
          <div
            className="relative bg-[#18181b] rounded-2xl border border-[#27272a] w-full max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">导出配色方案</h3>
              </div>
              <button
                onClick={() => setExportOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#27272a] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              {/* Format tabs */}
              <div className="flex flex-wrap gap-1 mb-3 bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
                {(["css", "json", "tailwind", "scss"] as ExportFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setExportFormat(f)}
                    className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase ${
                      exportFormat === f
                        ? "bg-[#27272a] text-violet-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Preview swatches */}
              <div className="flex items-stretch h-10 rounded-lg overflow-hidden border border-[#27272a] mb-3">
                {colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1 flex items-center justify-center text-[10px] font-mono font-bold"
                    style={{ backgroundColor: c, color: textColor(c) }}
                  >
                    {c.toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Code */}
              <pre className="bg-[#09090b] border border-[#27272a] rounded-lg p-3 text-xs font-mono text-slate-300 overflow-auto max-h-64">
                <code>{exportText}</code>
              </pre>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={copyExport}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  {exportCopied ? (
                    <>
                      <Check className="w-4 h-4" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> 复制代码
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([exportText], {
                      type: "text/plain;charset=utf-8",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    const ext =
                      exportFormat === "tailwind"
                        ? "js"
                        : exportFormat === "json"
                        ? "json"
                        : exportFormat;
                    a.download = `palette-${exportFormat}.${ext}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> 下载文件
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}