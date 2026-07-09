"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Timer, Play, Pause, RotateCcw, Settings, Coffee, Brain, CheckCircle2 } from "lucide-react";

type Mode = "focus" | "shortBreak" | "longBreak";

interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
}

export default function PomodoroTimerPage() {
  const [mode, setMode] = useState<Mode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getModeTime = useCallback((m: Mode) => {
    switch (m) {
      case "focus": return settings.focusMinutes * 60;
      case "shortBreak": return settings.shortBreakMinutes * 60;
      case "longBreak": return settings.longBreakMinutes * 60;
    }
  }, [settings]);

  const getModeLabel = (m: Mode) => {
    switch (m) {
      case "focus": return "专注时间";
      case "shortBreak": return "短休息";
      case "longBreak": return "长休息";
    }
  };

  const getModeColor = (m: Mode) => {
    switch (m) {
      case "focus": return "from-rose-500 to-red-500";
      case "shortBreak": return "from-emerald-500 to-teal-500";
      case "longBreak": return "from-blue-500 to-indigo-500";
    }
  };

  const getModeBgColor = (m: Mode) => {
    switch (m) {
      case "focus": return "from-rose-600 to-red-600";
      case "shortBreak": return "from-emerald-600 to-teal-600";
      case "longBreak": return "from-blue-600 to-indigo-600";
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === "focus") {
              const newCount = completedPomodoros + 1;
              setCompletedPomodoros(newCount);
              if (newCount % settings.longBreakInterval === 0) {
                setMode("longBreak");
                setTimeLeft(settings.longBreakMinutes * 60);
              } else {
                setMode("shortBreak");
                setTimeLeft(settings.shortBreakMinutes * 60);
              }
            } else {
              setMode("focus");
              setTimeLeft(settings.focusMinutes * 60);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, completedPomodoros, settings]);

  const handleModeChange = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getModeTime(newMode));
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getModeTime(mode));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalTime = getModeTime(mode);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const handleSettingChange = (key: keyof Settings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    if (!isRunning) {
      setTimeLeft(getModeTime(mode));
    }
  };

  return (
    <ToolLayout
      title="番茄钟计时器"
      description="专注工作与休息交替的番茄工作法计时器，提升工作效率，保持专注力"
      icon={Timer}
      category="生活工具"
      slug="pomodoro-timer"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 主计时器 */}
        <div className={`bg-gradient-to-br ${getModeBgColor(mode)} rounded-2xl p-8 text-white shadow-lg`}>
          {/* 模式切换 */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {(["focus", "shortBreak", "longBreak"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-white/20 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {getModeLabel(m)}
              </button>
            ))}
          </div>

          {/* 时间显示 */}
          <div className="text-center mb-8">
            <div className="text-7xl font-mono font-bold tracking-wider mb-4">
              {formatTime(timeLeft)}
            </div>
            <div className="text-white/70 text-sm flex items-center justify-center gap-2">
              {mode === "focus" ? (
                <><Brain className="w-4 h-4" /> 保持专注</>
              ) : (
                <><Coffee className="w-4 h-4" /> 休息一下</>
              )}
            </div>
          </div>

          {/* 进度条 */}
          <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-8">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="重置"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-6 bg-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              {isRunning ? (
                <Pause className="w-8 h-8" style={{ color: mode === "focus" ? "#f43f5e" : mode === "shortBreak" ? "#10b981" : "#3b82f6" }} />
              ) : (
                <Play className="w-8 h-8 ml-1" style={{ color: mode === "focus" ? "#f43f5e" : mode === "shortBreak" ? "#10b981" : "#3b82f6" }} />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* 已完成番茄数 */}
          <div className="mt-8 text-center">
            <div className="text-white/70 text-sm mb-2">今日已完成</div>
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: Math.min(completedPomodoros, 8) }).map((_, i) => (
                <CheckCircle2 key={i} className="w-5 h-5 text-white/90" />
              ))}
              {completedPomodoros > 8 && (
                <span className="text-white/90 text-sm">+{completedPomodoros - 8}</span>
              )}
              {completedPomodoros === 0 && (
                <span className="text-white/50 text-sm">开始你的第一个番茄吧</span>
              )}
            </div>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              计时器设置
            </h3>
            <div className="space-y-4">
              {[
                { key: "focusMinutes" as const, label: "专注时长", unit: "分钟", icon: Brain, color: "text-rose-400" },
                { key: "shortBreakMinutes" as const, label: "短休息时长", unit: "分钟", icon: Coffee, color: "text-emerald-400" },
                { key: "longBreakMinutes" as const, label: "长休息时长", unit: "分钟", icon: Coffee, color: "text-blue-400" },
                { key: "longBreakInterval" as const, label: "长休息间隔", unit: "个番茄", icon: Timer, color: "text-purple-400" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={settings[item.key]}
                      onChange={(e) => handleSettingChange(item.key, Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-center font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      min="1"
                    />
                    <span className="text-xs text-slate-500 w-12">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 什么是番茄工作法 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">什么是番茄工作法？</h3>
          <div className="text-sm text-slate-400 space-y-3 leading-relaxed">
            <p>
              番茄工作法是一种时间管理方法，由弗朗西斯科·西里洛在1980年代后期发明。
              该方法使用定时器将工作分解为25分钟的间隔，中间短暂休息。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a]">
                <div className="text-rose-400 font-medium mb-1 text-sm">专注25分钟</div>
                <p className="text-xs text-slate-500">全神贯注于单一任务</p>
              </div>
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a]">
                <div className="text-emerald-400 font-medium mb-1 text-sm">短休息5分钟</div>
                <p className="text-xs text-slate-500">放松眼睛和大脑</p>
              </div>
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a]">
                <div className="text-blue-400 font-medium mb-1 text-sm">长休息15分钟</div>
                <p className="text-xs text-slate-500">每4个番茄后长休息</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
