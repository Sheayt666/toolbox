"use client";

import ToolLayout from "@/components/ToolLayout";
import { Type } from "lucide-react";

export default function FontPairingPage() {
  return (
    <ToolLayout
      title="字体搭配推荐"
      description="中英文字体搭配组合推荐，提升设计质感"
      icon={Type}
      category="设计工具"
      slug="font-pairing"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Type className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            字体搭配推荐
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            中英文字体搭配组合推荐，提升设计质感
          </p>
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              工具功能正在开发中，敬请期待...
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
