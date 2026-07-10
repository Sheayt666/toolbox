import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "日期计算器 - 日期加减/日期差在线计算 | 99在线工具",
  description:
    "免费在线日期计算器，支持日期加减计算、两个日期之间的差值计算，精确到天、周、月、年。",
  keywords: ["日期计算器", "日期计算", "日期差", "日期加减", "在线日期计算"],
  openGraph: {
    title: "日期计算器 - 日期加减/日期差在线计算 | 99在线工具",
    description:
      "免费在线日期计算器，支持日期加减计算、两个日期之间的差值计算。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/date-calculator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
