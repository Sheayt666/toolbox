"use client";

import ToolLayout from "@/components/ToolLayout";
import { Hash } from "lucide-react";

export default function PdfPageNumberPage() {
  return (
    <ToolLayout
      title="PDF添加页码"
      description="为PDF文件添加页码，支持自定义位置样式"
      icon={Hash}
      category="PDF工具"
      slug="pdf-page-number"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-600 flex items-center justify-center">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            PDF添加页码
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            为PDF文件添加页码，支持自定义位置样式
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
