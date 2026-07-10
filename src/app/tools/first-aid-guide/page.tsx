"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { HeartPulse } from "lucide-react";

const GUIDES = [
  { title: "心肺复苏 (CPR)", icon: "❤️", emergency: "心脏骤停", steps: ["确认环境安全，轻拍患者肩膀呼叫", "如无反应，立即拨打120", "将患者平放于坚硬地面", "双手交叠放在胸骨下半部，垂直下压5-6cm", "以每分钟100-120次频率按压", "每30次按压配合2次人工呼吸", "持续进行直到专业救援到达"], warning: "按压位置：两乳头连线中点。不要中断按压超过10秒。" },
  { title: "海姆立克急救法", icon: "窒息", emergency: "气道异物梗阻", steps: ["确认患者是否无法说话、咳嗽", "站在患者身后，环抱腰部", "一手握拳，拳眼放在肚脐上方", "另一手包住拳头，快速向上冲击", "重复进行直到异物排出", "对婴儿：用掌根拍击背部5次，再胸部按压5次"], warning: "如患者失去意识，立即开始CPR并拨打120。" },
  { title: "止血包扎", icon: "🩹", emergency: "外伤出血", steps: ["用干净纱布或布料直接按压伤口", "持续用力按压至少10分钟", "不要移除已浸血的纱布，在其上加新纱布", "用绷带固定包扎", "抬高受伤部位高于心脏", "如出血不止或动脉出血，立即就医"], warning: "不要用止血带除非四肢大动脉出血且无法控制。记录使用时间。" },
  { title: "烧伤烫伤", icon: "🔥", emergency: "烧烫伤", steps: ["立即用流动冷水冲洗15-20分钟", "不要用冰块直接接触伤口", "轻轻脱去伤口附近衣物(不要撕扯)", "用干净纱布覆盖伤口", "不要涂抹牙膏、酱油等物品", "大面积或深度烧伤立即就医"], warning: "化学烧伤需先用大量清水冲洗至少20分钟。" },
  { title: "骨折处理", icon: "🦴", emergency: "骨折", steps: ["不要移动受伤部位", "用木板、杂志等固定骨折处上下关节", "固定时不要过紧，保持血液循环", "冰敷减轻肿胀(不要直接接触皮肤)", "尽快送医检查", "开放性骨折先用干净布覆盖伤口"], warning: "疑似脊柱损伤不要移动患者，等待专业救援。" },
  { title: "中暑急救", icon: "☀️", emergency: "中暑", steps: ["将患者移至阴凉通风处", "解开衣物，平卧休息", "用湿毛巾擦拭身体降温", "在额头、腋下、腹股沟放置冰袋", "补充含盐凉水(少量多次)", "如意识模糊或高热不退，立即就医"], warning: "热射病是致命急症，核心体温超40°C需紧急降温。" },
  { title: "触电急救", icon: "⚡", emergency: "触电", steps: ["首先切断电源或用绝缘物挑开电线", "确认患者呼吸和心跳", "如无呼吸心跳，立即开始CPR", "拨打120", "检查有无烧伤，用干净布覆盖", "持续观察直到救援到达"], warning: "切勿在未切断电源时直接接触触电者！" },
  { title: "中毒急救", icon: "⚠️", emergency: "中毒", steps: ["立即拨打120并说明中毒物质", "保留毒物容器或样本供医生参考", "意识清醒者可饮用适量温水", "不要自行催吐(腐蚀性物质除外遵医嘱)", "如皮肤接触毒物，用大量清水冲洗", "如吸入毒气，移至空气新鲜处"], warning: "拨打120时务必告知中毒物质名称和量。" },
];

export default function FirstAidGuidePage() {
  const [selected, setSelected] = useState(0);
  const current = GUIDES[selected];

  return (
    <ToolLayout title="急救知识手册" description="常见急救知识速查，心肺复苏止血包扎等常识" toolId="first-aid-guide" icon={HeartPulse} category="健康医疗" slug="first-aid-guide">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center">
          <p className="text-sm text-rose-400 font-bold">紧急情况请立即拨打 120</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GUIDES.map((g, i) => (
            <button key={i} onClick={() => setSelected(i)} className={`px-3 py-2.5 rounded-lg text-sm border text-center transition-all ${selected === i ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400 hover:text-white"}`}>
              <div className="text-xl mb-1">{g.icon}</div>
              <div className="text-xs">{g.title}</div>
            </button>
          ))}
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{current.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-white">{current.title}</h3>
              <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded">{current.emergency}</span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {current.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold">{i + 1}</div>
                <div className="text-sm text-slate-300 pt-0.5">{step}</div>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <div className="text-sm font-semibold text-amber-400 mb-1">⚠ 注意事项</div>
            <p className="text-sm text-slate-300">{current.warning}</p>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4 text-center">
          <p className="text-xs text-slate-500">本手册仅供学习参考，不能替代专业医疗培训。建议参加红十字会急救培训课程获取认证。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
