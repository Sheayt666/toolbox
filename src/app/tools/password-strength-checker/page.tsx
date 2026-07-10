"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ShieldCheck, Check, X, Eye, EyeOff } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface CheckItem {
  label: string;
  passed: boolean;
}

function analyze(pw: string) {
  const checks: CheckItem[] = [
    { label: "至少 8 位长度", passed: pw.length >= 8 },
    { label: "至少 12 位长度", passed: pw.length >= 12 },
    { label: "包含小写字母", passed: /[a-z]/.test(pw) },
    { label: "包含大写字母", passed: /[A-Z]/.test(pw) },
    { label: "包含数字", passed: /\d/.test(pw) },
    { label: "包含特殊字符", passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) },
    { label: "无连续重复字符", passed: !/(.)\1\1/.test(pw) },
    { label: "无连续数字序列", passed: !/(?:0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(pw) },
    { label: "无常见键盘序列", passed: !/(?:qwerty|asdfgh|zxcvbn|password|admin|welcome|iloveyou)/i.test(pw) },
  ];

  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (pw.length >= 16) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) score += 2;
  // 字符多样性
  const unique = new Set(pw).size;
  score += Math.min(2, Math.floor(unique / 4));
  // 长度奖励
  if (pw.length > 0) score += Math.min(3, Math.floor(pw.length / 6));
  // 惩罚
  if (/(.)\1\1/.test(pw)) score -= 1;
  if (/(?:qwerty|asdfgh|zxcvbn|password|admin|welcome|iloveyou)/i.test(pw)) score -= 3;

  score = Math.max(0, Math.min(100, score * 8));

  let level = "很弱";
  let color = "#ef4444";
  if (score >= 80) { level = "非常强"; color = "#10b981"; }
  else if (score >= 60) { level = "强"; color = "#84cc16"; }
  else if (score >= 40) { level = "中等"; color = "#eab308"; }
  else if (score >= 20) { level = "弱"; color = "#f97316"; }

  // 估算破解时间
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) pool += 32;
  const combinations = pool > 0 ? Math.pow(pool, pw.length) : 0;
  const seconds = combinations / 1e10; // 100亿次/秒
  const crackTime = seconds < 1 ? "即时" : seconds < 60 ? `${Math.round(seconds)} 秒` : seconds < 3600 ? `${Math.round(seconds / 60)} 分钟` : seconds < 86400 ? `${Math.round(seconds / 3600)} 小时` : seconds < 31536000 ? `${Math.round(seconds / 86400)} 天` : seconds < 31536000 * 100 ? `${Math.round(seconds / 31536000)} 年` : "数千年以上";

  return { checks, score, level, color, crackTime, pool };
}

export default function PasswordStrengthCheckerPage() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);

  const result = useMemo(() => analyze(pw), [pw]);

  return (
    <ToolLayout
      title="密码强度检测"
      description="检测密码强度"
      icon={ShieldCheck}
      category="开发工具"
      slug="password-strength-checker"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">输入密码</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="输入要检测的密码..."
              className={inputClass + " pr-10 font-mono"}
            />
            <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">提示：密码仅在你的浏览器本地处理，不会上传服务器</p>
        </div>

        {pw && (
          <>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-white">强度等级</span>
                <span className="text-sm font-bold" style={{ color: result.color }}>{result.level}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[#27272a] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${result.score}%`, backgroundColor: result.color }} />
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                <span>得分 {result.score}/100</span>
                <span>字符集 {result.pool}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">密码长度</p>
                <p className="text-lg font-bold text-white">{pw.length}</p>
              </div>
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">唯一字符</p>
                <p className="text-lg font-bold text-white">{new Set(pw).size}</p>
              </div>
              <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">估算破解时间</p>
                <p className="text-sm font-bold text-white">{result.crackTime}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">安全检查项</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-[#0a0a0b] border border-[#27272a] p-2.5">
                    {c.passed ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <X className="w-4 h-4 text-slate-600 flex-shrink-0" />}
                    <span className={`text-sm ${c.passed ? "text-slate-200" : "text-slate-500"}`}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
