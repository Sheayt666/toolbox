"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { AtSign, Copy, Check, RefreshCw, Sparkles } from "lucide-react";

type UsernameStyle =
  | "random"
  | "cool"
  | "cute"
  | "literary"
  | "english"
  | "pinyin";

const prefixes = {
  cool: [
    "冷", "暗", "夜", "影", "孤", "逆", "狂", "傲", "绝", "弑",
    "冥", "魂", "魄", "殇", "痕", "祭", "灭", "苍穹", "凌天", "无双",
  ],
  cute: [
    "小", "萌", "软", "甜", "奶", "糖", "果", "喵", "兔", "熊",
    "笨", "呆", "傻", "懒", "乖", "糯", "泡芙", "棉花", "布丁", "汤圆",
  ],
  literary: [
    "清", "雅", "墨", "书", "画", "琴", "棋", "诗", "词", "风",
    "花", "雪", "月", "云", "水", "山", "溪", "竹", "兰", "梅",
  ],
};

const suffixes = {
  cool: [
    "殇", "痕", "影", "魂", "刃", "锋", "翼", "瞳", "渊", "域",
    "界", "主", "神", "帝", "尊", "皇", "圣", "仙", "魔", "龙",
  ],
  cute: [
    "酱", "宝", "咪", "喵", "兔", "鸭", "熊", "叽", "噜",
    "呀", "哒", "啦", "呢", "哇", "仔", "酱", "儿", "妞",
  ],
  literary: [
    "居士", "先生", "公子", "姑娘", "仙子", "墨客", "书生", "山人",
    "散人", "隐士", "客", "君", "卿", "郎", "娘", "姬",
  ],
};

const adjectives = [
  "快乐的", "忧伤的", "神秘的", "勇敢的", "温柔的", "调皮的",
  "安静的", "热情的", "冷酷的", "呆萌的", "傲娇的", "腹黑的",
  "元气的", "慵懒的", "认真的", "迷糊的", "机智的", "佛系的",
];

const nouns = [
  "小猫", "小狗", "兔子", "熊猫", "狐狸", "松鼠", "海豚", "企鹅",
  "蝴蝶", "蜜蜂", "青蛙", "乌龟", "老虎", "狮子", "大象", "长颈鹿",
  "云朵", "星星", "月亮", "太阳", "彩虹", "雪花", "雨滴", "闪电",
  "苹果", "橘子", "草莓", "葡萄", "西瓜", "桃子", "樱桃", "芒果",
];

const englishAdjectives = [
  "Happy", "Lucky", "Crazy", "Cool", "Sweet", "Dark", "Light", "Fast",
  "Slow", "Big", "Little", "Red", "Blue", "Green", "Golden", "Silver",
  "Wild", "Silent", "Brave", "Clever", "Gentle", "Fierce", "Mighty", "Royal",
];

const englishNouns = [
  "Wolf", "Tiger", "Dragon", "Phoenix", "Eagle", "Hawk", "Bear", "Lion",
  "Fox", "Rabbit", "Cat", "Dog", "Bird", "Fish", "Dolphin", "Butterfly",
  "Star", "Moon", "Sun", "Sky", "Cloud", "Storm", "Fire", "Ice",
  "King", "Queen", "Prince", "Princess", "Knight", "Warrior", "Hunter", "Wizard",
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function generateUsername(style: UsernameStyle): string {
  switch (style) {
    case "cool": {
      const prefix = prefixes.cool[Math.floor(Math.random() * prefixes.cool.length)];
      const suffix = suffixes.cool[Math.floor(Math.random() * suffixes.cool.length)];
      return prefix + suffix;
    }
    case "cute": {
      const prefix = prefixes.cute[Math.floor(Math.random() * prefixes.cute.length)];
      const suffix = suffixes.cute[Math.floor(Math.random() * suffixes.cute.length)];
      return prefix + suffix;
    }
    case "literary": {
      const prefix = prefixes.literary[Math.floor(Math.random() * prefixes.literary.length)];
      const suffix = suffixes.literary[Math.floor(Math.random() * suffixes.literary.length)];
      return prefix + suffix;
    }
    case "english": {
      const adj = englishAdjectives[Math.floor(Math.random() * englishAdjectives.length)];
      const noun = englishNouns[Math.floor(Math.random() * englishNouns.length)];
      const useNumber = Math.random() > 0.5;
      const num = Math.floor(Math.random() * 999) + 1;
      return useNumber ? `${adj}${noun}${num}` : `${adj}${noun}`;
    }
    case "pinyin": {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      return adj + noun;
    }
    case "random":
    default: {
      const styles: UsernameStyle[] = ["cool", "cute", "literary", "english", "pinyin"];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      return generateUsername(randomStyle);
    }
  }
}

export default function UsernameGeneratorPage() {
  const [style, setStyle] = useState<UsernameStyle>("random");
  const [count, setCount] = useState(12);
  const [usernames, setUsernames] = useState<{ id: string; name: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const styleOptions: { value: UsernameStyle; label: string; desc: string }[] = [
    { value: "random", label: "随机混合", desc: "各种风格随机" },
    { value: "cool", label: "霸气冷酷", desc: "酷炫霸气风" },
    { value: "cute", label: "可爱软萌", desc: "萌萌哒风格" },
    { value: "literary", label: "文艺古风", desc: "诗意文雅风" },
    { value: "english", label: "英文风格", desc: "English style" },
    { value: "pinyin", label: "形容词+名词", desc: "短语式网名" },
  ];

  const generate = useCallback(() => {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push({
        id: generateId(),
        name: generateUsername(style),
      });
    }
    setUsernames(results);
  }, [style, count]);

  const copyAll = useCallback(() => {
    const text = usernames.map((u) => u.name).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [usernames]);

  return (
    <ToolLayout
      title="用户名生成器"
      description="在线生成各种风格的用户名/网名，霸气、可爱、文艺、英文等多种风格，批量生成"
      icon={AtSign}
      category="生成工具"
      slug="username-generator"
      toolId="username-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <AtSign className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">用户名生成</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            生成
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 风格选择 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            选择风格
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {styleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStyle(opt.value)}
                className={`p-3 rounded-xl text-left transition-all ${
                  style === opt.value
                    ? "bg-violet-500/20 border border-violet-500/30"
                    : "bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46]"
                }`}
              >
                <div className={`text-sm font-medium ${style === opt.value ? "text-violet-400" : "text-white"}`}>
                  {opt.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 数量 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-300">生成数量</label>
            <span className="text-sm font-mono text-violet-400">{count} 个</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
        </div>

        {/* 结果 */}
        {usernames.length > 0 && (
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
              <span className="text-sm font-medium text-white">
                生成结果 ({usernames.length})
              </span>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    已复制全部
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制全部
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#27272a]">
              {usernames.map((u) => (
                <div
                  key={u.id}
                  className="px-4 py-3 bg-[#09090b] hover:bg-[#18181b] transition-colors flex items-center justify-between group"
                >
                  <span className="text-white text-sm">{u.name}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(u.name);
                    }}
                    className="p-1 text-slate-600 hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {usernames.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">点击「生成」按钮开始生成用户名</p>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 6 种风格可选：随机混合、霸气冷酷、可爱软萌、文艺古风、英文风格、形容词+名词</li>
          <li>• 一次最多可生成 50 个用户名，点击可单独复制或一键复制全部</li>
          <li>• 生成的用户名仅用于参考，建议根据个人喜好进行修改</li>
          <li>• 所有生成均在浏览器本地完成，不会上传任何数据</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
