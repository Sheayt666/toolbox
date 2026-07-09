import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音频裁剪 - 在线音频裁剪工具 | 工具箱",
  description:
    "在线裁剪音频片段，精确控制起止时间，支持淡入淡出效果",
  keywords: [
    "音频裁剪",
    "在线音频裁剪",
    "音频裁剪工具",
    "免费音频裁剪",
  ],
  openGraph: {
    title: "音频裁剪 - 在线音频裁剪工具 | 工具箱",
    description:
      "在线裁剪音频片段，精确控制起止时间，支持淡入淡出效果",
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
