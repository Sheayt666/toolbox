"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Heart, Search } from "lucide-react";

interface Organ {
  name: string;
  enName: string;
  system: string;
  location: string;
  function: string;
}

const ORGANS: Organ[] = [
  { name: "心脏", enName: "Heart", system: "循环系统", location: "胸腔中部偏左", function: "泵血，将血液输送到全身" },
  { name: "大脑", enName: "Brain", system: "神经系统", location: "颅腔内", function: "思维、控制、记忆、感知" },
  { name: "肺", enName: "Lungs", system: "呼吸系统", location: "胸腔两侧", function: "气体交换，吸入氧气排出二氧化碳" },
  { name: "肝脏", enName: "Liver", system: "消化系统", location: "腹腔右上部", function: "解毒、代谢、合成蛋白质" },
  { name: "胃", enName: "Stomach", system: "消化系统", location: "腹腔上部", function: "消化食物，分泌胃酸" },
  { name: "肾脏", enName: "Kidneys", system: "泌尿系统", location: "腰部两侧", function: "过滤血液，产生尿液" },
  { name: "脾脏", enName: "Spleen", system: "免疫系统", location: "左上腹", function: "过滤血液，免疫应答" },
  { name: "小肠", enName: "Small Intestine", system: "消化系统", location: "腹腔中部", function: "吸收营养，消化食物" },
  { name: "大肠", enName: "Large Intestine", system: "消化系统", location: "腹腔周围", function: "吸收水分，形成粪便" },
  { name: "胰腺", enName: "Pancreas", system: "消化系统", location: "胃后方", function: "分泌消化酶和胰岛素" },
  { name: "膀胱", enName: "Bladder", system: "泌尿系统", location: "盆腔内", function: "储存尿液" },
  { name: "甲状腺", enName: "Thyroid", system: "内分泌系统", location: "颈部前方", function: "分泌甲状腺激素，调节代谢" },
  { name: "眼睛", enName: "Eyes", system: "感觉系统", location: "面部", function: "视觉感知" },
  { name: "耳朵", enName: "Ears", system: "感觉系统", location: "头部两侧", function: "听觉和平衡" },
  { name: "皮肤", enName: "Skin", system: "皮肤系统", location: "全身表面", function: "保护、感知、调节体温" },
  { name: "骨骼", enName: "Skeleton", system: "骨骼系统", location: "全身", function: "支撑身体、保护内脏" },
  { name: "肌肉", enName: "Muscles", system: "肌肉系统", location: "全身", function: "运动、维持姿势" },
  { name: "脊髓", enName: "Spinal Cord", system: "神经系统", location: "脊柱内", function: "传递神经信号" },
  { name: "气管", enName: "Trachea", system: "呼吸系统", location: "颈部和胸腔", function: "输送空气到肺部" },
  { name: "食道", enName: "Esophagus", system: "消化系统", location: "颈部到胃", function: "输送食物到胃" },
];

export default function AnatomyBasicsPage() {
  const [query, setQuery] = useState("");
  const [systemFilter, setSystemFilter] = useState("全部");

  const systems = useMemo(() => ["全部", ...Array.from(new Set(ORGANS.map((o) => o.system)))], []);
  const filtered = useMemo(() => {
    let r = ORGANS;
    if (systemFilter !== "全部") r = r.filter((o) => o.system === systemFilter);
    if (query.trim()) r = r.filter((o) => o.name.includes(query) || o.enName.toLowerCase().includes(query.toLowerCase()) || o.function.includes(query));
    return r;
  }, [query, systemFilter]);

  return (
    <ToolLayout title="人体结构认知" description="认识人体各器官和系统名称位置" icon={Heart} category="教育学习" slug="anatomy-basics">
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索器官名称或功能..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {systems.map((s) => (
            <button key={s} onClick={() => setSystemFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${systemFilter === s ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((o, i) => (
            <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-white font-medium">{o.name}</div>
                  <div className="text-xs text-slate-500">{o.enName}</div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded ml-auto">{o.system}</span>
              </div>
              <div className="text-sm text-slate-400 mb-1">位置: <span className="text-slate-300">{o.location}</span></div>
              <div className="text-sm text-slate-400">功能: <span className="text-slate-300">{o.function}</span></div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
