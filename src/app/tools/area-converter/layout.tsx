import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "面积单位换算器 - 平方米/公顷/亩/平方英尺",
  description: "快速在线面积单位换算工具，支持平方米、平方千米、公顷、亩、平方英尺、英亩等多种面积单位",
  keywords: ["面积换算", "平方米转亩", "公顷换算", "单位换算"],
  alternates: {
    canonical: "/tools/area-converter",
  },
};

export default function AreaConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
