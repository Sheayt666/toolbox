"use client";

import React, { type ReactNode, useCallback, useEffect, useRef, useState } from "react";

export interface GameStat {
  label: string;
  value: string | number;
  icon?: string;
}

interface GameShellProps {
  gameId: string;
  title: string;
  iconEmoji: string;
  iconGradient: string;
  stats: GameStat[];
  shareScore: number;
  refreshKey: number;
  children: ReactNode;
  /** Optional description text (passed by legacy games) */
  description?: string;
  /** Optional instructions text (passed by legacy games) */
  instructions?: string;
  /** Optional Lucide icon component (passed by legacy games) */
  icon?: React.ComponentType<{ className?: string }>;
}

const STORAGE_PREFIX = "toolbox-best-";

export default function GameShell({
  gameId,
  title,
  iconEmoji,
  iconGradient,
  stats,
  shareScore,
  refreshKey,
  children,
  description,
  instructions,
  icon: Icon,
}: GameShellProps) {
  const [best, setBest] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + gameId);
      if (raw) setBest(Number(raw) || 0);
    } catch {
      /* ignore */
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [gameId]);

  // Update best score
  useEffect(() => {
    if (!mounted) return;
    if (shareScore > best) {
      setBest(shareScore);
      try {
        localStorage.setItem(STORAGE_PREFIX + gameId, String(shareScore));
      } catch {
        /* ignore */
      }
    }
  }, [shareScore, best, gameId, mounted, refreshKey]);

  const handleShare = useCallback(() => {
    const text = `我在「${title}」中获得了 ${shareScore} 分！快来挑战吧！`;
    if (navigator.share) {
      navigator.share({ title, text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setShareMsg("已复制到剪贴板！");
        const t = setTimeout(() => setShareMsg(""), 2000);
        timersRef.current.push(t);
      }).catch(() => {});
    }
  }, [title, shareScore]);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${iconGradient} text-3xl shadow-lg`}
          >
            {iconEmoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-sm text-gray-400">最高分: {best}</p>
            {description && (
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleShare}
          aria-label="分享分数"
          className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-95"
        >
          <span>分享</span>
        </button>
      </div>

      {/* Stats bar */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-xl bg-gray-800/60 px-3 py-2"
          >
            {s.icon && <span className="text-lg">{s.icon}</span>}
            <div className="min-w-0">
              <div className="truncate text-xs text-gray-400">{s.label}</div>
              <div className="truncate text-sm font-bold text-white">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Game content */}
      <div className="overflow-hidden rounded-2xl bg-gray-900/80 shadow-2xl">
        {children}
      </div>

      {/* Optional instructions */}
      {instructions && (
        <div className="mt-4 rounded-xl bg-gray-800/40 px-4 py-3">
          <p className="text-xs text-gray-400">{instructions}</p>
        </div>
      )}

      {shareMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white shadow-lg">
          {shareMsg}
        </div>
      )}
    </div>
  );
}
