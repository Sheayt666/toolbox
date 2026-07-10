"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Eye } from "lucide-react";

const CHART = [
  { size: 80, letter: "E", level: "4.0 (0.1)" },
  { size: 60, letter: "F", level: "4.1 (0.12)" },
  { size: 48, letter: "P", level: "4.2 (0.15)" },
  { size: 38, letter: "T", level: "4.3 (0.2)" },
  { size: 30, letter: "O", level: "4.4 (0.25)" },
  { size: 24, letter: "Z", level: "4.5 (0.3)" },
  { size: 19, letter: "L", level: "4.6 (0.4)" },
  { size: 15, letter: "D", level: "4.7 (0.5)" },
  { size: 12, letter: "N", level: "4.8 (0.6)" },
  { size: 10, letter: "W", level: "4.9 (0.8)" },
  { size: 8, letter: "V", level: "5.0 (1.0)" },
  { size: 6, letter: "Y", level: "5.1 (1.2)" },
  { size: 5, letter: "A", level: "5.2 (1.5)" },
];

const DIRECTIONS = ["上", "下", "左", "右"];
const ARROWS = ["↑", "↓", "←", "→"];

export default function VisionTestOnlinePage() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<{ level: string; correct: boolean }[]>([]);
  const [direction, setDirection] = useState(Math.floor(Math.random() * 4));
  const [finished, setFinished] = useState(false);

  const current = CHART[step];

  const answer = (dir: number) => {
    const correct = dir === direction;
    setResults([...results, { level: current.level, correct }]);
    if (step < CHART.length - 1) {
      setStep(step + 1);
      setDirection(Math.floor(Math.random() * 4));
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setStep(0); setResults([]); setFinished(false); setDirection(Math.floor(Math.random() * 4));
  };

  // 最终视力 = 最后一个答对的等级
  const finalLevel = useMemo(() => {
    const correct = results.filter((r) => r.correct);
    if (correct.length === 0) return CHART[0].level;
    return correct[correct.length - 1].level;
  }, [results]);

  return (
    <ToolLayout title="在线视力测试" description="简易视力自测工具，初步检测视力健康状况" toolId="vision-test-online" icon={Eye} category="健康医疗" slug="vision-test-online">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-slate-400">请将手机/电脑放置在距离眼睛约50cm处，确保光线充足。测试方法：观察下方"E"字符的开口方向，点击对应方向按钮。</p>
        </div>

        {!finished ? (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-8">
            <div className="text-center mb-6">
              <div className="text-sm text-slate-400 mb-2">第 {step + 1} / {CHART.length} 行 · 视力 {current.level}</div>
              <div className="flex items-center justify-center h-32">
                <div className="font-bold text-white" style={{ fontSize: `${current.size}px`, fontFamily: "monospace" }}>
                  {ARROWS[direction]}
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">该符号指向哪个方向？</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DIRECTIONS.map((d, i) => (
                <button key={d} onClick={() => answer(i)} className="px-4 py-3 bg-[#0d0d0f] hover:bg-primary-500/20 border border-[#3f3f46] hover:border-primary-500 text-white rounded-lg text-sm transition-all">{d} {ARROWS[i]}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-6 text-center">
            <div className="text-sm text-slate-400 mb-2">测试结果</div>
            <div className="text-4xl font-bold text-emerald-400 mb-2">{finalLevel}</div>
            <div className="text-sm text-slate-500 mb-4">答对 {results.filter((r) => r.correct).length} / {results.length} 行</div>
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-300">此为简易自测结果，仅供参考。建议每年进行一次专业眼科检查。如视力低于 4.8 (0.6)，建议尽快就医。</p>
            </div>
            <button onClick={reset} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm">重新测试</button>
          </div>
        )}

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">国际标准视力对照表</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {CHART.map((c, i) => (
              <div key={i} className="flex items-center gap-2 bg-[#0d0d0f] rounded-lg px-3 py-2">
                <span className="text-slate-300 font-mono" style={{ fontSize: `${Math.min(24, c.size)}px` }}>E</span>
                <span className="text-slate-400">{c.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
