"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Repeat, Upload, Play, Pause, Download, Scissors } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function fmtTime(s: number) {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function AudioLoopPage() {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [looping, setLooping] = useState(true);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [fileName, setFileName] = useState("");
  const [loopCount, setLoopCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.loop = false;
      audioRef.current.load();
    }
    setLoaded(true);
    setLoopCount(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrent(audio.currentTime);
      if (looping && end > start && audio.currentTime >= end) {
        audio.currentTime = start;
        setLoopCount((c) => c + 1);
      }
    };
    const onMeta = () => {
      setDuration(audio.duration);
      setEnd(audio.duration);
    };
    const onEnded = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [looping, start, end]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { await audioRef.current.play(); setPlaying(true); }
  };

  const setLoopStart = () => setStart(current);
  const setLoopEnd = () => setEnd(current);

  return (
    <ToolLayout
      title="音频循环制作"
      description="制作无缝循环音频"
      icon={Repeat}
      category="视频音频"
      slug="audio-loop"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <audio ref={audioRef} />

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
              <button onClick={() => setLooping(!looping)} className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border ${looping ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                <Repeat className="w-4 h-4" /> 循环 {looping ? "开" : "关"}
              </button>
              <span className="text-xs text-slate-500 ml-auto">已循环 {loopCount} 次</span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                <span>{fmtTime(current)}</span>
                <span>{fmtTime(duration)}</span>
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
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 space-y-4">
              <p className="text-sm text-slate-300 flex items-center gap-2"><Scissors className="w-4 h-4 text-primary-400" /> 循环区间设置</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-400">起点</label>
                    <button onClick={setLoopStart} className="text-xs text-primary-400 hover:text-primary-300">设为当前</button>
                  </div>
                  <input type="range" min={0} max={duration || 0} step={0.01} value={start} onChange={(e) => setStart(Number(e.target.value))} className="w-full accent-primary-500" />
                  <p className="text-xs text-white font-mono mt-1">{fmtTime(start)}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-slate-400">终点</label>
                    <button onClick={setLoopEnd} className="text-xs text-primary-400 hover:text-primary-300">设为当前</button>
                  </div>
                  <input type="range" min={0} max={duration || 0} step={0.01} value={end} onChange={(e) => setEnd(Number(e.target.value))} className="w-full accent-primary-500" />
                  <p className="text-xs text-white font-mono mt-1">{fmtTime(end)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded bg-[#16161a] border border-[#1f1f23] p-2.5">
                <span className="text-xs text-slate-400">循环时长</span>
                <span className="text-sm text-white font-mono">{fmtTime(Math.max(0, end - start))}</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                提示：设置好起点和终点后开启循环，音频将在该区间内无缝重复播放。可拖动进度条定位，按「设为当前」快速标记循环点。
              </p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
