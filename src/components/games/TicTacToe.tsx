"use client";

import React, { useState, useEffect } from "react";
import { RotateCcw, Bot, User } from "lucide-react";

type Cell = "X" | "O" | null;

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const getWinner = (board: Cell[]): { player: Cell; line: number[] } | null => {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  return null;
};

const minimax = (board: Cell[], isAI: boolean, depth: number): number => {
  const winner = getWinner(board);
  if (winner?.player === "O") return 10 - depth;
  if (winner?.player === "X") return depth - 10;
  if (board.every(Boolean)) return 0;

  if (isAI) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = "O";
      best = Math.max(best, minimax(board, false, depth + 1));
      board[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = "X";
      best = Math.min(best, minimax(board, true, depth + 1));
      board[i] = null;
    }
    return best;
  }
};

const getBestMove = (board: Cell[]): number => {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = "O";
    const score = minimax(board, false, 0);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
};

export const TicTacToe = () => {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [xTurn, setXTurn] = useState(true);
  const [scores, setScores] = useState({ you: 0, ai: 0, draw: 0 });
  const [locked, setLocked] = useState(false);

  const winner = getWinner(board);
  const isDraw = !winner && board.every(Boolean);
  const finished = Boolean(winner) || isDraw;

  // AI move
  useEffect(() => {
    if (xTurn || finished) return;
    setLocked(true);
    const timeout = setTimeout(() => {
      const move = getBestMove([...board]);
      if (move >= 0) {
        setBoard((prev) => {
          const next = [...prev];
          next[move] = "O";
          return next;
        });
      }
      setXTurn(true);
      setLocked(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [xTurn, finished, board]);

  // Update score once on finish
  useEffect(() => {
    if (!finished) return;
    setScores((s) => {
      if (winner?.player === "X") return { ...s, you: s.you + 1 };
      if (winner?.player === "O") return { ...s, ai: s.ai + 1 };
      return { ...s, draw: s.draw + 1 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const play = (i: number) => {
    if (board[i] || finished || locked || !xTurn) return;
    setBoard((prev) => {
      const next = [...prev];
      next[i] = "X";
      return next;
    });
    setXTurn(false);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXTurn(true);
    setLocked(false);
  };

  const status = winner
    ? winner.player === "X"
      ? "You win! Impossible... but well played."
      : "AI wins. Minimax is undefeated."
    : isDraw
      ? "Draw! The AI is satisfied."
      : xTurn
        ? "Your turn (X)"
        : "AI is thinking...";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-6 text-sm font-semibold">
        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400"><User className="w-4 h-4" /> You: {scores.you}</span>
        <span className="text-slate-400">Draw: {scores.draw}</span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200"><Bot className="w-4 h-4" /> AI: {scores.ai}</span>
      </div>

      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 min-h-5">{status}</p>

      <div className="grid grid-cols-3 gap-2.5">
        {board.map((cell, i) => {
          const isWinning = winner?.line.includes(i);
          return (
            <button
              key={i}
              onClick={() => play(i)}
              disabled={Boolean(cell) || finished || locked}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-xl text-3xl font-extrabold flex items-center justify-center transition-all select-none ${
                isWinning
                  ? "bg-emerald-50 border-2 border-emerald-400 dark:bg-emerald-950/60 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400"
                  : cell
                    ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-400"
              }`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      {finished && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      )}
    </div>
  );
};
