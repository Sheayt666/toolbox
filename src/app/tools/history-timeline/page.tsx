"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Landmark, Search } from "lucide-react";

interface Dynasty {
  name: string;
  startYear: number;
  endYear: number;
  founder: string;
  capital: string;
  description: string;
}

const DYNASTIES: Dynasty[] = [
  { name: "夏朝", startYear: -2070, endYear: -1600, founder: "禹", capital: "阳城", description: "中国第一个世袭制王朝，标志着中国进入文明社会" },
  { name: "商朝", startYear: -1600, endYear: -1046, founder: "汤", capital: "亳/殷", description: "青铜器文明的鼎盛时期，出现了甲骨文" },
  { name: "西周", startYear: -1046, endYear: -771, founder: "周武王", capital: "镐京", description: "分封制、宗法制确立，礼乐文明成熟" },
  { name: "东周(春秋)", startYear: -770, endYear: -476, founder: "周平王", capital: "洛邑", description: "诸侯争霸，百家争鸣，孔子、老子等思想家辈出" },
  { name: "东周(战国)", startYear: -475, endYear: -221, founder: "周元王", capital: "洛邑", description: "战国七雄，合纵连横，商鞅变法" },
  { name: "秦朝", startYear: -221, endYear: -207, founder: "秦始皇", capital: "咸阳", description: "中国第一个统一的多民族中央集权国家，统一度量衡、文字" },
  { name: "西汉", startYear: -202, endYear: 8, founder: "刘邦", capital: "长安", description: "文景之治、汉武盛世，丝绸之路开通" },
  { name: "东汉", startYear: 25, endYear: 220, founder: "刘秀", capital: "洛阳", description: "光武中兴，造纸术发明，佛教传入" },
  { name: "三国", startYear: 220, endYear: 280, founder: "曹丕/刘备/孙权", capital: "洛阳/成都/建业", description: "魏蜀吴三足鼎立，群雄逐鹿" },
  { name: "西晋", startYear: 265, endYear: 316, founder: "司马炎", capital: "洛阳", description: "短暂统一，八王之乱后衰落" },
  { name: "东晋", startYear: 317, endYear: 420, founder: "司马睿", capital: "建康", description: "偏安江南，王谢堂前燕，书法艺术繁荣" },
  { name: "南北朝", startYear: 420, endYear: 589, founder: "刘裕/拓跋珪", capital: "建康/平城", description: "南北对峙，民族融合，佛教兴盛" },
  { name: "隋朝", startYear: 581, endYear: 618, founder: "杨坚", capital: "大兴", description: "重新统一中国，开凿大运河，创立科举制" },
  { name: "唐朝", startYear: 618, endYear: 907, founder: "李渊", capital: "长安", description: "贞观之治、开元盛世，诗歌文化达到巅峰" },
  { name: "宋朝", startYear: 960, endYear: 1279, founder: "赵匡胤", capital: "开封/临安", description: "经济文化高度繁荣，活字印刷术发明" },
  { name: "元朝", startYear: 1271, endYear: 1368, founder: "忽必烈", capital: "大都", description: "蒙古族建立的统一王朝，疆域辽阔" },
  { name: "明朝", startYear: 1368, endYear: 1644, founder: "朱元璋", capital: "南京/北京", description: "郑和下西洋，修筑万里长城，资本主义萌芽" },
  { name: "清朝", startYear: 1644, endYear: 1912, founder: "皇太极", capital: "北京", description: "康乾盛世，鸦片战争后沦为半殖民地" },
];

function formatYear(year: number): string {
  return year < 0 ? `公元前${-year}年` : `公元${year}年`;
}

export default function HistoryTimelinePage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return DYNASTIES;
    return DYNASTIES.filter((d) => d.name.includes(query) || d.founder.includes(query) || d.description.includes(query));
  }, [query]);

  return (
    <ToolLayout title="历史时间轴" description="中国历史朝代时间轴" icon={Landmark} category="教育学习" slug="history-timeline">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索朝代、建立者或描述..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
        </div>

        <div className="relative pl-8">
          <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-500 via-primary-500/50 to-transparent" />
          {filtered.map((d, i) => (
            <div key={i} className="relative pb-8">
              <div className="absolute -left-[22px] top-1 w-6 h-6 rounded-full bg-primary-500 border-4 border-[#09090b] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <div className="ml-2 p-5 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 className="text-lg font-bold text-primary-400">{d.name}</h4>
                  <span className="text-xs text-slate-500">{formatYear(d.startYear)} - {formatYear(d.endYear)}</span>
                </div>
                <div className="flex gap-4 mb-3 text-sm">
                  <span className="text-slate-400">建立者: <span className="text-slate-300">{d.founder}</span></span>
                  <span className="text-slate-400">都城: <span className="text-slate-300">{d.capital}</span></span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{d.description}</p>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
