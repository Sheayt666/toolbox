"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Sigma } from "lucide-react";

const FORMULAS: Record<string, { name: string; formulas: { label: string; formula: string }[] }> = {
  "代数": {
    name: "代数公式",
    formulas: [
      { label: "平方差", formula: "a² - b² = (a+b)(a-b)" },
      { label: "完全平方", formula: "(a±b)² = a² ± 2ab + b²" },
      { label: "完全立方", formula: "(a+b)³ = a³ + 3a²b + 3ab² + b³" },
      { label: "立方和", formula: "a³ + b³ = (a+b)(a²-ab+b²)" },
      { label: "立方差", formula: "a³ - b³ = (a-b)(a²+ab+b²)" },
      { label: "一元二次方程", formula: "x = (-b ± √(b²-4ac)) / 2a" },
      { label: "韦达定理", formula: "x₁+x₂ = -b/a, x₁·x₂ = c/a" },
      { label: "等差数列通项", formula: "aₙ = a₁ + (n-1)d" },
      { label: "等差数列求和", formula: "Sₙ = n(a₁+aₙ)/2" },
      { label: "等比数列通项", formula: "aₙ = a₁·q^(n-1)" },
      { label: "等比数列求和", formula: "Sₙ = a₁(1-qⁿ)/(1-q)" },
    ],
  },
  "几何": {
    name: "几何公式",
    formulas: [
      { label: "三角形面积", formula: "S = ½ × 底 × 高" },
      { label: "海伦公式", formula: "S = √(p(p-a)(p-b)(p-c)), p=(a+b+c)/2" },
      { label: "圆面积", formula: "S = πr²" },
      { label: "圆周长", formula: "C = 2πr" },
      { label: "扇形面积", formula: "S = (n/360)πr²" },
      { label: "弧长", formula: "L = (n/180)πr" },
      { label: "长方形面积", formula: "S = 长 × 宽" },
      { label: "梯形面积", formula: "S = (上底+下底) × 高 / 2" },
      { label: "球体积", formula: "V = (4/3)πr³" },
      { label: "球表面积", formula: "S = 4πr²" },
      { label: "圆柱体积", formula: "V = πr²h" },
      { label: "圆锥体积", formula: "V = (1/3)πr²h" },
    ],
  },
  "三角函数": {
    name: "三角函数公式",
    formulas: [
      { label: "正弦", formula: "sin A = 对边/斜边" },
      { label: "余弦", formula: "cos A = 邻边/斜边" },
      { label: "正切", formula: "tan A = 对边/邻边" },
      { label: "勾股定理", formula: "a² + b² = c²" },
      { label: "正弦定理", formula: "a/sinA = b/sinB = c/sinC = 2R" },
      { label: "余弦定理", formula: "c² = a² + b² - 2ab·cosC" },
      { label: "和角公式", formula: "sin(A±B) = sinAcosB ± cosAsinB" },
      { label: "和角公式", formula: "cos(A±B) = cosAcosB ∓ sinAsinB" },
      { label: "二倍角", formula: "sin2A = 2sinAcosA" },
      { label: "二倍角", formula: "cos2A = cos²A - sin²A" },
      { label: "平方关系", formula: "sin²A + cos²A = 1" },
    ],
  },
  "统计概率": {
    name: "统计与概率",
    formulas: [
      { label: "平均数", formula: "x̄ = (x₁+x₂+...+xₙ)/n" },
      { label: "方差", formula: "s² = Σ(xi-x̄)²/n" },
      { label: "标准差", formula: "s = √(s²)" },
      { label: "排列", formula: "A(n,m) = n!/(n-m)!" },
      { label: "组合", formula: "C(n,m) = n!/(m!(n-m)!)" },
      { label: "古典概率", formula: "P(A) = 有利事件数/总事件数" },
      { label: "加法公式", formula: "P(A∪B) = P(A)+P(B)-P(A∩B)" },
      { label: "条件概率", formula: "P(A|B) = P(A∩B)/P(B)" },
    ],
  },
};

export default function MathFormulaSheetPage() {
  const [category, setCategory] = useState("代数");
  const [search, setSearch] = useState("");
  const current = FORMULAS[category];

  const filtered = search
    ? Object.values(FORMULAS).flatMap(c => c.formulas).filter(f => f.label.includes(search) || f.formula.includes(search))
    : current.formulas;

  return (
    <ToolLayout title="数学公式大全" description="中小学常用数学公式速查表，分类整理方便查阅" toolId="math-formula-sheet" icon={Sigma} category="教育学习" slug="math-formula-sheet">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">搜索公式</label>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="输入关键词搜索..." className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
        </div>

        {!search && (
          <div className="flex flex-wrap gap-2">
            {Object.keys(FORMULAS).map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2.5 rounded-lg text-sm border transition-all ${category === cat ? "bg-primary-500/20 border-primary-500 text-primary-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400 hover:text-white"}`}>{cat}</button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((f, i) => (
            <div key={i} className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4 hover:border-primary-500/30 transition-all">
              <div className="text-sm font-medium text-white mb-1">{f.label}</div>
              <div className="text-sm text-primary-400 font-mono">{f.formula}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="text-center text-sm text-slate-500 py-8">未找到匹配的公式</div>}
      </div>
    </ToolLayout>
  );
}
