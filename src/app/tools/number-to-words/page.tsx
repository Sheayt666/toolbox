"use client";

import ToolLayout from "@/components/ToolLayout";
import { Hash } from "lucide-react";

export default function NumberToWordsPage() {
  return (
    <ToolLayout
      title="数字转英文"
      description="将阿拉伯数字转换为英文单词表示"
      icon={Hash}
      category="转换工具"
      slug="number-to-words"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            数字转英文
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            将阿拉伯数字转换为英文单词表示
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
