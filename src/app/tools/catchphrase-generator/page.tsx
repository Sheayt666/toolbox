"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Megaphone, Copy, Check, RefreshCw, Sparkles } from "lucide-react";

type SloganCategory = "business" | "tech" | "fashion" | "food" | "education" | "all";

interface SloganTemplate {
  template: string;
  category: Exclude<SloganCategory, "all">;
}

const brandWords = {
  business: [
    "卓越", "创新", "领航", "共赢", "辉煌", "荣耀", "传奇", "巅峰",
    "精英", "专业", "品质", "诚信", "高效", "卓越", "领先", "突破",
    "变革", "未来", "梦想", "成就", "价值", "实力", "格局", "视野",
  ],
  tech: [
    "智能", "科技", "数字", "云端", "数据", "算法", "互联", "创新",
    "前沿", "未来", "智慧", "赋能", "驱动", "变革", "极客", "黑科技",
    "AI", "区块链", "元宇宙", "量子", "纳米", "生物", "新能源", "航天",
  ],
  fashion: [
    "时尚", "潮流", "个性", "品味", "优雅", "精致", "奢华", "经典",
    "魅力", "风采", "格调", "气质", "风范", "韵味", "灵动", "璀璨",
    "梦幻", "浪漫", "自由", "独立", "自信", "美丽", "闪耀", "绽放",
  ],
  food: [
    "美味", "鲜香", "地道", "正宗", "匠心", "古法", "秘制", "绝味",
    "麻辣", "鲜香", "酸甜", "酥脆", "软糯", "清爽", "浓郁", "醇厚",
    "舌尖", "味蕾", "盛宴", "佳肴", "珍馐", "美食", "好味", "食光",
  ],
  education: [
    "知识", "智慧", "启迪", "传承", "创新", "卓越", "梦想", "未来",
    "成长", "突破", "探索", "发现", "学习", "思考", "创造", "实践",
    "才华", "天赋", "潜能", "精英", "栋梁", "人才", "名师", "高徒",
  ],
};

const sloganTemplates: SloganTemplate[] = [
  // 四字对仗
  { template: "{word1}{word2}，{word3}{word4}", category: "business" },
  { template: "{word1}以{word2}，{word3}以{word4}", category: "business" },
  { template: "{word1}{word2}天下，{word3}{word4}未来", category: "business" },
  { template: "{word1}无止境，{word2}无边界", category: "tech" },
  { template: "用{word1}定义{word2}", category: "tech" },
  { template: "{word1}改变世界，{word2}创造未来", category: "tech" },
  { template: "不止于{word1}，更超越{word2}", category: "tech" },
  { template: "{word1}你的{word2}", category: "fashion" },
  { template: "{word1}，是一种{word2}", category: "fashion" },
  { template: "{word1}由内而外，{word2}与生俱来", category: "fashion" },
  { template: "每一口都是{word1}", category: "food" },
  { template: "{word1}的味道，{word2}的记忆", category: "food" },
  { template: "传承{word1}，坚守{word2}", category: "food" },
  { template: "{word1}点亮{word2}", category: "education" },
  { template: "以{word1}育{word2}", category: "education" },
  { template: "{word1}成就梦想，{word2}铸就未来", category: "education" },
  // 更多模板
  { template: "{word1}，{word2}", category: "business" },
  { template: "因为{word1}，所以{word2}", category: "business" },
  { template: "{word1}创造{word2}", category: "tech" },
  { template: "{word1}驱动{word2}", category: "tech" },
  { template: "你的{word1}，我的{word2}", category: "fashion" },
  { template: "{word1}生活，{word2}人生", category: "fashion" },
  { template: "{word1}的秘密", category: "food" },
  { template: "{word1}不可负", category: "food" },
  { template: "{word1}的力量", category: "education" },
  { template: "{word1}伴你成长", category: "education" },
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function CatchphraseGeneratorPage() {
  const [category, setCategory] = useState<SloganCategory>("all");
  const [count, setCount] = useState(12);
  const [slogans, setSlogans] = useState<{ id: string; text: string }[]>([]);
  const [copied, setCopied] = useState(false);

  const generateSlogan = useCallback((cat: SloganCategory): string => {
    const templates = cat === "all"
      ? sloganTemplates
      : sloganTemplates.filter((t) => t.category === cat);
    const template = pickRandom(templates);

    // Get word list based on template category
    const wordList = brandWords[template.category];

    let result = template.template;
    let match;
    const regex = /\{word(\d)\}/g;
    while ((match = regex.exec(template.template)) !== null) {
      const word = pickRandom(wordList);
      result = result.replace(match[0], word);
    }

    return result;
  }, []);

  const generate = useCallback(() => {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push({
        id: generateId(),
        text: generateSlogan(category),
      });
    }
    setSlogans(results);
  }, [category, count, generateSlogan]);

  const copyAll = useCallback(() => {
    const text = slogans.map((s) => s.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [slogans]);

  const categoryOptions: { value: SloganCategory; label: string }[] = [
    { value: "all", label: "全部" },
    { value: "business", label: "商业" },
    { value: "tech", label: "科技" },
    { value: "fashion", label: "时尚" },
    { value: "food", label: "美食" },
    { value: "education", label: "教育" },
  ];

  return (
    <ToolLayout
      title="口号标语生成器"
      description="一键生成创意口号标语，涵盖商业、科技、时尚、美食、教育等多个行业"
      icon={Megaphone}
      category="生成工具"
      slug="catchphrase-generator"
      toolId="catchphrase-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-white">口号生成</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-orange-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            生成口号
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 分类选择 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            行业分类
          </label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCategory(opt.value)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  category === opt.value
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 数量 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-slate-300">生成数量</label>
            <span className="text-sm font-mono text-orange-400">{count} 条</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        {/* 结果 */}
        {slogans.length > 0 && (
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
              <span className="text-sm font-medium text-white">
                生成结果 ({slogans.length})
              </span>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    已复制全部
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制全部
                  </>
                )}
              </button>
            </div>
            <div className="divide-y divide-[#27272a]">
              {slogans.map((s, idx) => (
                <div
                  key={s.id}
                  className="px-4 py-3 hover:bg-[#18181b] transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-6 text-right">
                      {idx + 1}.
                    </span>
                    <span className="text-white">{s.text}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(s.text);
                    }}
                    className="p-1.5 text-slate-600 hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {slogans.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">点击「生成口号」按钮开始生成</p>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持 5 大行业分类：商业、科技、时尚、美食、教育</li>
          <li>• 基于多种经典标语模板 + 行业关键词组合生成创意口号</li>
          <li>• 生成结果仅供灵感参考，建议根据实际需求进行修改优化</li>
          <li>• 可一键复制全部，也可单独复制喜欢的口号</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
