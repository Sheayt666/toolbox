"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Volume2,
  Play,
  Pause,
  Square,
  Mic,
  Gauge,
  Music,
  VolumeX,
  CheckCircle2,
  RotateCcw,
  Type,
  Languages,
  Copy,
  Trash2,
  Download,
} from "lucide-react";

interface VoiceOption {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

const SAMPLE_TEXT = `欢迎使用文字转语音工具！
这是一个基于浏览器原生 Web Speech API 的在线朗读工具。
您可以在此输入任意文字，选择喜欢的音色，调整语速、音调和音量，
然后点击播放按钮即可听到流畅的语音朗读。

支持多种语言和音色，具体取决于您的操作系统和浏览器。
建议使用 Chrome 或 Edge 浏览器以获得最佳体验。`;

export default function TextToSpeechPage() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);

  // 初始化语音列表
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const voiceOptions: VoiceOption[] = availableVoices.map((v) => ({
        name: v.name,
        lang: v.lang,
        voice: v,
      }));
      setVoices(voiceOptions);

      // 默认选择第一个中文语音
      const zhVoice = voiceOptions.find((v) => v.lang.startsWith("zh"));
      if (zhVoice && !selectedVoice) {
        setSelectedVoice(zhVoice.name);
      } else if (voiceOptions.length > 0 && !selectedVoice) {
        setSelectedVoice(voiceOptions[0].name);
      }
    };

    loadVoices();

    // 某些浏览器需要等待 voiceschanged 事件
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 计算进度
  const updateProgress = useCallback(() => {
    if (text.length > 0) {
      // 进度基于字符数估算
      const totalChars = text.length;
      const spokenChars = Math.min(
        currentWordIndex * 5, // 粗略估算每个词5个字符
        totalChars
      );
      setProgress(Math.round((spokenChars / totalChars) * 100));
    }
  }, [text, currentWordIndex]);

  useEffect(() => {
    updateProgress();
  }, [currentWordIndex, updateProgress]);

  // 开始朗读
  const handleSpeak = useCallback(() => {
    if (!text.trim()) {
      alert("请输入要朗读的文字");
      return;
    }

    if (!window.speechSynthesis) return;

    // 如果已暂停，则继续
    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // 停止当前朗读
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 设置语音
    const voice = voices.find((v) => v.name === selectedVoice);
    if (voice) {
      utterance.voice = voice.voice;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // 分词用于进度追踪
    const words = text.split(/[\s，。！？、；：""''（）【】《》,.!?;:"'()\[\]<>]+/).filter(Boolean);
    wordsRef.current = words;
    setCurrentWordIndex(0);

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
        setCurrentWordIndex(0);
      }, 1000);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    // 使用 onboundary 追踪朗读进度
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const charIndex = event.charIndex;
        const totalChars = text.length;
        setProgress(Math.round((charIndex / totalChars) * 100));
        // 估算词索引
        const estimatedWordIndex = Math.floor(
          (charIndex / totalChars) * wordsRef.current.length
        );
        setCurrentWordIndex(estimatedWordIndex);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [text, voices, selectedVoice, rate, pitch, volume, isPaused]);

  // 暂停
  const handlePause = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  // 停止
  const handleStop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentWordIndex(0);
  };

  // 清空文本
  const handleClear = () => {
    handleStop();
    setText("");
  };

  // 重置设置
  const handleReset = () => {
    setRate(1);
    setPitch(1);
    setVolume(1);
  };

  // 复制文本
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 忽略错误
    }
  };

  // 按语言分组语音
  const groupedVoices = voices.reduce((acc, v) => {
    const lang = v.lang.split("-")[0];
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(v);
    return acc;
  }, {} as Record<string, VoiceOption[]>);

  const charCount = text.length;

  if (!isSupported) {
    return (
      <ToolLayout
        title="文字转语音"
        description="将文字转换为语音朗读，支持多种音色和语速调节"
        toolId="text-to-speech"
        icon={Volume2}
        category="实用工具"
        slug="text-to-speech"
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
            <VolumeX className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              浏览器不支持语音合成
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              您的浏览器不支持 Web Speech API，请使用 Chrome、Edge 或 Safari 浏览器访问。
            </p>
          </div>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      title="文字转语音"
      description="将文字转换为语音朗读，支持多种音色和语速调节，使用浏览器原生语音合成技术，实时朗读文本内容"
      toolId="text-to-speech"
      icon={Volume2}
      category="实用工具"
      slug="text-to-speech"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 文本输入区 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                输入文字
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {charCount} 字
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 text-zinc-500 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
                title="复制文本"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="清空文本"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入要朗读的文字..."
              className="w-full h-64 p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* 播放控制 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                朗读控制
              </h2>
            </div>
          </div>

          <div className="p-6">
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  朗读进度
                </span>
                <span className="text-sm font-medium text-orange-500">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 ${
                    isPlaying ? "animate-pulse" : ""
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 播放按钮 */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleStop}
                disabled={!isPlaying && !isPaused}
                className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="停止"
              >
                <Square className="w-5 h-5" />
              </button>

              <button
                onClick={isPaused ? handleSpeak : isPlaying ? handlePause : handleSpeak}
                disabled={!text.trim()}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all active:scale-95"
                title={isPlaying ? "暂停" : isPaused ? "继续" : "播放"}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : isPaused ? (
                  <Play className="w-7 h-7 ml-0.5" />
                ) : (
                  <Play className="w-7 h-7 ml-0.5" />
                )}
              </button>

              <button
                onClick={handleReset}
                className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
                title="重置设置"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-4">
              {isPlaying
                ? "正在朗读中..."
                : isPaused
                ? "已暂停"
                : text.trim()
                ? "点击播放按钮开始朗读"
                : "请先输入文字"}
            </p>
          </div>
        </div>

        {/* 语音设置 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                语音设置
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 选择语音 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Mic className="w-4 h-4 text-orange-500" />
                选择音色
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all cursor-pointer"
              >
                {Object.entries(groupedVoices).map(([lang, langVoices]) => (
                  <optgroup key={lang} label={lang.toUpperCase()}>
                    {langVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {voices.length === 0 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                  正在加载语音列表...
                </p>
              )}
            </div>

            {/* 语速调节 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Gauge className="w-4 h-4 text-orange-500" />
                  语速
                </label>
                <span className="text-sm font-bold text-orange-500">
                  {rate.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span>0.5x 慢速</span>
                <span>1.0x 正常</span>
                <span>2.0x 快速</span>
              </div>
            </div>

            {/* 音调调节 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Music className="w-4 h-4 text-orange-500" />
                  音调
                </label>
                <span className="text-sm font-bold text-orange-500">
                  {pitch.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span>0.5 低音</span>
                <span>1.0 正常</span>
                <span>2.0 高音</span>
              </div>
            </div>

            {/* 音量调节 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Volume2 className="w-4 h-4 text-orange-500" />
                  音量
                </label>
                <span className="text-sm font-bold text-orange-500">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span>静音</span>
                <span>50%</span>
                <span>最大</span>
              </div>
            </div>
          </div>
        </div>

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  免费使用
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 ml-6">
                完全免费，无需注册，直接使用
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  多种音色
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 ml-6">
                支持系统内置的多种语音和语言
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  本地处理
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-6">
                使用浏览器原生API，保护文本隐私
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
