"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Phone, Search } from "lucide-react";

interface AreaCode {
  code: string;
  city: string;
  province: string;
}

const AREA_CODES: AreaCode[] = [
  { code: "010", city: "北京", province: "北京" },
  { code: "021", city: "上海", province: "上海" },
  { code: "022", city: "天津", province: "天津" },
  { code: "023", city: "重庆", province: "重庆" },
  { code: "020", city: "广州", province: "广东" },
  { code: "0755", city: "深圳", province: "广东" },
  { code: "0757", city: "佛山", province: "广东" },
  { code: "0760", city: "中山", province: "广东" },
  { code: "0769", city: "东莞", province: "广东" },
  { code: "0571", city: "杭州", province: "浙江" },
  { code: "0574", city: "宁波", province: "浙江" },
  { code: "0577", city: "温州", province: "浙江" },
  { code: "025", city: "南京", province: "江苏" },
  { code: "0512", city: "苏州", province: "江苏" },
  { code: "0510", city: "无锡", province: "江苏" },
  { code: "028", city: "成都", province: "四川" },
  { code: "029", city: "西安", province: "陕西" },
  { code: "024", city: "沈阳", province: "辽宁" },
  { code: "0411", city: "大连", province: "辽宁" },
  { code: "027", city: "武汉", province: "湖北" },
  { code: "0731", city: "长沙", province: "湖南" },
  { code: "0791", city: "南昌", province: "江西" },
  { code: "0531", city: "济南", province: "山东" },
  { code: "0532", city: "青岛", province: "山东" },
  { code: "0371", city: "郑州", province: "河南" },
  { code: "0311", city: "石家庄", province: "河北" },
  { code: "0351", city: "太原", province: "山西" },
  { code: "0471", city: "呼和浩特", province: "内蒙古" },
  { code: "0431", city: "长春", province: "吉林" },
  { code: "0451", city: "哈尔滨", province: "黑龙江" },
  { code: "0551", city: "合肥", province: "安徽" },
  { code: "0591", city: "福州", province: "福建" },
  { code: "0791", city: "南昌", province: "江西" },
  { code: "0371", city: "郑州", province: "河南" },
  { code: "0771", city: "南宁", province: "广西" },
  { code: "0898", city: "海口", province: "海南" },
  { code: "028", city: "成都", province: "四川" },
  { code: "0851", city: "贵阳", province: "贵州" },
  { code: "0871", city: "昆明", province: "云南" },
  { code: "0891", city: "拉萨", province: "西藏" },
  { code: "029", city: "西安", province: "陕西" },
  { code: "0931", city: "兰州", province: "甘肃" },
  { code: "0951", city: "银川", province: "宁夏" },
  { code: "0971", city: "西宁", province: "青海" },
  { code: "0991", city: "乌鲁木齐", province: "新疆" },
];

export default function AreaCodeQueryPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return AREA_CODES;
    const q = query.toLowerCase();
    return AREA_CODES.filter(
      (a) => a.code.includes(q) || a.city.toLowerCase().includes(q) || a.province.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <ToolLayout title="电话区号查询" description="查询国内外电话区号，支持按城市或区号双向搜索" icon={Phone} category="查询工具" slug="area-code-query">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入区号或城市名搜索..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条结果</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item, i) => (
            <div key={`${item.code}-${item.city}-${i}`} className="flex items-center gap-3 p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="w-14 h-14 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <span className="font-mono font-bold text-primary-400 text-lg">{item.code}</span>
              </div>
              <div className="min-w-0">
                <div className="text-white font-medium">{item.city}</div>
                <div className="text-sm text-slate-500">{item.province}</div>
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
