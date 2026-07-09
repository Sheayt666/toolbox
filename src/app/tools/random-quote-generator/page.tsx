"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Quote, Copy, Check, RefreshCw, Sparkles } from "lucide-react";

interface Quote {
  text: string;
  author: string;
  category: string;
}

const quotes: Quote[] = [
  // 人生哲理
  { text: "生活不是等待暴风雨过去，而是学会在雨中跳舞。", author: "维维安·格林", category: "人生哲理" },
  { text: "人生就像骑自行车，要保持平衡就得不断前进。", author: "爱因斯坦", category: "人生哲理" },
  { text: "你不能决定生命的长度，但你可以控制它的宽度。", author: "未知", category: "人生哲理" },
  { text: "世界上只有一种真正的英雄主义，那就是在认清生活真相之后依然热爱生活。", author: "罗曼·罗兰", category: "人生哲理" },
  { text: "人生的意义不在于拿一手好牌，而在于打好一手坏牌。", author: "弗洛伊德", category: "人生哲理" },
  { text: "不要为小事遮住视线，我们还有更大的世界。", author: "未知", category: "人生哲理" },
  // 励志
  { text: "成功不是终点，失败也并非末日，重要的是继续前行的勇气。", author: "丘吉尔", category: "励志" },
  { text: "千里之行，始于足下。", author: "老子", category: "励志" },
  { text: "天将降大任于斯人也，必先苦其心志，劳其筋骨。", author: "孟子", category: "励志" },
  { text: "宝剑锋从磨砺出，梅花香自苦寒来。", author: "古训", category: "励志" },
  { text: "只要功夫深，铁杵磨成针。", author: "古训", category: "励志" },
  { text: "行动是治愈恐惧的良药，而犹豫拖延将不断滋养恐惧。", author: "戴尔·卡内基", category: "励志" },
  // 学习
  { text: "学而不思则罔，思而不学则殆。", author: "孔子", category: "学习" },
  { text: "知之为知之，不知为不知，是知也。", author: "孔子", category: "学习" },
  { text: "活到老，学到老。", author: "古训", category: "学习" },
  { text: "读书破万卷，下笔如有神。", author: "杜甫", category: "学习" },
  { text: "书山有路勤为径，学海无涯苦作舟。", author: "韩愈", category: "学习" },
  { text: "我学习了一生，现在我还在学习。", author: "别林斯基", category: "学习" },
  // 爱情
  { text: "两情若是久长时，又岂在朝朝暮暮。", author: "秦观", category: "爱情" },
  { text: "曾经沧海难为水，除却巫山不是云。", author: "元稹", category: "爱情" },
  { text: "人生若只如初见，何事秋风悲画扇。", author: "纳兰性德", category: "爱情" },
  { text: "问世间情为何物，直教生死相许。", author: "元好问", category: "爱情" },
  { text: "衣带渐宽终不悔，为伊消得人憔悴。", author: "柳永", category: "爱情" },
  { text: "爱情不是互相凝视，而是共同朝一个方向凝视。", author: "圣埃克苏佩里", category: "爱情" },
  // 成功
  { text: "天才是百分之一的灵感加百分之九十九的汗水。", author: "爱迪生", category: "成功" },
  { text: "失败是成功之母。", author: "古训", category: "成功" },
  { text: "机会只偏爱有准备的头脑。", author: "巴斯德", category: "成功" },
  { text: "胜利属于最坚忍的人。", author: "拿破仑", category: "成功" },
  { text: "成功的秘诀，在永不改变既定的目的。", author: "卢梭", category: "成功" },
  { text: "伟大的工作，并不是用力量而是用耐心去完成的。", author: "约翰逊", category: "成功" },
  // 友谊
  { text: "海内存知己，天涯若比邻。", author: "王勃", category: "友谊" },
  { text: "莫愁前路无知己，天下谁人不识君。", author: "高适", category: "友谊" },
  { text: "桃花潭水深千尺，不及汪伦送我情。", author: "李白", category: "友谊" },
  { text: "患难识朋友。", author: "列宁", category: "友谊" },
  { text: "友谊是两颗心真诚相待，而不是一颗心对另一颗心的敲打。", author: "鲁迅", category: "友谊" },
  // 时间
  { text: "一寸光阴一寸金，寸金难买寸光阴。", author: "古训", category: "时间" },
  { text: "逝者如斯夫，不舍昼夜。", author: "孔子", category: "时间" },
  { text: "莫等闲，白了少年头，空悲切。", author: "岳飞", category: "时间" },
  { text: "时间就像海绵里的水，只要愿挤，总还是有的。", author: "鲁迅", category: "时间" },
  { text: "你热爱生命吗？那么别浪费时间，因为时间是组成生命的材料。", author: "富兰克林", category: "时间" },
];

const categories = ["全部", "人生哲理", "励志", "学习", "爱情", "成功", "友谊", "时间"];

export default function RandomQuoteGeneratorPage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [category, setCategory] = useState("全部");
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const generateQuote = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const filteredQuotes =
        category === "全部"
          ? quotes
          : quotes.filter((q) => q.category === category);
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      setQuote(filteredQuotes[randomIndex]);
      setIsAnimating(false);
    }, 300);
  }, [category]);

  const copyQuote = useCallback(() => {
    if (!quote) return;
    const text = `${quote.text}\n\n—— ${quote.author}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [quote]);

  // 初始生成
  if (!quote) {
    // 使用初始渲染
    const initial = quotes[Math.floor(Math.random() * quotes.length)];
    if (typeof window !== "undefined") {
      setTimeout(() => setQuote(initial), 0);
    }
  }

  return (
    <ToolLayout
      title="随机名言生成器"
      description="随机生成名人名言和经典语录，涵盖人生哲理、励志、学习、爱情等多个分类"
      icon={Quote}
      category="生成工具"
      slug="random-quote-generator"
      toolId="random-quote-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">名言生成</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">分类：</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={generateQuote}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
          >
            <RefreshCw className={`w-4 h-4 ${isAnimating ? "animate-spin" : ""}`} />
            换一条
          </button>
        </div>
      </div>

      {/* 名言展示 */}
      <div className="p-8 md:p-12">
        <div
          className={`relative transition-all duration-300 ${isAnimating ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"}`}
        >
          {/* 装饰引号 */}
          <Quote className="absolute -top-2 -left-2 w-12 h-12 text-amber-500/20" />

          <div className="relative pl-8 pr-4">
            {quote && (
              <>
                <p className="text-xl md:text-2xl text-white leading-relaxed font-medium">
                  {quote.text}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-px bg-amber-500/50" />
                    <span className="text-slate-400 text-sm">
                      {quote.author}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-amber-500/10 text-amber-400 rounded">
                      {quote.category}
                    </span>
                  </div>
                  <button
                    onClick={copyQuote}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 分类快捷选择 */}
      <div className="px-6 pb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setTimeout(generateQuote, 50);
              }}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                category === c
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="p-5 border-t border-[#27272a]">
        <div className="flex items-center justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-amber-400">{quotes.length}</div>
            <div className="text-xs text-slate-500 mt-1">名言总数</div>
          </div>
          <div className="w-px h-10 bg-[#27272a]" />
          <div>
            <div className="text-2xl font-bold text-amber-400">{categories.length - 1}</div>
            <div className="text-xs text-slate-500 mt-1">分类数量</div>
          </div>
          <div className="w-px h-10 bg-[#27272a]" />
          <div>
            <div className="text-2xl font-bold text-amber-400">
              {category === "全部" ? quotes.length : quotes.filter((q) => q.category === category).length}
            </div>
            <div className="text-xs text-slate-500 mt-1">当前分类</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
