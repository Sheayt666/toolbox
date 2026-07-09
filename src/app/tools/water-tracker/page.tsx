"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Droplets, Plus, Minus, Target, RotateCcw, GlassWater } from "lucide-react";

interface WaterLog {
  id: string;
  amount: number; // ml
  time: string;
  date: string;
}

const presetAmounts = [100, 200, 250, 300, 500];

export default function WaterTrackerPage() {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [target, setTarget] = useState(2000); // ml
  const [customAmount, setCustomAmount] = useState("");
  const today = new Date().toISOString().split("T")[0];

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem("water-tracker-logs");
      const savedTarget = localStorage.getItem("water-tracker-target");
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedTarget) setTarget(parseInt(savedTarget));
    } catch {
      // ignore
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem("water-tracker-logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("water-tracker-target", String(target));
  }, [target]);

  const addWater = (amount: number) => {
    const now = new Date();
    const newLog: WaterLog = {
      id: Date.now().toString(),
      amount,
      time: now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      date: today,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const addCustom = () => {
    const amt = parseInt(customAmount);
    if (amt > 0) {
      addWater(amt);
      setCustomAmount("");
    }
  };

  const removeLog = (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const resetToday = () => {
    setLogs((prev) => prev.filter((l) => l.date !== today));
  };

  // 今日喝水量
  const todayLogs = logs.filter((l) => l.date === today);
  const totalWater = todayLogs.reduce((s, l) => s + l.amount, 0);
  const progressPercent = Math.min((totalWater / target) * 100, 100);
  const remaining = Math.max(0, target - totalWater);
  const isGoalReached = totalWater >= target;
  const glassCount = Math.floor(totalWater / 250); // 按250ml一杯算

  return (
    <ToolLayout
      title="喝水打卡提醒"
      description="每日喝水打卡记录，追踪饮水量，养成健康饮水好习惯"
      icon={Droplets}
      category="生活工具"
      slug="water-tracker"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 今日概览 */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-500/25">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-white/70 mb-1">今日饮水</div>
              <div className="text-4xl font-bold">
                {totalWater}
                <span className="text-xl text-white/60 ml-1">ml</span>
              </div>
              <div className="text-sm text-white/70 mt-1">
                约 {glassCount} 杯 (250ml/杯)
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70 mb-1">每日目标</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(Math.max(500, parseInt(e.target.value) || 2000))}
                  className="w-20 bg-transparent border-b border-white/30 text-right text-xl font-bold focus:outline-none focus:border-white/60"
                />
                <span className="text-sm text-white/60">ml</span>
              </div>
            </div>
          </div>

          {/* 水杯可视化 */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-36 bg-white/10 rounded-b-3xl rounded-t-lg border-2 border-white/30 overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-300 to-cyan-100/80 transition-all duration-500"
                style={{ height: `${progressPercent}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold drop-shadow-lg">
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalReached ? "bg-emerald-300" : "bg-white/80"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className={isGoalReached ? "text-emerald-200" : "text-white/70"}>
              {isGoalReached ? "🎉 目标达成！" : `还差 ${remaining}ml`}
            </span>
            <span className="text-white/70">{totalWater}/{target}ml</span>
          </div>
        </div>

        {/* 快速添加 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <GlassWater className="w-5 h-5 text-cyan-400" />
            快速记录
          </h3>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => addWater(amt)}
                className="py-4 bg-[#09090b] hover:bg-cyan-500/20 border border-[#27272a] hover:border-cyan-500/30 rounded-xl transition-all text-center group"
              >
                <Droplets className="w-6 h-6 mx-auto mb-1 text-cyan-400 group-hover:scale-110 transition-transform" />
                <div className="text-sm text-white font-medium">{amt}</div>
                <div className="text-xs text-slate-500">ml</div>
              </button>
            ))}
          </div>

          {/* 自定义量 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                placeholder="自定义水量"
                className="w-full px-4 py-3 pr-12 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">ml</span>
            </div>
            <button
              onClick={addCustom}
              disabled={!customAmount || parseInt(customAmount) <= 0}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              添加
            </button>
          </div>
        </div>

        {/* 今日记录 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              今日记录
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{todayLogs.length} 次</span>
              {todayLogs.length > 0 && (
                <button
                  onClick={resetToday}
                  className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  重置
                </button>
              )}
            </div>
          </div>

          {todayLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">今天还没喝水，来一杯吧</p>
            </div>
          ) : (
            <div className="divide-y divide-[#27272a] max-h-64 overflow-y-auto">
              {todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#09090b] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <GlassWater className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">喝了 {log.amount}ml 水</div>
                    <div className="text-xs text-slate-500">{log.time}</div>
                  </div>
                  <div className="text-sm text-cyan-400 font-medium">+{log.amount}ml</div>
                  <button
                    onClick={() => removeLog(log.id)}
                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 饮水建议 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            饮水小知识
          </h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>• 成年人每日推荐饮水量约 1500-2000ml</p>
            <p>• 不要等到口渴才喝水，应定时定量饮水</p>
            <p>• 晨起一杯温水，有助于唤醒身体代谢</p>
            <p>• 运动前后要注意补充水分和电解质</p>
            <p>• 数据保存在浏览器本地存储中</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
