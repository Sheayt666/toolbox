import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "大小写转换 - 英文大小写首字母大写转换 | 99在线工具",
  description:
    "免费在线大小写转换工具，支持大写、小写、首字母大写、反转大小写、驼峰转换等多种格式。",
  keywords: ["大小写转换", "大写转小写", "小写转大写", "首字母大写", "驼峰转换"],
  openGraph: {
    title: "大小写转换 - 英文大小写首字母大写转换 | 99在线工具",
    description:
      "免费在线大小写转换工具，支持大写、小写、首字母大写、反转大小写等多种格式。",
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
