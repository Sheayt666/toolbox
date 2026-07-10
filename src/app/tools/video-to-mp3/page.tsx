"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Music2, Upload, Download, Info, Loader2, Volume2 } from "lucide-react";

export default function VideoToMp3Page() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioInfo, setAudioInfo] = useState<{
    duration: number;
    sampleRate: number;
    channels: number;
    size: string;
  } | null>(null);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setAudioUrl(null);
    setAudioInfo(null);
    setProgress(0);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const extractAudio = async () => {
    if (!videoUrl) return;
    setProcessing(true);
    setError("");
    setProgress(10);

    try {
      const response = await fetch(videoUrl);
      const arrayBuffer = await response.arrayBuffer();
      setProgress(30);

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setProgress(60);

      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const length = audioBuffer.length;

      const wavBuffer = encodeWAV(audioBuffer, numChannels, sampleRate, length);
      setProgress(90);

      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioInfo({
        duration: audioBuffer.duration,
        sampleRate,
        channels: numChannels,
        size: (blob.size / 1024 / 1024).toFixed(2) + " MB",
      });
      setProgress(100);
      audioCtx.close();
    } catch (err) {
      setError("音频提取失败：可能不支持该视频格式，或浏览器无法解码音频流。" + (err instanceof Error ? ` (${err.message})` : ""));
    } finally {
      setProcessing(false);
    }
  };

  const encodeWAV = (audioBuffer: AudioBuffer, numChannels: number, sampleRate: number, length: number) => {
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const channelData = audioBuffer.getChannelData(ch);
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample * 0x7fff, true);
        offset += 2;
      }
    }

    return buffer;
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = fileName.replace(/\.[^.]+$/, "") + "_audio.wav";
    a.click();
  };

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ToolLayout
      title="视频转MP3"
      description="从视频中提取音频，使用Web Audio API解码并导出WAV格式音频文件"
      icon={Music2}
      category="视频音频"
      slug="video-to-mp3"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">音频提取工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              本工具使用 Web Audio API 从视频文件中提取音频轨道，解码后编码为高质量 WAV 音频文件。所有处理在浏览器本地完成，文件不会上传服务器。
            </p>
          </div>
        </div>

        {!videoUrl ? (
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#27272a] rounded-xl py-14 cursor-pointer hover:border-primary-500/50 transition-colors">
            <Upload className="w-10 h-10 text-slate-600 mb-3" />
            <span className="text-sm text-slate-400">点击上传视频文件</span>
            <span className="text-xs text-slate-600 mt-1">支持 MP4, WebM, MOV, AVI 等格式</span>
            <input type="file" accept="video/*" onChange={handleFile} className="hidden" />
          </label>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400 truncate">{fileName}</span>
              <button
                onClick={() => { if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(null); setAudioUrl(null); setAudioInfo(null); setProgress(0); }}
                className="text-xs text-slate-500 hover:text-white"
              >
                重新上传
              </button>
            </div>

            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full rounded-lg bg-black max-h-[300px]"
            />

            <button
              onClick={extractAudio}
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提取中... {progress}%
                </>
              ) : (
                <>
                  <Music2 className="w-4 h-4" />
                  提取音频
                </>
              )}
            </button>

            {processing && (
              <div className="w-full bg-[#0a0a0b] rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {audioUrl && audioInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "时长", value: `${audioInfo.duration.toFixed(1)}s` },
                    { label: "采样率", value: `${(audioInfo.sampleRate / 1000).toFixed(1)} kHz` },
                    { label: "声道数", value: `${audioInfo.channels === 1 ? "单声道" : "立体声"}` },
                    { label: "文件大小", value: audioInfo.size },
                  ].map((s, i) => (
                    <div key={i} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                      <p className="text-xs text-slate-500">{s.label}</p>
                      <p className="text-sm text-white font-semibold mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Volume2 className="w-4 h-4 text-primary-400" />
                    <span className="text-sm font-medium text-slate-300">音频预览</span>
                  </div>
                  <audio src={audioUrl} controls className="w-full" />
                </div>

                <button
                  onClick={downloadAudio}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg"
                >
                  <Download className="w-4 h-4" />
                  下载音频文件 (WAV)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}
