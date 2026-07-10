"use client";

import ToolLayout from "@/components/ToolLayout";
import { FileText } from "lucide-react";

export default function MarkdownPreviewPage() {
  return (
    <ToolLayout
      title="Markdown预览"
      description="实时预览Markdown渲染效果，支持导出HTML"
      icon={FileText}
      category="开发工具"
      slug="markdown-preview"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-600 to-slate-700 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Markdown预览
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            实时预览Markdown渲染效果，支持导出HTML
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
