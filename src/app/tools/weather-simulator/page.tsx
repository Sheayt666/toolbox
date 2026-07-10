"use client";

import ToolLayout from "@/components/ToolLayout";
import { CloudSun } from "lucide-react";

export default function WeatherSimulatorPage() {
  return (
    <ToolLayout
      title="天气查询模拟"
      description="模拟天气查询界面，展示各城市天气数据演示"
      icon={CloudSun}
      category="查询工具"
      slug="weather-simulator"
    >
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
            <CloudSun className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            天气查询模拟
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            模拟天气查询界面，展示各城市天气数据演示
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
