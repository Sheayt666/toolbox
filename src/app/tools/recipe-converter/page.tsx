"use client";

import ToolLayout from "@/components/ToolLayout";
import { ChefHat } from "lucide-react";

export default function RecipeConverterPage() {
  return (
    <ToolLayout
      title="食谱分量换算"
      description="根据用餐人数自动换算食谱中各食材的用量"
      icon={ChefHat}
      category="生活工具"
      slug="recipe-converter"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            食谱分量换算
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            根据用餐人数自动换算食谱中各食材的用量
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
