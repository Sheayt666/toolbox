import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "税前税后工资计算器 - 2026个税计算 | 工具箱",
  description:
    "2026年最新个税计算器，支持五险一金和专项附加扣除，快速计算税后工资和个税金额。",
  keywords: [
    "工资计算器",
    "个税计算器",
    "税前税后",
    "个人所得税",
    "五险一金计算",
  ],
  openGraph: {
    title: "税前税后工资计算器 - 2026个税计算 | 工具箱",
    description:
      "2026年最新个税计算器，支持五险一金和专项附加扣除。",
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
