"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Copy,
  Check,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldPlus,
  Key,
  Eye,
  EyeOff,
  RotateCw,
} from "lucide-react";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const CONFUSING_CHARS = "Il1O0o";

interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeConfusing: boolean;
}

type StrengthLevel = "weak" | "medium" | "strong" | "very-strong";

interface StrengthInfo {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  percentage: number;
}

function generatePassword(options: PasswordOptions): string {
  let charset = "";
  const guaranteedChars: string[] = [];

  if (options.uppercase) {
    let chars = UPPERCASE;
    if (options.excludeConfusing) {
      chars = chars.replace(/[Il1O0o]/g, "");
    }
    charset += chars;
    guaranteedChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  if (options.lowercase) {
    let chars = LOWERCASE;
    if (options.excludeConfusing) {
      chars = chars.replace(/[Il1O0o]/g, "");
    }
    charset += chars;
    guaranteedChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  if (options.numbers) {
    let chars = NUMBERS;
    if (options.excludeConfusing) {
      chars = chars.replace(/[Il1O0o]/g, "");
    }
    charset += chars;
    guaranteedChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }
  if (options.symbols) {
    charset += SYMBOLS;
    guaranteedChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }

  if (charset.length === 0) {
    return "";
  }

  const remainingLength = options.length - guaranteedChars.length;
  const result = [...guaranteedChars];

  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result.push(charset[randomIndex]);
  }

  // Fisher-Yates 洗牌
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join("");
}

function calculateStrength(
  password: string,
  options: PasswordOptions
): StrengthLevel {
  let score = 0;

  // 长度评分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (password.length >= 24) score += 1;

  // 字符类型评分
  let typeCount = 0;
  if (options.uppercase) typeCount++;
  if (options.lowercase) typeCount++;
  if (options.numbers) typeCount++;
  if (options.symbols) typeCount++;

  score += typeCount - 1;

  if (score <= 2) return "weak";
  if (score <= 4) return "medium";
  if (score <= 6) return "strong";
  return "very-strong";
}

function getStrengthInfo(level: StrengthLevel): StrengthInfo {
  const map: Record<StrengthLevel, StrengthInfo> = {
    weak: {
      label: "弱",
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-500",
      icon: <ShieldAlert className="w-5 h-5" />,
      percentage: 25,
    },
    medium: {
      label: "中等",
      color: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500",
      icon: <Shield className="w-5 h-5" />,
      percentage: 50,
    },
    strong: {
      label: "强",
      color: "text-emerald-500 dark:text-emerald-400",
      bgColor: "bg-emerald-500",
      icon: <ShieldCheck className="w-5 h-5" />,
      percentage: 75,
    },
    "very-strong": {
      label: "非常强",
      color: "text-indigo-500 dark:text-indigo-400",
      bgColor: "bg-indigo-500",
      icon: <ShieldPlus className="w-5 h-5" />,
      percentage: 100,
    },
  };
  return map[level];
}

export default function PasswordGeneratorPage() {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeConfusing: false,
  });
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const generate = useCallback(() => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
  }, [options]);

  // 初始生成
  useEffect(() => {
    generate();
  }, [generate]);

  const copyPassword = useCallback(() => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  const strength = password ? calculateStrength(password, options) : "weak";
  const strengthInfo = getStrengthInfo(strength);

  const updateOption = <K extends keyof PasswordOptions>(
    key: K,
    value: PasswordOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  // 确保至少选择一种字符类型
  const handleToggle = (key: keyof PasswordOptions) => {
    if (
      typeof options[key] === "boolean" &&
      options[key] === true &&
      ["uppercase", "lowercase", "numbers", "symbols"].includes(key)
    ) {
      const trueCount = ["uppercase", "lowercase", "numbers", "symbols"].filter(
        (k) => options[k as keyof PasswordOptions] === true
      ).length;
      if (trueCount <= 1) return; // 至少保留一种
    }
    updateOption(key, !options[key] as PasswordOptions[typeof key]);
  };

  const quickLengths = [8, 12, 16, 24, 32, 64];

  return (
    <ToolLayout
      title="密码生成器"
      description="生成安全的随机密码，可自定义强度和长度，保护账户安全"
      icon={Key}
      category="实用工具"
      slug="password-generator"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 密码显示区*/}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-medium text-slate-900 dark:text-slate-100">
              生成的密码
            </h2>
          </div>

          <div className="relative">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <code
                className={`flex-1 font-mono text-lg break-all select-all ${
                  showPassword
                    ? "text-slate-900 dark:text-slate-100"
                    : "text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 tracking-widest"
                }`}
              >
                {showPassword
                  ? password || "请选择至少一种字符类型"
                  : password
                  ? "".repeat(password.length)
                  : "请选择至少一种字符类型"}
              </code>
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                title={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={copyPassword}
                disabled={!password}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="复制密码"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 强度指示器*/}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                密码强度
              </span>
              <div className={`flex items-center gap-1.5 ${strengthInfo.color}`}>
                {strengthInfo.icon}
                <span className="text-sm font-medium">{strengthInfo.label}</span>
              </div>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${strengthInfo.bgColor} rounded-full transition-all duration-500`}
                style={{ width: `${strengthInfo.percentage}%` }}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={generate}
              disabled={
                !options.uppercase &&
                !options.lowercase &&
                !options.numbers &&
                !options.symbols
              }
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 disabled:shadow-none hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
            >
              <RefreshCw className="w-5 h-5" />
              生成密码
            </button>
            <button
              onClick={generate}
              disabled={
                !options.uppercase &&
                !options.lowercase &&
                !options.numbers &&
                !options.symbols
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl border border-slate-200 dark:border-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="重新生成"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 密码设置 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          {/* 密码长度 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                <Key className="w-4 h-4 text-indigo-500" />
                密码长度
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                {options.length} 位
              </span>
            </div>

            <input
              type="range"
              min={4}
              max={64}
              value={options.length}
              onChange={(e) => updateOption("length", Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />

            <div className="flex items-center justify-between mt-2 text-xs text-slate-400 dark:text-slate-500">
              <span>4</span>
              <span>64</span>
            </div>

            {/* 快速选择 */}
            <div className="grid grid-cols-6 gap-2 mt-4">
              {quickLengths.map((len) => (
                <button
                  key={len}
                  onClick={() => updateOption("length", len)}
                  className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    options.length === len
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
          </div>

          {/* 字符类型 */}
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
              字符类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleToggle("uppercase")}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  options.uppercase
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                }`}
              >
                <div className="text-left">
                  <div
                    className={`text-sm font-medium ${
                      options.uppercase
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    大写字母
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    A-Z
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    options.uppercase
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {options.uppercase && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleToggle("lowercase")}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  options.lowercase
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                }`}
              >
                <div className="text-left">
                  <div
                    className={`text-sm font-medium ${
                      options.lowercase
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    小写字母
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    a-z
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    options.lowercase
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {options.lowercase && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleToggle("numbers")}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  options.numbers
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                }`}
              >
                <div className="text-left">
                  <div
                    className={`text-sm font-medium ${
                      options.numbers
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    数字
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    0-9
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    options.numbers
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {options.numbers && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>

              <button
                onClick={() => handleToggle("symbols")}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  options.symbols
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                }`}
              >
                <div className="text-left">
                  <div
                    className={`text-sm font-medium ${
                      options.symbols
                        ? "text-indigo-700 dark:text-indigo-300"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    特殊符号
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    !@#$%...
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    options.symbols
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {options.symbols && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* 排除易混淆字符*/}
          <div>
            <button
              onClick={() => handleToggle("excludeConfusing")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                options.excludeConfusing
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
              }`}
            >
              <div className="text-left">
                <div
                  className={`text-sm font-medium ${
                    options.excludeConfusing
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  排除易混淆字符
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  I, l, 1, O, 0, o
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  options.excludeConfusing
                    ? "bg-indigo-500 border-indigo-500"
                    : "border-zinc-300 dark:border-zinc-600"
                }`}
              >
                {options.excludeConfusing && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
            密码安全建议
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  长度优先
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  16位以上的密码显著提高安全性
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  混合字符
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  同时包含大小写、数字和符号
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  定期更换
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  重要账号密码建议3个月更换
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  唯一密码
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  每个账号使用不同的密码
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
