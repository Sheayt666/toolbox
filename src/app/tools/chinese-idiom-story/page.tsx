"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { BookOpen, Search } from "lucide-react";

interface IdiomStory {
  idiom: string;
  pinyin: string;
  story: string;
  meaning: string;
  era: string;
}

const STORIES: IdiomStory[] = [
  { idiom: "画蛇添足", pinyin: "huà shé tiān zú", era: "战国", story: "楚国有人祭祀祖先后，将一壶酒赏给门客。门客们提议在地上画蛇，先画完的人喝酒。一人先画好，见他人未完，便得意地为蛇添上脚。此时另一人画完，夺过酒壶说：蛇本无脚，你为何添脚？于是喝了酒。", meaning: "比喻做了多余的事，反而弄巧成拙。" },
  { idiom: "守株待兔", pinyin: "shǒu zhū dài tù", era: "战国", story: "宋国有个农夫，一天在田里耕地，忽然一只兔子撞死在树桩上。农夫没花力气就白捡了一只兔子，非常高兴。从此他放下农具，整天守在树桩旁，希望再捡到撞死的兔子。结果再也没等到，田地也荒废了。", meaning: "比喻不主动努力，妄想凭侥幸取得成功。" },
  { idiom: "亡羊补牢", pinyin: "wáng yáng bǔ láo", era: "战国", story: "楚襄王荒淫无道，大臣庄辛劝谏他不听。秦国攻占了楚都，楚襄王流亡后才后悔。庄辛说：羊跑了再修补羊圈还不算晚。楚襄王于是重用庄辛，收复了失地。", meaning: "出了问题后及时补救，还不算太迟。" },
  { idiom: "井底之蛙", pinyin: "jǐng dǐ zhī wā", era: "战国", story: "井里的青蛙对东海来的鳖说：我快乐极了！我可以独占一口井的水。鳖想进去看看，但脚太大进不去。鳖告诉青蛙东海的广阔，青蛙听了惊愕不已，才知道自己的见识多么浅薄。", meaning: "比喻见识短浅、目光狭隘的人。" },
  { idiom: "刻舟求剑", pinyin: "kè zhōu qiú jiàn", era: "战国", story: "楚国人坐船渡河，剑掉入水中。他在船舷上刻下记号说：我的剑从这里掉下去的。船到岸后，他从刻记号的地方下水找剑。船已经走了很远，但剑不会跟着船走，自然找不到了。", meaning: "比喻拘泥成法，不懂得随情势变化而变通。" },
  { idiom: "掩耳盗铃", pinyin: "yǎn ěr dào líng", era: "春秋", story: "一个小偷去偷别人家的铃铛，刚一碰铃铛就响了。他想：耳朵听不见的东西就不存在。于是捂住自己的耳朵去偷铃铛，结果铃声照响，他被人当场抓住。", meaning: "比喻自欺欺人。" },
  { idiom: "愚公移山", pinyin: "yú gōng yí shān", era: "战国", story: "愚公家门前有太行、王屋两座大山挡路。九十岁的愚公决定带家人挖山。智叟笑他自不量力。愚公说：我死了有儿子，儿子死了有孙子，子子孙孙无穷尽，山却不会增高，总有一天能挖平。天帝被感动，派神把山移走了。", meaning: "比喻有毅力，不怕困难，坚持到底。" },
  { idiom: "叶公好龙", pinyin: "yè gōng hào lóng", era: "春秋", story: "叶公子高非常喜欢龙，家里到处画着龙、刻着龙。天上的真龙听说后，下到人间拜访他。龙的头伸进窗户，尾巴拖在厅堂。叶公一见真龙，吓得魂飞魄散，转身就跑。", meaning: "比喻表面上爱好某事物，实际上并非真爱。" },
  { idiom: "狐假虎威", pinyin: "hú jiǎ hǔ wēi", era: "战国", story: "老虎抓住了一只狐狸。狐狸说：你不能吃我，天帝派我做百兽之王，你若不信就跟在我后面走，看百兽见我是不是都害怕。老虎跟着狐狸走，百兽见老虎都逃跑了。老虎以为百兽怕狐狸，其实怕的是自己。", meaning: "比喻依仗别人的权势来欺压人。" },
  { idiom: "拔苗助长", pinyin: "bá miáo zhù zhǎng", era: "战国", story: "宋国人嫌自己田里的禾苗长得太慢，就到田里把禾苗一棵棵往上拔高。他疲惫地回家对家人说：今天太累了，我帮禾苗长高了。儿子跑去田里一看，禾苗全都枯萎了。", meaning: "比喻违反事物发展规律，急于求成反而坏事。" },
  { idiom: "南辕北辙", pinyin: "nán yuán běi zhé", era: "战国", story: "有人要去楚国，却驾车向北走。朋友说：楚国在南边，你怎么往北走？那人说：我的马好、钱多、车夫技术好。朋友说：方向错了，条件越好离目标越远。", meaning: "比喻行动和目的相反。" },
  { idiom: "滥竽充数", pinyin: "làn yú chōng shù", era: "战国", story: "齐宣王喜欢听合奏，南郭先生不会吹竽却混在乐队里充数。齐宣王死后，齐湣王喜欢听独奏，南郭先生只好逃跑了。", meaning: "比喻没有真才实学的人混在行家里充数。" },
];

export default function ChineseIdiomStoryPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return STORIES;
    return STORIES.filter((s) => s.idiom.includes(query) || s.pinyin.includes(query.toLowerCase()) || s.story.includes(query));
  }, [query]);

  return (
    <ToolLayout title="成语故事" description="成语典故历史故事学习" icon={BookOpen} category="教育学习" slug="chinese-idiom-story">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索成语故事..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
        </div>

        <div className="space-y-4">
          {filtered.map((s, i) => (
            <div key={i} className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-baseline gap-3 mb-3">
                <h4 className="text-xl font-bold text-primary-400">{s.idiom}</h4>
                <span className="text-sm text-slate-500">{s.pinyin}</span>
                <span className="text-xs px-2 py-0.5 bg-[#27272a] text-slate-400 rounded ml-auto">{s.era}</span>
              </div>
              <p className="text-slate-300 leading-relaxed mb-3">{s.story}</p>
              <div className="p-3 bg-[#18181b] rounded-lg">
                <span className="text-sm text-primary-400 font-medium">寓意: </span>
                <span className="text-sm text-slate-400">{s.meaning}</span>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配的成语故事</div>}
      </div>
    </ToolLayout>
  );
}
