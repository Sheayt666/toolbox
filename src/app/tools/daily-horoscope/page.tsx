"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Star } from "lucide-react";

const HOROSCOPES = [
  { name: "白羊座", date: "3.21-4.19", icon: "♈", element: "火" },
  { name: "金牛座", date: "4.20-5.20", icon: "♉", element: "土" },
  { name: "双子座", date: "5.21-6.20", icon: "♊", element: "风" },
  { name: "巨蟹座", date: "6.21-7.22", icon: "♋", element: "水" },
  { name: "狮子座", date: "7.23-8.22", icon: "♌", element: "火" },
  { name: "处女座", date: "8.23-9.22", icon: "♍", element: "土" },
  { name: "天秤座", date: "9.23-10.22", icon: "♎", element: "风" },
  { name: "天蝎座", date: "10.23-11.21", icon: "♏", element: "水" },
  { name: "射手座", date: "11.22-12.21", icon: "♐", element: "火" },
  { name: "摩羯座", date: "12.22-1.19", icon: "♑", element: "土" },
  { name: "水瓶座", date: "1.20-2.18", icon: "♒", element: "风" },
  { name: "双鱼座", date: "2.19-3.20", icon: "♓", element: "水" },
];

const FORTUNE_AREAS = [
  { name: "综合", texts: ["运势不错，适合做重要决定", "今天需要注意细节，避免冲动", "贵人运旺盛，有意外收获", "平稳的一天，适合休整规划", "能量满满，行动力强"] },
  { name: "爱情", texts: ["桃花盛开，单身者有机会", "与伴侣沟通顺畅，感情升温", "需要注意另一半的感受", "适合表白或约会的好日子", "保持理性，不要因情绪影响感情"] },
  { name: "事业", texts: ["工作顺利，有升职机会", "需要注意职场人际关系", "适合学习新技能提升自己", "有跳槽或转行的机会", "保持耐心，努力会有回报"] },
  { name: "财运", texts: ["偏财运佳，有意外收入", "需要控制消费，避免冲动购物", "适合投资理财的好时机", "注意防骗，保管好财物", "财运平稳，细水长流"] },
  { name: "健康", texts: ["精力充沛，状态良好", "注意休息，避免熬夜", "适合运动锻炼身体", "注意饮食均衡", "关注心理健康，适当放松"] },
];

function generateFortune(): { area: string; text: string; score: number }[] {
  return FORTUNE_AREAS.map((area) => ({
    area: area.name,
    text: area.texts[Math.floor(Math.random() * area.texts.length)],
    score: Math.floor(Math.random() * 3) + 3,
  }));
}

const LUCKY = {
  colors: ["红色", "蓝色", "绿色", "黄色", "紫色", "白色", "橙色", "粉色"],
  numbers: [1, 3, 5, 6, 7, 8, 9, 12, 16, 21, 26, 33],
  directions: ["正东", "正南", "正西", "正北", "东南", "西南", "东北", "西北"],
};

export default function DailyHoroscopePage() {
  const [selected, setSelected] = useState(0);
  const [fortune, setFortune] = useState<{ area: string; text: string; score: number }[]>([]);
  const [luckyColor, setLuckyColor] = useState("");
  const [luckyNumber, setLuckyNumber] = useState(0);
  const [luckyDir, setLuckyDir] = useState("");
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setFortune(generateFortune());
    setLuckyColor(LUCKY.colors[Math.floor(Math.random() * LUCKY.colors.length)]);
    setLuckyNumber(LUCKY.numbers[Math.floor(Math.random() * LUCKY.numbers.length)]);
    setLuckyDir(LUCKY.directions[Math.floor(Math.random() * LUCKY.directions.length)]);
    setGenerated(true);
  };

  return (
    <ToolLayout title="每日星座运势" description="十二星座每日运势" icon={Star} category="生活工具" slug="daily-horoscope">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
            {HOROSCOPES.map((h, i) => (
              <button key={i} onClick={() => { setSelected(i); setGenerated(false); }} className={`p-3 rounded-xl border transition-all ${selected === i ? "bg-primary-500/10 border-primary-500/30" : "bg-[#09090b] border-[#27272a] hover:border-[#3f3f46]"}`}>
                <div className="text-2xl mb-1">{h.icon}</div>
                <div className="text-xs text-white font-medium">{h.name}</div>
              </button>
            ))}
          </div>

          <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl mb-4 flex items-center gap-4">
            <span className="text-4xl">{HOROSCOPES[selected].icon}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{HOROSCOPES[selected].name}</h3>
              <p className="text-sm text-slate-500">{HOROSCOPES[selected].date} · {HOROSCOPES[selected].element}象星座</p>
            </div>
          </div>

          <button onClick={handleGenerate} className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors mb-6">
            {generated ? "重新生成运势" : "查看今日运势"}
          </button>

          {generated && (
            <div className="space-y-3">
              {fortune.map((f, i) => (
                <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{f.area}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= f.score ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{f.text}</p>
                </div>
              ))}
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-xs text-slate-500 mb-1">幸运色</div><div className="text-white font-medium">{luckyColor}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">幸运数字</div><div className="text-white font-medium">{luckyNumber}</div></div>
                  <div><div className="text-xs text-slate-500 mb-1">幸运方位</div><div className="text-white font-medium">{luckyDir}</div></div>
                </div>
              </div>
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400/80">运势仅供参考娱乐，请理性看待。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
