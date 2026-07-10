"use client";

import ToolLayout from "@/components/ToolLayout";
import { BookOpen } from "lucide-react";

export default function ChineseIdiomDictPage() {
  return (
    <ToolLayout
      title="成语词典"
      description="查询成语的释义、出处、近义词和反义词"
      icon={BookOpen}
      category="查询工具"
      slug="chinese-idiom-dict"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-600 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            成语词典
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            查询成语的释义、出处、近义词和反义词
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
