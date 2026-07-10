import Link from "next/link";
import { BookOpen, ListOrdered, Wrench } from "lucide-react";
import { categories, getToolsByCategory } from "@/lib/tools";

interface CategorySEOContentProps {
  categoryName: string;
  categorySlug: string;
  toolCount: number;
}

/**
 * 14 个分类的定制化介绍描述
 * 每段 200-300 字，自然融入"在线工具""工具大全""99在线工具"等核心关键词
 */
const categoryIntros: Record<string, string> = {
  计算工具:
    "计算工具是99在线工具大全中的核心分类之一，汇集了房贷计算器、个税计算器、BMI计算器、年龄计算器、单位换算器等各类常用计算在线工具。无论您需要计算房贷月供、个人所得税、身体质量指数，还是进行单位换算与数值运算，这里都能找到合适的工具。所有计算工具均为免费在线工具，无需下载安装，打开浏览器即可使用，计算过程在本地完成，数据不上传服务器，安全可靠。99在线工具持续更新计算工具集合，助力您高效完成各类计算任务。",
  文本工具:
    "文本工具分类汇聚了99在线工具大全中所有文字处理相关的在线工具，包括文本格式化、字符统计、大小写转换、文本去重、编码解码等常用功能。在日常办公、编程开发、内容创作场景中，文本处理是高频需求，99在线工具为您精选多款实用的文本在线工具，帮助您快速完成文本清洗、格式调整和内容整理。所有工具免费使用，无需注册，数据本地处理，保障隐私安全，是文案编辑和程序员的得力助手。",
  生成工具:
    "生成工具是99在线工具大全中的热门分类，提供二维码生成、密码生成、UUID生成、条形码生成、假数据生成等多种在线工具。无论您需要生成安全的随机密码、创建二维码用于信息分享，还是批量生成测试数据用于开发调试，这些生成器在线工具都能一键完成。99在线工具的生成工具全部免费，无需安装，浏览器直接运行，生成过程本地处理，安全高效，满足开发、运营和日常使用的多种场景需求。",
  转换工具:
    "转换工具分类汇集了99在线工具大全中各类格式转换在线工具，涵盖JSON与XML互转、CSV转JSON、HTML转Markdown、编码转换、单位换算等常用功能。在日常开发和数据处理中，格式转换是常见需求，99在线工具精选多款高质量转换工具，帮助您快速完成不同格式之间的转换。所有转换工具免费使用，无需注册，数据本地处理，保护隐私，让格式转换变得简单高效。",
  设计工具:
    "设计工具分类是99在线工具大全为设计师和开发者打造的专业在线工具集合，包括颜色选择器、调色板生成、渐变生成器、CSS生成工具、字体搭配等实用工具。无论您进行网页设计、UI设计还是品牌视觉创作，这些设计在线工具都能帮助您快速获取配色方案、生成CSS代码、优化视觉效果。99在线工具的设计工具全部免费，浏览器即开即用，助力高效设计，激发创作灵感。",
  图片工具:
    "图片工具是99在线工具大全中使用频率最高的分类之一，提供图片压缩、图片裁剪、格式转换、背景去除、图片加水印等在线工具。无论是网页优化需要压缩图片体积，还是社交媒体需要裁剪调整尺寸，99在线工具的图片处理在线工具都能轻松应对。所有图片工具免费使用，处理过程在浏览器本地完成，图片不会上传服务器，全面保护您的隐私和数据安全。",
  生活工具:
    "生活工具分类汇聚了99在线工具大全中与日常生活相关的实用在线工具，包括日期计算、倒计时、单位换算、汇率换算、节假日查询等。无论是计算两个日期之间的天数、设置重要事件倒计时，还是查询汇率和节假日信息，这些生活在线工具都能为您提供便利。99在线工具持续丰富生活工具集合，让日常计算和查询更加便捷高效，全部免费使用，打开即用。",
  开发工具:
    "开发工具是99在线工具大全为程序员专门打造的专业分类，涵盖JSON格式化、正则表达式测试、Base64编解码、HTTP状态码查询、Git命令速查等在线工具。在日常开发中，这些开发在线工具能显著提升编码效率，帮助您快速格式化代码、测试正则、调试接口。99在线工具的开发工具全部免费，无需登录，浏览器直接运行，是开发者不可或缺的高效工具箱。",
  PDF工具:
    "PDF工具分类汇集了99在线工具大全中所有PDF处理相关的在线工具，包括PDF转Word、PDF合并拆分、PDF压缩、Excel转PDF、HTML转PDF等功能。PDF作为通用文档格式，转换和处理需求频繁，99在线工具精选多款PDF在线工具，帮助您快速完成文档格式转换与编辑。所有PDF工具免费使用，处理过程安全可靠，助力高效办公，满足学习、工作和生活中的文档处理需求。",
  查询工具:
    "查询工具分类是99在线工具大全中的实用信息查询集合，提供IP查询、手机号归属地、邮编查询、区号查询、节假日查询等在线工具。无论您需要查询IP地址信息、手机归属地，还是了解区号邮编，这些查询在线工具都能快速给出结果。99在线工具的查询工具覆盖多种常用查询场景，全部免费使用，打开即查，方便快捷，是日常信息查询的实用助手。",
  教育学习:
    "教育学习分类是99在线工具大全为学习者和教育者打造的学习辅助在线工具集合，包括成语词典、古诗查询、英语语法、化学元素、历史时间轴等。无论您是学生备考、教师备课，还是自学者拓展知识，99在线工具的教育学习在线工具都能提供帮助。所有工具免费使用，无需注册，助力高效学习和知识探索，让学习变得更加轻松有趣。",
  金融理财:
    "金融理财分类汇聚了99在线工具大全中与财务计算相关的在线工具，包括房贷计算、个税计算、理财收益、基金回报、汇率换算等。无论是规划房贷还款、计算投资收益，还是进行汇率换算，99在线工具的金融理财在线工具都能提供精准计算。所有工具免费使用，计算过程本地完成，帮助您做出更明智的理财决策，合理规划个人财务。",
  健康医疗:
    "健康医疗分类是99在线工具大全为关注健康的用户打造的在线工具集合，包括BMI计算、卡路里计算、基础代谢率、血压记录、孕期计算等。无论是评估体重健康状况、计算每日热量需求，还是记录健康数据，99在线工具的健康医疗在线工具都能提供科学参考。所有工具免费使用，数据本地处理，保护隐私，助力健康生活，帮助您更好地管理个人健康。",
  视频音频:
    "视频音频分类汇集了99在线工具大全中所有音视频处理相关的在线工具，包括音频压缩、音频裁剪、音频合并、视频转换、音频提取等。无论是处理音频文件、调整音视频参数，还是提取视频中的音频，99在线工具的视频音频在线工具都能轻松完成。所有工具免费使用，处理过程在浏览器本地进行，文件不上传，安全高效，满足多媒体创作的多种需求。",
};

/**
 * 生成分类通用使用指南
 * 适用于该分类下的所有工具
 */
function getUsageGuide(categoryName: string): string[] {
  return [
    `在上方${categoryName}列表中浏览，找到您需要使用的工具，点击工具卡片进入对应的工具页面。`,
    `仔细阅读工具页面的使用说明，在指定输入框中填入相应的内容、数值或上传需要处理的文件。`,
    `点击"执行"或相关操作按钮，工具将自动处理并实时显示结果，支持一键复制或下载导出。`,
    `如需使用其他${categoryName}，可返回本分类页面继续选择，所有在线工具均免费使用，无需注册。`,
  ];
}

/**
 * 分类页面 SEO 内容组件（服务端组件）
 *
 * 为每个分类页面提供专业的 SEO 内容，包含：
 * 1. 分类介绍（200-300字定制化描述）
 * 2. 工具列表概览（内链）
 * 3. 通用使用指南
 * 4. 底部 SEO 内链（链接到其他分类）
 */
export default function CategorySEOContent({
  categoryName,
  categorySlug,
  toolCount,
}: CategorySEOContentProps) {
  const categoryTools = getToolsByCategory(categoryName);
  const intro =
    categoryIntros[categoryName] ??
    `${categoryName}是99在线工具大全中的实用分类，汇集多款精选在线工具，全部免费使用，无需注册，打开即用，助力高效完成各类任务。`;
  const usageGuide = getUsageGuide(categoryName);
  const otherCategories = categories.filter(
    (c) => c.slug !== "all" && c.slug !== categorySlug
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20 space-y-10 lg:space-y-14">
      {/* 分类介绍 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {categoryName}介绍
          </h2>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg">
          {intro}
        </p>
      </section>

      {/* 工具列表概览 - 内链 */}
      {categoryTools.length > 0 && (
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {categoryName}工具列表
            </h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm sm:text-base">
            本分类共收录 {toolCount} 款{categoryName}，点击工具名称即可直接使用：
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.path}
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

      {/* 使用指南 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {categoryName}使用指南
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

      {/* 底部 SEO 内链 - 其他分类 */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            探索更多在线工具分类
          </h2>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base mb-6">
          99在线工具大全提供500+款免费在线工具，覆盖14大分类。除了{categoryName}，您还可以探索以下分类的在线工具：
        </p>
        <div className="flex flex-wrap gap-2">
          {otherCategories.map((cat) => {
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
        <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-indigo-900/20">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
            99在线工具大全（99gongju.online）提供500+款免费在线工具，所有工具免费使用，无需注册，数据本地处理，安全可靠。收藏本站，随时使用更多实用在线工具。
          </p>
        </div>
      </section>
    </div>
  );
}
