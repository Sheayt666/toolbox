"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Flower } from "lucide-react";

const ALLERGENS = [
  { name: "花粉", seasons: ["春季", "秋季"], allergens: ["树木花粉", "杂草花粉"], symptoms: ["打喷嚏", "流鼻涕", "眼睛痒"], prevention: ["外出戴口罩", "关窗减少花粉进入", "回家后洗脸洗手", "关注花粉指数预报"] },
  { name: "尘螨", seasons: ["全年", "夏季高发"], allergens: ["屋尘螨", "粉尘螨"], symptoms: ["鼻塞", "咳嗽", "皮肤瘙痒"], prevention: ["定期清洗床品(60°C热水)", "使用防螨床罩", "保持室内通风干燥", "减少地毯使用"] },
  { name: "霉菌", seasons: ["夏季", "梅雨季"], allergens: "霉菌孢子", symptoms: ["哮喘发作", "鼻塞", "呼吸困难"], prevention: ["保持室内干燥", "及时清理积水", "使用除湿机", "定期清洁卫生间"] },
  { name: "宠物皮屑", seasons: ["全年"], allergens: "猫狗皮屑、唾液", symptoms: ["皮肤红疹", "打喷嚏", "眼睛红肿"], prevention: ["不让宠物进卧室", "定期给宠物洗澡", "使用空气净化器", "接触后洗手"] },
  { name: "海鲜", seasons: ["全年"], allergens: "虾蟹贝类蛋白", symptoms: ["皮肤荨麻疹", "腹泻", "严重可致休克"], prevention: ["避免食用已知过敏食物", "外出就餐提前询问", "随身携带抗组胺药", "了解食物成分"] },
  { name: "药物", seasons: ["全年"], allergens: "青霉素、磺胺类等", symptoms: ["皮疹", "瘙痒", "严重可致过敏性休克"], prevention: ["就医时告知过敏史", "不自行使用抗生素", "注意药物交叉过敏", "随身携带过敏信息卡"] },
];

export default function AllergySeasonGuidePage() {
  const [selected, setSelected] = useState(0);
  const current = ALLERGENS[selected];

  return (
    <ToolLayout title="过敏季节指南" description="常见过敏季节和过敏原介绍，预防知识科普" toolId="allergy-season-guide" icon={Flower} category="健康医疗" slug="allergy-season-guide">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ALLERGENS.map((a, i) => (
            <button key={i} onClick={() => setSelected(i)} className={`px-3 py-2.5 rounded-lg text-sm border text-center transition-all ${selected === i ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400 hover:text-white"}`}>{a.name}</button>
          ))}
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center"><Flower className="w-6 h-6 text-primary-400" /></div>
            <div>
              <h3 className="text-lg font-bold text-white">{current.name}过敏</h3>
              <div className="flex flex-wrap gap-1 mt-1">
                {current.seasons.map((s) => <span key={s} className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#0d0d0f] rounded-lg p-4">
              <div className="text-sm font-semibold text-white mb-2">常见症状</div>
              <div className="space-y-1.5">
                {current.symptoms.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" />{s}</div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d0d0f] rounded-lg p-4">
              <div className="text-sm font-semibold text-white mb-2">过敏原</div>
              <div className="text-sm text-slate-400">{typeof current.allergens === "string" ? current.allergens : current.allergens.join("、")}</div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mt-4">
            <div className="text-sm font-semibold text-emerald-400 mb-2">预防措施</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {current.prevention.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300"><span className="text-emerald-400 mt-0.5">✓</span>{p}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">严重过敏反应（如呼吸困难、喉头水肿）可能危及生命，请立即拨打120或前往急诊。已知严重过敏者建议随身携带肾上腺素自动注射器。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
