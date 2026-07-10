import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "繁简转换 - 简体繁体中文在线转换工具 | 99在线工具",
  description:
    "免费在线繁简转换工具，简体中文转繁体中文、繁体中文转简体中文，实时转换，常用字全覆盖，支持一键复制和字数统计。",
  keywords: ["繁简转换", "简体转繁体", "繁体转简体", "中文转换", "繁简体转换", "在线繁简转换", "汉字转换"],
  openGraph: {
    title: "繁简转换 - 简体繁体中文在线转换工具 | 99在线工具",
    description:
      "免费在线繁简转换工具，简体中文转繁体中文、繁体中文转简体中文，实时转换。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/traditional-simplified",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
