"use client";

import ToolLayout from "@/components/ToolLayout";
import { MailPlus } from "lucide-react";

export default function InvitationCardPage() {
  return (
    <ToolLayout
      title="电子请柬生成"
      description="在线生成婚礼生日派对电子请柬贺卡"
      icon={MailPlus}
      category="生成工具"
      slug="invitation-card"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <MailPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            电子请柬生成
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            在线生成婚礼生日派对电子请柬贺卡
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
