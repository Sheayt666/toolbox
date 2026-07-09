"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Tag, Copy, Check, Shuffle } from "lucide-react";

// 颜色命名数据
const colorNames: { hex: string; name: string }[] = [
  { hex: "#FF0000", name: "红色" },
  { hex: "#DC143C", name: "猩红" },
  { hex: "#FF6347", name: "番茄红" },
  { hex: "#FF7F50", name: "珊瑚色" },
  { hex: "#FFA07A", name: "浅鲑鱼色" },
  { hex: "#FA8072", name: "三文鱼色" },
  { hex: "#E9967A", name: "暗鲑鱼色" },
  { hex: "#F08080", name: "浅珊瑚色" },
  { hex: "#CD5C5C", name: "印度红" },
  { hex: "#B22222", name: "火砖色" },
  { hex: "#8B0000", name: "暗红色" },
  { hex: "#FF8C00", name: "暗橙色" },
  { hex: "#FFA500", name: "橙色" },
  { hex: "#FFD700", name: "金色" },
  { hex: "#FFFF00", name: "黄色" },
  { hex: "#FFFFE0", name: "浅黄色" },
  { hex: "#FFFACD", name: "柠檬绸色" },
  { hex: "#FAFAD2", name: "浅金黄色" },
  { hex: "#FFEFD5", name: "番木瓜色" },
  { hex: "#FFE4B5", name: "蜜桃色" },
  { hex: "#FFDAB9", name: "桃色" },
  { hex: "#EEE8AA", name: "苍金麒麟色" },
  { hex: "#F0E68C", name: "卡其色" },
  { hex: "#BDB76B", name: "暗卡其色" },
  { hex: "#9ACD32", name: "黄绿色" },
  { hex: "#808000", name: "橄榄色" },
  { hex: "#556B2F", name: "暗橄榄绿" },
  { hex: "#6B8E23", name: "橄榄褐色" },
  { hex: "#7CFC00", name: "草绿色" },
  { hex: "#7FFF00", name: "绿黄色" },
  { hex: "#ADFF2F", name: "绿黄色" },
  { hex: "#32CD32", name: "酸橙绿" },
  { hex: "#00FF00", name: "绿色" },
  { hex: "#228B22", name: "森林绿" },
  { hex: "#006400", name: "深绿色" },
  { hex: "#008000", name: "绿色" },
  { hex: "#90EE90", name: "浅绿色" },
  { hex: "#98FB98", name: "苍绿色" },
  { hex: "#00FA9A", name: "中春绿色" },
  { hex: "#00FF7F", name: "春绿色" },
  { hex: "#7FFFD4", name: "碧绿色" },
  { hex: "#40E0D0", name: "青绿色" },
  { hex: "#48D1CC", name: "中绿松石色" },
  { hex: "#20B2AA", name: "浅海绿色" },
  { hex: "#008B8B", name: "暗青色" },
  { hex: "#008080", name: "水鸭色" },
  { hex: "#5F9EA0", name: "军校蓝色" },
  { hex: "#4682B4", name: "钢蓝色" },
  { hex: "#87CEEB", name: "天蓝色" },
  { hex: "#87CEFA", name: "亮天蓝色" },
  { hex: "#00BFFF", name: "深天蓝色" },
  { hex: "#1E90FF", name: "道奇蓝" },
  { hex: "#6495ED", name: "矢车菊蓝" },
  { hex: "#7B68EE", name: "中暗蓝色" },
  { hex: "#4169E1", name: "皇家蓝" },
  { hex: "#0000FF", name: "蓝色" },
  { hex: "#0000CD", name: "中蓝色" },
  { hex: "#00008B", name: "暗蓝色" },
  { hex: "#000080", name: "海军蓝" },
  { hex: "#191970", name: "午夜蓝" },
  { hex: "#6A5ACD", name: "岩蓝" },
  { hex: "#483D8B", name: "暗岩蓝" },
  { hex: "#9370DB", name: "中紫色" },
  { hex: "#8A2BE2", name: "蓝色紫罗兰" },
  { hex: "#9400D3", name: "暗紫色" },
  { hex: "#9932CC", name: "暗兰花紫" },
  { hex: "#BA55D3", name: "中兰花紫" },
  { hex: "#DA70D6", name: "兰花紫" },
  { hex: "#EE82EE", name: "紫罗兰色" },
  { hex: "#FF00FF", name: "品红色" },
  { hex: "#FF00FF", name: "洋红色" },
  { hex: "#DD00DD", name: "深洋红色" },
  { hex: "#C71585", name: "中紫红色" },
  { hex: "#DB7093", name: "苍紫罗兰红" },
  { hex: "#FF69B4", name: "热粉色" },
  { hex: "#FF1493", name: "深粉色" },
  { hex: "#FFB6C1", name: "浅粉色" },
  { hex: "#FFC0CB", name: "粉红色" },
  { hex: "#FFE4E1", name: "薄雾玫瑰" },
  { hex: "#FFF0F5", name: "淡紫红" },
  { hex: "#FAEBD7", name: "古董白" },
  { hex: "#FFE4C4", name: "桔黄色" },
  { hex: "#FFDEAD", name: "纳瓦白" },
  { hex: "#F5DEB3", name: "小麦色" },
  { hex: "#DEB887", name: "棕褐色" },
  { hex: "#D2B48C", name: "晒黑色" },
  { hex: "#BC8F8F", name: "玫瑰棕色" },
  { hex: "#F4A460", name: "沙褐色" },
  { hex: "#DAA520", name: "金麒麟色" },
  { hex: "#B8860B", name: "暗金麒麟色" },
  { hex: "#CD853F", name: "秘鲁色" },
  { hex: "#D2691E", name: "巧克力色" },
  { hex: "#8B4513", name: "马鞍棕色" },
  { hex: "#A0522D", name: "赭色" },
  { hex: "#A52A2A", name: "棕色" },
  { hex: "#800000", name: "栗色" },
  { hex: "#696969", name: "暗灰色" },
  { hex: "#808080", name: "灰色" },
  { hex: "#A9A9A9", name: "暗灰色" },
  { hex: "#C0C0C0", name: "银色" },
  { hex: "#D3D3D3", name: "浅灰色" },
  { hex: "#E0E0E0", name: "亮灰色" },
  { hex: "#F5F5F5", name: "白烟色" },
  { hex: "#FFFFFF", name: "白色" },
  { hex: "#000000", name: "黑色" },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function colorDistance(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }): number {
  const rDiff = c1.r - c2.r;
  const gDiff = c1.g - c2.g;
  const bDiff = c1.b - c2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function findClosestColor(hex: string): { name: string; hex: string; distance: number } {
  const targetRgb = hexToRgb(hex);
  if (!targetRgb) return { name: "未知", hex: hex, distance: 0 };

  let closest = colorNames[0];
  let minDist = Infinity;

  for (const color of colorNames) {
    const colorRgb = hexToRgb(color.hex);
    if (!colorRgb) continue;
    const dist = colorDistance(targetRgb, colorRgb);
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }

  return { name: closest.name, hex: closest.hex, distance: minDist };
}

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

export default function ColorNamerPage() {
  const [color, setColor] = useState("#6366f1");
  const [copied, setCopied] = useState(false);

  const closest = findClosestColor(color);

  const randomColor = () => {
    const randomHex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setColor(randomHex);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 相似度百分比
  const similarity = Math.max(0, Math.round((1 - closest.distance / 442) * 100));

  return (
    <ToolLayout
      title="颜色命名工具"
      description="输入颜色代码获取颜色名称，帮助设计师快速识别和命名颜色"
      icon={Tag}
      category="设计工具"
      slug="color-namer"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 颜色选择 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-5 h-5" />
            <h2 className="text-base font-semibold">颜色命名工具</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-14 h-14 rounded-xl cursor-pointer border-4 border-white/30 shadow-lg bg-transparent p-0"
              />
              <div>
                <div className="text-xs text-white/70 mb-1">输入颜色</div>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) setColor(val);
                  }}
                  className="w-28 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            <button
              onClick={randomColor}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 text-sm ml-auto"
            >
              <Shuffle className="w-4 h-4" />
              随机
            </button>
          </div>
        </div>

        {/* 颜色展示和名称 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="grid grid-cols-2">
            <div
              className="h-40 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: color }}
              onClick={() => handleCopy(color)}
            >
              <span className={`font-mono text-sm font-bold ${isLightColor(color) ? "text-slate-700" : "text-white"}`}>
                {color.toUpperCase()}
              </span>
            </div>
            <div
              className="h-40 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              style={{ backgroundColor: closest.hex }}
              onClick={() => {
                setColor(closest.hex);
              }}
            >
              <div className="text-center">
                <div className={`text-lg font-bold ${isLightColor(closest.hex) ? "text-slate-700" : "text-white"}`}>
                  {closest.name}
                </div>
                <div className={`text-xs mt-1 ${isLightColor(closest.hex) ? "text-slate-600" : "text-white/70"}`}>
                  {closest.hex.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 text-center text-xs py-2 bg-[#09090b] border-b border-[#27272a]">
            <span className="text-slate-500">输入颜色</span>
            <span className="text-slate-500">最接近的命名颜色</span>
          </div>

          <div className="p-6">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-white mb-2">{closest.name}</div>
              <div className="text-sm text-slate-400">
                相似度: <span className="text-amber-400 font-medium">{similarity}%</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => handleCopy(closest.name)}
                className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm hover:bg-amber-500/30 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                复制名称
              </button>
              <button
                onClick={() => handleCopy(closest.hex)}
                className="px-4 py-2 bg-[#09090b] text-slate-300 rounded-lg text-sm hover:bg-[#27272a] transition-colors flex items-center gap-2 border border-[#27272a]"
              >
                <Copy className="w-4 h-4" />
                复制HEX
              </button>
            </div>
          </div>
        </div>

        {/* 常用颜色参考 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4">常用颜色快速选择</h3>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
            {colorNames.slice(0, 24).map((c) => (
              <button
                key={c.hex}
                onClick={() => setColor(c.hex)}
                className="group relative aspect-square rounded-lg border border-[#27272a] hover:scale-110 transition-transform hover:z-10 hover:shadow-lg"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg transition-opacity p-1">
                  <span className="text-[10px] text-white text-center leading-tight">{c.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
