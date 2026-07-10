"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Plug, Send, Loader2, Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface Header { key: string; value: string; }

export default function ApiTesterPage() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [headers, setHeaders] = useState<Header[]>([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [respHeaders, setRespHeaders] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }]);
  const updateHeader = (i: number, field: keyof Header, val: string) => setHeaders(headers.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)));
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i));

  const send = async () => {
    if (!url) return;
    setLoading(true);
    setError("");
    setResponse("");
    setStatus(null);
    setTime(null);
    const start = performance.now();
    try {
      const hdrs: Record<string, string> = {};
      headers.forEach((h) => { if (h.key) hdrs[h.key] = h.value; });
      const options: RequestInit = { method, headers: hdrs };
      if (method !== "GET" && body) options.body = body;
      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - start);
      setTime(elapsed);
      setStatus(res.status);
      const rh: Record<string, string> = {};
      res.headers.forEach((v, k) => { rh[k] = v; });
      setRespHeaders(rh);
      const text = await res.text();
      try {
        setResponse(JSON.stringify(JSON.parse(text), null, 2));
      } catch {
        setResponse(text);
      }
    } catch (e) {
      setError((e as Error).message + "（可能是 CORS 跨域限制，建议使用支持 CORS 的接口）");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = status ? (status < 300 ? "#10b981" : status < 400 ? "#eab308" : status < 500 ? "#f97316" : "#ef4444") : "#64748b";

  return (
    <ToolLayout
      title="API接口测试"
      description="在线HTTP接口测试工具"
      icon={Plug}
      category="开发工具"
      slug="api-tester"
    >
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex gap-2">
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 text-sm text-white font-mono">
            {methods.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" className={inputClass + " flex-1 font-mono"} />
          <button onClick={send} disabled={loading || !url} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            发送
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">请求头</label>
              <button onClick={addHeader} className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 添加
              </button>
            </div>
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-1.5">
                  <input value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} placeholder="Key" className={inputClass + " flex-1 text-xs font-mono"} />
                  <input value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} placeholder="Value" className={inputClass + " flex-1 text-xs font-mono"} />
                  <button onClick={() => removeHeader(i)} className="px-1.5 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">请求体（Body）</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={5}
              className={inputClass + " resize-y font-mono text-xs"}
            />
          </div>
        </div>

        {(status !== null || error) && (
          <div className="flex items-center gap-3 flex-wrap">
            {status !== null && (
              <>
                <span className="px-2.5 py-1 text-xs font-bold rounded-md" style={{ backgroundColor: statusColor + "20", color: statusColor }}>
                  {status} {status < 300 ? "OK" : status < 400 ? "Redirect" : status < 500 ? "Client Error" : "Server Error"}
                </span>
                {time !== null && <span className="text-xs text-slate-500">{time} ms</span>}
              </>
            )}
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        )}

        {response && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">响应内容</label>
            <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap break-all max-h-96 overflow-auto">
              {response}
            </pre>
          </div>
        )}

        {Object.keys(respHeaders).length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">响应头</label>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 max-h-48 overflow-y-auto space-y-1">
              {Object.entries(respHeaders).map(([k, v]) => (
                <div key={k} className="text-xs flex gap-2">
                  <span className="text-primary-300 font-mono flex-shrink-0">{k}:</span>
                  <span className="text-slate-400 font-mono break-all">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
