"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Crop, Upload, Play, Pause, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function fmtTime(s: number) {
  if (!isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function VideoCropPage() {
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [fileName, setFileName] = useState("");
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [crop, setCrop] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const clipPath = `inset(${crop.top}% ${crop.right}% ${crop.bottom}% ${crop.left}%)`;
  const cropW = 100 - crop.left - crop.right;
  const cropH = 100 - crop.top - crop.bottom;

  const captureFrame = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    const vw = v.videoWidth, vh = v.videoHeight;
    const sx = (vw * crop.left) / 100;
    const sy = (vh * crop.top) / 100;
    const sw = (vw * cropW) / 100;
    const sh = (vh * cropH) / 100;
    c.width = sw; c.height = sh;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, sw, sh);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `crop-frame-${Math.round(current)}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="视频裁剪"
      description="裁剪视频画面"
      icon={Crop}
      category="视频音频"
      slug="video-crop"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <video ref={videoRef} className="hidden" />
        <canvas ref={canvasRef} className="hidden" />

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
                style={{ clipPath, maxWidth: "100%", maxHeight: 360 }}
                controls={false}
                playsInline
              />
            </div>

            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {playing ? "暂停" : "播放"}
              </button>
              <span className="text-xs text-slate-400 font-mono ml-auto">{fmtTime(current)} / {fmtTime(duration)}</span>
            </div>

            <input type="range" min={0} max={duration || 0} step={0.01} value={current} onChange={(e) => { if (videoRef.current) { videoRef.current.currentTime = Number(e.target.value); setCurrent(Number(e.target.value)); } }} className="w-full accent-primary-500" />

            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 space-y-3">
              <p className="text-sm text-slate-300">裁剪区域（百分比）</p>
              <div className="grid grid-cols-2 gap-3">
                {(["top", "right", "bottom", "left"] as const).map((side) => (
                  <div key={side}>
                    <label className="text-xs text-slate-400 mb-1 block">{side === "top" ? "上" : side === "right" ? "右" : side === "bottom" ? "下" : "左"} {crop[side]}%</label>
                    <input type="range" min={0} max={45} value={crop[side]} onChange={(e) => setCrop({ ...crop, [side]: Number(e.target.value) })} className="w-full accent-primary-500" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded bg-[#16161a] border border-[#1f1f23] p-2.5">
                <span className="text-xs text-slate-400">裁剪后比例</span>
                <span className="text-sm text-white font-mono">{cropW.toFixed(0)}% × {cropH.toFixed(0)}%</span>
              </div>
            </div>

            <button onClick={captureFrame} className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm font-medium rounded-lg">
              <Download className="w-4 h-4" /> 截取当前裁剪画面
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
