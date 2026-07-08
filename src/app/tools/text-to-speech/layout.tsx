import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文字转语音 - 在线文本朗读工具 | 工具箱",
  description:
    "免费在线文字转语音工具，支持多种音色和语速调节，使用浏览器原生语音合成技术，实时朗读文本内容。",
  keywords: [
    "文字转语音",
    "在线朗读",
    "文本转语音",
    "TTS",
    "语音合成",
    "文字朗读",
    "在线文字转语音",
  ],
  openGraph: {
    title: "文字转语音 - 在线文本朗读工具 | 工具箱",
    description:
      "免费在线文字转语音工具，支持多种音色和语速调节，使用浏览器原生语音合成技术。",
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
