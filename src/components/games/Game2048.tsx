"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";

type Board = number[]; // 16 cells

const emptyBoard = (): Board => Array(16).fill(0);

const addRandomTile = (board: Board): Board => {
  const empty = board.map((v, i) => (v === 0 ? i : -1)).filter((i) => i >= 0);
  if (empty.length === 0) return board;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  const next = [...board];
  next[idx] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const rotateCW = (board: Board): Board => {
  const n = new Array(16).fill(0);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      n[c * 4 + (3 - r)] = board[r * 4 + c];
    }
  }
  return n;
};

// Slide left: merge each row
const slideLeft = (board: Board): { board: Board; gained: number } => {
  let gained = 0;
  const result: Board = [];
  for (let r = 0; r < 4; r++) {
    const row = board.slice(r * 4, r * 4 + 4).filter((v) => v !== 0);
    const merged: number[] = [];
    for (let i = 0; i < row.length; i++) {
      if (i + 1 < row.length && row[i] === row[i + 1]) {
        merged.push(row[i] * 2);
        gained += row[i] * 2;
        i++;
      } else {
        merged.push(row[i]);
      }
    }
    while (merged.length < 4) merged.push(0);
    result.push(...merged);
  }
  return { board: result, gained };
};

const rotate = (board: Board, times: number): Board => {
  let b = board;
  for (let i = 0; i < times; i++) b = rotateCW(b);
  return b;
};

const move = (board: Board, dir: "left" | "right" | "up" | "down"): { board: Board; gained: number } => {
  // Pre-rotate so all moves become left-slides:
  // CW rotation maps the original bottom row to the new left column,
  // so "down" = 1 CW; "up" = 3 CW (i.e. one CCW); "right" = 2 CW (180°).
  const pre = dir === "left" ? 0 : dir === "down" ? 1 : dir === "right" ? 2 : 3;
  const rotated = rotate(board, pre);
  const { board: slid, gained } = slideLeft(rotated);
  // Rotate back (4 - pre) % 4
  const restored = rotate(slid, (4 - pre) % 4);
  return { board: restored, gained };
};

const hasMoves = (board: Board): boolean =>
  (["left", "right", "up", "down"] as const).some((d) => move(board, d).board.some((v, i) => v !== board[i]));

const TILE_STYLES: Record<number, string> = {
  2: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  4: "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100",
  8: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
  16: "bg-amber-200 text-amber-900 dark:bg-amber-800/70 dark:text-amber-100",
  32: "bg-orange-300 text-white dark:bg-orange-700",
  64: "bg-orange-400 text-white dark:bg-orange-600",
  128: "bg-blue-300 text-white dark:bg-blue-700",
  256: "bg-blue-400 text-white dark:bg-blue-600",
  512: "bg-blue-500 text-white",
  1024: "bg-indigo-500 text-white",
  2048: "bg-emerald-500 text-white",
};

export const Game2048 = () => {
  const [board, setBoard] = useState<Board>(() => addRandomTile(addRandomTile(emptyBoard())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [winDismissed, setWinDismissed] = useState(false);
  const over = !hasMoves(board);
  const showOverlay = over || (won && !winDismissed && !hasMoves(board));
  const showWinBanner = won && !winDismissed && hasMoves(board);

  const doMove = useCallback(
    (dir: "left" | "right" | "up" | "down") => {
      const { board: next, gained } = move(board, dir);
      if (next.every((v, i) => v === board[i])) return;
      if (gained > 0) {
        const ns = score + gained;
        setScore(ns);
        setBest((b) => Math.max(b, ns));
      }
      if (next.includes(2048)) setWon(true);
      setBoard(addRandomTile(next));
    },
    [board, score]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
        a: "left",
        d: "right",
        w: "up",
        s: "down",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  const reset = () => {
    setBoard(addRandomTile(addRandomTile(emptyBoard())));
    setScore(0);
    setWon(false);
    setWinDismissed(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="text-slate-500 dark:text-slate-400">Best: {Math.max(best, score)}</span>
      </div>

        {showWinBanner && (
          <div className="flex flex-col items-center gap-2 mb-3 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl w-full">
            <p className="font-extrabold text-emerald-600 dark:text-emerald-400">2048! You win!</p>
            <button
              onClick={() => setWinDismissed(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Keep Playing
            </button>
          </div>
        )}

        <div className="relative p-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl">
          <div className="grid grid-cols-4 gap-2">
            {board.map((v, i) => (
              <div
                key={i}
                className={`w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-lg flex items-center justify-center font-extrabold transition-all ${
                  v === 0
                    ? "bg-slate-100 dark:bg-slate-900/60"
                    : `${TILE_STYLES[v] ?? "bg-purple-600 text-white"} text-lg`
              } ${v >= 1024 ? "text-sm" : ""}`}
              >
                {v || ""}
              </div>
            ))}
          </div>

          {showOverlay && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/70 backdrop-blur-sm rounded-xl">
              <p className="text-white font-extrabold text-xl">{over || !hasMoves(board) ? "Game Over" : "You win! 2048!"}</p>
              <p className="text-slate-300 text-sm">Final score: {score}</p>
              <button
                onClick={reset}
                className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Play Again
              </button>
            </div>
          )}
        </div>

      <div className="grid grid-cols-3 gap-1.5 w-40 sm:hidden">
        <div />
        <button onClick={() => doMove("up")} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-bold">↑</button>
        <div />
        <button onClick={() => doMove("left")} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-bold">←</button>
        <button onClick={() => doMove("down")} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-bold">↓</button>
        <button onClick={() => doMove("right")} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-bold">→</button>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">Arrow keys or WASD to slide</p>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      </div>
    </div>
  );
};
