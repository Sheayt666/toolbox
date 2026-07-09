import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "卡路里计算器 - 每日热量需求计算 | 99在线工具",
  description:
    "免费在线卡路里计算器，根据身高体重年龄和活动水平，计算每日所需热量，科学制定减重增重计划。",
  keywords: [
    "卡路里计算器",
    "热量计算",
    "每日热量",
    "减重热量",
    "TDEE计算",
  ],
  openGraph: {
    title: "卡路里计算器 - 每日热量需求计算 | 99在线工具",
    description:
      "免费在线卡路里计算器，计算每日所需热量。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
