"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Globe, Search } from "lucide-react";

const IP_DATABASE: Record<string, { country: string; region: string; city: string; isp: string }> = {
  "8.8.8.8": { country: "美国", region: "加利福尼亚州", city: "山景城", isp: "Google LLC" },
  "8.8.4.4": { country: "美国", region: "加利福尼亚州", city: "山景城", isp: "Google LLC" },
  "1.1.1.1": { country: "澳大利亚", region: "新南威尔士", city: "悉尼", isp: "Cloudflare" },
  "114.114.114.114": { country: "中国", region: "江苏", city: "南京", isp: "114DNS" },
  "223.5.5.5": { country: "中国", region: "浙江", city: "杭州", isp: "阿里云" },
  "119.29.29.29": { country: "中国", region: "广东", city: "深圳", isp: "腾讯云" },
  "180.76.76.76": { country: "中国", region: "北京", city: "北京", isp: "百度DNS" },
  "117.50.11.11": { country: "中国", region: "北京", city: "北京", isp: "OneDNS" },
  "119.28.28.28": { country: "中国", region: "广东", city: "深圳", isp: "腾讯DNSPod" },
};

function generateIpInfo(ip: string) {
  if (IP_DATABASE[ip]) return IP_DATABASE[ip];
  const parts = ip.split(".");
  if (parts.length !== 4 || !parts.every((p) => /^\d+$/.test(p) && parseInt(p) >= 0 && parseInt(p) <= 255)) return null;
  const first = parseInt(parts[0]);
  if (first >= 1 && first <= 126) return { country: "中国", region: "北京", city: "北京", isp: "中国电信" };
  if (first >= 128 && first <= 191) return { country: "中国", region: "上海", city: "上海", isp: "中国联通" };
  if (first >= 192 && first <= 223) return { country: "中国", region: "广东", city: "广州", isp: "中国移动" };
  return { country: "未知", region: "未知", city: "未知", isp: "未知" };
}

export default function IpLookupPage() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleLookup = () => {
    if (!ip.trim()) return;
    const info = generateIpInfo(ip.trim());
    if (info) setResult({ ip: ip.trim(), ...info });
    else setResult({ error: "IP地址格式不正确" });
  };

  return (
    <ToolLayout title="IP地址查询" description="查询IP地址的地理位置、运营商等信息" icon={Globe} category="查询工具" slug="ip-lookup">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="输入IP地址，如 8.8.8.8"
              className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono"
            />
          </div>
          <button onClick={handleLookup} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">查询</button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-slate-400">快速查询：</span>
          {Object.keys(IP_DATABASE).map((ipAddr) => (
            <button key={ipAddr} onClick={() => { setIp(ipAddr); }} className="px-3 py-1 text-xs bg-[#09090b] border border-[#27272a] rounded-lg text-primary-400 hover:border-primary-500/30 transition-colors font-mono">{ipAddr}</button>
          ))}
        </div>

        {result?.error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{result.error}</div>}

        {result && !result.error && (
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary-400" />
              <span className="text-lg font-mono font-bold text-white">{result.ip}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><div className="text-xs text-slate-500 mb-1">国家</div><div className="text-white font-medium">{result.country}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">地区</div><div className="text-white font-medium">{result.region}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">城市</div><div className="text-white font-medium">{result.city}</div></div>
              <div><div className="text-xs text-slate-500 mb-1">运营商</div><div className="text-white font-medium">{result.isp}</div></div>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-400/80">本工具使用内置模拟数据库进行演示查询，非真实IP地理位置查询服务。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
