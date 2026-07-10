"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Component, Copy, Check } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const SAMPLE = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" stroke="#6366f1" stroke-width="2"/>
  <path d="M8 12L11 15L16 9" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function toPascalCase(s: string): string {
  return s.replace(/(^|[-_\s])(\w)/g, (_, __, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
}

function svgToJsx(svg: string, opts: { componentName: string; inlineProps: boolean }): { code: string; error: string | null } {
  try {
    const dom = new DOMParser().parseFromString(svg, "image/svg+xml");
    const parseError = dom.querySelector("parsererror");
    if (parseError) return { code: "", error: "SVG 解析失败，请检查格式" };
    const svgEl = dom.documentElement;
    if (!svgEl || svgEl.tagName.toLowerCase() !== "svg") return { code: "", error: "未找到有效的 <svg> 根元素" };

    const attrs: string[] = [];
    const props = opts.inlineProps ? ["size = 24", "color = \"currentColor\"", "...props"] : ["...props"];

    for (const attr of Array.from(svgEl.attributes)) {
      let name = attr.name;
      // react 属性名转换
      if (name.includes(":")) name = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (name === "class") name = "className";
      else if (name.includes("-")) name = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (name === "xmlns") continue;
      if (name === "width" || name === "height") {
        if (opts.inlineProps) continue;
      }
      attrs.push(`${name}={${name === "fill" || name === "stroke" ? `"${attr.value}"` : `"${attr.value}"`}}`);
    }
    if (opts.inlineProps) {
      attrs.push('width={size}', 'height={size}');
    }
    attrs.push("{...props}");

    // 序列化子元素
    const serializer = (node: Element): string => {
      let result = "";
      node.childNodes.forEach((child) => {
        if (child.nodeType === 1) {
          const el = child as Element;
          let tagName = el.tagName.toLowerCase();
          // 自闭合标签
          let attrsStr = "";
          for (const a of Array.from(el.attributes)) {
            let an = a.name;
            if (an === "class") an = "className";
            else if (an.includes("-") && !an.startsWith("data-") && !an.startsWith("aria-")) an = an.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            attrsStr += ` ${an}="${a.value}"`;
          }
          const hasChildren = el.children.length > 0;
          if (hasChildren) {
            result += `\n      <${tagName}${attrsStr}>${serializer(el)}\n      </${tagName}>`;
          } else {
            result += `\n      <${tagName}${attrsStr} />`;
          }
        }
      });
      return result;
    };

    const children = serializer(svgEl);
    const compName = toPascalCase(opts.componentName) || "Icon";

    const code = `const ${compName} = ({ ${props.join(", ")} }: SVGProps<SVGSVGElement>) => {
  return (
    <svg${attrs.length > 0 ? attrs.map((a) => ` ${a}`).join("") : ""}>${children}
    </svg>
  );
};

export default ${compName};`;
    return { code, error: null };
  } catch (e) {
    return { code: "", error: (e as Error).message };
  }
}

export default function SvgToJsxConverterPage() {
  const [svg, setSvg] = useState(SAMPLE);
  const [name, setName] = useState("CheckIcon");
  const [inlineProps, setInlineProps] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => svgToJsx(svg, { componentName: name, inlineProps }), [svg, name, inlineProps]);

  const copy = () => {
    navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="SVG转JSX"
      description="将SVG代码转换为React JSX"
      icon={Component}
      category="转换工具"
      slug="svg-to-jsx-converter"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">组件名称</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass + " font-mono"} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer pb-2.5">
              <input type="checkbox" checked={inlineProps} onChange={(e) => setInlineProps(e.target.checked)} className="accent-primary-500" />
              生成 size/color 可配置 props
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">SVG 源码</label>
          <textarea value={svg} onChange={(e) => setSvg(e.target.value)} rows={8} className={inputClass + " resize-y font-mono"} />
        </div>

        {result.error && <p className="text-sm text-red-400">{result.error}</p>}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">JSX 输出</label>
            <button onClick={copy} disabled={!result.code} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 disabled:opacity-30">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
            </button>
          </div>
          <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-emerald-300 font-mono whitespace-pre-wrap break-all max-h-96 overflow-auto">
            {result.code}
          </pre>
        </div>
      </div>
    </ToolLayout>
  );
}
