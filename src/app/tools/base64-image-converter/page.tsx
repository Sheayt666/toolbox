"use client";

import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Image, Upload, Copy, Check, Download, Loader2 } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

export default function Base64ImageConverterPage() {
  const [base64, setBase64] = useState("");
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setLoading(true);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setBase64(result.split(",")[1] || result);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const onPasteBase64 = (val: string) => {
    setBase64(val);
    const full = val.startsWith("data:") ? val : `data:image/png;base64,${val}`;
    setPreview(full);
  };

  const downloadImage = () => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = fileName || "image.png";
    a.click();
  };

  const copy = () => {
    navigator.clipboard.writeText(base64);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const sizeKB = base64 ? Math.round((base64.length * 3) / 4 / 1024) : 0;

  return (
    <ToolLayout
      title="图片Base64转换"
      description="图片与Base64编码互转"
      icon={Image}
      category="开发工具"
      slug="base64-image-converter"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#27272a] rounded-xl p-8 text-center cursor-pointer hover:border-primary-500/50 transition-colors"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {loading ? (
            <Loader2 className="w-8 h-8 mx-auto text-primary-400 animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">点击或拖拽上传图片</p>
              <p className="text-xs text-slate-600 mt-1">支持 PNG / JPG / GIF / WebP</p>
            </>
          )}
        </div>

        {preview && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">图片预览</label>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 flex items-center justify-center">
              <img src={preview} alt="preview" className="max-h-48 rounded" />
            </div>
            {fileName && <p className="text-xs text-slate-500 mt-1.5">{fileName} · {sizeKB} KB</p>}
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">Base64 编码</label>
            <div className="flex gap-3">
              <button onClick={copy} disabled={!base64} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 disabled:opacity-30">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
              </button>
              <button onClick={downloadImage} disabled={!preview} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 disabled:opacity-30">
                <Download className="w-3.5 h-3.5" /> 下载图片
              </button>
            </div>
          </div>
          <textarea
            value={base64}
            onChange={(e) => onPasteBase64(e.target.value)}
            placeholder="粘贴 Base64 字符串可反向预览图片..."
            rows={6}
            className={inputClass + " resize-y font-mono text-xs break-all"}
          />
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
          <p className="text-xs text-slate-500 mb-1.5">CSS 引用</p>
          <code className="text-xs text-primary-300 font-mono break-all">background-image: url("{preview || "data:image/png;base64,..."}");</code>
        </div>
      </div>
    </ToolLayout>
  );
}
