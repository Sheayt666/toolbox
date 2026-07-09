import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片锐化 - 在线图片锐化工具 | 工具箱",
  description:
    "在线图片锐化处理，增强图片清晰度和边缘细节，让模糊图片变清晰",
  keywords: [
    "图片锐化",
    "清晰度增强",
    "图片修复",
    "边缘增强",
  ],
  openGraph: {
    title: "图片锐化 - 在线图片锐化工具 | 工具箱",
    description:
      "在线图片锐化处理，增强图片清晰度和边缘细节，让模糊图片变清晰",
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
