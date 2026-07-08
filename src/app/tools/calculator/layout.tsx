import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "科学计算器 - 在线多功能计算 | 工具箱",
  description:
    "免费在线科学计算器，支持加减乘除、百分比、正负号切换，带计算历史记录，支持键盘快捷操作。",
  keywords: [
    "科学计算器",
    "在线计算器",
    "计算器在线使用",
    "科学计算",
  ],
  openGraph: {
    title: "科学计算器 - 在线多功能计算 | 工具箱",
    description:
      "免费在线科学计算器，支持加减乘除、百分比、正负号切换，带计算历史记录，支持键盘快捷操作。",
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
