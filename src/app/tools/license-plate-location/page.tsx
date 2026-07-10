"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Car, Search } from "lucide-react";

const PLATE_PREFIXES: Record<string, { province: string; city: string }> = {
  "京A": { province: "北京市", city: "北京市区" }, "京B": { province: "北京市", city: "出租车" },
  "京C": { province: "北京市", city: "北京市区" }, "京D": { province: "北京市", city: "北京市区" },
  "京E": { province: "北京市", city: "北京市区" }, "京F": { province: "北京市", city: "北京市区" },
  "京G": { province: "北京市", city: "远郊区" }, "京Q": { province: "北京市", city: "北京市区" },
  "京Y": { province: "北京市", city: "远郊区" },
  "沪A": { province: "上海市", city: "上海市区" }, "沪B": { province: "上海市", city: "上海市区" },
  "沪C": { province: "上海市", city: "远郊区" }, "沪D": { province: "上海市", city: "上海市区" },
  "沪E": { province: "上海市", city: "上海市区" }, "沪F": { province: "上海市", city: "上海市区" },
  "粤A": { province: "广东省", city: "广州市" }, "粤B": { province: "广东省", city: "深圳市" },
  "粤C": { province: "广东省", city: "珠海市" }, "粤D": { province: "广东省", city: "汕头市" },
  "粤E": { province: "广东省", city: "佛山市" }, "粤F": { province: "广东省", city: "韶关市" },
  "粤G": { province: "广东省", city: "湛江市" }, "粤H": { province: "广东省", city: "肇庆市" },
  "粤J": { province: "广东省", city: "江门市" }, "粤K": { province: "广东省", city: "茂名市" },
  "粤L": { province: "广东省", city: "惠州市" }, "粤M": { province: "广东省", city: "梅州市" },
  "粤N": { province: "广东省", city: "汕尾市" }, "粤P": { province: "广东省", city: "河源市" },
  "粤Q": { province: "广东省", city: "阳江市" }, "粤R": { province: "广东省", city: "清远市" },
  "粤S": { province: "广东省", city: "东莞市" }, "粤T": { province: "广东省", city: "中山市" },
  "浙A": { province: "浙江省", city: "杭州市" }, "浙B": { province: "浙江省", city: "宁波市" },
  "浙C": { province: "浙江省", city: "温州市" }, "浙D": { province: "浙江省", city: "绍兴市" },
  "浙E": { province: "浙江省", city: "湖州市" }, "浙F": { province: "浙江省", city: "嘉兴市" },
  "浙G": { province: "浙江省", city: "金华市" }, "浙H": { province: "浙江省", city: "衢州市" },
  "苏A": { province: "江苏省", city: "南京市" }, "苏B": { province: "江苏省", city: "无锡市" },
  "苏C": { province: "江苏省", city: "徐州市" }, "苏D": { province: "江苏省", city: "常州市" },
  "苏E": { province: "江苏省", city: "苏州市" }, "苏F": { province: "江苏省", city: "南通市" },
  "川A": { province: "四川省", city: "成都市" }, "川B": { province: "四川省", city: "绵阳市" },
  "鲁A": { province: "山东省", city: "济南市" }, "鲁B": { province: "山东省", city: "青岛市" },
  "豫A": { province: "河南省", city: "郑州市" }, "鄂A": { province: "湖北省", city: "武汉市" },
  "湘A": { province: "湖南省", city: "长沙市" }, "闽A": { province: "福建省", city: "福州市" },
  "闽D": { province: "福建省", city: "厦门市" }, "陕A": { province: "陕西省", city: "西安市" },
  "辽A": { province: "辽宁省", city: "沈阳市" }, "辽B": { province: "辽宁省", city: "大连市" },
  "冀A": { province: "河北省", city: "石家庄市" }, "吉A": { province: "吉林省", city: "长春市" },
  "黑A": { province: "黑龙江省", city: "哈尔滨市" }, "皖A": { province: "安徽省", city: "合肥市" },
  "赣A": { province: "江西省", city: "南昌市" }, "桂A": { province: "广西壮族自治区", city: "南宁市" },
  "渝A": { province: "重庆市", city: "重庆市" }, "津A": { province: "天津市", city: "天津市" },
};

export default function LicensePlateLocationPage() {
  const [plate, setPlate] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleQuery = () => {
    if (!plate.trim()) return;
    const prefix = plate.trim().substring(0, 2).toUpperCase();
    const info = PLATE_PREFIXES[prefix];
    if (info) setResult({ plate: plate.trim(), ...info });
    else setResult({ error: `未找到车牌前缀 "${prefix}" 的归属地信息` });
  };

  return (
    <ToolLayout title="车牌归属地查询" description="根据车牌号查询车辆所属省份和城市信息" icon={Car} category="查询工具" slug="license-plate-location">
      <div className="p-6">
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="输入车牌号，如 粤B12345"
              className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
          <button onClick={handleQuery} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">查询</button>
        </div>

        {result?.error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{result.error}</div>}

        {result && !result.error && (
          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-lg border-2 border-white/20">{result.plate.substring(0, 2)}</div>
              <div>
                <div className="text-white font-medium text-lg">{result.province}</div>
                <div className="text-sm text-slate-400">{result.city}</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-400 mb-3">常见车牌前缀</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.entries(PLATE_PREFIXES).slice(0, 30).map(([prefix, info]) => (
              <button
                key={prefix}
                onClick={() => { setPlate(prefix + "12345"); }}
                className="p-2 bg-[#09090b] border border-[#27272a] rounded-lg hover:border-primary-500/30 transition-colors text-center"
              >
                <div className="text-primary-400 font-bold text-sm">{prefix}</div>
                <div className="text-xs text-slate-500 truncate">{info.city}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
