"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CalendarCheck, Plus, Trash2, Calendar, Heart, Star, Gift } from "lucide-react";

interface Event {
  id: string;
  name: string;
  date: string;
  emoji: string;
}

const DEFAULT_EVENTS: Event[] = [
  { id: "newyear", name: "新年", date: `${new Date().getFullYear() + 1}-01-01`, emoji: "🎉" },
  { id: "spring", name: "春节", date: `${new Date().getFullYear() + 1}-02-17`, emoji: "🧧" },
];

const EMOJI_OPTIONS = ["🎉", "🎂", " anniversary", "💍", "❤️", "🎁", "✈️", "🎓", "🏆", "🎄"];

export default function CountdownEventPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎉");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem("countdown-events");
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch {
        setEvents(DEFAULT_EVENTS);
      }
    } else {
      setEvents(DEFAULT_EVENTS);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("countdown-events", JSON.stringify(events));
    }
  }, [events]);

  const addEvent = () => {
    if (!newName.trim() || !newDate) return;
    setEvents((prev) => [
      ...prev,
      {
        id: `event-${Date.now()}`,
        name: newName.trim(),
        date: newDate,
        emoji: newEmoji,
      },
    ]);
    setNewName("");
    setNewDate("");
    setNewEmoji("🎉");
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const getCountdown = (dateStr: string) => {
    const target = new Date(dateStr + "T00:00:00");
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds, isPast: diff < 0 };
  };

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <ToolLayout
      title="纪念日倒计时"
      description="记录重要日子倒计时，生日、纪念日、节日一目了然"
      icon={CalendarCheck}
      category="生活工具"
      slug="countdown-event"
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Add event form */}
        <div className="bg-[#27272a] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Plus className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-semibold text-white">添加纪念日</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="事件名称"
              className="flex-1 px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">选择图标:</span>
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setNewEmoji(emoji)}
                className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                  newEmoji === emoji
                    ? "bg-primary-500/20 border border-primary-500"
                    : "bg-[#18181b] border border-[#3f3f46] hover:border-[#52525b]"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            onClick={addEvent}
            disabled={!newName.trim() || !newDate}
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>

        {/* Events list */}
        <div className="space-y-3">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">还没有添加纪念日，快来添加第一个吧</p>
            </div>
          ) : (
            sortedEvents.map((event) => {
              const cd = getCountdown(event.date);
              return (
                <div
                  key={event.id}
                  className="bg-gradient-to-br from-[#27272a] to-[#18181b] rounded-xl p-4 border border-[#3f3f46] relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{event.emoji}</span>
                      <div>
                        <h3 className="text-base font-bold text-white">{event.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {cd.isPast ? (
                    <div className="text-center py-2">
                      <p className="text-2xl font-bold text-slate-500">
                        已过 {Math.abs(cd.days)} 天
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-[#18181b] rounded-lg p-2.5 text-center">
                        <p className="text-xl font-bold text-primary-400">{cd.days}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">天</p>
                      </div>
                      <div className="bg-[#18181b] rounded-lg p-2.5 text-center">
                        <p className="text-xl font-bold text-primary-400">{cd.hours}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">时</p>
                      </div>
                      <div className="bg-[#18181b] rounded-lg p-2.5 text-center">
                        <p className="text-xl font-bold text-primary-400">{cd.minutes}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">分</p>
                      </div>
                      <div className="bg-[#18181b] rounded-lg p-2.5 text-center">
                        <p className="text-xl font-bold text-primary-400">{cd.seconds}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">秒</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
