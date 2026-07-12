"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Coffee, RotateCcw, Play, Pause } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "cafe-tycoon";
const BEST_SCORE_KEY = "gm_cafe_tycoon_best_score";
const TICK_MS = 100; // 游戏逻辑 tick

const COFFEE_TYPES = [
  { id: "espresso", name: "浓缩", emoji: "☕", price: 5, brewTime: 3 },
  { id: "latte", name: "拿铁", emoji: " latte", price: 8, brewTime: 4 },
  { id: "cappuccino", name: "卡布奇诺", emoji: " capp", price: 7, brewTime: 4 },
  { id: "mocha", name: "摩卡", emoji: " mocha", price: 10, brewTime: 5 },
];

const CUSTOMER_EMOJIS = ["🧑", "👩", "👨", "👵", "👴", "🧔", "👩‍🦰", "👨‍🦱", "🧑‍🦲", "👩‍🦳"];

interface Customer {
  id: number;
  emoji: string;
  order: string;
  orderIndex: number;
  patience: number;
  maxPatience: number;
  x: number;
  state: "waiting" | "ordered" | "served" | "leaving";
  served: boolean;
  angry: boolean;
}

interface Machine {
  id: number;
  brewing: boolean;
  brewTimer: number;
  brewTotal: number;
  coffeeType: string;
  ready: boolean;
}

interface Upgrade {
  id: string;
  name: string;
  desc: string;
  cost: number;
  level: number;
  maxLevel: number;
  icon: string;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

interface FloatText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
}

/* ============ 组件 ============ */

export default function CafeTycoonPage() {
  const [mounted, setMounted] = useState(false);
  const [coins, setCoins] = useState(50);
  const [day, setDay] = useState(1);
  const [dayRevenue, setDayRevenue] = useState(0);
  const [dayTarget, setDayTarget] = useState(100);
  const [reputation, setReputation] = useState(3);
  const [failCount, setFailCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 秒
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [machines, setMachines] = useState<Machine[]>([
    { id: 0, brewing: false, brewTimer: 0, brewTotal: 0, coffeeType: "", ready: false },
    { id: 1, brewing: false, brewTimer: 0, brewTotal: 0, coffeeType: "", ready: false },
  ]);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    { id: "machineSpeed", name: "快速咖啡机", desc: "减少制作时间", cost: 30, level: 0, maxLevel: 3, icon: "⚡" },
    { id: "extraMachine", name: "额外咖啡机", desc: "增加一台机器", cost: 50, level: 0, maxLevel: 2, icon: "🔧" },
    { id: "betterCoffee", name: "精品咖啡豆", desc: "提高售价50%", cost: 40, level: 0, maxLevel: 3, icon: "🌟" },
    { id: "barista", name: "雇佣咖啡师", desc: "自动服务顾客", cost: 80, level: 0, maxLevel: 1, icon: "👨‍🍳" },
  ]);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [best, setBest] = useState(0);
  const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [dayTransition, setDayTransition] = useState(false);
  const [dayResult, setDayResult] = useState<{ revenue: number; target: number; passed: boolean } | null>(null);
  const [paused, setPaused] = useState(false);

  const coinsRef = useRef(50);
  const dayRef = useRef(1);
  const dayRevenueRef = useRef(0);
  const reputationRef = useRef(3);
  const failCountRef = useRef(0);
  const timeLeftRef = useRef(60);
  const customersRef = useRef<Customer[]>([]);
  const machinesRef = useRef<Machine[]>([]);
  const upgradesRef = useRef<Upgrade[]>([]);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const customerIdRef = useRef(0);
  const floatTextIdRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const baristaTimerRef = useRef(0);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ----- mounted 初始化 ----- */
  useEffect(() => {
    setMounted(true);
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (saved > 0) {
        bestRef.current = saved;
        setBest(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ----- 定时器管理 ----- */
  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  /* ----- 暂停切换 ----- */
  const togglePause = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  /* ----- 同步 ref 到 state ----- */
  const syncState = useCallback(() => {
    setCoins(coinsRef.current);
    setDay(dayRef.current);
    setDayRevenue(dayRevenueRef.current);
    setReputation(reputationRef.current);
    setFailCount(failCountRef.current);
    setTimeLeft(Math.ceil(timeLeftRef.current));
    setCustomers([...customersRef.current]);
    setMachines([...machinesRef.current]);
    setUpgrades([...upgradesRef.current]);
  }, []);

  /* ----- 添加浮动文字 ----- */
  const addFloatText = useCallback((text: string, color: string) => {
    const id = floatTextIdRef.current++;
    setFloatTexts((prev) => [...prev, { id, text, x: 50, y: 50, color, life: 60 }]);
    addTimer(() => {
      setFloatTexts((prev) => prev.filter((f) => f.id !== id));
    }, 1500);
  }, [addTimer]);

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    setOver(true);
    setRunning(false);
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (submittedRef.current) return;
    submittedRef.current = true;
    const finalScore = dayRevenueRef.current + coinsRef.current;
    const r = submitScore(GAME_ID, finalScore, `收益 ${finalScore} 金币`);
    setResult(r);
    setRefreshKey((k) => k + 1);
    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBest(finalScore);
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(finalScore));
      } catch {
        /* ignore */
      }
    }
  }, []);

  /* ----- 生成顾客 ----- */
  const spawnCustomer = useCallback(() => {
    const orderIndex = Math.floor(Math.random() * COFFEE_TYPES.length);
    const maxPatience = 20 + Math.random() * 15;
    const id = customerIdRef.current++;
    const emoji = CUSTOMER_EMOJIS[Math.floor(Math.random() * CUSTOMER_EMOJIS.length)];
    const customer: Customer = {
      id,
      emoji,
      order: COFFEE_TYPES[orderIndex].id,
      orderIndex,
      patience: maxPatience,
      maxPatience,
      x: 0,
      state: "waiting",
      served: false,
      angry: false,
    };
    customersRef.current.push(customer);
  }, []);

  /* ----- 游戏主 tick ----- */
  const gameTick = useCallback(() => {
    if (!runningRef.current || overRef.current) return;
    if (pausedRef.current) return;

    // 时间流逝
    timeLeftRef.current -= TICK_MS / 1000;
    if (timeLeftRef.current <= 0) {
      // 一天结束
      const revenue = dayRevenueRef.current;
      const passed = revenue >= getDayTarget(dayRef.current);
      if (passed) {
        dayRef.current++;
        dayRevenueRef.current = 0;
        timeLeftRef.current = 60;
        reputationRef.current = Math.min(5, reputationRef.current + 0.5);
        setDayTransition(true);
        setDayResult({ revenue, target: getDayTarget(dayRef.current - 1), passed: true });
        addTimer(() => {
          setDayTransition(false);
          setDayResult(null);
        }, 2500);
      } else {
        failCountRef.current++;
        reputationRef.current = Math.max(0, reputationRef.current - 1);
        if (failCountRef.current >= 3) {
          doGameOver();
          return;
        }
        dayRef.current++;
        dayRevenueRef.current = 0;
        timeLeftRef.current = 60;
        setDayTransition(true);
        setDayResult({ revenue, target: getDayTarget(dayRef.current - 1), passed: false });
        addTimer(() => {
          setDayTransition(false);
          setDayResult(null);
        }, 2500);
      }
      syncState();
      return;
    }

    // 顾客耐心衰减
    for (const c of customersRef.current) {
      if (c.state === "waiting" || c.state === "ordered") {
        c.patience -= TICK_MS / 1000;
        c.angry = c.patience < c.maxPatience * 0.3;
        if (c.patience <= 0) {
          c.state = "leaving";
          c.angry = true;
          reputationRef.current = Math.max(0, reputationRef.current - 0.2);
        }
      }
    }
    // 清理离开的顾客
    customersRef.current = customersRef.current.filter((c) => c.state !== "leaving" || c.patience > -2);

    // 咖啡机 brewing
    const speedMult = 1 + upgradesRef.current.find((u) => u.id === "machineSpeed")!.level * 0.3;
    for (const m of machinesRef.current) {
      if (m.brewing) {
        m.brewTimer -= (TICK_MS / 1000) * speedMult;
        if (m.brewTimer <= 0) {
          m.brewing = false;
          m.ready = true;
        }
      }
    }

    // 生成顾客
    spawnTimerRef.current -= TICK_MS;
    const spawnInterval = Math.max(2000, 5000 - dayRef.current * 200);
    if (spawnTimerRef.current <= 0 && customersRef.current.length < 6) {
      spawnCustomer();
      spawnTimerRef.current = spawnInterval + Math.random() * 1000;
    }

    // 咖啡师自动服务
    const baristaLevel = upgradesRef.current.find((u) => u.id === "barista")!.level;
    if (baristaLevel > 0) {
      baristaTimerRef.current -= TICK_MS;
      if (baristaTimerRef.current <= 0) {
        baristaTimerRef.current = 2000;
        // 自动找一个等待中的顾客
        const waitingCustomer = customersRef.current.find((c) => c.state === "waiting");
        if (waitingCustomer) {
          // 找一个空闲的机器
          const freeMachine = machinesRef.current.find((m) => !m.brewing && !m.ready);
          if (freeMachine) {
            startBrewing(freeMachine.id, waitingCustomer.order);
            waitingCustomer.state = "ordered";
          }
        }
        // 自动交付
        const readyMachine = machinesRef.current.find((m) => m.ready);
        if (readyMachine) {
          const orderedCustomer = customersRef.current.find((c) => c.state === "ordered");
          if (orderedCustomer) {
            serveCustomer(orderedCustomer.id, readyMachine.id);
          }
        }
      }
    }

    syncState();
  }, [syncState, spawnCustomer, doGameOver, addTimer]);

  /* ----- 获取每日目标 ----- */
  function getDayTarget(d: number): number {
    return 80 + d * 40;
  }

  /* ----- 开始制作咖啡 ----- */
  const startBrewing = useCallback((machineId: number, coffeeType: string) => {
    const machine = machinesRef.current.find((m) => m.id === machineId);
    if (!machine || machine.brewing || machine.ready) return;
    const coffee = COFFEE_TYPES.find((c) => c.id === coffeeType);
    if (!coffee) return;
    machine.brewing = true;
    machine.brewTimer = coffee.brewTime;
    machine.brewTotal = coffee.brewTime;
    machine.coffeeType = coffeeType;
    machine.ready = false;
    syncState();
  }, [syncState]);

  /* ----- 服务顾客 ----- */
  const serveCustomer = useCallback((customerId: number, machineId: number) => {
    const customer = customersRef.current.find((c) => c.id === customerId);
    const machine = machinesRef.current.find((m) => m.id === machineId);
    if (!customer || !machine || !machine.ready) return;
    if (customer.order !== machine.coffeeType) return;

    const coffee = COFFEE_TYPES.find((c) => c.id === customer.order)!;
    const priceMult = 1 + upgradesRef.current.find((u) => u.id === "betterCoffee")!.level * 0.5;
    const earned = Math.floor(coffee.price * priceMult);
    coinsRef.current += earned;
    dayRevenueRef.current += earned;
    machine.ready = false;
    machine.coffeeType = "";
    machine.brewing = false;
    customer.state = "served";
    customer.served = true;
    addFloatText(`+${earned}💰`, "#fbbf24");

    // 顾客离开
    addTimer(() => {
      customersRef.current = customersRef.current.filter((c) => c.id !== customerId);
      syncState();
    }, 500);
    syncState();
  }, [syncState, addFloatText]);

  /* ----- 点击顾客 ----- */
  const onCustomerClick = useCallback((customerId: number) => {
    const customer = customersRef.current.find((c) => c.id === customerId);
    if (!customer) return;
    if (customer.state === "waiting") {
      // 选择订单，然后点击机器制作
      setSelectedCustomer(customerId);
    } else if (customer.state === "ordered") {
      // 检查有没有做好的对应咖啡
      const readyMachine = machinesRef.current.find(
        (m) => m.ready && m.coffeeType === customer.order,
      );
      if (readyMachine) {
        serveCustomer(customerId, readyMachine.id);
        setSelectedCustomer(null);
      }
    }
  }, [serveCustomer]);

  /* ----- 点击机器 ----- */
  const onMachineClick = useCallback((machineId: number) => {
    const machine = machinesRef.current.find((m) => m.id === machineId);
    if (!machine) return;

    if (machine.ready) {
      // 交付给已下单的顾客
      const orderedCustomer = customersRef.current.find(
        (c) => c.state === "ordered" && c.order === machine.coffeeType,
      );
      if (orderedCustomer) {
        serveCustomer(orderedCustomer.id, machineId);
        setSelectedCustomer(null);
      }
    } else if (!machine.brewing && selectedCustomer !== null) {
      // 为选中的顾客制作咖啡
      const customer = customersRef.current.find((c) => c.id === selectedCustomer);
      if (customer && customer.state === "waiting") {
        startBrewing(machineId, customer.order);
        customer.state = "ordered";
        setSelectedCustomer(null);
        syncState();
      }
    }
  }, [selectedCustomer, startBrewing, serveCustomer, syncState]);

  /* ----- 购买升级 ----- */
  const buyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = upgradesRef.current.find((u) => u.id === upgradeId);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return;
    if (coinsRef.current < upgrade.cost) return;
    coinsRef.current -= upgrade.cost;
    upgrade.level++;
    upgrade.cost = Math.floor(upgrade.cost * 1.6);

    if (upgradeId === "extraMachine") {
      machinesRef.current.push({
        id: machinesRef.current.length,
        brewing: false,
        brewTimer: 0,
        brewTotal: 0,
        coffeeType: "",
        ready: false,
      });
    }
    syncState();
  }, [syncState]);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    clearAllTimers();
    coinsRef.current = 50;
    dayRef.current = 1;
    dayRevenueRef.current = 0;
    reputationRef.current = 3;
    failCountRef.current = 0;
    timeLeftRef.current = 60;
    customersRef.current = [];
    machinesRef.current = [
      { id: 0, brewing: false, brewTimer: 0, brewTotal: 0, coffeeType: "", ready: false },
      { id: 1, brewing: false, brewTimer: 0, brewTotal: 0, coffeeType: "", ready: false },
    ];
    upgradesRef.current = [
      { id: "machineSpeed", name: "快速咖啡机", desc: "减少制作时间", cost: 30, level: 0, maxLevel: 3, icon: "⚡" },
      { id: "extraMachine", name: "额外咖啡机", desc: "增加一台机器", cost: 50, level: 0, maxLevel: 2, icon: "🔧" },
      { id: "betterCoffee", name: "精品咖啡豆", desc: "提高售价50%", cost: 40, level: 0, maxLevel: 3, icon: "🌟" },
      { id: "barista", name: "雇佣咖啡师", desc: "自动服务顾客", cost: 80, level: 0, maxLevel: 1, icon: "👨‍🍳" },
    ];
    overRef.current = false;
    submittedRef.current = false;
    spawnTimerRef.current = 1000;
    baristaTimerRef.current = 0;
    pausedRef.current = false;
    setSelectedCustomer(null);
    setOver(false);
    setResult(null);
    setPaused(false);
    setDayTransition(false);
    setDayResult(null);
    runningRef.current = true;
    setRunning(true);
    setDayTarget(getDayTarget(1));
    syncState();

    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    tickIntervalRef.current = setInterval(gameTick, TICK_MS);
  }, [syncState, gameTick, clearAllTimers]);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    start();
  }, [start]);

  /* ----- 清理 ----- */
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  /* ----- 更新每日目标 ----- */
  useEffect(() => {
    setDayTarget(getDayTarget(day));
  }, [day]);

  /* ----- 键盘暂停 (P 键) ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePause]);

  const stats: GameStat[] = [
    { label: "金币", value: coins },
    { label: "第几天", value: day },
    { label: "日收入", value: dayRevenue },
    { label: "最高记录", value: best },
  ];

  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="咖啡店大亨"
        description="经营你的咖啡店！接单、制作、服务顾客，赚取金币升级设备。每天有收入目标，连续3天未达标即关门大吉！"
        instructions=""
        icon={Coffee}
        iconEmoji="☕"
        iconGradient="from-amber-600 to-yellow-700"
        stats={stats}
        shareScore={coins + dayRevenue}
        refreshKey={refreshKey}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-amber-500" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="咖啡店大亨"
      description="经营你的咖啡店！接单、制作、服务顾客，赚取金币升级设备。每天有收入目标，连续3天未达标即关门大吉！"
      instructions={`玩法：
  1. 顾客会自动进店，头顶显示想要的咖啡订单
  2. 点击顾客接单，再点击空闲咖啡机制作
  3. 咖啡制作完成后（机器变绿），点击顾客交付
  4. 也可以直接点击绿色机器自动交付给匹配的顾客
升级：
  ⚡ 快速咖啡机 — 减少制作时间
  🔧 额外咖啡机 — 增加一台机器
  🌟 精品咖啡豆 — 提高售价50%
  👨‍🍳 雇佣咖啡师 — 自动接单和服务
注意：
  顾客耐心有限，等待太久会愤怒离开，降低声誉
  每天有收入目标，未达标累积3次游戏结束
  咖啡类型：浓缩(5金) 拿铁(8金) 卡布奇诺(7金) 摩卡(10金)`}
      icon={Coffee}
      iconEmoji="☕"
      iconGradient="from-amber-600 to-yellow-700"
      stats={stats}
      shareScore={coins + dayRevenue}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center gap-4">
        {/* 顶部状态栏 */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">金币</span>
              <div className="text-lg font-bold text-amber-400 tabular-nums">{coins} 💰</div>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">第 {day} 天</span>
              <div className="text-lg font-bold text-white tabular-nums">
                {dayRevenue} / <span className="text-amber-500">{dayTarget}</span>
              </div>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">剩余时间</span>
              <div className={`text-lg font-bold tabular-nums ${timeLeft < 10 ? "text-red-400" : "text-white"}`}>
                {Math.max(0, Math.ceil(timeLeft))}s
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">声誉</span>
              <div className="text-lg font-bold text-yellow-400">
                {"★".repeat(Math.round(reputation))}<span className="text-slate-700">{"★".repeat(5 - Math.round(reputation))}</span>
              </div>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2">
              <span className="text-[11px] text-slate-500">失败</span>
              <div className="text-lg font-bold text-red-400 tabular-nums">{failCount}/3</div>
            </div>
          </div>
        </div>

        {/* 咖啡店场景 */}
        <div className="relative w-full max-w-2xl">
          <div className="relative bg-gradient-to-b from-amber-950/30 to-[#0a0a0b] border border-[#27272a] rounded-xl p-4 overflow-hidden min-h-[400px]">
            {/* 浮动文字 */}
            {floatTexts.map((ft) => (
              <div
                key={ft.id}
                className="absolute left-1/2 top-1/3 -translate-x-1/2 text-xl font-bold animate-bounce pointer-events-none z-30"
                style={{ color: ft.color }}
              >
                {ft.text}
              </div>
            ))}

            {/* 日间过渡 */}
            {dayTransition && dayResult && (
              <div className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-overlay-in">
                <div className="text-5xl mb-3">{dayResult.passed ? "🌅" : "😞"}</div>
                <h3 className="text-2xl font-bold mb-2">
                  第 {day - 1} 天 {dayResult.passed ? "完成！" : "未达标"}
                </h3>
                <p className="text-sm text-slate-400">
                  收入: <span className="text-amber-400 font-bold">{dayResult.revenue}</span> / 目标: {dayResult.target}
                </p>
                <p className="text-xs text-slate-500 mt-2">准备第 {day} 天...</p>
              </div>
            )}

            {/* 暂停覆盖层 */}
            {paused && running && !over && (
              <div className="absolute inset-0 bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center z-40 animate-overlay-in">
                <Pause className="w-12 h-12 text-amber-400 mb-3" />
                <h3 className="text-2xl font-bold text-white mb-2">已暂停</h3>
                <p className="text-xs text-slate-500">按 P 键或点击继续按钮恢复游戏</p>
              </div>
            )}

            {/* 咖啡机区域 */}
            <div className="mb-4">
              <div className="text-xs text-slate-500 mb-2">☕ 咖啡机</div>
              <div className="flex items-center gap-3 flex-wrap">
                {machines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onMachineClick(m.id)}
                    aria-label={`咖啡机${m.id + 1}${m.ready ? " 咖啡已就绪" : m.brewing ? " 正在制作" : " 空闲"}`}
                    className={`relative w-20 h-24 rounded-lg border-2 transition-all active:scale-95 ${
                      m.ready
                        ? "bg-green-600/30 border-green-500 animate-pulse"
                        : m.brewing
                          ? "bg-amber-600/20 border-amber-600"
                          : selectedCustomer !== null
                            ? "bg-blue-600/20 border-blue-500 cursor-pointer hover:bg-blue-600/30"
                            : "bg-[#18181b] border-[#3f3f46]"
                    }`}
                  >
                    <div className="text-2xl">☕</div>
                    {m.brewing && (
                      <div className="absolute bottom-1 left-1 right-1 h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{ width: `${((m.brewTotal - m.brewTimer) / m.brewTotal) * 100}%` }}
                        />
                      </div>
                    )}
                    {m.ready && (
                      <div className="absolute -top-2 -right-2 text-xs bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        ✓
                      </div>
                    )}
                    {m.brewing && (
                      <div className="absolute top-1 right-1 text-[9px] text-amber-400">
                        {m.coffeeType.slice(0, 4)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 柜台分隔线 */}
            <div className="border-t border-dashed border-[#3f3f46] my-3" />

            {/* 顾客区域 */}
            <div>
              <div className="text-xs text-slate-500 mb-2">🧑 顾客区</div>
              <div className="flex items-end gap-2 flex-wrap min-h-[120px]">
                {customers.length === 0 && running && (
                  <div className="text-slate-600 text-sm py-8">等待顾客进店...</div>
                )}
                {customers.map((c) => {
                  const coffee = COFFEE_TYPES[c.orderIndex];
                  const patienceRatio = c.patience / c.maxPatience;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onCustomerClick(c.id)}
                      aria-label={`顾客 订单${coffee.name} ${c.state === "served" ? "已服务" : c.state === "ordered" ? "已下单" : "等待中"}`}
                      className={`relative flex flex-col items-center transition-all active:scale-95 ${
                        c.state === "served" ? "opacity-50" : ""
                      } ${selectedCustomer === c.id ? "ring-2 ring-blue-400 rounded-lg" : ""}`}
                    >
                      {/* 订单气泡 */}
                      {c.state !== "served" && (
                        <div className={`mb-1 px-2 py-1 rounded-lg text-xs font-medium border ${
                          c.state === "ordered"
                            ? "bg-amber-600/20 border-amber-600/50 text-amber-300"
                            : c.angry
                              ? "bg-red-600/20 border-red-600/50 text-red-300 animate-pulse"
                              : "bg-[#27272a] border-[#3f3f46] text-white"
                        }`}>
                          {coffee.emoji} {coffee.name}
                          {c.state === "ordered" && <span className="ml-1">⏳</span>}
                        </div>
                      )}
                      {/* 顾客头像 */}
                      <div className={`text-3xl ${c.angry ? "animate-bounce" : ""} ${c.state === "served" ? "grayscale" : ""}`}>
                        {c.emoji}
                      </div>
                      {/* 耐心条 */}
                      {c.state !== "served" && (
                        <div className="w-12 h-1 bg-[#27272a] rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full transition-all ${
                              patienceRatio > 0.5
                                ? "bg-green-500"
                                : patienceRatio > 0.3
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${Math.max(0, patienceRatio * 100)}%` }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 待开始覆盖层 */}
            {!running && !over && (
              <div className="absolute inset-0 rounded-xl bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
                <button
                  onClick={start}
                  aria-label="开店营业"
                  className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-lg shadow-amber-600/30"
                >
                  <Play className="w-5 h-5" /> 开店营业
                </button>
                <p className="mt-4 text-xs text-slate-400 text-center px-4">
                  点击顾客接单 → 点击机器制作 → 点击顾客交付
                </p>
              </div>
            )}

            {/* 游戏结束覆盖层 */}
            {over && (
              <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
                <div className="text-5xl mb-3">{failCount >= 3 ? "🏪" : "☕"}</div>
                <h3 className="text-2xl font-bold mb-2">
                  {failCount >= 3 ? "关门大吉！" : "经营结束"}
                </h3>
                <p className="text-sm text-slate-400 mb-1">坚持了 {day} 天</p>
                <p className="text-sm text-slate-400 mb-1">总收益</p>
                <p className="text-4xl font-bold text-amber-400 mb-1">{coins + dayRevenue} 💰</p>
                <p className="text-xs text-slate-500 mb-3">
                  {(coins + dayRevenue) >= best && (coins + dayRevenue) > 0 ? "新纪录！" : `最高记录: ${best}`}
                </p>
                {result && (
                  <p className="text-xs text-slate-400 mb-4 bg-[#27272a]/60 rounded-lg px-3 py-2">
                    排名第 <span className="text-amber-400 font-bold">{result.rank}</span>/{result.total}
                    ，超越了 <span className="text-amber-400 font-bold">{result.beatPercent}%</span> 的玩家
                  </p>
                )}
                <button
                  onClick={restart}
                  aria-label="重新开店"
                  className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-lg shadow-amber-600/30"
                >
                  <RotateCcw className="w-4 h-4" /> 重新开店
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 升级商店 */}
        {running && !over && (
          <div className="w-full max-w-2xl">
            <div className="text-xs text-slate-500 mb-2">🛒 升级商店</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {upgrades.map((u) => (
                <button
                  key={u.id}
                  onClick={() => buyUpgrade(u.id)}
                  disabled={u.level >= u.maxLevel || coins < u.cost}
                  aria-label={`${u.name} - ${u.desc} - 等级${u.level}/${u.maxLevel}${u.level >= u.maxLevel ? " 已满级" : coins < u.cost ? " 余额不足" : ""}`}
                  className={`p-3 rounded-lg border text-left transition-all active:scale-95 ${
                    u.level >= u.maxLevel
                      ? "bg-[#18181b] border-[#27272a] opacity-50 cursor-not-allowed"
                      : coins < u.cost
                        ? "bg-[#18181b] border-[#27272a] opacity-50 cursor-not-allowed"
                        : "bg-[#18181b] border-[#3f3f46] hover:border-amber-600/50 hover:bg-amber-950/20"
                  }`}
                >
                  <div className="text-xl mb-1">{u.icon}</div>
                  <div className="text-xs font-bold text-white truncate">{u.name}</div>
                  <div className="text-[10px] text-slate-500 mb-1">{u.desc}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Lv.{u.level}/{u.maxLevel}
                    </span>
                    {u.level < u.maxLevel && (
                      <span className={`text-xs font-bold ${coins >= u.cost ? "text-amber-400" : "text-red-400"}`}>
                        {u.cost}💰
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex items-center gap-3">
          {!running && !over && (
            <button
              onClick={start}
              aria-label="开始游戏"
              className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-lg shadow-amber-600/30"
            >
              <Play className="w-4 h-4" /> 开始
            </button>
          )}
          {running && !over && (
            <button
              onClick={togglePause}
              aria-label={paused ? "继续游戏" : "暂停游戏"}
              className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-white bg-[#3f3f46] hover:bg-[#52525b] rounded-xl transition-colors border border-[#52525b]"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? "继续" : "暂停"}
            </button>
          )}
          <button
            onClick={restart}
            aria-label="重新开始"
            className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>
      </div>
    </GameShell>
  );
}
