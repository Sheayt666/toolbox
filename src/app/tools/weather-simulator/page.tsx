"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CloudSun, Search, Droplets, Wind, Eye, Thermometer } from "lucide-react";

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDir: string;
  visibility: number;
  pressure: number;
  forecast: { day: string; temp: number; condition: string; icon: string }[];
}

const WEATHER_DB: Record<string, WeatherData> = {
  "北京": { city: "北京", temp: 28, condition: "晴", icon: "☀️", humidity: 45, windSpeed: 12, windDir: "东南风", visibility: 15, pressure: 1013, forecast: [
    { day: "今天", temp: 28, condition: "晴", icon: "☀️" }, { day: "明天", temp: 30, condition: "多云", icon: "⛅" }, { day: "后天", temp: 26, condition: "小雨", icon: "🌧️" },
  ]},
  "上海": { city: "上海", temp: 32, condition: "多云", icon: "⛅", humidity: 68, windSpeed: 8, windDir: "东风", visibility: 10, pressure: 1010, forecast: [
    { day: "今天", temp: 32, condition: "多云", icon: "⛅" }, { day: "明天", temp: 33, condition: "晴", icon: "☀️" }, { day: "后天", temp: 31, condition: "雷阵雨", icon: "⛈️" },
  ]},
  "广州": { city: "广州", temp: 35, condition: "雷阵雨", icon: "⛈️", humidity: 82, windSpeed: 15, windDir: "南风", visibility: 6, pressure: 1005, forecast: [
    { day: "今天", temp: 35, condition: "雷阵雨", icon: "⛈️" }, { day: "明天", temp: 34, condition: "阵雨", icon: "🌧️" }, { day: "后天", temp: 33, condition: "多云", icon: "⛅" },
  ]},
  "深圳": { city: "深圳", temp: 33, condition: "阵雨", icon: "🌧️", humidity: 78, windSpeed: 10, windDir: "东南风", visibility: 8, pressure: 1008, forecast: [
    { day: "今天", temp: 33, condition: "阵雨", icon: "🌧️" }, { day: "明天", temp: 32, condition: "多云", icon: "⛅" }, { day: "后天", temp: 31, condition: "晴", icon: "☀️" },
  ]},
  "杭州": { city: "杭州", temp: 30, condition: "晴", icon: "☀️", humidity: 55, windSpeed: 6, windDir: "东北风", visibility: 12, pressure: 1015, forecast: [
    { day: "今天", temp: 30, condition: "晴", icon: "☀️" }, { day: "明天", temp: 31, condition: "多云", icon: "⛅" }, { day: "后天", temp: 29, condition: "小雨", icon: "🌧️" },
  ]},
  "成都": { city: "成都", temp: 27, condition: "阴", icon: "☁️", humidity: 70, windSpeed: 5, windDir: "北风", visibility: 9, pressure: 1012, forecast: [
    { day: "今天", temp: 27, condition: "阴", icon: "☁️" }, { day: "明天", temp: 28, condition: "阵雨", icon: "🌧️" }, { day: "后天", temp: 26, condition: "多云", icon: "⛅" },
  ]},
};

function generateWeather(city: string): WeatherData {
  if (WEATHER_DB[city]) return WEATHER_DB[city];
  const conditions = ["☀️ 晴", "⛅ 多云", "☁️ 阴", "🌧️ 阵雨", "⛈️ 雷阵雨"];
  const random = conditions[Math.floor(Math.random() * conditions.length)];
  const parts = random.split(" ");
  return { city, temp: Math.floor(Math.random() * 15 + 20), condition: parts[1], icon: parts[0], humidity: Math.floor(Math.random() * 50 + 40), windSpeed: Math.floor(Math.random() * 15 + 3), windDir: "微风", visibility: Math.floor(Math.random() * 10 + 5), pressure: Math.floor(Math.random() * 20 + 1000), forecast: [
    { day: "今天", temp: Math.floor(Math.random() * 15 + 20), condition: parts[1], icon: parts[0] }, { day: "明天", temp: Math.floor(Math.random() * 15 + 20), condition: "多云", icon: "⛅" }, { day: "后天", temp: Math.floor(Math.random() * 15 + 20), condition: "晴", icon: "☀️" },
  ]};
}

export default function WeatherSimulatorPage() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const handleQuery = () => {
    if (!city.trim()) return;
    setWeather(generateWeather(city.trim()));
  };

  return (
    <ToolLayout title="天气查询模拟" description="模拟天气查询界面" icon={CloudSun} category="查询工具" slug="weather-simulator">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="输入城市名称..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
          </div>
          <button onClick={handleQuery} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">查询</button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-slate-400">热门城市：</span>
          {Object.keys(WEATHER_DB).map((c) => (
            <button key={c} onClick={() => setCity(c)} className="px-3 py-1 text-xs bg-[#09090b] border border-[#27272a] rounded-lg text-primary-400 hover:border-primary-500/30 transition-colors">{c}</button>
          ))}
        </div>

        {weather && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{weather.city}</h3>
                  <p className="text-sm text-slate-400">{weather.condition}</p>
                </div>
                <div className="text-6xl">{weather.icon}</div>
              </div>
              <div className="text-5xl font-bold text-white mb-4">{weather.temp}°C</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400" /><div><div className="text-xs text-slate-500">湿度</div><div className="text-white text-sm">{weather.humidity}%</div></div></div>
                <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-cyan-400" /><div><div className="text-xs text-slate-500">风速</div><div className="text-white text-sm">{weather.windSpeed}km/h</div></div></div>
                <div className="flex items-center gap-2"><Eye className="w-4 h-4 text-emerald-400" /><div><div className="text-xs text-slate-500">能见度</div><div className="text-white text-sm">{weather.visibility}km</div></div></div>
                <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-400" /><div><div className="text-xs text-slate-500">气压</div><div className="text-white text-sm">{weather.pressure}hPa</div></div></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {weather.forecast.map((f, i) => (
                <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center">
                  <div className="text-sm text-slate-400 mb-2">{f.day}</div>
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <div className="text-white font-bold">{f.temp}°C</div>
                  <div className="text-xs text-slate-500">{f.condition}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400/80">本工具为模拟天气数据，非真实天气预报服务。</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
