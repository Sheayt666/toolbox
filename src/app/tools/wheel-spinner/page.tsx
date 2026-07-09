"use client";

import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Circle, Plus, Trash2, RotateCw, Trophy, Sparkles } from "lucide-react";

export default function WheelSpinnerPage() {
  const [options, setOptions] = useState([
    "一等奖", "二等奖", "三等奖", "谢谢参与", "再来一次", "幸运奖"
  ]);
  const [newOption, setNewOption] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const colors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e",
    "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  ];

  const addOption = () => {
    if (!newOption.trim() || options.length >= 8) return;
    setOptions((prev) => [...prev, newOption.trim()]);
    setNewOption("");
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const spinWheel = () => {
    if (options.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const segmentAngle = 360 / options.length;
    const randomIndex = Math.floor(Math.random() * options.length);
    const targetAngle = randomIndex * segmentAngle + segmentAngle / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalRotation = rotation + spins * 360 + (360 - targetAngle);

    setRotation(finalRotation);

    setTimeout(() => {
      setResult(options[randomIndex]);
      setIsSpinning(false);
    }, 4000);
  };

  const resetWheel = () => {
    setResult(null);
    setRotation(0);
  };

  const segmentAngle = 360 / options.length;

  return (
    <ToolLayout
      title="转盘抽奖"
      description="自定义转盘抽奖工具，添加选项后转动转盘随机抽取结果，活动抽奖必备"
      icon={Circle}
      category="生活工具"
      slug="wheel-spinner"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 转盘区域 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg shadow-amber-500/25">
          <div className="flex flex-col items-center">
            {/* 指针 */}
            <div className="relative w-72 h-72 mb-6">
              {/* 指针 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white drop-shadow-lg" />
              </div>

              {/* 转盘 */}
              <div
                ref={wheelRef}
                className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {options.map((option, index) => {
                    const startAngle = index * segmentAngle - 90;
                    const endAngle = (index + 1) * segmentAngle - 90;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const x1 = 50 + 50 * Math.cos(startRad);
                    const y1 = 50 + 50 * Math.sin(startRad);
                    const x2 = 50 + 50 * Math.cos(endRad);
                    const y2 = 50 + 50 * Math.sin(endRad);
                    const largeArc = segmentAngle > 180 ? 1 : 0;
                    const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
                    const textX = 50 + 32 * Math.cos(midAngle);
                    const textY = 50 + 32 * Math.sin(midAngle);
                    const textRotation = (startAngle + endAngle) / 2 + 90;

                    return (
                      <g key={index}>
                        <path
                          d={`M50,50 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`}
                          fill={colors[index % colors.length]}
                          stroke="white"
                          strokeWidth="0.5"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="white"
                          fontSize={options.length > 6 ? "3.5" : "5"}
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                        >
                          {option.length > 4 ? option.slice(0, 4) : option}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="50" cy="50" r="8" fill="white" />
                  <circle cx="50" cy="50" r="5" fill="#f59e0b" />
                </svg>
              </div>
            </div>

            {/* 结果 */}
            <div className="h-10 mb-4">
              {result && !isSpinning && (
                <div className="flex items-center gap-2 text-2xl font-bold animate-bounce">
                  <Trophy className="w-6 h-6" />
                  {result}
                </div>
              )}
              {isSpinning && (
                <div className="flex items-center gap-2 text-lg text-white/80">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  转盘转动中...
                </div>
              )}
            </div>

            {/* 按钮 */}
            <div className="flex gap-3">
              <button
                onClick={spinWheel}
                disabled={options.length < 2 || isSpinning}
                className="px-8 py-3 bg-white text-amber-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RotateCw className={`w-5 h-5 ${isSpinning ? "animate-spin" : ""}`} />
                {isSpinning ? "转动中..." : "开始抽奖"}
              </button>
              {result && (
                <button
                  onClick={resetWheel}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                >
                  重置
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 选项管理 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Circle className="w-5 h-5 text-amber-400" />
            转盘选项 ({options.length}/8)
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addOption()}
              placeholder="输入新选项..."
              maxLength={8}
              className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            />
            <button
              onClick={addOption}
              disabled={!newOption.trim() || options.length >= 8}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {options.map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#09090b] rounded-lg border border-[#27272a]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-slate-300">{option}</span>
                </div>
                <button
                  onClick={() => removeOption(index)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {options.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              请添加至少2个选项
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">使用说明</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>1. 在下方添加或编辑转盘选项，最多支持8个选项</p>
            <p>2. 点击"开始抽奖"按钮，转盘会快速旋转后慢慢停下</p>
            <p>3. 指针指向的扇区即为中奖结果</p>
            <p>4. 每次抽奖结果完全随机，公平公正</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
