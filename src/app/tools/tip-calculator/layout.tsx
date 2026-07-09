import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小费计算器 - 人均分摊在线计算 | 工具箱",
  description:
    "免费在线小费计算器，快速计算小费金额和人均分摊，支持自定义比例，聚餐买单好帮手。",
  keywords: [
    "小费计算器",
    "小费计算",
    "人均分摊",
    "AA制计算",
    "聚餐买单",
  ],
  openGraph: {
    title: "小费计算器 - 人均分摊在线计算 | 工具箱",
    description:
      "免费在线小费计算器，快速计算小费和人均分摊。",
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
