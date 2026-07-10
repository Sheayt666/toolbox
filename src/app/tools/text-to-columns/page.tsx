"use client";

import ToolLayout from "@/components/ToolLayout";
import { LayoutGrid } from "lucide-react";

export default function TextToColumnsPage() {
  return (
    <ToolLayout
      title="文本分列"
      description="按分隔符将文本分列，支持多种分隔方式"
      icon={LayoutGrid}
      category="文本工具"
      slug="text-to-columns"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            文本分列
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            按分隔符将文本分列，支持多种分隔方式
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
