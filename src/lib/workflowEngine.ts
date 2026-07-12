/**
 * 工作流引擎 — 路线C
 *
 * 设计目标：
 * 1. 数据传递管道 — 使用 localStorage 作为工具间数据桥梁
 * 2. 工作流模板 — 10 个预设场景模板（电商 3 / 开发 3 / 设计 2 / 办公 2）
 * 3. 进度追踪 — 记录当前工作流进度
 *
 * 纯 localStorage 实现，无后端依赖，SSR 安全（所有浏览器 API 访问均做
 * `typeof window` 守卫）。写入时会派发 `toolbox-storage-change` 事件，
 * 与项目内 useToolHistory / gamification 保持一致的同步约定。
 */

/* ============ 类型定义 ============ */

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "ecommerce" | "developer" | "design" | "office";
  steps: WorkflowStep[];
  /** 预计完成时长（分钟），用于模板卡片展示 */
  estimatedMinutes?: number;
  /** 难度标签，用于模板卡片展示 */
  difficulty?: "入门" | "进阶" | "高级";
}

export interface WorkflowStep {
  toolId: string;
  toolName: string;
  toolPath: string;
  stepLabel: string; // "第1步：压缩图片"
  dataInput?: string; // 期望的数据类型
  dataOutput?: string; // 产出的数据类型
}

export interface WorkflowProgress {
  templateId: string;
  currentStep: number;
  completedSteps: number[];
  startTime: number;
  data: Record<string, string>; // 工具间传递的数据（key = toolId）
  /** 工作流完成时间戳（指针到达终点时由引擎写入） */
  endTime?: number;
}

/* ============ 存储键 ============ */

const WORKFLOW_PROGRESS_KEY = "wf_progress";
/** 自定义事件名，与项目内其它 localStorage 模块保持一致 */
const STORAGE_CHANGE_EVENT = "toolbox-storage-change";

/* ============ 工具函数 ============ */

function isClient(): boolean {
  return typeof window !== "undefined";
}

function safeParse<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key: string, value: unknown): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // 通知其它已挂载的组件（及当前组件）数据已变更
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  } catch {
    // 容量超限 / 隐私模式 — 忽略
  }
}

/* ============ 工作流模板 ============ */
/*
 * 10 个预设模板。每一步引用项目内真实存在的工具（slug 与
 * /tools/[slug] 路由一一对应），保证「开始工作流」后能直接跳转。
 */

export const workflowTemplates: WorkflowTemplate[] = [
  /* ---------- 电商（3） ---------- */
  {
    id: "ecom-product-image-optimize",
    name: "电商商品图片优化",
    description:
      "从原始商品图到 WebP 上线图：调整尺寸、压缩体积、转换格式，全面提升商品详情页加载速度。",
    category: "ecommerce",
    estimatedMinutes: 6,
    difficulty: "入门",
    steps: [
      {
        toolId: "image-resize",
        toolName: "图片缩放",
        toolPath: "/tools/image-resize",
        stepLabel: "第1步：调整图片尺寸",
        dataInput: "原始商品图片",
        dataOutput: "尺寸适配的图片",
      },
      {
        toolId: "image-compressor",
        toolName: "图片压缩",
        toolPath: "/tools/image-compressor",
        stepLabel: "第2步：压缩图片体积",
        dataInput: "尺寸适配的图片",
        dataOutput: "压缩后的图片",
      },
      {
        toolId: "image-converter",
        toolName: "图片格式转换",
        toolPath: "/tools/image-converter",
        stepLabel: "第3步：转换为通用格式",
        dataInput: "压缩后的图片",
        dataOutput: "格式统一的图片",
      },
      {
        toolId: "image-to-webp",
        toolName: "图片转 WebP",
        toolPath: "/tools/image-to-webp",
        stepLabel: "第4步：转为 WebP 上线",
        dataInput: "格式统一的图片",
        dataOutput: "WebP 高效图片",
      },
    ],
  },
  {
    id: "ecom-detail-page-assets",
    name: "电商详情页素材制作",
    description:
      "裁剪主体、统一尺寸、压缩加水印，一条龙产出可发布的详情页素材与防盗图。",
    category: "ecommerce",
    estimatedMinutes: 8,
    difficulty: "进阶",
    steps: [
      {
        toolId: "image-crop",
        toolName: "图片裁剪",
        toolPath: "/tools/image-crop",
        stepLabel: "第1步：裁剪商品主体",
        dataInput: "原始拍摄图",
        dataOutput: "裁剪后的主体图",
      },
      {
        toolId: "image-resize",
        toolName: "图片缩放",
        toolPath: "/tools/image-resize",
        stepLabel: "第2步：统一详情页尺寸",
        dataInput: "裁剪后的主体图",
        dataOutput: "尺寸规范图",
      },
      {
        toolId: "image-compressor",
        toolName: "图片压缩",
        toolPath: "/tools/image-compressor",
        stepLabel: "第3步：压缩图片体积",
        dataInput: "尺寸规范图",
        dataOutput: "压缩图",
      },
      {
        toolId: "image-watermark",
        toolName: "图片加水印",
        toolPath: "/tools/image-watermark",
        stepLabel: "第4步：添加店铺水印",
        dataInput: "压缩图",
        dataOutput: "带水印成品图",
      },
    ],
  },
  {
    id: "ecom-marketing-qrcode",
    name: "电商营销物料生成",
    description:
      "生成活动二维码、转 Base64 内嵌、加水印防伪，快速产出可投放的营销物料。",
    category: "ecommerce",
    estimatedMinutes: 5,
    difficulty: "入门",
    steps: [
      {
        toolId: "qr-code-generator",
        toolName: "二维码生成器",
        toolPath: "/tools/qr-code-generator",
        stepLabel: "第1步：生成活动二维码",
        dataInput: "活动链接",
        dataOutput: "二维码图片",
      },
      {
        toolId: "image-to-base64",
        toolName: "图片转 Base64",
        toolPath: "/tools/image-to-base64",
        stepLabel: "第2步：转为 Base64 内嵌",
        dataInput: "二维码图片",
        dataOutput: "Base64 字符串",
      },
      {
        toolId: "image-watermark",
        toolName: "图片加水印",
        toolPath: "/tools/image-watermark",
        stepLabel: "第3步：添加品牌水印",
        dataInput: "二维码图片",
        dataOutput: "带水印二维码",
      },
    ],
  },

  /* ---------- 开发者（3） ---------- */
  {
    id: "dev-api-data-debug",
    name: "API 数据调试流程",
    description:
      "格式化接口返回、生成 TypeScript 类型、Base64 解码载荷、计算哈希校验，高效调试接口数据。",
    category: "developer",
    estimatedMinutes: 7,
    difficulty: "进阶",
    steps: [
      {
        toolId: "json-formatter",
        toolName: "JSON 格式化",
        toolPath: "/tools/json-formatter",
        stepLabel: "第1步：格式化接口 JSON",
        dataInput: "接口原始响应",
        dataOutput: "格式化 JSON",
      },
      {
        toolId: "json-to-typescript",
        toolName: "JSON 转 TypeScript",
        toolPath: "/tools/json-to-typescript",
        stepLabel: "第2步：生成 TS 类型",
        dataInput: "格式化 JSON",
        dataOutput: "TypeScript 类型定义",
      },
      {
        toolId: "base64",
        toolName: "Base64 编解码",
        toolPath: "/tools/base64",
        stepLabel: "第3步：解码 Base64 载荷",
        dataInput: "Base64 字符串",
        dataOutput: "解码后明文",
      },
      {
        toolId: "hash-generator",
        toolName: "哈希生成器",
        toolPath: "/tools/hash-generator",
        stepLabel: "第4步：计算数据哈希",
        dataInput: "待校验数据",
        dataOutput: "哈希摘要",
      },
    ],
  },
  {
    id: "dev-config-conversion",
    name: "配置文件转换流程",
    description:
      "JSON 与 YAML 互转、转 CSV 导出、Base64 编码传输，覆盖配置文件常见流转场景。",
    category: "developer",
    estimatedMinutes: 5,
    difficulty: "入门",
    steps: [
      {
        toolId: "json-to-yaml",
        toolName: "JSON 转 YAML",
        toolPath: "/tools/json-to-yaml",
        stepLabel: "第1步：JSON 转 YAML",
        dataInput: "JSON 配置",
        dataOutput: "YAML 配置",
      },
      {
        toolId: "json-to-csv",
        toolName: "JSON 转 CSV",
        toolPath: "/tools/json-to-csv",
        stepLabel: "第2步：转为 CSV 导出",
        dataInput: "JSON 配置",
        dataOutput: "CSV 表格",
      },
      {
        toolId: "base64",
        toolName: "Base64 编解码",
        toolPath: "/tools/base64",
        stepLabel: "第3步：Base64 编码传输",
        dataInput: "配置文本",
        dataOutput: "Base64 字符串",
      },
    ],
  },
  {
    id: "dev-credential-generation",
    name: "安全凭证生成流程",
    description:
      "生成强密码、UUID、计算哈希、解析 JWT，一站式准备开发与联调所需的安全凭证。",
    category: "developer",
    estimatedMinutes: 6,
    difficulty: "高级",
    steps: [
      {
        toolId: "password-generator",
        toolName: "密码生成器",
        toolPath: "/tools/password-generator",
        stepLabel: "第1步：生成强密码",
        dataInput: "密码策略参数",
        dataOutput: "随机强密码",
      },
      {
        toolId: "uuid-generator",
        toolName: "UUID 生成器",
        toolPath: "/tools/uuid-generator",
        stepLabel: "第2步：生成唯一标识",
        dataInput: "—",
        dataOutput: "UUID",
      },
      {
        toolId: "hash-generator",
        toolName: "哈希生成器",
        toolPath: "/tools/hash-generator",
        stepLabel: "第3步：计算密码哈希",
        dataInput: "生成的密码",
        dataOutput: "哈希摘要",
      },
      {
        toolId: "jwt-decoder",
        toolName: "JWT 解析器",
        toolPath: "/tools/jwt-decoder",
        stepLabel: "第4步：解析调试 Token",
        dataInput: "JWT 字符串",
        dataOutput: "Token 载荷信息",
      },
    ],
  },

  /* ---------- 设计（2） ---------- */
  {
    id: "design-brand-color-system",
    name: "品牌色彩体系建设",
    description:
      "生成调色板、校验对比度、生成渐变与 CSS 代码，系统化构建可落地的品牌色彩体系。",
    category: "design",
    estimatedMinutes: 7,
    difficulty: "进阶",
    steps: [
      {
        toolId: "color-palette-generator",
        toolName: "调色板生成器",
        toolPath: "/tools/color-palette-generator",
        stepLabel: "第1步：生成品牌调色板",
        dataInput: "主色值",
        dataOutput: "完整调色板",
      },
      {
        toolId: "color-contrast-checker",
        toolName: "对比度检查器",
        toolPath: "/tools/color-contrast-checker",
        stepLabel: "第2步：校验可读性对比度",
        dataInput: "前景/背景色",
        dataOutput: "对比度报告",
      },
      {
        toolId: "css-gradient-generator",
        toolName: "CSS 渐变生成器",
        toolPath: "/tools/css-gradient-generator",
        stepLabel: "第3步：生成渐变样式",
        dataInput: "调色板色值",
        dataOutput: "CSS 渐变代码",
      },
      {
        toolId: "gradient-generator",
        toolName: "渐变生成器",
        toolPath: "/tools/gradient-generator",
        stepLabel: "第4步：导出渐变素材",
        dataInput: "渐变色值",
        dataOutput: "渐变图片素材",
      },
    ],
  },
  {
    id: "design-icon-asset-pipeline",
    name: "图标素材设计流程",
    description:
      "SVG 转 PNG、生成 ICO、制作 Favicon、转 Base64 内嵌，完成图标素材的多端适配。",
    category: "design",
    estimatedMinutes: 6,
    difficulty: "进阶",
    steps: [
      {
        toolId: "svg-to-png",
        toolName: "SVG 转 PNG",
        toolPath: "/tools/svg-to-png",
        stepLabel: "第1步：SVG 转为 PNG",
        dataInput: "SVG 源文件",
        dataOutput: "PNG 位图",
      },
      {
        toolId: "image-to-ico",
        toolName: "图片转 ICO",
        toolPath: "/tools/image-to-ico",
        stepLabel: "第2步：生成 ICO 图标",
        dataInput: "PNG 位图",
        dataOutput: "ICO 图标文件",
      },
      {
        toolId: "favicon-generator",
        toolName: "Favicon 生成器",
        toolPath: "/tools/favicon-generator",
        stepLabel: "第3步：制作网站 Favicon",
        dataInput: "图标图片",
        dataOutput: "多尺寸 Favicon",
      },
      {
        toolId: "image-to-base64",
        toolName: "图片转 Base64",
        toolPath: "/tools/image-to-base64",
        stepLabel: "第4步：转 Base64 内嵌",
        dataInput: "图标图片",
        dataOutput: "Base64 字符串",
      },
    ],
  },

  /* ---------- 办公（2） ---------- */
  {
    id: "office-pdf-merge-compress",
    name: "PDF 合并压缩流程",
    description:
      "合并多个 PDF、压缩体积、添加水印保护，快速产出可分发的精简版 PDF 文档。",
    category: "office",
    estimatedMinutes: 5,
    difficulty: "入门",
    steps: [
      {
        toolId: "pdf-merge",
        toolName: "PDF 合并",
        toolPath: "/tools/pdf-merge",
        stepLabel: "第1步：合并多份 PDF",
        dataInput: "多份 PDF 文件",
        dataOutput: "合并后 PDF",
      },
      {
        toolId: "pdf-compressor",
        toolName: "PDF 压缩",
        toolPath: "/tools/pdf-compressor",
        stepLabel: "第2步：压缩 PDF 体积",
        dataInput: "合并后 PDF",
        dataOutput: "压缩后 PDF",
      },
      {
        toolId: "pdf-watermark",
        toolName: "PDF 加水印",
        toolPath: "/tools/pdf-watermark",
        stepLabel: "第3步：添加保护水印",
        dataInput: "压缩后 PDF",
        dataOutput: "带水印 PDF 成品",
      },
    ],
  },
  {
    id: "office-document-conversion",
    name: "文档格式转换流程",
    description:
      "Word/Excel 转 PDF、再转图片预览，统一文档格式便于分享与归档。",
    category: "office",
    estimatedMinutes: 6,
    difficulty: "入门",
    steps: [
      {
        toolId: "word-to-pdf",
        toolName: "Word 转 PDF",
        toolPath: "/tools/word-to-pdf",
        stepLabel: "第1步：Word 转 PDF",
        dataInput: "Word 文档",
        dataOutput: "PDF 文档",
      },
      {
        toolId: "excel-to-pdf",
        toolName: "Excel 转 PDF",
        toolPath: "/tools/excel-to-pdf",
        stepLabel: "第2步：Excel 转 PDF",
        dataInput: "Excel 表格",
        dataOutput: "PDF 文档",
      },
      {
        toolId: "pdf-to-image",
        toolName: "PDF 转图片",
        toolPath: "/tools/pdf-to-image",
        stepLabel: "第3步：PDF 转图片预览",
        dataInput: "PDF 文档",
        dataOutput: "图片预览",
      },
    ],
  },
];

/* ============ 模板查询 ============ */

/** 分类元信息，供页面渲染分类标题/图标 */
export const workflowCategoryMeta: Record<
  WorkflowTemplate["category"],
  { label: string; description: string; icon: string }
> = {
  ecommerce: {
    label: "电商运营",
    description: "商品图片与营销物料处理流程",
    icon: "ShoppingBag",
  },
  developer: {
    label: "开发效率",
    description: "接口调试与凭证生成流程",
    icon: "Code2",
  },
  design: {
    label: "设计创作",
    description: "色彩体系与图标素材流程",
    icon: "Palette",
  },
  office: {
    label: "办公文档",
    description: "PDF 与文档格式转换流程",
    icon: "FileText",
  },
};

/** 根据 id 获取模板 */
export function getWorkflowTemplate(
  templateId: string
): WorkflowTemplate | undefined {
  return workflowTemplates.find((t) => t.id === templateId);
}

/* ============ 数据传递管道 ============ */

/**
 * 保存工具产出到 localStorage。
 *
 * 数据写入当前工作流进度的 `data` 字典（key = toolId），
 * 作为后续步骤可读取的数据桥梁。`dataType` 用于描述数据语义
 * （如「压缩后的图片」），便于在 UI 中展示数据流向。
 */
export function saveWorkflowData(
  toolId: string,
  dataType: string,
  value: string
): void {
  if (!isClient() || !toolId) return;
  const progress = getWorkflowProgress();
  if (!progress) return;
  // 以 toolId 为键存储数据值；dataType 作为语义描述随值一并保存
  progress.data[toolId] = value;
  saveProgress(progress);
  // 记录一条数据类型日志（仅用于调试 / 展示，不参与核心逻辑）
  try {
    const logKey = "wf_data_log";
    const log = safeParse<
      Array<{ toolId: string; dataType: string; time: number }>
    >(logKey, []);
    log.unshift({ toolId, dataType, time: Date.now() });
    if (log.length > 50) log.length = 50;
    window.localStorage.setItem(logKey, JSON.stringify(log));
  } catch {
    // 忽略日志写入失败
  }
}

/**
 * 获取前序工具传递的数据。
 *
 * @param toolId 产出该数据的工具 id
 * @returns 该工具保存的数据值，不存在时返回 null
 */
export function getWorkflowData(toolId: string): string | null {
  const progress = getWorkflowProgress();
  if (!progress) return null;
  return progress.data[toolId] ?? null;
}

/** 获取当前工作流中所有已传递的数据（key = toolId） */
export function getAllWorkflowData(): Record<string, string> {
  const progress = getWorkflowProgress();
  return progress?.data ?? {};
}

/* ============ 进度追踪 ============ */

/** 读取当前工作流进度，不存在时返回 null */
export function getWorkflowProgress(): WorkflowProgress | null {
  return safeParse<WorkflowProgress | null>(WORKFLOW_PROGRESS_KEY, null);
}

/** 内部：持久化进度 */
function saveProgress(progress: WorkflowProgress): void {
  safeSave(WORKFLOW_PROGRESS_KEY, progress);
}

/**
 * 初始化工作流进度。
 *
 * 若该模板存在则创建一条新的进度记录（currentStep=0，无已完成步骤），
 * 并返回进度对象；模板不存在时返回 null。
 */
export function startWorkflow(templateId: string): WorkflowProgress | null {
  const template = getWorkflowTemplate(templateId);
  if (!template) return null;
  const progress: WorkflowProgress = {
    templateId,
    currentStep: 0,
    completedSteps: [],
    startTime: Date.now(),
    data: {},
  };
  saveProgress(progress);
  return progress;
}

/**
 * 标记某一步骤完成。
 *
 * 将 `stepIndex` 加入已完成集合（去重），并把当前步骤指针推进到
 * `stepIndex + 1`（若未越界）。返回更新后的进度，无活动工作流时返回 null。
 */
export function completeStep(stepIndex: number): WorkflowProgress | null {
  const progress = getWorkflowProgress();
  if (!progress) return null;
  if (!progress.completedSteps.includes(stepIndex)) {
    progress.completedSteps.push(stepIndex);
    progress.completedSteps.sort((a, b) => a - b);
  }
  const template = getWorkflowTemplate(progress.templateId);
  const maxStep = template ? template.steps.length : Infinity;
  // 推进当前步骤，但不越界
  progress.currentStep = Math.min(stepIndex + 1, maxStep);
  // 到达终点时记录完成时间（仅记录一次）
  if (progress.currentStep >= maxStep && !progress.endTime) {
    progress.endTime = Date.now();
  }
  saveProgress(progress);
  return progress;
}

/**
 * 跳过当前步骤。
 *
 * 仅推进步骤指针到 `stepIndex + 1`（允许达到 `steps.length` 以触发完成），
 * 但不把该步骤加入已完成集合 — 因此被跳过的步骤在 UI 中仍显示为灰色，
 * 与「完成」(绿色) 区分开。无活动工作流时返回 null。
 */
export function skipStep(stepIndex: number): WorkflowProgress | null {
  const progress = getWorkflowProgress();
  if (!progress) return null;
  const template = getWorkflowTemplate(progress.templateId);
  const maxStep = template ? template.steps.length : Infinity;
  // 推进当前步骤，但不越界
  progress.currentStep = Math.min(stepIndex + 1, maxStep);
  // 到达终点时记录完成时间（仅记录一次）
  if (progress.currentStep >= maxStep && !progress.endTime) {
    progress.endTime = Date.now();
  }
  saveProgress(progress);
  return progress;
}

/** 回退到上一步（仅移动指针，不改变已完成集合） */
export function goToStep(stepIndex: number): WorkflowProgress | null {
  const progress = getWorkflowProgress();
  if (!progress) return null;
  const template = getWorkflowTemplate(progress.templateId);
  const clamped = Math.max(
    0,
    Math.min(stepIndex, template ? template.steps.length - 1 : stepIndex)
  );
  progress.currentStep = clamped;
  saveProgress(progress);
  return progress;
}

/** 清除当前工作流进度（退出工作流） */
export function clearWorkflowProgress(): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(WORKFLOW_PROGRESS_KEY);
    window.localStorage.removeItem("wf_data_log");
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  } catch {
    // 忽略
  }
}

/** 当前工作流是否已全部完成（当前步越界且所有步骤均已完成） */
export function isWorkflowComplete(): boolean {
  const progress = getWorkflowProgress();
  if (!progress) return false;
  const template = getWorkflowTemplate(progress.templateId);
  if (!template) return false;
  return progress.completedSteps.length >= template.steps.length;
}

/* ============ 分享 / 接收 ============ */

/**
 * 生成工作流分享链接（URL 参数编码）。
 *
 * 将模板 id 编码到 `?wf=<templateId>` 中，指向工作流模板页。
 * 接收端通过 `receiveSharedWorkflow` 解析并可直接启动该模板。
 */
export function shareWorkflow(templateId: string): string {
  const template = getWorkflowTemplate(templateId);
  if (!template) return "";
  const origin = isClient()
    ? window.location.origin
    : "https://99gongju.online";
  const params = new URLSearchParams({ wf: templateId });
  return `${origin}/workflows?${params.toString()}`;
}

/**
 * 从 URL 参数接收分享的工作流。
 *
 * 读取 `?wf=<templateId>`，返回匹配的模板；无参数或不匹配时返回 null。
 */
export function receiveSharedWorkflow(): WorkflowTemplate | null {
  if (!isClient()) return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("wf");
    if (!templateId) return null;
    return getWorkflowTemplate(templateId) ?? null;
  } catch {
    return null;
  }
}
