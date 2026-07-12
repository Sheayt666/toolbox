"use client";

/**
 * ActivityIndicator
 *
 * A faux "live activity" panel that makes a tool page feel social and lively.
 * It shows three pieces of pseudo-realtime data:
 *   1. "今日已有 X 人使用此工具"  — stable per (toolId, calendar day), 50-500
 *   2. "全站当前在线 X 人"          — drifts with the current minute, 20-80
 *   3. "本周热门工具 Top 5"         — top tools + weekly usage counts
 *
 * All numbers are derived deterministically from hashes (no backend), and they
 * "refresh" every 30 seconds with a small wobble so the panel feels alive.
 * Number changes are tweened with requestAnimationFrame for a natural feel.
 *
 * Dark theme (#09090b base), rounded card design to match the rest of the site.
 */

import { useEffect, useRef, useState } from "react";
import { Users, Wifi, Flame, Activity } from "lucide-react";
import { getPopularTools } from "@/lib/tools";

export interface ActivityIndicatorProps {
  toolId?: string;
}

/** FNV-1a string hash -> uint32 (deterministic pseudo-random). */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** ISO week number (1-53). */
function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  return (
    1 +
    Math.round(
      ((date.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    )
  );
}

/**
 * Today's tool usage: a stable base (50-500) derived from (toolId, calendar
 * day), plus a gentle intra-day growth and a small refresh wobble so the
 * number drifts upward through the day.
 */
function computeTodayUsers(toolId: string | undefined, salt: number): number {
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  const base = hashString(`${toolId || "tool"}-${dateKey}`);
  const baseUsers = 50 + (base % 451); // 50-500
  const minutesOfDay = now.getHours() * 60 + now.getMinutes();
  const growth = Math.floor((minutesOfDay / (24 * 60)) * 80);
  const wobble = (hashString(`${dateKey}-${salt}`) % 20) - 10; // -10..10
  return Math.max(20, baseUsers + growth + wobble);
}

/** Site-wide online users: 20-80, drifts with the current minute + salt. */
function computeOnlineUsers(salt: number): number {
  const now = new Date();
  const seed = hashString(`online-${now.getHours()}-${now.getMinutes()}-${salt}`);
  return 20 + (seed % 61); // 20-80
}

/**
 * Weekly usage count for a tool: stable per (toolId, ISO week), with a small
 * refresh wobble driven by `salt` so the numbers tick slightly every cycle.
 */
function computeWeeklyUsage(id: string, salt: number): number {
  const now = new Date();
  const week = getISOWeek(now);
  const base = hashString(`${id}-w${week}-${now.getFullYear()}`);
  const baseVal = 1200 + (base % 8800); // 1200-9999
  const wobble = (hashString(`${id}-s${salt}`) % 120) - 60; // -60..60
  return Math.max(500, baseVal + wobble);
}

/** Smoothly tween a number from its previous value to the new one (easeOutCubic). */
function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = displayRef.current;
    const to = value;
    if (from === to) return;
    const duration = 650;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * ease(t));
      displayRef.current = val;
      setDisplay(val);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

/** Small skeleton placeholder used before the client mounts (avoids hydration mismatch). */
function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block rounded bg-[#27272a] animate-pulse ${className ?? ""}`}
    />
  );
}

export default function ActivityIndicator({ toolId }: ActivityIndicatorProps) {
  const [mounted, setMounted] = useState(false);
  const [todayUsers, setTodayUsers] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const saltRef = useRef(0);

  const popularTools = getPopularTools().slice(0, 5);

  useEffect(() => {
    setMounted(true);

    const compute = (salt: number) => {
      setTodayUsers(computeTodayUsers(toolId, salt));
      setOnlineUsers(computeOnlineUsers(salt));
      setRefreshKey(salt);
    };

    compute(0);

    const id = setInterval(() => {
      saltRef.current += 1;
      compute(saltRef.current);
    }, 30000);

    return () => clearInterval(id);
  }, [toolId]);

  return (
    <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">实时活动</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-medium text-slate-500 tracking-wide">
            LIVE
          </span>
        </div>
      </div>

      {/* Today's tool usage */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#09090b]/60 border border-[#27272a] mb-2.5">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Users className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-slate-400 mb-0.5">今日已有</div>
          <div className="text-sm text-white leading-tight">
            {mounted ? (
              <>
                <AnimatedNumber
                  value={todayUsers}
                  className="font-semibold text-emerald-400"
                />
                <span className="text-slate-400"> 人使用此工具</span>
              </>
            ) : (
              <Skeleton className="w-16 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Site-wide online */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#09090b]/60 border border-[#27272a] mb-3">
        <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
          <Wifi className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] text-slate-400 mb-0.5">全站当前在线</div>
          <div className="text-sm text-white leading-tight">
            {mounted ? (
              <>
                <AnimatedNumber
                  value={onlineUsers}
                  className="font-semibold text-sky-400"
                />
                <span className="text-slate-400"> 人</span>
              </>
            ) : (
              <Skeleton className="w-10 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Weekly top 5 */}
      <div className="flex items-center gap-2 mb-2.5">
        <Flame className="w-4 h-4 text-orange-400" />
        <h4 className="text-xs font-semibold text-white">本周热门工具 Top 5</h4>
      </div>
      <ol className="space-y-1.5">
        {popularTools.map((tool, index) => {
          const usage = computeWeeklyUsage(tool.id, refreshKey);
          const rankClass =
            index === 0
              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
              : index === 1
                ? "bg-gradient-to-br from-slate-300 to-slate-400 text-[#09090b]"
                : index === 2
                  ? "bg-gradient-to-br from-amber-600 to-amber-700 text-white"
                  : "bg-[#27272a] text-slate-400";
          return (
            <li
              key={tool.id}
              className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#27272a]/60 transition-colors"
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${rankClass}`}
              >
                {index + 1}
              </span>
              <span className="flex-1 min-w-0 text-xs text-slate-300 truncate">
                {tool.name}
              </span>
              <span className="text-[10px] text-slate-500 flex-shrink-0">
                {mounted ? (
                  <>
                    <AnimatedNumber
                      value={usage}
                      className="text-orange-400 font-medium"
                    />
                    <span className="text-slate-500"> 次</span>
                  </>
                ) : (
                  <Skeleton className="w-10 h-3" />
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#27272a] flex items-center justify-between">
        <span className="text-[10px] text-slate-600">每 30 秒刷新</span>
        <span className="text-[10px] text-slate-600">99gongju.online</span>
      </div>
    </div>
  );
}
