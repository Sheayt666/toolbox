"use client";

import ToolLayout from "@/components/ToolLayout";
import { Backpack } from "lucide-react";

export default function TravelPackingListPage() {
  return (
    <ToolLayout
      title="旅行打包清单"
      description="旅行出行必备物品清单，分类管理不漏带"
      icon={Backpack}
      category="生活工具"
      slug="travel-packing-list"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Backpack className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            旅行打包清单
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            旅行出行必备物品清单，分类管理不漏带
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
