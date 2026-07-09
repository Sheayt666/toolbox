import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // 生产环境优化
  reactStrictMode: true,

  // 静态导出，部署到 Cloudflare Pages
  output: "export",

  // 静态导出时禁用图片优化
  images: {
    unoptimized: true,
  },

  // 压缩配置
  compress: true,

  // 启用 gzip 压缩（生产环境）
  ...(isProd && {
    poweredByHeader: false,
    generateEtags: true,
  }),

  // 实验性功能
  experimental: {
    // 优化打包
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
