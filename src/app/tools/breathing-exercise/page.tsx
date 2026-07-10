"use client";

import { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Wind, Play, Pause } from "lucide-react";

const TECHNIQUES: Record<string, { name: string; phases: { label: string; seconds: number }[]; desc: string }> = {
  "4-7-8": { name: "4-7-8 呼吸法", desc: "吸气4秒，屏息7秒，呼气8秒，帮助快速入睡和缓解焦虑", phases: [{ label: "吸气", seconds: 4 }, { label: "屏息", seconds: 7 }, { label: "呼气", seconds: 8 }] },
  box: { name: "盒式呼吸法", desc: "4秒吸气、4秒屏息、4秒呼气、4秒屏息，用于减压和集中注意力", phases: [{ label: "吸气", seconds: 4 }, { label: "屏息", seconds: 4 }, { label: "呼气", seconds: 4 }, { label: "屏息", seconds: 4 }] },
  deep: { name: "深呼吸放松", desc: "5秒吸气、5秒呼气，简单有效的放松呼吸法", phases: [{ label: "吸气", seconds: 5 }, { label: "呼气", seconds: 5 }] },
  calming: { name: "镇静呼吸法", desc: "6秒吸气、2秒屏息、8秒呼气，深度放松身心", phases: [{ label: "吸气", seconds: 6 }, { label: "屏息", seconds: 2 }, { label: "呼气", seconds: 8 }] },
};

export default function BreathingExercisePage() {
  const [technique, setTechnique] = useState("4-7-8");
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tech = TECHNIQUES[technique];

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    setPhaseIdx(0);
    setCountdown(tech.phases[0].seconds);
    let pIdx = 0;
    let cd = tech.phases[0].seconds;
    timerRef.current = setInterval(() => {
      cd--;
      setCountdown(cd);
      if (cd <= 0) {
        pIdx = (pIdx + 1) % tech.phases.length;
        cd = tech.phases[pIdx].seconds;
        setPhaseIdx(pIdx);
        setCountdown(cd);
        if (pIdx === 0) setCycles((c) => c + 1);
      }
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, technique]);

  const toggle = () => {
    if (running) {
      setRunning(false);
    } else {
      setCycles(0);
      setRunning(true);
    }
  };

  const reset = () => {
    setRunning(false);
    setPhaseIdx(0);
    setCountdown(0);
    setCycles(0);
  };

  const currentPhase = tech.phases[phaseIdx];
  const scale = running ? (currentPhase.label === "吸气" ? 1.4 : currentPhase.label === "呼气" ? 0.8 : 1.1) : 1;

  return (
    <ToolLayout title="呼吸练习" description="多种呼吸法引导练习，帮助放松和缓解焦虑" toolId="breathing-exercise" icon={Wind} category="健康医疗" slug="breathing-exercise">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">选择呼吸法</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(TECHNIQUES).map(([k, t]) => (
              <button key={k} onClick={() => { setTechnique(k); reset(); }} className={`px-3 py-2.5 rounded-lg text-xs border text-center transition-all ${technique === k ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400 hover:text-white"}`}>
                <div className="font-medium">{t.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <p className="text-sm text-slate-400 mb-6 text-center">{tech.desc}</p>

          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-primary-500/20" />
              <div className="absolute rounded-full bg-gradient-to-br from-primary-500/30 to-sky-500/20 transition-all duration-1000 ease-in-out" style={{ width: "100%", height: "100%", transform: `scale(${scale})` }} />
              <div className="relative z-10 text-center">
                <div className="text-2xl font-bold text-white">{running ? currentPhase.label : "准备"}</div>
                {running && <div className="text-5xl font-bold text-primary-400 mt-2">{countdown}</div>}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={toggle} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium">
              {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {running ? "暂停" : "开始"}
            </button>
            <button onClick={reset} className="px-6 py-3 bg-[#3f3f46] hover:bg-[#52525b] text-white rounded-lg text-sm">重置</button>
          </div>

          {cycles > 0 && <div className="text-center mt-4 text-sm text-slate-400">已完成 {cycles} 个循环</div>}
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">呼吸节奏</h3>
          <div className="flex items-center justify-center gap-2">
            {tech.phases.map((p, i) => (
              <div key={i} className={`px-4 py-2 rounded-lg text-sm border transition-all ${running && i === phaseIdx ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#0d0d0f] border-[#3f3f46] text-slate-400"}`}>
                {p.label} {p.seconds}s
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
