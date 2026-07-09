import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音频压缩 - 在线音频压缩工具 | 99在线工具",
  description:
    "在线压缩音频文件大小，支持调整比特率和质量，多种格式输出",
  keywords: [
    "音频压缩",
    "在线音频压缩",
    "音频压缩工具",
    "免费音频压缩",
  ],
  openGraph: {
    title: "音频压缩 - 在线音频压缩工具 | 99在线工具",
    description:
      "在线压缩音频文件大小，支持调整比特率和质量，多种格式输出",
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
