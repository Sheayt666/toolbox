"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Globe, Clock, Plus, Trash2, Search } from "lucide-react";

interface City {
  name: string;
  timezone: string;
  country: string;
}

const popularCities: City[] = [
  { name: "北京", timezone: "Asia/Shanghai", country: "中国" },
  { name: "上海", timezone: "Asia/Shanghai", country: "中国" },
  { name: "香港", timezone: "Asia/Hong_Kong", country: "中国" },
  { name: "东京", timezone: "Asia/Tokyo", country: "日本" },
  { name: "首尔", timezone: "Asia/Seoul", country: "韩国" },
  { name: "新加坡", timezone: "Asia/Singapore", country: "新加坡" },
  { name: "曼谷", timezone: "Asia/Bangkok", country: "泰国" },
  { name: "迪拜", timezone: "Asia/Dubai", country: "阿联酋" },
  { name: "孟买", timezone: "Asia/Kolkata", country: "印度" },
  { name: "莫斯科", timezone: "Europe/Moscow", country: "俄罗斯" },
  { name: "伦敦", timezone: "Europe/London", country: "英国" },
  { name: "巴黎", timezone: "Europe/Paris", country: "法国" },
  { name: "柏林", timezone: "Europe/Berlin", country: "德国" },
  { name: "罗马", timezone: "Europe/Rome", country: "意大利" },
  { name: "纽约", timezone: "America/New_York", country: "美国" },
  { name: "洛杉矶", timezone: "America/Los_Angeles", country: "美国" },
  { name: "芝加哥", timezone: "America/Chicago", country: "美国" },
  { name: "多伦多", timezone: "America/Toronto", country: "加拿大" },
  { name: "温哥华", timezone: "America/Vancouver", country: "加拿大" },
  { name: "悉尼", timezone: "Australia/Sydney", country: "澳大利亚" },
  { name: "墨尔本", timezone: "Australia/Melbourne", country: "澳大利亚" },
  { name: "奥克兰", timezone: "Pacific/Auckland", country: "新西兰" },
  { name: "圣保罗", timezone: "America/Sao_Paulo", country: "巴西" },
  { name: "开罗", timezone: "Africa/Cairo", country: "埃及" },
];

export default function WorldClockPage() {
  const [now, setNow] = useState(new Date());
  const [selectedCities, setSelectedCities] = useState<City[]>([
    popularCities[0], // 北京
    popularCities[14], // 纽约
    popularCities[10], // 伦敦
    popularCities[3], // 东京
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCityList, setShowCityList] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = (timezone: string) => {
    try {
      return now.toLocaleTimeString("zh-CN", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch {
      return "--:--:--";
    }
  };

  const getDateInTimezone = (timezone: string) => {
    try {
      return now.toLocaleDateString("zh-CN", {
        timeZone: timezone,
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    } catch {
      return "--";
    }
  };

  const getTimeDiff = (timezone: string) => {
    try {
      const localOffset = now.getTimezoneOffset() * 60000;
      const targetTime = new Date(now.toLocaleString("en-US", { timeZone: timezone })).getTime();
      const localTime = new Date(now.toLocaleString("en-US")).getTime();
      const diffHours = Math.round((targetTime - localTime) / 3600000);
      if (diffHours === 0) return "与本地相同";
      return diffHours > 0 ? `+${diffHours}小时` : `${diffHours}小时`;
    } catch {
      return "--";
    }
  };

  const isNightTime = (timezone: string) => {
    try {
      const hour = parseInt(now.toLocaleString("en-US", { timeZone: timezone, hour: "numeric", hour12: false }));
      return hour < 6 || hour >= 20;
    } catch {
      return false;
    }
  };

  const filteredCities = popularCities.filter(
    (c) =>
      (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedCities.some((s) => s.timezone === c.timezone && s.name === c.name)
  );

  const addCity = (city: City) => {
    if (selectedCities.length >= 8) return;
    setSelectedCities((prev) => [...prev, city]);
    setSearchQuery("");
    setShowCityList(false);
  };

  const removeCity = (index: number) => {
    setSelectedCities((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <ToolLayout
      title="世界时钟"
      description="查看全球主要城市的当前时间，多时区同时显示，跨时区沟通必备工具"
      icon={Globe}
      category="生活工具"
      slug="world-clock"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 本地时间 */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-500/25">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm text-white/80">本地时间</span>
            </div>
            <span className="text-xs text-white/60">
              {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </span>
          </div>
          <div className="text-5xl font-mono font-bold tracking-wider mb-2">
            {now.toLocaleTimeString("zh-CN", { hour12: false })}
          </div>
          <div className="text-white/70 text-sm">
            {now.toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </div>

        {/* 添加城市 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              世界时钟 ({selectedCities.length}/8)
            </h3>
            <button
              onClick={() => setShowCityList(!showCityList)}
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加城市
            </button>
          </div>

          {/* 城市搜索 */}
          {showCityList && (
            <div className="mb-4 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索城市..."
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {filteredCities.map((city) => (
                  <button
                    key={city.timezone + city.name}
                    onClick={() => addCity(city)}
                    disabled={selectedCities.length >= 8}
                    className="p-2 text-left bg-[#18181b] hover:bg-[#27272a] rounded-lg border border-[#27272a] transition-colors disabled:opacity-50"
                  >
                    <div className="text-sm text-white">{city.name}</div>
                    <div className="text-xs text-slate-500">{city.country}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 时钟列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedCities.map((city, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all ${
                  isNightTime(city.timezone)
                    ? "bg-indigo-950/50 border-indigo-900/50"
                    : "bg-[#09090b] border-[#27272a]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-white font-medium">{city.name}</div>
                    <div className="text-xs text-slate-500">{city.country}</div>
                  </div>
                  <button
                    onClick={() => removeCity(index)}
                    className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-2xl font-mono font-bold text-cyan-400">
                  {getTimeInTimezone(city.timezone)}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">
                    {getDateInTimezone(city.timezone)}
                  </span>
                  <span className="text-xs text-slate-600">
                    {getTimeDiff(city.timezone)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {selectedCities.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              点击上方"添加城市"按钮添加
            </div>
          )}
        </div>

        {/* 说明 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">使用说明</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>1. 本工具实时显示全球主要城市的当前时间</p>
            <p>2. 深蓝色背景表示当地处于夜间时段（20:00-06:00）</p>
            <p>3. 时差以您的本地时间为基准计算</p>
            <p>4. 支持添加最多8个城市同时查看</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
