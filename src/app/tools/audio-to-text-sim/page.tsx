"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Mic, Square, Copy, Check, Trash2, Languages } from "lucide-react";

interface Transcript { text: string; isFinal: boolean; }

/* eslint-disable @typescript-eslint/no-explicit-any */
const getRecognitionCtor = (): any | null => {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
};
const RecognitionCtor = getRecognitionCtor();

export default function AudioToTextSimPage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<Transcript[]>([]);
  const [interim, setInterim] = useState("");
  const [lang, setLang] = useState("zh-CN");
  const [copied, setCopied] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  useEffect(() => {
    setSupported(!!RecognitionCtor);
  }, []);

  const start = () => {
    if (!RecognitionCtor) return;
    const recognition = new RecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript((prev) => [...prev, { text: result[0].transcript, isFinal: true }]);
          setInterim("");
        } else {
          interimText += result[0].transcript;
        }
      }
      if (interimText) setInterim(interimText);
    };

    recognition.onerror = (e: any) => {
      if (e.error !== "no-speech") setInterim(`错误：${e.error}`);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const clear = () => {
    setTranscript([]);
    setInterim("");
  };

  const fullText = transcript.map((t) => t.text).join("") + interim;
  const copy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="语音转文字模拟"
      description="模拟语音转文字界面"
      icon={Mic}
      category="视频音频"
      slug="audio-to-text-sim"
    >
      <div className="p-5 sm:p-6 space-y-5">
        {!supported && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-300">
            当前浏览器不支持 Web Speech API 语音识别。建议使用 Chrome / Edge 浏览器体验完整功能。
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-slate-400" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white" disabled={listening}>
              <option value="zh-CN">中文（简体）</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="ja-JP">日本語</option>
              <option value="ko-KR">한국어</option>
            </select>
          </div>
          {!listening ? (
            <button onClick={start} disabled={!supported} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              <Mic className="w-4 h-4" /> 开始识别
            </button>
          ) : (
            <button onClick={stop} className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg">
              <Square className="w-4 h-4" /> 停止
            </button>
          )}
          {listening && (
            <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> 正在聆听...
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">识别结果</label>
            <div className="flex gap-3">
              <button onClick={copy} disabled={!fullText} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 disabled:opacity-30">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
              </button>
              <button onClick={clear} disabled={!transcript.length} className="text-xs text-slate-400 hover:text-red-400 inline-flex items-center gap-1 disabled:opacity-30">
                <Trash2 className="w-3.5 h-3.5" /> 清空
              </button>
            </div>
          </div>
          <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 min-h-[200px] max-h-96 overflow-y-auto">
            {transcript.length === 0 && !interim ? (
              <p className="text-sm text-slate-600 text-center py-8">
                {supported ? "点击「开始识别」并对着麦克风说话，语音将被实时转为文字" : "请使用支持的浏览器"}
              </p>
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed">
                {transcript.map((t, i) => (
                  <span key={i} className={t.isFinal ? "text-white" : "text-slate-400"}>{t.text}</span>
                ))}
                {interim && <span className="text-primary-400/70 italic">{interim}</span>}
              </p>
            )}
          </div>
          {fullText && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">字数</p>
                <p className="text-sm text-white font-mono">{fullText.length}</p>
              </div>
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">句段</p>
                <p className="text-sm text-white font-mono">{transcript.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
