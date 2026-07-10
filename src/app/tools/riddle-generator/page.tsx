"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Lightbulb, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface Riddle { q: string; a: string; }

const RIDDLES: Riddle[] = [
  { q: "什么东西越洗越脏？", a: "水" },
  { q: "什么门永远关不上？", a: "球门" },
  { q: "什么东西有头没有脚，却能走遍天下？", a: "硬币" },
  { q: "什么布剪不断？", a: "瀑布" },
  { q: "什么鱼不能吃？", a: "木鱼" },
  { q: "什么东西打破了才能用？", a: "鸡蛋" },
  { q: "什么车寸步难行？", a: "风车" },
  { q: "什么东西天气越热它爬得越高？", a: "温度计" },
  { q: "什么动物最像猫？", a: "猫的画像" },
  { q: "什么东西有牙齿却不咬人？", a: "梳子" },
  { q: "什么花不结果？", a: "烟花" },
  { q: "什么书没有字？", a: "天书" },
  { q: "什么水不能喝？", a: "薪水" },
  { q: "什么桥下没有水？", a: "立交桥" },
  { q: "什么东西掉下来世界会变亮？", a: "眼皮" },
  { q: "脑筋急转弯：一个人在沙滩上走，为什么回头看不见自己的脚印？", a: "他倒着走" },
  { q: "什么人一年只工作一天？", a: "圣诞老人" },
  { q: "什么东西你左手能拿，右手不能拿？", a: "右手" },
  { q: "什么字全世界通用？", a: "阿拉伯数字" },
  { q: "什么动物你打了它却流了自己的血？", a: "蚊子" },
  { q: "什么东西越大越没用？", a: "洞" },
  { q: "什么火看不见？", a: "无名火" },
  { q: "什么人始终不敢洗澡？", a: "泥人" },
  { q: "什么时候 1+1 不等于 2？", a: "算错的时候" },
  { q: "什么杯不能装水？", a: "奖杯" },
  { q: "什么东西你有别人也有，但别人用的比你多？", a: "你的名字" },
  { q: "什么东西长了毛就表示成熟了？", a: "玉米" },
  { q: "什么光会给人带来痛苦？", a: "耳光" },
  { q: "什么动物最怕冷？", a: "鸭子（因为嘎嘎嘎=加加加）" },
  { q: "什么树没有叶子？", a: "铁树" },
];

export default function RiddleGeneratorPage() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * RIDDLES.length));
  const [showAnswer, setShowAnswer] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  const next = () => {
    setHistory((h) => [...h, idx]);
    let n = idx;
    while (n === idx && RIDDLES.length > 1) n = Math.floor(Math.random() * RIDDLES.length);
    setIdx(n);
    setShowAnswer(false);
  };

  const prev = () => {
    if (history.length === 0) return;
    const h = [...history];
    const p = h.pop()!;
    setHistory(h);
    setIdx(p);
    setShowAnswer(false);
  };

  const current = RIDDLES[idx];

  return (
    <ToolLayout
      title="谜语生成器"
      description="随机生成谜语和脑筋急转弯"
      icon={Lightbulb}
      category="生成工具"
      slug="riddle-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-[#0a0a0b] border border-amber-500/20 p-8 text-center min-h-[200px] flex flex-col justify-center">
          <div className="text-xs text-amber-400/80 mb-3">第 {idx + 1} / {RIDDLES.length} 题</div>
          <Lightbulb className="w-10 h-10 mx-auto text-amber-400 mb-4" />
          <p className="text-lg text-white leading-relaxed mb-5">{current.q}</p>
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="inline-flex items-center gap-2 mx-auto px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-sm rounded-lg border border-amber-500/30"
          >
            {showAnswer ? <><ChevronUp className="w-4 h-4" /> 收起答案</> : <><ChevronDown className="w-4 h-4" /> 查看答案</>}
          </button>
          {showAnswer && (
            <div className="mt-4 inline-block bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-6 py-3">
              <p className="text-emerald-300 text-lg font-bold">{current.a}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={prev} disabled={history.length === 0} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg disabled:opacity-30">
            上一题
          </button>
          <button onClick={next} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
            <RefreshCw className="w-4 h-4" /> 下一题
          </button>
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            共收录 {RIDDLES.length} 道谜语与脑筋急转弯，随机抽取，可前后翻阅。适合聚会破冰、亲子互动、课堂活跃气氛等场景。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
