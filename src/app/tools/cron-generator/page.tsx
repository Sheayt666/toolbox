"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CalendarClock, Copy, Check, Info } from "lucide-react";

export default function CronGeneratorPage() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [copied, setCopied] = useState(false);

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const presets = [
    { name: "每分钟", expr: "* * * * *", desc: "每分钟执行一次" },
    { name: "每小时", expr: "0 * * * *", desc: "每小时整点执行" },
    { name: "每天", expr: "0 0 * * *", desc: "每天零点执行" },
    { name: "每周", expr: "0 0 * * 0", desc: "每周日零点执行" },
    { name: "每月", expr: "0 0 1 * *", desc: "每月1号零点执行" },
    { name: "每天早9点", expr: "0 9 * * *", desc: "每天早上9点执行" },
    { name: "工作日早9点", expr: "0 9 * * 1-5", desc: "周一到周五早9点" },
    { name: "每5分钟", expr: "*/5 * * * *", desc: "每5分钟执行一次" },
    { name: "每10分钟", expr: "*/10 * * * *", desc: "每10分钟执行一次" },
    { name: "每30分钟", expr: "*/30 * * * *", desc: "每30分钟执行一次" },
    { name: "中午12点", expr: "0 12 * * *", desc: "每天中午12点执行" },
    { name: "凌晨3点", expr: "0 3 * * *", desc: "每天凌晨3点执行" },
  ];

  const applyPreset = (expr: string) => {
    const parts = expr.split(" ");
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const explainCron = (expr: string): string => {
    const parts = expr.split(" ");
    if (parts.length !== 5) return "无效的Cron表达式";

    const [m, h, dom, mon, dow] = parts;
    let result = "";

    // 分钟
    if (m === "*") result += "每分钟";
    else if (m.startsWith("*/")) result += `每${m.slice(2)}分钟`;
    else if (m.includes(",")) result += `第${m}分钟`;
    else if (m.includes("-")) result += `${m.replace("-", "到")}分钟`;
    else result += `第${m}分钟`;

    // 小时
    if (h === "*") result += "每小时";
    else if (h.startsWith("*/")) result += `每${h.slice(2)}小时`;
    else if (h.includes(",")) result += `第${h}点`;
    else if (h.includes("-")) result += `${h.replace("-", "到")}点`;
    else result += `${h}点`;

    // 日
    if (dom !== "*") {
      if (dom.startsWith("*/")) result += `每${dom.slice(2)}天`;
      else result += `${dom}号`;
    }

    // 月
    if (mon !== "*") {
      const months = ["", "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
      if (mon.includes("-")) {
        const [s, e] = mon.split("-");
        result += `${months[parseInt(s)]}到${months[parseInt(e)]}`;
      } else {
        result += months[parseInt(mon)] || `${mon}月`;
      }
    }

    // 周
    if (dow !== "*") {
      const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      if (dow.includes(",")) {
        const dayNums = dow.split(",").map(Number);
        result += dayNums.map(d => days[d] || `周${d}`).join("、");
      } else if (dow.includes("-")) {
        const [s, e] = dow.split("-").map(Number);
        result += `${days[s] || s}到${days[e] || e}`;
      } else {
        result += days[parseInt(dow)] || `周${dow}`;
      }
      result += "执行";
    } else {
      result += "执行";
    }

    return result;
  };

  const FieldSelector = ({
    label,
    value,
    onChange,
    min,
    max,
    hint,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    min: number;
    max: number;
    hint: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <span className="text-xs text-zinc-500">{hint}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-300 font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
      />
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onChange("*")}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            value === "*"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          所有
        </button>
        <button
          onClick={() => onChange(`*/${min === 0 ? 5 : 2}`)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
            value.startsWith("*/")
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          每N个
        </button>
        <span className="text-xs text-zinc-600 self-center">范围: {min}-{max}</span>
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="Cron表达式生成器"
      description="可视化Cron表达式生成工具，支持预设模板和中文解释，快速生成定时任务表达式"
      toolId="cron-generator"
      icon={CalendarClock}
      category="开发工具"
      slug="cron-generator"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 结果展示 */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-semibold">Cron表达式</h2>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          <div className="text-3xl font-mono font-bold text-amber-400 text-center tracking-wider">
            {cronExpression}
          </div>
          <div className="mt-3 text-center text-sm text-amber-400/80">
            中文解释：{explainCron(cronExpression)}
          </div>
        </div>

        {/* 字段配置 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">字段配置</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FieldSelector
              label="分钟"
              value={minute}
              onChange={setMinute}
              min={0}
              max={59}
              hint="0-59"
            />
            <FieldSelector
              label="小时"
              value={hour}
              onChange={setHour}
              min={0}
              max={23}
              hint="0-23"
            />
            <FieldSelector
              label="日"
              value={dayOfMonth}
              onChange={setDayOfMonth}
              min={1}
              max={31}
              hint="1-31"
            />
            <FieldSelector
              label="月"
              value={month}
              onChange={setMonth}
              min={1}
              max={12}
              hint="1-12"
            />
            <FieldSelector
              label="周"
              value={dayOfWeek}
              onChange={setDayOfWeek}
              min={0}
              max={6}
              hint="0-6 (0=周日)"
            />
          </div>
        </div>

        {/* 预设模板 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">常用预设</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {presets.map((p) => (
              <button
                key={p.expr}
                onClick={() => applyPreset(p.expr)}
                className="p-3 bg-zinc-900/50 border border-zinc-700 rounded-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-all text-left group"
              >
                <div className="text-sm font-medium text-zinc-300 group-hover:text-amber-400 transition-colors">
                  {p.name}
                </div>
                <div className="text-xs text-zinc-500 font-mono mt-1">{p.expr}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 语法说明 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-semibold">语法说明</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <code className="text-amber-400">*</code>
              <span className="text-zinc-400 ml-2">所有值</span>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <code className="text-amber-400">,</code>
              <span className="text-zinc-400 ml-2">值列表</span>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <code className="text-amber-400">-</code>
              <span className="text-zinc-400 ml-2">范围</span>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <code className="text-amber-400">*/n</code>
              <span className="text-zinc-400 ml-2">每隔n</span>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
