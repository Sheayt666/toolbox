import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "截图美化工具 - 在线截图装饰生成器 | 99在线工具",
  description:
    "免费在线截图美化工具，给截图添加圆角、阴影、渐变背景和设备外壳，一键生成精美展示图，支持浏览器窗口效果，本地处理安全可靠。",
  keywords: [
    "截图美化",
    "截图装饰",
    "截图加边框",
    "截图加阴影",
    "截图渐变背景",
    "截图圆角",
    "浏览器外壳",
    "截图展示",
  ],
  openGraph: {
    title: "截图美化工具 - 在线截图装饰生成器 | 99在线工具",
    description:
      "免费在线截图美化工具，给截图添加圆角、阴影、渐变背景和设备外壳。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/screenshot-maker",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
