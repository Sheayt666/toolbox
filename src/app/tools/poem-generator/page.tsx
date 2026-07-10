"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Feather, Copy, Check, RefreshCw, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

// 6字诗意后缀，与藏头字组成7字句
const SUFFIXES = [
  "风月入梦来迟", "独酌酒一杯时", "花落满径无人", "清辉照影相随",
  "春深花满枝头", "云深不知归处", "月明千里相思", "山高水远情长",
  "一梦到江南岸", "清风拂柳如烟", "烟雨任平生处", "孤舟夜泊芦花",
  "长歌万里风起", "落霞满天飞雁", "寒梅傲雪初绽", "碧水映长天远",
  "琴声伴月如水", "茶香袅袅心闲", "星光点亮夜空", "竹影摇曳风中",
];

// 常见姓氏/名字字的专属诗句（7字，首字为该字）
const SPECIAL: Record<string, string[]> = {
  "张": ["张帆远航渡沧海", "张灯结彩迎春至"],
  "李": ["李白桃红春意浓", "李下不冠正人风"],
  "王": ["王者风范自天成", "王孙归路草萋萋"],
  "刘": ["刘郎已恨蓬山远", "流水高山觅知音"],
  "陈": ["陈年旧事随流水", "陈酒新茶话短长"],
  "林": ["林深时见鹿鸣幽", "林间清风拂面柔"],
  "黄": ["黄河之水天上来", "黄昏独倚望江楼"],
  "周": ["周而复始道自然", "周游列国志四方"],
  "吴": ["吴山青青越水长", "吴侬软语话桑麻"],
  "徐": ["徐行不记山浅深", "徐风拂柳燕双飞"],
  "孙": ["孙康映雪读书勤", "子孙满堂福气临"],
  "赵": ["赵客缦胡缨系腰", "赵云忠义传千古"],
  "春": ["春风又绿江南岸", "春眠不觉晓日出"],
  "夏": ["夏日荷花别样红", "夏夜清风伴蝉鸣"],
  "秋": ["秋水共长天一色", "秋风萧瑟天气凉"],
  "冬": ["冬雪纷飞兆丰年", "冬梅傲骨凌寒开"],
  "明": ["明月几时有清辉", "明朝散发弄扁舟"],
  "心": ["心远地自偏安然", "心有灵犀一点通"],
  "梦": ["梦里花落知多少", "梦回唐朝见盛世"],
  "风": ["风萧萧兮易水寒", "风吹草低见牛羊"],
};

function pick<T>(arr: T[], used: Set<number>): T {
  let idx: number;
  let tries = 0;
  do { idx = Math.floor(Math.random() * arr.length); tries++; } while (used.has(idx) && tries < 50);
  used.add(idx);
  return arr[idx];
}

function genPoem(name: string): string[] {
  const lines: string[] = [];
  const usedSuffix = new Set<number>();
  for (const ch of name) {
    if (SPECIAL[ch]) {
      lines.push(SPECIAL[ch][Math.floor(Math.random() * SPECIAL[ch].length)]);
    } else {
      lines.push(ch + pick(SUFFIXES, usedSuffix));
    }
  }
  return lines;
}

export default function PoemGeneratorPage() {
  const [name, setName] = useState("春风十里");
  const [poem, setPoem] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const n = name.trim() || "诗";
    setPoem(genPoem(n.slice(0, 8)));
  }, [name]);

  const copy = () => {
    navigator.clipboard.writeText(poem.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([poem.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `藏头诗-${name}.txt`;
    a.click();
  };

  return (
    <ToolLayout
      title="藏头诗生成"
      description="输入名字生成藏头诗"
      icon={Feather}
      category="生成工具"
      slug="poem-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">藏头文字（每字一句）</label>
          <div className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={8} className={inputClass} placeholder="输入2-8个字" />
            <button onClick={generate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg whitespace-nowrap">
              <RefreshCw className="w-4 h-4" /> 生成
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1.5">输入的文字每个字将作为每句诗的开头</p>
        </div>

        {poem.length > 0 && (
          <>
            <div className="rounded-lg bg-gradient-to-br from-[#1a1a1d] to-[#0a0a0b] border border-[#27272a] p-6">
              <div className="space-y-4 text-center">
                {poem.map((line, i) => (
                  <p key={i} className="text-xl text-slate-100 leading-relaxed tracking-wider" style={{ fontFamily: "'STKaiti', 'KaiTi', serif" }}>
                    <span className="text-primary-400 font-bold">{line[0]}</span>{line.slice(1)}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={copy} className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg">
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} 复制
              </button>
              <button onClick={download} className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg">
                <Download className="w-4 h-4" /> 下载
              </button>
              <button onClick={generate} className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg ml-auto">
                <RefreshCw className="w-4 h-4" /> 换一首
              </button>
            </div>
          </>
        )}

        {poem.length === 0 && (
          <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-10 text-center">
            <Feather className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">输入文字后点击「生成」创作藏头诗</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
