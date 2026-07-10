import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "贷款计算器 - 等额本息月供计算 | 99在线工具",
  description:
    "免费在线贷款计算器，等额本息还款方式，快速计算月供、总利息和还款总额，支持查看还款明细。",
  keywords: [
    "贷款计算器",
    "月供计算",
    "等额本息",
    "贷款利息计算",
    "车贷计算器",
  ],
  openGraph: {
    title: "贷款计算器 - 等额本息月供计算 | 99在线工具",
    description:
      "免费在线贷款计算器，等额本息还款方式，快速计算月供和总利息。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/loan-calculator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
