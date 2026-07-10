"use client";

import ToolLayout from "@/components/ToolLayout";
import { Scale } from "lucide-react";

export default function IdealWeightRangePage() {
  return (
    <ToolLayout
      title="标准体重范围"
      description="根据身高性别年龄计算标准体重范围和建议"
      icon={Scale}
      category="健康医疗"
      slug="ideal-weight-range"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            标准体重范围
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            根据身高性别年龄计算标准体重范围和建议
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
