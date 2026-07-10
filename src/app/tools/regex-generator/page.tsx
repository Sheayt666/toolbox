"use client";

import ToolLayout from "@/components/ToolLayout";
import { Code } from "lucide-react";

export default function RegexGeneratorPage() {
  return (
    <ToolLayout
      title="正则表达式生成"
      description="通过自然语言描述生成正则表达式，辅助开发"
      icon={Code}
      category="开发工具"
      slug="regex-generator"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            正则表达式生成
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            通过自然语言描述生成正则表达式，辅助开发
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
