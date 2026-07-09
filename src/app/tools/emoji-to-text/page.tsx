"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Smile,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
  
} from "lucide-react";

function processText(text: string): string {
  const emojiMap: Record<string, string> = {
    "😄": "开心", "😊": "高兴", "😃": "快乐", "😂": "哈哈", "😆": "笑",
    "😢": "伤心", "😞": "难过", "😭": "哭", "😥": "悲伤",
    "😠": "生气", "😡": "愤怒", "🙄": "讨厌",
    "😍": "喜欢", "❤️": "爱", "💖": "爱心", "💕": "爱心",
    "☀️": "太阳", "🌞": "阳光", "🌙": "月亮", "⭐": "星星",
    "🔥": "火", "💧": "水", "💨": "风", "🌧️": "雨", "❄️": "雪",
    "🌸": "花", "🌳": "树", "🌿": "草",
    "🐱": "猫", "🐶": "狗", "🐦": "鸟", "🐟": "鱼",
    "🍎": "苹果", "🍌": "香蕉", "🍇": "葡萄", "🍉": "西瓜",
    "☕": "咖啡", "🍵": "茶", "🍺": "啤酒",
    "🎵": "音乐", "📚": "书", "📱": "手机", "💻": "电脑",
    "💰": "钱", "🎁": "礼物", "🏆": "奖杯",
    "👍": "赞", "👏": "鼓掌", "💪": "加油",
    "🙏": "谢谢", "👋": "挥手",
    "✅": "是", "❌": "否", "✔️": "对",
    "❓": "问号", "❗": "感叹号",
  };
  
  let result = text;
  for (const [emoji, desc] of Object.entries(emojiMap)) {
    result = result.replace(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), `[${desc}]`);
  }
  return result;
}

export default function EmojiToTextPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  

  const handleProcess = useCallback(() => {
    if (!input.trim()) return;
    try {
      setOutput(processText(input));
    } catch {
      setOutput("处理失败");
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "emoji-to-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="emoji转文字"
      description="将emoji表情转换为文字描述，解析emoji含义，快速了解emoji转文字"
      toolId="emoji-to-text"
      icon={Smile}
      category="文本工具"
      slug="emoji-to-text"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleProcess}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Smile className="w-4 h-4" />
              emoji转文字
            </button>
            
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">输入文本</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入或粘贴文本..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Smile className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">处理结果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="处理结果将显示在这里..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            将emoji表情转换为文字描述，解析emoji含义，快速了解emoji转文字。操作简单，一键处理，支持复制和下载结果。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
