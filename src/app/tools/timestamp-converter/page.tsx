"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Timer, Copy, Check, ArrowRightLeft, Clock } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toLocalISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function toUTCISO(date: Date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

export default function TimestampConverterPage() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [ts, setTs] = useState("");
  const [tsUnit, setTsUnit] = useState<"s" | "ms">("s");
  const [dateStr, setDateStr] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const tsToDate = (input: string, unit: "s" | "ms") => {
    const n = Number(input);
    if (!input || isNaN(n)) return null;
    const ms = unit === "s" ? n * 1000 : n;
    return new Date(ms);
  };

  const dateToTs = (input: string, unit: "s" | "ms") => {
    const d = new Date(input.replace(" ", "T"));
    if (isNaN(d.getTime())) return null;
    return unit === "s" ? Math.floor(d.getTime() / 1000) : d.getTime();
  };

  const tsResult = tsToDate(ts, tsUnit);
  const dateResult = dateStr ? dateToTs(dateStr, tsUnit) : null;

  const copy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <ToolLayout
      title="时间戳转换"
      description="Unix时间戳与日期时间互转，支持多时区"
      icon={Timer}
      category="开发工具"
      slug="timestamp-converter"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            <div>
              <p className="text-xs text-slate-500">当前时间戳</p>
              <p className="text-lg font-mono text-white">{now}</p>
            </div>
          </div>
          <button
            onClick={() => { setTs(String(now)); setTsUnit("s"); }}
            className="text-xs text-primary-400 hover:text-primary-300"
          >
            填入
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">时间戳 → 日期</label>
            <div className="flex gap-2 mb-2">
              <input
                value={ts}
                onChange={(e) => setTs(e.target.value)}
                placeholder="输入时间戳..."
                className={inputClass + " font-mono"}
              />
              <select
                value={tsUnit}
                onChange={(e) => setTsUnit(e.target.value as "s" | "ms")}
                className="bg-[#0a0a0b] border border-[#27272a] rounded-lg px-2 text-sm text-white"
              >
                <option value="s">秒</option>
                <option value="ms">毫秒</option>
              </select>
            </div>
            {tsResult && (
              <div className="space-y-2">
                {[
                  { k: "local", l: "本地时间", v: toLocalISO(tsResult) },
                  { k: "utc", l: "UTC 时间", v: toUTCISO(tsResult) + " UTC" },
                  { k: "iso", l: "ISO 8601", v: tsResult.toISOString() },
                  { k: "rel", l: "相对时间", v: tsResult.toLocaleString("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) },
                ].map((r) => (
                  <div key={r.k} className="flex items-center justify-between rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2.5">
                    <div>
                      <p className="text-xs text-slate-500">{r.l}</p>
                      <p className="text-sm text-white font-mono">{r.v}</p>
                    </div>
                    <button onClick={() => copy(r.k, r.v)} className="text-slate-500 hover:text-white">
                      {copied === r.k ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">日期 → 时间戳</label>
            <input
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              placeholder="格式：2024-06-01 12:00:00"
              className={inputClass + " mb-2 font-mono"}
            />
            <button
              onClick={() => setDateStr(toLocalISO(new Date()))}
              className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mb-2"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> 使用当前时间
            </button>
            {dateResult !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2.5">
                  <div>
                    <p className="text-xs text-slate-500">秒级时间戳</p>
                    <p className="text-sm text-white font-mono">{dateResult}</p>
                  </div>
                  <button onClick={() => copy("dts", String(dateResult))} className="text-slate-500 hover:text-white">
                    {copied === "dts" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2.5">
                  <div>
                    <p className="text-xs text-slate-500">毫秒级时间戳</p>
                    <p className="text-sm text-white font-mono">{dateResult * 1000}</p>
                  </div>
                  <button onClick={() => copy("dtms", String(dateResult * 1000))} className="text-slate-500 hover:text-white">
                    {copied === "dtms" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
