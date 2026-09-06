"use client";

import React, { useState, useCallback } from "react";
import { RotateCcw, Lightbulb } from "lucide-react";

const SIZE = 5;
const SHUFFLE_MOVES = 8;

type Grid = boolean[]; // true = light on

const toggleAt = (grid: Grid, index: number): Grid => {
  const next = [...grid];
  const r = Math.floor(index / SIZE);
  const c = index % SIZE;
  const flips: [number, number][] = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
  for (const [nr, nc] of flips) {
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
      const i = nr * SIZE + nc;
      next[i] = !next[i];
    }
  }
  return next;
};

// Generate a solvable puzzle: start from solved (all off), apply random toggles
const generatePuzzle = (): Grid => {
  let grid: Grid = Array(SIZE * SIZE).fill(false);
  for (let i = 0; i < SHUFFLE_MOVES; i++) {
    grid = toggleAt(grid, Math.floor(Math.random() * SIZE * SIZE));
  }
  return grid;
};

export const LightsOut = () => {
  const [grid, setGrid] = useState<Grid>(generatePuzzle);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  const lightsOn = grid.filter(Boolean).length;

  const press = (index: number) => {
    if (solved) return;
    const next = toggleAt(grid, index);
    setGrid(next);
    setMoves((m) => m + 1);
    if (next.every((on) => !on)) setSolved(true);
  };

  const reset = useCallback(() => {
    setGrid(generatePuzzle());
    setMoves(0);
    setSolved(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-xs text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Moves: {moves}</span>
        <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4" /> {lightsOn} on
        </span>
      </div>

      <div className="grid gap-2 p-3 bg-slate-200 dark:bg-slate-800 rounded-2xl" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {grid.map((on, i) => (
          <button
            key={i}
            onClick={() => press(i)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl transition-all duration-200 select-none active:scale-90 ${
              on
                ? "bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.5)] hover:bg-amber-300"
                : "bg-slate-400/40 dark:bg-slate-900/70 hover:bg-slate-400/60 dark:hover:bg-slate-800"
            }`}
            aria-label={`Light ${i + 1} ${on ? "on" : "off"}`}
          />
        ))}
      </div>

      {solved ? (
        <div className="flex flex-col items-center gap-2">
          <p className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400">
            All lights out in {moves} moves!
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> New Puzzle
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs text-center">
            Clicking a light toggles it and its 4 neighbors. Turn every light off.
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> New Puzzle
          </button>
        </div>
      )}
    </div>
  );
};
