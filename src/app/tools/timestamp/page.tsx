"use client";

import { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Clock,
  Copy,
  Check,
  Calendar,
  Timer,
  Zap,
  ArrowRightLeft,
} from "lucide-react";

type TimeUnit = "second" | "millisecond";

function padZero(num: number, length = 2): string {
  return String(num).padStart(length, "0");
}

function formatDateTime(date: Date): string {
  return (
    `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ` +
    `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`
  );
}

function formatDateTimeMs(date: Date): string {
  return formatDateTime(date) + `.${padZero(date.getMilliseconds(), 3)}`;
}

function formatUTCDateTime(date: Date): string {
  return (
    `${date.getUTCFullYear()}-${padZero(date.getUTCMonth() + 1)}-${padZero(date.getUTCDate())} ` +
    `${padZero(date.getUTCHours())}:${padZero(date.getUTCMinutes())}:${padZero(date.getUTCSeconds())}`
  );
}

function formatUTCDateTimeMs(date: Date): string {
  return formatUTCDateTime(date) + `.${padZero(date.getUTCMilliseconds(), 3)}`;
}

function formatDateInput(date: Date): string {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
}

function formatTimeInput(date: Date): string {
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

export default function TimestampPage() {
  const [now, setNow] = useState<Date>(new Date());
  const [unit, setUnit] = useState<TimeUnit>("second");
  const [timestampInput, setTimestampInput] = useState("");
  const [timestampResult, setTimestampResult] = useState<{
    local: string;
    utc: string;
    isValid: boolean;
  } | null>(null);
  const [dateInput, setDateInput] = useState(formatDateInput(new Date()));
  const [timeInput, setTimeInput] = useState(formatTimeInput(new Date()));
  const [dateResult, setDateResult] = useState<{
    second: string;
    millisecond: string;
    isValid: boolean;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ts2date" | "date2ts">("ts2date");

  // 实时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentTimestampSec = Math.floor(now.getTime() / 1000);
  const currentTimestampMs = now.getTime();

  const handleCopy = useCallback((value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  // 时间戳转日期
  const handleTimestampConvert = useCallback(() => {
    const input = timestampInput.trim();
    if (!input) {
      setTimestampResult(null);
      return;
    }

    const num = Number(input);
    if (isNaN(num) || num < 0) {
      setTimestampResult({ local: "", utc: "", isValid: false });
      return;
    }

    let timestampMs: number;
    if (unit === "second") {
      // 秒级时间戳
      if (input.length > 11) {
        // 如果输入的秒级时间戳太长，可能是毫秒级，自动检测
        timestampMs = num;
      } else {
        timestampMs = num * 1000;
      }
    } else {
      // 毫秒级时间戳
      timestampMs = num;
    }

    const date = new Date(timestampMs);
    if (isNaN(date.getTime())) {
      setTimestampResult({ local: "", utc: "", isValid: false });
      return;
    }

    setTimestampResult({
      local: unit === "millisecond" ? formatDateTimeMs(date) : formatDateTime(date),
      utc: unit === "millisecond" ? formatUTCDateTimeMs(date) : formatUTCDateTime(date),
      isValid: true,
    });
  }, [timestampInput, unit]);

  // 日期转时间戳
  const handleDateConvert = useCallback(() => {
    if (!dateInput) {
      setDateResult(null);
      return;
    }

    const dateStr = `${dateInput}T${timeInput || "00:00:00"}`;
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      setDateResult({ second: "", millisecond: "", isValid: false });
      return;
    }

    setDateResult({
      second: String(Math.floor(date.getTime() / 1000)),
      millisecond: String(date.getTime()),
      isValid: true,
    });
  }, [dateInput, timeInput]);

  // 切换标签时重新
  const handleTabSwitch = (tab: "ts2date" | "date2ts") => {
    setActiveTab(tab);
    setTimestampResult(null);
    setDateResult(null);
  };

  // 使用当前时间
  const useNowForTimestamp = () => {
    if (unit === "second") {
      setTimestampInput(String(currentTimestampSec));
    } else {
      setTimestampInput(String(currentTimestampMs));
    }
    // 自动转换
    setTimeout(() => {
      const date = new Date();
      setTimestampResult({
        local: unit === "millisecond" ? formatDateTimeMs(date) : formatDateTime(date),
        utc: unit === "millisecond" ? formatUTCDateTimeMs(date) : formatUTCDateTime(date),
        isValid: true,
      });
    }, 0);
  };

  const useNowForDate = () => {
    const now = new Date();
    setDateInput(formatDateInput(now));
    setTimeInput(formatTimeInput(now));
    setDateResult({
      second: String(Math.floor(now.getTime() / 1000)),
      millisecond: String(now.getTime()),
      isValid: true,
    });
  };

  // 交换模式
  const handleSwap = () => {
    if (activeTab === "ts2date") {
      // 时间戳转日期 -> 日期转时间戳
      if (timestampResult?.isValid) {
        const date = new Date(
          unit === "second" ? Number(timestampInput) * 1000 : Number(timestampInput)
        );
        if (!isNaN(date.getTime())) {
          setDateInput(formatDateInput(date));
          setTimeInput(formatTimeInput(date));
          setDateResult({
            second: String(Math.floor(date.getTime() / 1000)),
            millisecond: String(date.getTime()),
            isValid: true,
          });
        }
      }
      handleTabSwitch("date2ts");
    } else {
      // 日期转时间戳 -> 时间戳转日期
      if (dateResult?.isValid) {
        const ts = unit === "second" ? dateResult.second : dateResult.millisecond;
        setTimestampInput(ts);
        const date = new Date(
          unit === "second" ? Number(ts) * 1000 : Number(ts)
        );
        setTimestampResult({
          local: unit === "millisecond" ? formatDateTimeMs(date) : formatDateTime(date),
          utc: unit === "millisecond" ? formatUTCDateTimeMs(date) : formatUTCDateTime(date),
          isValid: true,
        });
      }
      handleTabSwitch("ts2date");
    }
  };

  return (
    <ToolLayout
      title="时间戳转换工具"
      description="Unix时间戳与日期时间格式互转，支持多种时区和格式"
      icon={Clock}
      category="开发工具"
      slug="timestamp"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 当前时间戳*/}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 shadow-lg shadow-amber-500/25 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-base font-semibold">当前时间戳</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm opacity-80 mb-2 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                秒级时间戳(10位)
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-mono font-bold">
                  {currentTimestampSec}
                </span>
                <button
                  onClick={() => handleCopy(String(currentTimestampSec), "now-sec")}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="复制"
                >
                  {copied === "now-sec" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm opacity-80 mb-2 flex items-center gap-1">
                <Timer className="w-4 h-4" />
                毫秒级时间戳 (13位)
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xl font-mono font-bold">
                  {currentTimestampMs}
                </span>
                <button
                  onClick={() => handleCopy(String(currentTimestampMs), "now-ms")}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="复制"
                >
                  {copied === "now-ms" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-90">
            当前时间：{formatDateTime(now)}
          </div>
        </div>

        {/* 转换区*/}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* 标签切换 */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabSwitch("ts2date")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "ts2date"
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                时间戳转日期
              </button>
              <button
                onClick={() => handleTabSwitch("date2ts")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === "date2ts"
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                日期转时间戳
              </button>
            </div>
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="交换转换方向"
            >
              <ArrowRightLeft className="w-4 h-4" />
              交换
            </button>
          </div>

          {/* 单位切换 */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                时间戳单位：
              </span>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setUnit("second")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    unit === "second"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  秒(s)
                </button>
                <button
                  onClick={() => setUnit("millisecond")}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    unit === "millisecond"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  毫秒 (ms)
                </button>
              </div>
            </div>
          </div>

          {/* 时间戳转日期 */}
          {activeTab === "ts2date" && (
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Timer className="w-4 h-4 text-indigo-500" />
                    输入时间戳
                  </label>
                  <button
                    onClick={useNowForTimestamp}
                    className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    使用当前时间
                  </button>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={timestampInput}
                    onChange={(e) => {
                      setTimestampInput(e.target.value);
                      setTimestampResult(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTimestampConvert();
                    }}
                    placeholder={
                      unit === "second"
                        ? "请输入秒级时间戳，如 1700000000"
                        : "请输入毫秒级时间戳，如1700000000000"
                    }
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-lg"
                  />
                  <button
                    onClick={handleTimestampConvert}
                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors shadow-sm whitespace-nowrap"
                  >
                    转换
                  </button>
                </div>
              </div>

              {/* 转换结果 */}
              {timestampResult !== null && (
                <div className="space-y-3">
                  {timestampResult.isValid ? (
                    <>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            本地时间
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(timestampResult.local, "ts-result-local")
                            }
                            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="复制"
                          >
                            {copied === "ts-result-local" ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-lg font-mono text-slate-900 dark:text-white">
                          {timestampResult.local}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            UTC 时间
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(timestampResult.utc, "ts-result-utc")
                            }
                            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="复制"
                          >
                            {copied === "ts-result-utc" ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-lg font-mono text-slate-900 dark:text-white">
                          {timestampResult.utc}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
                      无效的时间戳，请检查输入
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 日期转时间戳 */}
          {activeTab === "date2ts" && (
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    选择日期时间
                  </label>
                  <button
                    onClick={useNowForDate}
                    className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                  >
                    使用当前时间
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => {
                      setDateInput(e.target.value);
                      setDateResult(null);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => {
                      setTimeInput(e.target.value);
                      setDateResult(null);
                    }}
                    step="1"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleDateConvert}
                  className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors shadow-sm"
                >
                  转换为时间戳
                </button>
              </div>

              {/* 转换结果 */}
              {dateResult !== null && (
                <div className="space-y-3">
                  {dateResult.isValid ? (
                    <>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            秒级时间戳
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(dateResult.second, "date-result-sec")
                            }
                            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="复制"
                          >
                            {copied === "date-result-sec" ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-lg font-mono text-slate-900 dark:text-white">
                          {dateResult.second}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            毫秒级时间戳
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(dateResult.millisecond, "date-result-ms")
                            }
                            className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            title="复制"
                          >
                            {copied === "date-result-ms" ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <div className="text-lg font-mono text-slate-900 dark:text-white">
                          {dateResult.millisecond}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-600 dark:text-red-400">
                      无效的日期时间，请检查输入
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
            什么是 Unix 时间戳？
          </h3>
          <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <p>
              Unix 时间戳（Unix timestamp），又称 Unix 时间、POSIX 时间，是从
              1970 年 1 月 1 日 00:00:00 UTC
              起至现在的总秒数（或毫秒数）。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                  秒级时间戳
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  10 位数字，精确到秒，如 1700000000
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                  毫秒级时间戳
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  13 位数字，精确到毫秒，如1700000000000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
