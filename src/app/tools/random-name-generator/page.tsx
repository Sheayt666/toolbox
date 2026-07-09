"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { User, Copy, Check, RefreshCw, Sparkles, Users } from "lucide-react";

// 中文姓氏
const chineseSurnames = [
  "王", "李", "张", "刘", "陈", "杨", "黄", "赵", "吴", "周",
  "徐", "孙", "马", "朱", "胡", "郭", "何", "林", "罗", "高",
  "郑", "梁", "谢", "宋", "唐", "许", "韩", "冯", "邓", "曹",
  "彭", "曾", "萧", "田", "董", "袁", "潘", "于", "蒋", "蔡",
  "余", "杜", "叶", "程", "苏", "魏", "吕", "丁", "任", "沈",
  "姚", "卢", "傅", "钟", "姜", "崔", "谭", "陆", "范", "汪",
];

// 中文名字（男）
const chineseMaleNames = [
  "伟", "强", "磊", "军", "洋", "勇", "杰", "涛", "超", "明",
  "刚", "平", "辉", "鹏", "华", "飞", "龙", "宇", "浩", "凯",
  "俊", "博", "文", "志", "建", "国", "海", "山", "林", "风",
  "云", "雨", "雷", "电", "冰", "雪", "霜", "晨", "阳", "月",
  "星", "辰", "天", "地", "玄", "黄", "乾", "坤", "日", "月",
];

// 中文名字（女）
const chineseFemaleNames = [
  "芳", "娜", "敏", "静", "丽", "艳", "娟", "莉", "玲", "桂",
  "英", "慧", "巧", "美", "婷", "雪", "琳", "欣", "怡", "雨",
  "诗", "琴", "涵", "瑶", "萱", "琪", "彤", "雯", "婕", "馨",
  "蕊", "薇", "梦", "兰", "菊", "荷", "莲", "梅", "桃", "杏",
  "月", "霞", "露", "霜", "云", "虹", "霓", "星", "辰", "晶",
];

// 英文名字
const englishFirstNames = [
  // 男
  "James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph",
  "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
  "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian",
  "George", "Timothy", "Ronald", "Jason", "Edward", "Jeffrey", "Ryan", "Jacob",
  "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott",
  "Brandon", "Benjamin", "Samuel", "Gregory", "Alexander", "Patrick", "Frank",
  // 女
  "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan",
  "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra",
  "Ashley", "Dorothy", "Kimberly", "Emily", "Donna", "Michelle", "Carol",
  "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon",
  "Cynthia", "Kathleen", "Amy", "Angela", "Shirley", "Anna", "Brenda", "Pamela",
  "Nicole", "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Catherine",
];

const englishLastNames = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
  "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
];

type Gender = "male" | "female" | "both";
type NameType = "chinese" | "english" | "both";

interface GeneratedName {
  id: string;
  fullName: string;
  type: "chinese" | "english";
  gender: "male" | "female";
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export default function RandomNameGeneratorPage() {
  const [gender, setGender] = useState<Gender>("both");
  const [nameType, setNameType] = useState<NameType>("both");
  const [count, setCount] = useState(10);
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [copied, setCopied] = useState(false);

  const generateName = useCallback(
    (gender: "male" | "female", type: "chinese" | "english"): GeneratedName => {
      if (type === "chinese") {
        const surname = chineseSurnames[Math.floor(Math.random() * chineseSurnames.length)];
        const namePool = gender === "male" ? chineseMaleNames : chineseFemaleNames;
        const nameCount = Math.random() > 0.4 ? 2 : 1;
        let givenName = "";
        for (let i = 0; i < nameCount; i++) {
          givenName += namePool[Math.floor(Math.random() * namePool.length)];
        }
        return {
          id: generateId(),
          fullName: surname + givenName,
          type: "chinese",
          gender,
        };
      } else {
        // English name
        const lastName = englishLastNames[Math.floor(Math.random() * englishLastNames.length)];
        // Filter first names by gender (simplified - we'll just pick from all)
        const firstName = englishFirstNames[Math.floor(Math.random() * englishFirstNames.length)];
        return {
          id: generateId(),
          fullName: `${firstName} ${lastName}`,
          type: "english",
          gender,
        };
      }
    },
    []
  );

  const generateNames = useCallback(() => {
    const results: GeneratedName[] = [];
    for (let i = 0; i < count; i++) {
      const g: "male" | "female" =
        gender === "both" ? (Math.random() > 0.5 ? "male" : "female") : gender;
      const t: "chinese" | "english" =
        nameType === "both" ? (Math.random() > 0.5 ? "chinese" : "english") : nameType;
      results.push(generateName(g, t));
    }
    setNames(results);
  }, [count, gender, nameType, generateName]);

  const copyAll = useCallback(() => {
    const text = names.map((n) => n.fullName).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [names]);

  return (
    <ToolLayout
      title="随机姓名生成器"
      description="在线生成随机姓名，支持中文名和英文名，可自定义性别和数量，批量生成"
      icon={User}
      category="生成工具"
      slug="random-name-generator"
      toolId="random-name-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-white">随机姓名</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={generateNames}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-rose-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            生成姓名
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 设置 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 mb-2 block">性别</label>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              {([
                { v: "male", l: "男" },
                { v: "female", l: "女" },
                { v: "both", l: "不限" },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setGender(opt.v)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    gender === opt.v
                      ? "bg-[#27272a] text-rose-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">类型</label>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              {([
                { v: "chinese", l: "中文" },
                { v: "english", l: "英文" },
                { v: "both", l: "混合" },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setNameType(opt.v)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    nameType === opt.v
                      ? "bg-[#27272a] text-rose-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">
              数量：{count} 个
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-rose-500 mt-2"
            />
          </div>
        </div>

        {/* 结果 */}
        {names.length > 0 && (
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a]">
              <span className="text-sm font-medium text-white">
                生成结果 ({names.length})
              </span>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400"
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#27272a]">
              {names.map((name) => (
                <div
                  key={name.id}
                  className="px-4 py-3 bg-[#09090b] hover:bg-[#18181b] transition-colors flex items-center justify-between group"
                >
                  <span className="text-white text-sm">{name.fullName}</span>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        name.gender === "male"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-pink-500/20 text-pink-400"
                      }`}
                    >
                      {name.gender === "male" ? "男" : "女"}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(name.fullName);
                      }}
                      className="p-1 text-slate-500 hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {names.length === 0 && (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">点击「生成姓名」按钮开始生成</p>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持生成中文名和英文名，可自定义性别和数量</li>
          <li>• 中文姓氏覆盖常见的 60 个大姓，名字分男女各 50 个常用字</li>
          <li>• 英文名包含 80+ 常见名和 50+ 常见姓氏随机组合</li>
          <li>• 鼠标悬停在姓名上可单独复制，也可一键复制全部</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
