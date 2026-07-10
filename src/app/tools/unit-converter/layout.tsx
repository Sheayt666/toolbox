import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "单位换算器 - 长度重量面积体积温度换算 | 99在线工具",
  description:
    "免费在线单位换算器，支持长度、重量、面积、体积、温度等多种单位的快速换算，精确便捷。",
  keywords: ["单位换算", "长度换算", "重量换算", "面积换算", "温度换算"],
  openGraph: {
    title: "单位换算器 - 长度重量面积体积温度换算 | 99在线工具",
    description:
      "免费在线单位换算器，支持长度、重量、面积、体积、温度等多种单位的快速换算。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/unit-converter",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
