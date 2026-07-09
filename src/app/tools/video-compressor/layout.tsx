import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频压缩 - 在线视频压缩工具 | 99在线工具",
  description:
    "在线压缩视频文件大小，支持调整分辨率、比特率和质量，本地处理",
  keywords: [
    "视频压缩",
    "在线视频压缩",
    "视频压缩工具",
    "免费视频压缩",
  ],
  openGraph: {
    title: "视频压缩 - 在线视频压缩工具 | 99在线工具",
    description:
      "在线压缩视频文件大小，支持调整分辨率、比特率和质量，本地处理",
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
