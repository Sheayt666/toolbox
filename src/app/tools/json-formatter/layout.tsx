import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON格式化工具 - 在线美化压缩校验 | 工具箱",
  description:
    "免费在线JSON格式化工具，支持JSON美化、压缩、校验、树状视图展示，快速格式化JSON数据，无需注册即可使用。",
  keywords: [
    "JSON格式化",
    "JSON美化",
    "JSON压缩",
    "JSON校验",
    "在线JSON工具",
  ],
  openGraph: {
    title: "JSON格式化工具 - 在线美化压缩校验 | 工具箱",
    description:
      "免费在线JSON格式化工具，支持JSON美化、压缩、校验、树状视图展示，快速格式化JSON数据，无需注册即可使用。",
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
