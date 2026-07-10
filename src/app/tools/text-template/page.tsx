"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileInput, Copy, Check, Eraser, Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function replaceAll(template: string, vars: Record<string, string>, prefix: string, suffix: string): string {
  let result = template;
  Object.entries(vars).forEach(([k, v]) => {
    const escKey = k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escKey ? `${prefix}${escKey}${suffix}` : "", "g");
    result = result.replace(regex, v);
  });
  return result;
}

interface VarItem { key: string; value: string; }

export default function TextTemplatePage() {
  const [template, setTemplate] = useState("您好，{{name}}！您的订单{{order}}已发货，预计{{date}}送达。");
  const [prefix, setPrefix] = useState("{{");
  const [suffix, setSuffix] = useState("}}");
  const [vars, setVars] = useState<VarItem[]>([
    { key: "name", value: "张三" },
    { key: "order", value: "A20240601" },
    { key: "date", value: "6月3日" },
  ]);
  const [copied, setCopied] = useState(false);

  const detected = useMemo(() => {
    if (!prefix || !suffix) return [];
    const escP = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const escS = suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`${escP}([^${escS.slice(0,1) === "\\" ? escS : escS}]+?)${escS}`, "g");
    const set = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = regex.exec(template)) !== null) set.add(m[1].trim());
    return Array.from(set);
  }, [template, prefix, suffix]);

  const varMap = useMemo(() => {
    const map: Record<string, string> = {};
    vars.forEach((v) => { if (v.key) map[v.key] = v.value; });
    return map;
  }, [vars]);

  const result = useMemo(() => replaceAll(template, varMap, prefix, suffix), [template, varMap, prefix, suffix]);

  const addVar = () => setVars([...vars, { key: "", value: "" }]);
  const updateVar = (i: number, field: "key" | "value", val: string) =>
    setVars(vars.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)));
  const removeVar = (i: number) => setVars(vars.filter((_, idx) => idx !== i));

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="文本模板替换"
      description="批量替换文本模板变量"
      icon={FileInput}
      category="文本工具"
      slug="text-template"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">模板内容</label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="使用 {{变量名}} 作为占位符..."
            rows={4}
            className={inputClass + " resize-y font-mono"}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">变量前缀</label>
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">变量后缀</label>
            <input value={suffix} onChange={(e) => setSuffix(e.target.value)} className={inputClass} />
          </div>
        </div>

        {detected.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500">检测到变量：</span>
            {detected.map((d) => (
              <span key={d} className="px-2 py-0.5 text-xs rounded bg-primary-500/10 text-primary-400 font-mono">{d}</span>
            ))}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">变量定义</label>
            <button onClick={addVar} className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> 添加变量
            </button>
          </div>
          <div className="space-y-2">
            {vars.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={v.key}
                  onChange={(e) => updateVar(i, "key", e.target.value)}
                  placeholder="变量名"
                  className={inputClass + " flex-1 font-mono"}
                />
                <input
                  value={v.value}
                  onChange={(e) => updateVar(i, "value", e.target.value)}
                  placeholder="替换值"
                  className={inputClass + " flex-1"}
                />
                <button onClick={() => removeVar(i)} className="px-2 text-slate-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">替换结果</label>
            <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
            </button>
          </div>
          <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 min-h-[60px]">
            <p className="text-sm text-white whitespace-pre-wrap break-all">{result}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
