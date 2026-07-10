"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { SlidersHorizontal, Upload, Play, Pause } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface Band { freq: number; gain: number; label: string; }

const BANDS: Band[] = [
  { freq: 60, gain: 0, label: "60Hz" },
  { freq: 170, gain: 0, label: "170Hz" },
  { freq: 350, gain: 0, label: "350Hz" },
  { freq: 1000, gain: 0, label: "1kHz" },
  { freq: 3500, gain: 0, label: "3.5kHz" },
  { freq: 6000, gain: 0, label: "6kHz" },
  { freq: 12000, gain: 0, label: "12kHz" },
  { freq: 16000, gain: 0, label: "16kHz" },
];

export default function AudioEqualizerPage() {
  const [bands, setBands] = useState<Band[]>(BANDS);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fileName, setFileName] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.load();
    }
    setLoaded(true);
  };

  const initAudio = useCallback(() => {
    if (ctxRef.current || !audioRef.current) return;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const source = ctx.createMediaElementSource(audioRef.current);
    const filters = bands.map((b, i) => {
      const filter = ctx.createBiquadFilter();
      filter.type = i === 0 ? "lowshelf" : i === bands.length - 1 ? "highshelf" : "peaking";
      filter.frequency.value = b.freq;
      filter.Q.value = 1;
      filter.gain.value = b.gain;
      return filter;
    });
    source.connect(filters[0]);
    for (let i = 0; i < filters.length - 1; i++) filters[i].connect(filters[i + 1]);
    filters[filters.length - 1].connect(ctx.destination);
    ctxRef.current = ctx;
    sourceRef.current = source;
    filtersRef.current = filters;
  }, [bands]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    initAudio();
    if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      await audioRef.current.play();
      setPlaying(true);
    }
  };

  const updateGain = (i: number, gain: number) => {
    const newBands = bands.map((b, idx) => (idx === i ? { ...b, gain } : b));
    setBands(newBands);
    if (filtersRef.current[i]) filtersRef.current[i].gain.value = gain;
  };

  const reset = () => {
    setBands(BANDS.map((b) => ({ ...b, gain: 0 })));
    filtersRef.current.forEach((f) => (f.gain.value = 0));
  };

  const presets: Record<string, number[]> = {
    平坦: [0, 0, 0, 0, 0, 0, 0, 0],
    低音增强: [8, 6, 4, 2, 0, 0, 0, 0],
    人声: [-2, -1, 2, 4, 3, 1, 0, -1],
    高音增强: [0, 0, 0, 0, 2, 4, 6, 8],
    摇滚: [5, 3, -1, 2, -1, 3, 5, 5],
    古典: [4, 3, 2, 0, 0, 2, 3, 4],
  };

  return (
    <ToolLayout
      title="音频均衡器"
      description="调整音频各频段增益"
      icon={SlidersHorizontal}
      category="视频音频"
      slug="audio-equalizer"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <audio ref={audioRef} crossOrigin="anonymous" />

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/50"
        >
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">{fileName ? `已加载：${fileName}` : "点击上传音频文件"}</p>
        </div>

        {loaded && (
          <>
            <div className="flex gap-2">
              <button onClick={togglePlay} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? "暂停" : "播放"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(presets).map(([name, gains]) => (
                <button
                  key={name}
                  onClick={() => { setBands(BANDS.map((b, i) => ({ ...b, gain: gains[i] }))); gains.forEach((g, i) => { if (filtersRef.current[i]) filtersRef.current[i].gain.value = g; }); }}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:border-primary-500/50 hover:text-primary-400"
                >
                  {name}
                </button>
              ))}
              <button onClick={reset} className="px-3 py-1.5 text-xs rounded-lg border border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:text-white">
                重置
              </button>
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-6">
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-48">
                {bands.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">{b.gain > 0 ? "+" : ""}{b.gain}</span>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={b.gain}
                      onChange={(e) => updateGain(i, Number(e.target.value))}
                      className="w-full accent-primary-500"
                      style={{ writingMode: "vertical-lr", direction: "rtl", height: "120px" }}
                    />
                    <span className="text-xs text-slate-400">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
