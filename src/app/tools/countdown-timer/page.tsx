"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Timer, Play, Pause, RotateCcw, Plus, Trash2, Info, Clock, AlarmClock } from "lucide-react";

interface LapRecord {
  index: number;
  time: number;
  diff: number;
}

interface CountdownItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  isFinished: boolean;
}

function formatTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds)}`;
}

function formatTimeSimple(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export default function CountdownTimerPage() {
  const [activeTab, setActiveTab] = useState<"stopwatch" | "countdown">("stopwatch");

  // 秒表
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const lastLapTime = useRef(0);
  const stopwatchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);

  // 倒计时
  const [countdowns, setCountdowns] = useState<CountdownItem[]>([]);
  const [newMinutes, setNewMinutes] = useState(5);
  const [newLabel, setNewLabel] = useState("");

  // 秒表逻辑
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(
          accumulatedTimeRef.current + (Date.now() - startTimeRef.current)
        );
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
        accumulatedTimeRef.current = stopwatchTime;
      }
    }

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isRunning]);

  // 倒计时逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns((prev) =>
        prev.map((cd) => {
          if (!cd.isRunning || cd.isFinished) return cd;
          const newRemaining = cd.remainingSeconds - 1;
          if (newRemaining <= 0) {
            return { ...cd, remainingSeconds: 0, isRunning: false, isFinished: true };
          }
          return { ...cd, remainingSeconds: newRemaining };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartStop = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStopwatchTime(0);
    setLaps([]);
    lastLapTime.current = 0;
    accumulatedTimeRef.current = 0;
  }, []);

  const handleLap = useCallback(() => {
    if (!isRunning) return;
    const diff = stopwatchTime - lastLapTime.current;
    setLaps((prev) => [
      { index: prev.length + 1, time: stopwatchTime, diff },
      ...prev,
    ]);
    lastLapTime.current = stopwatchTime;
  }, [isRunning, stopwatchTime]);

  const toggleCountdown = (id: string) => {
    setCountdowns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.isFinished) return { ...c, remainingSeconds: c.totalSeconds, isFinished: false, isRunning: true };
        return { ...c, isRunning: !c.isRunning };
      })
    );
  };

  const resetCountdown = (id: string) => {
    setCountdowns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, remainingSeconds: c.totalSeconds, isRunning: false, isFinished: false }
          : c
      )
    );
  };

  const deleteCountdown = (id: string) => {
    setCountdowns((prev) => prev.filter((c) => c.id !== id));
  };

  const addCountdown = () => {
    if (newMinutes <= 0) return;
    const totalSeconds = newMinutes * 60;
    setCountdowns((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: newLabel || `倒计时${prev.length + 1}`,
        totalSeconds,
        remainingSeconds: totalSeconds,
        isRunning: false,
        isFinished: false,
      },
    ]);
    setNewLabel("");
  };

  const presets = [1, 3, 5, 10, 15, 25, 30, 60];

  return (
    <ToolLayout
      title="倒计时/计时器"
      description="在线倒计时和秒表功能，支持多组倒计时、精准秒表计时，满足学习工作运动等多种场景"
      toolId="countdown-timer"
      icon={Timer}
      category="生活工具"
      slug="countdown-timer"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 模式切换 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                计时工具
              </h2>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <button
                onClick={() => setActiveTab("stopwatch")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "stopwatch"
                    ? "bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <Clock className="w-4 h-4" />
                秒表
              </button>
              <button
                onClick={() => setActiveTab("countdown")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "countdown"
                    ? "bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <AlarmClock className="w-4 h-4" />
                倒计时
              </button>
            </div>
          </div>
        </div>

        {/* 秒表模式 */}
        {activeTab === "stopwatch" && (
          <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl p-8 text-white shadow-lg shadow-amber-500/25">
            <div className="text-center mb-8">
              <div className="text-6xl sm:text-7xl font-mono font-light tracking-wider mb-8">
                {formatTime(stopwatchTime)}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  title="重置"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button
                  onClick={handleStartStop}
                  className="p-6 bg-white text-amber-600 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
                  title={isRunning ? "暂停" : "开始"}
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>
                <button
                  onClick={handleLap}
                  disabled={!isRunning}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="计次"
                >
                  <Timer className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 计次记录 */}
            {laps.length > 0 && (
              <div className="mt-6 max-h-64 overflow-y-auto">
                <div className="text-sm text-amber-100 mb-2">计次记录</div>
                <div className="space-y-1">
                  {laps.map((lap) => (
                    <div
                      key={lap.index}
                      className="flex items-center justify-between py-2 px-3 bg-white/10 rounded-lg"
                    >
                      <span className="text-sm">#{lap.index}</span>
                      <span className="font-mono text-sm">
                        +{formatTime(lap.diff)}
                      </span>
                      <span className="font-mono text-sm text-amber-100">
                        {formatTime(lap.time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 倒计时模式 */}
        {activeTab === "countdown" && (
          <div className="space-y-4">
            {/* 添加倒计时 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="标签（可选）"
                  className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                />
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                    <input
                      type="number"
                      value={newMinutes}
                      onChange={(e) => setNewMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 bg-transparent text-zinc-900 dark:text-white text-center font-mono outline-none"
                      min="0"
                    />
                    <span className="text-sm text-zinc-500">分钟</span>
                  </div>
                  <button
                    onClick={addCountdown}
                    className="px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">快捷:</span>
                {presets.map((m) => (
                  <button
                    key={m}
                    onClick={() => setNewMinutes(m)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                      newMinutes === m
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                    }`}
                  >
                    {m}分钟
                  </button>
                ))}
              </div>
            </div>

            {/* 倒计时列表 */}
            <div className="space-y-3">
              {countdowns.map((cd) => (
                <div
                  key={cd.id}
                  className={`bg-white dark:bg-zinc-900 rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    cd.isFinished
                      ? "border-emerald-300 dark:border-emerald-700"
                      : cd.isRunning
                      ? "border-amber-300 dark:border-amber-700"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {cd.label}
                      </span>
                      <button
                        onClick={() => deleteCountdown(cd.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div
                      className={`text-4xl font-mono font-semibold mb-4 ${
                        cd.isFinished
                          ? "text-emerald-600 dark:text-emerald-400"
                          : cd.isRunning
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {formatTimeSimple(cd.remainingSeconds)}
                    </div>

                    {/* 进度条 */}
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cd.isFinished
                            ? "bg-emerald-500"
                            : cd.isRunning
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                            : "bg-zinc-300 dark:bg-zinc-600"
                        }`}
                        style={{
                          width: `${((cd.totalSeconds - cd.remainingSeconds) / cd.totalSeconds) * 100}%`,
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCountdown(cd.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          cd.isFinished
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                            : cd.isRunning
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {cd.isFinished ? (
                          <><RotateCcw className="w-4 h-4" /> 重新开始</>
                        ) : cd.isRunning ? (
                          <><Pause className="w-4 h-4" /> 暂停</>
                        ) : (
                          <><Play className="w-4 h-4" /> 开始</>
                        )}
                      </button>
                      <button
                        onClick={() => resetCountdown(cd.id)}
                        className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {countdowns.length === 0 && (
              <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                <AlarmClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无倒计时，点击上方按钮添加</p>
              </div>
            )}
          </div>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              倒计时/计时器是一款实用的在线计时工具，包含秒表和倒计时两种模式。
              秒表模式支持精确到10毫秒的计时和计次记录；倒计时模式支持多组倒计时同时运行，
              适用于番茄工作法、运动计时、学习计时等多种场景。
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                秒表计时精度是多少？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                本工具的秒表模式精度为10毫秒，即显示两位小数的秒数。
                受浏览器刷新频率限制，实际精度可能略有差异。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                可以同时运行多个倒计时吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                可以。您可以添加任意数量的倒计时，每个倒计时都可以独立运行和控制。
                适合需要同时追踪多个任务时间的场景。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                刷新页面后数据会丢失吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                是的，刷新页面后秒表和倒计时数据会重置。
                如需长期保存计时数据，建议不要关闭或刷新页面。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
