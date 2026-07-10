"use client";

import { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PersonStanding, Play, Pause, RotateCcw } from "lucide-react";

const POSTURES = [
  { title: "头部姿势", desc: "保持头部正直，下巴微收，不要前倾。耳朵与肩膀在同一直线上。", icon: "🧑", duration: 30 },
  { title: "肩部放松", desc: "双肩自然下垂，向后向下放松。不要耸肩或含胸。", icon: "💆", duration: 30 },
  { title: "背部挺直", desc: "腰背紧贴椅背，保持脊柱自然弯曲。可使用腰靠支撑。", icon: "🪑", duration: 45 },
  { title: "手臂位置", desc: "手肘弯曲90度，前臂与桌面平行。手腕不要过度弯曲。", icon: "💪", duration: 30 },
  { title: "腿部姿势", desc: "双脚平放地面，膝盖弯曲90度。不要跷二郎腿。", icon: "🦵", duration: 30 },
  { title: "颈部拉伸", desc: "缓慢将头向左倾斜，保持15秒，换右侧。轻柔拉伸颈部肌肉。", icon: "🔄", duration: 30 },
  { title: "肩部环绕", desc: "双肩缓慢向后环绕10圈，再向前10圈。缓解肩部僵硬。", icon: "🔄", duration: 40 },
  { title: "站立休息", desc: "起身站立，双手向上伸展，深呼吸3次。每45分钟起身一次。", icon: "🧘", duration: 30 },
];

export default function PostureCheckGuidePage() {
  const [running, setRunning] = useState(false);
  const [idx, setIdx] = useState(0);
  const [countdown, setCountdown] = useState(POSTURES[0].duration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setCountdown(POSTURES[idx].duration);
    timerRef.current = setInterval(() => {
      setCountdown((cd) => {
        if (cd <= 1) {
          setIdx((i) => (i + 1) % POSTURES.length);
          return 0;
        }
        return cd - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, idx]);

  const reset = () => { setRunning(false); setIdx(0); setCountdown(POSTURES[0].duration); };
  const current = POSTURES[idx];

  return (
    <ToolLayout title="坐姿矫正指南" description="正确坐姿指导和定时提醒，预防颈椎腰椎问题" toolId="posture-check-guide" icon={PersonStanding} category="健康医疗" slug="posture-check-guide">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-6 text-center">
          <div className="text-6xl mb-4">{current.icon}</div>
          <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
          <p className="text-sm text-slate-400 mb-6">{current.desc}</p>

          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#27272a" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="#6366f1" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 52}`} strokeDashoffset={`${2 * Math.PI * 52 * (1 - countdown / current.duration)}`} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-400">{countdown}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setRunning(!running)} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium">
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? "暂停" : "开始"}
            </button>
            <button onClick={reset} className="px-6 py-3 bg-[#3f3f46] hover:bg-[#52525b] text-white rounded-lg flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" />重置</button>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">坐姿要点清单</h3>
          <div className="space-y-2">
            {POSTURES.map((p, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${i === idx && running ? "bg-primary-500/10 border border-primary-500/30" : "bg-[#0d0d0f] border border-[#3f3f46]"}`}>
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.duration}秒</div>
                </div>
                {i === idx && running && <span className="text-xs text-primary-400 animate-pulse">进行中</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">建议每工作45分钟起身活动5分钟。长期不良坐姿可能导致颈椎病、腰椎间盘突出等问题。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
