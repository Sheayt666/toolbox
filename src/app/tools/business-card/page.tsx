"use client";

import { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Contact,
  Download,
  Palette,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  Building2,
  Sparkles,
} from "lucide-react";

type TemplateStyle = "minimal" | "business" | "creative" | "tech";

interface CardInfo {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

interface TemplateConfig {
  name: string;
  label: string;
  bgGradient: [string, string];
  textColor: string;
  accentColor: string;
  secondaryText: string;
}

const templates: Record<TemplateStyle, TemplateConfig> = {
  minimal: {
    name: "简约",
    label: "简约风格",
    bgGradient: ["#ffffff", "#f8fafc"],
    textColor: "#1e293b",
    accentColor: "#6366f1",
    secondaryText: "#64748b",
  },
  business: {
    name: "商务",
    label: "商务风格",
    bgGradient: ["#1e3a5f", "#0f172a"],
    textColor: "#ffffff",
    accentColor: "#38bdf8",
    secondaryText: "#94a3b8",
  },
  creative: {
    name: "创意",
    label: "创意风格",
    bgGradient: ["#f093fb", "#f5576c"],
    textColor: "#ffffff",
    accentColor: "#fde047",
    secondaryText: "#fce7f3",
  },
  tech: {
    name: "科技",
    label: "科技风格",
    bgGradient: ["#0f172a", "#1e293b"],
    textColor: "#e2e8f0",
    accentColor: "#22d3ee",
    secondaryText: "#94a3b8",
  },
};

const defaultInfo: CardInfo = {
  name: "张三",
  title: "产品经理",
  company: "创新科技有限公司",
  phone: "138-0000-0000",
  email: "zhangsan@example.com",
  website: "www.example.com",
  address: "北京市朝阳区建国路88号",
};

export default function BusinessCardPage() {
  const [info, setInfo] = useState<CardInfo>(defaultInfo);
  const [template, setTemplate] = useState<TemplateStyle>("minimal");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const config = templates[template];

  const updateInfo = (key: keyof CardInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [key]: value }));
  };

  // 绘制名片到 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 600;
    const height = 350;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);

    // 绘制背景渐变
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, config.bgGradient[0]);
    gradient.addColorStop(1, config.bgGradient[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 根据模板绘制装饰元素
    if (template === "minimal") {
      // 简约风格：顶部装饰条
      ctx.fillStyle = config.accentColor;
      ctx.fillRect(0, 0, width, 6);
      // 底部装饰线
      ctx.strokeStyle = config.accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, height - 50);
      ctx.lineTo(120, height - 50);
      ctx.stroke();
    } else if (template === "business") {
      // 商务风格：左侧色块
      ctx.fillStyle = config.accentColor + "30";
      ctx.fillRect(0, 0, 8, height);
      // 右侧装饰圆
      ctx.fillStyle = config.accentColor + "15";
      ctx.beginPath();
      ctx.arc(width + 50, height / 2, 150, 0, Math.PI * 2);
      ctx.fill();
    } else if (template === "creative") {
      // 创意风格：几何装饰
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      // 圆形装饰
      ctx.beginPath();
      ctx.arc(50, 50, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width - 30, height - 30, 100, 0, Math.PI * 2);
      ctx.fill();
    } else if (template === "tech") {
      // 科技风格：网格线
      ctx.strokeStyle = config.accentColor + "15";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      // 发光效果
      ctx.fillStyle = config.accentColor + "20";
      ctx.beginPath();
      ctx.arc(width - 80, 80, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制文字内容
    const paddingLeft = 40;
    const paddingTop = 50;

    // 姓名
    ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = config.textColor;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(info.name || "姓名", paddingLeft, paddingTop);

    // 职位
    if (info.title) {
      ctx.font = "18px -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = config.accentColor;
      ctx.fillText(info.title, paddingLeft, paddingTop + 50);
    }

    // 公司
    if (info.company) {
      ctx.font = "16px -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif";
      ctx.fillStyle = config.secondaryText;
      ctx.fillText(info.company, paddingLeft, paddingTop + 82);
    }

    // 分隔线
    ctx.strokeStyle = config.accentColor + "40";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, paddingTop + 115);
    ctx.lineTo(paddingLeft + 200, paddingTop + 115);
    ctx.stroke();

    // 联系信息
    const infoStartY = paddingTop + 135;
    const lineHeight = 32;
    let lineIndex = 0;

    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = config.secondaryText;

    if (info.phone) {
      ctx.fillText(`☎  ${info.phone}`, paddingLeft, infoStartY + lineIndex * lineHeight);
      lineIndex++;
    }
    if (info.email) {
      ctx.fillText(`✉  ${info.email}`, paddingLeft, infoStartY + lineIndex * lineHeight);
      lineIndex++;
    }
    if (info.website) {
      ctx.fillText(`🌐 ${info.website}`, paddingLeft, infoStartY + lineIndex * lineHeight);
      lineIndex++;
    }
    if (info.address) {
      ctx.fillText(`📍 ${info.address}`, paddingLeft, infoStartY + lineIndex * lineHeight);
    }

  }, [info, template, config]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `business-card-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolLayout
      title="名片生成器"
      description="在线生成电子名片图片，多种模板风格，自定义配色，实时预览，一键下载"
      toolId="business-card"
      icon={Contact}
      category="图片工具"
      slug="business-card"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：表单 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                名片信息
              </h2>
            </div>

            {/* 姓名 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                <User className="w-4 h-4 text-indigo-400" />
                姓名
              </label>
              <input
                type="text"
                value={info.name}
                onChange={(e) => updateInfo("name", e.target.value)}
                placeholder="请输入姓名"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* 职位 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                职位
              </label>
              <input
                type="text"
                value={info.title}
                onChange={(e) => updateInfo("title", e.target.value)}
                placeholder="请输入职位"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* 公司 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                公司
              </label>
              <input
                type="text"
                value={info.company}
                onChange={(e) => updateInfo("company", e.target.value)}
                placeholder="请输入公司名称"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* 电话 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                <Phone className="w-4 h-4 text-indigo-400" />
                电话
              </label>
              <input
                type="text"
                value={info.phone}
                onChange={(e) => updateInfo("phone", e.target.value)}
                placeholder="请输入电话号码"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                邮箱
              </label>
              <input
                type="text"
                value={info.email}
                onChange={(e) => updateInfo("email", e.target.value)}
                placeholder="请输入邮箱地址"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* 网站 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                网站
              </label>
              <input
                type="text"
                value={info.website}
                onChange={(e) => updateInfo("website", e.target.value)}
                placeholder="请输入网站地址"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* 地址 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                地址
              </label>
              <input
                type="text"
                value={info.address}
                onChange={(e) => updateInfo("address", e.target.value)}
                placeholder="请输入地址"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
              />
            </div>

            {/* 模板选择 */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Palette className="w-4 h-4 text-indigo-400" />
                模板风格
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(templates) as TemplateStyle[]).map((key) => {
                  const t = templates[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setTemplate(key)}
                      className={`relative p-3 rounded-xl border-2 transition-all ${
                        template === key
                          ? "border-indigo-500 ring-2 ring-indigo-500/30"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                      }`}
                    >
                      <div
                        className="h-12 rounded-lg mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${t.bgGradient[0]}, ${t.bgGradient[1]})`,
                        }}
                      />
                      <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center">
                        {t.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              下载名片 (PNG)
            </button>
          </div>

          {/* 右侧：预览 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                实时预览
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-8">
              <div className="w-full max-w-[500px]">
                <canvas ref={canvasRef} className="w-full h-auto rounded-xl shadow-2xl shadow-zinc-900/10" />
              </div>

              <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
                尺寸: 600 × 350 px
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                PNG格式 · 高清无损
              </p>
            </div>

            {/* 提示信息 */}
            <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
              <h3 className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                小贴士
              </h3>
              <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
                <li>• 支持四种模板风格，点击即可切换</li>
                <li>• 所有信息实时更新到名片预览</li>
                <li>• 下载为高清PNG图片，可直接使用</li>
                <li>• 本地处理，信息不会上传服务器</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
