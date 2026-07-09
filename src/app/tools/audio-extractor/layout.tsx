import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频提取音频 - 在线视频提取音频工具 | 工具箱",
  description:
    "在线从视频中提取音频轨道，支持MP3/WAV/WebM等多种音频格式",
  keywords: [
    "视频提取音频",
    "在线视频提取音频",
    "视频提取音频工具",
    "免费视频提取音频",
  ],
  openGraph: {
    title: "视频提取音频 - 在线视频提取音频工具 | 工具箱",
    description:
      "在线从视频中提取音频轨道，支持MP3/WAV/WebM等多种音频格式",
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
