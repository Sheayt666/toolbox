import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF电子签名 - 在线PDF电子签名工具 | 工具箱",
  description:
    "在线为PDF添加电子签名，支持手写签名和文字签名，一键添加",
  keywords: [
    "PDF电子签名",
    "在线PDF电子签名",
    "PDF电子签名工具",
    "免费PDF电子签名",
  ],
  openGraph: {
    title: "PDF电子签名 - 在线PDF电子签名工具 | 工具箱",
    description:
      "在线为PDF添加电子签名，支持手写签名和文字签名，一键添加",
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
