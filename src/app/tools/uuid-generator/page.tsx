"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, RefreshCw, Hash, Clock, Fingerprint } from "lucide-react";

type UuidVersion = "v4" | "v1";

interface UuidItem {
  id: string;
  value: string;
  version: UuidVersion;
  timestamp?: string;
}

// UUID v4 生成 - 使用 crypto.randomUUID()
function generateUUIDv4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 回退实现
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// UUID v1 生成 - 基于时间戳的 UUID
function generateUUIDv1(): string {
  const timestamp = Date.now();
  const timeLow = timestamp & 0xffffffff;
  const timeMid = (timestamp >>> 32) & 0xffff;
  const timeHiAndVersion = ((timestamp / 0x100000000) & 0xfff) | 0x1000;

  // 生成随机的clock sequence 和 node
  const clockSeq = Math.floor(Math.random() * 0x3fff);
  const clockSeqHiAndReserved = (clockSeq >> 8) | 0x80;
  const clockSeqLow = clockSeq & 0xff;

  // 生成 6 字节的node（模拟MAC 地址）
  const nodeBytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(nodeBytes);
  } else {
    for (let i = 0; i < 6; i++) {
      nodeBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  // 设置组播位为 1（因为是随机生成的）
  nodeBytes[0] |= 0x01;

  const node = Array.from(nodeBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return [
    timeLow.toString(16).padStart(8, "0"),
    timeMid.toString(16).padStart(4, "0"),
    timeHiAndVersion.toString(16).padStart(4, "0"),
    (clockSeqHiAndReserved.toString(16).padStart(2, "0") +
      clockSeqLow.toString(16).padStart(2, "0")),
    node,
  ].join("-");
}

function generateUUID(version: UuidVersion): { value: string; timestamp?: string } {
  if (version === "v4") {
    return { value: generateUUIDv4() };
  } else {
    const value = generateUUIDv1();
    const timestamp = new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return { value, timestamp };
  }
}

export default function UuidGeneratorPage() {
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<UuidItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const generateUuids = useCallback(() => {
    const newUuids: UuidItem[] = [];
    for (let i = 0; i < count; i++) {
      const result = generateUUID(version);
      newUuids.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
        value: result.value,
        version,
        timestamp: result.timestamp,
      });
    }
    setUuids(newUuids);
  }, [version, count]);

  const copySingle = useCallback((id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const copyAll = useCallback(() => {
    const text = uuids.map((u) => u.value).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }, [uuids]);

  const countOptions = [1, 5, 10, 20, 50, 100];

  return (
    <ToolLayout
      title="UUID 生成器"
      description="一键生成UUID v1/v4，支持批量生成，快速复制使用"
      icon={Fingerprint}
      category="开发工具"
      slug="uuid-generator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 控制面板 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 版本选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                UUID 版本
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVersion("v4")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    version === "v4"
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-sm">UUID v4</div>
                    <div className="text-xs opacity-70">随机生成</div>
                  </div>
                </button>
                <button
                  onClick={() => setVersion("v1")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    version === "v1"
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-sm">UUID v1</div>
                    <div className="text-xs opacity-70">基于时间</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 数量选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                生成数量
                <span className="ml-2 text-indigo-500 font-semibold">{count}</span>
              </label>
              <div className="grid grid-cols-6 gap-2">
                {countOptions.map((num) => (
                  <button
                    key={num}
                    onClick={() => setCount(num)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      count === num
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 生成按钮 */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={generateUuids}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
            >
              <RefreshCw className="w-5 h-5" />
              生成 UUID
            </button>
            {uuids.length > 0 && (
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    已复制全部
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制全部
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 结果展示 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-medium text-slate-900 dark:text-slate-100">
                生成结果
              </h2>
              {uuids.length > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {uuids.length} 位
                </span>
              )}
            </div>
          </div>

          {uuids.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Fingerprint className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                点击上方按钮生成 UUID
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                支持 UUID v1（基于时间）和v4（随机）版本
              </p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-auto space-y-2">
              {uuids.map((uuid, index) => (
                <div
                  key={uuid.id}
                  className="group flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-colors"
                >
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs font-mono text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <code className="block text-sm font-mono text-slate-800 dark:text-slate-200 truncate">
                      {uuid.value}
                    </code>
                    {uuid.timestamp && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        生成时间: {uuid.timestamp}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => copySingle(uuid.id, uuid.value)}
                    className="flex-shrink-0 p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="复制"
                  >
                    {copiedId === uuid.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 版本说明 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
            UUID 版本说明
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  UUID v4
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                基于随机数生成的 UUID，完全随机，无规律可循，
                最常用的版本，适用于大多数场景，隐私性更好，
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  UUID v1
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                基于时间戳和 MAC 地址生成的UUID，包含时间信息，
                可根据UUID 反推出生成时间，适合需要时间追溯的场景。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
