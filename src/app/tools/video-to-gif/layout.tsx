import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频转GIF - 在线GIF动图制作工具 | 工具箱",
  description:
    "免费在线视频转GIF工具，支持MP4、WebM等格式，可调整起止时间、帧率、质量和尺寸，一键生成GIF动图。",
  keywords: [
    "视频转GIF",
    "GIF制作",
    "在线转GIF",
    "MP4转GIF",
    "视频动图",
    "GIF生成器",
    "视频截取GIF",
    "动图制作",
  ],
  openGraph: {
    title: "视频转GIF - 在线GIF动图制作工具 | 工具箱",
    description:
      "免费在线视频转GIF工具，支持多种视频格式，可自定义参数，一键生成GIF动图。",
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
