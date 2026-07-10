"use client";

import ToolLayout from "@/components/ToolLayout";
import { Glasses } from "lucide-react";

export default function EyeCareTimerPage() {
  return (
    <ToolLayout
      title="护眼提醒"
      description="20-20-20护眼法则提醒，保护视力健康"
      icon={Glasses}
      category="健康医疗"
      slug="eye-care-timer"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center">
            <Glasses className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            护眼提醒
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            20-20-20护眼法则提醒，保护视力健康
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
