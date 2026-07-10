"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Flag, Search } from "lucide-react";

interface Country {
  name: string;
  iso2: string;
  iso3: string;
  phoneCode: string;
  flag: string;
  capital: string;
}

const COUNTRIES: Country[] = [
  { name: "中国", iso2: "CN", iso3: "CHN", phoneCode: "+86", flag: "🇨🇳", capital: "北京" },
  { name: "美国", iso2: "US", iso3: "USA", phoneCode: "+1", flag: "🇺🇸", capital: "华盛顿" },
  { name: "日本", iso2: "JP", iso3: "JPN", phoneCode: "+81", flag: "🇯🇵", capital: "东京" },
  { name: "韩国", iso2: "KR", iso3: "KOR", phoneCode: "+82", flag: "🇰🇷", capital: "首尔" },
  { name: "英国", iso2: "GB", iso3: "GBR", phoneCode: "+44", flag: "🇬🇧", capital: "伦敦" },
  { name: "法国", iso2: "FR", iso3: "FRA", phoneCode: "+33", flag: "🇫🇷", capital: "巴黎" },
  { name: "德国", iso2: "DE", iso3: "DEU", phoneCode: "+49", flag: "🇩🇪", capital: "柏林" },
  { name: "意大利", iso2: "IT", iso3: "ITA", phoneCode: "+39", flag: "🇮🇹", capital: "罗马" },
  { name: "西班牙", iso2: "ES", iso3: "ESP", phoneCode: "+34", flag: "🇪🇸", capital: "马德里" },
  { name: "俄罗斯", iso2: "RU", iso3: "RUS", phoneCode: "+7", flag: "🇷🇺", capital: "莫斯科" },
  { name: "加拿大", iso2: "CA", iso3: "CAN", phoneCode: "+1", flag: "🇨🇦", capital: "渥太华" },
  { name: "澳大利亚", iso2: "AU", iso3: "AUS", phoneCode: "+61", flag: "🇦🇺", capital: "堪培拉" },
  { name: "巴西", iso2: "BR", iso3: "BRA", phoneCode: "+55", flag: "🇧🇷", capital: "巴西利亚" },
  { name: "印度", iso2: "IN", iso3: "IND", phoneCode: "+91", flag: "🇮🇳", capital: "新德里" },
  { name: "新加坡", iso2: "SG", iso3: "SGP", phoneCode: "+65", flag: "🇸🇬", capital: "新加坡" },
  { name: "泰国", iso2: "TH", iso3: "THA", phoneCode: "+66", flag: "🇹🇭", capital: "曼谷" },
  { name: "马来西亚", iso2: "MY", iso3: "MYS", phoneCode: "+60", flag: "🇲🇾", capital: "吉隆坡" },
  { name: "越南", iso2: "VN", iso3: "VNM", phoneCode: "+84", flag: "🇻🇳", capital: "河内" },
  { name: "荷兰", iso2: "NL", iso3: "NLD", phoneCode: "+31", flag: "🇳🇱", capital: "阿姆斯特丹" },
  { name: "瑞士", iso2: "CH", iso3: "CHE", phoneCode: "+41", flag: "🇨🇭", capital: "伯尔尼" },
  { name: "瑞典", iso2: "SE", iso3: "SWE", phoneCode: "+46", flag: "🇸🇪", capital: "斯德哥尔摩" },
  { name: "阿联酋", iso2: "AE", iso3: "ARE", phoneCode: "+971", flag: "🇦🇪", capital: "阿布扎比" },
  { name: "墨西哥", iso2: "MX", iso3: "MEX", phoneCode: "+52", flag: "🇲🇽", capital: "墨西哥城" },
  { name: "南非", iso2: "ZA", iso3: "ZAF", phoneCode: "+27", flag: "🇿🇦", capital: "比勒陀利亚" },
  { name: "新西兰", iso2: "NZ", iso3: "NZL", phoneCode: "+64", flag: "🇳🇿", capital: "惠灵顿" },
  { name: "土耳其", iso2: "TR", iso3: "TUR", phoneCode: "+90", flag: "🇹🇷", capital: "安卡拉" },
  { name: "埃及", iso2: "EG", iso3: "EGY", phoneCode: "+20", flag: "🇪🇬", capital: "开罗" },
  { name: "阿根廷", iso2: "AR", iso3: "ARG", phoneCode: "+54", flag: "🇦🇷", capital: "布宜诺斯艾利斯" },
  { name: "沙特阿拉伯", iso2: "SA", iso3: "SAU", phoneCode: "+966", flag: "🇸🇦", capital: "利雅得" },
  { name: "印度尼西亚", iso2: "ID", iso3: "IDN", phoneCode: "+62", flag: "🇮🇩", capital: "雅加达" },
];

export default function CountryCodesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRIES;
    const q = query.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.includes(query) || c.iso2.toLowerCase().includes(q) || c.iso3.toLowerCase().includes(q) || c.phoneCode.includes(query) || c.capital.includes(query)
    );
  }, [query]);

  return (
    <ToolLayout title="国家代码查询" description="查询世界各国ISO代码、电话区号、国旗等信息" icon={Flag} category="查询工具" slug="country-codes">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索国家、代码或区号..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 个国家/地区</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.iso3} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{c.flag}</span>
                <div className="flex-1">
                  <div className="text-white font-medium">{c.name}</div>
                  <div className="text-xs text-slate-500">首都: {c.capital}</div>
                </div>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-primary-500/10 text-primary-400 rounded font-mono">{c.iso2}</span>
                <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded font-mono">{c.iso3}</span>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded font-mono">{c.phoneCode}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配结果</div>
        )}
      </div>
    </ToolLayout>
  );
}
