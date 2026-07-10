"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { MessageCircle, Search } from "lucide-react";

interface Proverb {
  text: string;
  type: string;
  meaning: string;
}

const PROVERBS: Proverb[] = [
  { text: "瑞雪兆丰年", type: "谚语", meaning: "适时的冬雪预示着来年是丰收之年。" },
  { text: "朝霞不出门，晚霞行千里", type: "谚语", meaning: "早晨出现霞光说明天气不好不宜出门，傍晚出现霞光说明天气晴朗可以远行。" },
  { text: "春雨贵如油", type: "谚语", meaning: "春天的雨水像油一样珍贵，形容春雨对农作物的重要性。" },
  { text: "蚂蚁搬家蛇过道，明日必有大雨到", type: "谚语", meaning: "观察动物行为可以预测天气变化。" },
  { text: "竹篮打水——一场空", type: "歇后语", meaning: "比喻白费力气，没有效果。" },
  { text: "芝麻开花——节节高", type: "歇后语", meaning: "比喻步步高升，不断进步。" },
  { text: "外甥打灯笼——照旧（舅）", type: "歇后语", meaning: "谐音歇后语，意思是照旧、和原来一样。" },
  { text: "哑巴吃黄连——有苦说不出", type: "歇后语", meaning: "比喻有苦衷无法诉说。" },
  { text: "泥菩萨过江——自身难保", type: "歇后语", meaning: "比喻连自己都保护不了，更顾不上别人。" },
  { text: "老鼠过街——人人喊打", type: "歇后语", meaning: "比喻害人的东西，人人痛恨。" },
  { text: "三个臭皮匠——顶个诸葛亮", type: "歇后语", meaning: "比喻人多智慧大，集思广益的力量大。" },
  { text: "王婆卖瓜——自卖自夸", type: "歇后语", meaning: "比喻自我吹嘘，自我夸耀。" },
  { text: "百闻不如一见", type: "谚语", meaning: "听到一百次不如见到一次，指亲眼看到才更真实可信。" },
  { text: "不入虎穴，焉得虎子", type: "谚语", meaning: "比喻不经历艰险，就不能取得成功。" },
  { text: "吃一堑，长一智", type: "谚语", meaning: "受到一次挫折，便得到一次教训，增长一分智慧。" },
  { text: "尺有所短，寸有所长", type: "谚语", meaning: "比喻各有长处和短处，没有任何事物是完美的。" },
  { text: "失败乃成功之母", type: "谚语", meaning: "失败是成功的基础，从失败中吸取教训才能获得成功。" },
  { text: "滴水之恩，当涌泉相报", type: "谚语", meaning: "即使是受人一点小小的恩惠，也应当加倍报答。" },
  { text: "火车跑得快，全靠车头带", type: "谚语", meaning: "比喻一个团队的发展需要好的领导者带领。" },
  { text: "姜还是老的辣", type: "谚语", meaning: "比喻年长的人经验丰富，做事更加老练。" },
  { text: "世上无难事，只怕有心人", type: "谚语", meaning: "只要下定决心，就没有办不好的事情。" },
  { text: "台上一分钟，台下十年功", type: "谚语", meaning: "比喻表面上的成功背后是长期的刻苦努力。" },
  { text: "猪八戒照镜子——里外不是人", type: "歇后语", meaning: "比喻夹在中间，两头不讨好。" },
  { text: "刘备借荆州——有借无还", type: "歇后语", meaning: "比喻借了东西不归还。" },
  { text: "关羽降曹操——身在曹营心在汉", type: "歇后语", meaning: "比喻身在这里，心在别处。" },
];

export default function ChineseProverbPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");

  const filtered = useMemo(() => {
    let result = PROVERBS;
    if (typeFilter !== "全部") result = result.filter((p) => p.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (p) => p.text.includes(query) || p.meaning.includes(query)
      );
    }
    return result;
  }, [query, typeFilter]);

  return (
    <ToolLayout title="谚语俗语查询" description="查询中文谚语、俗语、歇后语及含义解释" icon={MessageCircle} category="查询工具" slug="chinese-proverb">
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索谚语或歇后语..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex gap-2 mb-6">
          {["全部", "谚语", "歇后语"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                typeFilter === t
                  ? "bg-primary-500/20 text-primary-400 border border-primary-500/30"
                  : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条结果</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p, i) => (
            <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-base font-bold text-white">{p.text}</h4>
                <span className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-md flex-shrink-0">{p.type}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{p.meaning}</p>
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
