"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Film,
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Scissors,
  Zap,
  Clock,
  Maximize2,
  Sparkles,
} from "lucide-react";

interface VideoData {
  name: string;
  originalSize: number;
  duration: number;
  originalDataUrl: string;
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
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
}

// GIF.js 类型声明
declare global {
  interface Window {
    GIF: any;
  }
}

export default function VideoToGifPage() {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [gifLibLoaded, setGifLibLoaded] = useState(false);
  const [gifLibLoading, setGifLibLoading] = useState(false);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fps, setFps] = useState(10);
  const [quality, setQuality] = useState(10);
  const [width, setWidth] = useState(480);
  const [isCustomSize, setIsCustomSize] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 动态加载gif.js
  const loadGifJs = useCallback(() => {
    if (gifLibLoaded || gifLibLoading) return;

    setGifLibLoading(true);

    // 检查是否已加载
    if (typeof window !== "undefined" && window.GIF) {
      setGifLibLoaded(true);
      setGifLibLoading(false);
      return;
    }

    // 加载gif.js (CDN)
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.min.js";
    script.onload = () => {
      setGifLibLoaded(true);
      setGifLibLoading(false);
    };
    script.onerror = () => {
      setGifLibLoading(false);
      console.error("gif.js加载失败");
    };
    document.head.appendChild(script);
  }, [gifLibLoaded, gifLibLoading]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("请上传视频文件");
      return;
    }

    setIsProcessing(true);
    setResultDataUrl("");
    setResultSize(0);
    setProgress(0);

    const url = URL.createObjectURL(file);

    // 获取视频时长
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.onloadedmetadata = () => {
      const duration = tempVideo.duration;
      setVideoData({
        name: file.name,
        originalSize: file.size,
        duration: duration,
        originalDataUrl: url,
        type: file.type,
      });
      setStartTime(0);
      setEndTime(Math.min(5, duration));
      setCurrentTime(0);
      setIsProcessing(false);

      // 计算默认宽度（保持比例）
      const videoWidth = tempVideo.videoWidth;
      const videoHeight = tempVideo.videoHeight;
      if (videoWidth > 0) {
        const maxWidth = 480;
        if (videoWidth > maxWidth) {
          setWidth(maxWidth);
        } else {
          setWidth(videoWidth);
        }
      }

      loadGifJs();
    };
    tempVideo.onerror = () => {
      alert("视频加载失败");
      setIsProcessing(false);
    };
    tempVideo.src = url;
  }, [loadGifJs]);

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
    if (videoData) {
      URL.revokeObjectURL(videoData.originalDataUrl);
    }
    setVideoData(null);
    setResultDataUrl("");
    setResultSize(0);
    setProgress(0);
    setIsPlaying(false);
    setCurrentTime(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (videoData) {
      setStartTime(0);
      setEndTime(Math.min(5, videoData.duration));
    }
    setFps(10);
    setQuality(10);
    setIsCustomSize(false);
    setResultDataUrl("");
    setResultSize(0);
  };

  // 视频播放控制
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // 到达结束时间时循环播放选中片段
    if (videoRef.current.currentTime >= endTime) {
      videoRef.current.currentTime = startTime;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val >= endTime) {
      setStartTime(Math.max(0, endTime - 0.1));
    } else {
      setStartTime(val);
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (val <= startTime) {
      setEndTime(Math.min(videoData?.duration || 0, startTime + 0.1));
    } else {
      setEndTime(val);
    }
  };

  const setStartFromCurrent = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    if (t >= endTime) {
      setStartTime(Math.max(0, endTime - 0.1));
    } else {
      setStartTime(t);
    }
  };

  const setEndFromCurrent = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    if (t <= startTime) {
      setEndTime(Math.min(videoData?.duration || 0, startTime + 0.1));
    } else {
      setEndTime(t);
    }
  };

  // 生成GIF
  const generateGif = useCallback(async () => {
    if (!videoData || !videoRef.current || !gifLibLoaded) return;

    setIsProcessing(true);
    setProgress(0);
    setResultDataUrl("");
    setResultSize(0);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 计算输出尺寸
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const outputWidth = isCustomSize ? width : Math.min(width, videoWidth);
      const outputHeight = Math.round((outputWidth / videoWidth) * videoHeight);

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // 创建GIF实例
      const gif = new window.GIF({
        workers: 2,
        quality: quality,
        width: outputWidth,
        height: outputHeight,
        workerScript: "https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js",
      });

      gif.on("progress", (p: number) => {
        setProgress(Math.round(p * 100));
      });

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setResultDataUrl(url);
        setResultSize(blob.size);
        setIsProcessing(false);
        setProgress(100);
      });

      // 计算帧数
      const duration = endTime - startTime;
      const frameCount = Math.floor(duration * fps);
      const frameDelay = 1000 / fps;

      // 逐帧捕获
      video.pause();
      video.currentTime = startTime;

      let frameIndex = 0;

      const captureFrame = () => {
        if (frameIndex >= frameCount) {
          // 渲染GIF
          gif.render();
          return;
        }

        const targetTime = startTime + (frameIndex / fps);
        video.currentTime = targetTime;

        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);

          ctx.drawImage(video, 0, 0, outputWidth, outputHeight);
          gif.addFrame(ctx, { copy: true, delay: frameDelay });

          setProgress(Math.round((frameIndex / frameCount) * 50));
          frameIndex++;

          requestAnimationFrame(captureFrame);
        };

        video.addEventListener("seeked", onSeeked);
      };

      const onStartSeeked = () => {
        video.removeEventListener("seeked", onStartSeeked);
        captureFrame();
      };

      video.addEventListener("seeked", onStartSeeked);
      video.currentTime = startTime;
    } catch (error) {
      console.error("生成GIF失败:", error);
      alert("生成GIF失败，请重试");
      setIsProcessing(false);
    }
  }, [videoData, startTime, endTime, fps, quality, width, isCustomSize, gifLibLoaded]);

  const handleDownload = () => {
    if (!resultDataUrl || !videoData) return;
    const link = document.createElement("a");
    link.download = `${videoData.name.replace(/\.[^.]+$/, "")}.gif`;
    link.href = resultDataUrl;
    link.click();
  };

  const clipDuration = endTime - startTime;

  return (
    <ToolLayout
      title="视频转GIF"
      description="在线视频转GIF工具，支持MP4、WebM等格式，可调整起止时间、帧率、质量和尺寸，一键生成GIF动图"
      toolId="video-to-gif"
      icon={Film}
      category="图片工具"
      slug="video-to-gif"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 隐藏的canvas用于帧捕获 */}
        <canvas ref={canvasRef} className="hidden" />

        {/* 上传区域 */}
        {!videoData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  上传视频
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-72 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-rose-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isDragging ? "释放鼠标上传视频" : "点击或拖拽上传视频"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 MP4、WebM、MOV 等格式
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
            {/* 视频预览区域 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    视频预览
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重置
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    重新上传
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    src={videoData.originalDataUrl}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                    playsInline
                    muted
                  />

                  {/* 起止时间标记 */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                    <div
                      className="absolute h-full bg-rose-500/50"
                      style={{
                        left: `${(startTime / videoData.duration) * 100}%`,
                        width: `${((endTime - startTime) / videoData.duration) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 播放控制 */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-colors flex-shrink-0"
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
                    <input
                      type="range"
                      min={0}
                      max={videoData.duration}
                      step={0.01}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                    />
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono w-14 text-right">
                      {formatTime(videoData.duration)}
                    </span>
                  </div>
                </div>

                {/* 信息 */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      文件大小
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {formatSize(videoData.originalSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      视频时长
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {formatTime(videoData.duration)}
                    </div>
                  </div>
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <div className="text-xs text-rose-600 dark:text-rose-400 mb-1">
                      截取时长
                    </div>
                    <div className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      {clipDuration.toFixed(2)}s
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      文件格式
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {videoData.type.split("/")[1]?.toUpperCase() || "MP4"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 设置和生成 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-rose-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      GIF设置
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 起止时间 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      <Scissors className="w-4 h-4 text-rose-500" />
                      截取时间段
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 w-16">
                          开始时间
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={videoData.duration}
                          step={0.01}
                          value={startTime}
                          onChange={handleStartTimeChange}
                          className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                        />
                        <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 w-16 text-right">
                          {formatTime(startTime)}
                        </span>
                        <button
                          onClick={setStartFromCurrent}
                          className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="设为当前时间"
                        >
                          当前
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 w-16">
                          结束时间
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={videoData.duration}
                          step={0.01}
                          value={endTime}
                          onChange={handleEndTimeChange}
                          className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                        />
                        <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 w-16 text-right">
                          {formatTime(endTime)}
                        </span>
                        <button
                          onClick={setEndFromCurrent}
                          className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                          title="设为当前时间"
                        >
                          当前
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 帧率 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Zap className="w-4 h-4 text-rose-500" />
                        帧率 (FPS)
                      </label>
                      <span className="text-sm font-bold text-rose-500">{fps}</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={24}
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>5 FPS</span>
                      <span>流畅</span>
                      <span>24 FPS</span>
                    </div>
                  </div>

                  {/* 质量 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        质量
                      </label>
                      <span className="text-sm font-bold text-rose-500">
                        {quality <= 5 ? "高" : quality <= 10 ? "中" : "低"}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>高质量</span>
                      <span>中等</span>
                      <span>小体积</span>
                    </div>
                  </div>

                  {/* 尺寸 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Maximize2 className="w-4 h-4 text-rose-500" />
                        输出宽度
                      </label>
                      <button
                        onClick={() => setIsCustomSize(!isCustomSize)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isCustomSize
                            ? "bg-rose-500 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                        }`}
                      >
                        {isCustomSize ? "自定义" : "自动"}
                      </button>
                    </div>
                    {isCustomSize ? (
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={100}
                          max={1280}
                          step={10}
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                          className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                        />
                        <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 w-20 text-right">
                          {width}px
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        自动适配，最大宽度 480px
                      </p>
                    )}
                  </div>

                  {/* 预估信息 */}
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-rose-600 dark:text-rose-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        预估帧数
                      </span>
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-300">
                        约 {Math.floor(clipDuration * fps)} 帧
                      </span>
                    </div>
                    <div className="text-xs text-rose-500 dark:text-rose-400">
                      截取 {clipDuration.toFixed(2)} 秒 × {fps} FPS
                    </div>
                  </div>
                </div>
              </div>

              {/* 生成和下载 */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-rose-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      生成GIF
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center mb-4"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                    }}
                  >
                    {isProcessing ? (
                      <div className="text-center">
                        <RefreshCw className="w-10 h-10 text-rose-500 animate-spin mx-auto mb-2" />
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">
                          生成中 {progress}%
                        </div>
                        <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full mt-2 mx-auto overflow-hidden">
                          <div
                            className="h-full bg-rose-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ) : resultDataUrl ? (
                      <img
                        src={resultDataUrl}
                        alt="GIF预览"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-zinc-400 text-sm">点击下方按钮生成GIF</div>
                    )}
                  </div>

                  {resultDataUrl && (
                    <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-rose-600 dark:text-rose-400">
                          输出格式
                        </span>
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          GIF 动图
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-rose-600 dark:text-rose-400">
                          文件大小
                        </span>
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                          {formatSize(resultSize)}
                        </span>
                      </div>
                    </div>
                  )}

                  {!resultDataUrl ? (
                    <button
                      onClick={generateGif}
                      disabled={isProcessing || !gifLibLoaded}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-rose-500/25 disabled:shadow-none hover:shadow-rose-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          生成中 {progress}%
                        </>
                      ) : gifLibLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          加载组件中...
                        </>
                      ) : (
                        <>
                          <Film className="w-5 h-5" />
                          生成GIF动图
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleDownload}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all active:scale-[0.98]"
                      >
                        <Download className="w-5 h-5" />
                        下载GIF动图
                      </button>
                      <button
                        onClick={generateGif}
                        disabled={isProcessing}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl transition-all active:scale-[0.98]"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新生成
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <div className="text-sm font-medium text-rose-700 dark:text-rose-300">
                精准截取
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                自由选择起止时间，精确到0.01秒
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                本地处理
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                视频不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                参数可调
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                帧率、质量、尺寸自由调节
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
