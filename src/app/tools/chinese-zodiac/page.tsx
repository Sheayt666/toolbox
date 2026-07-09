"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PawPrint, Sparkles } from "lucide-react";

export default function ChineseZodiacPage() {
  const [birthday, setBirthday] = useState("");

  const zodiacs = [
    { name: "鼠", emoji: "🐭", traits: "机智、灵活、聪明、适应力强", lucky: "龙、猴、牛", element: "水" },
    { name: "牛", emoji: "🐮", traits: "踏实、勤奋、可靠、有耐心", lucky: "鼠、蛇、鸡", element: "土" },
    { name: "虎", emoji: "🐯", traits: "勇敢、自信、热情、有领导力", lucky: "马、狗、猪", element: "木" },
    { name: "兔", emoji: "🐰", traits: "温柔、善良、谨慎、有同情心", lucky: "羊、狗、猪", element: "木" },
    { name: "龙", emoji: "🐲", traits: "威严、自信、勇敢、有抱负", lucky: "鼠、猴、鸡", element: "土" },
    { name: "蛇", emoji: "🐍", traits: "智慧、神秘、优雅、有洞察力", lucky: "牛、鸡", element: "火" },
    { name: "马", emoji: "🐴", traits: "热情、奔放、独立、有活力", lucky: "虎、羊、狗", element: "火" },
    { name: "羊", emoji: "🐑", traits: "温和、善良、艺术、有创造力", lucky: "兔、马、猪", element: "土" },
    { name: "猴", emoji: "🐵", traits: "聪明、机灵、幽默、多才多艺", lucky: "鼠、龙", element: "金" },
    { name: "鸡", emoji: "🐔", traits: "勤奋、守时、自信、有组织", lucky: "牛、龙、蛇", element: "金" },
    { name: "狗", emoji: "🐶", traits: "忠诚、正直、勇敢、有责任感", lucky: "虎、兔、马", element: "土" },
    { name: "猪", emoji: "🐷", traits: "善良、慷慨、乐观、有福气", lucky: "羊、兔、虎", element: "水" },
  ];

  const getZodiac = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const year = date.getFullYear();
    // 生肖按农历计算，这里简化为按公历年份计算
    // 实际应该考虑春节，为简化起见按年份计算
    const index = (year - 4) % 12;
    return { ...zodiacs[index], year };
  };

  const result = getZodiac(birthday);

  return (
    <ToolLayout
      title="生肖查询"
      description="根据出生年份查询十二生肖，查看生肖性格特点、相合属相和五行属性"
      toolId="chinese-zodiac"
      icon={PawPrint}
      category="生活工具"
      slug="chinese-zodiac"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PawPrint className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold">出生日期</h2>
          </div>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono text-lg"
          />
          <p className="mt-2 text-xs text-zinc-500">* 生肖按公历年计算，实际应以农历春节为准</p>
        </div>

        {result && (
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 p-6">
            <div className="text-center">
              <div className="text-7xl mb-4">{result.emoji}</div>
              <h2 className="text-3xl font-bold text-emerald-400 mb-1">属 {result.name}</h2>
              <div className="text-sm text-zinc-400">{result.year} 年出生</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">五行</div>
                <div className="text-lg font-bold text-emerald-400">{result.element}</div>
              </div>
              <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">相合生肖</div>
                <div className="text-lg font-bold text-emerald-400">{result.lucky}</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-zinc-900/50 rounded-xl">
              <div className="text-xs text-zinc-500 mb-2">性格特点</div>
              <div className="text-sm text-zinc-300">{result.traits}</div>
            </div>
          </div>
        )}

        {/* 全部生肖 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold">十二生肖</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {zodiacs.map((z, i) => (
              <div
                key={z.name}
                className={`p-4 rounded-xl border text-center transition-colors ${
                  result?.name === z.name
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-zinc-900/50 border-zinc-700 hover:border-zinc-600"
                }`}
              >
                <div className="text-4xl mb-2">{z.emoji}</div>
                <div className="text-sm font-medium text-zinc-300">{z.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
