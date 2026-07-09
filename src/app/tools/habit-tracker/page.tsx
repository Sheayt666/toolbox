"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CheckSquare, Plus, Trash2, Flame, Target, Calendar } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  records: string[]; // YYYY-MM-DD format
  createdAt: string;
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function getDateStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(getDateStr(d));
  }
  return days;
}

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [daysToShow] = useState(14);

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const saved = localStorage.getItem("habit-tracker-data");
      if (saved) {
        setHabits(JSON.parse(saved));
      } else {
        // 默认习惯
        setHabits([
          { id: "1", name: "早起", records: [], createdAt: getTodayStr() },
          { id: "2", name: "运动", records: [], createdAt: getTodayStr() },
          { id: "3", name: "阅读", records: [], createdAt: getTodayStr() },
          { id: "4", name: "喝水", records: [], createdAt: getTodayStr() },
        ]);
      }
    } catch {
      // ignore
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem("habit-tracker-data", JSON.stringify(habits));
    }
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      records: [],
      createdAt: getTodayStr(),
    };
    setHabits((prev) => [...prev, newHabit]);
    setNewHabitName("");
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabit = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const hasRecord = h.records.includes(dateStr);
        return {
          ...h,
          records: hasRecord
            ? h.records.filter((r) => r !== dateStr)
            : [...h.records, dateStr],
        };
      })
    );
  };

  const lastNDays = getLastNDays(daysToShow);
  const today = getTodayStr();

  // 统计今日完成数
  const todayCompleted = habits.filter((h) => h.records.includes(today)).length;

  // 计算连续打卡天数
  const getStreak = (habit: Habit): number => {
    let streak = 0;
    const d = new Date();
    // 从今天开始往前数
    while (true) {
      const dateStr = getDateStr(d);
      if (habit.records.includes(dateStr)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (dateStr === today) {
        // 今天还没打卡，从昨天开始算
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <ToolLayout
      title="习惯打卡"
      description="每日习惯打卡追踪，培养好习惯，可视化记录你的坚持历程"
      icon={CheckSquare}
      category="生活工具"
      slug="habit-tracker"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 今日概览 */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/25">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70 mb-1">今日打卡</div>
              <div className="text-4xl font-bold">
                {todayCompleted}
                <span className="text-xl text-white/60 ml-1">/ {habits.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Flame className="w-8 h-8 mx-auto mb-1 text-orange-300" />
                <div className="text-xs text-white/70">坚持</div>
              </div>
              <div className="text-center">
                <Target className="w-8 h-8 mx-auto mb-1 text-green-300" />
                <div className="text-xs text-white/70">达成率</div>
              </div>
            </div>
          </div>
          {/* 进度条 */}
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all duration-500"
              style={{ width: `${habits.length > 0 ? (todayCompleted / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* 添加习惯 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-violet-400" />
            我的习惯
          </h3>

          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              placeholder="添加新习惯..."
              className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
            />
            <button
              onClick={addHabit}
              disabled={!newHabitName.trim()}
              className="px-4 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 习惯列表 */}
          {habits.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">暂无习惯，添加第一个习惯开始打卡吧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const streak = getStreak(habit);
                const isCompletedToday = habit.records.includes(today);
                return (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompletedToday
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-[#09090b] border-[#27272a]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleHabit(habit.id, today)}
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isCompletedToday
                              ? "bg-violet-500 border-violet-500 text-white"
                              : "border-[#27272a] hover:border-violet-500"
                          }`}
                        >
                          {isCompletedToday && <span className="text-sm">✓</span>}
                        </button>
                        <span className={`font-medium ${isCompletedToday ? "text-violet-400" : "text-white"}`}>
                          {habit.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {streak > 0 && (
                          <span className="text-xs text-orange-400 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5" />
                            {streak}天
                          </span>
                        )}
                        <button
                          onClick={() => removeHabit(habit.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 打卡日历 */}
                    <div className="flex gap-1 ml-10">
                      {lastNDays.map((dateStr) => {
                        const isChecked = habit.records.includes(dateStr);
                        const isToday = dateStr === today;
                        return (
                          <button
                            key={dateStr}
                            onClick={() => toggleHabit(habit.id, dateStr)}
                            className={`flex-1 h-6 rounded-md transition-all text-[10px] ${
                              isChecked
                                ? "bg-violet-500 text-white"
                                : "bg-[#27272a] text-slate-600 hover:bg-[#3f3f46]"
                            } ${isToday ? "ring-1 ring-violet-400" : ""}`}
                            title={dateStr}
                          >
                            {new Date(dateStr).getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 日期说明 */}
        <div className="flex items-center justify-between px-2 text-xs text-slate-500">
          <span>{lastNDays[0] ? new Date(lastNDays[0]).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) : ""}</span>
          <Calendar className="w-4 h-4" />
          <span>今天</span>
        </div>

        {/* 小贴士 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">培养习惯的小贴士</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>1. 从小目标开始，先坚持21天形成习惯</p>
            <p>2. 每天固定时间进行，比如早起后或睡前</p>
            <p>3. 不要因为中断一天而放弃，重要的是长期坚持</p>
            <p>4. 数据保存在本地浏览器中，清除浏览器数据会丢失</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
