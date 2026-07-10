"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Binary, ArrowLeftRight } from "lucide-react";

export default function BinaryLearningPage() {
  const [mode, setMode] = useState<"dec2bin" | "bin2dec">("dec2bin");
  const [decInput, setDecInput] = useState(42);
  const [binInput, setBinInput] = useState("101010");
  const [bits, setBits] = useState(8);

  const dec2bin = useMemo(() => {
    const n = Math.max(0, Math.floor(decInput));
    const bin = n.toString(2).padStart(bits, "0");
    const bitArray = bin.split("").map((b, i) => ({ bit: b, value: b === "1" ? Math.pow(2, bits - 1 - i) : 0 }));
    return { bin, bitArray, hex: n.toString(16).toUpperCase(), oct: n.toString(8) };
  }, [decInput, bits]);

  const bin2dec = useMemo(() => {
    const clean = binInput.replace(/[^01]/g, "");
    const n = clean ? parseInt(clean, 2) : 0;
    return { dec: n, hex: n.toString(16).toUpperCase(), oct: n.toString(8), valid: /^[01]+$/.test(binInput) };
  }, [binInput]);

  return (
    <ToolLayout title="二进制学习" description="二进制十进制转换学习，理解计算机数值表示" toolId="binary-learning" icon={Binary} category="教育学习" slug="binary-learning">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">转换方向</label>
          <div className="flex gap-2">
            <button onClick={() => setMode("dec2bin")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all flex items-center justify-center gap-2 ${mode === "dec2bin" ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>十进制 → 二进制</button>
            <button onClick={() => setMode("bin2dec")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all flex items-center justify-center gap-2 ${mode === "bin2dec" ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>二进制 → 十进制</button>
          </div>
        </div>

        {mode === "dec2bin" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-300 mb-1.5">十进制数</label><input type="number" value={decInput} onChange={(e) => setDecInput(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-1.5">位数</label><select value={bits} onChange={(e) => setBits(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500"><option value={4}>4位</option><option value={8}>8位</option><option value={16}>16位</option></select></div>
            </div>

            <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-5">
              <div className="text-sm text-slate-400 mb-2">二进制表示</div>
              <div className="text-3xl font-bold text-primary-400 font-mono mb-3">{dec2bin.bin}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">十六进制: </span><span className="text-emerald-400 font-mono">{dec2bin.hex}</span></div>
                <div><span className="text-slate-400">八进制: </span><span className="text-sky-400 font-mono">{dec2bin.oct}</span></div>
              </div>
            </div>

            <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">位值分解</h3>
              <div className="flex gap-1 flex-wrap">
                {dec2bin.bitArray.map((b, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold ${b.bit === "1" ? "bg-primary-500/20 text-primary-400" : "bg-[#0d0d0f] text-slate-600"}`}>{b.bit}</div>
                    <div className="text-[10px] text-slate-500">{b.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-slate-400">
                {dec2bin.bitArray.filter(b => b.bit === "1").map(b => b.value).join(" + ")} = <span className="text-emerald-400 font-bold">{decInput}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">二进制数 (只含0和1)</label><input type="text" value={binInput} onChange={(e) => setBinInput(e.target.value)} className={`w-full bg-[#27272a] border text-white rounded-lg px-3 py-2.5 focus:outline-none ${bin2dec.valid ? "border-[#3f3f46] focus:border-primary-500" : "border-rose-500"}`} /></div>
            {!bin2dec.valid && <div className="text-xs text-rose-400">请输入有效的二进制数（只包含0和1）</div>}

            <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-5">
              <div className="text-sm text-slate-400 mb-2">十进制结果</div>
              <div className="text-3xl font-bold text-emerald-400 mb-3">{bin2dec.dec}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">十六进制: </span><span className="text-primary-400 font-mono">{bin2dec.hex}</span></div>
                <div><span className="text-slate-400">八进制: </span><span className="text-sky-400 font-mono">{bin2dec.oct}</span></div>
              </div>
            </div>
          </>
        )}

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">常用进制对照表</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-[#3f3f46]"><tr><th className="px-3 py-2 text-left">十进制</th><th className="px-3 py-2 text-left">二进制</th><th className="px-3 py-2 text-left">八进制</th><th className="px-3 py-2 text-left">十六进制</th></tr></thead>
              <tbody>
                {[0, 1, 2, 5, 10, 15, 16, 32, 64, 100, 255].map((n) => (
                  <tr key={n} className="border-b border-[#3f3f46]"><td className="px-3 py-2 text-slate-300">{n}</td><td className="px-3 py-2 text-primary-400 font-mono">{n.toString(2)}</td><td className="px-3 py-2 text-sky-400 font-mono">{n.toString(8)}</td><td className="px-3 py-2 text-emerald-400 font-mono">{n.toString(16).toUpperCase()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
