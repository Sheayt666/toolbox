"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileText, Search } from "lucide-react";

interface Radical {
  radical: string;
  name: string;
  strokes: number;
  examples: string[];
}

const RADICALS: Radical[] = [
  { radical: "一", name: "横", strokes: 1, examples: ["天", "大", "本", "末"] },
  { radical: "丨", name: "竖", strokes: 1, examples: ["中", "旧", "甲", "申"] },
  { radical: "丶", name: "点", strokes: 1, examples: ["主", "义", "为", "头"] },
  { radical: "丿", name: "撇", strokes: 1, examples: ["生", "禾", "毛", "白"] },
  { radical: "乙", name: "乙字旁", strokes: 1, examples: ["也", "乞", "乳", "乱"] },
  { radical: "二", name: "二字头", strokes: 2, examples: ["些", "于", "井", "亚"] },
  { radical: "十", name: "十字头", strokes: 2, examples: ["华", "协", "克", "博"] },
  { radical: "厂", name: "厂字旁", strokes: 2, examples: ["厚", "原", "历", "压"] },
  { radical: "人", name: "人字头", strokes: 2, examples: ["会", "合", "全", "令"] },
  { radical: "入", name: "入字头", strokes: 2, examples: ["内", "全", "两", "宋"] },
  { radical: "八", name: "八字头", strokes: 2, examples: ["分", "公", "共", "六"] },
  { radical: "力", name: "力字旁", strokes: 2, examples: ["功", "动", "助", "努"] },
  { radical: "口", name: "口字旁", strokes: 3, examples: ["吃", "唱", "听", "叫"] },
  { radical: "土", name: "土字旁", strokes: 3, examples: ["地", "场", "城", "坐"] },
  { radical: "女", name: "女字旁", strokes: 3, examples: ["好", "妈", "姐", "妹"] },
  { radical: "子", name: "子字旁", strokes: 3, examples: ["孩", "孙", "学", "字"] },
  { radical: "山", name: "山字旁", strokes: 3, examples: ["峰", "岭", "岩", "岛"] },
  { radical: "心", name: "心字底", strokes: 4, examples: ["想", "念", "意", "愿"] },
  { radical: "手", name: "手字旁", strokes: 4, examples: ["打", "拉", "推", "把"] },
  { radical: "木", name: "木字旁", strokes: 4, examples: ["树", "林", "村", "板"] },
  { radical: "水", name: "水字旁(氵)", strokes: 4, examples: ["河", "海", "洗", "清"] },
  { radical: "火", name: "火字旁", strokes: 4, examples: ["烧", "灯", "煤", "烦"] },
  { radical: "日", name: "日字旁", strokes: 4, examples: ["明", "时", "早", "星"] },
  { radical: "月", name: "月字旁", strokes: 4, examples: ["明", "朋", "服", "脸"] },
  { radical: "石", name: "石字旁", strokes: 5, examples: ["破", "硬", "矿", "砖"] },
  { radical: "禾", name: "禾字旁", strokes: 5, examples: ["种", "秋", "和", "利"] },
  { radical: "虫", name: "虫字旁", strokes: 6, examples: ["蚂", "蚁", "蝶", "蜂"] },
  { radical: "竹", name: "竹字头", strokes: 6, examples: ["笔", "笑", "答", "算"] },
  { radical: "艹", name: "草字头", strokes: 3, examples: ["花", "草", "茶", "药"] },
  { radical: "辶", name: "走之旁", strokes: 3, examples: ["过", "这", "道", "远"] },
];

export default function ChineseRadicalPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return RADICALS;
    return RADICALS.filter(
      (r) => r.radical.includes(query) || r.name.includes(query) || r.examples.some((e) => e.includes(query))
    );
  }, [query]);

  return (
    <ToolLayout title="偏旁部首查询" description="查询汉字偏旁部首名称、笔画及相关例字" icon={FileText} category="查询工具" slug="chinese-radical">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索部首、名称或例字..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条结果</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r, i) => (
            <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl font-bold text-primary-400 w-10 text-center">{r.radical}</span>
                <div>
                  <div className="text-white font-medium">{r.name}</div>
                  <div className="text-xs text-slate-500">{r.strokes}画</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.examples.map((ex) => (
                  <span key={ex} className="px-2 py-1 bg-[#27272a] text-slate-300 rounded text-sm">{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配结果</div>
        )}
      </div>
    </ToolLayout>
  );
}
