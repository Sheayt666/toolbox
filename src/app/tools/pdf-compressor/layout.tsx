import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF压缩工具 - 在线压缩PDF文件大小 | 工具箱",
  description:
    "免费在线PDF压缩工具，支持压缩质量调节，减小PDF文件体积，本地处理安全可靠，一键下载压缩后的PDF文件。",
  keywords: [
    "PDF压缩",
    "在线PDF压缩",
    "压缩PDF",
    "PDF文件压缩",
    "减小PDF大小",
    "PDF压缩工具",
    "PDF瘦身",
  ],
  openGraph: {
    title: "PDF压缩工具 - 在线压缩PDF文件大小 | 工具箱",
    description:
      "免费在线PDF压缩工具，支持压缩质量调节，减小PDF文件体积，本地处理安全可靠。",
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
