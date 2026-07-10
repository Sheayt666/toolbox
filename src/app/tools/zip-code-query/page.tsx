"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Mail, Search } from "lucide-react";

interface ZipCode {
  code: string;
  city: string;
  province: string;
}

const ZIP_CODES: ZipCode[] = [
  { code: "100000", city: "北京市", province: "北京" },
  { code: "200000", city: "上海市", province: "上海" },
  { code: "300000", city: "天津市", province: "天津" },
  { code: "400000", city: "重庆市", province: "重庆" },
  { code: "510000", city: "广州市", province: "广东" },
  { code: "518000", city: "深圳市", province: "广东" },
  { code: "519000", city: "珠海市", province: "广东" },
  { code: "528000", city: "佛山市", province: "广东" },
  { code: "523000", city: "东莞市", province: "广东" },
  { code: "528400", city: "中山市", province: "广东" },
  { code: "310000", city: "杭州市", province: "浙江" },
  { code: "315000", city: "宁波市", province: "浙江" },
  { code: "325000", city: "温州市", province: "浙江" },
  { code: "210000", city: "南京市", province: "江苏" },
  { code: "215000", city: "苏州市", province: "江苏" },
  { code: "214000", city: "无锡市", province: "江苏" },
  { code: "610000", city: "成都市", province: "四川" },
  { code: "610000", city: "西安市", province: "陕西" },
  { code: "430000", city: "武汉市", province: "湖北" },
  { code: "410000", city: "长沙市", province: "湖南" },
  { code: "330000", city: "南昌市", province: "江西" },
  { code: "250000", city: "济南市", province: "山东" },
  { code: "266000", city: "青岛市", province: "山东" },
  { code: "450000", city: "郑州市", province: "河南" },
  { code: "050000", city: "石家庄市", province: "河北" },
  { code: "030000", city: "太原市", province: "山西" },
  { code: "010000", city: "呼和浩特市", province: "内蒙古" },
  { code: "130000", city: "长春市", province: "吉林" },
  { code: "150000", city: "哈尔滨市", province: "黑龙江" },
  { code: "230000", city: "沈阳市", province: "辽宁" },
  { code: "116000", city: "大连市", province: "辽宁" },
  { code: "230000", city: "合肥市", province: "安徽" },
  { code: "350000", city: "福州市", province: "福建" },
  { code: "361000", city: "厦门市", province: "福建" },
  { code: "530000", city: "南宁市", province: "广西" },
  { code: "570000", city: "海口市", province: "海南" },
  { code: "550000", city: "贵阳市", province: "贵州" },
  { code: "650000", city: "昆明市", province: "云南" },
  { code: "850000", city: "拉萨市", province: "西藏" },
  { code: "730000", city: "兰州市", province: "甘肃" },
  { code: "750000", city: "银川市", province: "宁夏" },
  { code: "810000", city: "西宁市", province: "青海" },
  { code: "830000", city: "乌鲁木齐市", province: "新疆" },
  { code: "100032", city: "香港", province: "香港" },
  { code: "999078", city: "澳门", province: "澳门" },
  { code: "106", city: "台北市", province: "台湾" },
];

export default function ZipCodeQueryPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return ZIP_CODES;
    return ZIP_CODES.filter((z) => z.code.includes(query) || z.city.includes(query) || z.province.includes(query));
  }, [query]);

  return (
    <ToolLayout title="邮政编码查询" description="查询全国各地邮政编码，支持按城市或邮编搜索" icon={Mail} category="查询工具" slug="zip-code-query">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入邮编或城市名搜索..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条结果</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((z, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="w-16 h-14 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <span className="font-mono font-bold text-primary-400 text-sm">{z.code.substring(0, 3)}<br/>{z.code.substring(3, 6)}</span>
              </div>
              <div className="min-w-0">
                <div className="text-white font-medium">{z.city}</div>
                <div className="text-sm text-slate-500">{z.province}</div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
