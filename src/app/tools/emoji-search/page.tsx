"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Smile, Search, Check } from "lucide-react";

interface EmojiItem {
  emoji: string;
  name: string;
  keywords: string;
}

const EMOJIS: EmojiItem[] = [
  { emoji: "😀", name: "笑脸", keywords: "开心 快乐 笑 微笑" },
  { emoji: "😂", name: "笑哭", keywords: "笑哭 高兴 开心 搞笑" },
  { emoji: "🥰", name: "爱心脸", keywords: "爱 喜欢 心动 恋爱" },
  { emoji: "😎", name: "酷脸", keywords: "酷 自信 帅气 墨镜" },
  { emoji: "🤔", name: "思考", keywords: "思考 想想 疑问 考虑" },
  { emoji: "😴", name: "睡觉", keywords: "睡觉 困 休息 睡眠" },
  { emoji: "🥳", name: "派对", keywords: "庆祝 派对 生日 开心" },
  { emoji: "😭", name: "大哭", keywords: "哭 难过 伤心 悲伤" },
  { emoji: "😡", name: "愤怒", keywords: "生气 愤怒 发火 生气" },
  { emoji: "🥺", name: "恳求", keywords: "求你 可怜 委屈 可爱" },
  { emoji: "❤️", name: "红心", keywords: "心 爱 喜欢 爱心" },
  { emoji: "💔", name: "心碎", keywords: "心碎 伤心 分手 难过" },
  { emoji: "👍", name: "点赞", keywords: "赞 好 不错 赞同" },
  { emoji: "👎", name: "踩", keywords: "不行 不好 反对 踩" },
  { emoji: "👏", name: "鼓掌", keywords: "鼓掌 好 棒 赞" },
  { emoji: "🙏", name: "祈祷", keywords: "祈祷 感谢 拜托 请" },
  { emoji: "💪", name: "肌肉", keywords: "力量 加油 强壮 力量" },
  { emoji: "🎉", name: "庆祝", keywords: "庆祝 派对 礼花 恭喜" },
  { emoji: "🔥", name: "火焰", keywords: "火 热门 赞 牛" },
  { emoji: "⭐", name: "星星", keywords: "星 星星 评分 好" },
  { emoji: "💯", name: "满分", keywords: "满分 一百分 完美 赞" },
  { emoji: "🌈", name: "彩虹", keywords: "彩虹 美丽 雨后 七彩" },
  { emoji: "☀️", name: "太阳", keywords: "太阳 晴天 阳光 温暖" },
  { emoji: "🌙", name: "月亮", keywords: "月亮 夜晚 晚上 睡觉" },
  { emoji: "🌸", name: "樱花", keywords: "花 樱花 春天 粉色" },
  { emoji: "🍎", name: "苹果", keywords: "苹果 水果 红 食物" },
  { emoji: "🐶", name: "小狗", keywords: "狗 小狗 宠物 可爱" },
  { emoji: "🐱", name: "小猫", keywords: "猫 小猫 宠物 可爱" },
  { emoji: "🚗", name: "汽车", keywords: "车 汽车 交通 出行" },
  { emoji: "🏠", name: "房子", keywords: "房子 家 住所 房屋" },
  { emoji: "💻", name: "电脑", keywords: "电脑 笔记本 工作 编程" },
  { emoji: "📱", name: "手机", keywords: "手机 电话 智能手机 通讯" },
  { emoji: "🎵", name: "音乐", keywords: "音乐 歌 听歌 音符" },
  { emoji: "⚽", name: "足球", keywords: "足球 运动 比赛 体育" },
  { emoji: "☕", name: "咖啡", keywords: "咖啡 喝 早晨 提神" },
  { emoji: "🍕", name: "披萨", keywords: "披萨 食物 吃 美食" },
];

export default function EmojiSearchPage() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return EMOJIS;
    return EMOJIS.filter(
      (e) => e.name.includes(query) || e.keywords.includes(query) || e.emoji.includes(query)
    );
  }, [query]);

  const handleCopy = (emoji: string) => {
    navigator.clipboard.writeText(emoji);
    setCopied(emoji);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <ToolLayout title="Emoji搜索" description="快速搜索和复制Emoji表情符号，支持关键词搜索" icon={Smile} category="查询工具" slug="emoji-search">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索表情，如：开心、爱心、动物..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 个表情，点击复制</div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filtered.map((item, i) => (
            <button
              key={i}
              onClick={() => handleCopy(item.emoji)}
              className="flex flex-col items-center gap-1 p-3 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors group"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{item.emoji}</span>
              <span className="text-xs text-slate-500">{item.name}</span>
              {copied === item.emoji && <Check className="w-3 h-3 text-emerald-400" />}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配的表情</div>
        )}
      </div>
    </ToolLayout>
  );
}
