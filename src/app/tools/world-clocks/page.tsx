"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Clock } from "lucide-react";

const CITIES = [
  { name: "北京", timezone: 8, flag: "🇨🇳" },
  { name: "东京", timezone: 9, flag: "🇯🇵" },
  { name: "首尔", timezone: 9, flag: "🇰🇷" },
  { name: "新加坡", timezone: 8, flag: "🇸🇬" },
  { name: "曼谷", timezone: 7, flag: "🇹🇭" },
  { name: "迪拜", timezone: 4, flag: "🇦🇪" },
  { name: "莫斯科", timezone: 3, flag: "🇷🇺" },
  { name: "伦敦", timezone: 0, flag: "🇬🇧" },
  { name: "巴黎", timezone: 1, flag: "🇫🇷" },
  { name: "柏林", timezone: 1, flag: "🇩🇪" },
  { name: "纽约", timezone: -5, flag: "🇺🇸" },
  { name: "芝加哥", timezone: -6, flag: "🇺🇸" },
  { name: "洛杉矶", timezone: -8, flag: "🇺🇸" },
  { name: "多伦多", timezone: -5, flag: "🇨🇦" },
  { name: "墨西哥城", timezone: -6, flag: "🇲🇽" },
  { name: "圣保罗", timezone: -3, flag: "🇧🇷" },
  { name: "悉尼", timezone: 10, flag: "🇦🇺" },
  { name: "奥克兰", timezone: 12, flag: "🇳🇿" },
  { name: "开罗", timezone: 2, flag: "🇪🇬" },
  { name: "约翰内斯堡", timezone: 2, flag: "🇿🇦" },
  { name: "新德里", timezone: 5.5, flag: "🇮🇳" },
  { name: "雅加达", timezone: 7, flag: "🇮🇩" },
];

function getCityTime(timezone: number, now: Date): string {
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + timezone * 3600000);
  const h = String(cityTime.getHours()).padStart(2, "0");
  const m = String(cityTime.getMinutes()).padStart(2, "0");
  const s = String(cityTime.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function getCityDate(timezone: number, now: Date): string {
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + timezone * 3600000);
  return `${cityTime.getFullYear()}年${cityTime.getMonth() + 1}月${cityTime.getDate()}日`;
}

export default function WorldClocksPage() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <ToolLayout title="世界时钟" description="同时查看全球多个城市的当前时间" icon={Clock} category="查询工具" slug="world-clocks">
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.map((city) => (
            <div key={city.name} className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{city.flag}</span>
                  <span className="text-white font-medium">{city.name}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">UTC{city.timezone >= 0 ? "+" : ""}{city.timezone}</span>
              </div>
              <div className="text-3xl font-bold font-mono text-primary-400 mb-1">{getCityTime(city.timezone, now)}</div>
              <div className="text-sm text-slate-500">{getCityDate(city.timezone, now)}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
