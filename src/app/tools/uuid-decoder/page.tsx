"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Fingerprint, Copy, Check, RefreshCw, Info } from "lucide-react";

export default function UuidDecoderPage() {
  const [uuid, setUuid] = useState("");
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const decodeUUID = (id: string) => {
    setError("");
    setInfo(null);

    if (!id.trim()) return;

    const clean = id.trim().toLowerCase();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const uuidNoDashRegex = /^[0-9a-f]{32}$/;

    let formatted = "";
    if (uuidRegex.test(clean)) {
      formatted = clean;
    } else if (uuidNoDashRegex.test(clean)) {
      formatted = `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
    } else {
      setError("无效的UUID格式");
      return;
    }

    const parts = formatted.split("-");
    const version = parseInt(parts[2][0], 16);
    const variantHex = parseInt(parts[3][0], 16);
    let variant = "";
    if ((variantHex & 0x8) === 0) variant = "NCS (Reserved)";
    else if ((variantHex & 0xC) === 0x8) variant = "RFC 4122";
    else if ((variantHex & 0xE) === 0xC) variant = "Microsoft";
    else variant = "Future (Reserved)";

    const versionNames: Record<number, string> = {
      1: "时间+MAC地址",
      2: "DCE Security",
      3: "MD5哈希",
      4: "随机数",
      5: "SHA-1哈希",
      7: "时间+随机 (UUIDv7)",
    };

    let timestamp = null;
    let date = null;
    if (version === 1) {
      const timeLow = parts[0];
      const timeMid = parts[1];
      const timeHigh = parts[2].slice(1);
      const timestampHex = timeHigh + timeMid + timeLow;
      const ts = parseInt(timestampHex, 16);
      // UUID时间戳是从1582-10-15开始的100纳秒单位
      const uuidEpoch = Date.UTC(1582, 9, 15, 0, 0, 0);
      timestamp = Math.floor(ts / 10000) + uuidEpoch;
      date = new Date(timestamp).toLocaleString("zh-CN");
    }

    if (version === 7) {
      const timestampHex = parts[0] + parts[1].slice(0, 4);
      const ts = parseInt(timestampHex, 16);
      timestamp = ts;
      date = new Date(ts).toLocaleString("zh-CN");
    }

    setInfo({
      formatted,
      version,
      versionName: versionNames[version] || "未知",
      variant,
      parts: {
        time_low: parts[0],
        time_mid: parts[1],
        time_hi_and_version: parts[2],
        clock_seq_hi_and_reserved: parts[3].slice(0, 2),
        clock_seq_low: parts[3].slice(2),
        node: parts[4],
      },
      timestamp,
      date,
      noDash: formatted.replace(/-/g, ""),
      upper: formatted.toUpperCase(),
      lower: formatted.toLowerCase(),
    });
  };

  const generateUUID = () => {
    // UUID v4
    const hex = "0123456789abcdef";
    let result = "";
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        result += "-";
      } else if (i === 14) {
        result += "4";
      } else if (i === 19) {
        result += hex[Math.floor(Math.random() * 4) + 8];
      } else {
        result += hex[Math.floor(Math.random() * 16)];
      }
    }
    setUuid(result);
    decodeUUID(result);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <ToolLayout
      title="UUID解码器"
      description="UUID在线解析工具，支持解析版本、变体、时间戳，UUID v1/v4/v7生成"
      toolId="uuid-decoder"
      icon={Fingerprint}
      category="开发工具"
      slug="uuid-decoder"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 输入区 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-fuchsia-400" />
              <h2 className="text-base font-semibold">UUID输入</h2>
            </div>
            <button
              onClick={generateUUID}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs bg-fuchsia-500/20 text-fuchsia-400 rounded-lg hover:bg-fuchsia-500/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              生成UUID v4
            </button>
          </div>
          <input
            type="text"
            value={uuid}
            onChange={(e) => {
              setUuid(e.target.value);
              decodeUUID(e.target.value);
            }}
            placeholder="输入UUID（带或不带横线均可）..."
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm focus:outline-none focus:border-fuchsia-500 transition-colors"
          />
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        {/* 解析结果 */}
        {info && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-base font-semibold">基本信息</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-fuchsia-500/10 rounded-xl">
                  <div className="text-xs text-fuchsia-400/70 mb-1">版本</div>
                  <div className="text-2xl font-bold text-fuchsia-300">v{info.version}</div>
                  <div className="text-xs text-fuchsia-400/70 mt-1">{info.versionName}</div>
                </div>
                <div className="p-4 bg-cyan-500/10 rounded-xl">
                  <div className="text-xs text-cyan-400/70 mb-1">变体</div>
                  <div className="text-lg font-bold text-cyan-300">{info.variant}</div>
                </div>
                {info.date && (
                  <div className="p-4 bg-emerald-500/10 rounded-xl sm:col-span-2">
                    <div className="text-xs text-emerald-400/70 mb-1">生成时间</div>
                    <div className="text-lg font-mono text-emerald-300">{info.date}</div>
                  </div>
                )}
              </div>
            </div>

            {/* 各段解析 */}
            <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-base font-semibold">分段解析</h3>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(info.parts).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                    <span className="text-sm text-zinc-400">{key}</span>
                    <code className="text-sm font-mono text-zinc-300">{value as string}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* 格式转换 */}
            <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="text-base font-semibold">格式转换</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg group">
                  <code className="text-sm font-mono text-zinc-300">{info.formatted}</code>
                  <button
                    onClick={() => handleCopy(info.formatted, "lower")}
                    className="text-xs text-zinc-500 hover:text-fuchsia-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copied === "lower" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg group">
                  <code className="text-sm font-mono text-zinc-300">{info.upper}</code>
                  <button
                    onClick={() => handleCopy(info.upper, "upper")}
                    className="text-xs text-zinc-500 hover:text-fuchsia-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copied === "upper" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg group">
                  <code className="text-sm font-mono text-zinc-300">{info.noDash}</code>
                  <button
                    onClick={() => handleCopy(info.noDash, "nodash")}
                    className="text-xs text-zinc-500 hover:text-fuchsia-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {copied === "nodash" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-fuchsia-400" />
            <h3 className="text-base font-semibold">UUID版本说明</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <div className="font-medium text-fuchsia-300">UUID v1</div>
              <p className="text-xs text-zinc-500 mt-1">基于时间和MAC地址生成</p>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <div className="font-medium text-fuchsia-300">UUID v4</div>
              <p className="text-xs text-zinc-500 mt-1">完全随机生成，最常用</p>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <div className="font-medium text-fuchsia-300">UUID v3</div>
              <p className="text-xs text-zinc-500 mt-1">基于MD5哈希生成</p>
            </div>
            <div className="p-3 bg-zinc-900/50 rounded-lg">
              <div className="font-medium text-fuchsia-300">UUID v5</div>
              <p className="text-xs text-zinc-500 mt-1">基于SHA-1哈希生成</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
