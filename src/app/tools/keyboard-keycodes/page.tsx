"use client";

import { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Keyboard } from "lucide-react";

export default function KeyboardKeycodesPage() {
  const [keyInfo, setKeyInfo] = useState<any>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    setKeyInfo({
      key: e.key,
      code: e.code,
      keyCode: e.keyCode,
      which: e.which,
      location: e.location,
      ctrl: e.ctrlKey,
      shift: e.shiftKey,
      alt: e.altKey,
      meta: e.metaKey,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <ToolLayout title="键盘键码查询" description="按下任意按键查看其keyCode、key、code等键值信息" icon={Keyboard} category="查询工具" slug="keyboard-keycodes">
      <div className="p-6">
        <div className="mb-6 p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center">
          <Keyboard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">在页面上按下任意键盘按键，即可查看完整的键码信息</p>
        </div>

        {keyInfo ? (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl text-center">
              <div className="text-xs text-slate-500 mb-2">您按下的键</div>
              <div className="text-5xl font-bold text-primary-400 mb-2">{keyInfo.key === " " ? "Space" : keyInfo.key}</div>
              <div className="text-sm text-slate-400 font-mono">{keyInfo.code}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "key", value: keyInfo.key },
                { label: "code", value: keyInfo.code },
                { label: "keyCode", value: String(keyInfo.keyCode) },
                { label: "which", value: String(keyInfo.which) },
                { label: "location", value: String(keyInfo.location) },
                { label: "修饰键", value: [
                  keyInfo.ctrl && "Ctrl", keyInfo.shift && "Shift", keyInfo.alt && "Alt", keyInfo.meta && "Meta",
                ].filter(Boolean).join(" + ") || "无" },
              ].map((item) => (
                <div key={item.label} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  <div className="text-white font-mono font-medium break-all">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl text-center text-slate-500 text-sm">
            等待按键输入...
          </div>
        )}

        <div className="mt-6 p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
          <h4 className="text-sm font-medium text-slate-400 mb-2">常用键码参考</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {[
              { k: "Enter", c: "13" }, { k: "Space", c: "32" }, { k: "Backspace", c: "8" },
              { k: "Tab", c: "9" }, { k: "Shift", c: "16" }, { k: "Ctrl", c: "17" },
              { k: "Alt", c: "18" }, { k: "Esc", c: "27" }, { k: "Delete", c: "46" },
              { k: "ArrowUp", c: "38" }, { k: "ArrowDown", c: "40" }, { k: "ArrowLeft", c: "37" },
            ].map((item) => (
              <div key={item.k} className="flex justify-between px-3 py-2 bg-[#18181b] rounded-lg">
                <span className="text-slate-300">{item.k}</span>
                <span className="text-primary-400 font-mono">{item.c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
