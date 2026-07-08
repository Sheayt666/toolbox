import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "二维码解码器 - 在线解析二维码图片 | 工具箱",
  description:
    "免费在线二维码解码器，上传二维码图片即可解析内容，支持拖拽上传和粘贴图片，本地处理安全可靠。",
  keywords: [
    "二维码解码",
    "二维码识别",
    "二维码解析",
    "二维码扫描",
    "在线二维码工具",
  ],
  openGraph: {
    title: "二维码解码器 - 在线解析二维码图片 | 工具箱",
    description:
      "免费在线二维码解码器，上传二维码图片即可解析内容，支持拖拽上传和粘贴图片，本地处理安全可靠。",
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
