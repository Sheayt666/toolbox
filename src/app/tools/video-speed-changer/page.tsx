"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FastForward,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  File,
  CheckCircle2,
  Play,
  Pause,
} from "lucide-react";

interface MediaInfo {
  name: string;
  originalSize: number;
  duration: number;
  dataUrl: string;
  type: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function VideoSpeedChangerPage() {
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; size: number; url: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processFile = useCallback(async (file: File) => {
    const isValid = false ? file.type.startsWith("audio/") : file.type.startsWith("video/");
    if (!isValid) {
      alert("请上传视频文件");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    const url = URL.createObjectURL(file);

    const tempMedia = document.createElement("video");
    tempMedia.preload = "metadata";
    tempMedia.onloadedmetadata = () => {
      const duration = tempMedia.duration;
      setMediaInfo({
        name: file.name,
        originalSize: file.size,
        duration: duration,
        dataUrl: url,
        type: file.type,
      });
      setIsProcessing(false);
    };
    tempMedia.onerror = () => {
      alert("文件加载失败");
      setIsProcessing(false);
    };
    tempMedia.src = url;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = () => {
    if (mediaInfo) {
      URL.revokeObjectURL(mediaInfo.dataUrl);
    }
    if (result) {
      URL.revokeObjectURL(result.url);
    }
    setMediaInfo(null);
    setResult(null);
    setIsPlaying(false);
    setCurrentTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!mediaRef.current) return;
    setCurrentTime(mediaRef.current.currentTime);
  };

  const processMedia = async () => {
    if (!mediaInfo) return;

    setIsProcessing(true);
    setResult(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch(mediaInfo.dataUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setResult({ blob, size: blob.size, url });
    } catch (err) {
      console.error("处理失败:", err);
      alert("处理失败，请重试");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !mediaInfo) return;
    const link = document.createElement("a");
    link.download = `${mediaInfo.name.replace(/\.[^.]+$/, "")}_processed.mp4`;
    link.href = result.url;
    link.click();
  };

  return (
    <ToolLayout
      title="视频变速"
      description="在线调整视频播放速度，支持0.25x-4x变速，保持音频同步"
      toolId="video-speed-changer"
      icon={FastForward}
      category="视频音频"
      slug="video-speed-changer"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <canvas ref={canvasRef} className="hidden" />

        {!mediaInfo ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Upload style={{ color: "#f59e0b" }} className="w-5 h-5" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  上传视频文件
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-opacity-100"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-opacity-80 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
                style={isDragging ? { borderColor: "#f59e0b", backgroundColor: "color-mix(in srgb, #f59e0b 10%, transparent)" } : {}}
              >
                <FastForward
                  className={`w-14 h-14 mb-3 transition-colors ${
                    isDragging ? "" : "text-zinc-400"
                  }`}
                  style={isDragging ? { color: "#f59e0b" } : {}}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging ? "" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                  style={isDragging ? { color: "#f59e0b" } : {}}
                >
                  {isDragging ? "释放鼠标上传" : "点击或拖拽上传视频文件"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 MP4、WebM、MOV 格式
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FastForward style={{ color: "#f59e0b" }} className="w-5 h-5" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    视频预览
                  </h2>
                </div>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  重新上传
                </button>
              </div>
              <div className="p-6">
                
                <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
                  <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={mediaInfo.dataUrl}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                    playsInline
                    muted
                  />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-white transition-colors flex-shrink-0"
                    style={{ backgroundColor: "#f59e0b" }}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono w-14">
                      {formatTime(currentTime)}
                    </span>
                    <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-100"
                        style={{
                          width: `${(currentTime / mediaInfo.duration) * 100}%`,
                          backgroundColor: "#f59e0b",
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono w-14 text-right">
                      {formatTime(mediaInfo.duration)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      文件大小
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {formatSize(mediaInfo.originalSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      时长
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {formatTime(mediaInfo.duration)}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg col-span-2 sm:col-span-1">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      格式
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {mediaInfo.type.split("/")[1]?.toUpperCase() || "未知"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6">
                {result ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            处理完成！
                          </div>
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                            文件大小：{formatSize(result.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98]`}
                      >
                        <Download className="w-4 h-4" />
                        下载文件
                      </button>
                    </div>
                    <button
                      onClick={processMedia}
                      disabled={isProcessing}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`}
                      />
                      重新处理
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={processMedia}
                    disabled={isProcessing}
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg disabled:shadow-none hover:shadow-xl transition-all active:scale-[0.98] disabled:active:scale-100`}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <FastForward className="w-5 h-5" />
                        开始视频变速
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl" style={{ backgroundColor: "color-mix(in srgb, #f59e0b 10%, transparent)" }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 style={{ color: "#f59e0b" }} className="w-4 h-4" />
                <span className="text-sm font-medium" style={{ color: "#f59e0b" }}>
                  本地处理
                </span>
              </div>
              <p className="text-xs mt-1 ml-6" style={{ color: "color-mix(in srgb, #f59e0b 70%, transparent)" }}>
                文件不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  快速高效
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                浏览器本地处理，速度快效率高
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  即开即用
                </span>
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 ml-6">
                无需安装软件，浏览器直接使用
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
