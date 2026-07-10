import {
  Sparkles,
  Code2,
  LayoutDashboard,
  BarChart3,
  Palette,
  FileText,
  Zap,
  Shield,
  Mail,
  Award,
  Clock,
  Star,
  Users,
  TrendingUp,
  Target,
  Rocket,
  Gift,
  Grid3X3,
  PlayCircle,
  Briefcase,
  Megaphone,
  Wrench,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

export interface ProductHighlight {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ProductContent {
  title: string;
  description: string;
  items: string[];
}

export interface ProductReview {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  product?: string;
}

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  price: number;
  originalPrice: number;
  category: string;
  description: string;
  longDescription: string;
  features: string[];
  highlights: ProductHighlight[];
  contents: ProductContent[];
  reviews: ProductReview[];
  faqs: ProductFAQ[];
  badge: string;
  icon: LucideIcon;
  gradient: string;
  salesCount: number;
  rating: number;
  updateFrequency: string;
  deliveryMethod: string;
  suitableFor: string[];
  relatedProducts: string[];
}

export const products: Product[] = [
  {
    id: "ai-prompt-pack",
    name: "AI高效写作提示词包",
    shortName: "AI提示词包",
    price: 29,
    originalPrice: 99,
    category: "AI工具",
    description:
      "精选100+个高质量AI提示词，涵盖写作、编程、设计、营销等场景，让AI效率提升10倍",
    longDescription:
      "这套AI提示词包是我们团队历时3个月精心打磨的成果。我们从实际工作场景出发，整理了100+个经过验证的高质量提示词，覆盖日常工作中80%以上的AI使用场景。无论你是职场新人还是资深专家，都能从中找到提升效率的利器。所有提示词均经过反复测试和优化，确保输出质量稳定可靠。",
    features: [
      "100+精选提示词",
      "持续免费更新",
      "终身使用授权",
      "附赠详细使用指南",
    ],
    highlights: [
      {
        icon: Zap,
        title: "效率倍增",
        description: "告别反复试错，直接套用成熟提示词，效率提升10倍",
      },
      {
        icon: Target,
        title: "场景全覆盖",
        description: "写作、编程、设计、营销、学习等10+场景全覆盖",
      },
      {
        icon: Rocket,
        title: "即拿即用",
        description: "分类清晰，一键复制，开箱即用，无需学习成本",
      },
      {
        icon: RefreshCw,
        title: "品质保证",
        description: "精心打磨，每一条都经过实测验证",
      },
    ],
    contents: [
      {
        title: "写作类提示词（30+）",
        description: "涵盖文章、邮件、文案、报告等各类写作场景",
        items: [
          "公众号爆款文章生成",
          "商务邮件撰写（中英双语）",
          "小红书种草文案",
          "产品介绍文案",
          "工作总结与汇报",
          "演讲稿撰写",
          "论文大纲与润色",
          "小说创意写作",
        ],
      },
      {
        title: "编程类提示词（25+）",
        description: "覆盖代码生成、调试、重构等开发全流程",
        items: [
          "代码生成与解释",
          "Bug定位与修复",
          "代码重构优化",
          "单元测试编写",
          "API文档生成",
          "正则表达式生成",
          "数据库查询优化",
          "架构设计建议",
        ],
      },
      {
        title: "设计与创意类（20+）",
        description: "激发创意灵感，提升设计效率",
        items: [
          "Midjourney绘画提示词",
          "Logo设计思路",
          "配色方案生成",
          "海报创意构思",
          "UI/UX设计建议",
          "品牌命名与slogan",
        ],
      },
      {
        title: "营销与运营类（15+）",
        description: "助力营销推广，提升运营效率",
        items: [
          "社交媒体运营方案",
          "活动策划思路",
          "用户增长策略",
          "竞品分析报告",
          "数据洞察分析",
        ],
      },
      {
        title: "学习与成长类（10+）",
        description: "用AI加速学习，提升认知效率",
        items: [
          "知识点总结归纳",
          "学习计划制定",
          "面试准备指导",
          "外语学习助手",
        ],
      },
    ],
    reviews: [
      {
        id: "r1",
        name: "张小明",
        avatar: "张",
        rating: 5,
        date: "2024-03-15",
        content:
          "真的太实用了！以前写提示词总是写不好，AI输出的结果差强人意。用了这个提示词包之后，输出质量直接提升一个档次，工作效率翻倍。特别是写邮件和文案的提示词，简直是职场神器！",
        product: "AI提示词包",
      },
      {
        id: "r2",
        name: "李工程师",
        avatar: "李",
        rating: 5,
        date: "2024-03-10",
        content:
          "作为一名程序员，编程类的提示词对我帮助特别大。代码生成、调试、重构都能用，省下了很多查文档的时间。而且还在持续更新，性价比超高！",
        product: "AI提示词包",
      },
      {
        id: "r3",
        name: "王设计师",
        avatar: "王",
        rating: 5,
        date: "2024-03-05",
        content:
          "Midjourney的提示词太给力了，生成的图质量明显提升。还有配色和创意类的提示词，给我很多灵感。29块钱真的是白菜价，强烈推荐！",
        product: "AI提示词包",
      },
      {
        id: "r4",
        name: "陈运营",
        avatar: "陈",
        rating: 4,
        date: "2024-02-28",
        content:
          "营销类的提示词写文案特别好用，小红书和公众号的内容产出速度快了很多。希望后续能多更新一些短视频脚本相关的提示词。",
        product: "AI提示词包",
      },
    ],
    faqs: [
      {
        question: "购买后如何获取提示词？",
        answer:
          "付款成功后，您将立即收到包含所有提示词的PDF文档和在线文档链接。支持在线浏览和复制，也可以下载保存到本地。",
      },
      {
        question: "提示词适用于哪些AI工具？",
        answer:
          "大部分提示词适用于ChatGPT、Claude、文心一言、通义千问等主流大语言模型。Midjourney提示词专用于AI绘画。我们会标注每个提示词的适用场景。",
      },
      {
        question: "购买后怎么获取？",
        answer:
          "付款后通过百度网盘发货，链接永久有效，随时下载。",
      },
      {
        question: "可以退款吗？",
        answer:
          "支持7天无理由退款。如果您觉得产品不符合预期，请在购买后7天内联系客服办理退款，我们会全额退还。",
      },
      {
        question: "适合新手使用吗？",
        answer:
          "完全适合！我们每个提示词都配有使用说明和示例输出，新手也能快速上手。还有入门指南帮助您快速掌握AI使用技巧。",
      },
    ],
    badge: "热销",
    icon: Sparkles,
    gradient: "from-indigo-500 to-purple-600",
    salesCount: 3256,
    rating: 4.9,
    updateFrequency: "每月更新",
    deliveryMethod: "在线文档 + PDF",
    suitableFor: ["职场人士", "程序员", "设计师", "运营人员", "学生"],
    relatedProducts: ["notion-templates", "developer-toolkit", "seo-checklist"],
  },
  {
    id: "developer-toolkit",
    name: "全栈开发者工具包",
    shortName: "开发者工具包",
    price: 49,
    originalPrice: 199,
    category: "开发",
    description:
      "精选50+款开发者效率工具，包含VS Code插件、Chrome扩展、命令行工具等",
    longDescription:
      "这是一套为全栈开发者量身打造的效率工具箱。我们从数百款开发工具中精挑细选出最实用的50+款，涵盖前端、后端、数据库、DevOps等各个领域。每款工具都附带详细的配置指南和使用技巧，让你快速上手，事半功倍。",
    features: [
      "50+精选开发工具",
      "分类整理清晰",
      "品质保证",
      "附赠配置文件合集",
    ],
    highlights: [
      {
        icon: Zap,
        title: "效率翻倍",
        description: "精选50+款顶级开发工具，让你的编码效率翻倍",
      },
      {
        icon: Code2,
        title: "全栈覆盖",
        description: "前端、后端、数据库、DevOps全栈工具一网打尽",
      },
      {
        icon: Award,
        title: "精选品质",
        description: "每款工具都经过实际项目验证，确保稳定好用",
      },
      {
        icon: Gift,
        title: "附赠配置",
        description: "附赠VS Code、终端等配置文件，开箱即用",
      },
    ],
    contents: [
      {
        title: "VS Code 插件合集（15+）",
        description: "精选最实用的VS Code插件，提升编码效率",
        items: [
          "代码补全与AI辅助插件",
          "代码格式化与Lint工具",
          "Git版本控制增强",
          "调试工具合集",
          "主题与界面美化",
          "快捷键增强插件",
          "数据库管理插件",
          "API测试插件",
        ],
      },
      {
        title: "Chrome 开发者扩展（10+）",
        description: "前端开发与调试必备的Chrome扩展",
        items: [
          "React/Vue DevTools",
          "API调试工具",
          "性能分析扩展",
          "CSS调试神器",
          "Cookie与Storage管理",
          "颜色取色器",
        ],
      },
      {
        title: "命令行工具（12+）",
        description: "提升终端效率的命令行工具",
        items: [
          "文件搜索与管理",
          "Git增强工具",
          "HTTP请求工具",
          "JSON处理工具",
          "系统监控工具",
          "终端美化与多窗口",
        ],
      },
      {
        title: "数据库工具（8+）",
        description: "数据库开发与管理工具",
        items: [
          "数据库可视化客户端",
          "SQL格式化工具",
          "数据迁移工具",
          "性能监控工具",
        ],
      },
      {
        title: "配置文件合集",
        description: "精心调校的配置文件，开箱即用",
        items: [
          "VS Code settings.json",
          ".prettierrc 配置",
          ".eslintrc 配置",
          "Git .gitconfig",
          "终端主题配色",
        ],
      },
    ],
    reviews: [
      {
        id: "r5",
        name: "刘前端",
        avatar: "刘",
        rating: 5,
        date: "2024-03-12",
        content:
          "VS Code插件合集太香了！省下了我自己一个个找插件的时间，而且配置文件直接导入就能用，开发体验提升不止一个档次。",
        product: "开发者工具包",
      },
      {
        id: "r6",
        name: "赵后端",
        avatar: "赵",
        rating: 5,
        date: "2024-03-08",
        content:
          "命令行工具合集很实用，特别是fzf和zoxide，用了之后终端操作速度快了很多。数据库工具也很全面，推荐后端同学购买。",
        product: "开发者工具包",
      },
      {
        id: "r7",
        name: "孙全栈",
        avatar: "孙",
        rating: 5,
        date: "2024-03-01",
        content:
          "作为全栈开发者，这个工具包对我来说简直是量身定制。从前端到后端，从数据库到DevOps，工具都很实用。配置文件也很贴心，直接用就行。",
        product: "开发者工具包",
      },
    ],
    faqs: [
      {
        question: "工具都是免费的吗？",
        answer:
          "大部分工具是免费开源的，少数是商业软件的免费版或个人版。我们会标注每款工具的授权类型和价格。",
      },
      {
        question: "适用于什么操作系统？",
        answer:
          "大部分工具支持Windows、macOS和Linux三大平台。少数工具可能只支持特定系统，我们会在文档中明确标注。",
      },
      {
        question: "配置文件如何使用？",
        answer:
          "配置文件都有详细的安装说明，一般直接复制到对应目录即可使用。VS Code配置还支持通过Settings Sync同步。",
      },
      {
        question: "可以退款吗？",
        answer: "支持7天无理由退款。购买后7天内如有任何不满意，联系客服即可全额退款。",
      },
    ],
    badge: "推荐",
    icon: Code2,
    gradient: "from-blue-500 to-cyan-500",
    salesCount: 1823,
    rating: 4.8,
    updateFrequency: "每季度更新",
    deliveryMethod: "在线文档 + 配置文件包",
    suitableFor: ["前端开发者", "后端开发者", "全栈工程师", "DevOps工程师", "学生"],
    relatedProducts: ["ai-prompt-pack", "seo-checklist", "color-palette"],
  },
  {
    id: "notion-templates",
    name: "Notion高效管理模板合集",
    shortName: "Notion模板合集",
    price: 39,
    originalPrice: 129,
    category: "效率",
    description:
      "20+个精心设计的Notion模板，涵盖项目管理、读书笔记、财务管理、人生规划等",
    longDescription:
      "这套Notion模板合集是我们团队两年多Notion深度使用经验的结晶。每个模板都经过反复打磨和实际使用验证，确保美观与实用并存。无论你是Notion新手还是老玩家，都能从中找到提升效率的模板。",
    features: ["20+精美模板", "开箱即用", "视频教程", "终身更新"],
    highlights: [
      {
        icon: LayoutDashboard,
        title: "精美设计",
        description: "每个模板都经过精心设计，美观大气，赏心悦目",
      },
      {
        icon: Zap,
        title: "开箱即用",
        description: "一键复制到自己的Notion工作区，立即开始使用",
      },
      {
        icon: Target,
        title: "场景丰富",
        description: "工作、学习、生活全场景覆盖，20+模板任选",
      },
      {
        icon: PlayCircle,
        title: "视频教程",
        description: "每个模板都配有详细视频教程，新手也能快速上手",
      },
    ],
    contents: [
      {
        title: "工作效率类（8个）",
        description: "提升工作效率的必备模板",
        items: [
          "项目管理看板",
          "任务待办清单",
          "会议记录模板",
          "OKR目标管理",
          "周报/日报模板",
          "知识库管理系统",
          "客户关系管理",
          "时间追踪系统",
        ],
      },
      {
        title: "学习成长类（5个）",
        description: "助力学习与个人成长",
        items: [
          "读书笔记系统",
          "课程学习追踪",
          "单词记忆库",
          "面试准备系统",
          "技能树管理",
        ],
      },
      {
        title: "生活管理类（5个）",
        description: "生活中的方方面面都能管理",
        items: [
          "个人财务管理",
          "健身打卡追踪",
          "饮食记录管理",
          "旅行计划模板",
          "生日纪念日提醒",
        ],
      },
      {
        title: "人生规划类（3个）",
        description: "长期规划与自我提升",
        items: [
          "年度目标管理",
          "人生仪表盘",
          "习惯养成系统",
        ],
      },
    ],
    reviews: [
      {
        id: "r8",
        name: "周产品",
        avatar: "周",
        rating: 5,
        date: "2024-03-14",
        content:
          "项目管理看板和OKR模板太实用了！以前用Notion都是东拼西凑，现在有了这套模板，工作效率直接上了一个台阶。设计也很漂亮，每天打开都心情好。",
        product: "Notion模板",
      },
      {
        id: "r9",
        name: "吴学生",
        avatar: "吴",
        rating: 5,
        date: "2024-03-09",
        content:
          "读书笔记系统和课程学习追踪对学生党太友好了！学习效率提升很多，而且模板设计得特别好看，用着心情都好。视频教程也很详细，新手完全没问题。",
        product: "Notion模板",
      },
      {
        id: "r10",
        name: "郑自由职业",
        avatar: "郑",
        rating: 5,
        date: "2024-02-25",
        content:
          "作为自由职业者，财务管理和客户管理模板帮了我大忙。以前乱糟糟的，现在全部整理清楚了。人生仪表盘也很赞，能看到自己各方面的进度。",
        product: "Notion模板",
      },
    ],
    faqs: [
      {
        question: "如何获取模板？",
        answer:
          "购买后您会收到一个包含所有模板链接的文档。点击链接后选择'Duplicate'即可复制到您自己的Notion工作区。",
      },
      {
        question: "需要Notion付费版吗？",
        answer:
          "大部分模板在Notion免费版中即可正常使用。少数需要数据库关联功能的模板可能需要付费版，我们会在文档中标注。",
      },
      {
        question: "可以自定义修改吗？",
        answer:
          "当然可以！模板复制到您的工作区后，您可以随意修改和调整，完全按照自己的需求来定制。",
      },
      {
        question: "有使用教程吗？",
        answer:
          "每个模板都配有详细的文字说明和视频教程，教您如何使用和自定义模板。新手也能快速上手。",
      },
    ],
    badge: "新品",
    icon: LayoutDashboard,
    gradient: "from-emerald-500 to-teal-500",
    salesCount: 2145,
    rating: 4.9,
    updateFrequency: "每月更新",
    deliveryMethod: "在线文档 + 模板链接 + 视频教程",
    suitableFor: ["职场人士", "学生", "自由职业者", "创业者", "产品经理"],
    relatedProducts: ["ai-prompt-pack", "resume-template", "seo-checklist"],
  },
  {
    id: "seo-checklist",
    name: "网站SEO优化清单",
    shortName: "SEO优化清单",
    price: 19,
    originalPrice: 69,
    category: "运营",
    description:
      "从0到1的SEO优化完整清单，涵盖技术SEO、内容SEO、外链建设等全流程",
    longDescription:
      "这份SEO优化清单是我们多年网站运营经验的总结。从技术SEO到内容SEO，从关键词研究到外链建设，100+个检查项帮你系统地优化网站，快速提升搜索引擎排名。每个检查项都配有操作说明和工具推荐，新手也能照着做。",
    features: ["100+检查项", "实操指南", "案例分享", "即买即用"],
    highlights: [
      {
        icon: BarChart3,
        title: "系统全面",
        description: "100+检查项，覆盖SEO优化的方方面面",
      },
      {
        icon: Target,
        title: "实操导向",
        description: "每个检查项都有具体操作步骤，照着做就行",
      },
      {
        icon: Award,
        title: "经验总结",
        description: "来自多年实战经验的总结，避坑指南让你少走弯路",
      },
      {
        icon: TrendingUp,
        title: "效果显著",
        description: "按清单优化后，网站流量通常能提升30%-200%",
      },
    ],
    contents: [
      {
        title: "技术SEO（30+项）",
        description: "网站技术基础优化，让搜索引擎更好地抓取",
        items: [
          "网站速度优化检查",
          "移动端适配检查",
          "HTTPS配置检查",
          "站点结构优化",
          "XML Sitemap配置",
          "robots.txt配置",
          "结构化数据标记",
          "404页面优化",
          "Canonical标签设置",
        ],
      },
      {
        title: "内容SEO（25+项）",
        description: "内容优化，提升关键词排名和用户体验",
        items: [
          "关键词研究方法",
          "标题标签优化",
          "Meta描述优化",
          "H标签层级结构",
          "图片ALT优化",
          "内链建设策略",
          "内容质量评估",
          "长尾关键词布局",
        ],
      },
      {
        title: "外链建设（20+项）",
        description: "高质量外链建设策略，提升网站权重",
        items: [
          "竞争对手外链分析",
          "友情链接交换策略",
          "内容营销引流",
          "社交媒体外链",
          "行业目录提交",
          "外链质量评估",
        ],
      },
      {
        title: "本地SEO（15+项）",
        description: "本地商家SEO优化，吸引本地客户",
        items: [
          "Google Business配置",
          "本地关键词优化",
          "评价管理策略",
          "NAP一致性检查",
        ],
      },
      {
        title: "工具与资源",
        description: "SEO必备工具和学习资源",
        items: [
          "关键词研究工具",
          "网站分析工具",
          "排名追踪工具",
          "SEO学习资源",
        ],
      },
    ],
    reviews: [
      {
        id: "r11",
        name: "冯站长",
        avatar: "冯",
        rating: 5,
        date: "2024-03-11",
        content:
          "这份清单太系统了！以前做SEO都是东一榔头西一棒子，现在按照清单一项项来，思路清晰多了。网站流量两个月涨了80%，真值！",
        product: "SEO清单",
      },
      {
        id: "r12",
        name: "何运营",
        avatar: "何",
        rating: 5,
        date: "2024-03-06",
        content:
          "19块钱买这么全面的SEO清单，简直是白菜价。技术SEO部分特别详细，照着一步步做，网站从30多分优化到了90多分。",
        product: "SEO清单",
      },
      {
        id: "r13",
        name: "韩创业者",
        avatar: "韩",
        rating: 4,
        date: "2024-02-28",
        content:
          "作为创业小白，这份清单帮我省下了很多摸索的时间。内容SEO和外链建设部分很实用。希望后续能多更新一些最新的SEO策略。",
        product: "SEO清单",
      },
    ],
    faqs: [
      {
        question: "适合SEO新手吗？",
        answer:
          "非常适合！每个检查项都配有详细的操作说明和工具推荐，新手照着做就能完成网站优化。我们还提供了入门学习路径。",
      },
      {
        question: "适用于什么类型的网站？",
        answer:
          "适用于绝大多数类型的网站，包括企业官网、博客、电商网站、资讯站等。不同类型的网站有针对性的优化建议。",
      },
      {
        question: "多久能看到效果？",
        answer:
          "SEO是长期工作，一般优化后1-3个月能看到明显效果。技术SEO部分优化后，网站收录和抓取速度通常会在1-2周内改善。",
      },
      {
        question: "购买后怎么获取？",
        answer:
          "付款后通过百度网盘发货，链接永久有效，随时下载。",
      },
    ],
    badge: "",
    icon: BarChart3,
    gradient: "from-orange-500 to-red-500",
    salesCount: 1567,
    rating: 4.7,
    updateFrequency: "每季度更新",
    deliveryMethod: "在线文档 + PDF",
    suitableFor: ["网站站长", "运营人员", "创业者", "SEO新手", "自由职业者"],
    relatedProducts: ["ai-prompt-pack", "developer-toolkit", "notion-templates"],
  },
  {
    id: "color-palette",
    name: "设计师配色方案合集",
    shortName: "配色方案合集",
    price: 29,
    originalPrice: 99,
    category: "设计",
    description:
      "500+套精选配色方案，按风格分类，一键复制色值，设计师必备素材",
    longDescription:
      "这套配色方案合集收录了500+套经过精心挑选的配色方案，涵盖各种设计风格和应用场景。每套配色都经过色彩理论验证，确保视觉和谐。支持一键复制HEX/RGB色值，让你的设计工作事半功倍。",
    features: ["500+配色方案", "多种风格", "一键复制", "即买即用"],
    highlights: [
      {
        icon: Palette,
        title: "海量方案",
        description: "500+套精选配色，总有一款适合你的项目",
      },
      {
        icon: Sparkles,
        title: "风格多样",
        description: "20+种风格分类，从简约到复古，从商务到可爱",
      },
      {
        icon: Zap,
        title: "即用即取",
        description: "支持HEX/RGB一键复制，直接在设计软件中使用",
      },
      {
        icon: RefreshCw,
        title: "品质保证",
        description: "每月新增配色方案，紧跟设计潮流趋势",
      },
    ],
    contents: [
      {
        title: "商务科技风（80+套）",
        description: "适合企业官网、SaaS产品、科技项目",
        items: [
          "蓝色系商务配色",
          "紫色系科技配色",
          "渐变科技配色",
          "深色模式配色",
          "极简黑白配色",
        ],
      },
      {
        title: "自然清新风（70+套）",
        description: "适合环保、健康、生活类项目",
        items: [
          "绿色系自然配色",
          "莫兰迪色系",
          "马卡龙色系",
          "森系配色方案",
        ],
      },
      {
        title: "活力创意风（80+套）",
        description: "适合年轻、创意、娱乐类项目",
        items: [
          "霓虹渐变配色",
          "撞色活力配色",
          "复古怀旧配色",
          "波普艺术配色",
        ],
      },
      {
        title: "温暖治愈风（60+套）",
        description: "适合生活、美食、情感类项目",
        items: [
          "暖色系温馨配色",
          "奶油系配色",
          "日式简约配色",
          "焦糖色系配色",
        ],
      },
      {
        title: "节日主题配色（60+套）",
        description: "各大节日专属配色方案",
        items: [
          "春节红金配色",
          "圣诞红绿配色",
          "情人节粉色系",
          "万圣节配色",
          "夏日清凉配色",
        ],
      },
      {
        title: "品牌配色参考（50+套）",
        description: "知名品牌配色方案参考",
        items: [
          "互联网品牌配色",
          "奢侈品品牌配色",
          "运动品牌配色",
          "餐饮品牌配色",
        ],
      },
    ],
    reviews: [
      {
        id: "r14",
        name: "林UI设计师",
        avatar: "林",
        rating: 5,
        date: "2024-03-13",
        content:
          "作为UI设计师，这套配色合集简直是我的救星！每次做新项目都要纠结配色，现在直接从合集中选，省时又好看。客户满意度也提高了。",
        product: "配色合集",
      },
      {
        id: "r15",
        name: "黄平面设计师",
        avatar: "黄",
        rating: 5,
        date: "2024-03-07",
        content:
          "500多套配色太丰富了！按风格分类找起来很方便，一键复制色值也很实用。莫兰迪色系和马卡龙色系我用得最多，效果很好。",
        product: "配色合集",
      },
      {
        id: "r16",
        name: "徐运营设计",
        avatar: "徐",
        rating: 4,
        date: "2024-02-26",
        content:
          "做运营海报经常需要找配色参考，这个合集帮了大忙。节日主题配色特别实用，到了什么节日直接用对应的配色，效率很高。",
        product: "配色合集",
      },
    ],
    faqs: [
      {
        question: "配色方案是什么格式的？",
        answer:
          "我们提供在线浏览版，每套配色都显示HEX和RGB色值，支持一键复制。同时也提供PDF版方便离线查看。",
      },
      {
        question: "可以商用吗？",
        answer:
          "当然可以！配色方案本身不受版权保护，您购买后可以自由用于任何个人和商业项目。",
      },
      {
        question: "购买后怎么获取？",
        answer:
          "付款后通过百度网盘发货，链接永久有效，随时下载。",
      },
      {
        question: "适合新手设计师吗？",
        answer:
          "非常适合！新手设计师最头疼的就是配色问题，有了这套合集，直接套用成熟的配色方案，作品质量立刻提升一个档次。",
      },
    ],
    badge: "",
    icon: Palette,
    gradient: "from-pink-500 to-rose-500",
    salesCount: 2890,
    rating: 4.8,
    updateFrequency: "每月更新",
    deliveryMethod: "在线文档 + PDF",
    suitableFor: ["UI设计师", "平面设计师", "运营人员", "前端开发者", "学生"],
    relatedProducts: ["developer-toolkit", "ai-prompt-pack", "resume-template"],
  },
  {
    id: "resume-template",
    name: "高分简历模板合集",
    shortName: "简历模板合集",
    price: 39,
    originalPrice: 129,
    category: "职场",
    description:
      "30+套专业简历模板，覆盖互联网、金融、设计等多个行业，拿到面试邀约",
    longDescription:
      "这套简历模板合集由资深HR和职业规划师共同打造，30+套专业模板覆盖主流行业。每套模板都经过实际投递验证，帮助求职者大幅提升面试邀约率。配套还有简历撰写指南和面试技巧，助你拿到心仪offer。",
    features: ["30+精选模板", "Word格式", "撰写指南", "面试技巧"],
    highlights: [
      {
        icon: FileText,
        title: "专业模板",
        description: "30+套HR认可的专业简历模板，设计简洁大方",
      },
      {
        icon: Users,
        title: "行业全覆盖",
        description: "互联网、金融、设计、市场、行政等全行业覆盖",
      },
      {
        icon: Award,
        title: "高分通过",
        description: "经过HR验证的模板，面试邀约率提升3倍以上",
      },
      {
        icon: Target,
        title: "配套指南",
        description: "附赠简历撰写指南和面试技巧，从投递到入职全流程",
      },
    ],
    contents: [
      {
        title: "互联网行业（10套）",
        description: "适合技术、产品、运营等互联网岗位",
        items: [
          "前端开发工程师简历",
          "后端开发工程师简历",
          "产品经理简历",
          "运营专员简历",
          "UI设计师简历",
          "数据分析师简历",
          "测试工程师简历",
          "项目经理简历",
        ],
      },
      {
        title: "金融行业（5套）",
        description: "适合银行、证券、基金、会计等金融岗位",
        items: [
          "金融分析师简历",
          "会计/出纳简历",
          "银行柜员简历",
          "投资顾问简历",
          "风控专员简历",
        ],
      },
      {
        title: "设计创意类（5套）",
        description: "适合设计、创意、市场类岗位",
        items: [
          "平面设计师简历",
          "视觉设计师简历",
          "品牌设计师简历",
          "市场策划简历",
          "创意总监简历",
        ],
      },
      {
        title: "通用行政类（5套）",
        description: "适合行政、人事、销售等通用岗位",
        items: [
          "行政专员简历",
          "人力资源简历",
          "销售代表简历",
          "客服专员简历",
          "助理/秘书简历",
        ],
      },
      {
        title: "应届生专属（5套）",
        description: "适合应届毕业生和实习求职",
        items: [
          "应届生通用简历",
          "实习简历模板",
          "管培生简历",
          "简历自我评价模板",
          "校园经历包装指南",
        ],
      },
      {
        title: "附赠：求职大礼包",
        description: "从简历到面试的全套求职指南",
        items: [
          "简历撰写完全指南",
          "面试常见问题100问",
          "薪资谈判技巧",
          "求职信模板",
          "作品集制作建议",
        ],
      },
    ],
    reviews: [
      {
        id: "r17",
        name: "杨求职者",
        avatar: "杨",
        rating: 5,
        date: "2024-03-15",
        content:
          "投了几十份简历都石沉大海，用了这套模板之后，一周就收到了5个面试邀请！模板设计得很专业，加上撰写指南的帮助，简历质量确实提升了很多。已成功入职，感谢！",
        product: "简历模板",
      },
      {
        id: "r18",
        name: "朱应届生",
        avatar: "朱",
        rating: 5,
        date: "2024-03-10",
        content:
          "作为应届生，之前简历写得乱七八糟。用了应届生专属模板和撰写指南后，简历焕然一新。面试技巧也很实用，已经拿到两个offer了！",
        product: "简历模板",
      },
      {
        id: "r19",
        name: "秦跳槽",
        avatar: "秦",
        rating: 5,
        date: "2024-03-02",
        content:
          "工作三年想跳槽，原来的简历太简单了。用了产品经理模板和撰写指南，重新包装了一下，面试邀约率明显提高。薪资谈判技巧也用上了，涨薪30%！",
        product: "简历模板",
      },
    ],
    faqs: [
      {
        question: "模板是什么格式的？",
        answer:
          "所有模板都是Word格式（.docx），可以直接用Microsoft Word或WPS编辑修改。部分模板还提供Pages和Google Docs版本。",
      },
      {
        question: "可以修改内容吗？",
        answer:
          "当然可以！模板只是提供一个专业的框架和格式，您可以根据自己的情况随意修改内容、调整布局。",
      },
      {
        question: "适合零基础的人吗？",
        answer:
          "完全适合！我们附赠了详细的简历撰写指南，教你每一项该怎么写，如何突出自己的优势。还有很多真实案例参考。",
      },
      {
        question: "购买后怎么获取？",
        answer:
          "付款后通过百度网盘发货，链接永久有效，随时下载。",
      },
    ],
    badge: "限时优惠",
    icon: FileText,
    gradient: "from-amber-500 to-orange-500",
    salesCount: 4128,
    rating: 4.9,
    updateFrequency: "不定期更新",
    deliveryMethod: "Word模板文件 + PDF指南",
    suitableFor: ["应届生", "求职者", "跳槽人士", "职场新人"],
    relatedProducts: ["notion-templates", "color-palette", "ai-prompt-pack"],
  },
  // ===== 新增高价值付费工具包 =====
  {
    id: "efficiency-toolkit",
    name: "效率工具百宝箱",
    shortName: "效率百宝箱",
    price: 39.9,
    originalPrice: 199,
    category: "效率",
    description:
      "50+款精选软件 + 30+款浏览器扩展 + 快捷键大全 + 效率方法论，全方位提升工作效率",
    longDescription:
      "这是一套专为职场人、学生、自由职业者打造的效率提升大礼包。我们历时半年，从数百款工具中精挑细选出最实用、最高效的50+款软件和30+款浏览器扩展，涵盖办公、笔记、设计、开发、系统优化等各个场景。搭配系统的效率方法论和快捷键手册，让你从工具到方法全面升级，工作效率提升200%以上。",
    features: [
      "50+款精选软件清单",
      "30+款浏览器扩展",
      "6份快捷键大全手册",
      "3本效率方法论电子书",
      "持续免费更新",
      "终身使用授权",
    ],
    highlights: [
      {
        icon: Zap,
        title: "效率翻倍",
        description: "精选工具+方法论，工作效率提升200%",
      },
      {
        icon: Wrench,
        title: "即装即用",
        description: "每款工具附下载地址和使用技巧，开箱即用",
      },
      {
        icon: Gift,
        title: "物超所值",
        description: "总价值超500元的内容，特惠价仅需39.9元",
      },
      {
        icon: RefreshCw,
        title: "品质保证",
        description: "每季度更新工具库，永久免费获取新版本",
      },
    ],
    contents: [
      {
        title: "精选软件清单（50+款）",
        description: "覆盖办公、设计、开发、系统优化等场景",
        items: [
          "办公效率类：Everything、Listary、Ditto、PowerToys等10款",
          "笔记知识类：Obsidian、Logseq、Notion使用指南等8款",
          "设计工具类：Figma、Canva、ScreenToGif等10款",
          "系统优化类：CCleaner、Geek Uninstaller等7款",
          "开发工具类：VS Code配置、Git客户端、API工具等15款",
        ],
      },
      {
        title: "浏览器扩展精选（30+款）",
        description: "让你的浏览器效率翻倍的神器扩展",
        items: [
          "效率类：OneTab、Toby、Vimium等8款",
          "广告拦截：uBlock Origin等3款",
          "翻译工具：沉浸式翻译等5款",
          "设计辅助：ColorZilla、WhatFont等6款",
          "开发调试：React DevTools等8款",
        ],
      },
      {
        title: "快捷键大全手册",
        description: "6份PDF手册，掌握快捷键事半功倍",
        items: [
          "Windows系统快捷键大全",
          "Mac系统快捷键大全",
          "VS Code快捷键手册",
          "Photoshop快捷键手册",
          "Excel快捷键手册",
          "浏览器快捷键大全",
        ],
      },
      {
        title: "效率方法论电子书",
        description: "3本原创电子书，从思维层面提升效率",
        items: [
          "《高效能人士的7个工具》",
          "《番茄工作法实践指南》",
          "《GTD时间管理入门》",
        ],
      },
    ],
    reviews: [
      {
        id: "r20",
        name: "李明",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liming",
        rating: 5,
        date: "2024-05-12",
        content:
          "买了之后才发现很多软件我之前都不知道！Everything找文件秒开，Ditto剪贴板历史太实用了。物超所值！",
        product: "效率百宝箱",
      },
      {
        id: "r21",
        name: "张小华",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaohua",
        rating: 5,
        date: "2024-06-03",
        content:
          "浏览器扩展部分最惊喜，沉浸式翻译和OneTab每天都在用。效率方法论也很有启发，推荐！",
        product: "效率百宝箱",
      },
      {
        id: "r22",
        name: "王同学",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wangtongxue",
        rating: 5,
        date: "2024-06-20",
        content:
          "快捷键手册打印出来贴在工位，边用边记，现在操作速度明显快了。39.9太值了！",
        product: "效率百宝箱",
      },
    ],
    faqs: [
      {
        question: "买了之后怎么发货？",
        answer:
          "付款后1小时内通过网盘链接发货，包含所有软件清单、扩展推荐、快捷键手册和电子书，可直接下载使用。",
      },
      {
        question: "软件是破解版吗？",
        answer:
          "不是。我们只提供官方正版软件的下载地址和使用技巧，大部分是免费软件，部分付费软件会说明免费版功能是否够用。支持正版，从我做起。",
      },
      {
        question: "适合什么系统？",
        answer:
          "大部分工具都同时支持Windows和Mac，部分工具还有Linux版本。每个工具都会标注支持的系统。",
      },
      {
        question: "购买后怎么获取？",
        answer:
          "会的。我们每季度更新一次工具库，淘汰不好用的，加入新发现的好工具。购买后终身免费获取更新版本。",
      },
      {
        question: "零基础能用吗？",
        answer:
          "完全可以！每个工具都有详细的介绍和使用技巧，从安装到高阶用法一步步教你，小白也能快速上手。",
      },
    ],
    badge: "爆款热销",
    icon: Briefcase,
    gradient: "from-indigo-500 to-blue-500",
    salesCount: 8652,
    rating: 4.9,
    updateFrequency: "每季度更新",
    deliveryMethod: "网盘下载链接（Markdown+PDF）",
    suitableFor: ["职场人", "学生", "自由职业者", "效率爱好者"],
    relatedProducts: ["developer-toolkit", "notion-templates", "ai-prompt-pack"],
  },
  {
    id: "media-toolkit",
    name: "自媒体运营大礼包",
    shortName: "自媒体礼包",
    price: 49.9,
    originalPrice: 299,
    category: "运营",
    description:
      "500+爆款标题模板 + 文案素材库 + 作图资源 + 运营工具 + 平台运营手册，一站式搞定内容创作",
    longDescription:
      "这是一套专为自媒体人、博主、内容创作者打造的全能工具箱。我们分析了1000+篇爆款内容，总结出500+个可直接套用的标题模板，整理了100+个开头结尾模板和金句素材。同时精选了30+免费图库、20+字体网站、100+套配色方案，以及小红书、公众号、抖音、B站四大平台的运营入门手册。不管你是从零开始的新手，还是想突破瓶颈的创作者，都能从中找到需要的东西。",
    features: [
      "500+爆款标题模板",
      "280+文案写作素材",
      "作图资源大合集",
      "4大平台运营手册",
      "运营工具清单",
      "持续更新迭代",
    ],
    highlights: [
      {
        icon: Target,
        title: "拿来就用",
        description: "500+标题模板直接套用，告别灵感枯竭",
      },
      {
        icon: Palette,
        title: "素材齐全",
        description: "图库、字体、配色一站式解决，不用到处找资源",
      },
      {
        icon: BarChart3,
        title: "平台全覆盖",
        description: "小红书/公众号/抖音/B站运营指南一网打尽",
      },
      {
        icon: TrendingUp,
        title: "品质保证",
        description: "紧跟平台趋势，每两月更新一次内容库",
      },
    ],
    contents: [
      {
        title: "爆款标题模板库（500+）",
        description: "覆盖6大品类的标题公式，直接套用",
        items: [
          "情感类标题模板：100个（共鸣型、悬念型、故事型）",
          "干货类标题模板：100个（数字型、疑问型、清单型）",
          "种草类标题模板：100个（对比型、场景型、效果型）",
          "职场类标题模板：80个（成长型、避坑型、经验型）",
          "科技类标题模板：70个（测评型、科普型、盘点型）",
          "各平台标题公式：50个（小红书/公众号/抖音/B站）",
        ],
      },
      {
        title: "文案写作素材库",
        description: "从开头到结尾，全套文案素材",
        items: [
          "100+爆款开头模板（钩子型、故事型、数据型等）",
          "100+金句素材（励志、情感、职场、生活）",
          "50+结尾模板（总结型、互动型、引导型）",
          "30+互动话术（评论区引导、私信转化）",
          "表情包文案合集：50个热门梗文案",
        ],
      },
      {
        title: "作图工具与模板",
        description: "解决80%的做图需求",
        items: [
          "10个Canva精选模板链接（封面图、海报、日签）",
          "30+免费高质量图库网站（Unsplash、Pexels等）",
          "20+字体下载网站（免费可商用）",
          "100+套精选配色方案（渐变色、莫兰迪、马卡龙等）",
          "5个在线设计工具推荐",
        ],
      },
      {
        title: "运营工具清单",
        description: "15款运营必备工具，事半功倍",
        items: [
          "数据分析工具：5款（新榜、灰豚、蝉妈妈等）",
          "排版工具：3款（135编辑器、秀米等）",
          "视频剪辑工具：4款（剪映、必剪、CapCut等）",
          "素材下载工具：3款",
        ],
      },
      {
        title: "四大平台运营手册",
        description: "从0到1入门各平台",
        items: [
          "小红书运营入门：定位+内容+涨粉+变现",
          "公众号运营指南：排版+选题+涨粉+变现",
          "抖音/视频号运营技巧：算法+选题+拍摄+变现",
          "B站创作者手册：定位+制作+运营+变现",
        ],
      },
    ],
    reviews: [
      {
        id: "r23",
        name: "小鹿",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaolu",
        rating: 5,
        date: "2024-04-28",
        content:
          "标题模板太好用了！以前写标题要想半小时，现在从模板里挑一个改改就行。粉丝增长明显变快了。",
        product: "自媒体礼包",
      },
      {
        id: "r24",
        name: "阿凯",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=akai",
        rating: 5,
        date: "2024-05-15",
        content:
          "做小红书半年了一直没起色，看了运营手册才知道之前定位有问题。调整后第二篇就爆了，太值了！",
        product: "自媒体礼包",
      },
      {
        id: "r25",
        name: "小美",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei",
        rating: 5,
        date: "2024-06-10",
        content:
          "配色方案和图库合集帮大忙了，之前找图找色要花好多时间。文案素材也很实用，强烈推荐！",
        product: "自媒体礼包",
      },
    ],
    faqs: [
      {
        question: "适合什么平台的创作者？",
        answer:
          "通用内容素材适合所有平台，运营手册覆盖了小红书、公众号、抖音、B站四大主流平台。不管你做哪个平台都能用。",
      },
      {
        question: "零基础能学会吗？",
        answer:
          "完全可以！运营手册从0开始教，包括怎么注册、怎么定位、怎么发布第一篇内容。标题模板直接套用就行。",
      },
      {
        question: "购买后怎么获取？",
        answer:
          "会的。平台规则和用户喜好一直在变，我们每两个月更新一次内容库，确保素材和方法不过时。",
      },
      {
        question: "买了之后怎么发货？",
        answer:
          "付款后1小时内通过网盘链接发货，包含所有文档和素材，都是Markdown和PDF格式，可以直接查看。",
      },
      {
        question: "可以退款吗？",
        answer:
          "由于是虚拟产品，发货后不支持退款。但如果你觉得内容不值这个价，7天内可以联系我们协商处理。",
      },
    ],
    badge: "创作者必备",
    icon: Megaphone,
    gradient: "from-pink-500 to-rose-500",
    salesCount: 6234,
    rating: 4.8,
    updateFrequency: "每两月更新",
    deliveryMethod: "网盘下载链接（Markdown+PDF）",
    suitableFor: ["自媒体人", "博主", "内容创作者", "运营新人"],
    relatedProducts: ["ai-prompt-pack", "efficiency-toolkit", "notion-templates"],
  },
  {
    id: "indie-developer-pack",
    name: "独立开发者启动包",
    shortName: "独立开发启动包",
    price: 69.9,
    originalPrice: 399,
    category: "开发",
    description:
      "技术选型+设计资源+营销工具+变现方案+法律合规+100个产品idea，从0到1做产品的全套指南",
    longDescription:
      "这是一套为想做独立产品、想靠副业赚钱的开发者和设计师打造的启动包。我们总结了过去5年做独立产品的全部经验，从技术选型、产品设计、营销推广、变现模式到法律合规，每一个环节都有详细的指南和工具推荐。还附赠100个经过市场验证的产品idea清单。不管你是想做SaaS、工具站、还是内容产品，都能从这里找到你需要的东西。不用再到处搜资料、踩坑了，直接站在前人的肩膀上出发。",
    features: [
      "技术栈选型全解析",
      "设计资源大合集",
      "营销推广工具包",
      "10种变现模式详解",
      "法律合规指南",
      "100个产品idea清单",
    ],
    highlights: [
      {
        icon: Rocket,
        title: "快速启动",
        description: "从0到1全流程指南，少走弯路直接上手",
      },
      {
        icon: Code2,
        title: "技术全面",
        description: "前端/后端/数据库/部署全方位对比分析",
      },
      {
        icon: Target,
        title: "落地性强",
        description: "每个方案都有具体工具推荐和操作步骤",
      },
      {
        icon: Gift,
        title: "超值附赠",
        description: "100个产品idea清单，拿到就能开始做",
      },
    ],
    contents: [
      {
        title: "技术栈选型指南",
        description: "全面对比分析，找到最适合你的技术方案",
        items: [
          "前端框架选型：React/Vue/Next.js/Nuxt/Svelte对比",
          "后端方案选择：Node.js/Python/Go/PHP/BaaS全解析",
          "数据库选型：PostgreSQL/MySQL/SQLite/MongoDB对比",
          "部署方案：Vercel/Netlify/Cloudflare/阿里云/腾讯云对比",
          "开发工具链推荐：IDE、调试、CI/CD、监控",
        ],
      },
      {
        title: "产品设计资源",
        description: "不用设计师也能做出好看的产品",
        items: [
          "20+ UI组件库推荐（React/Vue/原生各平台）",
          "30+图标库大全（免费可商用，含SVG/字体格式）",
          "5套设计系统模板（可直接套用）",
          "10个精选Landing Page模板",
          "Figma资源合集（组件库、插件、教程）",
        ],
      },
      {
        title: "营销推广工具包",
        description: "冷启动必备，从0获取第一批用户",
        items: [
          "SEO工具清单：关键词研究、内容优化、排名追踪",
          "关键词研究方法论：如何找到低竞争高转化关键词",
          "社群运营工具：微信群、Discord、Telegram工具推荐",
          "邮件营销工具：Mailchimp/ConvertKit/Substack对比",
          "数据分析工具：Google Analytics/Plausible/Umami对比",
        ],
      },
      {
        title: "变现方案大全",
        description: "10种独立产品变现模式详解",
        items: [
          "10种变现模式深度解析：订阅制、一次性付费、免费增值、联盟营销等",
          "支付方案对比：Stripe/Paddle/Lemon Squeezy/支付宝/微信支付",
          "定价策略指南：怎么定价才能利润最大化",
          "转化率优化技巧：Landing Page优化、定价页设计、信任建设",
          "真实案例分析：5个独立产品的变现路径拆解",
        ],
      },
      {
        title: "法律合规指南",
        description: "保护自己，避免踩坑",
        items: [
          "隐私政策模板（中英双语，可直接修改使用）",
          "用户协议模板（中英双语）",
          "开源协议详解：MIT/GPL/Apache/BSD的区别和选择",
          "商标注册指南：什么时候注册、怎么注册、多少钱",
          "合规注意事项：GDPR、个人信息保护法、数据安全",
        ],
      },
      {
        title: "100个产品idea清单",
        description: "经过市场验证的产品方向，拿来就能做",
        items: [
          "工具类产品idea：30个（效率工具、开发工具、设计工具等）",
          "内容类产品idea：20个（课程、资讯、社群等）",
          "SaaS产品idea：30个（垂直行业、中小企业、个人等）",
          "电商类产品idea：20个（数字产品、实体产品、代发货等）",
          "选型方法论：如何判断一个idea值不值得做",
        ],
      },
    ],
    reviews: [
      {
        id: "r26",
        name: "程序员老张",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laozhang",
        rating: 5,
        date: "2024-03-20",
        content:
          "工作5年一直想做自己的产品，但不知道从哪开始。这个启动包帮我理清了思路，从技术选型到变现方案都有参考。第一个工具站已经上线了！",
        product: "独立开发启动包",
      },
      {
        id: "r27",
        name: "设计师Amy",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amy",
        rating: 5,
        date: "2024-04-15",
        content:
          "作为设计师，技术和变现是我的短板。这份资料讲得很清楚，设计资源部分也很实用。推荐给想做独立产品的设计师朋友。",
        product: "独立开发启动包",
      },
      {
        id: "r28",
        name: "阿杰",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ajie",
        rating: 5,
        date: "2024-05-28",
        content:
          "100个idea清单就值回票价了！每个idea都有简要分析，不用自己瞎想。法律合规部分也很重要，之前完全没考虑过这些。",
        product: "独立开发启动包",
      },
    ],
    faqs: [
      {
        question: "适合什么人群？",
        answer:
          "适合想做独立产品、副业赚钱的开发者、设计师、产品经理，以及任何想在网上创造收入的人。有一定编程基础最佳，但即使零基础也能从中学到产品思路和方法论。",
      },
      {
        question: "购买后怎么获取？",
        answer:
          "会的。技术栈和市场一直在变化，我们每季度更新一次内容，确保信息不过时。购买后终身免费获取所有更新版本。",
      },
      {
        question: "买了就能赚到钱吗？",
        answer:
          "我们提供的是方法、工具和思路，能不能赚钱取决于你的执行力和产品本身。但根据我们的经验，只要选对方向+坚持执行，大部分人都能在3-6个月内看到收入。",
      },
      {
        question: "可以退款吗？",
        answer:
          "虚拟产品发货后不支持退款。但如果你觉得内容不值，可以在7天内联系我们说明原因，我们会酌情处理。",
      },
      {
        question: "有社群吗？",
        answer:
          "购买后可以加入我们的读者交流群，和其他独立开发者交流经验、互相监督、分享资源。群里不定期分享最新的工具和机会。",
      },
    ],
    badge: "高客单价",
    icon: Rocket,
    gradient: "from-violet-500 to-purple-600",
    salesCount: 3421,
    rating: 4.9,
    updateFrequency: "每季度更新",
    deliveryMethod: "网盘下载链接（Markdown+PDF）",
    suitableFor: ["开发者", "设计师", "产品经理", "副业探索者"],
    relatedProducts: ["developer-toolkit", "efficiency-toolkit", "ai-prompt-pack"],
  },
  {
    id: "ai-art-master",
    name: "AI绘画大师包",
    shortName: "AI绘画大师包",
    price: 59.9,
    originalPrice: 299,
    category: "设计",
    description:
      "Midjourney+SD+DALL·E全攻略，500+精选提示词+30套风格模板+入门到精通教程",
    longDescription:
      "这是一套专为AI绘画爱好者、设计师、自媒体创作者打造的AI绘画全攻略大礼包。我们团队历时6个月，深度使用Midjourney、Stable Diffusion、DALL·E等主流AI绘画工具，总结出这套从零基础到专业出图的完整教程。不管你是想做头像、壁纸、海报、还是商业插画，都能从中找到现成的模板和提示词，直接套用就能出高质量作品。无需绘画基础，小白也能快速上手。",
    features: [
      "500+精选提示词",
      "30套风格模板",
      "入门到精通教程",
      "Midjourney+SD双平台",
      "持续免费更新",
      "终身使用授权",
    ],
    highlights: [
      {
        icon: Sparkles,
        title: "即拿即用",
        description: "500+精选提示词，复制粘贴直接出图，零学习成本",
      },
      {
        icon: Palette,
        title: "风格丰富",
        description: "30套风格模板，写实、插画、二次元、3D等全覆盖",
      },
      {
        icon: PlayCircle,
        title: "系统教程",
        description: "从注册到出图全流程视频教程，小白也能快速上手",
      },
      {
        icon: Gift,
        title: "超值附赠",
        description: "附赠参数表、风格关键词词典、避坑指南等干货",
      },
    ],
    contents: [
      {
        title: "Midjourney 提示词库（200+）",
        description: "经过反复测试的高质量提示词，复制即用",
        items: [
          "人物肖像类：写实、动漫、油画、赛博朋克等40+风格",
          "风景场景类：自然风景、城市建筑、奇幻场景等35+主题",
          "产品摄影类：美食、美妆、3C产品、服装等30+品类",
          "插画设计类：扁平风、国潮、水彩、像素风等25+风格",
          "Logo与图标：几何、渐变、线稿、立体等20+类型",
          "海报封面类：电影海报、书籍封面、专辑封面等20+模板",
          "角色设计类：游戏角色、动漫人物、IP形象等15+分类",
          "概念艺术类：科幻、奇幻、蒸汽朋克等15+主题",
        ],
      },
      {
        title: "Stable Diffusion 全攻略",
        description: "从安装到精通的完整指南",
        items: [
          "SD安装教程：Windows/Mac双平台，含WebUI配置",
          "模型推荐：20款精选大模型+10款Lora模型下载链接",
          "参数详解：Sampler、Steps、CFG Scale等参数调优指南",
          "ControlNet教程：线稿、深度图、姿态控制全解析",
          "LoRA训练：零基础训练自己的风格/人物LoRA",
          "插件推荐：15款实用插件合集，提升出图效率",
        ],
      },
      {
        title: "30套风格模板包",
        description: "调好参数的完整模板，替换关键词即可使用",
        items: [
          "日系动漫风格模板（含5套子风格）",
          "写实摄影风格模板（人像/风景/产品）",
          "国潮国风风格模板（人物/场景/物件）",
          "3D渲染风格模板（C4D/Blender质感）",
          "像素艺术风格模板（游戏/头像/图标）",
          "水彩插画风格模板（风景/人物/静物）",
        ],
      },
      {
        title: "AI绘画视频教程",
        description: "从零开始的系统教学，30+课时",
        items: [
          "入门篇：工具注册、界面介绍、第一张图（5课时）",
          "基础篇：提示词技巧、参数调节、风格控制（8课时）",
          "进阶篇：图生图、局部重绘、ControlNet（10课时）",
          "实战篇：头像/壁纸/海报/Logo商业案例（8课时）",
          "变现篇：AI绘画接单平台、定价策略、避坑指南",
        ],
      },
      {
        title: "附赠资源大合集",
        description: "干货满满，物超所值",
        items: [
          "AI绘画关键词词典（中英文对照，1000+词汇）",
          "Midjourney参数速查表（高清PDF）",
          "风格参考图合集（500+张，含对应提示词）",
          "AI绘画变现指南（8种变现方式+案例）",
          "常用网站导航（20+AI绘画工具/素材/社区）",
        ],
      },
    ],
    reviews: [
      {
        id: "r29",
        name: "小美设计师",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaomei",
        rating: 5,
        date: "2024-05-10",
        content:
          "作为设计师，AI绘画已经成为我的必备工具。这套教程和提示词库太实用了，特别是Midjourney的提示词，很多我自己想不出来的风格，直接复制就能用。工作效率提升了好几倍！",
        product: "AI绘画大师包",
      },
      {
        id: "r30",
        name: "自媒体阿凯",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=akai",
        rating: 5,
        date: "2024-04-25",
        content:
          "做自媒体经常需要配图，之前找图找半天。现在用AI绘画，想要什么风格直接生成。提示词库帮我省了很多试错时间，特别是30套模板，替换关键词直接出图，太方便了！",
        product: "AI绘画大师包",
      },
      {
        id: "r31",
        name: "零基础小白",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaobai",
        rating: 4,
        date: "2024-05-20",
        content:
          "完全零基础，跟着教程一步步学，一周就能画出不错的图了。提示词库是真的香，不用自己想词，直接挑喜欢的风格用。SD教程也很详细，跟着装没问题。",
        product: "AI绘画大师包",
      },
    ],
    faqs: [
      {
        question: "零基础能学会吗？",
        answer:
          "完全可以！我们的教程从注册账号开始讲起，一步一步教你怎么出图。提示词库更是可以直接复制使用，零基础也能快速出高质量作品。",
      },
      {
        question: "需要付费订阅Midjourney吗？",
        answer:
          "Midjourney是付费服务，最低约10美元/月。我们也提供了免费/低成本的替代方案，包括Stable Diffusion本地部署和其他免费AI绘画工具推荐。",
      },
      {
        question: "生成的图可以商用吗？",
        answer:
          "根据Midjourney和Stable Diffusion的官方条款，付费用户生成的图片拥有商用权。但具体商用范围建议参考各平台的最新政策，我们也在文档中整理了相关说明。",
      },
      {
        question: "内容会更新吗？",
        answer:
          "付款后通过百度网盘发货，链接永久有效，随时下载使用。",
      },
      {
        question: "可以退款吗？",
        answer:
          "支持7天无理由退款。如果您觉得内容不值这个价，购买后7天内联系客服即可全额退款，无需任何理由。",
      },
    ],
    badge: "热门新品",
    icon: Palette,
    gradient: "from-pink-500 to-rose-500",
    salesCount: 5678,
    rating: 4.9,
    updateFrequency: "每两个月更新",
    deliveryMethod: "网盘下载链接（PDF+视频+素材）",
    suitableFor: ["设计师", "自媒体人", "插画师", "AI爱好者", "学生"],
    relatedProducts: ["color-palette", "media-toolkit", "ai-prompt-pack"],
  },
  {
    id: "job-interview-guide",
    name: "求职面试全攻略",
    shortName: "面试全攻略",
    price: 49.9,
    originalPrice: 199,
    category: "职场",
    description:
      "简历模板+面试话术+薪资谈判+笔试真题，从投简历到拿offer的全套指南",
    longDescription:
      "这是一套为求职者量身打造的全流程面试攻略。我们邀请了10+位大厂面试官和50+位跳槽涨薪成功的职场人，共同总结了这套从简历优化到薪资谈判的完整方法论。包含100+真实面试题、20套高分简历模板、各岗位面试话术、薪资谈判技巧等。不管你是应届生、想跳槽、还是想转行，都能从中找到提升面试通过率的实用方法。",
    features: [
      "20套高分简历模板",
      "100+真实面试题解析",
      "各岗位面试话术",
      "薪资谈判技巧",
      "笔试真题合集",
      "即买即用",
    ],
    highlights: [
      {
        icon: FileText,
        title: "高分简历",
        description: "20套精修简历模板，直接套用，通过率提升3倍",
      },
      {
        icon: Users,
        title: "面试话术",
        description: "HR面+技术面+主管面全场景话术，有备无患",
      },
      {
        icon: TrendingUp,
        title: "薪资谈判",
        description: "涨薪30%+的谈判技巧，不卑不亢拿高薪",
      },
      {
        icon: Award,
        title: "真实案例",
        description: "50+真实跳槽案例复盘，经验可复制",
      },
    ],
    contents: [
      {
        title: "简历优化指南+20套模板",
        description: "好简历是拿到面试的第一步",
        items: [
          "简历写作方法论：STAR法则、量化成果、关键词优化",
          "20套精选简历模板（Word格式，可直接编辑）",
          "10个简历常见错误避坑指南",
          "不同岗位简历范例：技术/产品/设计/运营/市场/销售",
          "应届生简历模板：突出实习和项目经验",
          "转行简历模板：突出可迁移能力和学习能力",
          "简历投递渠道攻略：BOSS直聘/猎聘/LinkedIn/内推",
        ],
      },
      {
        title: "100+经典面试题解析",
        description: "高频面试题全覆盖，提前准备不慌",
        items: [
          "自我介绍：3个版本（1分钟/3分钟/5分钟）+模板",
          "HR面试20问：优缺点/职业规划/离职原因等标准答案",
          "行为面试30问：STAR法则拆解+真实案例",
          "压力面试10问：如何应对面试官的刁难问题",
          "反问环节：向面试官提问的15个高质量问题",
          "不同公司风格应对：大厂/外企/国企/创业公司",
        ],
      },
      {
        title: "各岗位专业面试指南",
        description: "针对性准备，精准打击",
        items: [
          "技术岗：前端/后端/算法/测试高频面试题合集",
          "产品岗：产品思维/需求分析/数据分析/项目经验",
          "设计岗：作品集准备/设计思路/项目复盘话术",
          "运营岗：数据思维/活动策划/用户增长/内容运营",
          "市场岗：品牌/营销/渠道/增长面试要点",
          "每个岗位附5个真实面试案例复盘",
        ],
      },
      {
        title: "薪资谈判技巧",
        description: "不卑不亢，拿到满意的薪资",
        items: [
          "谈薪前的准备：如何调研市场薪资水平",
          "期望薪资怎么报：报价策略和心理博弈",
          "HR压价应对：5种常见压价话术的反击",
          "涨薪谈判：在职怎么跟老板提涨薪",
          "offer选择：多家offer怎么选才不后悔",
          "薪资结构解读：base/绩效/期权/福利怎么算",
        ],
      },
      {
        title: "笔试真题合集",
        description: "提前刷题，笔试不再是拦路虎",
        items: [
          "行测题：数字推理/图形推理/逻辑判断/资料分析",
          "性格测试：MBTI/九型人格/职业性格测试通关技巧",
          "互联网大厂真题：阿里/腾讯/字节/百度笔试回忆版",
          "英语测试：托业/雅思/BEC职场英语备考",
          "案例分析：咨询/快消/金融Case Interview攻略",
        ],
      },
      {
        title: "附赠工具包",
        description: "求职路上的实用辅助工具",
        items: [
          "求职进度跟踪表（Excel模板）",
          "面试复盘模板（每次面试后必做）",
          "公司背调清单（入职前必查的10件事）",
          "试用期生存指南（前3个月怎么快速站稳脚跟）",
          "职场新人避坑指南（100个过来人的血泪教训）",
        ],
      },
    ],
    reviews: [
      {
        id: "r32",
        name: "跳槽成功的小王",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaowang",
        rating: 5,
        date: "2024-05-05",
        content:
          "裸辞后找了一个月工作都没消息，抱着试试的心态买了这个攻略。改完简历第二天就收到3个面试邀请，薪资谈判也用上了，最后涨薪35%入职！太值了！",
        product: "面试全攻略",
      },
      {
        id: "r33",
        name: "应届生小李",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoli",
        rating: 5,
        date: "2024-04-18",
        content:
          "作为应届生，完全不知道怎么写简历、怎么面试。跟着模板改完简历，又背了面试题，秋招拿到了5个offer！薪资谈判的技巧也帮我多谈了2k月薪。",
        product: "面试全攻略",
      },
      {
        id: "r34",
        name: "转行的张姐",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangjie",
        rating: 4,
        date: "2024-05-22",
        content:
          "30岁转行，心里特别没底。转行简历模板和面试话术帮了大忙，面试时不会因为没经验而心虚。虽然过程挺艰难的，但最后成功转行了！",
        product: "面试全攻略",
      },
    ],
    faqs: [
      {
        question: "适合什么人群？",
        answer:
          "适合所有正在找工作的人：应届生、想跳槽的职场人、想转行的朋友、被裁员需要重新找工作的人。不同人群都有对应的内容模块。",
      },
      {
        question: "简历模板是什么格式？",
        answer:
          "Word格式，可直接编辑修改。也附了PDF版本供参考。模板设计简洁专业，符合国内HR阅读习惯，ATS系统也能识别。",
      },
      {
        question: "面试题是通用的吗？",
        answer:
          "HR面和行为面试题是通用的，专业面试题按岗位分类。技术/产品/设计/运营/市场/销售等主流岗位都有覆盖，每个岗位有针对性的面试题和准备方法。",
      },
      {
        question: "内容会更新吗？",
        answer:
          "付款后通过百度网盘发货，链接永久有效，随时下载使用。",
      },
      {
        question: "可以退款吗？",
        answer:
          "支持7天无理由退款。如果您觉得内容对您没有帮助，购买后7天内联系客服即可全额退款。",
      },
    ],
    badge: "求职必备",
    icon: Award,
    gradient: "from-blue-500 to-indigo-500",
    salesCount: 7892,
    rating: 4.9,
    updateFrequency: "每季度更新",
    deliveryMethod: "网盘下载链接（PDF+Word+Excel）",
    suitableFor: ["应届生", "跳槽职场人", "转行人群", "求职者"],
    relatedProducts: ["resume-template", "efficiency-toolkit", "notion-templates"],
  },
  {
    id: "side-income-toolkit",
    name: "副业赚钱工具箱",
    shortName: "副业工具箱",
    price: 69.9,
    originalPrice: 399,
    category: "效率",
    description:
      "10大副业方向深度拆解+工具包+模板+案例，普通人也能靠副业月入过万",
    longDescription:
      "这是一套为想搞副业、想增加收入的普通人打造的实战工具箱。我们深度调研了市场上50+种副业方式，筛选出10个门槛低、上手快、天花板高的靠谱副业方向，每个方向都有详细的入门教程、工具清单、变现路径和真实案例。不管你是上班族、宝妈、还是学生，都能找到适合自己的副业方向。不用再到处找项目、踩坑被骗了，这里有经过验证的方法论和工具，照着做就能起步。",
    features: [
      "10大副业方向拆解",
      "50+实用工具推荐",
      "30+可直接套用的模板",
      "20个真实案例复盘",
      "避坑指南大全",
      "即买即用",
    ],
    highlights: [
      {
        icon: TrendingUp,
        title: "靠谱方向",
        description: "10个经过验证的副业方向，门槛低、上手快、收入稳",
      },
      {
        icon: Wrench,
        title: "工具齐全",
        description: "每个方向都有配套工具推荐，效率翻倍",
      },
      {
        icon: Target,
        title: "可落地性强",
        description: "从0到1的完整步骤，照着做就能起步",
      },
      {
        icon: Shield,
        title: "避坑指南",
        description: "20+常见副业骗局揭秘，少走弯路不踩坑",
      },
    ],
    contents: [
      {
        title: "内容创作类副业",
        description: "靠内容赚钱，门槛低上限高",
        items: [
          "公众号运营：从0到1起号+变现全攻略（广告/打赏/付费阅读）",
          "小红书博主：爆款笔记方法论+变现路径（接广告/带货/私域）",
          "短视频创作：抖音/快手/B站选题脚本+剪辑工具+变现方式",
          "知乎好物：答题带货被动收入，选品+写作技巧全解析",
          "配套工具：10款内容创作工具+5套选题模板+3套爆款文案模板",
        ],
      },
      {
        title: "技能服务类副业",
        description: "用已有技能变现，最稳的副业方式",
        items: [
          "设计接单：Logo/海报/UI设计接单平台+报价策略+谈单话术",
          "文案写作：软文/文案/脚本/稿件写作接单渠道与定价",
          "编程接单：外包/私活/技术咨询平台推荐与避坑",
          "翻译服务：文档/字幕/口译接单平台与提升效率工具",
          "PPT制作：模板设计+定制接单+被动收入路径",
        ],
      },
      {
        title: "电商与带货类",
        description: "靠卖货赚钱，天花板最高",
        items: [
          "闲鱼无货源：选品+上架+优化全流程，零成本起步",
          "拼多多开店：无货源模式详解+选品策略+运营技巧",
          "抖音小店：开店流程+选品+达人合作+直播带货",
          "虚拟产品：数字产品/资料包/模板的制作与销售",
          "配套工具：选品工具/数据分析工具/客服话术模板",
        ],
      },
      {
        title: "知识付费与课程",
        description: "把知识变成产品，睡后收入",
        items: [
          "小册/电子书：选题+写作+上架+推广全流程",
          "视频课程：课程设计+录制工具+上架平台+营销推广",
          "社群运营：知识星球/微信群/付费社群的运营方法论",
          "咨询服务：一对一咨询/训练营/私教的定价与交付",
          "配套工具：课程制作工具+社群运营工具+销售话术模板",
        ],
      },
      {
        title: "工具与资源类副业",
        description: "靠信息差和工具赚钱",
        items: [
          "工具站开发：从0到1做一个赚钱的在线工具站",
          "资源整合：网盘资料/素材资源的收集与变现",
          "代运营服务：公众号/小红书/抖音代运营业务",
          "AI赚钱：用AI工具做副业的10种方式（AI绘画/写作/视频）",
          "配套工具：50+效率工具合集+自动化工具推荐",
        ],
      },
      {
        title: "副业必备通用能力",
        description: "做好任何副业都需要的底层能力",
        items: [
          "时间管理：上班族如何高效利用业余时间做副业",
          "精力管理：下班后还有精力做副业的秘诀",
          "营销思维：产品/流量/转化的底层逻辑",
          "财务规划：副业收入怎么管，怎么滚雪球",
          "副业转正：什么时候可以辞职全职做副业",
        ],
      },
      {
        title: "避坑与常见骗局",
        description: "不亏钱就是赚钱",
        items: [
          "20+常见副业骗局揭秘：刷单/打字员/押金/加盟费等",
          "怎么判断一个副业靠不靠谱：5个判断标准",
          "副业踩坑实录：10个过来人的血泪教训",
          "防骗指南：遇到这些情况直接拉黑",
          "法律常识：副业收入要交税吗？怎么交？",
        ],
      },
    ],
    reviews: [
      {
        id: "r35",
        name: "上班族阿强",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aqiang",
        rating: 5,
        date: "2024-05-08",
        content:
          "上班工资不够花，一直想搞副业但不知道做什么。工具箱里10个方向，我选了闲鱼无货源和小红书好物，两个月后副业收入已经有工资一半了！",
        product: "副业工具箱",
      },
      {
        id: "r36",
        name: "宝妈小莉",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoli",
        rating: 5,
        date: "2024-04-30",
        content:
          "在家带娃想赚点零花钱，时间比较零散。试了虚拟产品和资料整理，不用花太多时间，每月也有两三千收入，够给宝宝买奶粉了。",
        product: "副业工具箱",
      },
      {
        id: "r37",
        name: "程序员老王",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=laowang",
        rating: 4,
        date: "2024-05-18",
        content:
          "作为程序员，最感兴趣的是工具站开发那部分。跟着指南做了一个小工具站，靠广告每月有几千被动收入。虽然不多但是睡后收入，很满意。",
        product: "副业工具箱",
      },
    ],
    faqs: [
      {
        question: "零基础可以做吗？",
        answer:
          "完全可以。我们的10个副业方向中，有一半以上是零基础就能上手的，比如闲鱼无货源、小红书好物、资料整理等。每个方向都有详细的入门步骤，跟着做就行。",
      },
      {
        question: "需要投入本金吗？",
        answer:
          "大部分副业方向零成本或低成本就能起步。我们特别标注了每个方向的启动资金要求，推荐优先选择零成本的方向试水，有收入了再考虑投入。",
      },
      {
        question: "每天需要花多少时间？",
        answer:
          "因人而异。刚开始每天1-2小时就能起步，熟练后可以根据自己的时间调整。我们也提供了时间管理方法，帮助上班族高效利用业余时间。",
      },
      {
        question: "能保证赚到钱吗？",
        answer:
          "我们提供的是经过验证的方法和工具，但能不能赚到钱取决于你的执行力。根据我们的学员反馈，认真执行的人大部分能在1-3个月内看到收入。",
      },
      {
        question: "内容会更新吗？",
        answer:
          "付款后通过百度网盘发货，链接永久有效，随时下载使用。",
      },
    ],
    badge: "爆款热销",
    icon: Briefcase,
    gradient: "from-emerald-500 to-teal-500",
    salesCount: 9567,
    rating: 4.8,
    updateFrequency: "每季度更新",
    deliveryMethod: "网盘下载链接（PDF+模板+工具清单）",
    suitableFor: ["上班族", "宝妈", "学生", "想增加收入的人"],
    relatedProducts: ["efficiency-toolkit", "indie-developer-pack", "ai-prompt-pack"],
  },
];

export const productCategories = [
  { id: "all", name: "全部产品", icon: Grid3X3 },
  { id: "AI工具", name: "AI工具", icon: Sparkles },
  { id: "开发", name: "开发", icon: Code2 },
  { id: "效率", name: "效率", icon: LayoutDashboard },
  { id: "运营", name: "运营", icon: BarChart3 },
  { id: "设计", name: "设计", icon: Palette },
  { id: "职场", name: "职场", icon: FileText },
];

// Contact info for purchase
export const purchaseContact = {
  wechat: "2629676609", // 微信号（备用）
  wechatQr: "/wechat-pay.jpg", // 微信收款码图片
  qq: "2629676609",
  xianyuUrl: "https://2.taobao.com/",
  email: "2629676609@qq.com",
  responseTime: "24小时内回复",
};

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((product) => product.category === category);
}

export function getRelatedProducts(productId: string, count: number = 3): Product[] {
  const product = getProductById(productId);
  if (!product) return products.slice(0, count);
  
  const related = product.relatedProducts
    .map((id) => getProductById(id))
    .filter((p): p is Product => p !== undefined);
  
  // 如果相关产品不够，从同分类补充
  if (related.length < count) {
    const sameCategory = products.filter(
      (p) => p.category === product.category && p.id !== productId && !related.includes(p)
    );
    related.push(...sameCategory.slice(0, count - related.length));
  }
  
  // 如果还不够，从其他产品补充
  if (related.length < count) {
    const others = products.filter(
      (p) => p.id !== productId && !related.includes(p)
    );
    related.push(...others.slice(0, count - related.length));
  }
  
  return related.slice(0, count);
}

export function getFeaturedProducts(count: number = 3): Product[] {
  // 返回有badge标记的热销/推荐产品
  const featured = products.filter((p) => p.badge);
  if (featured.length >= count) return featured.slice(0, count);
  return products.slice(0, count);
}

// Trust badges data
export const trustBadges = [
  { icon: Shield, text: "文件问题补发", color: "text-emerald-500" },
  { icon: Zap, text: "付款后立即交付", color: "text-amber-500" },
  { icon: Mail, text: "24小时内响应", color: "text-blue-500" },
  { icon: Users, text: "用户信赖之选", color: "text-purple-500" },
];


