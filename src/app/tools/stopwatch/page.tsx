"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Clock, Play, Pause, RotateCcw, Flag, Trash2 } from "lucide-react";

interface Lap {
  index: number;
  time: number;
  lapTime: number;
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

export default function StopwatchPage() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const lastLapTimeRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTime(accumulatedTimeRef.current + (Date.now() - startTimeRef.current));
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        accumulatedTimeRef.current = time;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartStop = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    accumulatedTimeRef.current = 0;
    lastLapTimeRef.current = 0;
  }, []);

  const handleLap = useCallback(() => {
    if (!isRunning && time === 0) return;
    const currentTime = isRunning ? accumulatedTimeRef.current + (Date.now() - startTimeRef.current) : time;
    const lapTime = currentTime - lastLapTimeRef.current;
    setLaps((prev) => [
      { index: prev.length + 1, time: currentTime, lapTime },
      ...prev,
    ]);
    lastLapTimeRef.current = currentTime;
  }, [isRunning, time]);

  const fastestLap = laps.length > 1 ? laps.reduce((min, lap) => lap.lapTime < min.lapTime ? lap : min, laps[0]) : null;
  const slowestLap = laps.length > 1 ? laps.reduce((max, lap) => lap.lapTime > max.lapTime ? lap : max, laps[0]) : null;

  return (
    <ToolLayout
      title="秒表计时器"
      description="高精度在线秒表，支持计次记录，精确到10毫秒，适用于运动、实验等计时场景"
      icon={Clock}
      category="生活工具"
      slug="stopwatch"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 主计时区 */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg shadow-cyan-500/25">
          <div className="text-center mb-8">
            <div className="text-6xl sm:text-7xl font-mono font-light tracking-wider mb-8">
              {formatTime(time)}
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                disabled={time === 0 && laps.length === 0}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="重置"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={handleStartStop}
                className="p-6 bg-white text-cyan-600 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </button>
              <button
                onClick={handleLap}
                disabled={!isRunning && time === 0}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="计次"
              >
                <Flag className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* 计次记录 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-semibold text-white">计次记录</h3>
            </div>
            {laps.length > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清除
              </button>
            )}
          </div>

          {laps.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-sm text-slate-500">暂无计次记录</p>
              <p className="text-xs text-slate-600 mt-1">点击计次按钮开始记录</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {/* 表头 */}
              <div className="px-4 py-2 bg-[#09090b] border-b border-[#27272a] grid grid-cols-3 text-xs text-slate-500 font-medium">
                <span>序号</span>
                <span className="text-center">分段时间</span>
                <span className="text-right">总时间</span>
              </div>
              {laps.map((lap) => (
                <div
                  key={lap.index}
                  className={`px-4 py-3 grid grid-cols-3 text-sm border-b border-[#27272a]/50 last:border-b-0 ${
                    fastestLap?.index === lap.index
                      ? "bg-emerald-500/10"
                      : slowestLap?.index === lap.index
                      ? "bg-rose-500/10"
                      : ""
                  }`}
                >
                  <span className="text-slate-400 font-mono">#{lap.index}</span>
                  <span className={`text-center font-mono ${
                    fastestLap?.index === lap.index
                      ? "text-emerald-400"
                      : slowestLap?.index === lap.index
                      ? "text-rose-400"
                      : "text-white"
                  }`}>
                    {formatTime(lap.lapTime)}
                  </span>
                  <span className="text-right font-mono text-slate-300">
                    {formatTime(lap.time)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {laps.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-4 text-center">
              <div className="text-xs text-slate-500 mb-1">总次数</div>
              <div className="text-xl font-bold text-white">{laps.length}</div>
            </div>
            <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-4 text-center">
              <div className="text-xs text-slate-500 mb-1">最快</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                {fastestLap ? formatTime(fastestLap.lapTime) : "--"}
              </div>
            </div>
            <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-4 text-center">
              <div className="text-xs text-slate-500 mb-1">最慢</div>
              <div className="text-lg font-mono font-bold text-rose-400">
                {slowestLap ? formatTime(slowestLap.lapTime) : "--"}
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">使用说明</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>1. 点击播放按钮开始计时，点击暂停按钮暂停计时</p>
            <p>2. 点击旗帜图标记录计次，系统会记录分段时间和总时间</p>
            <p>3. 绿色高亮表示最快分段，红色高亮表示最慢分段</p>
            <p>4. 点击重置按钮可清除所有记录重新开始</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
