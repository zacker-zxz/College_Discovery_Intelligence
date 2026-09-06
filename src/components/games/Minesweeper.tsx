"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Flag, Bomb, Timer } from "lucide-react";

const SIZE = 9;
const MINES = 10;

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };

const emptyCells = (): Cell[] =>
  Array.from({ length: SIZE * SIZE }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }));

const neighbors = (i: number): number[] => {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(nr * SIZE + nc);
    }
  }
  return out;
};

const plantMines = (cells: Cell[], safeIndex: number): Cell[] => {
  const next = cells.map((c) => ({ ...c }));
  const forbidden = new Set([safeIndex, ...neighbors(safeIndex)]);
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * SIZE * SIZE);
    if (forbidden.has(i) || next[i].mine) continue;
    next[i].mine = true;
    placed++;
  }
  for (let i = 0; i < next.length; i++) {
    next[i].count = neighbors(i).filter((n) => next[n].mine).length;
  }
  return next;
};

const NUM_COLORS = [
  "",
  "text-blue-600 dark:text-blue-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-red-500 dark:text-red-400",
  "text-indigo-700 dark:text-indigo-400",
  "text-amber-600 dark:text-amber-400",
  "text-teal-600 dark:text-teal-400",
  "text-slate-700 dark:text-slate-300",
  "text-slate-500 dark:text-slate-400",
];

export const Minesweeper = () => {
  const [cells, setCells] = useState<Cell[]>(emptyCells);
  const [started, setStarted] = useState(false);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);

  const flagsUsed = cells.filter((c) => c.flagged).length;
  const finished = dead || won;

  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, finished]);

  const floodReveal = (list: Cell[], index: number): Cell[] => {
    const next = list.map((c) => ({ ...c }));
    const stack = [index];
    while (stack.length) {
      const i = stack.pop()!;
      const cell = next[i];
      if (cell.revealed || cell.flagged) continue;
      cell.revealed = true;
      if (cell.count === 0 && !cell.mine) {
        for (const n of neighbors(i)) {
          if (!next[n].revealed && !next[n].flagged) stack.push(n);
        }
      }
    }
    return next;
  };

  const handleClick = (i: number) => {
    if (finished || cells[i].flagged || cells[i].revealed) return;

    let board = cells;
    if (!started) {
      board = plantMines(cells, i);
      setStarted(true);
    }

    if (board[i].mine) {
      const dead1 = board.map((c) => ({ ...c, revealed: c.revealed || c.mine }));
      setCells(dead1);
      setDead(true);
      return;
    }

    const revealed = floodReveal(board, i);
    setCells(revealed);
    if (revealed.filter((c) => c.revealed).length === SIZE * SIZE - MINES) {
      setWon(true);
    }
  };

  const handleRightClick = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    if (finished || cells[i].revealed) return;
    setCells((prev) => prev.map((c, j) => (j === i ? { ...c, flagged: !c.flagged } : c)));
  };

  const reset = useCallback(() => {
    setCells(emptyCells());
    setStarted(false);
    setDead(false);
    setWon(false);
    setTime(0);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-sm font-semibold">
        <span className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
          <Flag className="w-4 h-4 text-red-500" /> {MINES - flagsUsed}
        </span>
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Timer className="w-4 h-4" /> {time}s
        </span>
      </div>

      <div
        className="grid gap-1 p-2 bg-slate-200 dark:bg-slate-800 rounded-xl"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {cells.map((cell, i) => {
          const revealedMine = cell.revealed && cell.mine;
          return (
            <button
              key={i}
              onClick={() => handleClick(i)}
              onContextMenu={(e) => handleRightClick(e, i)}
              disabled={finished}
              className={`w-8 h-8 rounded-md text-sm font-extrabold flex items-center justify-center transition-colors select-none ${
                cell.revealed
                  ? revealedMine
                    ? "bg-red-100 dark:bg-red-950/70"
                    : "bg-slate-100 dark:bg-slate-900/70"
                  : "bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-95"
              } ${!cell.revealed || revealedMine ? "" : NUM_COLORS[cell.count]}`}
            >
              {cell.revealed
                ? cell.mine
                  ? <Bomb className="w-4 h-4 text-red-600 dark:text-red-400" />
                  : cell.count > 0
                    ? cell.count
                    : ""
                : cell.flagged
                  ? <Flag className="w-3.5 h-3.5 text-red-500" />
                  : ""}
            </button>
          );
        })}
      </div>

      {finished && (
        <div className="flex flex-col items-center gap-2">
          <p className={`font-extrabold text-lg ${won ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
            {won ? `Cleared in ${time}s!` : "Boom! You hit a mine."}
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">Left click reveal · Right click flag · 9×9, 10 mines</p>
    </div>
  );
};
