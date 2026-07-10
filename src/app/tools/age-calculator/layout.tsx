import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "年龄计算器 - 在线计算年龄天数周数 | 99在线工具",
  description:
    "免费在线年龄计算器，输入出生日期即可计算精确年龄、总天数、周数、月数，以及距离下一个生日的天数。",
  keywords: ["年龄计算器", "年龄计算", "天数计算", "生日计算", "周岁计算"],
  openGraph: {
    title: "年龄计算器 - 在线计算年龄天数周数 | 99在线工具",
    description:
      "免费在线年龄计算器，输入出生日期即可计算精确年龄、总天数、周数、月数。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/age-calculator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
