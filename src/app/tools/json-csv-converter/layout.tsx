import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON转CSV - CSV转JSON在线转换工具 | 99在线工具",
  description:
    "免费在线JSON和CSV互转工具，支持JSON转CSV、CSV转JSON，自定义分隔符，格式化输出，一键下载转换后的文件，数据本地处理安全可靠。",
  keywords: ["JSON转CSV", "CSV转JSON", "JSON CSV转换", "在线转换工具", "数据转换", "CSV格式", "JSON格式"],
  openGraph: {
    title: "JSON转CSV - CSV转JSON在线转换工具 | 99在线工具",
    description:
      "免费在线JSON和CSV互转工具，支持自定义分隔符，格式化输出，一键下载。",
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
