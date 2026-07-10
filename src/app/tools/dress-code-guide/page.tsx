"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shirt } from "lucide-react";

interface DressAdvice {
  range: string;
  level: string;
  advice: string;
  items: string[];
  icon: string;
}

const ADVICES: DressAdvice[] = [
  { range: "28°C以上", level: "炎热", advice: "穿轻薄透气的衣物，注意防晒", items: ["短袖T恤", "短裤/短裙", "凉鞋", "遮阳帽", "太阳镜"], icon: "🔥" },
  { range: "23-27°C", level: "温暖", advice: "舒适穿着，可选择薄款衣物", items: ["短袖/薄长袖", "薄裤/裙子", "运动鞋", "薄外套（备用）"], icon: "☀️" },
  { range: "18-22°C", level: "舒适", advice: "适合穿长袖，早晚加薄外套", items: ["长袖衬衫", "薄毛衣", "长裤", "薄外套", "运动鞋"], icon: "🌤️" },
  { range: "10-17°C", level: "凉爽", advice: "需要穿外套，注意保暖", items: ["长袖上衣", "外套/夹克", "长裤", "运动鞋/靴子"], icon: "⛅" },
  { range: "5-9°C", level: "寒冷", advice: "穿厚外套，注意保暖", items: ["毛衣/厚长袖", "厚外套/大衣", "厚长裤", "围巾", "靴子"], icon: "☁️" },
  { range: "0-4°C", level: "严寒", advice: "穿羽绒服，全副武装防寒", items: ["保暖内衣", "毛衣", "羽绒服", "厚长裤", "围巾手套", "冬靴"], icon: "❄️" },
  { range: "0°C以下", level: "极寒", advice: "尽量减少外出，注意防冻", items: ["加厚保暖内衣", "厚毛衣", "长款羽绒服", "加厚长裤", "围巾手套帽子", "防滑雪地靴"], icon: "🥶" },
];

function getAdvice(temp: number): DressAdvice {
  if (temp >= 28) return ADVICES[0];
  if (temp >= 23) return ADVICES[1];
  if (temp >= 18) return ADVICES[2];
  if (temp >= 10) return ADVICES[3];
  if (temp >= 5) return ADVICES[4];
  if (temp >= 0) return ADVICES[5];
  return ADVICES[6];
}

export default function DressCodeGuidePage() {
  const [temp, setTemp] = useState(20);
  const advice = getAdvice(temp);

  return (
    <ToolLayout title="穿衣指数" description="根据天气温度推荐合适的穿衣搭配" icon={Shirt} category="生活工具" slug="dress-code-guide">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-slate-400">当前温度</span>
              <span className="text-3xl font-bold text-primary-400">{temp}°C</span>
            </div>
            <input type="range" min="-10" max="40" value={temp} onChange={(e) => setTemp(Number(e.target.value))} className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>-10°C</span><span>0°C</span><span>20°C</span><span>40°C</span>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl mb-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{advice.icon}</span>
              <div>
                <div className="text-xs text-slate-500">{advice.range}</div>
                <h3 className="text-xl font-bold text-white">{advice.level}</h3>
              </div>
            </div>
            <p className="text-slate-300 mb-4">{advice.advice}</p>
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">推荐穿着</h4>
              <div className="flex flex-wrap gap-2">
                {advice.items.map((item, i) => (
                  <span key={i} className="px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-sm text-slate-300 inline-flex items-center gap-1">
                    <Shirt className="w-3 h-3 text-primary-400" /> {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3">穿衣等级参考</h4>
            <div className="space-y-2">
              {ADVICES.map((a, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${a.level === advice.level ? "bg-primary-500/10 border-primary-500/30" : "bg-[#09090b] border-[#27272a]"}`}>
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1">
                    <span className="text-white text-sm font-medium">{a.range}</span>
                    <span className="text-slate-500 text-sm ml-2">{a.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
