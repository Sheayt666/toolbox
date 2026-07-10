"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Camera, Upload, Play, Pause, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function fmtTime(s: number) {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function VideoScreenshotPage() {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fileName, setFileName] = useState("");
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shots, setShots] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    if (videoRef.current) { videoRef.current.src = url; videoRef.current.load(); }
    setLoaded(true);
    setShots([]);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration);
    const onEnd = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (playing) { videoRef.current.pause(); setPlaying(false); }
    else { await videoRef.current.play(); setPlaying(true); }
  };

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/png");
    setShots((prev) => [...prev, dataUrl]);
  }, []);

  const downloadShot = (dataUrl: string, i: number) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `screenshot-${i + 1}.png`;
    a.click();
  };

  const downloadAll = () => {
    shots.forEach((s, i) => {
      setTimeout(() => downloadShot(s, i), i * 300);
    });
  };

  return (
    <ToolLayout
      title="视频截图"
      description="从视频中截取画面"
      icon={Camera}
      category="视频音频"
      slug="video-screenshot"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <video ref={videoRef} className="hidden" />

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-6 text-center cursor-pointer hover:border-primary-500/50"
        >
          <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
          <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">{fileName ? `已加载：${fileName}` : "点击上传视频文件"}</p>
        </div>

        {loaded && (
          <>
            <div className="rounded-lg bg-black border border-[#27272a] overflow-hidden flex items-center justify-center" style={{ minHeight: 220 }}>
              <video src={videoRef.current?.src} style={{ maxWidth: "100%", maxHeight: 320 }} playsInline />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={togglePlay} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? "暂停" : "播放"}
              </button>
              <button onClick={capture} className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg">
                <Camera className="w-4 h-4" /> 截图
              </button>
              {shots.length > 0 && (
                <button onClick={downloadAll} className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg">
                  <Download className="w-4 h-4" /> 全部下载
                </button>
              )}
              <span className="text-xs text-slate-400 font-mono ml-auto">{fmtTime(current)} / {fmtTime(duration)}</span>
            </div>

            <input type="range" min={0} max={duration || 0} step={0.01} value={current} onChange={(e) => { if (videoRef.current) { videoRef.current.currentTime = Number(e.target.value); setCurrent(Number(e.target.value)); } }} className="w-full accent-primary-500" />

            {shots.length > 0 && (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">已截取画面（{shots.length}）</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {shots.map((s, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-[#27272a] group relative">
                      <img src={s} alt={`shot ${i + 1}`} className="w-full" />
                      <button onClick={() => downloadShot(s, i)} className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="w-4 h-4" />
                      </button>
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
