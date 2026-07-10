"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Scroll, Search } from "lucide-react";

interface Poem {
  title: string;
  author: string;
  dynasty: string;
  content: string;
}

const POEMS: Poem[] = [
  { title: "静夜思", author: "李白", dynasty: "唐", content: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。" },
  { title: "春晓", author: "孟浩然", dynasty: "唐", content: "春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。" },
  { title: "登鹳雀楼", author: "王之涣", dynasty: "唐", content: "白日依山尽，黄河入海流。\n欲穷千里目，更上一层楼。" },
  { title: "望庐山瀑布", author: "李白", dynasty: "唐", content: "日照香炉生紫烟，遥看瀑布挂前川。\n飞流直下三千尺，疑是银河落九天。" },
  { title: "早发白帝城", author: "李白", dynasty: "唐", content: "朝辞白帝彩云间，千里江陵一日还。\n两岸猿声啼不住，轻舟已过万重山。" },
  { title: "绝句", author: "杜甫", dynasty: "唐", content: "两个黄鹂鸣翠柳，一行白鹭上青天。\n窗含西岭千秋雪，门泊东吴万里船。" },
  { title: "春夜喜雨", author: "杜甫", dynasty: "唐", content: "好雨知时节，当春乃发生。\n随风潜入夜，润物细无声。" },
  { title: "望岳", author: "杜甫", dynasty: "唐", content: "岱宗夫如何，齐鲁青未了。\n造化钟神秀，阴阳割昏晓。" },
  { title: "枫桥夜泊", author: "张继", dynasty: "唐", content: "月落乌啼霜满天，江枫渔火对愁眠。\n姑苏城外寒山寺，夜半钟声到客船。" },
  { title: "游子吟", author: "孟郊", dynasty: "唐", content: "慈母手中线，游子身上衣。\n临行密密缝，意恐迟迟归。\n谁言寸草心，报得三春晖。" },
  { title: "咏鹅", author: "骆宾王", dynasty: "唐", content: "鹅鹅鹅，曲项向天歌。\n白毛浮绿水，红掌拨清波。" },
  { title: "赋得古原草送别", author: "白居易", dynasty: "唐", content: "离离原上草，一岁一枯荣。\n野火烧不尽，春风吹又生。" },
  { title: "悯农", author: "李绅", dynasty: "唐", content: "锄禾日当午，汗滴禾下土。\n谁知盘中餐，粒粒皆辛苦。" },
  { title: "江雪", author: "柳宗元", dynasty: "唐", content: "千山鸟飞绝，万径人踪灭。\n孤舟蓑笠翁，独钓寒江雪。" },
  { title: "清明", author: "杜牧", dynasty: "唐", content: "清明时节雨纷纷，路上行人欲断魂。\n借问酒家何处有，牧童遥指杏花村。" },
  { title: "水调歌头·明月几时有", author: "苏轼", dynasty: "宋", content: "明月几时有，把酒问青天。\n不知天上宫阙，今夕是何年。\n但愿人长久，千里共婵娟。" },
  { title: "念奴娇·赤壁怀古", author: "苏轼", dynasty: "宋", content: "大江东去，浪淘尽，千古风流人物。\n故垒西边，人道是，三国周郎赤壁。" },
  { title: "春望", author: "杜甫", dynasty: "唐", content: "国破山河在，城春草木深。\n感时花溅泪，恨别鸟惊心。" },
  { title: "回乡偶书", author: "贺知章", dynasty: "唐", content: "少小离家老大回，乡音无改鬓毛衰。\n儿童相见不相识，笑问客从何处来。" },
  { title: "黄鹤楼", author: "崔颢", dynasty: "唐", content: "昔人已乘黄鹤去，此地空余黄鹤楼。\n黄鹤一去不复返，白云千载空悠悠。" },
];

export default function ChinesePoemSearchPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return POEMS;
    const q = query.toLowerCase();
    return POEMS.filter(
      (p) => p.title.includes(query) || p.author.includes(query) || p.content.includes(query) || p.dynasty.includes(query)
    );
  }, [query]);

  return (
    <ToolLayout title="古诗词搜索" description="搜索中国古典诗词，支持按作者、标题、内容查找" icon={Scroll} category="查询工具" slug="chinese-poem-search">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索诗名、作者、内容或朝代..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 首诗</div>

        <div className="space-y-4">
          {filtered.map((poem, i) => (
            <div key={i} className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-baseline justify-between mb-3">
                <h4 className="text-lg font-bold text-primary-400">{poem.title}</h4>
                <span className="text-sm text-slate-500">{poem.dynasty} · {poem.author}</span>
              </div>
              <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">{poem.content}</pre>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配的诗词</div>
        )}
      </div>
    </ToolLayout>
  );
}
