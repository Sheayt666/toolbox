"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import ToolLayout from "@/components/ToolLayout";
import { QrCode, Download, Plus, Trash2, RefreshCw } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface QrItem { id: number; text: string; dataUrl: string; }

export default function QrCodeBulkPage() {
  const [items, setItems] = useState<QrItem[]>([
    { id: 1, text: "https://example.com", dataUrl: "" },
    { id: 2, text: "Hello World", dataUrl: "" },
  ]);
  const [size, setSize] = useState(200);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [bulkInput, setBulkInput] = useState("");
  const nextId = useRef(3);

  const generateOne = async (text: string): Promise<string> => {
    if (!text) return "";
    try {
      return await QRCode.toDataURL(text, { width: size, margin: 2, color: { dark: fg, light: bg } });
    } catch {
      return "";
    }
  };

  useEffect(() => {
    (async () => {
      const updated = await Promise.all(
        items.map(async (it) => ({ ...it, dataUrl: await generateOne(it.text) }))
      );
      setItems(updated);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, fg, bg]);

  const updateText = async (id: number, text: string) => {
    const dataUrl = await generateOne(text);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, text, dataUrl } : it)));
  };

  const addItem = () => {
    setItems([...items, { id: nextId.current++, text: "", dataUrl: "" }]);
  };

  const removeItem = (id: number) => setItems(items.filter((it) => it.id !== id));

  const bulkAdd = async () => {
    const lines = bulkInput.split("\n").map((l) => l.trim()).filter(Boolean);
    const newItems = await Promise.all(
      lines.map(async (text) => ({ id: nextId.current++, text, dataUrl: await generateOne(text) }))
    );
    setItems([...items, ...newItems]);
    setBulkInput("");
  };

  const downloadAll = () => {
    items.forEach((it, i) => {
      if (it.dataUrl) {
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = it.dataUrl;
          a.download = `qr-${i + 1}-${it.text.slice(0, 10) || "code"}.png`;
          a.click();
        }, i * 300);
      }
    });
  };

  return (
    <ToolLayout
      title="批量二维码生成"
      description="批量生成二维码"
      icon={QrCode}
      category="生成工具"
      slug="qr-code-bulk"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">尺寸 {size}px</label>
            <input type="range" min={80} max={400} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-primary-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">前景色</label>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-full h-9 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">背景色</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-9 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">批量输入（每行一个）</label>
          <div className="flex gap-2">
            <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder="每行输入一个内容，如网址、文本..." rows={3} className={inputClass + " resize-y"} />
            <button onClick={bulkAdd} className="inline-flex items-center gap-1 px-4 bg-primary-500 hover:bg-primary-600 text-white text-sm rounded-lg whitespace-nowrap self-start mt-1">
              <Plus className="w-4 h-4" /> 批量添加
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">二维码列表（{items.length}）</label>
            <div className="flex gap-3">
              <button onClick={addItem} className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> 添加
              </button>
              <button onClick={downloadAll} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> 全部下载
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((it) => (
              <div key={it.id} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={it.text}
                    onChange={(e) => updateText(it.id, e.target.value)}
                    placeholder="输入内容..."
                    className="flex-1 bg-[#16161a] border border-[#1f1f23] rounded px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-primary-500/50"
                  />
                  <button onClick={() => removeItem(it.id)} className="text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center justify-center bg-white rounded p-2 min-h-[120px]">
                  {it.dataUrl ? (
                    <img src={it.dataUrl} alt="qr" className="max-w-full" style={{ width: Math.min(size, 200) }} />
                  ) : (
                    <span className="text-xs text-slate-400">输入内容生成</span>
                  )}
                </div>
                {it.dataUrl && (
                  <a href={it.dataUrl} download={`qr-${it.text.slice(0, 10) || "code"}.png`} className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
                    <Download className="w-3 h-3" /> 下载
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
