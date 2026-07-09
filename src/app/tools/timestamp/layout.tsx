import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "时间戳转换工具 - Unix时间戳互转 | 99在线工具",
  description:
    "免费在线时间戳转换工具，Unix时间戳与日期时间格式互转，支持秒级和毫秒级，显示当前时间戳。",
  keywords: [
    "时间戳转换",
    "Unix时间戳",
    "时间戳转日期",
    "日期转时间戳",
  ],
  openGraph: {
    title: "时间戳转换工具 - Unix时间戳互转 | 99在线工具",
    description:
      "免费在线时间戳转换工具，Unix时间戳与日期时间格式互转，支持秒级和毫秒级，显示当前时间戳。",
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
