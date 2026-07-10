"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Brain } from "lucide-react";

const QUESTIONS = [
  "最近是否经常感到紧张或焦虑？",
  "是否难以入睡或睡眠质量下降？",
  "是否容易发脾气或情绪波动大？",
  "是否感到疲惫或精力不足？",
  "是否难以集中注意力？",
  "是否经常头痛或身体不适？",
  "是否对工作或生活感到无力？",
  "是否食欲发生变化（暴食或没胃口）？",
  "是否回避社交或与人交流减少？",
  "是否感到胸闷或心跳加速？",
];

export default function StressTestSelfPage() {
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(0));
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const total = answers.reduce((s, a) => s + a, 0);
    let level = "正常", color = "text-emerald-400", advice = "压力水平正常，请继续保持良好的生活习惯。";
    if (total <= 10) { level = "正常"; color = "text-emerald-400"; advice = "压力水平正常，请继续保持良好的生活习惯。"; }
    else if (total <= 20) { level = "轻度压力"; color = "text-sky-400"; advice = "有轻度压力，建议适当运动放松，保证充足睡眠。"; }
    else if (total <= 30) { level = "中度压力"; color = "text-amber-400"; advice = "压力较大，建议调整生活节奏，多与朋友倾诉，必要时寻求专业帮助。"; }
    else { level = "高度压力"; color = "text-rose-400"; advice = "压力过大，建议尽快咨询心理专业人士，进行系统性的减压。"; }
    return { total, level, color, advice };
  }, [answers]);

  return (
    <ToolLayout title="压力自测" description="心理压力水平自测问卷，评估当前压力状况" toolId="stress-test-self" icon={Brain} category="健康医疗" slug="stress-test-self">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="space-y-4">
          {QUESTIONS.map((q, i) => (
            <div key={i} className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
              <div className="text-sm text-white mb-3">{i + 1}. {q}</div>
              <div className="flex gap-2">
                {[
                  { v: 0, l: "从不" },
                  { v: 1, l: "偶尔" },
                  { v: 2, l: "有时" },
                  { v: 3, l: "经常" },
                  { v: 4, l: "总是" },
                ].map((opt) => (
                  <button key={opt.v} onClick={() => { const a = [...answers]; a[i] = opt.v; setAnswers(a); }} className={`flex-1 px-2 py-2 rounded-lg text-xs border transition-all ${answers[i] === opt.v ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#0d0d0f] border-[#3f3f46] text-slate-400 hover:text-white"}`}>{opt.l}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setSubmitted(true)} className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium">提交评估</button>

        {submitted && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <div className="text-center mb-4">
              <div className="text-sm text-slate-400 mb-1">总得分</div>
              <div className={`text-4xl font-bold ${result.color}`}>{result.total}</div>
              <div className={`text-lg font-bold ${result.color} mt-1`}>{result.level}</div>
            </div>
            <div className="w-full bg-[#0d0d0f] rounded-full h-3 overflow-hidden mb-4">
              <div className={`h-full rounded-full ${result.total > 30 ? "bg-rose-500" : result.total > 20 ? "bg-amber-500" : result.total > 10 ? "bg-sky-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, (result.total / 40) * 100)}%` }} />
            </div>
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-lg p-4">
              <p className="text-sm text-slate-300">{result.advice}</p>
            </div>
            <div className="mt-4 text-xs text-slate-500">本测试仅供自我参考，不作为医学诊断依据。如有持续不适，请咨询专业医生。</div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
