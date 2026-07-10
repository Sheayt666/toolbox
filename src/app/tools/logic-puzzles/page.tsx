"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { GitBranch, CheckCircle, XCircle, RotateCcw, Lightbulb } from "lucide-react";

interface Puzzle {
  question: string;
  hint: string;
  answer: string;
  explanation: string;
}

const PUZZLES: Puzzle[] = [
  { question: "一个农夫要带一只狼、一只羊和一棵白菜过河。船只能载农夫和一样东西。狼会吃羊，羊会吃白菜。农夫如何安全过河？", hint: "注意羊是最危险的，需要多次来回", answer: "农夫带羊过河→空手回→带狼过河→带羊回→带白菜过河→空手回→带羊过河", explanation: "关键在于把羊带回来一次，确保狼和白菜不会单独在一起。" },
  { question: "有3个开关在楼下，分别控制楼上的3盏灯。你在楼下看不到楼上。只能上楼一次，如何确定哪个开关控制哪盏灯？", hint: "利用灯泡发热的特性", answer: "打开开关A等10分钟，关闭A打开B，上楼查看：亮的对应B，不亮但热的对应A，不亮且冷的对应C", explanation: "利用灯泡通电后会发热的物理特性来区分。" },
  { question: "一个装满水的杯子，放入一块石头后水位上升。如果放入一块木头呢？", hint: "木头浮在水面上", answer: "水位也会上升，但上升幅度等于木头排开水的重量", explanation: "根据阿基米德原理，浮在水面上的物体排开水的重量等于物体本身的重量。" },
  { question: "小明说：我后天就10岁了，但是去年我还是7岁。这有可能吗？", hint: "考虑日期的边界", answer: "有可能。如果小明今年1月2日满9岁，说话时是12月31日。去年（12月31日前）他是7岁，1月2日后满9岁，后天（1月2日）满10岁是不对的...正确：说话时是12月31日，前天满9岁，去年是7岁，后天1月2日还是9岁。", explanation: "这道题需要考虑日期边界的特殊情况。" },
  { question: "有10个人排成一队。从第1个人开始1至3报数，报到3的人出列。然后从下一个人重新开始1至3报数。最后剩下的是第几个人？", hint: "这是一个经典的约瑟夫环问题", answer: "第4个人", explanation: "约瑟夫环问题，通过模拟或数学公式可以计算出最后留下的人的位置。" },
  { question: "有25匹马，5条赛道，没有计时器。最少需要赛几次才能找出跑得最快的3匹马？", hint: "先分组赛，再比较各组第一名", answer: "7次", explanation: "先分5组各赛1次（5次），5个第一名赛1次（6次），取冠军组2、3名和亚军组1、2名和季军组1名共5匹马再赛1次（7次）。" },
  { question: "有两个不透明的桶，一个装5升水，一个装3升水。如何精确得到4升水？（水无限供应）", hint: "利用两个桶的容量差", answer: "装满5升桶→倒入3升桶（剩2升）→倒空3升桶→将5升桶中的2升倒入3升桶→装满5升桶→倒入3升桶至满（倒出1升）→5升桶中剩4升", explanation: "利用两个桶的容量差来精确量出所需水量。" },
  { question: "一个房间里有3盏灯，门外有3个开关。你只能进房间一次，如何确定每个开关对应哪盏灯？", hint: "与之前灯泡问题类似，利用热量", answer: "打开开关1等5分钟，关闭1打开2，进房间：亮的是2，不亮但热的是1，不亮且冷的是3", explanation: "利用灯泡通电后发热的特性来区分。" },
  { question: "烧一根不均匀的绳子，从头烧到尾需要1小时。现在有两根绳子，如何精确测出45分钟？", hint: "同时从两端烧", answer: "点燃第一根绳子的两端和第二根绳子的一端。第一根烧完时（30分钟），点燃第二根的另一端，烧完时就是45分钟。", explanation: "从两端同时烧绳子会减半燃烧时间，利用这个原理可以精确计时。" },
  { question: "有100个人，99个是诚实的人，1个是说谎者。你可以问任何人问题。如何用最少的问题找出说谎者？", hint: "可以利用分组比较的方法", answer: "将人分成两组进行比较，通过二分法逐步缩小范围", explanation: "通过分组比较和排除法，可以高效地找到说谎者。" },
];

export default function LogicPuzzlesPage() {
  const [current, setCurrent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [solved, setSolved] = useState<number[]>([]);

  const puzzle = PUZZLES[current];

  const handleNext = () => {
    if (current < PUZZLES.length - 1) { setCurrent(current + 1); setShowHint(false); setShowAnswer(false); }
  };

  const handlePrev = () => {
    if (current > 0) { setCurrent(current - 1); setShowHint(false); setShowAnswer(false); }
  };

  const handleMarkSolved = () => {
    if (!solved.includes(current)) setSolved([...solved, current]);
  };

  const handleRestart = () => { setCurrent(0); setShowHint(false); setShowAnswer(false); setSolved([]); };

  return (
    <ToolLayout title="逻辑推理题" description="逻辑推理思维训练题" icon={GitBranch} category="教育学习" slug="logic-puzzles">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">第 {current + 1} / {PUZZLES.length} 题</span>
            <span className="text-sm text-emerald-400">已解: {solved.length}</span>
          </div>
          <div className="w-full h-2 bg-[#27272a] rounded-full mb-6">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((current + 1) / PUZZLES.length) * 100}%` }} />
          </div>

          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl mb-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">{current + 1}</span>
              <p className="text-slate-200 leading-relaxed pt-1">{puzzle.question}</p>
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <button onClick={() => setShowHint(!showHint)} className="flex-1 px-4 py-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl font-medium transition-colors inline-flex items-center justify-center gap-2"><Lightbulb className="w-4 h-4" />{showHint ? "隐藏提示" : "查看提示"}</button>
            <button onClick={() => setShowAnswer(!showAnswer)} className="flex-1 px-4 py-3 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl font-medium transition-colors">{showAnswer ? "隐藏答案" : "查看答案"}</button>
          </div>

          {showHint && (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4">
              <div className="text-xs text-amber-400 font-medium mb-1">提示</div>
              <p className="text-sm text-slate-400">{puzzle.hint}</p>
            </div>
          )}

          {showAnswer && (
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl mb-4">
              <div className="text-xs text-emerald-400 font-medium mb-1">答案</div>
              <p className="text-sm text-slate-300 mb-2">{puzzle.answer}</p>
              <div className="text-xs text-slate-500 font-medium mb-1 mt-3">解析</div>
              <p className="text-sm text-slate-400">{puzzle.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handlePrev} disabled={current === 0} className="px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] disabled:opacity-30 transition-colors">上一题</button>
            {!solved.includes(current) && <button onClick={handleMarkSolved} className="flex-1 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-medium transition-colors inline-flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" />标记已解决</button>}
            {solved.includes(current) && <div className="flex-1 px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/50 rounded-xl font-medium text-center inline-flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" />已解决</div>}
            <button onClick={handleNext} disabled={current === PUZZLES.length - 1} className="px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-30 text-white rounded-xl font-medium transition-colors">下一题</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
