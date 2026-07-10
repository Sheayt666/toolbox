import Link from "next/link";
import { BookOpen, ListOrdered, Wrench, ChevronRight } from "lucide-react";
import { getToolsByTag, popularTags, categories } from "@/lib/tools";

interface TagSEOContentProps {
  tagName: string;
  tagSlug: string;
  toolCount: number;
}

/**
 * 20 个热门标签的定制化介绍描述
 * 每段 200-300 字，自然融入"在线工具""工具大全""99在线工具""免费"等核心关键词
 */
const tagIntros: Record<string, string> = {
  JSON:
    "JSON（JavaScript对象表示法）是当前最流行的轻量级数据交换格式，广泛应用于Web开发、API接口设计和配置文件管理。99在线工具大全精选多款JSON在线工具，涵盖JSON格式化美化、JSON压缩、JSON转XML、JSON转CSV、JSON校验与树状预览等常用功能。无论您是前端开发者调试接口数据，还是后端工程师处理配置文件，这些JSON在线工具都能帮助您快速完成格式化与转换操作。所有工具免费使用，无需注册登录，数据在浏览器本地处理，不上传服务器，安全高效，是开发者日常工作的必备工具箱。",
  图片压缩:
    "图片压缩是网页优化和日常图像处理中的高频需求，通过减小图片文件体积来提升页面加载速度、节省存储空间和带宽成本。99在线工具大全提供多款图片压缩在线工具，支持JPG、PNG、WebP、GIF等常见格式的压缩处理，可在保持画质的同时大幅降低文件大小。无论您是网站运营人员优化网页性能，还是普通用户压缩照片便于分享传输，这些图片压缩在线工具都能一键完成。所有工具免费使用，处理过程在浏览器本地进行，图片不上传服务器，全面保护您的隐私和数据安全。",
  PDF转换:
    "PDF作为通用的跨平台文档格式，在办公、学习和打印场景中使用极为广泛，PDF转换需求随之频繁出现。99在线工具大全精选多款PDF转换在线工具，涵盖PDF转Word、PDF转图片、PDF合并拆分、PDF压缩、Excel转PDF、HTML转PDF等多种功能。无论您需要编辑PDF内容、合并多个文档，还是将其他格式转换为PDF，这些PDF转换在线工具都能帮助您快速完成。所有工具免费使用，无需安装插件，处理过程安全可靠，助力高效办公，满足工作和学习中的各类文档处理需求。",
  在线计算:
    "在线计算工具覆盖了日常生活和工作中的各类计算需求，是99在线工具大全中最受欢迎的标签之一。这里汇集了房贷计算器、个税计算器、BMI计算器、年龄计算器、单位换算器、科学计算器等多种实用计算在线工具。无论您需要计算贷款月供、个人所得税、身体质量指数，还是进行单位换算和数值运算，都能找到合适的工具。所有计算工具免费使用，无需注册，计算过程在本地完成，数据不上传服务器，安全可靠，是您理财规划和日常计算的得力助手。",
  文本处理:
    "文本处理是办公和编程场景中的高频需求，99在线工具大全为您精选多款文本处理在线工具，包括文本格式化、字符统计、大小写转换、文本去重、文本对比、查找替换等常用功能。无论您是文案编辑整理内容、程序员处理代码文本，还是数据分析师清洗数据，这些文本处理在线工具都能帮助您快速完成文本清洗、格式调整和内容整理。所有工具免费使用，无需注册，数据本地处理，全面保护隐私安全，是文案编辑、程序员和数据从业者的得力助手。",
  编码解码:
    "编码解码是开发与数据处理中不可或缺的环节，99在线工具大全提供多款编码解码在线工具，支持Base64编码解码、URL编码解码、HTML实体转换、Hex十六进制转换、Unicode转码等常用功能。无论您是处理网页特殊字符、解码加密数据，还是进行进制转换和字符集处理，这些编码解码在线工具都能一键完成。所有工具免费使用，无需注册登录，编解码过程在浏览器本地运行，数据不上传服务器，安全高效，是开发者、运维人员和数据工程师日常工作的必备工具。",
  二维码:
    "二维码已成为信息传递和移动支付的重要载体，99在线工具大全精选多款二维码在线工具，包括二维码生成器、二维码解码识别、带Logo二维码制作等功能。无论您需要生成网址、文本、WiFi、名片等内容的二维码用于信息分享，还是扫描识别已有二维码获取其中信息，这些二维码在线工具都能轻松完成。所有工具免费使用，无需安装，浏览器直接运行，生成和识别过程本地处理，安全高效，满足营销推广、活动签到和日常信息分享的多种场景需求。",
  密码生成:
    "密码安全是保护个人账户和数据的第一道防线，99在线工具大全提供专业的密码生成在线工具，支持自定义长度、字符类型和数量，一键生成高强度随机密码。无论您需要为邮箱、社交账号、支付账户设置安全密码，还是批量生成测试密码用于开发环境，这些密码生成在线工具都能快速完成。所有工具免费使用，密码在浏览器本地生成，不上传服务器，确保您的密码安全不被泄露，是保障账户安全、提升密码强度的实用工具。",
  正则表达式:
    "正则表达式是文本匹配和处理的强大工具，广泛应用于数据验证、文本提取和代码开发场景。99在线工具大全精选正则表达式在线工具，提供正则测试、匹配高亮、常用正则速查等功能，支持实时测试匹配结果和捕获分组。无论您是前端开发者验证表单输入，还是后端工程师处理日志数据，这些正则表达式在线工具都能帮助您快速编写和调试正则。所有工具免费使用，无需注册，测试过程本地运行，是开发者提升编码效率、掌握正则语法的得力助手。",
  单位换算:
    "单位换算是日常学习和工作中的常见需求，99在线工具大全提供全面的单位换算在线工具，支持长度、重量、面积、体积、温度、压力、速度等多种物理量的换算。无论您是学生做题需要进行单位转换，工程师计算工程数据，还是日常生活需要换算度量衡，这些单位换算在线工具都能快速给出精准结果。所有工具免费使用，无需注册，打开即用，换算过程实时本地完成，结果准确可靠，是学习、工作和生活中的实用换算助手。",
  图片编辑:
    "图片编辑是设计创作和日常图像处理的核心需求，99在线工具大全精选多款图片编辑在线工具，包括图片裁剪、缩放调整、旋转翻转、加水印、滤镜调色、格式转换等功能。无论您是设计师处理素材、运营人员制作配图，还是普通用户美化照片，这些图片编辑在线工具都能帮助您快速完成图像调整和处理。所有工具免费使用，处理过程在浏览器本地进行，图片不会上传服务器，全面保护隐私，无需安装专业软件即可满足日常图片编辑需求。",
  视频处理:
    "视频处理是多媒体创作中的关键环节，99在线工具大全提供多款视频处理在线工具，涵盖视频压缩、格式转换、视频裁剪、音频提取、GIF制作等功能。无论您是自媒体创作者处理短视频、营销人员压缩视频便于上传，还是需要从视频中提取音频素材，这些视频处理在线工具都能帮助您快速完成。所有工具免费使用，处理过程在浏览器本地进行，文件不上传服务器，安全高效，满足内容创作、视频优化和多媒体处理的多种场景需求。",
  音频处理:
    "音频处理在音乐制作、播客录制和多媒体开发中应用广泛，99在线工具大全精选多款音频处理在线工具，包括音频压缩、格式转换、音频裁剪、音频合并、音量调整等功能。无论您需要压缩音频文件体积、转换音频格式，还是剪辑合并音频片段，这些音频处理在线工具都能轻松完成。所有工具免费使用，处理过程在浏览器本地进行，音频文件不上传服务器，保护隐私安全，满足音乐创作、语音处理和多媒体开发的各种需求。",
  颜色工具:
    "颜色工具是设计师和前端开发者的必备助手，99在线工具大全提供多款颜色在线工具，包括颜色选择器、调色板生成、颜色格式转换、渐变色生成、取色器等功能。无论您进行网页设计需要获取配色方案，还是前端开发需要转换HEX、RGB、HSL等颜色格式，这些颜色在线工具都能帮助您快速完成。所有工具免费使用，浏览器即开即用，助力高效设计和开发，激发创作灵感，是UI设计、网页制作和品牌视觉创作的实用工具集。",
  "CSS工具":
    "CSS是网页样式开发的核心技术，99在线工具大全精选多款CSS在线工具，包括CSS生成器、渐变生成、阴影生成、圆角生成、CSS压缩美化、Flexbox布局生成等功能。无论您是前端开发者快速生成样式代码，还是设计师获取CSS效果参数，这些CSS在线工具都能帮助您提升开发效率。所有工具免费使用，无需安装，浏览器直接运行，生成的代码可一键复制使用，是前端开发者和网页设计师日常工作的得力助手。",
  房贷计算:
    "房贷计算是购房规划中的关键环节，99在线工具大全提供专业的房贷计算在线工具，支持等额本息和等额本金两种还款方式，可精确计算月供金额、总利息和还款总额。无论您是首次购房评估贷款压力，还是考虑提前还款比较方案，这些房贷计算在线工具都能帮助您做出明智决策。所有工具免费使用，计算过程本地完成，数据不上传服务器，全面保护您的财务隐私，是购房者和有房一族合理规划贷款还款的实用工具。",
  个税计算:
    "个税计算关系到每位工薪族的实际收入，99在线工具大全提供专业的个税计算在线工具，支持2026年最新个税税率，可计算累计预扣个税、年终奖个税和专项附加扣除。无论您想了解每月实际到手工资，还是规划年终奖发放方式，这些个税计算在线工具都能给出精准结果。所有工具免费使用，计算过程在浏览器本地完成，数据不上传服务器，保护您的收入隐私，是工薪族和HR进行个税测算的得力助手。",
  日期计算:
    "日期计算在项目管理和日程安排中经常用到，99在线工具大全提供多款日期计算在线工具，包括日期间隔计算、工作日计算、年龄计算、倒计时、日期加减等功能。无论您需要计算两个日期之间的天数、推算项目工期，还是设置重要事件倒计时，这些日期计算在线工具都能快速给出结果。所有工具免费使用，无需注册，打开即用，计算过程本地完成，是项目管理者、办公人员和日常生活安排的实用时间计算助手。",
  随机生成:
    "随机生成工具在开发测试和日常使用中需求广泛，99在线工具大全提供多款随机生成在线工具，包括随机密码生成、UUID生成、随机数生成、随机字符串、随机数据生成等功能。无论您是开发者生成测试数据、生成唯一标识符，还是需要随机抽取和模拟数据，这些随机生成在线工具都能一键完成。所有工具免费使用，生成过程在浏览器本地运行，数据不上传服务器，安全高效，满足开发调试、数据模拟和日常随机需求的多种场景。",
  格式化:
    "格式化工具是提升代码和数据可读性的重要助手，99在线工具大全精选多款格式化在线工具，支持JSON、XML、HTML、CSS、JavaScript、SQL等多种语言的格式化美化。无论您是开发者整理压缩后的代码，还是数据处理人员美化杂乱的JSON数据，这些格式化在线工具都能帮助您快速完成。所有工具免费使用，无需注册，格式化过程在浏览器本地运行，数据不上传服务器，保护隐私安全，是开发者、数据分析师提升工作效率的必备工具。",
};

/**
 * 生成标签相关工具的通用使用指南
 */
function getUsageGuide(tagName: string): string[] {
  return [
    `在上方${tagName}工具列表中浏览，找到您需要使用的工具，点击工具名称进入对应的工具页面。`,
    `仔细阅读工具页面的使用说明，在输入框中填入相应的内容、数值或上传需要处理的文件。`,
    `点击"执行"或相关操作按钮，工具将自动处理并实时显示结果，支持一键复制或下载导出。`,
    `如需使用其他${tagName}相关工具，可返回本标签页继续选择，所有在线工具均免费使用，无需注册。`,
  ];
}

/**
 * 标签页面 SEO 内容组件（服务端组件）
 *
 * 为每个标签页面提供专业的 SEO 内容，包含：
 * 1. 标签介绍（200-300字定制化描述）
 * 2. 工具列表概览（内链）
 * 3. 通用使用指南
 * 4. 底部 SEO 内链（链接到其他热门标签和14大分类）
 */
export default function TagSEOContent({
  tagName,
  tagSlug,
  toolCount,
}: TagSEOContentProps) {
  const tagTools = getToolsByTag(tagSlug);
  const intro =
    tagIntros[tagName] ??
    `${tagName}是99在线工具大全中的热门标签，汇集多款精选在线工具，全部免费使用，无需注册，打开即用，助力高效完成各类任务。`;
  const usageGuide = getUsageGuide(tagName);
  const otherTags = popularTags.filter((t) => t.slug !== tagSlug);
  const categoryList = categories.filter((c) => c.slug !== "all");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20 space-y-10 lg:space-y-14">
      {/* 板块1：标签介绍 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {tagName}在线工具介绍
          </h2>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg">
          {intro}
        </p>
      </section>

      {/* 板块2：工具列表概览 - 内链 */}
      {tagTools.length > 0 && (
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {tagName}工具列表
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm sm:text-base">
            本标签共收录 {toolCount} 款{tagName}相关工具，点击工具名称即可直接使用：
          </p>
          <div className="flex flex-wrap gap-2">
            {tagTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 text-sm text-zinc-700 dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tool.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 板块3：使用指南 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {tagName}工具使用指南
          </h2>
        </div>
        <div className="space-y-6">
          {usageGuide.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  {index + 1}
                </div>
                {index < usageGuide.length - 1 && (
                  <div className="w-0.5 h-full bg-gradient-to-b from-blue-400 to-transparent mx-auto mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed pt-1.5">
                  {step}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 板块4：底部 SEO 内链 - 其他热门标签和14大分类 */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            探索更多在线工具
          </h2>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base mb-6">
          99在线工具大全提供500+款免费在线工具，覆盖14大分类。除了{tagName}，您还可以探索以下热门标签和工具分类：
        </p>

        {/* 其他热门标签 */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            热门标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 14大分类 */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            工具分类
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryList.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-indigo-900/20">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
            99在线工具大全（99gongju.online）提供500+款免费在线工具，所有工具免费使用，无需注册，数据本地处理，安全可靠。收藏本站，随时使用更多实用在线工具。
          </p>
        </div>
      </section>
    </div>
  );
}
