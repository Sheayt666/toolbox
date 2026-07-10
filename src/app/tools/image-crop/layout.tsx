import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片裁剪工具 - 在线自由裁剪固定比例 | 99在线工具",
  description:
    "免费在线图片裁剪工具，支持自由裁剪和固定比例裁剪（1:1、4:3、16:9等），拖拽调整裁剪框，键盘微调，实时预览，一键下载裁剪结果。",
  keywords: [
    "图片裁剪",
    "在线图片裁剪",
    "图片裁剪工具",
    "自由裁剪",
    "固定比例裁剪",
    "1:1裁剪",
    "16:9裁剪",
    "裁剪图片在线",
    "图片裁切",
    "截图裁剪",
  ],
  openGraph: {
    title: "图片裁剪工具 - 在线自由裁剪固定比例 | 99在线工具",
    description:
      "免费在线图片裁剪工具，支持自由裁剪和固定比例裁剪，拖拽调整裁剪框，实时预览效果。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/image-crop",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
