"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Settings, Copy, Check, ArrowRightLeft } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

// 简单 YAML 解析（支持缩进嵌套 -> 展平 key.path）
function parseYaml(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const stack: { indent: number; key: string }[] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    const m = line.trim().match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const value = m[2].trim().replace(/^["']|["']$/g, "");
    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) stack.pop();
    const fullKey = stack.length > 0 ? stack[stack.length - 1].key + "." + key : key;
    if (value === "") {
      stack.push({ indent, key: fullKey });
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function toProperties(map: Record<string, string>): string {
  return Object.entries(map).map(([k, v]) => `${k}=${v}`).join("\n");
}

// 简单 Properties -> YAML（扁平）
function parseProperties(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    result[key] = value;
  });
  return result;
}

function toYaml(map: Record<string, string>): string {
  const tree: Record<string, unknown> = {};
  Object.entries(map).forEach(([k, v]) => {
    const parts = k.split(".");
    let cur = tree;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) cur[p] = v;
      else { cur[p] = (cur[p] as Record<string, unknown>) || {}; cur = cur[p] as Record<string, unknown>; }
    });
  });
  const serialize = (obj: Record<string, unknown>, indent: number): string => {
    let result = "";
    Object.entries(obj).forEach(([k, v]) => {
      const pad = "  ".repeat(indent);
      if (typeof v === "object" && v !== null) {
        result += `${pad}${k}:\n${serialize(v as Record<string, unknown>, indent + 1)}`;
      } else {
        result += `${pad}${k}: ${v}\n`;
      }
    });
    return result;
  };
  return serialize(tree, 0).trimEnd();
}

export default function YamlToPropertiesPage() {
  const [mode, setMode] = useState<"y2p" | "p2y">("y2p");
  const [input, setInput] = useState(`server:
  port: 8080
  host: localhost
database:
  name: mydb
  user: admin
  password: secret`);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      if (mode === "y2p") return toProperties(parseYaml(input));
      return toYaml(parseProperties(input));
    } catch (e) {
      return "转换出错：" + (e as Error).message;
    }
  }, [input, mode]);

  const copy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="YAML转Properties"
      description="YAML与Properties配置文件互转"
      icon={Settings}
      category="转换工具"
      slug="yaml-to-properties"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex gap-2">
          <button onClick={() => setMode("y2p")} className={`flex-1 px-4 py-2 text-sm rounded-lg border ${mode === "y2p" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
            YAML → Properties
          </button>
          <button onClick={() => setMode("p2y")} className={`flex-1 px-4 py-2 text-sm rounded-lg border ${mode === "p2y" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
            Properties → YAML
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">{mode === "y2p" ? "YAML 输入" : "Properties 输入"}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={8} className={inputClass + " resize-y font-mono"} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">{mode === "y2p" ? "Properties 输出" : "YAML 输出"}</label>
            <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
            </button>
          </div>
          <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-emerald-300 font-mono whitespace-pre-wrap break-all min-h-[80px]">{result}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
