"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Baby, Calendar, Clock, Gift, Star, Info, Heart } from "lucide-react";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  nextBirthdayDays: number;
  nextBirthdayDate: Date;
  zodiac: string;
  chineseZodiac: string;
}

function getZodiac(month: number, day: number): string {
  const zodiacSigns = [
    { name: "摩羯座", start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
    { name: "水瓶座", start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
    { name: "双鱼座", start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
    { name: "白羊座", start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
    { name: "金牛座", start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
    { name: "双子座", start: { month: 5, day: 21 }, end: { month: 6, day: 21 } },
    { name: "巨蟹座", start: { month: 6, day: 22 }, end: { month: 7, day: 22 } },
    { name: "狮子座", start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
    { name: "处女座", start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
    { name: "天秤座", start: { month: 9, day: 23 }, end: { month: 10, day: 23 } },
    { name: "天蝎座", start: { month: 10, day: 24 }, end: { month: 11, day: 22 } },
    { name: "射手座", start: { month: 11, day: 23 }, end: { month: 12, day: 21 } },
  ];

  for (const sign of zodiacSigns) {
    if (sign.start.month === sign.end.month) {
      if (month === sign.start.month && day >= sign.start.day && day <= sign.end.day) {
        return sign.name;
      }
    } else {
      if (
        (month === sign.start.month && day >= sign.start.day) ||
        (month === sign.end.month && day <= sign.end.day)
      ) {
        return sign.name;
      }
    }
  }
  return "摩羯座";
}

function getChineseZodiac(year: number): string {
  const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  const index = (year - 4) % 12;
  return zodiacs[index >= 0 ? index : index + 12];
}

function calculateAge(birthDate: Date, targetDate: Date): AgeResult | null {
  if (birthDate > targetDate) return null;

  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  let days = targetDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const diffTime = targetDate.getTime() - birthDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // 计算下一个生日
  let nextBirthday = new Date(targetDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  if (nextBirthday <= targetDate) {
    nextBirthday = new Date(targetDate.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
  }
  const nextBirthdayDays = Math.ceil((nextBirthday.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  const zodiac = getZodiac(birthDate.getMonth() + 1, birthDate.getDate());
  const chineseZodiac = getChineseZodiac(birthDate.getFullYear());

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    nextBirthdayDays,
    nextBirthdayDate: nextBirthday,
    zodiac,
    chineseZodiac,
  };
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState("1995-06-15");
  const [targetDate, setTargetDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const result = useMemo(() => {
    if (!birthDate || !targetDate) return null;
    return calculateAge(new Date(birthDate), new Date(targetDate));
  }, [birthDate, targetDate]);

  const setToday = () => {
    const today = new Date().toISOString().split("T")[0];
    setTargetDate(today);
  };

  return (
    <ToolLayout
      title="年龄计算器"
      description="计算两个日期之间的年龄、天数、周数、月数，附带星座和生肖信息"
      toolId="age-calculator"
      icon={Baby}
      category="计算工具"
      slug="age-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                日期选择
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  <Baby className="w-4 h-4 text-pink-500" />
                  出生日期
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  <Clock className="w-4 h-4 text-pink-500" />
                  计算日期
                  <button
                    onClick={setToday}
                    className="ml-auto text-xs px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
                  >
                    今天
                  </button>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 计算结果 */}
        {result && (
          <>
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-pink-500/25">
              <div className="text-center">
                <div className="text-sm text-pink-100 mb-2">您的年龄</div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold">{result.years}</span>
                  <span className="text-2xl font-medium">岁</span>
                  <span className="text-2xl font-medium ml-2">{result.months}</span>
                  <span className="text-lg">个月</span>
                  <span className="text-2xl font-medium ml-2">{result.days}</span>
                  <span className="text-lg">天</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 rounded-full text-sm">
                  <Gift className="w-4 h-4" />
                  距离下一个生日还有 {result.nextBirthdayDays} 天
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-xs text-pink-100 mb-1">总天数</div>
                  <div className="text-xl font-bold">{result.totalDays.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-xs text-pink-100 mb-1">总周数</div>
                  <div className="text-xl font-bold">{result.totalWeeks.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-xs text-pink-100 mb-1">总小时</div>
                  <div className="text-xl font-bold">{result.totalHours.toLocaleString()}</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-xl">
                  <div className="text-xs text-pink-100 mb-1">总分钟</div>
                  <div className="text-xl font-bold">{result.totalMinutes.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* 星座生肖 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-purple-500" />
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    星座
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                    {result.zodiac.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-zinc-900 dark:text-white">
                      {result.zodiac}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {formatDate(new Date(2000, new Date(birthDate).getMonth(), new Date(birthDate).getDate())).replace("2000年", "")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-red-500" />
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    生肖
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                    {result.chineseZodiac}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-zinc-900 dark:text-white">
                      {result.chineseZodiac}年
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      农历{new Date(birthDate).getFullYear()}年
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!result && birthDate && targetDate && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
            <p className="text-amber-700 dark:text-amber-400">
              出生日期不能晚于计算日期
            </p>
          </div>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              年龄计算器可以精确计算从出生日期到指定日期的年龄，包括年、月、日，
              以及总天数、总周数、总小时数等详细信息。同时还提供星座和生肖查询功能，
              让您更全面地了解自己的出生日期信息。
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                年龄是如何计算的？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                年龄计算采用年月日相减的方式，考虑了闰年和不同月份天数的差异，
                确保计算结果精确可靠。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                星座日期是按什么标准？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                星座是按照公历（阳历）日期计算的，采用西方占星学中常用的日期划分标准。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                生肖是按公历还是农历？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                本工具的生肖计算是基于公历年的简单推算，严格来说生肖应以农历春节为分界。
                对于春节前后出生的人可能会有偏差。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
