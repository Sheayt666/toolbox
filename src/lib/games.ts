/**
 * 游戏注册库 — 12款高留存休闲小游戏
 * 每款游戏都是市场最受欢迎级别，深度开发
 */

export interface Game {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: string; // emoji
  category: "puzzle" | "arcade" | "brain" | "daily" | "reflex";
  categoryName: string;
  color: string; // tailwind gradient
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  avgSessionMin: number; // 平均单局分钟数
  hasLeaderboard: boolean;
  hasDailyChallenge: boolean;
  retentionScore: number; // 1-10 留存评分
}

export const games: Game[] = [
  {
    id: "2048",
    name: "2048",
    description: "经典数字合并游戏，滑动方块将相同数字合并，目标达到2048甚至更高！简单上手，极度上瘾。",
    path: "/games/2048",
    icon: "🔢",
    category: "puzzle",
    categoryName: "益智消除",
    color: "from-amber-500 to-orange-500",
    tags: ["2048", "数字合并", "益智", "排行榜"],
    difficulty: "easy",
    avgSessionMin: 3,
    hasLeaderboard: true,
    hasDailyChallenge: false,
    retentionScore: 10,
  },
  {
    id: "snake",
    name: "贪吃蛇",
    description: "经典贪吃蛇游戏，控制蛇吃食物变长，撞墙或自身即结束。考验反应与策略！",
    path: "/games/snake",
    icon: "🐍",
    category: "arcade",
    categoryName: "经典街机",
    color: "from-green-500 to-emerald-500",
    tags: ["贪吃蛇", "经典", "街机", "排行榜"],
    difficulty: "easy",
    avgSessionMin: 2,
    hasLeaderboard: true,
    hasDailyChallenge: false,
    retentionScore: 8,
  },
  {
    id: "typing-test",
    name: "打字速度测试",
    description: "测试你的打字速度！限时60秒，统计WPM（每分钟字数）和准确率。天然适合PK对比。",
    path: "/games/typing-test",
    icon: "⌨️",
    category: "reflex",
    categoryName: "反应训练",
    color: "from-blue-500 to-cyan-500",
    tags: ["打字", "速度测试", "WPM", "排行榜"],
    difficulty: "medium",
    avgSessionMin: 2,
    hasLeaderboard: true,
    hasDailyChallenge: true,
    retentionScore: 9,
  },
  {
    id: "memory-match",
    name: "记忆翻牌",
    description: "翻开卡片找到相同图案的配对，用最少步数和最短时间完成全部配对。锻炼短时记忆！",
    path: "/games/memory-match",
    icon: "🃏",
    category: "brain",
    categoryName: "脑力训练",
    color: "from-purple-500 to-violet-500",
    tags: ["记忆", "翻牌", "配对", "脑力"],
    difficulty: "easy",
    avgSessionMin: 2,
    hasLeaderboard: true,
    hasDailyChallenge: false,
    retentionScore: 7,
  },
  {
    id: "reaction-test",
    name: "反应力测试",
    description: "测试你的反应速度！屏幕变绿时立即点击，测量毫秒级反应时间。谁更快？",
    path: "/games/reaction-test",
    icon: "⚡",
    category: "reflex",
    categoryName: "反应训练",
    color: "from-yellow-500 to-amber-500",
    tags: ["反应力", "速度", "毫秒", "排行榜"],
    difficulty: "easy",
    avgSessionMin: 1,
    hasLeaderboard: true,
    hasDailyChallenge: true,
    retentionScore: 8,
  },
  {
    id: "stroop-test",
    name: "色字干扰测试",
    description: "Stroop效应测试：选择文字的颜色而非字义。看似简单实则烧脑，测测你的抗干扰能力！",
    path: "/games/stroop-test",
    icon: "🎨",
    category: "brain",
    categoryName: "脑力训练",
    color: "from-pink-500 to-rose-500",
    tags: ["Stroop", "色字", "脑力", "注意力"],
    difficulty: "medium",
    avgSessionMin: 2,
    hasLeaderboard: true,
    hasDailyChallenge: true,
    retentionScore: 8,
  },
  {
    id: "minesweeper",
    name: "扫雷",
    description: "经典Windows扫雷游戏！根据数字推理避开雷区，标记所有地雷即可获胜。",
    path: "/games/minesweeper",
    icon: "💣",
    category: "puzzle",
    categoryName: "益智消除",
    color: "from-gray-500 to-slate-500",
    tags: ["扫雷", "逻辑", "推理", "经典"],
    difficulty: "hard",
    avgSessionMin: 5,
    hasLeaderboard: false,
    hasDailyChallenge: false,
    retentionScore: 7,
  },
  {
    id: "tic-tac-toe",
    name: "井字棋AI对战",
    description: "经典井字棋（三连棋），挑战无敌AI！AI使用Minimax算法，你能逼平甚至战胜它吗？",
    path: "/games/tic-tac-toe",
    icon: "⭕",
    category: "puzzle",
    categoryName: "益智消除",
    color: "from-indigo-500 to-blue-500",
    tags: ["井字棋", "AI对战", "策略", "Minimax"],
    difficulty: "easy",
    avgSessionMin: 2,
    hasLeaderboard: false,
    hasDailyChallenge: false,
    retentionScore: 6,
  },
  {
    id: "daily-sudoku",
    name: "每日数独",
    description: "每天一题经典数独，全员同题！9×9格子填入1-9，每行每列每宫不重复。Wordle式每日挑战。",
    path: "/games/daily-sudoku",
    icon: "📊",
    category: "daily",
    categoryName: "每日挑战",
    color: "from-teal-500 to-cyan-500",
    tags: ["数独", "每日", "逻辑", "同题PK"],
    difficulty: "hard",
    avgSessionMin: 8,
    hasLeaderboard: true,
    hasDailyChallenge: true,
    retentionScore: 10,
  },
  {
    id: "color-guess",
    name: "颜色辨别测试",
    description: "在一堆相同颜色中找出色差不同的那一块！随着关卡推进色差越来越小，你能过几关？",
    path: "/games/color-guess",
    icon: "🌈",
    category: "brain",
    categoryName: "脑力训练",
    color: "from-fuchsia-500 to-pink-500",
    tags: ["颜色", "辨别", "视觉", "关卡"],
    difficulty: "easy",
    avgSessionMin: 3,
    hasLeaderboard: true,
    hasDailyChallenge: false,
    retentionScore: 8,
  },
  {
    id: "number-memory",
    name: "数字记忆挑战",
    description: "记忆一串数字然后输入！数字长度逐级增加，从3位到20位，你的记忆极限在哪里？",
    path: "/games/number-memory",
    icon: "🧠",
    category: "brain",
    categoryName: "脑力训练",
    color: "from-violet-500 to-purple-500",
    tags: ["记忆", "数字", "脑力", "极限"],
    difficulty: "medium",
    avgSessionMin: 3,
    hasLeaderboard: true,
    hasDailyChallenge: false,
    retentionScore: 8,
  },
  {
    id: "aim-trainer",
    name: "瞄准训练器",
    description: "30秒内点击尽可能多的目标！训练你的鼠标精准度和速度。FPS玩家必备训练工具。",
    path: "/games/aim-trainer",
    icon: "🎯",
    category: "reflex",
    categoryName: "反应训练",
    color: "from-red-500 to-orange-500",
    tags: ["瞄准", "射击", "反应", "排行榜"],
    difficulty: "easy",
    avgSessionMin: 1,
    hasLeaderboard: true,
    hasDailyChallenge: true,
    retentionScore: 7,
  },
];

export function getGameById(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}

export function getGamesByCategory(category: string): Game[] {
  return games.filter((g) => g.category === category);
}

export const gameCategories = [
  { id: "all", name: "全部游戏", icon: "🎮" },
  { id: "puzzle", name: "益智消除", icon: "🧩" },
  { id: "arcade", name: "经典街机", icon: "🕹️" },
  { id: "brain", name: "脑力训练", icon: "🧠" },
  { id: "daily", name: "每日挑战", icon: "📅" },
  { id: "reflex", name: "反应训练", icon: "⚡" },
];
