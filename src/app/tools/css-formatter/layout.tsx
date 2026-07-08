import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSS格式化/压缩工具 - 在线美化压缩CSS代码 | 工具箱",
  description:
    "免费在线CSS格式化工具，支持CSS美化、压缩、自定义缩进，快速格式化CSS代码，数据本地处理安全可靠。",
  keywords: [
    "CSS格式化",
    "CSS美化",
    "CSS压缩",
    "CSS格式化工具",
    "在线CSS工具",
  ],
  openGraph: {
    title: "CSS格式化/压缩工具 - 在线美化压缩CSS代码 | 工具箱",
    description:
      "免费在线CSS格式化工具，支持CSS美化、压缩、自定义缩进，快速格式化CSS代码，数据本地处理安全可靠。",
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
