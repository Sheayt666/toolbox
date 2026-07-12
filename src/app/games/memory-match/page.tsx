"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, RotateCcw } from "lucide-react";
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
  const [cards, setCards] = useState<Card[]>(() => makeCards());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const movesRef = useRef(0);
  const secondsRef = useRef(0);
  const matchedRef = useRef(0);
  const submittedRef = useRef(false);

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
    setRefreshKey((k) => k + 1);
  }, []);

  // 计时器
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
      const [a, b] = newFlipped;
      if (cards[a].emoji === cards[b].emoji) {
        // 匹配成功
        matchedRef.current += 1;
        setCards((cs) =>
          cs.map((c, idx) =>
            idx === a || idx === b ? { ...c, matched: true } : c,
          ),
        );
        setFlipped([]);
        if (matchedRef.current === EMOJIS.length) {
          finish();
        }
      } else {
        // 不匹配，延迟翻回
        setLocked(true);
        window.setTimeout(() => {
          setCards((cs) =>
            cs.map((c, idx) =>
              idx === a || idx === b ? { ...c, flipped: false } : c,
            ),
          );
          setFlipped([]);
          setLocked(false);
        }, 800);
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
      stats={stats}
      shareScore={result?.score ?? 0}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-[400px]">
          <div className="grid grid-cols-4 gap-2.5">
            {cards.map((c, i) => (
              <button
                key={c.id}
                onClick={() => handleClick(i)}
                className={`aspect-square rounded-lg text-3xl sm:text-4xl flex items-center justify-center transition-all duration-300 ${
                  c.flipped || c.matched
                    ? "bg-[#27272a] border border-[#8b5cf6]/20"
                    : "bg-[#8b5cf6]/10 border border-transparent hover:bg-[#8b5cf6]/20"
                } ${c.matched ? "opacity-40 scale-95" : ""}`}
                aria-label={c.flipped || c.matched ? c.emoji : "未翻开卡片"}
              >
                {c.flipped || c.matched ? c.emoji : "?"}
              </button>
            ))}
          </div>

          {finished && result && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
              <div className="text-4xl mb-2">🧠</div>
              <h3 className="text-xl font-bold mb-1">通关完成</h3>
              <p className="text-sm text-slate-400 mb-1">最终分数</p>
              <p className="text-3xl font-bold text-[#a78bfa] mb-1">{result.score}</p>
              <p className="text-xs text-slate-500 mb-3">
                {result.moves} 步 / {result.seconds} 秒
              </p>
              <p className="text-xs text-slate-400 mb-4">
                排名第 {result.rank}/{result.total}，超越了 {result.beatPercent}% 的玩家
              </p>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {!finished && (
          <button
            onClick={restart}
            className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        )}
      </div>
    </GameShell>
  );
}
