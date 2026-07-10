"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PenTool, Search } from "lucide-react";

const CHARACTERS: Record<string, { strokes: string[]; totalStrokes: number; radical: string; pinyin: string; meaning: string }> = {
  "人": { totalStrokes: 2, radical: "人", pinyin: "rén", meaning: "人类、人员", strokes: ["撇(丿): 从右上向左下撇出", "捺(乀): 从左上向右下捺出"] },
  "大": { totalStrokes: 3, radical: "大", pinyin: "dà", meaning: "大小、巨大", strokes: ["横(一): 从左向右写横", "撇(丿): 从横的交叉点向左下撇", "捺(乀): 从交叉点向右下捺"] },
  "中": { totalStrokes: 4, radical: "丨", pinyin: "zhōng", meaning: "中间、中心", strokes: ["竖(丨): 从上向下写竖", "横折(ㄱ): 先横后折向下", "横(一): 中间一横", "竖(丨): 最后封口竖"] },
  "国": { totalStrokes: 8, radical: "囗", pinyin: "guó", meaning: "国家", strokes: ["竖(丨): 左竖", "横折(ㄱ): 上横折", "横(一): 内部横", "横(一): 玉字上横", "竖(丨): 玉字竖", "点(丶): 玉字点", "横(一): 玉字下横", "横(一): 封底横"] },
  "好": { totalStrokes: 6, radical: "女", pinyin: "hǎo", meaning: "好的、美好", strokes: ["撇点(ㄑ): 女字旁第一笔", "撇(丿): 女字旁第二笔", "横(一): 女字旁横", "横折(ㄱ): 子字横折", "竖钩(亅): 子字竖钩", "横(一): 子字横"] },
  "学": { totalStrokes: 8, radical: "子", pinyin: "xué", meaning: "学习", strokes: ["点(丶): 上部点", "点(丶): 上部点", "撇(丿): 撇", "横撇(㇇): 横撇", "横钩(乛): 横钩", "横(一): 内横", "竖弯钩(乚): 子字弯钩", "横(一): 子字横"] },
  "水": { totalStrokes: 4, radical: "水", pinyin: "shuǐ", meaning: "水、液体", strokes: ["竖钩(亅): 中间竖钩", "横撇(㇇): 左边横撇", "撇(丿): 左边撇", "捺(乀): 右边捺"] },
  "火": { totalStrokes: 4, radical: "火", pinyin: "huǒ", meaning: "火焰", strokes: ["点(丶): 左上点", "撇(丿): 左撇", "撇(丿): 右上撇", "捺(乀): 右下捺"] },
  "山": { totalStrokes: 3, radical: "山", pinyin: "shān", meaning: "山脉", strokes: ["竖(丨): 中间竖", "竖折(ㄴ): 左边竖折", "竖(丨): 右边竖"] },
  "天": { totalStrokes: 4, radical: "大", pinyin: "tiān", meaning: "天空", strokes: ["横(一): 上横", "横(一): 下横", "撇(丿): 撇", "捺(乀): 捺"] },
  "口": { totalStrokes: 3, radical: "口", pinyin: "kǒu", meaning: "嘴巴", strokes: ["竖(丨): 左竖", "横折(ㄱ): 上横折", "横(一): 下横"] },
  "日": { totalStrokes: 4, radical: "日", pinyin: "rì", meaning: "太阳、日子", strokes: ["竖(丨): 左竖", "横折(ㄱ): 上横折", "横(一): 中横", "横(一): 下横"] },
  "木": { totalStrokes: 4, radical: "木", pinyin: "mù", meaning: "木头、树木", strokes: ["横(一): 横", "竖(丨): 竖", "撇(丿): 撇", "捺(乀): 捺"] },
  "上": { totalStrokes: 3, radical: "一", pinyin: "shàng", meaning: "上面", strokes: ["竖(丨): 竖", "横(一): 上横", "横(一): 下横"] },
  "下": { totalStrokes: 3, radical: "一", pinyin: "xià", meaning: "下面", strokes: ["横(一): 上横", "竖(丨): 竖", "点(丶): 点"] },
};

export default function ChineseCharacterStrokePage() {
  const [char, setChar] = useState("");
  const [result, setResult] = useState<typeof CHARACTERS[keyof typeof CHARACTERS] | null>(null);
  const [error, setError] = useState("");

  const handleQuery = () => {
    if (!char.trim()) return;
    const c = char.trim().charAt(0);
    const info = CHARACTERS[c];
    if (info) { setResult(info); setError(""); }
    else { setResult(null); setError(`暂未收录汉字"${c}"，请尝试：${Object.keys(CHARACTERS).join("、")}`); }
  };

  return (
    <ToolLayout title="汉字笔顺查询" description="查询汉字的笔画顺序和书写规范" icon={PenTool} category="教育学习" slug="chinese-character-stroke">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input type="text" value={char} onChange={(e) => setChar(e.target.value)} placeholder="输入单个汉字..." maxLength={1} className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors text-center text-xl" />
          </div>
          <button onClick={handleQuery} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">查询</button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-slate-400">快速查询：</span>
          {Object.keys(CHARACTERS).map((c) => (
            <button key={c} onClick={() => { setChar(c); }} className="w-8 h-8 bg-[#09090b] border border-[#27272a] rounded-lg text-primary-400 hover:border-primary-500/30 transition-colors text-lg">{c}</button>
          ))}
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        {result && (
          <div className="space-y-4">
            <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl flex items-center gap-6">
              <span className="text-7xl font-bold text-primary-400">{char.trim().charAt(0)}</span>
              <div>
                <div className="text-white font-medium text-lg">{result.pinyin}</div>
                <div className="text-sm text-slate-400">部首: {result.radical}</div>
                <div className="text-sm text-slate-400">总笔画: {result.totalStrokes}画</div>
                <div className="text-sm text-slate-400">释义: {result.meaning}</div>
              </div>
            </div>
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
              <h4 className="text-sm font-medium text-slate-400 mb-3">笔顺（共{result.totalStrokes}笔）</h4>
              <div className="space-y-2">
                {result.strokes.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-[#18181b] rounded-lg">
                    <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                    <span className="text-slate-300 text-sm">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
