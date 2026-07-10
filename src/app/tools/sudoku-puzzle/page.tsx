"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Grid2x2, RotateCcw, Check, Eraser } from "lucide-react";

const PUZZLES: number[][][] = [
  [
    [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9],
  ],
  [
    [0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],
    [8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],
    [0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0],
  ],
];

const SOLUTIONS: number[][][] = [
  [
    [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9],
  ],
  [
    [4,3,5,2,6,9,7,8,1],[6,8,2,5,7,1,4,9,3],[1,9,7,8,3,4,5,6,2],
    [8,2,6,1,9,5,3,4,7],[3,7,4,6,8,2,9,1,5],[9,5,1,7,4,3,6,2,8],
    [5,1,9,3,2,6,8,7,4],[2,4,8,9,5,7,1,3,6],[7,6,3,4,1,8,2,9,5],
  ],
];

export default function SudokuPuzzlePage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [board, setBoard] = useState<number[][]>(() => PUZZLES[0].map((r) => [...r]));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const isInitial = useCallback((r: number, c: number) => PUZZLES[puzzleIndex][r][c] !== 0, [puzzleIndex]);

  const handleSelect = (r: number, c: number) => {
    if (!isInitial(r, c)) setSelectedCell([r, c]);
  };

  const handleInput = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (isInitial(r, c)) return;
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);
    const newErrors = new Set(errors);
    const key = `${r}-${c}`;
    if (num !== 0 && num !== SOLUTIONS[puzzleIndex][r][c]) { newErrors.add(key); } else { newErrors.delete(key); }
    setErrors(newErrors);
  };

  const handleErase = () => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (isInitial(r, c)) return;
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    const newErrors = new Set(errors);
    newErrors.delete(`${r}-${c}`);
    setErrors(newErrors);
  };

  const handleRestart = () => {
    setPuzzleIndex(0);
    setBoard(PUZZLES[0].map((r) => [...r]));
    setSelectedCell(null);
    setErrors(new Set());
  };

  const isComplete = board.every((row, r) => row.every((cell, c) => cell === SOLUTIONS[puzzleIndex][r][c]));

  return (
    <ToolLayout title="数独游戏" description="经典数独益智游戏" icon={Grid2x2} category="教育学习" slug="sudoku-puzzle">
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-400">错误: {errors.size}</span>
            <button onClick={handleRestart} className="px-4 py-2 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-lg hover:border-[#3f3f46] transition-colors inline-flex items-center gap-2 text-sm"><RotateCcw className="w-4 h-4" />重开</button>
          </div>

          {isComplete && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center mb-4">
              <div className="text-3xl mb-1">🎉</div>
              <h3 className="text-emerald-400 font-bold">恭喜完成数独！</h3>
            </div>
          )}

          <div className="grid grid-cols-9 gap-0.5 mb-4 bg-[#27272a] p-1 rounded-lg">
            {board.map((row, r) => row.map((cell, c) => {
              const isSel = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isErr = errors.has(`${r}-${c}`);
              const borderRight = (c + 1) % 3 === 0 && c < 8 ? "border-r-2 border-r-[#3f3f46]" : "";
              const borderBottom = (r + 1) % 3 === 0 && r < 8 ? "border-b-2 border-b-[#3f3f46]" : "";
              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleSelect(r, c)}
                  className={`aspect-square flex items-center justify-center text-lg font-bold rounded transition-all ${borderRight} ${borderBottom} ${
                    isSel ? "bg-primary-500/30 text-white" :
                    isInitial(r, c) ? "bg-[#18181b] text-slate-300" :
                    isErr ? "bg-red-500/10 text-red-400" :
                    "bg-[#09090b] text-primary-400 hover:bg-[#1c1c1f]"
                  }`}
                >
                  {cell !== 0 ? cell : ""}
                </button>
              );
            }))}
          </div>

          <div className="flex gap-2 mb-2">
            <div className="grid grid-cols-5 gap-1 flex-1">
              {[1,2,3,4,5,6,7,8,9].map((n) => (
                <button key={n} onClick={() => handleInput(n)} className="aspect-square bg-[#09090b] border border-[#27272a] rounded-lg text-white font-bold text-lg hover:border-primary-500/30 transition-colors">{n}</button>
              ))}
            </div>
            <button onClick={handleErase} className="aspect-square w-12 bg-[#09090b] border border-[#27272a] rounded-lg text-slate-400 hover:border-[#3f3f46] transition-colors flex items-center justify-center"><Eraser className="w-4 h-4" /></button>
          </div>

          <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg text-sm text-slate-400">
            点击空格选择，然后输入数字。红色表示错误。
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
