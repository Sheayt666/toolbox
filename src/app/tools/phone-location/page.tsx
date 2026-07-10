"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Smartphone, Search } from "lucide-react";

const PHONE_PREFIXES: Record<string, { province: string; city: string; carrier: string }> = {
  "130": { province: "上海", city: "上海", carrier: "中国联通" },
  "131": { province: "北京", city: "北京", carrier: "中国联通" },
  "132": { province: "广东", city: "深圳", carrier: "中国联通" },
  "133": { province: "北京", city: "北京", carrier: "中国电信" },
  "134": { province: "广东", city: "广州", carrier: "中国移动" },
  "135": { province: "北京", city: "北京", carrier: "中国移动" },
  "136": { province: "上海", city: "上海", carrier: "中国移动" },
  "137": { province: "浙江", city: "杭州", carrier: "中国移动" },
  "138": { province: "江苏", city: "南京", carrier: "中国移动" },
  "139": { province: "四川", city: "成都", carrier: "中国移动" },
  "150": { province: "湖北", city: "武汉", carrier: "中国移动" },
  "151": { province: "湖南", city: "长沙", carrier: "中国移动" },
  "152": { province: "山东", city: "济南", carrier: "中国移动" },
  "153": { province: "河南", city: "郑州", carrier: "中国电信" },
  "155": { province: "福建", city: "福州", carrier: "中国联通" },
  "156": { province: "安徽", city: "合肥", carrier: "中国联通" },
  "158": { province: "江西", city: "南昌", carrier: "中国移动" },
  "159": { province: "辽宁", city: "沈阳", carrier: "中国移动" },
  "170": { province: "虚拟运营商", city: "全国", carrier: "虚拟运营商" },
  "176": { province: "陕西", city: "西安", carrier: "中国联通" },
  "177": { province: "重庆", city: "重庆", carrier: "中国电信" },
  "178": { province: "黑龙江", city: "哈尔滨", carrier: "中国移动" },
  "180": { province: "天津", city: "天津", carrier: "中国电信" },
  "181": { province: "吉林", city: "长春", carrier: "中国电信" },
  "182": { province: "河北", city: "石家庄", carrier: "中国移动" },
  "183": { province: "山西", city: "太原", carrier: "中国移动" },
  "185": { province: "内蒙古", city: "呼和浩特", carrier: "中国联通" },
  "186": { province: "海南", city: "海口", carrier: "中国联通" },
  "187": { province: "广西", city: "南宁", carrier: "中国移动" },
  "188": { province: "贵州", city: "贵阳", carrier: "中国移动" },
  "189": { province: "云南", city: "昆明", carrier: "中国电信" },
};

const CARRIER_COLORS: Record<string, string> = {
  "中国移动": "text-blue-400 bg-blue-500/10",
  "中国联通": "text-red-400 bg-red-500/10",
  "中国电信": "text-emerald-400 bg-emerald-500/10",
  "虚拟运营商": "text-purple-400 bg-purple-500/10",
};

export default function PhoneLocationPage() {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleQuery = () => {
    const trimmed = phone.trim();
    if (!trimmed) return;
    if (!/^1\d{10}$/.test(trimmed)) {
      setResult({ error: "请输入正确的11位手机号码" });
      return;
    }
    const prefix = trimmed.substring(0, 3);
    const info = PHONE_PREFIXES[prefix];
    if (info) setResult({ phone: trimmed, prefix, ...info });
    else setResult({ phone: trimmed, prefix, province: "未知", city: "未知", carrier: "未知" });
  };

  return (
    <ToolLayout title="手机号归属地" description="根据手机号前七位查询归属地和运营商信息" icon={Smartphone} category="查询工具" slug="phone-location">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="输入11位手机号码"
              maxLength={11}
              className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono"
            />
          </div>
          <button onClick={handleQuery} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">查询</button>
        </div>

        {result?.error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{result.error}</div>}

        {result && !result.error && (
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <Smartphone className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-mono font-bold text-white">{result.phone}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><div className="text-xs text-slate-500 mb-1">省份</div><div className="text-white font-medium">{result.province}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">城市</div><div className="text-white font-medium">{result.city}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">号段</div><div className="text-white font-mono font-medium">{result.prefix}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">运营商</div><span className={`inline-block px-2 py-1 rounded text-xs ${CARRIER_COLORS[result.carrier] || "text-slate-400 bg-slate-500/10"}`}>{result.carrier}</span></div>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-400/80">本工具使用内置模拟号段数据库，仅供演示参考，不保证数据准确性。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
