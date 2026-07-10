"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Plane, Search } from "lucide-react";

interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
}

const AIRPORTS: Airport[] = [
  { iata: "PEK", icao: "ZBAA", name: "北京首都国际机场", city: "北京", country: "中国" },
  { iata: "PVG", icao: "ZSPD", name: "上海浦东国际机场", city: "上海", country: "中国" },
  { iata: "CAN", icao: "ZGGG", name: "广州白云国际机场", city: "广州", country: "中国" },
  { iata: "SZX", icao: "ZGSZ", name: "深圳宝安国际机场", city: "深圳", country: "中国" },
  { iata: "CTU", icao: "ZUUU", name: "成都双流国际机场", city: "成都", country: "中国" },
  { iata: "HKG", icao: "VHHH", name: "香港国际机场", city: "香港", country: "中国" },
  { iata: "TPE", icao: "RCTP", name: "桃园国际机场", city: "台北", country: "中国台湾" },
  { iata: "NRT", icao: "RJAA", name: "成田国际机场", city: "东京", country: "日本" },
  { iata: "ICN", icao: "RKSI", name: "仁川国际机场", city: "首尔", country: "韩国" },
  { iata: "SIN", icao: "WSSS", name: "樟宜机场", city: "新加坡", country: "新加坡" },
  { iata: "BKK", icao: "VTBS", name: "素万那普机场", city: "曼谷", country: "泰国" },
  { iata: "LHR", icao: "EGLL", name: "希思罗机场", city: "伦敦", country: "英国" },
  { iata: "CDG", icao: "LFPG", name: "戴高乐机场", city: "巴黎", country: "法国" },
  { iata: "FRA", icao: "EDDF", name: "法兰克福机场", city: "法兰克福", country: "德国" },
  { iata: "AMS", icao: "EHAM", name: "史基浦机场", city: "阿姆斯特丹", country: "荷兰" },
  { iata: "JFK", icao: "KJFK", name: "肯尼迪国际机场", city: "纽约", country: "美国" },
  { iata: "LAX", icao: "KLAX", name: "洛杉矶国际机场", city: "洛杉矶", country: "美国" },
  { iata: "SFO", icao: "KSFO", name: "旧金山国际机场", city: "旧金山", country: "美国" },
  { iata: "ORD", icao: "KORD", name: "奥黑尔国际机场", city: "芝加哥", country: "美国" },
  { iata: "ATL", icao: "KATL", name: "哈茨菲尔德机场", city: "亚特兰大", country: "美国" },
  { iata: "YYZ", icao: "CYYZ", name: "皮尔逊国际机场", city: "多伦多", country: "加拿大" },
  { iata: "SYD", icao: "YSSY", name: "金斯福特史密斯机场", city: "悉尼", country: "澳大利亚" },
  { iata: "DXB", icao: "OMDB", name: "迪拜国际机场", city: "迪拜", country: "阿联酋" },
  { iata: "IST", icao: "LTFM", name: "伊斯坦布尔机场", city: "伊斯坦布尔", country: "土耳其" },
  { iata: "MEX", icao: "MMMX", name: "贝尼托华雷斯机场", city: "墨西哥城", country: "墨西哥" },
  { iata: "GRU", icao: "SBGR", name: "圣保罗机场", city: "圣保罗", country: "巴西" },
  { iata: "JNB", icao: "FAOR", name: "奥利弗坦博机场", city: "约翰内斯堡", country: "南非" },
  { iata: "DEL", icao: "VIDP", name: "英迪拉甘地机场", city: "新德里", country: "印度" },
  { iata: "CGK", icao: "WIII", name: "苏加诺哈达机场", city: "雅加达", country: "印度尼西亚" },
  { iata: "KUL", icao: "WMKK", name: "吉隆坡国际机场", city: "吉隆坡", country: "马来西亚" },
];

export default function AirportCodesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return AIRPORTS;
    const q = query.toLowerCase();
    return AIRPORTS.filter(
      (a) =>
        a.iata.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <ToolLayout title="机场代码查询" description="查询全球机场的IATA三字代码和城市信息" icon={Plane} category="查询工具" slug="airport-codes">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索机场代码、城市或名称..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">
          共 {filtered.length} 条结果
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#27272a] text-slate-400">
                <th className="text-left py-3 px-3 font-medium">IATA</th>
                <th className="text-left py-3 px-3 font-medium">ICAO</th>
                <th className="text-left py-3 px-3 font-medium">机场名称</th>
                <th className="text-left py-3 px-3 font-medium">城市</th>
                <th className="text-left py-3 px-3 font-medium">国家/地区</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((airport) => (
                <tr key={airport.iata} className="border-b border-[#1e1e21] hover:bg-[#1c1c1f] transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-primary-400">{airport.iata}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{airport.icao}</td>
                  <td className="py-3 px-3 text-white">{airport.name}</td>
                  <td className="py-3 px-3 text-slate-300">{airport.city}</td>
                  <td className="py-3 px-3 text-slate-400">{airport.country}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            未找到匹配的机场，请尝试其他关键词
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
