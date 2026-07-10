"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Train, Search } from "lucide-react";

interface TrainStation {
  name: string;
  arriveTime: string;
  departTime: string;
  stopTime: string;
}

interface TrainInfo {
  number: string;
  type: string;
  from: string;
  to: string;
  stations: TrainStation[];
}

const TRAINS: Record<string, TrainInfo> = {
  "G1": { number: "G1", type: "高铁", from: "北京南", to: "上海虹桥", stations: [
    { name: "北京南", arriveTime: "—", departTime: "09:00", stopTime: "—" },
    { name: "南京南", arriveTime: "12:21", departTime: "12:23", stopTime: "2分" },
    { name: "上海虹桥", arriveTime: "13:28", departTime: "—", stopTime: "—" },
  ]},
  "G2": { number: "G2", type: "高铁", from: "上海虹桥", to: "北京南", stations: [
    { name: "上海虹桥", arriveTime: "—", departTime: "09:00", stopTime: "—" },
    { name: "南京南", arriveTime: "10:07", departTime: "10:09", stopTime: "2分" },
    { name: "北京南", arriveTime: "13:28", departTime: "—", stopTime: "—" },
  ]},
  "G5": { number: "G5", type: "高铁", from: "北京南", to: "上海虹桥", stations: [
    { name: "北京南", arriveTime: "—", departTime: "13:00", departTime_2: "", stopTime: "—" } as any,
    { name: "济南西", arriveTime: "14:32", departTime: "14:34", stopTime: "2分" },
    { name: "南京南", arriveTime: "16:21", departTime: "16:23", stopTime: "2分" },
    { name: "上海虹桥", arriveTime: "17:28", departTime: "—", stopTime: "—" },
  ]},
  "Z1": { number: "Z1", type: "直达", from: "北京西", to: "长沙", stations: [
    { name: "北京西", arriveTime: "—", departTime: "18:00", stopTime: "—" },
    { name: "武昌", arriveTime: "05:30", departTime: "05:36", stopTime: "6分" },
    { name: "长沙", arriveTime: "08:05", departTime: "—", stopTime: "—" },
  ]},
  "T1": { number: "T1", type: "特快", from: "北京西", to: "长沙", stations: [
    { name: "北京西", arriveTime: "—", departTime: "15:00", stopTime: "—" },
    { name: "石家庄", arriveTime: "17:30", departTime: "17:36", stopTime: "6分" },
    { name: "郑州", arriveTime: "20:30", departTime: "20:38", stopTime: "8分" },
    { name: "武昌", arriveTime: "04:30", departTime: "04:42", stopTime: "12分" },
    { name: "长沙", arriveTime: "08:05", departTime: "—", stopTime: "—" },
  ]},
  "K1": { number: "K1", type: "快速", from: "北京西", to: "上海", stations: [
    { name: "北京西", arriveTime: "—", departTime: "11:00", stopTime: "—" },
    { name: "德州", arriveTime: "15:20", departTime: "15:23", stopTime: "3分" },
    { name: "济南", arriveTime: "17:30", departTime: "17:38", stopTime: "8分" },
    { name: "徐州", arriveTime: "21:10", departTime: "21:18", stopTime: "8分" },
    { name: "南京", arriveTime: "02:00", departTime: "02:12", stopTime: "12分" },
    { name: "上海", arriveTime: "05:30", departTime: "—", stopTime: "—" },
  ]},
};

export default function TrainNumberQueryPage() {
  const [trainNo, setTrainNo] = useState("");
  const [result, setResult] = useState<TrainInfo | null>(null);
  const [error, setError] = useState("");

  const handleQuery = () => {
    if (!trainNo.trim()) return;
    const info = TRAINS[trainNo.trim().toUpperCase()];
    if (info) { setResult(info); setError(""); }
    else { setResult(null); setError(`未找到车次 ${trainNo} 的信息`); }
  };

  return (
    <ToolLayout title="车次站点查询" description="查询火车车次经过的站点信息及时刻表" icon={Train} category="查询工具" slug="train-number-query">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={trainNo}
              onChange={(e) => setTrainNo(e.target.value)}
              placeholder="输入车次号，如 G1、Z1、T1"
              className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono"
            />
          </div>
          <button onClick={handleQuery} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">查询</button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-slate-400">快速查询：</span>
          {Object.keys(TRAINS).map((no) => (
            <button key={no} onClick={() => { setTrainNo(no); }} className="px-3 py-1 text-xs bg-[#09090b] border border-[#27272a] rounded-lg text-primary-400 hover:border-primary-500/30 transition-colors font-mono">{no}</button>
          ))}
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl flex items-center gap-4">
              <div className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg font-bold text-lg font-mono">{result.number}</div>
              <div>
                <div className="text-white font-medium">{result.from} → {result.to}</div>
                <div className="text-sm text-slate-500">{result.type}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#27272a] text-slate-400">
                    <th className="text-left py-3 px-3 font-medium">站点</th>
                    <th className="text-left py-3 px-3 font-medium">到站时间</th>
                    <th className="text-left py-3 px-3 font-medium">发车时间</th>
                    <th className="text-left py-3 px-3 font-medium">停留</th>
                  </tr>
                </thead>
                <tbody>
                  {result.stations.map((s, i) => (
                    <tr key={i} className="border-b border-[#1e1e21] hover:bg-[#1c1c1f] transition-colors">
                      <td className="py-3 px-3 text-white font-medium">{s.name}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono">{s.arriveTime}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono">{s.departTime}</td>
                      <td className="py-3 px-3 text-primary-400">{s.stopTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400/80">以上为模拟时刻表数据，仅供演示参考，实际请以12306官方数据为准。</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
