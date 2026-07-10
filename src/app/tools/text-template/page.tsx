"use client";

import ToolLayout from "@/components/ToolLayout";
import { FileInput } from "lucide-react";

export default function TextTemplatePage() {
  return (
    <ToolLayout
      title="文本模板替换"
      description="批量替换文本模板变量，快速生成多份文档"
      icon={FileInput}
      category="文本工具"
      slug="text-template"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
            <FileInput className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            文本模板替换
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            批量替换文本模板变量，快速生成多份文档
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
