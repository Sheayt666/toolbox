"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { VolumeX, Upload, Play, Pause, Download, Volume2 } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function fmtTime(s: number) {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function AudioVolumeAdjusterPage() {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [boost, setBoost] = useState(0);
  const [fileName, setFileName] = useState("");
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [level, setLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);
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
    const gain = ctx.createGain();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);
    ctxRef.current = ctx;
    gainRef.current = gain;
    analyserRef.current = analyser;
    gain.gain.value = (volume / 100) * Math.pow(10, boost / 20);
    updateMeter();
  }, [volume, boost]);

  const updateMeter = () => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    setLevel(Math.sqrt(sum / data.length));
    rafRef.current = requestAnimationFrame(updateMeter);
  };

  const applyVolume = (vol: number, b: number) => {
    if (gainRef.current) gainRef.current.gain.value = (vol / 100) * Math.pow(10, b / 20);
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    initAudio();
    if (ctxRef.current?.state === "suspended") await ctxRef.current.resume();
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { await audioRef.current.play(); setPlaying(true); }
  };

  return (
    <ToolLayout
      title="音频音量调节"
      description="调整音频文件音量"
      icon={VolumeX}
      category="视频音频"
      slug="audio-volume-adjuster"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <audio
          ref={audioRef}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setPlaying(false)}
        />

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
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? "暂停" : "播放"}
              </button>
              <span className="text-xs text-slate-400 font-mono ml-auto">{fmtTime(current)} / {fmtTime(duration)}</span>
            </div>

            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.01}
              value={current}
              onChange={(e) => { if (audioRef.current) { audioRef.current.currentTime = Number(e.target.value); setCurrent(Number(e.target.value)); } }}
              className="w-full accent-primary-500"
            />

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-300 flex items-center gap-2"><Volume2 className="w-4 h-4" /> 音量</label>
                  <span className="text-sm text-white font-mono">{volume}%</span>
                </div>
                <input
                  type="range" min={0} max={200} value={volume}
                  onChange={(e) => { const v = Number(e.target.value); setVolume(v); applyVolume(v, boost); }}
                  className="w-full accent-primary-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-300">增益（dB）</label>
                  <span className="text-sm text-white font-mono">{boost > 0 ? "+" : ""}{boost} dB</span>
                </div>
                <input
                  type="range" min={-30} max={30} value={boost}
                  onChange={(e) => { const b = Number(e.target.value); setBoost(b); applyVolume(volume, b); }}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>-30dB</span><span>0</span><span>+30dB</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">实时电平</label>
                <div className="h-4 rounded-full bg-[#16161a] overflow-hidden">
                  <div className="h-full transition-all duration-75 rounded-full" style={{ width: `${Math.min(100, level * 200)}%`, backgroundColor: level > 0.5 ? "#ef4444" : level > 0.3 ? "#eab308" : "#10b981" }} />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                当前增益倍数：{((volume / 100) * Math.pow(10, boost / 20)).toFixed(2)}x。音量超过 100% 或增益为正时会放大信号，注意避免削波失真。电平表红色区域表示可能削波。
              </p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
