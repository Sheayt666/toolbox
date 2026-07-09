import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频合并 - 在线视频合并工具 | 工具箱",
  description:
    "在线合并多个视频文件，支持不同格式，拖拽排序，一键合并",
  keywords: [
    "视频合并",
    "在线视频合并",
    "视频合并工具",
    "免费视频合并",
  ],
  openGraph: {
    title: "视频合并 - 在线视频合并工具 | 工具箱",
    description:
      "在线合并多个视频文件，支持不同格式，拖拽排序，一键合并",
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
