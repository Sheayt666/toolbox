"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shuffle, Plus, Trash2, RotateCcw, Sparkles } from "lucide-react";

export default function RandomPickerPage() {
  const [options, setOptions] = useState<string[]>(["选项A", "选项B", "选项C"]);
  const [newOption, setNewOption] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);

  const addOption = () => {
    if (!newOption.trim()) return;
    setOptions((prev) => [...prev, newOption.trim()]);
    setNewOption("");
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const pickRandom = () => {
    if (options.length < 2 || isPicking) return;
    setIsPicking(true);
    setResult(null);

    let count = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      setDisplayIndex(Math.floor(Math.random() * options.length));
      count++;
      if (count >= totalFrames) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * options.length);
        setDisplayIndex(finalIndex);
        setResult(options[finalIndex]);
        setIsPicking(false);
      }
    }, 80 + count * 10);
  };

  const resetAll = () => {
    setResult(null);
    setDisplayIndex(0);
  };

  const clearAll = () => {
    setOptions([]);
    setResult(null);
    setDisplayIndex(0);
  };

  return (
    <ToolLayout
      title="随机选择器"
      description="输入多个选项，随机帮你做决定，选择困难症救星"
      icon={Shuffle}
      category="生活工具"
      slug="random-picker"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 结果展示区 */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-8 text-white shadow-lg shadow-pink-500/25">
          <div className="text-center">
            <div className="text-sm text-white/70 mb-4">
              {isPicking ? "正在选择..." : result ? "选中结果" : "点击开始随机选择"}
            </div>
            <div className="min-h-[80px] flex items-center justify-center mb-6">
              {options.length > 0 ? (
                <div className={`text-4xl font-bold transition-all ${isPicking ? "scale-110" : "scale-100"}`}>
                  {result || options[displayIndex]}
                </div>
              ) : (
                <div className="text-white/50 text-lg">请先添加选项</div>
              )}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={pickRandom}
                disabled={options.length < 2 || isPicking}
                className="px-8 py-3 bg-white text-pink-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isPicking ? "选择中..." : "随机选择"}
              </button>
              {result && (
                <button
                  onClick={resetAll}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 添加选项 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-pink-400" />
            选项列表 ({options.length})
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOption()}
              placeholder="输入新选项..."
              className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
            />
            <button
              onClick={addOption}
              disabled={!newOption.trim()}
              className="px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 选项列表 */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  result === option
                    ? "bg-pink-500/20 border-pink-500/50"
                    : "bg-[#09090b] border-[#27272a]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#27272a] flex items-center justify-center text-xs text-slate-400">
                    {index + 1}
                  </span>
                  <span className={`text-sm ${result === option ? "text-pink-400 font-medium" : "text-slate-300"}`}>
                    {option}
                  </span>
                </div>
                <button
                  onClick={() => removeOption(index)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {options.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              暂无选项，请在上方添加
            </div>
          )}

          {options.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#27272a] flex justify-between">
              <span className="text-xs text-slate-500">
                每个选项被选中的概率: {(100 / options.length).toFixed(2)}%
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                清空全部
              </button>
            </div>
          )}
        </div>

        {/* 快捷模板 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">快捷模板</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "吃饭选择", options: ["火锅", "烧烤", "日料", "川菜", "粤菜", "西餐"] },
              { name: "周末活动", options: ["看电影", "逛街", "运动", "读书", "打游戏", "睡觉"] },
              { name: "颜色选择", options: ["红色", "蓝色", "绿色", "黄色", "紫色", "橙色"] },
              { name: "数字1-10", options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] },
            ].map((template) => (
              <button
                key={template.name}
                onClick={() => setOptions(template.options)}
                className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
