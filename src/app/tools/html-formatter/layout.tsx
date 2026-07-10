import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML格式化/压缩工具 - 在线美化压缩HTML代码 | 99在线工具",
  description:
    "免费在线HTML格式化工具，支持HTML美化、压缩、自定义缩进，快速格式化HTML代码，数据本地处理安全可靠。",
  keywords: [
    "HTML格式化",
    "HTML美化",
    "HTML压缩",
    "HTML格式化工具",
    "在线HTML工具",
  ],
  openGraph: {
    title: "HTML格式化/压缩工具 - 在线美化压缩HTML代码 | 99在线工具",
    description:
      "免费在线HTML格式化工具，支持HTML美化、压缩、自定义缩进，快速格式化HTML代码，数据本地处理安全可靠。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/html-formatter",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
