"use client";

import Link from "next/link";
import {
  ShieldAlert,
  Home,
  ChevronRight,
  FileWarning,
  Shield,
  Lock,
  Scale,
  Server,
  Briefcase,
  AlertTriangle,
  FileCheck,
  UserCheck,
  FileX,
  Gavel,
  Info,
  Link as LinkIcon,
  Mail,
  ScrollText,
  type LucideIcon,
} from "lucide-react";

interface Section {
  icon: LucideIcon;
  title: string;
  color: string;
  bg: string;
  items: string[];
  subsections?: { title: string; items: string[] }[];
}

const sections: Section[] = [
  // 第一部分：总则
  {
    icon: ScrollText,
    title: "第一条 总则",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    items: [
      "1.1 欢迎使用 99在线工具（以下简称「本站」）。本免责声明是您使用本站服务前必须仔细阅读的重要文件。",
      "1.2 您在访问或使用本站提供的任何工具和服务之前，应当仔细阅读并充分理解本声明的全部内容。",
      "1.3 一旦您开始使用本站的任何服务，即视为您已阅读、理解并同意接受本声明的全部条款。如您不同意本声明的任何内容，请立即停止使用本站。",
      "1.4 本站有权根据法律法规的变化或自身运营需要，随时修改、更新本声明。修改后的声明自公布之日起生效，您继续使用本站服务即视为同意修改后的声明。",
      "1.5 本声明的标题仅为方便阅读而设，不影响条款的解释。",
    ],
  },

  // 第二部分：服务内容与限制
  {
    icon: Briefcase,
    title: "第二条 服务内容与使用限制",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    items: [
      "2.1 本站提供各类在线工具服务，包括但不限于文本处理、图片处理、PDF工具、编码转换、计算工具、开发工具等。具体以本站实际提供的功能为准。",
      "2.2 本站保留随时增加、修改、删除或暂停部分或全部工具服务的权利，无需事先通知用户，也不因此对用户承担任何责任。",
      "2.3 本站有权对免费用户的使用频率、次数、文件大小等进行合理限制，并可根据运营需要调整限制标准。",
      "2.4 如因系统维护、升级、故障等原因导致服务暂时中断的，本站不承担责任，但会尽力恢复服务。",
    ],
    subsections: [
      {
        title: "禁止使用行为",
        items: [
          "利用本站工具从事任何违反中华人民共和国法律法规的活动；",
          "上传、处理包含病毒、木马、恶意代码的文件；",
          "对本站进行逆向工程、反编译、破解或攻击；",
          "通过自动化手段（如爬虫、脚本、机器人）批量使用本站工具；",
          "侵犯他人知识产权、隐私权、名誉权等合法权益；",
          "传播违法、色情、暴力、恐怖等不良信息；",
          "其他可能损害本站或第三方合法权益的行为。",
        ],
      },
    ],
  },

  // 第三部分：工具结果准确性免责
  {
    icon: FileCheck,
    title: "第三条 工具结果准确性免责",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    items: [
      "3.1 本站所有工具的输出结果均由计算机算法自动生成，仅供用户参考，不构成任何形式的保证或承诺。",
      "3.2 本站不保证工具输出结果的准确性、完整性、及时性、可靠性，也不保证工具结果一定符合用户的预期。",
      "3.3 因算法差异、网络故障、浏览器兼容性、系统环境、文件格式等因素，可能导致工具输出结果与预期存在偏差，本站对此不承担责任。",
      "3.4 用户应自行判断和验证工具输出结果的正确性，因依赖本站工具结果作出的任何决策或行为，由用户自行承担后果。",
      "3.5 文件转换、格式处理类工具，不保证处理后的文件与原文件在格式、排版、质量上完全一致。",
      "3.6 OCR文字识别、AI生成类工具的输出结果可能存在误差，请用户自行核对后使用。",
    ],
  },

  // 第四部分：文件安全与数据隐私
  {
    icon: Lock,
    title: "第四条 文件安全与数据隐私",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    items: [
      "4.1 本站大部分工具在用户浏览器本地运行，不会将用户的文件上传到服务器。",
      "4.2 对于需要服务器处理的工具，本站会在工具页面明确标注，并采取合理的安全措施保护用户数据。",
      "4.3 本站承诺不会故意查看、复制、泄露、使用用户上传的文件内容，法律法规另有规定的除外。",
      "4.4 用户在公共设备或不安全的网络环境下使用本站工具的，应自行承担数据泄露风险。",
      "4.5 用户应确保上传的文件不包含敏感信息、个人隐私或商业机密，因上传敏感文件导致的损失由用户自行承担。",
      "4.6 因不可抗力、黑客攻击、系统故障等非本站主观原因导致用户数据泄露或丢失的，本站不承担责任。",
    ],
    subsections: [
      {
        title: "文件备份提示",
        items: [
          "使用本站任何工具处理文件前，请务必备份好原始文件；",
          "部分工具会对文件进行不可逆修改，修改后的文件可能无法恢复到原始状态；",
          "请在确认处理结果无误后再保存或覆盖原始文件；",
          "因文件损坏、丢失、内容错误等导致的任何损失，本站不承担责任。",
        ],
      },
    ],
  },

  // 第五部分：用户责任与义务
  {
    icon: UserCheck,
    title: "第五条 用户责任与义务",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    items: [
      "5.1 用户应合法使用本站服务，不得利用本站从事任何违法违规活动。",
      "5.2 用户应保证上传、输入到本站的所有内容（包括但不限于文件、文本、图片等）均合法，不侵犯任何第三方的合法权益。",
      "5.3 因用户上传内容引发的任何法律纠纷或索赔，由用户自行承担全部责任；如因此给本站造成损失的，用户应予以赔偿。",
      "5.4 用户不得注册多个账号恶意使用本站服务，不得通过任何方式规避本站的使用限制。",
      "5.5 用户如发现本站存在安全漏洞或违法内容，应及时向本站反馈。",
    ],
  },

  // 第六部分：责任限制
  {
    icon: FileX,
    title: "第六条 责任限制与损害赔偿",
    color: "text-red-500",
    bg: "bg-red-500/10",
    items: [
      "6.1 在法律允许的最大范围内，本站对因使用或无法使用本站服务所导致的任何直接损失不承担责任。",
      "6.2 本站对任何间接的、附带的、特殊的、衍生的或惩罚性的损害赔偿不承担责任，包括但不限于利润损失、业务中断、数据丢失、商誉受损等。",
      "6.3 无论本站是否被告知可能发生上述损害，本条免责条款均适用。",
      "6.4 如本站依法需承担赔偿责任的，赔偿总额不超过用户因使用本站付费服务已支付的费用（如有）。",
    ],
    subsections: [
      {
        title: "不可抗力免责",
        items: [
          "因不可抗力事件导致服务中断、数据丢失等情况的，本站不承担责任；",
          "不可抗力包括但不限于：自然灾害、战争、政府管制、网络攻击、电信运营商故障、电力中断、法律法规变化等；",
          "因上述原因导致服务暂停或终止的，本站不承担任何赔偿或补偿责任。",
        ],
      },
    ],
  },

  // 第七部分：知识产权
  {
    icon: Scale,
    title: "第七条 知识产权",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    items: [
      "7.1 本站的商标、Logo、域名、界面设计、程序代码、文字内容等，均受中华人民共和国知识产权法律法规保护，其相关权利归本站所有。",
      "7.2 未经本站书面授权，任何单位或个人不得复制、传播、镜像、修改、转载本站内容，不得将本站内容用于商业用途。",
      "7.3 用户通过本站工具处理的文件和数据，其知识产权归原权利人所有，本站不主张任何权利。",
      "7.4 本站所用的第三方图标、字体、库等资源，其知识产权归各自权利人所有。",
    ],
    subsections: [
      {
        title: "侵权投诉",
        items: [
          "如您认为本站内容侵犯了您的合法权益，请通过本声明末尾的联系方式与我们联系；",
          "投诉时请提供具体的侵权页面链接、权属证明、身份信息等材料；",
          "本站收到有效投诉后将及时核实处理，并根据情况采取删除、屏蔽等措施。",
        ],
      },
    ],
  },

  // 第八部分：第三方相关
  {
    icon: LinkIcon,
    title: "第八条 第三方链接与服务",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    items: [
      "8.1 本站可能包含指向第三方网站的链接，这些链接仅为方便用户获取更多信息而提供。",
      "8.2 本站不对第三方网站的内容真实性、准确性、合法性、安全性做任何保证，也不承担任何责任。",
      "8.3 用户访问第三方网站所产生的任何风险、损失或纠纷，由用户自行与第三方协商解决。",
      "8.4 本站可能展示第三方广告或推广内容，广告内容的真实性、合法性由广告主负责，本站不承担责任。",
      "8.5 本站部分功能可能依赖第三方服务（如CDN、统计服务等），因第三方服务故障导致的问题，本站不承担责任。",
    ],
  },

  // 第九部分：法律适用与争议解决
  {
    icon: Gavel,
    title: "第九条 法律适用与争议解决",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    items: [
      "9.1 本声明的订立、执行、解释及争议解决均适用中华人民共和国法律。",
      "9.2 因本声明或使用本站服务产生的任何争议，双方应首先友好协商解决。",
      "9.3 协商不成的，任何一方均可向本站运营方所在地有管辖权的人民法院提起诉讼。",
      "9.4 本声明的任何条款被有权机关认定为无效或不可执行的，不影响其他条款的效力，其他条款仍然有效并对双方具有约束力。",
    ],
  },

  // 第十部分：附则
  {
    icon: Info,
    title: "第十条 附则",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    items: [
      "10.1 本声明的最终解释权归本站所有。",
      "10.2 本声明未涉及的事项，以本站其他页面的公示为准；如与其他页面内容不一致的，以本声明为准。",
      "10.3 本站未行使或延迟行使本声明项下的任何权利，不构成对该权利的放弃。",
      "10.4 如对本声明有任何疑问、意见或建议，请通过以下联系方式与我们联系。",
    ],
  },
];

export default function DisclaimerContent() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f] to-[#09090b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-500/[0.08] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  首页
                </Link>
              </li>
              <ChevronRight className="w-3 h-3 text-slate-700" />
              <li>
                <span className="text-slate-300 font-medium">免责声明</span>
              </li>
            </ol>
          </nav>

          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-xl shadow-indigo-500/20 mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
              免责声明
            </h1>
            <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              使用 99在线工具 前请仔细阅读以下免责声明。
              <br className="hidden sm:block" />
              继续使用本站即表示您已阅读并同意全部条款。
            </p>
            <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
                <FileCheck className="w-3 h-3" />
                共 10 条条款
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                <AlertTriangle className="w-3 h-3" />
                最后更新：2026年7月
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-[#18181b]/60 rounded-xl border border-[#27272a] p-5">
          <p className="text-xs text-slate-500 mb-3">快速导航</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <a
                  key={index}
                  href={`#section-${index + 1}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 bg-[#27272a]/50 rounded-md hover:text-white hover:bg-[#3f3f46] transition-colors"
                >
                  <Icon className="w-3 h-3" />
                  第{index + 1}条
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                id={`section-${index + 1}`}
                className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 sm:p-7 hover:border-[#3f3f46] transition-colors scroll-mt-20"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${section.bg} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${section.color}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-white mb-4">
                      {section.title}
                    </h2>
                    <ul className="space-y-2.5">
                      {section.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-slate-400 leading-relaxed"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${section.bg.replace("/10", "/60")} mt-2 flex-shrink-0`}
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    {section.subsections &&
                      section.subsections.map((sub, si) => (
                        <div
                          key={si}
                          className="mt-5 pt-5 border-t border-[#27272a]"
                        >
                          <p className="text-sm font-medium text-white mb-3">
                            {sub.title}
                          </p>
                          <ul className="space-y-2">
                            {sub.items.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed"
                              >
                                <span className="text-slate-600 mt-0.5 flex-shrink-0">
                                  •
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="mt-8">
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 sm:p-7 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-500/10 mb-4">
              <Mail className="w-5 h-5 text-primary-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">
              联系方式
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              如对本声明有任何疑问、投诉或建议，请通过以下方式联系我们
            </p>
            <a
              href="mailto:2629676609@qq.com"
              className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <Mail className="w-4 h-4" />
              2629676609@qq.com
            </a>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </section>
    </div>
  );
}
