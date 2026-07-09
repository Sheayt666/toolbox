"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Star, Sparkles, Moon } from "lucide-react";

export default function ZodiacSignPage() {
  const [birthday, setBirthday] = useState("");

  const zodiacSigns = [
    { name: "白羊座", symbol: "♈", date: "3.21-4.19", element: "火", ruling: "火星", traits: "热情、勇敢、直率、冲动" },
    { name: "金牛座", symbol: "♉", date: "4.20-5.20", element: "土", ruling: "金星", traits: "稳重、务实、耐心、固执" },
    { name: "双子座", symbol: "♊", date: "5.21-6.21", element: "风", ruling: "水星", traits: "机智、善变、好奇、活泼" },
    { name: "巨蟹座", symbol: "♋", date: "6.22-7.22", element: "水", ruling: "月亮", traits: "温柔、敏感、顾家、情绪化" },
    { name: "狮子座", symbol: "♌", date: "7.23-8.22", element: "火", ruling: "太阳", traits: "自信、大方、热情、骄傲" },
    { name: "处女座", symbol: "♍", date: "8.23-9.22", element: "土", ruling: "水星", traits: "细致、完美、理性、挑剔" },
    { name: "天秤座", symbol: "♎", date: "9.23-10.23", element: "风", ruling: "金星", traits: "优雅、公正、和谐、犹豫" },
    { name: "天蝎座", symbol: "♏", date: "10.24-11.22", element: "水", ruling: "冥王星", traits: "神秘、深刻、执着、嫉妒" },
    { name: "射手座", symbol: "♐", date: "11.23-12.21", element: "火", ruling: "木星", traits: "乐观、自由、坦率、鲁莽" },
    { name: "摩羯座", symbol: "♑", date: "12.22-1.19", element: "土", ruling: "土星", traits: "踏实、自律、野心、保守" },
    { name: "水瓶座", symbol: "♒", date: "1.20-2.18", element: "风", ruling: "天王星", traits: "创新、独立、叛逆、理性" },
    { name: "双鱼座", symbol: "♓", date: "2.19-3.20", element: "水", ruling: "海王星", traits: "浪漫、善良、敏感、逃避" },
  ];

  const getZodiacSign = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const signs = [
      { name: "摩羯座", start: [12, 22], end: [1, 19] },
      { name: "水瓶座", start: [1, 20], end: [2, 18] },
      { name: "双鱼座", start: [2, 19], end: [3, 20] },
      { name: "白羊座", start: [3, 21], end: [4, 19] },
      { name: "金牛座", start: [4, 20], end: [5, 20] },
      { name: "双子座", start: [5, 21], end: [6, 21] },
      { name: "巨蟹座", start: [6, 22], end: [7, 22] },
      { name: "狮子座", start: [7, 23], end: [8, 22] },
      { name: "处女座", start: [8, 23], end: [9, 22] },
      { name: "天秤座", start: [9, 23], end: [10, 23] },
      { name: "天蝎座", start: [10, 24], end: [11, 22] },
      { name: "射手座", start: [11, 23], end: [12, 21] },
    ];

    for (const sign of signs) {
      const [startMonth, startDay] = sign.start;
      const [endMonth, endDay] = sign.end;

      if (startMonth > endMonth) {
        // 跨年度（摩羯座）
        if (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay)
        ) {
          return zodiacSigns.find(z => z.name === sign.name);
        }
      } else {
        if (
          (month === startMonth && day >= startDay) ||
          (month === endMonth && day <= endDay) ||
          (month > startMonth && month < endMonth)
        ) {
          return zodiacSigns.find(z => z.name === sign.name);
        }
      }
    }

    return null;
  };

  const result = getZodiacSign(birthday);

  const elementColors: Record<string, string> = {
    "火": "from-red-500 to-orange-500",
    "土": "from-amber-500 to-yellow-500",
    "风": "from-cyan-500 to-blue-500",
    "水": "from-blue-500 to-indigo-500",
  };

  return (
    <ToolLayout
      title="星座查询"
      description="根据出生日期查询星座，查看星座性格特点、守护星和元素属性"
      toolId="zodiac-sign"
      icon={Star}
      category="生活工具"
      slug="zodiac-sign"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-400" />
            <h2 className="text-base font-semibold">输入生日</h2>
          </div>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-yellow-500 font-mono text-lg"
          />
        </div>

        {result && (
          <div className={`bg-gradient-to-br ${elementColors[result.element]}/10 rounded-xl border border-yellow-500/20 p-6`}>
            <div className="text-center">
              <div className="text-7xl mb-4">{result.symbol}</div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2">{result.name}</h2>
              <div className="text-sm text-zinc-400">{result.date}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">元素</div>
                <div className="text-lg font-bold text-yellow-400">{result.element}象星座</div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">守护星</div>
                <div className="text-lg font-bold text-yellow-400">{result.ruling}</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-zinc-900/50 rounded-xl">
              <div className="text-xs text-zinc-500 mb-2">性格特质</div>
              <div className="text-sm text-zinc-300">{result.traits}</div>
            </div>
          </div>
        )}

        {/* 全部星座 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <h3 className="text-base font-semibold">十二星座一览</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {zodiacSigns.map((sign) => (
              <div
                key={sign.name}
                className={`p-3 rounded-xl border transition-colors ${
                  result?.name === sign.name
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-zinc-900/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sign.symbol}</span>
                  <div>
                    <div className="text-sm font-medium text-zinc-300">{sign.name}</div>
                    <div className="text-xs text-zinc-500">{sign.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
