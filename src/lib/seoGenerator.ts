/**
 * 智能 SEO 内容生成器
 *
 * 根据工具的元数据（名称、描述、分类、标签）自动生成高质量、唯一的 SEO 内容。
 * 生成内容涵盖：详细介绍、功能特点、使用场景、使用步骤、FAQ、关键词、
 * 相关工具、元描述、页面标题以及专业使用技巧（proTips）。
 *
 * 设计目标：
 * - 为任意工具生成专业、自然的中文 SEO 内容，无需逐个手写；
 * - 内容随工具的名称、描述、分类动态变化，避免千篇一律的模板感；
 * - 自然融入核心关键词「在线工具」「工具大全」「99在线工具」「免费」，不堆砌。
 */

import type { Tool } from "@/lib/tools";
import { getToolTags } from "@/lib/tools";
import type {
  ToolSEOContent,
  FAQItem,
  HowToStep,
} from "@/data/toolSeoContent";

// ============================================================
// 分类配置：为 14 个分类提供定制化的关键词、功能、场景、FAQ、技巧等
// ============================================================

interface CategoryConfig {
  /** 分类关键词（用于 keywords 字段） */
  keywords: string[];
  /** 分类专属功能特点 */
  features: string[];
  /** 分类专属使用场景 */
  useCases: string[];
  /** 分类专属 FAQ */
  faq: FAQItem;
  /** 分类专属专业技巧 */
  proTip: string;
  /** 形容词（用于详细介绍） */
  adj: string;
  /** 典型用户角色 */
  userRoles: [string, string];
  /** 输入物名词 */
  inputNoun: string;
  /** 结果物名词 */
  resultNoun: string;
  /** 动作动词 */
  actionVerb: string;
  /** 使用步骤：输入动作描述 */
  inputAction: string;
  /** 使用步骤：配置提示 */
  configHint: string;
  /** 使用步骤：结果动作描述 */
  resultAction: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  计算工具: {
    keywords: ["计算", "算数", "数值"],
    features: ["精确计算，结果实时呈现", "支持多种计算模式与参数"],
    useCases: [
      "日常工作与学习中的数值计算",
      "财务核算与预算评估",
      "快速验证手动计算结果",
      "数据分析与统计测算",
    ],
    faq: {
      question: "计算结果是否准确可靠？",
      answer:
        "我们的计算工具采用严谨的计算逻辑与公式，结果精准可靠，适用于工作、学习、生活等各类场景。",
    },
    proTip: "输入数值时请留意单位与小数位，确保口径一致，这样计算结果才更具参考价值。",
    adj: "精准高效",
    userRoles: ["财务人员", "普通用户"],
    inputNoun: "数值",
    resultNoun: "计算结果",
    actionVerb: "计算",
    inputAction: "输入需要计算的相关数值",
    configHint: "选择计算方式或参数",
    resultAction: "显示计算结果",
  },
  开发工具: {
    keywords: ["开发", "编程", "代码"],
    features: ["语法高亮，代码清晰可读", "支持格式化与压缩等多种处理"],
    useCases: [
      "日常开发中的代码格式化与校验",
      "接口数据的解析与调试",
      "编码转换与字符处理",
      "前端样式的快速生成与调试",
    ],
    faq: {
      question: "支持哪些编程语言或格式？",
      answer:
        "我们的开发工具覆盖 JSON、HTML、CSS、正则等常见开发场景，满足前端与后端开发者的日常需求。",
    },
    proTip: "处理大段代码前，建议先备份原始内容，并使用格式化功能统一缩进，便于后续比对与维护。",
    adj: "专业实用",
    userRoles: ["开发者", "程序员"],
    inputNoun: "代码",
    resultNoun: "处理结果",
    actionVerb: "处理",
    inputAction: "粘贴需要处理的代码或数据",
    configHint: "选择格式化或处理选项",
    resultAction: "输出处理后的代码",
  },
  文本工具: {
    keywords: ["文本", "字符串", "文字"],
    features: ["批量处理，效率倍增", "实时预览，所见即所得"],
    useCases: [
      "文本内容的格式整理与清洗",
      "字符串的提取、替换与转换",
      "文案排版与字数统计",
      "数据去重与排序处理",
    ],
    faq: {
      question: "支持处理多长的文本？",
      answer:
        "我们的文本工具在浏览器本地运行，可处理较长文本内容。为保证流畅体验，建议单次处理控制在合理体积内。",
    },
    proTip: "处理大批量文本时，可先用小段内容测试效果，确认规则无误后再处理完整数据，避免返工。",
    adj: "便捷智能",
    userRoles: ["编辑", "文案人员"],
    inputNoun: "文本",
    resultNoun: "处理结果",
    actionVerb: "处理",
    inputAction: "粘贴或输入需要处理的文本",
    configHint: "设置文本处理选项",
    resultAction: "输出处理后的文本",
  },
  图片工具: {
    keywords: ["图片", "照片", "图像"],
    features: ["本地处理，隐私不外泄", "支持批量上传与处理"],
    useCases: [
      "日常图片的压缩与格式转换",
      "图片裁剪、缩放与尺寸调整",
      "头像、配图的快速处理",
      "批量图片优化以适应网页加载",
    ],
    faq: {
      question: "处理后的图片画质会受损吗？",
      answer:
        "图片工具在处理时尽量保留原始画质，部分操作（如压缩）允许你自主调节质量参数，在体积与画质间灵活取舍。",
    },
    proTip: "处理图片前先裁剪到目标尺寸，既能缩短处理时间，又能避免不必要的数据冗余，效果更佳。",
    adj: "强大易用",
    userRoles: ["设计师", "自媒体从业者"],
    inputNoun: "图片",
    resultNoun: "图片结果",
    actionVerb: "处理",
    inputAction: "上传或拖拽需要处理的图片",
    configHint: "调整图片处理参数",
    resultAction: "生成处理后的图片",
  },
  PDF工具: {
    keywords: ["PDF", "文档", "文件"],
    features: ["高质量转换，保留原始格式", "支持多文件批量处理"],
    useCases: [
      "PDF 与其他格式的相互转换",
      "文档合并、拆分与页面调整",
      "电子文档的压缩与优化",
      "办公资料的整理与归档",
    ],
    faq: {
      question: "转换后会保留原文档的排版吗？",
      answer:
        "我们的 PDF 工具在转换时尽量保留原文档的字体、段落与排版结构，确保转换结果接近原始效果。",
    },
    proTip: "转换 PDF 前建议先检查原文档的字体与图片是否嵌入完整，可显著提升转换后的还原度。",
    adj: "专业可靠",
    userRoles: ["办公人员", "学生"],
    inputNoun: "PDF文件",
    resultNoun: "转换结果",
    actionVerb: "处理",
    inputAction: "上传需要处理的 PDF 文件",
    configHint: "设置转换或处理选项",
    resultAction: "输出处理结果",
  },
  视频音频工具: {
    keywords: ["视频", "音频", "媒体"],
    features: ["本地处理，文件不上传", "多格式支持，兼容性强"],
    useCases: [
      "视频剪辑、裁剪与格式转换",
      "音频提取、裁剪与音量调整",
      "短视频与配乐的快速处理",
      "媒体文件的压缩与优化",
    ],
    faq: {
      question: "处理大文件会卡顿吗？",
      answer:
        "工具在浏览器本地处理媒体文件，对于超大文件可能需要一定处理时间，建议在性能较好的设备上使用以获得更流畅体验。",
    },
    proTip: "处理长视频或大音频前，可先截取片段测试效果，确认参数合适后再处理完整文件，节省时间。",
    adj: "功能全面",
    userRoles: ["视频创作者", "音频爱好者"],
    inputNoun: "媒体文件",
    resultNoun: "处理结果",
    actionVerb: "处理",
    inputAction: "上传需要处理的媒体文件",
    configHint: "调整处理参数",
    resultAction: "输出处理后的媒体",
  },
  设计工具: {
    keywords: ["设计", "配色", "创意"],
    features: ["实时预览，效果一目了然", "一键复制，即拿即用"],
    useCases: [
      "网页与界面的配色方案生成",
      "渐变、阴影等样式代码制作",
      "Logo、图标与视觉元素设计",
      "创意灵感的快速可视化",
    ],
    faq: {
      question: "生成的设计方案可以商用吗？",
      answer:
        "可以。设计工具生成的配色、样式与方案均可免费用于个人及商业项目，不附带任何使用限制。",
    },
    proTip: "生成配色或样式后，建议在不同背景下预览效果，确保对比度与可读性满足实际使用场景。",
    adj: "创意灵活",
    userRoles: ["设计师", "创意工作者"],
    inputNoun: "参数",
    resultNoun: "设计方案",
    actionVerb: "生成",
    inputAction: "设置设计参数",
    configHint: "调整配色或样式选项",
    resultAction: "生成设计方案",
  },
  转换工具: {
    keywords: ["转换", "格式", "编码"],
    features: ["双向转换，灵活互转", "批量处理，提升效率"],
    useCases: [
      "不同编码与进制之间的转换",
      "数据格式的相互转换",
      "单位、时区等数值换算",
      "开发与办公中的格式适配",
    ],
    faq: {
      question: "转换过程会丢失数据吗？",
      answer:
        "我们的转换工具严格遵循各格式规范，正常情况下不会丢失数据。建议转换前备份原始内容，并在转换后核对结果。",
    },
    proTip: "转换前先确认源格式与目标格式的兼容性，并对特殊字符或结构进行测试，可有效避免转换异常。",
    adj: "快速准确",
    userRoles: ["开发者", "办公人员"],
    inputNoun: "数据",
    resultNoun: "转换结果",
    actionVerb: "转换",
    inputAction: "粘贴或上传需要转换的数据",
    configHint: "选择源格式和目标格式",
    resultAction: "输出转换结果",
  },
  生成工具: {
    keywords: ["生成", "创建", "制作"],
    features: ["一键生成，操作简单", "自定义参数，灵活配置"],
    useCases: [
      "二维码、密码等内容的快速生成",
      "测试数据与占位内容制作",
      "创意文案与名称的批量生成",
      "个性化资源的快速产出",
    ],
    faq: {
      question: "可以自定义生成参数吗？",
      answer:
        "可以。生成工具提供丰富的参数选项，你可以根据需求灵活配置，生成符合要求的内容。",
    },
    proTip: "生成内容前先明确使用场景与参数要求，多尝试几组配置对比效果，往往能获得更理想的结果。",
    adj: "智能高效",
    userRoles: ["运营人员", "创意工作者"],
    inputNoun: "参数",
    resultNoun: "生成内容",
    actionVerb: "生成",
    inputAction: "输入或选择生成参数",
    configHint: "自定义生成选项",
    resultAction: "生成所需内容",
  },
  查询工具: {
    keywords: ["查询", "搜索", "查找"],
    features: ["实时查询，响应迅速", "数据准确，覆盖全面"],
    useCases: [
      "快速查询所需的各类信息",
      "代码、字符、编码的检索",
      "知识点与参考资料查阅",
      "日常信息的快速核实",
    ],
    faq: {
      question: "查询数据是否及时更新？",
      answer:
        "我们的查询工具内置了准确全面的数据集，并会定期维护更新，确保查询结果可靠、有效。",
    },
    proTip: "查询时尽量使用精准的关键词，能显著提升检索效率与结果的相关性，减少筛选时间。",
    adj: "准确便捷",
    userRoles: ["学生", "研究人员"],
    inputNoun: "查询内容",
    resultNoun: "查询结果",
    actionVerb: "查询",
    inputAction: "输入需要查询的内容",
    configHint: "设置查询条件",
    resultAction: "显示查询结果",
  },
  教育工具: {
    keywords: ["学习", "教育", "知识"],
    features: ["互动学习，寓教于乐", "详细解析，便于理解"],
    useCases: [
      "知识点的学习与巩固",
      "练习与自测检验学习成果",
      "参考资料与示例查阅",
      "趣味学习提升兴趣",
    ],
    faq: {
      question: "适合什么人群使用？",
      answer:
        "教育工具适合学生、教师及所有希望提升知识水平的学习者，内容由浅入深，便于不同阶段用户使用。",
    },
    proTip: "学习时建议结合示例与练习同步进行，动手实践能加深理解，记忆效果远胜于单纯阅读。",
    adj: "寓教于乐",
    userRoles: ["学生", "教师"],
    inputNoun: "学习内容",
    resultNoun: "学习结果",
    actionVerb: "学习",
    inputAction: "输入或选择学习内容",
    configHint: "选择学习模式或难度",
    resultAction: "展示学习结果",
  },
  财务工具: {
    keywords: ["财务", "理财", "金融"],
    features: ["精确计算，专业公式", "参数灵活，场景适配"],
    useCases: [
      "贷款月供与利息核算",
      "投资收益与回报率测算",
      "个税、社保等薪资计算",
      "理财规划与收支预算",
    ],
    faq: {
      question: "财务计算结果能作为正式依据吗？",
      answer:
        "财务工具的计算结果仅供参考，帮助你快速估算。涉及正式财务决策时，建议以专业机构或官方渠道的核算为准。",
    },
    proTip: "进行财务测算时，建议设置不同的利率与期限组合进行对比，全面评估方案优劣后再做决策。",
    adj: "专业精准",
    userRoles: ["理财者", "财务人员"],
    inputNoun: "财务数据",
    resultNoun: "计算结果",
    actionVerb: "计算",
    inputAction: "输入相关财务数据",
    configHint: "设置计算参数",
    resultAction: "显示财务计算结果",
  },
  健康工具: {
    keywords: ["健康", "医疗", "身体"],
    features: ["科学计算，参考标准", "指标清晰，便于解读"],
    useCases: [
      "BMI、体脂等健康指标评估",
      "每日热量与营养需求计算",
      "运动数据与健康监测",
      "健康习惯的追踪与管理",
    ],
    faq: {
      question: "健康指标计算结果能替代医生诊断吗？",
      answer:
        "不能。健康工具提供的结果仅作日常参考，不能替代专业医疗诊断。如有健康问题，请及时咨询专业医生。",
    },
    proTip: "记录健康指标时建议固定测量时间与条件（如晨起空腹），长期坚持可获得更具参考价值的趋势数据。",
    adj: "科学实用",
    userRoles: ["健康关注者", "健身爱好者"],
    inputNoun: "健康数据",
    resultNoun: "健康指标",
    actionVerb: "计算",
    inputAction: "输入相关健康数据",
    configHint: "选择参考标准",
    resultAction: "计算健康指标",
  },
  生活工具: {
    keywords: ["生活", "日常", "实用"],
    features: ["简单易用，上手零门槛", "快速出结果，即查即用"],
    useCases: [
      "日常生活的快速计算与查询",
      "时间、日期与单位换算",
      "生活规划与提醒管理",
      "趣味工具与实用小帮手",
    ],
    faq: {
      question: "生活工具需要安装吗？",
      answer:
        "不需要。所有生活工具都是网页版在线工具，打开浏览器即可使用，无需下载安装任何软件。",
    },
    proTip: "将常用的生活工具添加到浏览器书签，下次使用时一键直达，日常效率提升明显。",
    adj: "简单实用",
    userRoles: ["普通用户", "家庭用户"],
    inputNoun: "信息",
    resultNoun: "结果",
    actionVerb: "处理",
    inputAction: "输入相关信息",
    configHint: "调整相关选项",
    resultAction: "显示处理结果",
  },
};

/** 获取分类配置，未知分类回退到「生活工具」 */
function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG["生活工具"];
}

// ============================================================
// 描述解析：从工具描述中提取分段、能力短语、衍生功能/场景/FAQ/技巧/关键词
// ============================================================

interface DescriptionDerived {
  segments: string[];
  primary: string;
  features: string[];
  useCases: string[];
  faq: FAQItem;
  proTip: string;
  capabilityPhrase: string;
  extraClause: string;
  keywords: string[];
}

/** 将描述按中英文标点切分为有意义的片段 */
function splitDescription(description: string): string[] {
  return description
    .split(/[，,。、；;\/\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** 根据描述内容衍生功能特点 */
function deriveFeatures(description: string, toolName: string): string[] {
  const rules: { keys: string[]; feature: string }[] = [
    { keys: ["压缩"], feature: "高效压缩，显著减小体积" },
    { keys: ["转换", "换算"], feature: "多种格式互转，转换快速准确" },
    { keys: ["格式化", "美化"], feature: "一键格式化美化，结果清晰易读" },
    { keys: ["校验", "验证"], feature: "实时校验，自动定位错误位置" },
    { keys: ["批量"], feature: "支持批量处理，效率倍增" },
    { keys: ["生成", "创建", "制作"], feature: "一键生成，参数灵活自定义" },
    { keys: ["加密", "解密"], feature: "支持加密解密，保障数据安全" },
    { keys: ["编码", "解码"], feature: "支持编解码，双向操作" },
    { keys: ["查询", "搜索", "查找"], feature: "实时查询，数据准确全面" },
    { keys: ["预览"], feature: "实时预览，所见即所得" },
    { keys: ["下载", "导出"], feature: "支持下载导出，方便保存" },
    { keys: ["解析", "解析器"], feature: "智能解析，结构化展示" },
    { keys: ["对比", "比较"], feature: "支持对比分析，差异一目了然" },
    { keys: ["裁剪", "切割", "分割"], feature: "精准裁剪分割，操作灵活" },
    { keys: ["合并", "拼接"], feature: "支持合并拼接，一键完成" },
    { keys: ["旋转", "翻转"], feature: "支持旋转翻转，自由调整" },
    { keys: ["滤镜", "特效"], feature: "多种滤镜特效，一键应用" },
    { keys: ["计算", "计算器"], feature: "实时计算，结果精准无误" },
  ];
  const matched: string[] = [];
  for (const rule of rules) {
    if (rule.keys.some((k) => description.includes(k) || toolName.includes(k))) {
      matched.push(rule.feature);
    }
  }
  return matched;
}

/** 根据描述内容衍生使用场景 */
function deriveUseCases(description: string, toolName: string): string[] {
  const rules: { keys: string[]; useCase: string }[] = [
    { keys: ["压缩"], useCase: "减小文件体积以便于传输与存储" },
    { keys: ["转换", "换算"], useCase: "不同格式与单位之间的快速转换" },
    { keys: ["格式化", "美化"], useCase: "将杂乱数据整理为规范格式" },
    { keys: ["计算", "计算器"], useCase: "日常数值计算与数据核算" },
    { keys: ["生成", "创建", "制作"], useCase: "快速生成所需内容用于工作" },
    { keys: ["查询", "搜索", "查找"], useCase: "快速查询所需的各类信息" },
    { keys: ["加密", "编码", "解码"], useCase: "敏感信息的加密与编码处理" },
    { keys: ["图片", "图像", "照片"], useCase: "图片编辑处理与优化" },
    { keys: ["视频"], useCase: "视频剪辑与后期处理" },
    { keys: ["音频", "音乐", "声音"], useCase: "音频编辑与格式处理" },
    { keys: ["日期", "时间"], useCase: "日期与时间的计算与查询" },
    { keys: ["颜色", "色彩", "配色"], useCase: "配色方案的设计与选取" },
  ];
  const matched: string[] = [];
  for (const rule of rules) {
    if (rule.keys.some((k) => description.includes(k) || toolName.includes(k))) {
      matched.push(rule.useCase);
    }
  }
  return matched;
}

/** 根据描述内容衍生一条工具专属 FAQ */
function deriveFaq(tool: Tool): FAQItem {
  const { name, description } = tool;
  const rules: { keys: string[]; q: string; a: string }[] = [
    {
      keys: ["压缩"],
      q: `${name}的压缩效果如何？`,
      a: `${name}采用高效算法，在保证质量的前提下尽可能减小体积，你可以根据需要调整压缩级别，灵活平衡质量与大小。`,
    },
    {
      keys: ["转换", "换算"],
      q: `${name}支持哪些格式？`,
      a: `${name}支持多种常见格式的相互转换，覆盖大多数日常使用场景，转换过程快速且结果准确。`,
    },
    {
      keys: ["格式化", "美化"],
      q: `${name}支持哪些格式化选项？`,
      a: `${name}提供多种格式化选项，你可以根据习惯自由选择，结果清晰易读，便于后续使用。`,
    },
    {
      keys: ["计算", "计算器"],
      q: `${name}的计算结果准确吗？`,
      a: `${name}采用精确的计算逻辑与公式，结果可靠准确，适合用于工作、学习等各类场景。`,
    },
    {
      keys: ["生成", "创建", "制作"],
      q: `${name}可以自定义生成参数吗？`,
      a: `可以的，${name}支持多种参数自定义，你可以根据需求灵活配置，生成符合要求的内容。`,
    },
    {
      keys: ["查询", "搜索", "查找"],
      q: `${name}的数据来源是什么？`,
      a: `${name}内置了准确全面的数据，查询结果实时呈现，帮助你快速获取所需信息。`,
    },
    {
      keys: ["图片", "图像", "照片"],
      q: `${name}支持哪些图片格式？`,
      a: `${name}支持 JPG、PNG、GIF、WEBP 等常见图片格式，满足大多数图片处理需求。`,
    },
  ];
  for (const rule of rules) {
    if (rule.keys.some((k) => description.includes(k) || name.includes(k))) {
      return { question: rule.q, answer: rule.a };
    }
  }
  return {
    question: `${name}使用起来复杂吗？`,
    answer: `${name}界面简洁、操作直观，只需简单几步即可完成操作，无需任何专业基础，新手也能轻松上手。`,
  };
}

/** 根据描述内容衍生一条工具专属使用技巧 */
function deriveProTip(tool: Tool): string {
  const { name, description } = tool;
  const rules: { keys: string[]; tip: string }[] = [
    {
      keys: ["压缩"],
      tip: `在 ${name} 中处理时，可先尝试中等参数，在质量与体积之间取得平衡，避免过度压缩导致质量损失。`,
    },
    {
      keys: ["转换", "换算"],
      tip: `使用 ${name} 转换前，建议先备份原始数据，并确认目标格式兼容性，避免转换后信息丢失。`,
    },
    {
      keys: ["格式化", "美化"],
      tip: `在 ${name} 中，可先粘贴小段数据测试格式化效果，确认无误后再批量处理完整内容。`,
    },
    {
      keys: ["计算", "计算器"],
      tip: `使用 ${name} 计算时，建议先核对输入数值是否在合理范围内，避免因误输入导致结果出现明显偏差。`,
    },
    {
      keys: ["生成", "创建", "制作"],
      tip: `使用 ${name} 生成内容时，建议先明确需求并预设参数，多尝试几组配置以获得最佳效果。`,
    },
    {
      keys: ["图片", "图像", "照片"],
      tip: `在 ${name} 中处理图片前，建议先裁剪到所需尺寸，可减少处理时间并提升最终效果。`,
    },
    {
      keys: ["查询", "搜索", "查找"],
      tip: `使用 ${name} 查询时，尽量使用精准的关键词或完整字段，能显著提升检索的相关性与效率。`,
    },
  ];
  for (const rule of rules) {
    if (rule.keys.some((k) => description.includes(k) || name.includes(k))) {
      return rule.tip;
    }
  }
  return `使用 ${name} 时，建议先熟悉各参数选项的含义，合理配置可以获得更好的处理效果。`;
}

/** 根据描述衍生能力短语（用于详细介绍第二段） */
function deriveCapabilityPhrase(description: string, toolName: string): string {
  const rules: { keys: string[]; phrase: string }[] = [
    { keys: ["压缩"], phrase: "压缩率高、处理速度快" },
    { keys: ["转换", "换算"], phrase: "转换快速准确、格式兼容性强" },
    { keys: ["格式化", "美化"], phrase: "格式化规范、结果清晰易读" },
    { keys: ["计算", "计算器"], phrase: "计算精准、结果可靠" },
    { keys: ["生成", "创建", "制作"], phrase: "生成迅速、参数灵活" },
    { keys: ["查询", "搜索", "查找"], phrase: "查询便捷、数据准确" },
    { keys: ["加密", "解密", "编码", "解码"], phrase: "处理安全、双向支持" },
    { keys: ["裁剪", "切割", "分割"], phrase: "操作精准、灵活可控" },
    { keys: ["合并", "拼接"], phrase: "合并高效、一键完成" },
    { keys: ["校验", "验证"], phrase: "校验实时、错误定位精准" },
    { keys: ["预览"], phrase: "实时预览、所见即所得" },
    { keys: ["图片", "图像", "照片"], phrase: "处理高效、画质有保障" },
    { keys: ["视频", "音频"], phrase: "处理流畅、多格式支持" },
  ];
  for (const rule of rules) {
    if (rule.keys.some((k) => description.includes(k) || toolName.includes(k))) {
      return rule.phrase;
    }
  }
  return "功能完善、性能稳定";
}

/** 从描述中提取关键词片段 */
function deriveKeywords(description: string): string[] {
  return splitDescription(description)
    .filter((s) => s.length >= 2 && s.length <= 8)
    .slice(0, 4);
}

/** 解析工具描述，汇总所有衍生内容 */
function parseDescription(tool: Tool): DescriptionDerived {
  const segments = splitDescription(tool.description);
  const primary = segments[0] || tool.description;
  const features = deriveFeatures(tool.description, tool.name);
  const useCases = deriveUseCases(tool.description, tool.name);
  const faq = deriveFaq(tool);
  const proTip = deriveProTip(tool);
  const capabilityPhrase = deriveCapabilityPhrase(tool.description, tool.name);
  const extraClause = features.length > 0 ? `${features[0]}，` : "";
  const keywords = deriveKeywords(tool.description);
  return {
    segments,
    primary,
    features,
    useCases,
    faq,
    proTip,
    capabilityPhrase,
    extraClause,
    keywords,
  };
}

// ============================================================
// 通用工具函数
// ============================================================

/** 数组去重（保留顺序，浅比较） */
function unique<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const result: T[] = [];
  for (const item of arr) {
    if (!seen.has(item)) {
      seen.add(item);
      result.push(item);
    }
  }
  return result;
}

/**
 * 构造「在线{工具名}工具」形式，避免工具名以「工具」结尾时出现「工具工具」重复。
 * 例如「图片压缩工具」→「在线图片压缩工具」（而非「在线图片压缩工具工具」）。
 */
function onlineToolName(name: string): string {
  return name.endsWith("工具") ? `在线${name}` : `在线${name}工具`;
}

/** 将元描述控制在 120-160 字符之间 */
function clampMetaDescription(desc: string): string {
  const padPhrases = [
    "，操作简单，新手也能快速上手",
    "，结果精准可靠",
    "，是日常办公学习的好帮手",
  ];
  let result = desc;
  let i = 0;
  while (result.length < 120 && i < padPhrases.length) {
    result = result.replace(/。$/, padPhrases[i] + "。");
    i++;
  }
  if (result.length > 160) {
    result = result.slice(0, 157) + "...";
  }
  return result;
}

/** 查找相关工具：优先同分类，不足时按标签匹配补充 */
function findRelatedTools(tool: Tool, allTools: Tool[]): string[] {
  const sameCategory = allTools.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  );

  if (sameCategory.length >= 6) {
    return sameCategory.slice(0, 6).map((t) => t.id);
  }

  // 同分类不足 6 个，按标签匹配补充
  const sourceTags = getToolTags(tool);
  const tagMatches = allTools.filter((t) => {
    if (t.id === tool.id || t.category === tool.category) return false;
    const targetTags = getToolTags(t);
    return targetTags.some((tag) => sourceTags.includes(tag));
  });

  const combined = [...sameCategory, ...tagMatches];
  if (combined.length < 6) {
    // 仍不足，用其他分类工具补齐
    const others = allTools.filter(
      (t) => t.id !== tool.id && !combined.some((c) => c.id === t.id)
    );
    combined.push(...others);
  }

  return combined.slice(0, 6).map((t) => t.id);
}

// ============================================================
// 各字段生成函数
// ============================================================

/** 生成页面标题 */
function generatePageTitle(tool: Tool): string {
  return `${tool.name} - ${onlineToolName(tool.name)} | 99在线工具`;
}

/** 生成元描述（120-160 字符，含工具名/在线工具/免费/99在线工具） */
function generateMetaDescription(tool: Tool, derived: DescriptionDerived): string {
  const base = `免费${onlineToolName(tool.name)}，${derived.primary}。作为99在线工具大全中${tool.category}分类的实用工具，它完全在浏览器本地运行，数据不上传服务器，保护您的隐私安全。${tool.name}完全免费、无需注册登录，打开网页即可使用，安全高效。`;
  return clampMetaDescription(base);
}

/** 生成详细介绍（3 段，300-500 字） */
function generateDetailedDescription(
  tool: Tool,
  cfg: CategoryConfig,
  derived: DescriptionDerived
): string {
  // 第一段：介绍工具是什么、能做什么、所属分类与平台
  const p1 = `${tool.name}是一款${cfg.adj}的${tool.category}，${derived.primary}。作为99在线工具平台精心打造的实用在线工具，它专为${cfg.userRoles[0]}与${cfg.userRoles[1]}设计，帮助你高效完成相关任务。${
    derived.segments.length > 1 ? derived.segments.slice(1, 3).join("，") + "。" : ""
  }无论你是初次接触还是高频使用，这款${tool.name}都能提供流畅、可靠的体验。`;

  // 第二段：为什么有用、核心能力、工具大全定位
  const p2 = `这款${tool.name}之所以成为众多用户的选择，在于它${derived.capabilityPhrase}。在99在线工具大全的${tool.category}分类中，它以简洁直观的界面和清晰的操作流程脱颖而出，即便是初次使用也能快速上手。${derived.extraClause}工具还支持多种参数配置，能够灵活满足不同场景下的个性化需求，让每一次处理都更贴合实际。`;

  // 第三段：隐私安全 + 与同类工具对比（更优/更快/免费）
  const p3 = `与许多需要上传数据或安装软件的同类工具不同，我们的${tool.name}完全在浏览器本地运行，所有${cfg.inputNoun}都在你的设备上处理，不会上传到任何服务器，从根本上保障了数据隐私与安全。它不仅完全免费、无需注册，而且加载迅速、处理高效，相比传统工具更加轻便快捷，是你在99在线工具中值得收藏的得力助手。`;

  return [p1, p2, p3].join("\n\n");
}

/** 生成功能特点（6-8 条） */
function generateFeatures(
  tool: Tool,
  cfg: CategoryConfig,
  derived: DescriptionDerived
): string[] {
  const universal = [
    "完全免费，无需注册",
    "浏览器本地运行，数据不上传",
  ];
  const combined = [
    ...universal,
    ...cfg.features,
    ...derived.features,
  ];
  // 兜底：若数量不足 6 条，补充通用能力描述
  const fallback = [
    "界面简洁，操作直观易上手",
    "响应迅速，处理高效",
    "支持一键复制或下载结果",
  ];
  let result = [...combined];
  let fi = 0;
  while (result.length < 6 && fi < fallback.length) {
    result.push(fallback[fi]);
    fi++;
  }
  return unique(result).slice(0, 8);
}

/** 生成使用场景（5-6 条） */
function generateUseCases(
  tool: Tool,
  cfg: CategoryConfig,
  derived: DescriptionDerived
): string[] {
  const combined = [...cfg.useCases, ...derived.useCases];
  const fallback = [
    `${tool.name}的日常使用与快速处理`,
    "工作、学习中的效率提升",
    "临时性任务的快速完成",
  ];
  let result = [...combined];
  let fi = 0;
  while (result.length < 5 && fi < fallback.length) {
    result.push(fallback[fi]);
    fi++;
  }
  return unique(result).slice(0, 6);
}

/** 生成使用步骤（4-5 步） */
function generateHowToSteps(tool: Tool, cfg: CategoryConfig): HowToStep[] {
  return [
    {
      step: `打开${tool.name}`,
      description: `进入99在线工具的${tool.name}页面，无需下载安装任何软件，打开浏览器即可直接开始使用。`,
    },
    {
      step: `输入或准备${cfg.inputNoun}`,
      description: `在工具的输入区域，${cfg.inputAction}。支持粘贴、上传等多种输入方式，操作灵活便捷。`,
    },
    {
      step: "配置参数选项",
      description: `根据需要调整相关参数和选项，${cfg.configHint}，以获得符合预期的处理结果。`,
    },
    {
      step: `执行并获取${cfg.resultNoun}`,
      description: `点击对应按钮执行操作，工具会立即在本地处理并${cfg.resultAction}，过程快速无需等待。`,
    },
    {
      step: "复制或下载结果",
      description: `处理完成后，你可以一键复制${cfg.resultNoun}到剪贴板，或下载保存到本地，方便后续使用与分享。`,
    },
  ];
}

/** 生成 FAQ（4-5 条） */
function generateFaqs(
  tool: Tool,
  cfg: CategoryConfig,
  derived: DescriptionDerived
): FAQItem[] {
  const universal: FAQItem[] = [
    {
      question: `这个${tool.name}是免费的吗？`,
      answer: `是的，我们的${tool.name}完全免费，没有任何使用限制，也无需付费解锁高级功能，你可以随时无限次使用。`,
    },
    {
      question: "需要注册或登录吗？",
      answer: `不需要。${tool.name}是一款即开即用的在线工具，无需注册账号，也无需登录，打开网页即可直接使用。`,
    },
    {
      question: "我的数据安全吗？",
      answer: `非常安全。${tool.name}完全在浏览器本地运行，所有${cfg.inputNoun}都在你的设备上处理，不会上传到任何服务器，你可以放心处理敏感数据。`,
    },
    cfg.faq,
    derived.faq,
  ];
  return unique(universal).slice(0, 5);
}

/** 生成关键词（8-12 个） */
function generateKeywords(
  tool: Tool,
  cfg: CategoryConfig,
  derived: DescriptionDerived
): string[] {
  const core = [
    tool.name,
    "在线工具",
    "工具大全",
    "免费工具",
    "99在线工具",
    tool.category,
    ...cfg.keywords,
    ...derived.keywords,
  ];
  // 加入工具名 + 分类 的组合关键词
  core.push(`${tool.name}在线`, `${tool.category}在线`);
  return unique(core).slice(0, 12);
}

/** 生成专业使用技巧（4-5 条） */
function generateProTips(
  tool: Tool,
  cfg: CategoryConfig,
  derived: DescriptionDerived
): string[] {
  const tips = [
    cfg.proTip,
    derived.proTip,
    `使用 ${tool.name} 时，建议先处理小批量数据验证效果，确认无误后再处理完整内容，避免返工。`,
    `善用键盘快捷键（如 Ctrl/Cmd+C 复制、Ctrl/Cmd+V 粘贴）可以显著提升在 ${tool.name} 中的操作效率。`,
    `由于 ${tool.name} 在浏览器本地运行，处理完成后请及时复制或下载结果，避免因刷新页面导致数据丢失。`,
  ];
  return unique(tips).slice(0, 5);
}

// ============================================================
// 主生成函数
// ============================================================

/**
 * 根据单个工具的元数据自动生成完整的 SEO 内容。
 *
 * @param tool 目标工具
 * @param allTools 全部工具列表（用于查找相关工具）
 * @returns 该工具的完整 SEO 内容
 */
export function generateSeoContent(
  tool: Tool,
  allTools: Tool[]
): ToolSEOContent {
  const cfg = getCategoryConfig(tool.category);
  const derived = parseDescription(tool);

  return {
    toolId: tool.id,
    detailedDescription: generateDetailedDescription(tool, cfg, derived),
    features: generateFeatures(tool, cfg, derived),
    useCases: generateUseCases(tool, cfg, derived),
    howToSteps: generateHowToSteps(tool, cfg),
    faqs: generateFaqs(tool, cfg, derived),
    keywords: generateKeywords(tool, cfg, derived),
    relatedTools: findRelatedTools(tool, allTools),
    metaDescription: generateMetaDescription(tool, derived),
    pageTitle: generatePageTitle(tool),
    proTips: generateProTips(tool, cfg, derived),
  };
}

/**
 * 批量为所有工具生成 SEO 内容。
 *
 * @param allTools 全部工具列表
 * @returns 以 toolId 为键的 SEO 内容映射，便于快速查找
 */
export function generateSeoContentForAll(
  allTools: Tool[]
): Record<string, ToolSEOContent> {
  const result: Record<string, ToolSEOContent> = {};
  for (const tool of allTools) {
    result[tool.id] = generateSeoContent(tool, allTools);
  }
  return result;
}
