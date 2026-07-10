"use client";

import ToolLayout from "@/components/ToolLayout";
import { CreditCard } from "lucide-react";

export default function IdCardParserPage() {
  return (
    <ToolLayout
      title="身份证信息解析"
      description="解析身份证号获取出生地、出生日期、性别、校验码验证"
      icon={CreditCard}
      category="查询工具"
      slug="id-card-parser"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            身份证信息解析
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            解析身份证号获取出生地、出生日期、性别、校验码验证
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
