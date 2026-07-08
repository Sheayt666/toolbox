import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // 生产环境优化
  reactStrictMode: true,

  // 图片优化配置
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 年
    remotePatterns: [],
  },

  // 压缩配置
  compress: true,

  // 构建时输出独立文件，便于部署
  output: "standalone",

  // 启用 gzip 压缩（生产环境）
  ...(isProd && {
    poweredByHeader: false,
    generateEtags: true,
  }),

  // 实验性功能（可选，根据需要启用）
  experimental: {
    // 优化打包
    optimizePackageImports: ["lucide-react"],
    // 暂时禁用 turbopack 以避免构建问题
    // turbopack: false,
  },

  // 环境变量前缀 NEXT_PUBLIC_ 的变量会暴露给客户端
  // 其他环境变量仅在服务器端可用
};

export default nextConfig;
