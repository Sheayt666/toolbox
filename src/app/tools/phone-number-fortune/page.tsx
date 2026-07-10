"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Smartphone } from "lucide-react";

const NUMBER_MEANINGS: Record<number, string> = {
  1: "独立、领导力、新的开始",
  2: "和谐、合作、平衡",
  3: "创意、表达、社交",
  4: "稳定、勤奋、务实",
  5: "变化、自由、冒险",
  6: "关爱、家庭、责任",
  7: "智慧、内省、灵性",
  8: "财富、权力、成功",
  9: "博爱、 Completion、智慧",
  0: "无限、潜能、圆满",
};

function calculateFortune(phone: string): { score: number; analysis: string[]; lucky: boolean } {
  const digits = phone.split("").map(Number).filter((n) => !isNaN(n));
  const sum = digits.reduce((a, b) => a + b, 0);
  const score = Math.floor((sum % 100) + 1);
  const analysis: string[] = [];

  // Count digit frequencies
  const freq: Record<number, number> = {};
  digits.forEach((d) => { freq[d] = (freq[d] || 0) + 1; });

  // Check for special patterns
  const has8 = freq[8] >= 2;
  const has6 = freq[6] >= 2;
  const has9 = freq[9] >= 2;
  const has4 = freq[4] >= 2;

  analysis.push(`号码数字总和: ${sum}，数字能量值: ${score}`);
  analysis.push(`数字${sum % 9 || 9}的能量: ${NUMBER_MEANINGS[sum % 9 || 9]}`);

  if (has8) analysis.push("多个8出现，财运旺盛，适合经商投资");
  if (has6) analysis.push("多个6出现，家庭和睦，人缘极佳");
  if (has9) analysis.push("多个9出现，事业有成，智慧超群");
  if (has4) analysis.push("多个4出现，做事稳健，但需注意变通");

  // Check consecutive numbers
  let consecutive = 0;
  for (let i = 0; i < digits.length - 1; i++) {
    if (digits[i + 1] === digits[i] + 1) consecutive++;
  }
  if (consecutive >= 2) analysis.push("含顺子号码，运势步步高升");

  // Check repeating numbers
  let pairs = 0;
  for (let i = 0; i < digits.length - 1; i++) {
    if (digits[i + 1] === digits[i]) pairs++;
  }
  if (pairs >= 2) analysis.push("含对子号码，贵人相助，好事成双");

  if (score >= 80) analysis.push("总体评价: 吉星高照，号码能量极佳！");
  else if (score >= 60) analysis.push("总体评价: 运势不错，号码能量良好");
  else if (score >= 40) analysis.push("总体评价: 平稳发展，号码能量中等");
  else analysis.push("总体评价: 需要注意，建议多做善事积累正能量");

  return { score, analysis, lucky: score >= 60 };
}

export default function PhoneNumberFortunePage() {
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{ score: number; analysis: string[]; lucky: boolean } | null>(null);

  const handleCalculate = () => {
    if (phone.trim().length < 4) return;
    setResult(calculateFortune(phone.trim()));
  };

  return (
    <ToolLayout title="手机号吉凶" description="手机号码数字能量测算" icon={Smartphone} category="生活工具" slug="phone-number-fortune">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex gap-3 mb-6">
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="输入手机号码" maxLength={11} className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono text-lg" />
            <button onClick={handleCalculate} disabled={phone.trim().length < 4} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">测算</button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className={`p-6 rounded-2xl text-center ${result.lucky ? "bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20" : "bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20"}`}>
                <div className="text-sm text-slate-400 mb-2">吉凶指数</div>
                <div className={`text-6xl font-bold mb-2 ${result.lucky ? "text-emerald-400" : "text-orange-400"}`}>{result.score}</div>
                <div className={`text-lg font-medium ${result.lucky ? "text-emerald-400" : "text-orange-400"}`}>{result.score >= 80 ? "大吉" : result.score >= 60 ? "吉" : result.score >= 40 ? "中平" : "需注意"}</div>
              </div>

              <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl">
                <h4 className="text-sm font-medium text-slate-400 mb-3">详细分析</h4>
                <div className="space-y-2">
                  {result.analysis.map((text, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-primary-400 mt-0.5">•</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                <h4 className="text-sm font-medium text-slate-400 mb-2">数字含义参考</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(NUMBER_MEANINGS).map(([num, meaning]) => (
                    <div key={num} className="flex items-center gap-2 text-xs">
                      <span className="w-5 h-5 rounded bg-primary-500/10 text-primary-400 flex items-center justify-center font-bold">{num}</span>
                      <span className="text-slate-400">{meaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-xs text-amber-400/80">本工具仅供娱乐参考，数字吉凶无科学依据，请理性看待。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
