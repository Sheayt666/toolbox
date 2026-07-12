"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, RotateCcw, Trophy } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "memory-match";
const EMOJIS = ["🚀", "🎨", "🎸", "🍕", "🐙", "🌈", "⚡", "🎲"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function makeCards(): Card[] {
  const pairs = shuffle(EMOJIS).slice(0, 8);
  return shuffle([...pairs, ...pairs]).map((e, i) => ({
    id: i,
    emoji: e,
    flipped: false,
    matched: false,
  }));
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
  score: number;
  moves: number;
  seconds: number;
}

export default function MemoryMatchPage() {
  // ---- Hydration-safe initialization ----
  // NEVER call makeCards() (which uses Math.random) during initial render.
  // Start with an empty array and populate in useEffect after mount.
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [scoreAnim, setScoreAnim] = useState(0);

  const movesRef = useRef(0);
  const secondsRef = useRef(0);
  const matchedRef = useRef(0);
  const submittedRef = useRef(false);

  // Mount: generate cards and load best score
  useEffect(() => {
    setMounted(true);
    setCards(makeCards());
    try {
      const stats = JSON.parse(localStorage.getItem("gm_stats") || "{}");
      if (stats.highScores?.[GAME_ID]) setBestScore(stats.highScores[GAME_ID]);
    } catch {
      /* ignore */
    }
  }, []);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setFinished(true);
    const score = Math.max(0, 10000 - movesRef.current * 100 - secondsRef.current);
    const r = submitScore(
      GAME_ID,
      score,
      `${movesRef.current}步 / ${secondsRef.current}秒`,
    );
    setResult({
      ...r,
      score,
      moves: movesRef.current,
      seconds: secondsRef.current,
    });
    setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
    setRefreshKey((k) => k + 1);
    setScoreAnim((n) => n + 1);
  }, []);

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    const id = window.setInterval(() => {
      setSeconds((s) => {
        secondsRef.current = s + 1;
        return secondsRef.current;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, finished]);

  const handleClick = (index: number) => {
    if (finished || locked) return;
    if (cards[index].flipped || cards[index].matched) return;
    if (!started) setStarted(true);

    const newFlipped = [...flipped, index];
    setCards((cs) =>
      cs.map((c, idx) => (idx === index ? { ...c, flipped: true } : c)),
    );
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      movesRef.current += 1;
      setMoves(movesRef.current);
      setScoreAnim((n) => n + 1);
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        // Match
        matchedRef.current += 1;
        setCards((cs) =>
          cs.map((c, idx) =>
            idx === a || idx === b ? { ...c, matched: true } : c,
          ),
        );
        setFlipped([]);
        if (matchedRef.current === EMOJIS.length) {
          window.setTimeout(() => finish(), 600);
        }
      } else {
        // No match - flip back after delay
        setLocked(true);
        window.setTimeout(() => {
          setCards((cs) =>
            cs.map((c, idx) =>
              idx === a || idx === b ? { ...c, flipped: false } : c,
            ),
          );
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  const restart = () => {
    submittedRef.current = false;
    movesRef.current = 0;
    secondsRef.current = 0;
    matchedRef.current = 0;
    setCards(makeCards());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setFinished(false);
    setLocked(false);
    setResult(null);
  };

  // Loading state before mount (prevents hydration mismatch)
  if (!mounted || cards.length === 0) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="记忆翻牌"
        description="4×4 网格共 8 对 emoji 卡片，翻牌找出全部配对，步数和时间越少分数越高"
        instructions="点击卡片将其翻开，每次最多翻开两张。"
        icon={Brain}
        iconEmoji="🃏"
        iconGradient="from-purple-500 to-violet-500"
        stats={[
          { label: "步数", value: 0 },
          { label: "用时", value: "0s" },
          { label: "已配对", value: `0/${EMOJIS.length}` },
          { label: "游戏状态", value: "加载中" },
        ]}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-slate-400">正在洗牌...</p>
        </div>
      </GameShell>
    );
  }

  const matchedCount = cards.filter((c) => c.matched).length / 2;

  const stats: GameStat[] = [
    { label: "步数", value: moves },
    { label: "用时", value: `${seconds}s` },
    { label: "已配对", value: `${matchedCount}/${EMOJIS.length}` },
    { label: "游戏状态", value: finished ? "已完成" : started ? "进行中" : "待开始" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="记忆翻牌"
      description="4×4 网格共 8 对 emoji 卡片，翻牌找出全部配对，步数和时间越少分数越高"
      instructions={`点击卡片将其翻开，每次最多翻开两张。
若两张卡片图案相同则保持翻开状态；不同则自动翻回。
步数和时间越少最终分数越高，公式：10000 - 步数×100 - 用时秒数。
找出全部 8 对配对后分数自动提交到排行榜。`}
      icon={Brain}
      iconEmoji="🃏"
      iconGradient="from-purple-500 to-violet-500"
      stats={stats}
      shareScore={result?.score ?? 0}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* Best score badge */}
        {bestScore !== null && !finished && (
          <div className="flex items-center gap-2 mb-4 bg-[#8b5cf6]/10 border border-[#8b5cf6]/25 rounded-lg px-3 py-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-slate-400">最佳：</span>
            <span className="text-xs font-bold text-[#c084fc]">{bestScore}</span>
          </div>
        )}

        <div className="relative w-full max-w-[420px]">
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
            {cards.map((c, i) => {
              const isUp = c.flipped || c.matched;
              return (
                <button
                  key={c.id}
                  onClick={() => handleClick(i)}
                  className={`card-3d w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 ${isUp ? "flipped" : ""}`}
                  aria-label={isUp ? c.emoji : "未翻开卡片"}
                >
                  <div className="card-3d-inner">
                    {/* Front (back of card, shown when face down) */}
                    <div
                      className={`card-3d-face cursor-pointer border ${
                        c.matched
                          ? "border-[#8b5cf6]/40 bg-[#8b5cf6]/15"
                          : "border-transparent bg-gradient-to-br from-[#8b5cf6]/15 to-[#6d28d9]/10 hover:from-[#8b5cf6]/25 hover:to-[#6d28d9]/20"
                      } transition-colors`}
                    >
                      <span className="text-2xl sm:text-3xl opacity-30 select-none">?</span>
                    </div>
                    {/* Back (front of card, shown when flipped) */}
                    <div
                      className={`card-3d-face card-3d-back border ${
                        c.matched
                          ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/20 glow-matched"
                          : "border-[#8b5cf6]/20 bg-[#27272a]"
                      }`}
                    >
                      <span className={`text-3xl sm:text-4xl select-none ${c.matched ? "scale-110" : ""} transition-transform`}>
                        {c.emoji}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Result overlay */}
          {finished && result && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-bounce-in">
              <div className="text-5xl mb-3">🧠</div>
              <h3 className="text-xl font-bold mb-2">通关完成</h3>
              <p className="text-sm text-slate-400 mb-1">最终分数</p>
              <p key={scoreAnim} className="text-4xl font-bold text-[#c084fc] mb-2 animate-score-pop">
                {result.score}
              </p>
              <p className="text-xs text-slate-500 mb-3">
                {result.moves} 步 / {result.seconds} 秒
              </p>
              <p className="text-xs text-slate-400 mb-4">
                排名第 {result.rank}/{result.total}，超越了 {result.beatPercent}% 的玩家
              </p>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {!finished && (
          <button
            onClick={restart}
            className="mt-5 inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        )}
      </div>
    </GameShell>
  );
}
