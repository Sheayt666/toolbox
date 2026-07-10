import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "百分比变化计算器 - 增减幅度在线计算 | 99在线工具",
  description:
    "免费在线百分比变化计算器，计算两个数值之间的百分比增减变化，快速了解数据变动幅度。",
  keywords: [
    "百分比变化",
    "增长率计算",
    "降幅计算",
    "增减百分比",
    "变化率计算",
  ],
  openGraph: {
    title: "百分比变化计算器 - 增减幅度在线计算 | 99在线工具",
    description:
      "免费在线百分比变化计算器，计算数值增减变化幅度。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/percentage-change",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
