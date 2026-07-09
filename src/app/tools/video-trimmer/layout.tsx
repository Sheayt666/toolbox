import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频裁剪 - 在线视频裁剪工具 | 工具箱",
  description:
    "在线裁剪视频片段，精确控制起止时间，支持预览和导出",
  keywords: [
    "视频裁剪",
    "在线视频裁剪",
    "视频裁剪工具",
    "免费视频裁剪",
  ],
  openGraph: {
    title: "视频裁剪 - 在线视频裁剪工具 | 工具箱",
    description:
      "在线裁剪视频片段，精确控制起止时间，支持预览和导出",
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
