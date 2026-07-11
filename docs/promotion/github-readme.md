# 工具箱 — 开发者在线工具箱

> 一个聚合了 12+ 常用开发工具的在线工具箱网站，纯前端实现，无需注册，打开即用。

[![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](#license)

---

## ✨ 项目介绍

工具箱 是一个面向开发者的在线工具箱网站，致力于将日常开发中高频使用的小工具整合到一起，让开发者不用再为了一个简单的功能去搜索引擎翻半天。

**设计理念：**
- 🎯 **专注实用** — 只做开发者真正需要的工具
- 🚀 **即开即用** — 无需注册登录，打开浏览器就能用
- 🔒 **隐私安全** — 所有数据处理均在浏览器本地完成，不上传服务器
- 🎨 **清爽界面** — 无广告、无弹窗，专注于工具本身

---

## 🛠️ 功能特性

### 已上线工具

| # | 工具名称 | 功能说明 |
|---|---------|---------|
| 1 | **JSON 格式化** | 格式化/压缩 JSON，支持缩进切换、转义/反转义、JSON 转 TS 接口 |
| 2 | **正则表达式测试** | 实时匹配高亮，支持捕获组，内置常用正则模板库 |
| 3 | **Base64 编解码** | 文本/图片互转，支持拖拽上传，本地处理 |
| 4 | **URL 编解码** | 一键编解码，支持 query 参数解析为键值对 |
| 5 | **时间戳转换** | Unix 时间戳与日期互转，支持毫秒精度，多时区 |
| 6 | **二维码生成** | 文本/链接生成二维码，支持大小和容错级别调整 |
| 7 | **颜色转换** | HEX / RGB / RGBA / HSL 互转，实时预览 |
| 8 | **Markdown 编辑器** | 实时预览，支持导出 HTML，常用工具栏 |
| 9 | **哈希计算** | MD5 / SHA-1 / SHA-256 / SHA-512 等 |
| 10 | **UUID 生成器** | 一键生成多个 UUID，支持 v1 / v4 版本 |
| 11 | **文本对比** | 两段文本差异对比，行级高亮 |
| 12 | **随机数生成** | 指定范围生成随机数，支持批量 |

### 规划中

- [ ] JWT 解码
- [ ] Cron 表达式解析
- [ ] HTML/XML 格式化
- [ ] SQL 格式化
- [ ] 图片压缩
- [ ] 更多工具欢迎提 Issue...

---

## 🏗️ 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **语言**: TypeScript
- **样式**: Tailwind CSS 3
- **图标**: Lucide Icons
- **路由**: Vue Router 4
- **部署**: Vercel

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 pnpm >= 6.0.0

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/yourusername/工具箱.git

# 进入项目目录
cd 工具箱

# 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 项目结构

```
工具箱/
├── public/              # 静态资源
├── src/
│   ├── assets/          # 资源文件
│   ├── components/      # 公共组件
│   ├── views/           # 页面/工具视图
│   ├── router/          # 路由配置
│   ├── utils/           # 工具函数
│   ├── App.vue          # 根组件
│   └── main.ts          # 入口文件
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🌐 在线演示

访问正式版本：[https://toolbox-drab.vercel.app](https://toolbox-drab.vercel.app)

---

## 📸 截图

> 截图文件存放于 `docs/screenshots/` 目录下

| 首页 | JSON 格式化 | 正则测试 |
|------|------------|---------|
| ![首页](docs/screenshots/home.png) | ![JSON格式化](docs/screenshots/json-formatter.png) | ![正则测试](docs/screenshots/regex-tester.png) |

| Base64 工具 | 时间戳转换 | 颜色转换 |
|------------|-----------|---------|
| ![Base64](docs/screenshots/base64.png) | ![时间戳](docs/screenshots/timestamp.png) | ![颜色转换](docs/screenshots/color-converter.png) |

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 贡献方式

1. **提交 Bug** — 发现问题请提 Issue，描述清楚复现步骤和环境
2. **功能建议** — 有好的想法或需要新工具，欢迎提 Issue 讨论
3. **提交代码** — Fork 项目后提交 PR，具体步骤如下：

### 开发规范

- 使用 TypeScript，保持类型完整
- 遵循 Vue 3 Composition API 风格
- 使用 Tailwind CSS 进行样式开发
- 代码提交遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范

### Pull Request 流程

1. Fork 本仓库
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 发起 Pull Request

---

## 📄 License

本项目基于 [MIT License](LICENSE) 开源，可自由使用和修改。

---

## ⭐ 支持

如果你觉得这个项目对你有帮助，欢迎点个 Star ⭐ 支持一下，这是我持续更新的动力！

也欢迎分享给你的朋友和同事~

---

<div align="center">
  Made with ❤️ by 工具箱 Team
</div>

