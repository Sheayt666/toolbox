import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "二维码生成器 - 在线自定义制作 | 99在线工具",
  description:
    "免费在线二维码生成器，支持自定义颜色和尺寸，可下载PNG图片，文本URL一键生成二维码。",
  keywords: [
    "二维码生成",
    "在线二维码",
    "二维码制作",
    "二维码下载",
    "QR Code生成器",
  ],
  openGraph: {
    title: "二维码生成器 - 在线自定义制作 | 99在线工具",
    description:
      "免费在线二维码生成器，支持自定义颜色和尺寸，可下载PNG图片，文本URL一键生成二维码。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/qrcode",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
