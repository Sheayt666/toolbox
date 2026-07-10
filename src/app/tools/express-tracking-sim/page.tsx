"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Package, Search, Truck, MapPin, CheckCircle } from "lucide-react";

interface TrackingStep {
  time: string;
  location: string;
  status: string;
  desc: string;
}

const TRACKING_DATA: Record<string, { company: string; steps: TrackingStep[] }> = {
  "SF1234567890": { company: "顺丰速运", steps: [
    { time: "2026-07-10 09:30", location: "深圳市福田区", status: "已签收", desc: "快件已签收，签收人：本人" },
    { time: "2026-07-10 08:15", location: "深圳市福田区", status: "派送中", desc: "快件正在派送中，快递员：张师傅 13800138000" },
    { time: "2026-07-10 06:00", location: "深圳福田营业点", status: "到达派送点", desc: "快件已到达深圳福田营业点" },
    { time: "2026-07-09 22:30", location: "深圳转运中心", status: "运输中", desc: "快件已到达深圳转运中心" },
    { time: "2026-07-09 15:00", location: "上海转运中心", status: "运输中", desc: "快件已从上海转运中心发出" },
    { time: "2026-07-09 10:00", location: "上海市浦东新区", status: "已揽收", desc: "顺丰速运已收取快件" },
  ]},
  "YT9876543210": { company: "圆通速递", steps: [
    { time: "2026-07-10 14:20", location: "杭州市西湖区", status: "派送中", desc: "快件正在派送中" },
    { time: "2026-07-10 08:00", location: "杭州西湖营业点", status: "到达派送点", desc: "快件已到达杭州西湖营业点" },
    { time: "2026-07-09 20:00", location: "杭州转运中心", status: "运输中", desc: "快件已到达杭州转运中心" },
    { time: "2026-07-09 12:00", location: "北京转运中心", status: "运输中", desc: "快件已从北京转运中心发出" },
    { time: "2026-07-09 09:00", location: "北京市朝阳区", status: "已揽收", desc: "圆通速递已收取快件" },
  ]},
};

function generateTracking(num: string): { company: string; steps: TrackingStep[] } {
  if (TRACKING_DATA[num]) return TRACKING_DATA[num];
  return { company: "模拟快递公司", steps: [
    { time: "2026-07-10 10:00", location: "目的地城市", status: "派送中", desc: "快件正在派送中" },
    { time: "2026-07-10 06:00", location: "目的地转运中心", status: "到达", desc: "快件已到达目的地转运中心" },
    { time: "2026-07-09 18:00", location: "中途转运中心", status: "运输中", desc: "快件运输中" },
    { time: "2026-07-09 10:00", location: "出发地", status: "已揽收", desc: "快递公司已收取快件" },
  ]};
}

export default function ExpressTrackingSimPage() {
  const [trackingNo, setTrackingNo] = useState("");
  const [result, setResult] = useState<{ company: string; steps: TrackingStep[] } | null>(null);

  const handleQuery = () => {
    if (!trackingNo.trim()) return;
    setResult(generateTracking(trackingNo.trim()));
  };

  return (
    <ToolLayout title="快递查询模拟" description="模拟快递物流查询界面" icon={Package} category="查询工具" slug="express-tracking-sim">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input type="text" value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} placeholder="输入快递单号..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono" />
          </div>
          <button onClick={handleQuery} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">查询</button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-slate-400">示例单号：</span>
          {Object.keys(TRACKING_DATA).map((no) => (
            <button key={no} onClick={() => setTrackingNo(no)} className="px-3 py-1 text-xs bg-[#09090b] border border-[#27272a] rounded-lg text-primary-400 hover:border-primary-500/30 transition-colors font-mono">{no}</button>
          ))}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl flex items-center gap-4">
              <Package className="w-8 h-8 text-primary-400" />
              <div>
                <div className="text-white font-medium">{result.company}</div>
                <div className="text-sm text-slate-500 font-mono">{trackingNo}</div>
              </div>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-[#27272a]" />
              {result.steps.map((step, i) => {
                const isFirst = i === 0;
                return (
                  <div key={i} className="relative pb-6">
                    <div className={`absolute -left-[22px] top-1 w-6 h-6 rounded-full flex items-center justify-center ${isFirst ? "bg-emerald-500" : "bg-[#27272a]"}`}>
                      {isFirst ? <CheckCircle className="w-4 h-4 text-white" /> : <MapPin className="w-3 h-3 text-slate-500" />}
                    </div>
                    <div className="ml-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${isFirst ? "text-emerald-400" : "text-white"}`}>{step.status}</span>
                        <span className="text-xs text-slate-500">{step.time}</span>
                      </div>
                      <div className="text-sm text-slate-400 mb-1">{step.location}</div>
                      <div className="text-xs text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400/80">本工具为模拟演示，物流数据为虚构内容，非真实快递查询服务。</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
