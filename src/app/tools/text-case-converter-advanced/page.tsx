"use client";

import ToolLayout from "@/components/ToolLayout";
import { ArrowUpDown } from "lucide-react";

export default function TextCaseConverterAdvancedPage() {
  return (
    <ToolLayout
      title="文本大小写转换"
      description="多种大小写格式转换，支持驼峰蛇形等命名规范"
      icon={ArrowUpDown}
      category="文本工具"
      slug="text-case-converter-advanced"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <ArrowUpDown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            文本大小写转换
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            多种大小写格式转换，支持驼峰蛇形等命名规范
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
