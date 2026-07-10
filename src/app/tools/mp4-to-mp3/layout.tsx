import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MP4转MP3 - 在线MP4转MP3工具 | 99在线工具",
  description:
    "在线从MP4视频中提取音频并转换为MP3格式，一键转换下载",
  keywords: [
    "MP4转MP3",
    "在线MP4转MP3",
    "MP4转MP3工具",
    "免费MP4转MP3",
  ],
  openGraph: {
    title: "MP4转MP3 - 在线MP4转MP3工具 | 99在线工具",
    description:
      "在线从MP4视频中提取音频并转换为MP3格式，一键转换下载",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/mp4-to-mp3",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
