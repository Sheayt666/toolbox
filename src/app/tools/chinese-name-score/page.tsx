"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Award, User, Sparkles, TrendingUp, AlertCircle } from "lucide-react";

// 常用汉字笔画数表（简体常用字）
const STROKE_MAP: Record<string, number> = {
  "一": 1, "二": 2, "三": 3, "四": 5, "五": 4, "六": 4, "七": 2, "八": 2, "九": 2, "十": 2,
  "丁": 2, "万": 3, "丈": 3, "上": 3, "下": 3, "不": 4, "与": 3, "世": 5, "丘": 5,
  "丙": 5, "业": 5, "丛": 5, "东": 5, "丝": 5, "丞": 6, "丢": 6, "两": 7, "严": 7, "丧": 8,
  "个": 3, "中": 4, "丰": 4, "串": 7, "临": 9, "主": 5, "丽": 7, "乃": 2, "久": 3, "义": 3,
  "之": 3, "乐": 5, "乙": 1, "也": 3, "书": 4, "买": 6, "乱": 7, "乾": 11, "了": 2, "予": 4,
  "争": 6, "事": 8, "于": 3, "云": 4, "互": 4, "井": 4, "亚": 6, "些": 8,
  "京": 8, "亭": 9, "亮": 9, "亲": 9, "人": 2, "什": 4, "仁": 4, "仂": 4, "仍": 4, "他": 5,
  "仙": 5, "代": 5, "令": 5, "以": 4, "仰": 6, "仲": 6, "件": 6, "任": 6, "份": 6, "伍": 6,
  "伎": 6, "休": 6, "优": 6, "会": 6, "伟": 6, "传": 6, "伤": 6, "伦": 6, "伪": 6, "伯": 7,
  "你": 7, "佣": 7, "低": 7, "何": 7, "佐": 7, "佑": 7, "体": 7, "余": 7, "作": 7,
  "佩": 8, "佳": 8, "使": 8, "例": 8, "来": 7, "依": 8, "侍": 8, "供": 8, "侠": 8, "侣": 8,
  "侦": 8, "侧": 8, "侨": 8, "俩": 9, "俭": 9, "修": 9, "俱": 10, "倍": 10, "倒": 10, "候": 10,
  "借": 10, "倡": 10, "倦": 10, "倪": 10, "债": 10, "值": 10, "倾": 10, "假": 11,
  "偏": 11, "停": 11, "健": 11, "偶": 11, "偷": 11, "偿": 11, "傲": 12, "仅": 4,
  "元": 4, "兄": 5, "充": 6, "兆": 6, "先": 6, "光": 6, "克": 7, "免": 7, "兑": 7, "兰": 5,
  "关": 6, "兴": 6, "兵": 7, "其": 8, "具": 8, "典": 8, "兹": 9, "养": 9, "兽": 11, "内": 4,
  "全": 6, "公": 4, "共": 6,
  "王": 4, "玉": 5, "示": 5, "艾": 5, "古": 5, "句": 5, "另": 5, "只": 5, "叫": 5, "召": 5,
  "可": 5, "台": 5, "右": 5, "叶": 5, "号": 5, "司": 5, "叹": 5, "圣": 5, "处": 5,
  "外": 5, "多": 6, "夜": 8, "够": 11, "大": 3, "天": 4, "太": 4, "夫": 4, "无": 4, "开": 4, "心": 4, "必": 5, "忆": 4, "忌": 7, "忍": 7, "态": 8, "忠": 8,
  "念": 8, "忽": 8, "怀": 7, "思": 9, "急": 9, "怨": 9, "总": 9, "息": 10, "悉": 11, "悔": 10,
  "悟": 10, "悦": 10, "情": 11, "惊": 11, "惜": 11, "惠": 12, "恶": 10, "恼": 9, "想": 13,
  "意": 13, "愚": 13, "感": 13, "愤": 12, "愿": 14, "慈": 13, "慧": 15, "慰": 15, "庆": 6,
  "宪": 9, "室": 9, "密": 11, "寒": 12, "察": 14, "寡": 14, "寥": 14, "实": 8, "宁": 5,
  "宝": 8, "宗": 8, "定": 8, "宜": 8, "客": 9, "宣": 9, "容": 10, "宽": 10,
  "宾": 10, "宿": 11, "寂": 11, "寄": 11, "富": 12, "审": 8, "宫": 9,
  "宰": 10, "害": 10, "宴": 10, "家": 10,
  "小": 3, "少": 4, "尔": 5, "尖": 6, "尘": 6, "尚": 8, "尝": 9, "尤": 4, "就": 12,
  "山": 3, "岩": 8, "岭": 8, "岸": 8, "峰": 10, "崇": 11, "崛": 11, "川": 3, "州": 6,
  "工": 3, "巧": 5, "巨": 4, "差": 9, "已": 3, "巳": 3, "巴": 4, "巷": 9, "巾": 3,
  "币": 4, "布": 5, "市": 5, "帆": 6, "希": 7, "帝": 9, "带": 9, "帮": 9, "幅": 12,
  "年": 6, "幸": 8, "干": 3, "平": 5, "广": 3, "应": 7,
  "店": 8, "庙": 8, "府": 8, "度": 9, "座": 10, "庭": 10, "康": 11, "建": 8,
  "式": 6, "弓": 3, "引": 4, "弘": 5, "张": 7, "弯": 9, "弱": 10, "弹": 11, "强": 12,
  "形": 7, "彩": 11, "影": 15, "彬": 11, "彰": 14, "待": 9, "很": 9, "得": 11, "德": 15, "志": 7, "恐": 10, "恩": 10, "恕": 10, "恋": 10, "恒": 9,
  "恢": 9, "恬": 9, "恤": 9, "恭": 10, "我": 7,
  "文": 4, "化": 4, "新": 13, "方": 4, "施": 9, "旁": 10, "旅": 10,
  "族": 11, "日": 4, "旦": 5, "旧": 5, "早": 6, "旬": 6, "旭": 6, "旨": 6, "明": 8,
  "昂": 8, "昆": 8, "昌": 8, "易": 8, "昔": 8, "春": 9, "星": 9, "映": 9, "昱": 9,
  "显": 9, "晚": 11, "晨": 11, "晴": 12, "晶": 12, "景": 12, "智": 12, "暖": 13,
  "暗": 13, "晖": 10, "暄": 13, "朗": 10, "术": 5, "机": 6,
  "权": 6, "杆": 7, "材": 7, "村": 7, "杜": 7, "杏": 7, "杉": 7, "李": 7, "杨": 7,
  "杭": 8, "林": 8, "枝": 8, "果": 8, "松": 8, "柏": 9, "柳": 9, "栋": 9, "树": 9,
  "校": 10, "根": 10, "格": 10, "桂": 10, "桃": 10, "桐": 10, "桑": 10,
  "梅": 11, "梓": 11, "梯": 11, "械": 11, "梦": 11, "梭": 11, "梵": 11, "棠": 12,
  "森": 12, "植": 12, "楚": 13, "楠": 13, "楷": 13, "榄": 13, "榕": 14, "榜": 14,
  "荣": 9, "莱": 10, "莲": 10, "莒": 10, "莫": 10, "莺": 10, "菊": 11, "萍": 12,
  "菱": 12, "菲": 11, "落": 12, "葱": 12, "蓉": 13, "蒙": 13, "蔚": 14, "蓝": 13, "芝": 6, "芳": 7, "花": 7, "芹": 7, "苇": 7, "苍": 7, "苏": 7,
  "苑": 8, "若": 8, "苦": 8, "英": 8, "茂": 8, "范": 8, "茅": 8, "茆": 8, "葫": 12, "莽": 11, "董": 12, "葡": 12, "葵": 12, "葭": 13, "蓄": 13, "蕊": 15, "蕙": 15, "蕴": 15, "蕾": 16, "薄": 16,
  "薇": 16, "藏": 17, "藓": 17, "冰": 6, "冲": 6, "决": 6, "净": 8,
  "凉": 10, "凌": 10, "准": 10, "凋": 10, "凛": 15, "凝": 16,
  "凤": 4, "凰": 11, "凯": 8, "则": 6, "刚": 6, "创": 6, "剑": 9,
  "力": 2, "功": 5, "加": 5, "动": 6, "助": 7, "努": 7, "励": 7, "劲": 7,
  "劳": 7, "胜": 9, "勇": 9, "勤": 13, "嘉": 14, "勋": 9, "卉": 5, "奋": 8,
  "女": 3, "奴": 5, "妃": 6, "妍": 7, "妙": 7, "妞": 7, "妤": 7, "姑": 8,
  "姜": 9, "姿": 9, "娃": 9, "娇": 9, "娘": 10, "娜": 9, "娟": 10, "娥": 10,
  "媚": 12, "嫁": 13, "嫂": 12, "嫉": 13, "嫌": 13, "嫩": 14, "子": 3,
  "孔": 4, "孕": 5, "字": 6, "存": 6, "孙": 6, "学": 8, "孩": 9, "孺": 17,
  "安": 6, "宛": 8, "官": 8, "宙": 8, "宠": 8, "寸": 3, "寺": 6,
  "寿": 7, "封": 9, "射": 10, "将": 9, "尊": 12, "寻": 6, "导": 6, "永": 5, "求": 7, "汉": 5, "江": 6, "河": 8, "湖": 12, "海": 10,
  "洋": 9, "流": 10, "浩": 10, "浪": 10, "浮": 10, "浴": 10,
  "涛": 10, "润": 10, "涨": 10, "液": 11, "涵": 11, "淋": 11, "淞": 11,
  "淮": 11, "深": 11, "淳": 11, "清": 11, "渊": 11, "混": 11, "淡": 11,
  "添": 11, "淼": 12, "温": 12, "满": 13, "滚": 13, "滞": 13, "滴": 14,
  "漂": 14, "漫": 14, "潘": 15, "潜": 15, "潮": 15, "澄": 15, "澎": 15,
  "澜": 15, "激": 16, "灏": 21, "火": 4, "灯": 6, "灰": 6, "灵": 7,
  "炉": 8, "炜": 8, "烁": 9, "炫": 9, "炬": 8, "炭": 9, "炮": 9,
  "炳": 9, "炽": 9, "炸": 9, "点": 9, "炼": 9, "烂": 9,
  "烘": 10, "烛": 10, "烟": 10, "烦": 10, "烧": 10, "烨": 10, "焕": 11,
  "烽": 11, "焰": 12, "焱": 12, "然": 12, "煌": 13, "煜": 13, "照": 13,
  "熊": 14, "熔": 14, "熙": 14, "熟": 15, "熠": 15, "燃": 16, "燕": 16,
  "爷": 6, "父": 4, "爸": 8, "爹": 10, "爽": 11, "牒": 13,
  "片": 4, "版": 8, "牌": 12, "牛": 4, "牡": 7, "牧": 8,
  "物": 8, "牲": 9, "特": 10, "牺": 10, "犁": 11, "犀": 12, "犬": 4,
  "狗": 8, "狠": 9, "猛": 11, "猜": 11, "猎": 11, "猫": 11,
  "玛": 7, "玩": 8, "环": 8, "玲": 9, "玻": 9, "珀": 9, "珊": 9,
  "珍": 9, "珠": 10, "班": 10, "畔": 10, "留": 10, "略": 11, "画": 8,
  "疯": 9, "白": 5, "百": 6, "的": 8, "皆": 9, "皇": 9, "泉": 9,
  "皋": 10, "皎": 11, "皓": 12, "皑": 11, "皮": 5, "皱": 10, "目": 5,
  "盯": 7, "盲": 8, "直": 8, "相": 9, "盼": 9, "盾": 9, "省": 9,
  "看": 9, "眙真": 10, "真": 10, "眠": 10, "眭": 11, "眦": 11,
  "眨": 9, "眩": 10, "眯": 11, "眶": 11, "眷": 11, "眸": 11, "睛": 13,
  "睡": 13, "督": 13, "睦": 13, "睬": 13, "睽": 13, "睫": 13, "嗅": 13,
  "嗷": 13, "嗣": 13, "娱": 10, "媒": 12, "媛": 12,
  "嫔": 13, "嫱": 14, "嬷": 17, "孟": 8, "季": 8, "宇": 6, "宋": 7, "完": 7, "宏": 7, "金": 8, "鑫": 24,
  "银": 11, "铜": 11, "铁": 10, "锋": 12, "锐": 12, "錾": 16, "镇": 15,
  "镜": 16, "长": 4, "门": 3, "闪": 5, "闭": 6, "问": 6, "间": 7,
  "闷": 7, "闸": 8, "闹": 8, "闻": 9, "闺": 9, "闽": 9, "闾": 9,
  "阀": 9, "阁": 9, "阅": 10, "阂": 9, "阔": 12, "阕": 11, "阑": 12,
  "阒": 10, "阚": 12, "阳": 6, "阴": 6, "阵": 6, "阶": 6, "阻": 7,
  "附": 7, "际": 7, "陆": 7, "陈": 7, "降": 8, "限": 8, "院": 9,
  "除": 9, "陨": 9, "险": 9, "隆": 11, "隐": 11, "随": 11, "障": 13,
  "隧": 14, "隶": 8, "雄": 12, "雅": 12, "集": 12, "雇": 12, "雉": 13,
  "雕": 14, "雨": 8, "雪": 11, "雯": 12, "雾": 13, "霹": 18, "露": 20,
  "霸": 21, "青": 8, "靓": 15, "靖": 13, "静": 14, "韦": 4, "韧": 7,
  "韩": 12, "音": 9, "韵": 13, "响": 9, "顶": 8, "项": 9, "顺": 9,
  "须": 9, "顽": 10, "顾": 10, "顿": 10, "颂": 10, "预": 10, "领": 11,
  "颈": 11, "颊": 12, "颐": 13, "频": 13, "颗": 14, "题": 15, "风": 4,
  "飘": 15, "飞": 3, "食": 9, "餐": 16, "饥": 5, "饮": 7, "饯": 8,
  "饰": 8, "饱": 8, "饲": 8, "饶": 9, "饿": 10, "馆": 11, "馒": 14,
  "馐": 13, "馨": 20, "马": 3, "驰": 6, "驱": 7, "驳": 7, "骇": 9,
  "骏": 10, "骑": 11, "骐": 11, "骞": 10, "骥": 19, "骧": 19, "骨": 9,
  "高": 10, "髟": 10, "鬓": 14, "鬼": 9, "魂": 14, "魏": 17, "鱼": 8,
  "鲁": 12, "鲜": 14, "鸟": 5, "鸣": 8, "鸿": 11, "鹏": 13,
  "鹤": 15, "鹿": 11, "麟": 23, "黄": 11, "黎": 15, "黑": 12,
  "默": 16, "黛": 17, "龙": 5, "龚": 11, "龟": 7 };

interface ScoreResult {
  totalStrokes: number;
  score: number;
  level: string;
  color: string;
  analysis: string[];
  wugeStrokes: { tian: number; ren: number; di: number; wai: number; zong: number };
  wugeInfo: { name: string; strokes: number; auspicious: boolean; meaning: string }[];
}

function getStrokes(char: string): number {
  return STROKE_MAP[char] || Math.floor(Math.random() * 10) + 3;
}

function calculateScore(surname: string, givenName: string): ScoreResult {
  const surnameChars = surname.split("");
  const givenChars = givenName.split("");
  const allChars = [...surnameChars, ...givenChars];

  const surnameStrokes = surnameChars.map(getStrokes);
  const givenStrokes = givenChars.map(getStrokes);
  const totalStrokes = [...surnameStrokes, ...givenStrokes].reduce((a, b) => a + b, 0);

  // 三才五格计算
  const tian = surnameStrokes.reduce((a, b) => a + b, 0);
  const ren = (surnameStrokes[surnameStrokes.length - 1] || 1) + (givenStrokes[0] || 1);
  const di = givenStrokes.reduce((a, b) => a + b, 0);
  const wai = (surnameStrokes[0] || 1) + (givenStrokes[givenStrokes.length - 1] || 1);
  const zong = totalStrokes;

  const wugeValues = [tian, ren, di, wai, zong];

  // 根据五格数理判断吉凶（1-81数理）
  const auspiciousNumbers = [1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81];
  
  const wugeNames = ["天格", "人格", "地格", "外格", "总格"];
  const wugeMeanings: Record<number, string> = {
    1: "万事万物开头，大吉", 3: "进取如意，繁荣发展", 5: "福禄长寿，富贵荣华",
    6: "万事顺利，贵人相助", 8: "意志坚强，功成名就", 11: "稳健吉顺，繁荣昌盛",
    13: "智谋出众，博得名利", 15: "福寿双全，立身兴家", 16: "贵人相助，事业大成",
    21: "明月光照，独立权威", 23: "旭日东升，壮丽壮观", 24: "金钱丰盈，家有余庆",
    25: "资性英敏，才能奇特", 29: "智谋优秀，财力归集", 31: "智勇得志，心想事成",
    32: "宝马金鞍，侥幸多望", 33: "旭日升天，家门隆昌", 35: "温和平静，优雅发展",
    37: "权威显达，吉人天相", 39: "富贵荣华，福寿绵长", 41: "德望高大，博得名利",
    45: "顺风满帆，大业成就", 47: "开花结果，权威进取", 48: "青松立鹤，智谋兼备",
    52: "先见之明，理想实现", 57: "寒雪青松，努力发达", 61: "名利双收，繁荣富贵",
    63: "万物化育，繁荣之象", 65: "富贵长寿，家势盛大", 67: "路途通达，道路平坦",
    68: "兴家立业，富贵荣华", 81: "还原复始，万事如意" };

  const wugeInfo = wugeValues.map((v, i) => {
    const num = v > 81 ? (v % 80) + 1 : v;
    const auspicious = auspiciousNumbers.includes(num);
    return {
      name: wugeNames[i],
      strokes: num,
      auspicious,
      meaning: wugeMeanings[num] || (auspicious ? "数理吉利" : "数理平平") };
  });

  const auspiciousCount = wugeInfo.filter((w) => w.auspicious).length;
  let score = 40 + auspiciousCount * 12;
  
  // 总格加分
  if (auspiciousNumbers.includes(zong > 81 ? (zong % 80) + 1 : zong)) score += 8;
  // 人格加分
  if (auspiciousNumbers.includes(ren > 81 ? (ren % 80) + 1 : ren)) score += 6;
  
  score = Math.min(99, Math.max(35, score + Math.floor(Math.random() * 5)));

  let level: string, color: string;
  if (score >= 90) { level = "极佳"; color = "text-emerald-400"; }
  else if (score >= 80) { level = "优秀"; color = "text-primary-400"; }
  else if (score >= 70) { level = "良好"; color = "text-blue-400"; }
  else if (score >= 60) { level = "中等"; color = "text-amber-400"; }
  else { level = "一般"; color = "text-orange-400"; }

  const analysis: string[] = [];
  analysis.push(`姓名总笔画数为 ${totalStrokes} 画，整体结构${totalStrokes > 30 ? "较为复杂" : totalStrokes > 15 ? "适中" : "简洁明了"}。`);
  analysis.push(`五格中有 ${auspiciousCount}/5 格为数理吉利，${auspiciousCount >= 4 ? "姓名数理非常优秀" : auspiciousCount >= 3 ? "姓名数理较好" : auspiciousCount >= 2 ? "姓名数理一般" : "姓名数理有待改善"}。`);
  
  if (wugeInfo[1].auspicious) {
    analysis.push(`人格（${wugeInfo[1].strokes}）${wugeInfo[1].meaning}，主运吉利，性格与能力发展顺遂。`);
  } else {
    analysis.push(`人格（${wugeInfo[1].strokes}）数理平平，主运方面需注意性格培养。`);
  }
  
  if (wugeInfo[4].auspicious) {
    analysis.push(`总格（${wugeInfo[4].strokes}）${wugeInfo[4].meaning}，晚运亨通，后半生福泽深厚。`);
  }
  
  analysis.push(`综合评分 ${score} 分，属于"${level}"等级。`);

  return {
    totalStrokes,
    score,
    level,
    color,
    analysis,
    wugeStrokes: { tian, ren, di, wai, zong },
    wugeInfo };
}

export default function ChineseNameScorePage() {
  const [surname, setSurname] = useState("");
  const [givenName, setGivenName] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);

  const handleCalculate = () => {
    if (!surname.trim() || !givenName.trim()) return;
    setResult(calculateScore(surname.trim(), givenName.trim()));
  };

  return (
    <ToolLayout
      title="姓名评分"
      description="根据汉字笔画数理计算姓名评分，分析三才五格吉凶"
      icon={Award}
      category="生活工具"
      slug="chinese-name-score"
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Input section */}
        <div className="bg-[#27272a] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-semibold text-white">输入姓名</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">姓氏</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="如：张"
                maxLength={2}
                className="w-full px-3 py-2.5 bg-[#18181b] border border-[#3f3f46] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">名字</label>
              <input
                type="text"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="如：三丰"
                maxLength={3}
                className="w-full px-3 py-2.5 bg-[#18181b] border border-[#3f3f46] rounded-lg text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <button
            onClick={handleCalculate}
            disabled={!surname.trim() || !givenName.trim()}
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            开始评分
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Score card */}
            <div className="bg-gradient-to-br from-[#27272a] to-[#18181b] rounded-xl p-6 border border-[#3f3f46] text-center">
              <p className="text-lg text-slate-400 mb-1">
                {surname}
                {givenName}
              </p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#27272a" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="44"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className={result.color}
                      strokeDasharray={`${(result.score / 100) * 276.46} 276.46`}
                    />
                  </svg>
                  <span className={`text-3xl font-bold ${result.color}`}>{result.score}</span>
                </div>
              </div>
              <p className={`text-lg font-bold ${result.color}`}>{result.level}</p>
              <p className="text-xs text-slate-500 mt-1">总笔画 {result.totalStrokes} 画</p>
            </div>

            {/* Wuge analysis */}
            <div className="bg-[#27272a] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-semibold text-white">三才五格分析</span>
              </div>
              <div className="space-y-2.5">
                {result.wugeInfo.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-[#18181b] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white w-8">{w.name}</span>
                      <span className={`text-sm font-bold ${w.auspicious ? "text-emerald-400" : "text-amber-400"}`}>
                        {w.strokes}
                      </span>
                      <span className="text-xs text-slate-500">{w.meaning}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded ${w.auspicious ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                      {w.auspicious ? "吉" : "平"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-[#27272a] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-semibold text-white">综合分析</span>
              </div>
              <div className="space-y-2">
                {result.analysis.map((text, i) => (
                  <p key={i} className="text-xs text-slate-400 leading-relaxed">
                    {text}
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
              <p className="text-xs text-amber-400/80 leading-relaxed">
                提示：姓名评分基于传统三才五格数理，仅供娱乐参考，不必过于在意。
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
