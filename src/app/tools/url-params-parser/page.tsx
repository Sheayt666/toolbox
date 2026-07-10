"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Link2, Copy, Check, Eraser, Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface Param { key: string; value: string; }

export default function UrlParamsParserPage() {
  const [url, setUrl] = useState("https://example.com/search?q=nextjs&page=2&sort=desc&lang=zh-CN");
  const [params, setParams] = useState<Param[]>([]);
  const [copied, setCopied] = useState(false);

  const parsed = useMemo(() => {
    try {
      const u = new URL(url);
      const list: Param[] = [];
      u.searchParams.forEach((v, k) => list.push({ key: k, value: v }));
      return {
        protocol: u.protocol,
        host: u.host,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        hash: u.hash,
        params: list,
        origin: u.origin,
      };
    } catch {
      return null;
    }
  }, [url]);

  const builtUrl = useMemo(() => {
    try {
      const base = parsed ? parsed.origin + parsed.pathname : "https://example.com";
      const u = new URL(base);
      params.forEach((p) => { if (p.key) u.searchParams.set(p.key, p.value); });
      return u.toString();
    } catch {
      return "";
    }
  }, [params, parsed]);

  const loadFromParsed = () => {
    if (parsed) setParams([...parsed.params]);
  };

  const addParam = () => setParams([...params, { key: "", value: "" }]);
  const updateParam = (i: number, field: keyof Param, val: string) =>
    setParams(params.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
  const removeParam = (i: number) => setParams(params.filter((_, idx) => idx !== i));

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const parts = parsed ? [
    { l: "协议", v: parsed.protocol },
    { l: "主机", v: parsed.host },
    { l: "域名", v: parsed.hostname },
    { l: "端口", v: parsed.port || "(默认)" },
    { l: "路径", v: parsed.pathname },
    { l: "锚点", v: parsed.hash || "(无)" },
    { l: "Origin", v: parsed.origin },
  ] : [];

  return (
    <ToolLayout
      title="URL参数解析"
      description="解析URL查询参数"
      icon={Link2}
      category="开发工具"
      slug="url-params-parser"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">输入 URL</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/path?key=value"
            className={inputClass + " font-mono"}
          />
        </div>

        {parsed ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {parts.map((p) => (
                <div key={p.l} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2.5">
                  <p className="text-xs text-slate-500 mb-0.5">{p.l}</p>
                  <p className="text-sm text-white font-mono truncate" title={p.v}>{p.v}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">查询参数（{parsed.params.length}）</label>
                <button onClick={loadFromParsed} className="text-xs text-primary-400 hover:text-primary-300">
                  导入到编辑器
                </button>
              </div>
              <div className="rounded-lg border border-[#27272a] overflow-hidden">
                {parsed.params.length === 0 ? (
                  <p className="text-sm text-slate-600 p-4 text-center">无查询参数</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-[#0a0a0b]">
                      <tr className="text-slate-500 text-xs">
                        <th className="text-left p-2.5 font-medium">参数名</th>
                        <th className="text-left p-2.5 font-medium">参数值</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.params.map((p, i) => (
                        <tr key={i} className="border-t border-[#1f1f23]">
                          <td className="p-2.5 text-primary-300 font-mono">{p.key}</td>
                          <td className="p-2.5 text-slate-200 font-mono break-all">{p.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-red-400">请输入有效的 URL</p>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">参数构建器</label>
            <button onClick={addParam} className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> 添加参数
            </button>
          </div>
          <div className="space-y-2 mb-3">
            {params.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input value={p.key} onChange={(e) => updateParam(i, "key", e.target.value)} placeholder="参数名" className={inputClass + " flex-1 font-mono"} />
                <input value={p.value} onChange={(e) => updateParam(i, "value", e.target.value)} placeholder="参数值" className={inputClass + " flex-1 font-mono"} />
                <button onClick={() => removeParam(i)} className="px-2 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          {builtUrl && (
            <div className="flex items-center justify-between rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3">
              <p className="text-sm text-white font-mono break-all flex-1 mr-2">{builtUrl}</p>
              <button onClick={() => copy(builtUrl)} className="text-slate-400 hover:text-white flex-shrink-0">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
