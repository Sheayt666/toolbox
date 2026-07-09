"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ruler, Baby, TrendingUp } from "lucide-react";

export default function BabyHeightPredictionPage() {
  const [fatherHeight, setFatherHeight] = useState("175");
  const [motherHeight, setMotherHeight] = useState("162");
  const [gender, setGender] = useState<"boy" | "girl">("boy");

  const calculate = () => {
    const fh = parseFloat(fatherHeight) || 0;
    const mh = parseFloat(motherHeight) || 0;

    if (fh <= 0 || mh <= 0) return null;

    // 遗传身高公式
    // 男孩 = (父亲身高 + 母亲身高 + 13) / 2 ± 5cm
    // 女孩 = (父亲身高 + 母亲身高 - 13) / 2 ± 5cm
    let baseHeight: number;
    if (gender === "boy") {
      baseHeight = (fh + mh + 13) / 2;
    } else {
      baseHeight = (fh + mh - 13) / 2;
    }

    const minHeight = baseHeight - 5;
    const maxHeight = baseHeight + 5;

    return {
      baseHeight: baseHeight.toFixed(1),
      minHeight: minHeight.toFixed(1),
      maxHeight: maxHeight.toFixed(1),
      range: `${minHeight.toFixed(1)} - ${maxHeight.toFixed(1)}`,
    };
  };

  const result = calculate();

  return (
    <ToolLayout
      title="宝宝身高预测"
      description="根据父母身高预测宝宝未来身高，遗传身高计算公式，男孩女孩分别计算"
      toolId="baby-height-prediction"
      icon={Ruler}
      category="生活工具"
      slug="baby-height-prediction"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold">父母身高</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">宝宝性别</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGender("boy")}
                className={`py-3 rounded-lg font-medium transition-all ${
                  gender === "boy"
                    ? "bg-sky-500/20 text-sky-400 border-2 border-sky-500/30"
                    : "bg-zinc-900/50 text-zinc-500 border border-zinc-700 hover:border-zinc-600"
                }`}
              >
                男孩
              </button>
              <button
                onClick={() => setGender("girl")}
                className={`py-3 rounded-lg font-medium transition-all ${
                  gender === "girl"
                    ? "bg-pink-500/20 text-pink-400 border-2 border-pink-500/30"
                    : "bg-zinc-900/50 text-zinc-500 border border-zinc-700 hover:border-zinc-600"
                }`}
              >
                女孩
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">父亲身高 (cm)</label>
              <input
                type="number"
                value={fatherHeight}
                onChange={(e) => setFatherHeight(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-sky-500 font-mono text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">母亲身高 (cm)</label>
              <input
                type="number"
                value={motherHeight}
                onChange={(e) => setMotherHeight(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-pink-500 font-mono text-lg"
              />
            </div>
          </div>
        </div>

        {result && (
          <div className={`bg-gradient-to-br ${gender === "boy" ? "from-sky-500/10 to-blue-500/10 border-sky-500/20" : "from-pink-500/10 to-rose-500/10 border-pink-500/20"} rounded-xl border p-6`}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className={`w-5 h-5 ${gender === "boy" ? "text-sky-400" : "text-pink-400"}`} />
              <h2 className="text-base font-semibold">预测结果</h2>
            </div>

            <div className="text-center mb-6">
              <div className="text-xs text-zinc-500 mb-2">遗传身高范围</div>
              <div className={`text-4xl font-bold ${gender === "boy" ? "text-sky-400" : "text-pink-400"}`}>
                {result.range} <span className="text-xl">cm</span>
              </div>
              <div className="text-sm text-zinc-500 mt-2">中位数：{result.baseHeight} cm</div>
            </div>

            {/* 可视化条 */}
            <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`absolute h-full rounded-full ${gender === "boy" ? "bg-gradient-to-r from-sky-500 to-blue-500" : "bg-gradient-to-r from-pink-500 to-rose-500"}`}
                style={{
                  left: "20%",
                  right: "20%",
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>140cm</span>
              <span>160cm</span>
              <span>180cm</span>
              <span>200cm</span>
            </div>
          </div>
        )}

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">计算公式</h3>
          <div className="space-y-3">
            <div className="p-4 bg-sky-500/10 rounded-xl">
              <div className="text-sm font-medium text-sky-300 mb-2">男孩</div>
              <code className="text-sm text-sky-400 font-mono">
                (父亲身高 + 母亲身高 + 13) / 2 ± 5cm
              </code>
            </div>
            <div className="p-4 bg-pink-500/10 rounded-xl">
              <div className="text-sm font-medium text-pink-300 mb-2">女孩</div>
              <code className="text-sm text-pink-400 font-mono">
                (父亲身高 + 母亲身高 - 13) / 2 ± 5cm
              </code>
            </div>
          </div>
          <p className="text-sm text-zinc-500 mt-4 leading-relaxed">
            身高受遗传、营养、运动、睡眠等多种因素影响。遗传因素约占70%，
            后天因素约占30%。本预测基于遗传身高公式，仅供参考。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
