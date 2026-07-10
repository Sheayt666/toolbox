"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Braces, Search } from "lucide-react";

interface CssProp {
  property: string;
  syntax: string;
  values: string;
  default: string;
  category: string;
}

const CSS_PROPS: CssProp[] = [
  { property: "display", syntax: "display: value;", values: "block | inline | flex | grid | none | inline-block", default: "inline", category: "布局" },
  { property: "position", syntax: "position: value;", values: "static | relative | absolute | fixed | sticky", default: "static", category: "布局" },
  { property: "flex-direction", syntax: "flex-direction: value;", values: "row | row-reverse | column | column-reverse", default: "row", category: "Flex" },
  { property: "justify-content", syntax: "justify-content: value;", values: "flex-start | center | flex-end | space-between | space-around", default: "flex-start", category: "Flex" },
  { property: "align-items", syntax: "align-items: value;", values: "stretch | flex-start | center | flex-end | baseline", default: "stretch", category: "Flex" },
  { property: "flex-wrap", syntax: "flex-wrap: value;", values: "nowrap | wrap | wrap-reverse", default: "nowrap", category: "Flex" },
  { property: "grid-template-columns", syntax: "grid-template-columns: value;", values: "none | <length> | <percentage> | fr | repeat()", default: "none", category: "Grid" },
  { property: "grid-gap", syntax: "grid-gap: value;", values: "<length> | <percentage>", default: "0", category: "Grid" },
  { property: "color", syntax: "color: value;", values: "<color> | rgb() | hsl() | hex", default: "浏览器默认", category: "文本" },
  { property: "font-size", syntax: "font-size: value;", values: "<length> | <percentage> | px | em | rem", default: "16px", category: "文本" },
  { property: "font-weight", syntax: "font-weight: value;", values: "normal | bold | 100-900", default: "normal", category: "文本" },
  { property: "line-height", syntax: "line-height: value;", values: "normal | <number> | <length> | <percentage>", default: "normal", category: "文本" },
  { property: "text-align", syntax: "text-align: value;", values: "left | right | center | justify", default: "left", category: "文本" },
  { property: "margin", syntax: "margin: value;", values: "<length> | <percentage> | auto", default: "0", category: "盒模型" },
  { property: "padding", syntax: "padding: value;", values: "<length> | <percentage>", default: "0", category: "盒模型" },
  { property: "border", syntax: "border: width style color;", values: "<border-width> <border-style> <color>", default: "medium none currentColor", category: "盒模型" },
  { property: "border-radius", syntax: "border-radius: value;", values: "<length> | <percentage>", default: "0", category: "盒模型" },
  { property: "width", syntax: "width: value;", values: "<length> | <percentage> | auto", default: "auto", category: "盒模型" },
  { property: "height", syntax: "height: value;", values: "<length> | <percentage> | auto", default: "auto", category: "盒模型" },
  { property: "background-color", syntax: "background-color: value;", values: "<color> | transparent", default: "transparent", category: "背景" },
  { property: "background-image", syntax: "background-image: url(...);", values: "url() | linear-gradient() | radial-gradient()", default: "none", category: "背景" },
  { property: "opacity", syntax: "opacity: value;", values: "0 - 1", default: "1", category: "视觉效果" },
  { property: "box-shadow", syntax: "box-shadow: x y blur spread color;", values: "none | <offset> <blur> <spread> <color>", default: "none", category: "视觉效果" },
  { property: "transition", syntax: "transition: property duration timing;", values: "<property> <duration> <timing-function>", default: "all 0s ease 0s", category: "动画" },
  { property: "transform", syntax: "transform: function();", values: "translate() | rotate() | scale() | skew()", default: "none", category: "动画" },
  { property: "animation", syntax: "animation: name duration timing;", values: "<name> <duration> <timing-function> <iteration-count>", default: "none", category: "动画" },
  { property: "z-index", syntax: "z-index: value;", values: "auto | <integer>", default: "auto", category: "布局" },
  { property: "overflow", syntax: "overflow: value;", values: "visible | hidden | scroll | auto", default: "visible", category: "布局" },
];

export default function CssPropertiesRefPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");

  const categories = useMemo(() => ["全部", ...Array.from(new Set(CSS_PROPS.map((p) => p.category)))], []);

  const filtered = useMemo(() => {
    let result = CSS_PROPS;
    if (category !== "全部") result = result.filter((p) => p.category === category);
    if (query.trim()) result = result.filter((p) => p.property.includes(query.toLowerCase()) || p.values.includes(query));
    return result;
  }, [query, category]);

  return (
    <ToolLayout title="CSS属性速查" description="快速查询CSS属性的语法、取值和浏览器兼容性" icon={Braces} category="查询工具" slug="css-properties-ref">
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索CSS属性..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono" />
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{c}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.property} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-primary-400 font-mono font-bold">{p.property}</code>
                <span className="text-xs px-2 py-0.5 bg-[#27272a] text-slate-400 rounded">{p.category}</span>
              </div>
              <div className="text-sm text-slate-300 font-mono mb-2">{p.syntax}</div>
              <div className="text-xs text-slate-500">取值: <span className="text-slate-400">{p.values}</span></div>
              <div className="text-xs text-slate-500 mt-1">默认: <span className="text-slate-400">{p.default}</span></div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
