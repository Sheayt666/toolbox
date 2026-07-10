"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";

const REGION_CODES: Record<string, string> = {
  "110000": "北京市", "110101": "北京市东城区", "110102": "北京市西城区", "110105": "北京市朝阳区",
  "110106": "北京市丰台区", "310000": "上海市", "310104": "上海市徐汇区", "310105": "上海市长宁区",
  "440000": "广东省", "440100": "广州市", "440300": "深圳市", "440106": "广州市天河区",
  "440304": "深圳市福田区", "440305": "深圳市南山区", "330000": "浙江省", "330100": "杭州市",
  "330106": "杭州市西湖区", "320000": "江苏省", "320100": "南京市", "320105": "南京市建邺区",
  "510000": "四川省", "510100": "成都市", "510104": "成都市锦江区", "420000": "湖北省",
  "420100": "武汉市", "420102": "武汉市江岸区", "370000": "山东省", "370100": "济南市",
  "370200": "青岛市", "610000": "陕西省", "610100": "西安市", "500000": "重庆市",
  "500103": "重庆市渝中区", "120000": "天津市", "120101": "天津市和平区",
};

function checkValid(id: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(id)) return false;
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += parseInt(id[i]) * weights[i];
  const checkCode = checkCodes[sum % 11];
  return id[17].toUpperCase() === checkCode;
}

export default function IdCardParserPage() {
  const [idNumber, setIdNumber] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleParse = () => {
    if (!idNumber.trim()) return;
    const id = idNumber.trim();
    if (!/^\d{17}[\dXx]$/.test(id)) {
      setResult({ error: "身份证号格式不正确，应为18位数字（最后一位可为X）" });
      return;
    }
    const valid = checkValid(id);
    const regionCode = id.substring(0, 6);
    const region = REGION_CODES[regionCode] || "未知地区";
    const birthYear = id.substring(6, 10);
    const birthMonth = id.substring(10, 12);
    const birthDay = id.substring(12, 14);
    const genderCode = parseInt(id.substring(16, 17));
    const gender = genderCode % 2 === 1 ? "男" : "女";
    setResult({ valid, region, birthday: `${birthYear}年${birthMonth}月${birthDay}日`, gender, age: new Date().getFullYear() - parseInt(birthYear) });
  };

  return (
    <ToolLayout title="身份证信息解析" description="解析身份证号获取出生地、出生日期、性别、校验码验证" icon={CreditCard} category="查询工具" slug="id-card-parser">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="请输入18位身份证号码"
            maxLength={18}
            className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono"
          />
          <button onClick={handleParse} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">
            解析
          </button>
        </div>

        {result?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{result.error}</div>
        )}

        {result && !result.error && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl flex items-center gap-3 ${result.valid ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              {result.valid ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
              <span className={result.valid ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                {result.valid ? "校验码验证通过，身份证号有效" : "校验码验证失败，身份证号无效"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                <div className="text-xs text-slate-500 mb-1">出生地</div>
                <div className="text-white font-medium">{result.region}</div>
              </div>
              <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                <div className="text-xs text-slate-500 mb-1">出生日期</div>
                <div className="text-white font-medium">{result.birthday}</div>
              </div>
              <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                <div className="text-xs text-slate-500 mb-1">性别</div>
                <div className="text-white font-medium">{result.gender}</div>
              </div>
              <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                <div className="text-xs text-slate-500 mb-1">年龄</div>
                <div className="text-white font-medium">{result.age}岁</div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-400/80">本工具仅用于学习和测试，不会保存任何输入数据。请勿输入真实身份证号码。</p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
