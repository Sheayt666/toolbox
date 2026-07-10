"use client";

import ToolLayout from "@/components/ToolLayout";
import { Megaphone } from "lucide-react";

export default function BusinessSloganGeneratorPage() {
  return (
    <ToolLayout
      title="宣传标语生成"
      description="输入关键词生成创意宣传标语和口号"
      icon={Megaphone}
      category="生成工具"
      slug="business-slogan-generator"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            宣传标语生成
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            输入关键词生成创意宣传标语和口号
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
