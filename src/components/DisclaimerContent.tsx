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
  UpdateIcon,
  Globe,
  AlertTriangle,
} from "lucide-react";

export default function DisclaimerContent() {
  const sections = [
    {
      icon: FileWarning,
      title: "一、文件安全免责",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      items: [
        "使用本站任何工具处理文件前，请务必备份好原始文件。",
        "部分工具（包括但不限于图片压缩、格式转换、PDF处理、视频剪辑等）会对文件进行不可逆修改，修改后的文件可能无法恢复到原始状态。",
        "因文件损坏、丢失、内容错误等导致的任何损失，本站不承担任何责任。",
        "请在确认处理结果无误后再保存或覆盖原始文件。",
      ],
    },
    {
      icon: Shield,
      title: "二、使用风险自担",
      color: "text-red-500",
      bg: "bg-red-500/10",
      items: [
        "本站所有工具的输出结果均由计算机算法自动生成，仅供参考。",
        "因网络故障、算法差异、浏览器兼容性、系统环境等因素，不保证输出结果完全准确或符合预期。",
        "因使用本站工具导致的任何直接或间接损失（包括但不限于文件丢失、数据损坏、业务中断、利润损失等），本站不承担任何法律责任。",
        "用户应自行判断工具输出结果的准确性和适用性，因依赖本站工具造成的决策失误由用户自行承担。",
      ],
    },
    {
      icon: Lock,
      title: "三、隐私与数据安全",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      items: [
        "本站大部分工具均在您的浏览器本地运行，不会将您的文件上传到任何服务器。",
        "对于需要服务器处理的工具，我们会在工具页面明确说明，并采取合理的安全措施保护您的数据。",
        "请勿在公共设备或不安全的网络环境下处理包含敏感信息的文件。",
        "用户应自行对上传的文件内容负责，确保不涉及任何违法、侵权或敏感内容。",
      ],
    },
    {
      icon: Scale,
      title: "四、使用范围限制",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      items: [
        "本站工具仅供个人学习、研究和日常工作使用。",
        "不得将本站工具用于任何违法活动，包括但不限于：侵犯他人知识产权、非法获取数据、传播恶意软件、网络攻击等。",
        "不得利用本站工具进行大规模商业用途或批量自动化操作。",
        "不得对本站工具进行逆向工程、反编译、二次开发或恶意攻击。",
        "违反上述规定的，本站有权停止服务并保留追究法律责任的权利。",
      ],
    },
    {
      icon: Server,
      title: "五、服务可用性",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      items: [
        "本站尽力保证服务的稳定性和可用性，但不保证服务不会中断或完全无故障。",
        "因服务器维护、网络故障、不可抗力等原因导致服务暂时中断的，本站不承担责任。",
        "本站保留随时修改、暂停或终止部分或全部服务的权利，无需事先通知。",
        "本站工具可能随时更新或调整功能，具体以实际提供的版本为准。",
      ],
    },
    {
      icon: UpdateIcon,
      title: "六、知识产权",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
      items: [
        "本站的商标、Logo、界面设计、代码等均受知识产权法律保护。",
        "未经授权，不得复制、传播、镜像本站内容或用于商业用途。",
        "用户使用本站工具处理的文件内容，其知识产权归原权利人所有，本站不主张任何权利。",
        "如您认为本站内容侵犯了您的合法权益，请联系我们核实处理。",
      ],
    },
    {
      icon: Globe,
      title: "七、第三方链接",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      items: [
        "本站可能包含指向第三方网站的链接，这些链接仅为方便用户而提供。",
        "本站不对第三方网站的内容、服务、隐私政策等承担任何责任。",
        "用户访问第三方网站所产生的任何风险由用户自行承担。",
      ],
    },
    {
      icon: AlertTriangle,
      title: "八、其他条款",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      items: [
        "本站有权随时修改本免责声明，修改后的声明自发布之日起生效。",
        "继续使用本站服务即视为您同意本免责声明的全部内容。",
        "本免责声明的解释权归本站所有。",
        "如对本声明有任何疑问，请通过页面底部的联系方式与我们联系。",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-10 pb-8">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f] to-[#09090b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-amber-500/[0.08] rounded-full blur-[80px] pointer-events-none" />

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
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl shadow-amber-500/20 mb-4">
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
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              最后更新：2026年7月
            </div>
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
                className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 sm:p-7 hover:border-[#3f3f46] transition-colors"
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
                          <span className={`w-1.5 h-1.5 rounded-full ${section.bg.replace('/10', '/60')} mt-2 flex-shrink-0`} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Notice */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-[#18181b] rounded-xl border border-[#27272a] px-6 py-4">
            <p className="text-sm text-slate-400">
              如有疑问，请联系
              <a
                href="mailto:2629676609@qq.com"
                className="text-amber-400 hover:text-amber-300 transition-colors ml-1"
              >
                2629676609@qq.com
              </a>
            </p>
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
