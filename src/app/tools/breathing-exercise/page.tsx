"use client";

import ToolLayout from "@/components/ToolLayout";
import { Wind } from "lucide-react";

export default function BreathingExercisePage() {
  return (
    <ToolLayout
      title="呼吸练习"
      description="多种呼吸法引导练习，帮助放松和缓解焦虑"
      icon={Wind}
      category="健康医疗"
      slug="breathing-exercise"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center">
            <Wind className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            呼吸练习
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            多种呼吸法引导练习，帮助放松和缓解焦虑
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
