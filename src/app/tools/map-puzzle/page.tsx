"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Puzzle, RotateCcw, Check, X } from "lucide-react";

const PROVINCES = [
  "北京", "上海", "广东", "浙江", "江苏", "四川", "湖北", "湖南",
  "山东", "河南", "河北", "福建", "安徽", "江西", "辽宁", "吉林",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MapPuzzlePage() {
  const [questions, setQuestions] = useState(() => shuffle(PROVINCES).slice(0, 8));
  const [shuffled, setShuffled] = useState(() => shuffle(PROVINCES).slice(0, 8));
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);

  const handleSelect = (province: string) => {
    if (matched[province]) return;
    if (!selected) { setSelected(province); return; }
    if (selected === province) {
      setMatched({ ...matched, [province]: true });
      setSelected(null);
    } else {
      setWrong(province);
      setTimeout(() => { setWrong(null); setSelected(null); }, 600);
    }
  };

  const allMatched = Object.keys(matched).length === questions.length;

  const handleRestart = () => {
    const q = shuffle(PROVINCES).slice(0, 8);
    setQuestions(q);
    setShuffled(shuffle(q));
    setMatched({});
    setSelected(null);
    setWrong(null);
  };

  return (
    <ToolLayout title="地图拼图" description="中国省份地图拼图游戏" icon={Puzzle} category="教育学习" slug="map-puzzle">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">已匹配: {Object.keys(matched).length} / {questions.length}</span>
            <button onClick={handleRestart} className="px-4 py-2 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-lg hover:border-[#3f3f46] transition-colors inline-flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" />重新开始</button>
          </div>

          {allMatched && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center mb-6">
              <div className="text-5xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-emerald-400">恭喜完成！</h3>
              <p className="text-slate-400 text-sm mt-1">你成功匹配了所有省份！</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">目标省份（按顺序点击匹配）</h4>
              <div className="space-y-2">
                {questions.map((p, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-center font-medium transition-all ${
                    matched[p] ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                    selected === p ? "bg-primary-500/10 border-primary-500/30 text-primary-400" :
                    wrong === p ? "bg-red-500/10 border-red-500/30 text-red-400" :
                    "bg-[#09090b] border-[#27272a] text-slate-300"
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      {matched[p] && <Check className="w-4 h-4" />}
                      {wrong === p && <X className="w-4 h-4" />}
                      <span>{i + 1}. {p}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">打乱的省份（点击选择）</h4>
              <div className="grid grid-cols-2 gap-2">
                {shuffled.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(p)}
                    disabled={matched[p]}
                    className={`p-3 rounded-xl border font-medium transition-all ${
                      matched[p] ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50" :
                      selected === p ? "bg-primary-500/10 border-primary-500/30 text-primary-400" :
                      wrong === p ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      "bg-[#09090b] border-[#27272a] hover:border-primary-500/30 text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
            <p className="text-sm text-slate-400">
              <span className="text-primary-400 font-medium">游戏规则：</span>
              先在左侧选择一个目标省份，然后在右侧点击对应的省份名称进行匹配。匹配正确则消除，错误则重新选择。
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
