"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Clock, Copy, Check, Calendar } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const PART_NAMES = ["分钟", "小时", "日", "月", "星期"];
const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function parseField(field: string, min: number, max: number): number[] {
  if (field === "*") return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  const result = new Set<number>();
  field.split(",").forEach((part) => {
    if (part.includes("/")) {
      const [range, stepStr] = part.split("/");
      const step = parseInt(stepStr);
      let start = min, end = max;
      if (range !== "*") {
        if (range.includes("-")) {
          const [s, e] = range.split("-").map(Number);
          start = s; end = e;
        } else {
          start = parseInt(range);
        }
      }
      for (let i = start; i <= end; i += step) result.add(i);
    } else if (part.includes("-")) {
      const [s, e] = part.split("-").map(Number);
      for (let i = s; i <= e; i++) result.add(i);
    } else {
      const n = parseInt(part);
      if (!isNaN(n)) result.add(n);
    }
  });
  return Array.from(result).sort((a, b) => a - b);
}

function describePart(values: number[], min: number, max: number, type: string): string {
  if (values.length === max - min + 1) return `每${type}`;
  if (values.length === 1) return `${type} ${values[0]}`;
  return `${type} ${values.join("、")}`;
}

export default function CronExpressionParserPage() {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const [copied, setCopied] = useState(false);

  const { error, parts, description, nextRuns } = useMemo(() => {
    const fields = expr.trim().split(/\s+/);
    if (fields.length !== 5) return { error: "Cron 表达式必须包含 5 个字段", parts: [], description: "", nextRuns: [] as Date[] };
    try {
      const [m, h, d, mo, w] = fields;
      const minutes = parseField(m, 0, 59);
      const hours = parseField(h, 0, 23);
      const days = parseField(d, 1, 31);
      const months = parseField(mo, 1, 12);
      const weekdays = parseField(w, 0, 6);

      const desc = [
        describePart(minutes, 0, 59, "分钟"),
        describePart(hours, 0, 23, "小时"),
        describePart(days, 1, 31, "日"),
        describePart(months, 1, 12, "月"),
        describePart(weekdays, 0, 6, "星期"),
      ].join("，");

      // 计算未来执行时间
      const runs: Date[] = [];
      const now = new Date();
      const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
      let test = new Date(base.getTime() + 60000);
      let count = 0;
      while (runs.length < 5 && count < 500000) {
        count++;
        if (
          months.includes(test.getMonth() + 1) &&
          days.includes(test.getDate()) &&
          weekdays.includes(test.getDay()) &&
          hours.includes(test.getHours()) &&
          minutes.includes(test.getMinutes())
        ) {
          runs.push(new Date(test));
          test = new Date(test.getTime() + 60000);
        } else {
          test = new Date(test.getTime() + 60000);
        }
      }

      return {
        error: null,
        parts: [m, h, d, mo, w],
        description: desc,
        nextRuns: runs,
      };
    } catch (e) {
      return { error: (e as Error).message, parts: [], description: "", nextRuns: [] as Date[] };
    }
  }, [expr]);

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${WEEKDAYS[d.getDay()]}`;

  const copy = () => {
    navigator.clipboard.writeText(expr);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const PRESETS = [
    { l: "每天 0:00", v: "0 0 * * *" },
    { l: "每小时", v: "0 * * * *" },
    { l: "每5分钟", v: "*/5 * * * *" },
    { l: "工作日 9:00", v: "0 9 * * 1-5" },
    { l: "每月1号", v: "0 0 1 * *" },
    { l: "每周日", v: "0 0 * * 0" },
  ];

  return (
    <ToolLayout
      title="Cron表达式解析"
      description="解析Cron表达式，展示未来执行时间"
      icon={Clock}
      category="开发工具"
      slug="cron-expression-parser"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Cron 表达式</label>
          <div className="flex gap-2">
            <input
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="* * * * *（分 时 日 月 周）"
              className={inputClass + " font-mono text-center text-lg tracking-widest"}
            />
            <button onClick={copy} className="inline-flex items-center gap-1 px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.v} onClick={() => setExpr(p.v)} className="px-3 py-1.5 text-xs rounded-lg border border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:border-primary-500/50 hover:text-primary-400">
              {p.l}
            </button>
          ))}
        </div>

        {!error && parts.length === 5 && (
          <>
            <div className="grid grid-cols-5 gap-2">
              {parts.map((p, i) => (
                <div key={i} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2.5 text-center">
                  <p className="text-xs text-slate-500 mb-1">{PART_NAMES[i]}</p>
                  <p className="text-sm text-white font-mono">{p}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-primary-500/5 border border-primary-500/20 p-4">
              <p className="text-xs text-slate-500 mb-1.5">执行说明</p>
              <p className="text-sm text-slate-200 leading-relaxed">{description}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary-400" />
                <label className="text-sm font-medium text-slate-300">未来 5 次执行时间</label>
              </div>
              <div className="space-y-2">
                {nextRuns.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3">
                    <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-white font-mono">{fmtDate(d)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
