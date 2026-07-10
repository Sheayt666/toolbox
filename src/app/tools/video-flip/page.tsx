"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FlipVertical, Upload, Play, Pause, Download } from "lucide-react";

function fmtTime(s: number) {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function VideoFlipPage() {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fileName, setFileName] = useState("");
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [flipH, setFlipH] = useState(true);
  const [flipV, setFlipV] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    setFileName(file.name);
    const url = URL.createObjectURL(file);
    if (videoRef.current) { videoRef.current.src = url; videoRef.current.load(); }
    setLoaded(true);
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

  const transform = `scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`;

  const captureFrame = () => {
    const v = videoRef.current;
    if (!v) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.save();
    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(v, -c.width / 2, -c.height / 2);
    ctx.restore();
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `flipped-frame-${Math.round(current)}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="视频翻转"
      description="翻转视频画面"
      icon={FlipVertical}
      category="视频音频"
      slug="video-flip"
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
            <div className="rounded-lg bg-black border border-[#27272a] overflow-hidden flex items-center justify-center" style={{ minHeight: 240 }}>
              <video
                src={videoRef.current?.src}
                style={{ transform, maxWidth: "100%", maxHeight: 360 }}
                playsInline
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={togglePlay} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? "暂停" : "播放"}
              </button>
              <button onClick={() => setFlipH(!flipH)} className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border ${flipH ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                <FlipVertical className="w-4 h-4" /> 水平翻转 {flipH ? "开" : "关"}
              </button>
              <button onClick={() => setFlipV(!flipV)} className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border ${flipV ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                <FlipVertical className="w-4 h-4 rotate-90" /> 垂直翻转 {flipV ? "开" : "关"}
              </button>
              <span className="text-xs text-slate-400 font-mono ml-auto">{fmtTime(current)} / {fmtTime(duration)}</span>
            </div>

            <input type="range" min={0} max={duration || 0} step={0.01} value={current} onChange={(e) => { if (videoRef.current) { videoRef.current.currentTime = Number(e.target.value); setCurrent(Number(e.target.value)); } }} className="w-full accent-primary-500" />

            <button onClick={captureFrame} className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm font-medium rounded-lg">
              <Download className="w-4 h-4" /> 截取翻转后画面
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
