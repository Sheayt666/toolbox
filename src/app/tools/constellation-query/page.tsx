"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Sparkles } from "lucide-react";

const CONSTELLATIONS = [
  { name: "白羊座", start: [3, 21], end: [4, 19], element: "火", traits: "热情冲动、勇敢直率、领导力强，是十二星座中的第一个星座。充满活力，喜欢冒险和挑战。" },
  { name: "金牛座", start: [4, 20], end: [5, 20], element: "土", traits: "稳重踏实、务实可靠、追求安逸，重视物质享受。耐心持久，是值得信赖的伙伴。" },
  { name: "双子座", start: [5, 21], end: [6, 20], element: "风", traits: "聪明机智、善于沟通、好奇心强，思维敏捷。喜欢变化和新鲜事物，社交能力强。" },
  { name: "巨蟹座", start: [6, 21], end: [7, 22], element: "水", traits: "温柔体贴、顾家重情、直觉敏锐，富有同情心。重视家庭和情感联系。" },
  { name: "狮子座", start: [7, 23], end: [8, 22], element: "火", traits: "自信大方、热情慷慨、天生的领导者，喜欢成为焦点。有强烈的自尊心和荣誉感。" },
  { name: "处女座", start: [8, 23], end: [9, 22], element: "土", traits: "完美主义、细心严谨、逻辑清晰，追求精确和秩序。善于分析和规划。" },
  { name: "天秤座", start: [9, 23], end: [10, 22], element: "风", traits: "优雅平和、追求公平、善于协调，重视和谐与美感。社交能力出色。" },
  { name: "天蝎座", start: [10, 23], end: [11, 21], element: "水", traits: "神秘深沉、意志坚定、洞察力强，感情专一。有强烈的直觉和占有欲。" },
  { name: "射手座", start: [11, 22], end: [12, 21], element: "火", traits: "乐观开朗、热爱自由、喜欢冒险，追求真理和智慧。崇尚自由，不喜欢被束缚。" },
  { name: "摩羯座", start: [12, 22], end: [1, 19], element: "土", traits: "务实稳重、有责任感、目标明确，善于规划和管理。是十二星座中最有耐心的。" },
  { name: "水瓶座", start: [1, 20], end: [2, 18], element: "风", traits: "独立创新、思想前卫、人道主义，追求自由和平等。天生的改革者和发明家。" },
  { name: "双鱼座", start: [2, 19], end: [3, 20], element: "水", traits: "温柔善良、富有同情心、想象力丰富，有艺术天赋。感性细腻，容易感同身受。" },
];

function getConstellation(month: number, day: number): typeof CONSTELLATIONS[0] {
  for (const c of CONSTELLATIONS) {
    const [sm, sd] = c.start;
    const [em, ed] = c.end;
    if (sm > em) {
      if ((month === sm && day >= sd) || (month === em && day <= ed) || (month > sm || month < em)) return c;
    } else {
      if ((month === sm && day >= sd) || (month === em && day <= ed) || (month > sm && month < em)) return c;
    }
  }
  return CONSTELLATIONS[0];
}

export default function ConstellationQueryPage() {
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [result, setResult] = useState<typeof CONSTELLATIONS[0] | null>(null);

  const handleQuery = () => {
    setResult(getConstellation(month, day));
  };

  return (
    <ToolLayout title="星座查询" description="根据出生日期查询星座，了解十二星座性格特点" icon={Sparkles} category="查询工具" slug="constellation-query">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">月份:</span>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-white">
              {Array.from({length: 12}, (_, i) => <option key={i} value={i + 1}>{i + 1}月</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">日期:</span>
            <select value={day} onChange={(e) => setDay(Number(e.target.value))} className="bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-white">
              {Array.from({length: 31}, (_, i) => <option key={i} value={i + 1}>{i + 1}日</option>)}
            </select>
          </div>
          <button onClick={handleQuery} className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
            查询星座
          </button>
        </div>

        {result && (
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{result.name}</h3>
                <p className="text-sm text-slate-400">{result.start[0]}月{result.start[1]}日 - {result.end[0]}月{result.end[1]}日 · {result.element}象星座</p>
              </div>
            </div>
            <div className="p-4 bg-[#18181b] rounded-lg">
              <h4 className="text-sm font-medium text-slate-400 mb-2">性格特点</h4>
              <p className="text-slate-300 leading-relaxed">{result.traits}</p>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-3">十二星座一览</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {CONSTELLATIONS.map((c) => (
              <div key={c.name} className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg text-center hover:border-primary-500/30 transition-colors">
                <div className="text-white font-medium text-sm">{c.name}</div>
                <div className="text-xs text-slate-500 mt-1">{c.start[0]}/{c.start[1]}-{c.end[0]}/{c.end[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
