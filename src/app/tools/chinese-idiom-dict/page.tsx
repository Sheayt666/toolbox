"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { BookOpen, Search } from "lucide-react";

interface Idiom {
  word: string;
  pinyin: string;
  meaning: string;
  origin: string;
  synonyms: string;
  antonyms: string;
}

const IDIOMS: Idiom[] = [
  { word: "画蛇添足", pinyin: "huà shé tiān zú", meaning: "比喻做了多余的事，非但无益，反而不合适。", origin: "《战国策·齐策二》", synonyms: "多此一举、弄巧成拙", antonyms: "画龙点睛、恰到好处" },
  { word: "守株待兔", pinyin: "shǒu zhū dài tù", meaning: "比喻死守经验，不知变通。也指妄想不劳而获。", origin: "《韩非子·五蠹》", synonyms: "刻舟求剑、缘木求鱼", antonyms: "通权达变、随机应变" },
  { word: "亡羊补牢", pinyin: "wáng yáng bǔ láo", meaning: "羊跑了再去修补羊圈，比喻出了问题以后想办法补救。", origin: "《战国策·楚策》", synonyms: "知错就改、悬崖勒马", antonyms: "未雨绸缪、防患未然" },
  { word: "井底之蛙", pinyin: "jǐng dǐ zhī wā", meaning: "井底的青蛙认为天只有井口那么大，比喻见识短浅的人。", origin: "《庄子·秋水》", synonyms: "坐井观天、一孔之见", antonyms: "见多识广、博古通今" },
  { word: "刻舟求剑", pinyin: "kè zhōu qiú jiàn", meaning: "比喻不懂事物已发展变化而仍静止地看问题。", origin: "《吕氏春秋·察今》", synonyms: "守株待兔、墨守成规", antonyms: "通权达变、与时俱进" },
  { word: "邯郸学步", pinyin: "hán dān xué bù", meaning: "比喻模仿别人不到家，反把原来自己会的东西忘了。", origin: "《庄子·秋水》", synonyms: "东施效颦、鹦鹉学舌", antonyms: "标新立异、独辟蹊径" },
  { word: "掩耳盗铃", pinyin: "yǎn ěr dào líng", meaning: "偷铃铛怕别人听见而捂住自己的耳朵，比喻自欺欺人。", origin: "《吕氏春秋·自知》", synonyms: "自欺欺人、弄巧成拙", antonyms: "开诚布公、实事求是" },
  { word: "愚公移山", pinyin: "yú gōng yí shān", meaning: "比喻坚持不懈地改造自然和坚定不移地进行斗争。", origin: "《列子·汤问》", synonyms: "锲而不舍、持之以恒", antonyms: "半途而废、浅尝辄止" },
  { word: "一箭双雕", pinyin: "yī jiàn shuāng diāo", meaning: "一箭射中两只雕，比喻做一件事达到两个目的。", origin: "《北史·长孙晟传》", synonyms: "一举两得、一石二鸟", antonyms: "事倍功半、劳而无功" },
  { word: "胸有成竹", pinyin: "xiōng yǒu chéng zhú", meaning: "比喻在做事之前已经拿定主意。", origin: "苏轼《文与可画筼筜谷偃竹记》", synonyms: "心中有数、运筹帷幄", antonyms: "束手无策、茫然失措" },
  { word: "锦上添花", pinyin: "jǐn shàng tiān huā", meaning: "在锦上再绣花，比喻好上加好，美上添美。", origin: "黄庭坚《了了庵颂》", synonyms: "精益求精、如虎添翼", antonyms: "雪上加霜、落井下石" },
  { word: "水滴石穿", pinyin: "shuǐ dī shí chuān", meaning: "水不停地滴，石头也能被滴穿，比喻只要有恒心，事就能成功。", origin: "《汉书·枚乘传》", synonyms: "锲而不舍、坚持不懈", antonyms: "半途而废、浅尝辄止" },
  { word: "对牛弹琴", pinyin: "duì niú tán qín", meaning: "比喻对不懂事理的人讲道理或言事。", origin: "《理惑论》", synonyms: "白费口舌、对牛弹琴", antonyms: "对症下药、有的放矢" },
  { word: "塞翁失马", pinyin: "sài wēng shī mǎ", meaning: "比喻一时虽然受到损失，也许反而因此能得到好处。", origin: "《淮南子·人间训》", synonyms: "因祸得福、否极泰来", antonyms: "乐极生悲、祸不单行" },
  { word: "自相矛盾", pinyin: "zì xiāng máo dùn", meaning: "比喻自己说话做事前后抵触。", origin: "《韩非子·难一》", synonyms: "格格不入、互相抵触", antonyms: "自圆其说、天衣无缝" },
  { word: "叶公好龙", pinyin: "yè gōng hào lóng", meaning: "比喻表面上爱好某事物，实际上并不真爱好。", origin: "《新序·杂事五》", synonyms: "表里不一、口是心非", antonyms: "名副其实、表里如一" },
  { word: "拔苗助长", pinyin: "bá miáo zhù zhǎng", meaning: "把苗拔起以帮助其生长，比喻违反事物发展规律，急于求成。", origin: "《孟子·公孙丑上》", synonyms: "欲速不达、急功近利", antonyms: "顺其自然、循序渐进" },
  { word: "狐假虎威", pinyin: "hú jiǎ hǔ wēi", meaning: "狐狸借老虎的威风去吓唬别人，比喻仰仗别人的威势来欺压人。", origin: "《战国策·楚策一》", synonyms: "仗势欺人、狗仗人势", antonyms: "独当一面、自立自强" },
  { word: "画龙点睛", pinyin: "huà lóng diǎn jīng", meaning: "比喻在关键地方简明扼要地点明要旨，使内容更加生动有力。", origin: "张僧繇画龙事", synonyms: "锦上添花、点石成金", antonyms: "画蛇添足、多此一举" },
  { word: "班门弄斧", pinyin: "bān mén nòng fǔ", meaning: "在鲁班门前摆弄斧子，比喻在行家面前卖弄本领，不自量力。", origin: "《蓬轩别记》", synonyms: "不自量力、贻笑大方", antonyms: "虚怀若谷、谦虚谨慎" },
];

export default function ChineseIdiomDictPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return IDIOMS;
    const q = query.toLowerCase();
    return IDIOMS.filter(
      (i) => i.word.includes(query) || i.pinyin.includes(q) || i.meaning.includes(query)
    );
  }, [query]);

  return (
    <ToolLayout title="成语词典" description="查询成语的释义、出处、近义词和反义词" icon={BookOpen} category="查询工具" slug="chinese-idiom-dict">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索成语、拼音或释义..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条结果</div>

        <div className="space-y-4">
          {filtered.map((idiom) => (
            <div key={idiom.word} className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-baseline gap-3 mb-3">
                <h4 className="text-xl font-bold text-primary-400">{idiom.word}</h4>
                <span className="text-sm text-slate-500">{idiom.pinyin}</span>
              </div>
              <p className="text-slate-300 mb-3 leading-relaxed">{idiom.meaning}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-slate-500">出处: <span className="text-slate-400">{idiom.origin}</span></span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm mt-2">
                <span className="text-emerald-500">近义: <span className="text-slate-400">{idiom.synonyms}</span></span>
                <span className="text-orange-500">反义: <span className="text-slate-400">{idiom.antonyms}</span></span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配的成语</div>
        )}
      </div>
    </ToolLayout>
  );
}
