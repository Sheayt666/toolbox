import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "头像生成器 - 在线文字头像制作 | 99在线工具",
  description:
    "免费在线头像生成器，生成个性化文字头像，支持渐变背景、随机颜色、自定义尺寸、圆形方形，多种预设配色方案，一键下载。",
  keywords: [
    "头像生成器",
    "文字头像",
    "在线头像制作",
    "名字头像",
    "首字母头像",
    "头像设计",
    "个性化头像",
    "渐变头像",
  ],
  openGraph: {
    title: "头像生成器 - 在线文字头像制作 | 99在线工具",
    description:
      "免费在线头像生成器，生成个性化文字头像，支持渐变背景、随机颜色、自定义尺寸。",
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
