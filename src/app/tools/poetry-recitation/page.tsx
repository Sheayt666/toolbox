"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ScrollText, Search, Volume2, ChevronDown, ChevronUp } from "lucide-react";

interface Poem {
  title: string;
  author: string;
  dynasty: string;
  content: string;
  translation: string;
  grade: string;
  recited: boolean;
}

const POEMS_DATA: Omit<Poem, "recited">[] = [
  { title: "静夜思", author: "李白", dynasty: "唐", content: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。", translation: "明亮的月光洒在床前的窗户上，好像地上泛起了一层白霜。\n我禁不住抬起头来，看那窗外天空中的一轮明月，不由得低下头来沉思，想起远方的家乡。", grade: "小学" },
  { title: "春晓", author: "孟浩然", dynasty: "唐", content: "春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。", translation: "春日里贪睡不知不觉天就亮了，到处可以听到小鸟的鸣叫声。\n回想昨夜的阵阵风雨声，不知吹落了多少美丽的春花。", grade: "小学" },
  { title: "登鹳雀楼", author: "王之涣", dynasty: "唐", content: "白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。", translation: "夕阳依傍着西山慢慢地沉没，滔滔黄河朝着东海汹涌奔流。\n若想把千里的风光景物看够，那就要登上更高的一层城楼。", grade: "小学" },
  { title: "望庐山瀑布", author: "李白", dynasty: "唐", content: "日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。", translation: "太阳照射的香炉峰生起紫色烟霞，远远望去瀑布像白绢挂在山前。\n瀑布凌空而起飞流直下三千尺，让人怀疑是银河从九天倾泻而下。", grade: "小学" },
  { title: "悯农", author: "李绅", dynasty: "唐", content: "锄禾日当午，汗滴禾下土。\n谁知盘中餐，粒粒皆辛苦。", translation: "盛夏中午烈日当空农民还在劳作，汗珠滴入禾苗生长的土壤里。\n谁知道我们盘中的饭食每粒每颗都是农民辛勤劳作得来的。", grade: "小学" },
  { title: "游子吟", author: "孟郊", dynasty: "唐", content: "慈母手中线，游子身上衣。\n临行密密缝，意恐迟迟归。\n谁言寸草心，报得三春晖。", translation: "慈母用手中的针线为远行的儿子赶制身上的衣衫。\n临行前一针针密密地缝缀，怕的是儿子回来得晚衣服破损。\n有谁敢说子女像小草那样微弱的孝心，能够报答得了像春晖普泽的慈母恩情呢？", grade: "小学" },
  { title: "清明", author: "杜牧", dynasty: "唐", content: "清明时节雨纷纷，路上行人欲断魂。\n借问酒家何处有，牧童遥指杏花村。", translation: "江南清明时节细雨纷纷飘洒，路上羁旅行人个个落魄断魂。\n询问当地之人何处买酒消愁，牧童笑而不答指了指杏花深处的村庄。", grade: "小学" },
  { title: "春夜喜雨", author: "杜甫", dynasty: "唐", content: "好雨知时节，当春乃发生。\n随风潜入夜，润物细无声。", translation: "好雨知道下雨的节气，正是在春天植物萌发生长的时候。\n它伴随着春风在夜里悄悄落下，无声地滋润着大地万物。", grade: "小学" },
  { title: "水调歌头", author: "苏轼", dynasty: "宋", content: "明月几时有，把酒问青天。\n不知天上宫阙，今夕是何年。\n但愿人长久，千里共婵娟。", translation: "明月从什么时候开始有的呢？我拿着酒杯遥问苍天。\n不知道天上的宫殿，今晚是哪一年。\n只希望这世上所有人的亲人都能平安健康，即使相隔千里也能共享美好的月光。", grade: "初中" },
  { title: "沁园春·雪", author: "毛泽东", dynasty: "近现代", content: "北国风光，千里冰封，万里雪飘。\n望长城内外，惟余莽莽；\n大河上下，顿失滔滔。\n江山如此多娇，引无数英雄竞折腰。", translation: "北方的风光，千里冰封，万里雪飘。\n眺望长城内外，只剩下白茫茫一片；\n宽广的黄河上下，顿时失去了滔滔水势。\n江山如此媚娇，引得无数英雄竞相倾倒。", grade: "初中" },
];

export default function PoetryRecitationPage() {
  const [query, setQuery] = useState("");
  const [poems, setPoems] = useState(POEMS_DATA.map((p) => ({ ...p, recited: false })));
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return poems;
    return poems.filter((p) => p.title.includes(query) || p.author.includes(query) || p.content.includes(query));
  }, [query, poems]);

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text.replace(/\n/g, " "));
      u.lang = "zh-CN";
      u.rate = 0.7;
      speechSynthesis.speak(u);
    }
  };

  const toggleRecited = (i: number) => {
    const newPoems = [...poems];
    const realIndex = poems.findIndex((p) => p === filtered[i]);
    newPoems[realIndex] = { ...newPoems[realIndex], recited: !newPoems[realIndex].recited };
    setPoems(newPoems);
  };

  const recitedCount = poems.filter((p) => p.recited).length;

  return (
    <ToolLayout title="古诗词背诵" description="中小学必背古诗词学习" icon={ScrollText} category="教育学习" slug="poetry-recitation">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索诗词..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
          </div>
          <span className="text-sm text-emerald-400">已背: {recitedCount}/{poems.length}</span>
        </div>

        <div className="space-y-3">
          {filtered.map((poem, i) => (
            <div key={i} className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-baseline gap-3">
                  <h4 className="text-lg font-bold text-primary-400">{poem.title}</h4>
                  <span className="text-sm text-slate-500">{poem.dynasty} · {poem.author}</span>
                  <span className="text-xs px-2 py-0.5 bg-[#27272a] text-slate-400 rounded">{poem.grade}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => speak(poem.content)} className="p-2 text-slate-400 hover:text-primary-400 transition-colors"><Volume2 className="w-4 h-4" /></button>
                  <button onClick={() => toggleRecited(i)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${poem.recited ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#27272a] text-slate-400"}`}>{poem.recited ? "已背" : "标记背诵"}</button>
                </div>
              </div>
              <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap font-sans mb-2">{poem.content}</pre>
              <button onClick={() => setExpanded(expanded === i ? null : i)} className="text-sm text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                {expanded === i ? <>收起译文 <ChevronUp className="w-3 h-3" /></> : <>查看译文 <ChevronDown className="w-3 h-3" /></>}
              </button>
              {expanded === i && <p className="text-sm text-slate-400 mt-2 leading-relaxed p-3 bg-[#18181b] rounded-lg">{poem.translation}</p>}
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配的诗词</div>}
      </div>
    </ToolLayout>
  );
}
