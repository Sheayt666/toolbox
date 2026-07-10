import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import Analytics from "@/components/Analytics";
import { WebSiteSchema } from "@/components/SEOSchema";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "99在线工具";
const siteDescription =
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
  "免费在线工具箱，提供JSON格式化、Base64编解码、正则表达式测试、二维码生成、密码生成器等实用工具，无需注册即可使用。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - 免费在线工具集合`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "在线工具",
    "JSON格式化",
    "Base64",
    "正则表达式",
    "二维码生成",
    "密码生成器",
    "开发工具",
    "工具箱",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - 免费在线工具集合`,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - 免费在线工具集合`,
    description: siteDescription,
    images: [`${siteUrl}/og-image.png`],
    creator: "@toolbox",
  },
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
    },
  },
  manifest: "/manifest.json",
  // 百度搜索资源平台验证
  other: {
    "baidu-site-verification": "codeva-K0FaIbGM2e",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-[#09090b] text-white">
        <WebSiteSchema
          name={siteName}
          url={siteUrl}
          description={siteDescription}
          searchUrl={`${siteUrl}/?q={search_term_string}`}
        />
        <Header />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <Footer />
        <MobileBottomNav />
        <Analytics />
      </body>
    </html>
  );
}
