/**
 * 场景化工具课程知识库 — 路线A
 * 10 个实战课程，每个课程串联多个工具，形成完整工作流
 * 引导用户在真实场景中学会组合使用工具
 */

export type CourseDifficulty = "入门" | "进阶" | "高级";

export interface CourseStep {
  /** 对应工具的唯一 ID（与 tools.ts 中 tool.id 一致） */
  toolId: string;
  /** 工具展示名称 */
  toolName: string;
  /** 工具路由路径 */
  toolPath: string;
  /** 该步骤的实操指引 */
  instruction: string;
}

export interface SceneCourse {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: CourseDifficulty;
  estimatedMinutes: number;
  steps: CourseStep[];
}

export const sceneCourses: SceneCourse[] = [
  {
    id: "image-optimization",
    name: "图片优化全流程",
    description:
      "从原始图片到可直接嵌入网页的最终产物，完整走完压缩、格式转换、加水印、转 Base64 四个关键环节，掌握图片处理的标准工作流。",
    category: "图片处理",
    difficulty: "入门",
    estimatedMinutes: 15,
    steps: [
      {
        toolId: "image-compressor",
        toolName: "图片压缩工具",
        toolPath: "/tools/image-compressor",
        instruction:
          "上传原始图片，调节质量参数进行压缩，在保证肉眼清晰度的前提下尽可能减小文件体积，为后续处理打好基础。",
      },
      {
        toolId: "image-converter",
        toolName: "图片格式转换",
        toolPath: "/tools/image-converter",
        instruction:
          "将压缩后的图片转换为 WebP 等现代格式，兼顾体积与画质，适配大多数浏览器。",
      },
      {
        toolId: "image-watermark",
        toolName: "图片加水印",
        toolPath: "/tools/image-watermark",
        instruction:
          "为图片添加品牌文字水印，调整位置与透明度，保护版权同时不遮挡主体内容。",
      },
      {
        toolId: "base64-image-converter",
        toolName: "图片Base64转换",
        toolPath: "/tools/base64-image-converter",
        instruction:
          "将最终图片转为 Base64 编码，可直接内联到 HTML/CSS 中，减少额外网络请求。",
      },
    ],
  },
  {
    id: "developer-toolchain",
    name: "开发者工具链",
    description:
      "模拟一次完整的开发辅助流程：格式化接口数据、生成唯一标识、创建安全密码、编码配置信息、生成扫码传输二维码，覆盖日常开发高频场景。",
    category: "开发工具",
    difficulty: "进阶",
    estimatedMinutes: 20,
    steps: [
      {
        toolId: "json-formatter",
        toolName: "JSON 格式化",
        toolPath: "/tools/json-formatter",
        instruction:
          "粘贴接口返回的 JSON 数据，一键格式化并校验语法，快速定位字段结构与异常。",
      },
      {
        toolId: "uuid-generator",
        toolName: "UUID 生成器",
        toolPath: "/tools/uuid-generator",
        instruction:
          "为新数据记录生成唯一标识符 UUID，批量生成多条，复制后写入数据库或日志。",
      },
      {
        toolId: "password-generator",
        toolName: "密码生成器",
        toolPath: "/tools/password-generator",
        instruction:
          "生成包含大小写字母、数字、符号的高强度密码，用于服务账户或数据库凭据。",
      },
      {
        toolId: "base64",
        toolName: "Base64 编解码",
        toolPath: "/tools/base64",
        instruction:
          "将敏感配置信息（如连接串）进行 Base64 编码，便于在环境变量或配置文件中安全传递。",
      },
      {
        toolId: "qrcode",
        toolName: "二维码生成器",
        toolPath: "/tools/qrcode",
        instruction:
          "把编码后的配置信息生成二维码，手机扫码即可快速获取，方便移动端调试与传输。",
      },
    ],
  },
  {
    id: "ecommerce-product-image",
    name: "电商商品图处理",
    description:
      "商品上架前的标准图片处理流程：压缩提速、按平台规格调整尺寸、添加店铺水印防盗图，三步搞定一张合规商品主图。",
    category: "电商运营",
    difficulty: "入门",
    estimatedMinutes: 10,
    steps: [
      {
        toolId: "image-compressor",
        toolName: "图片压缩工具",
        toolPath: "/tools/image-compressor",
        instruction:
          "上传商品原图进行压缩，控制单张图片在 200KB 以内，加快商品详情页加载速度。",
      },
      {
        toolId: "image-resize",
        toolName: "图片调整大小",
        toolPath: "/tools/image-resize",
        instruction:
          "按平台要求（如 800×800）调整尺寸，锁定宽高比避免变形，保证主图整齐统一。",
      },
      {
        toolId: "image-watermark",
        toolName: "图片加水印",
        toolPath: "/tools/image-watermark",
        instruction:
          "在右下角添加店铺名称水印，设置半透明效果，既防盗图又不影响商品展示。",
      },
    ],
  },
  {
    id: "web-embed-assets",
    name: "网页嵌入素材准备",
    description:
      "把矢量素材处理成可直接内联到网页的资源：SVG 转 PNG、转 Base64 编码、压缩体积，减少 HTTP 请求提升页面性能。",
    category: "网页开发",
    difficulty: "进阶",
    estimatedMinutes: 15,
    steps: [
      {
        toolId: "svg-to-png",
        toolName: "SVG转PNG",
        toolPath: "/tools/svg-to-png",
        instruction:
          "上传 SVG 矢量图，设置目标尺寸与背景色，转换为兼容性更好的 PNG 位图。",
      },
      {
        toolId: "base64-image-converter",
        toolName: "图片Base64转换",
        toolPath: "/tools/base64-image-converter",
        instruction:
          "将 PNG 转为 Base64 编码字符串，可直接写入 HTML 的 img 标签或 CSS background。",
      },
      {
        toolId: "image-compressor",
        toolName: "图片压缩工具",
        toolPath: "/tools/image-compressor",
        instruction:
          "若 Base64 字符串过大，回到压缩工具降低质量后重新编码，控制内联资源体积在合理范围。",
      },
    ],
  },
  {
    id: "password-security-system",
    name: "安全密码管理体系",
    description:
      "构建一套完整的密码安全流程：生成强密码、生成哈希摘要用于存储、编码为二维码便于移动端携带、对敏感信息做加密保护。",
    category: "信息安全",
    difficulty: "高级",
    estimatedMinutes: 20,
    steps: [
      {
        toolId: "password-generator",
        toolName: "密码生成器",
        toolPath: "/tools/password-generator",
        instruction:
          "生成 16 位以上、包含全部字符类型的高强度密码，作为账户主密码。",
      },
      {
        toolId: "hash-generator",
        toolName: "哈希生成器",
        toolPath: "/tools/hash-generator",
        instruction:
          "对密码生成 SHA-256 哈希摘要，理解哈希不可逆的特性，用于服务端安全存储校验。",
      },
      {
        toolId: "qrcode",
        toolName: "二维码生成器",
        toolPath: "/tools/qrcode",
        instruction:
          "将密码信息编码为二维码，手机扫码即可填入，避免手动输入出错也便于随身携带。",
      },
      {
        toolId: "caesar-cipher",
        toolName: "凯撒密码",
        toolPath: "/tools/caesar-cipher",
        instruction:
          "对需要记录的敏感信息做凯撒位移加密，理解古典加密原理，为信息再加一层保护。",
      },
    ],
  },
  {
    id: "data-format-pipeline",
    name: "数据格式转换流",
    description:
      "把一份 CSV 表格数据整理成结构清晰、字段合规的 JSON：先转格式、再美化排版、最后用正则校验关键字段，形成可靠的数据清洗流程。",
    category: "数据处理",
    difficulty: "进阶",
    estimatedMinutes: 15,
    steps: [
      {
        toolId: "csv-to-json",
        toolName: "CSV 转 JSON",
        toolPath: "/tools/csv-to-json",
        instruction:
          "粘贴或上传 CSV 表格数据，转换为 JSON 数组格式，注意检查分隔符与表头是否匹配。",
      },
      {
        toolId: "json-formatter",
        toolName: "JSON 格式化",
        toolPath: "/tools/json-formatter",
        instruction:
          "将转换后的 JSON 一键格式化缩进，结构层次一目了然，同时校验语法是否合法。",
      },
      {
        toolId: "regex-tester",
        toolName: "正则表达式测试",
        toolPath: "/tools/regex-tester",
        instruction:
          "编写正则表达式校验邮箱、手机号等关键字段格式，高亮匹配结果，确保数据质量达标。",
      },
    ],
  },
  {
    id: "color-design-scheme",
    name: "配色设计方案",
    description:
      "从零搭建一套可用的配色方案：自动生成和谐色板、在各颜色格式间转换取值、检测文字与背景对比度是否符合无障碍标准。",
    category: "设计配色",
    difficulty: "入门",
    estimatedMinutes: 10,
    steps: [
      {
        toolId: "color-palette-generator",
        toolName: "色板生成器",
        toolPath: "/tools/color-palette-generator",
        instruction:
          "选择基础色或随机生成一组和谐配色方案，作为设计稿的主色与辅色来源。",
      },
      {
        toolId: "color-picker",
        toolName: "颜色转换器",
        toolPath: "/tools/color-picker",
        instruction:
          "在 HEX、RGB、HSL 之间互转取值，复制代码可直接用于 CSS 与设计软件。",
      },
      {
        toolId: "color-contrast-checker",
        toolName: "颜色对比度检测",
        toolPath: "/tools/color-contrast-checker",
        instruction:
          "输入文字色与背景色，检测对比度是否满足 WCAG AA/AAA 标准，保证可读性与无障碍体验。",
      },
    ],
  },
  {
    id: "document-digitization",
    name: "文档数字化流程",
    description:
      "把一份纸质或 PDF 文档搬进数字世界：PDF 转图片、压缩优化、体验文字识别技术原理、最后对识别文本做批量清理格式化。",
    category: "文档办公",
    difficulty: "进阶",
    estimatedMinutes: 20,
    steps: [
      {
        toolId: "pdf-to-image",
        toolName: "PDF转图片",
        toolPath: "/tools/pdf-to-image",
        instruction:
          "上传 PDF 文档，将每一页转换为高清图片，为后续识别与归档做准备。",
      },
      {
        toolId: "image-compressor",
        toolName: "图片压缩工具",
        toolPath: "/tools/image-compressor",
        instruction:
          "对转换出的图片进行压缩，在保持文字清晰的前提下减小体积，提升后续处理效率。",
      },
      {
        toolId: "audio-to-text-sim",
        toolName: "语音转文字模拟",
        toolPath: "/tools/audio-to-text-sim",
        instruction:
          "通过语音转文字模拟器理解自动识别技术的基本原理与交互方式，为文档 OCR 识别建立认知基础。",
      },
      {
        toolId: "text-replace",
        toolName: "文本批量替换",
        toolPath: "/tools/text-replace",
        instruction:
          "对识别后的文本进行批量替换与清理，去除多余空格、统一标点，完成最终的文本格式化。",
      },
    ],
  },
  {
    id: "social-media-assets",
    name: "社交媒体素材",
    description:
      "为一次社交平台发布准备完整素材：压缩图片适配上传限制、调整到平台推荐尺寸、加个人水印、生成内容链接二维码引导关注。",
    category: "社交媒体",
    difficulty: "入门",
    estimatedMinutes: 12,
    steps: [
      {
        toolId: "image-compressor",
        toolName: "图片压缩工具",
        toolPath: "/tools/image-compressor",
        instruction:
          "压缩素材图片，控制在社交平台的上传体积限制内，保证快速发布与加载。",
      },
      {
        toolId: "image-resize",
        toolName: "图片调整大小",
        toolPath: "/tools/image-resize",
        instruction:
          "按各平台推荐尺寸（如微博 1080×1080、公众号 900×500）裁剪调整，获得最佳展示效果。",
      },
      {
        toolId: "image-watermark",
        toolName: "图片加水印",
        toolPath: "/tools/image-watermark",
        instruction:
          "添加个人 ID 或品牌水印，防止图片被搬运，提升账号辨识度。",
      },
      {
        toolId: "qrcode",
        toolName: "二维码生成器",
        toolPath: "/tools/qrcode",
        instruction:
          "将内容链接或公众号二维码生成图片，搭配素材发布，引导粉丝扫码关注。",
      },
    ],
  },
  {
    id: "health-data-calc",
    name: "健康数据计算流",
    description:
      "一次全面的个人健康自测：算 BMI 评估体型、算每日卡路里需求、算运动心率区间、算每日饮水量，串联四项健康计算形成完整画像。",
    category: "健康生活",
    difficulty: "入门",
    estimatedMinutes: 10,
    steps: [
      {
        toolId: "bmi-calculator",
        toolName: "BMI计算器",
        toolPath: "/tools/bmi-calculator",
        instruction:
          "输入身高体重计算 BMI 指数，了解自身体重是否处于健康范围，获取初步建议。",
      },
      {
        toolId: "calorie-calculator",
        toolName: "卡路里计算器",
        toolPath: "/tools/calorie-calculator",
        instruction:
          "根据活动水平计算每日所需热量摄入，为饮食计划设定合理目标。",
      },
      {
        toolId: "heart-rate-zones",
        toolName: "心率区间计算",
        toolPath: "/tools/heart-rate-zones",
        instruction:
          "计算燃脂、有氧等各运动心率区间，指导科学锻炼、控制运动强度。",
      },
      {
        toolId: "hydration-calculator",
        toolName: "补水计算器",
        toolPath: "/tools/hydration-calculator",
        instruction:
          "根据体重与活动量计算每日饮水量建议，养成规律补水的好习惯。",
      },
    ],
  },
];

/** 课程分类列表（用于页面筛选标签） */
export const courseCategories: string[] = [
  "全部",
  "图片处理",
  "开发工具",
  "电商运营",
  "网页开发",
  "信息安全",
  "数据处理",
  "设计配色",
  "文档办公",
  "社交媒体",
  "健康生活",
];

/** 难度对应的样式配置 */
export const difficultyConfig: Record<
  CourseDifficulty,
  { label: string; className: string }
> = {
  入门: {
    label: "入门",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  进阶: {
    label: "进阶",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  高级: {
    label: "高级",
    className: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
};
