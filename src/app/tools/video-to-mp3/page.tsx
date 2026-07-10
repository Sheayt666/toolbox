"use client";

import ToolLayout from "@/components/ToolLayout";
import { Music2 } from "lucide-react";

export default function VideoToMp3Page() {
  return (
    <ToolLayout
      title="视频转MP3"
      description="从视频中提取音频保存为MP3格式"
      icon={Music2}
      category="视频音频"
      slug="video-to-mp3"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Music2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            视频转MP3
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            从视频中提取音频保存为MP3格式
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
