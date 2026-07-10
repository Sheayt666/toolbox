"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Gauge, Upload, Film, TrendingUp, Info } from "lucide-react";

interface FrameInfo {
  timestamp: number;
  mediaTime: number;
  presentedFrames: number;
  expectedDisplayTime: number;
  width: number;
  height: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function VideoFpsConverterPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [videoInfo, setVideoInfo] = useState<{
    width: number;
    height: number;
    duration: number;
    fps: number;
  } | null>(null);
  const [frameData, setFrameData] = useState<FrameInfo[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetFps, setTargetFps] = useState(30);
  const [realFps, setRealFps] = useState(0);
  const [droppedFrames, setDroppedFrames] = useState(0);
  const [avgInterval, setAvgInterval] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameDataRef = useRef<FrameInfo[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFrameData([]);
    frameDataRef.current = [];
    setRealFps(0);
    setDroppedFrames(0);
    setAvgInterval(0);
    setVideoInfo(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    const rvf = (v as any).requestVideoFrameCallback;
    const baseInfo = {
      width: v.videoWidth,
      height: v.videoHeight,
      duration: v.duration,
      fps: 30,
    };
    if (!rvf) {
      setVideoInfo(baseInfo);
      setTargetFps(30);
      return;
    }
    let count = 0;
    let startTime = 0;
    const check = (_now: number, meta: any) => {
      if (startTime === 0) startTime = meta.expectedDisplayTime;
      count++;
      if (count >= 30) {
        const elapsed = (meta.expectedDisplayTime - startTime) / 1000;
        const fps = elapsed > 0 ? Math.round(count / elapsed) : 30;
        setVideoInfo({ width: v.videoWidth, height: v.videoHeight, duration: v.duration, fps });
        setTargetFps(fps);
        return;
      }
      rvf.call(v, check);
    };
    rvf.call(v, check);
    setTimeout(() => {
      setVideoInfo((prev) => {
        if (prev) return prev;
        return baseInfo;
      });
    }, 3000);
  };

  const startAnalysis = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const rvf = (v as any).requestVideoFrameCallback;
    if (!rvf) return;
    setAnalyzing(true);
    setFrameData([]);
    frameDataRef.current = [];
    setDroppedFrames(0);
    setRealFps(0);
    v.currentTime = 0;
    v.muted = true;
    v.play().catch(() => {});

    let lastFrame = 0;
    const onFrame = (now: number, meta: any) => {
      const info: FrameInfo = {
        timestamp: now,
        mediaTime: meta.mediaTime,
        presentedFrames: meta.presentedFrames,
        expectedDisplayTime: meta.expectedDisplayTime,
        width: meta.width,
        height: meta.height,
      };
      frameDataRef.current.push(info);

      if (lastFrame > 0) {
        const gap = meta.presentedFrames - lastFrame;
        if (gap > 1) {
          setDroppedFrames((d) => d + (gap - 1));
        }
      }
      lastFrame = meta.presentedFrames;

      if (frameDataRef.current.length % 10 === 0) {
        setFrameData([...frameDataRef.current]);
      }

      if (v.ended || v.currentTime >= v.duration - 0.05) {
        setAnalyzing(false);
        setFrameData([...frameDataRef.current]);
        const frames = frameDataRef.current;
        if (frames.length >= 2) {
          const first = frames[0];
          const last = frames[frames.length - 1];
          const elapsed = (last.expectedDisplayTime - first.expectedDisplayTime) / 1000;
          if (elapsed > 0) setRealFps(Math.round((frames.length - 1) / elapsed));
          let totalInterval = 0;
          for (let i = 1; i < frames.length; i++) {
            totalInterval += frames[i].expectedDisplayTime - frames[i - 1].expectedDisplayTime;
          }
          setAvgInterval(frames.length > 1 ? totalInterval / (frames.length - 1) : 0);
        }
        return;
      }
      rvf.call(v, onFrame);
    };
    rvf.call(v, onFrame);
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fpsOptions = [24, 25, 30, 48, 50, 60, 120];
  const recommendedFps = videoInfo ? videoInfo.fps : 30;

  return (
    <ToolLayout
      title="视频帧率转换"
      description="分析视频帧率信息，计算真实FPS和丢帧情况"
      icon={Gauge}
      category="视频音频"
      slug="video-fps-converter"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">帧率分析工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              本工具使用 requestVideoFrameCallback API 实时分析视频帧率，计算真实渲染FPS、丢帧数和帧间隔。支持查看目标帧率转换建议。
            </p>
          </div>
        </div>

        {!videoUrl ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#27272a] rounded-xl py-14 cursor-pointer hover:border-primary-500/50 transition-colors">
            <Upload className="w-10 h-10 text-slate-600 mb-3" />
            <span className="text-sm text-slate-400">点击上传视频文件</span>
            <span className="text-xs text-slate-600 mt-1">支持 MP4, WebM, MOV 等格式</span>
            <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 truncate">{fileName}</span>
              <button
                onClick={() => { if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(null); setVideoInfo(null); setFrameData([]); }}
                className="text-xs text-slate-500 hover:text-white"
              >
                重新上传
              </button>
            </div>

            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={handleLoadedMetadata}
              controls
              className="w-full rounded-lg bg-black max-h-[400px]"
            />

            {videoInfo && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "分辨率", value: `${videoInfo.width}x${videoInfo.height}`, icon: Film },
                  { label: "时长", value: `${videoInfo.duration.toFixed(1)}s`, icon: Gauge },
                  { label: "检测帧率", value: `${videoInfo.fps} fps`, icon: TrendingUp },
                  { label: "总帧数(估)", value: `${Math.round(videoInfo.fps * videoInfo.duration)}`, icon: Film },
                ].map((s, i) => (
                  <div key={i} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                    <s.icon className="w-4 h-4 text-primary-400 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-sm text-white font-semibold mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-slate-500 block mb-1.5">目标帧率</label>
                <select
                  value={targetFps}
                  onChange={(e) => setTargetFps(Number(e.target.value))}
                  className="bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white"
                >
                  {fpsOptions.map((f) => (
                    <option key={f} value={f}>{f} fps</option>
                  ))}
                </select>
              </div>
              <button
                onClick={startAnalysis}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
              >
                <TrendingUp className="w-4 h-4" />
                {analyzing ? "分析中..." : "开始帧率分析"}
              </button>
            </div>

            {(realFps > 0 || analyzing) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
                  <p className="text-xs text-slate-500 mb-1">真实渲染FPS</p>
                  <p className="text-2xl font-bold text-emerald-400">{realFps || "—"}</p>
                  <p className="text-xs text-slate-600 mt-1">目标: {targetFps} fps</p>
                </div>
                <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
                  <p className="text-xs text-slate-500 mb-1">丢帧数</p>
                  <p className="text-2xl font-bold text-amber-400">{droppedFrames}</p>
                  <p className="text-xs text-slate-600 mt-1">分析期间丢失</p>
                </div>
                <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
                  <p className="text-xs text-slate-500 mb-1">平均帧间隔</p>
                  <p className="text-2xl font-bold text-primary-400">{avgInterval > 0 ? avgInterval.toFixed(2) : "—"}</p>
                  <p className="text-xs text-slate-600 mt-1">毫秒 (ms)</p>
                </div>
              </div>
            )}

            {frameData.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">帧分析数据（最近 {Math.min(frameData.length, 20)} 帧）</p>
                <div className="overflow-x-auto rounded-lg border border-[#27272a]">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0a0a0b] text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">媒体时间(s)</th>
                        <th className="px-3 py-2 text-left">显示帧序</th>
                        <th className="px-3 py-2 text-left">间隔(ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {frameData.slice(-20).map((f, i, arr) => {
                        const realIdx = frameData.length - arr.length + i;
                        const prev = realIdx > 0 ? frameData[realIdx - 1] : null;
                        const interval = prev ? (f.expectedDisplayTime - prev.expectedDisplayTime).toFixed(1) : "—";
                        return (
                          <tr key={realIdx} className="border-t border-[#27272a] text-slate-300">
                            <td className="px-3 py-1.5 font-mono">{realIdx + 1}</td>
                            <td className="px-3 py-1.5 font-mono">{f.mediaTime.toFixed(4)}</td>
                            <td className="px-3 py-1.5 font-mono">{f.presentedFrames}</td>
                            <td className={`px-3 py-1.5 font-mono ${prev && Number(interval) > (1000 / targetFps) * 1.5 ? "text-amber-400" : ""}`}>{interval}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {videoInfo && (
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
                <p className="text-xs text-slate-500 mb-2">帧率转换建议</p>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {targetFps > recommendedFps && (
                    <p>目标帧率({targetFps})高于源帧率({recommendedFps})，插帧会增加文件大小但不会提升流畅度</p>
                  )}
                  {targetFps < recommendedFps && (
                    <p>目标帧率({targetFps})低于源帧率({recommendedFps})，抽帧可减小文件大小，可能影响流畅度</p>
                  )}
                  {targetFps === recommendedFps && (
                    <p>目标帧率与源帧率一致，无需转换</p>
                  )}
                  {targetFps >= 60 && (
                    <p>60fps及以上适合游戏录制、运动场景；普通视频建议24-30fps</p>
                  )}
                  {targetFps <= 24 && (
                    <p>24fps为电影标准帧率，具有电影感；低于此值可能出现卡顿</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
