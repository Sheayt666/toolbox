import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "单利计算器 - 在线单利利息计算 | 99在线工具",
  description:
    "免费在线单利计算器，快速计算存款利息，支持按年/月/日查看利息明细，简单直观。",
  keywords: [
    "单利计算器",
    "单利计算",
    "利息计算器",
    "存款利息",
    "理财计算",
  ],
  openGraph: {
    title: "单利计算器 - 在线单利利息计算 | 99在线工具",
    description:
      "免费在线单利计算器，快速计算存款利息，支持按年/月/日查看。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/simple-interest",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
