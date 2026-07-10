"use client";

import ToolLayout from "@/components/ToolLayout";
import { FlipHorizontal } from "lucide-react";

export default function ImageMirrorPage() {
  return (
    <ToolLayout
      title="图片镜像翻转"
      description="水平或垂直镜像翻转图片，一键生成镜像效果"
      icon={FlipHorizontal}
      category="图片工具"
      slug="image-mirror"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
            <FlipHorizontal className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            图片镜像翻转
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            水平或垂直镜像翻转图片，一键生成镜像效果
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
