"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { BookMarked, Search } from "lucide-react";

interface GrammarPoint {
  title: string;
  category: string;
  explanation: string;
  examples: string[];
}

const GRAMMAR: GrammarPoint[] = [
  { title: "一般现在时", category: "时态", explanation: "表示经常发生的动作或存在的状态。动词用原形，第三人称单数加-s/-es。", examples: ["I work every day.", "She plays tennis on weekends.", "The sun rises in the east."] },
  { title: "一般过去时", category: "时态", explanation: "表示过去某个时间发生的动作或状态。动词用过去式。", examples: ["I worked yesterday.", "She went to school last week.", "They were happy."] },
  { title: "现在进行时", category: "时态", explanation: "表示现在正在进行的动作。结构：be + doing。", examples: ["I am working now.", "She is reading a book.", "They are playing football."] },
  { title: "现在完成时", category: "时态", explanation: "表示过去发生的动作对现在造成的影响。结构：have/has + done。", examples: ["I have finished my homework.", "She has been to Beijing.", "They have lived here for 10 years."] },
  { title: "一般将来时", category: "时态", explanation: "表示将来要发生的动作。结构：will/shall + do 或 be going to + do。", examples: ["I will go to school tomorrow.", "She is going to visit her grandma.", "It will rain soon."] },
  { title: "被动语态", category: "语态", explanation: "表示主语是动作的承受者。结构：be + 过去分词。", examples: ["The book is written by him.", "English is spoken in many countries.", "The house was built in 1990."] },
  { title: "定语从句", category: "从句", explanation: "修饰名词或代词的从句。关系词有who, which, that, where, when等。", examples: ["The man who is talking is my teacher.", "This is the book that I bought.", "The city where I live is beautiful."] },
  { title: "宾语从句", category: "从句", explanation: "在复合句中作宾语的从句。常用that, if/whether, what等引导。", examples: ["I think that he is right.", "She asked if I could help her.", "I don't know what he wants."] },
  { title: "条件状语从句", category: "从句", explanation: "由if, unless等引导，表示条件。主将从现。", examples: ["If it rains, I will stay home.", "Unless you study hard, you will fail.", "If I were you, I would go."] },
  { title: "名词复数", category: "词法", explanation: "可数名词复数一般加-s/-es，不规则变化需记忆。", examples: ["one book → two books", "one child → two children", "one foot → two feet"] },
  { title: "形容词比较级", category: "词法", explanation: "表示两者之间的比较。单音节加-er，多音节加more。", examples: ["tall → taller → tallest", "beautiful → more beautiful → most beautiful", "good → better → best"] },
  { title: "情态动词", category: "词法", explanation: "表示能力、许可、必须等。can, may, must, should, would等。", examples: ["I can swim.", "You must finish it today.", "She should see a doctor."] },
  { title: "冠词用法", category: "词法", explanation: "a/an用于单数可数名词前表示泛指，the表示特指。", examples: ["I have a book.", "She is an engineer.", "The sun is bright."] },
  { title: "介词搭配", category: "词法", explanation: "常见介词搭配：in, on, at, by, with, for等。", examples: ["in the morning, on Monday, at 8 o'clock", "by bus, with a pen, for you"] },
  { title: "虚拟语气", category: "语气", explanation: "表示与事实相反的假设或愿望。", examples: ["If I were rich, I would travel.", "I wish I could fly.", "He suggests that she go now."] },
];

export default function EnglishGrammarPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");

  const categories = useMemo(() => ["全部", ...Array.from(new Set(GRAMMAR.map((g) => g.category)))], []);
  const filtered = useMemo(() => {
    let r = GRAMMAR;
    if (category !== "全部") r = r.filter((g) => g.category === category);
    if (query.trim()) r = r.filter((g) => g.title.includes(query) || g.explanation.includes(query) || g.category.toLowerCase().includes(query.toLowerCase()));
    return r;
  }, [query, category]);

  return (
    <ToolLayout title="英语语法速查" description="英语语法知识点整理" icon={BookMarked} category="教育学习" slug="english-grammar">
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索语法知识点..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((g, i) => (
            <div key={i} className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-bold text-primary-400">{g.title}</h4>
                <span className="text-xs px-2 py-0.5 bg-[#27272a] text-slate-400 rounded">{g.category}</span>
              </div>
              <p className="text-slate-300 mb-3 leading-relaxed">{g.explanation}</p>
              <div className="space-y-1">
                {g.examples.map((ex, j) => (
                  <div key={j} className="px-3 py-2 bg-[#18181b] rounded-lg text-sm text-slate-400 font-mono">{ex}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
