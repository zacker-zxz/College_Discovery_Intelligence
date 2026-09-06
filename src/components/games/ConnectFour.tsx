"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Bot, User } from "lucide-react";

const COLS = 7;
const ROWS = 6;
type Player = 1 | 2;
type Board = (Player | null)[];

const emptyBoard = (): Board => Array(COLS * ROWS).fill(null);

const dropRow = (board: Board, col: number): number => {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row * COLS + col] === null) return row;
  }
  return -1;
};

const findWin = (board: Board): { player: Player; cells: number[] } | null => {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const start = board[r * COLS + c];
      if (!start) continue;
      for (const [dr, dc] of dirs) {
        const cells = [r * COLS + c];
        let rr = r + dr;
        let cc = c + dc;
        while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr * COLS + cc] === start) {
          cells.push(rr * COLS + cc);
          if (cells.length === 4) return { player: start, cells };
          rr += dr;
          cc += dc;
        }
      }
    }
  }
  return null;
};

const wouldWin = (board: Board, col: number, player: Player): boolean => {
  const row = dropRow(board, col);
  if (row < 0) return false;
  const next = [...board];
  next[row * COLS + col] = player;
  return findWin(next)?.player === player;
};

const aiMove = (board: Board): number => {
  const valid = Array.from({ length: COLS }, (_, c) => c).filter((c) => dropRow(board, c) >= 0);
  if (valid.length === 0) return -1;

  // 1. Win if possible
  for (const c of valid) if (wouldWin(board, c, 2)) return c;
  // 2. Block player win
  for (const c of valid) if (wouldWin(board, c, 1)) return c;
  // 3. Prefer center columns
  const preferred = [3, 2, 4, 1, 5, 0, 6].filter((c) => valid.includes(c));
  // Avoid setting up an immediate player win above
  const safe = preferred.filter((c) => {
    const row = dropRow(board, c);
    const next = [...board];
    next[row * COLS + c] = 2;
    return !wouldWin(next, c, 1);
  });
  const pool = safe.length ? safe : preferred;
  // Mostly pick best-centered, with some randomness so games differ
  return Math.random() < 0.75 ? pool[0] : pool[Math.floor(Math.random() * pool.length)];
};

export const ConnectFour = () => {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [turn, setTurn] = useState<Player>(1);
  const [scores, setScores] = useState({ you: 0, ai: 0, draw: 0 });
  const [locked, setLocked] = useState(false);

  const win = findWin(board);
  const full = board.every(Boolean);
  const finished = Boolean(win) || full;

  // AI turn
  useEffect(() => {
    if (turn !== 2 || finished) return;
    setLocked(true);
    const timeout = setTimeout(() => {
      const col = aiMove(board);
      if (col >= 0) {
        setBoard((prev) => {
          const row = dropRow(prev, col);
          if (row < 0) return prev;
          const next = [...prev];
          next[row * COLS + col] = 2;
          return next;
        });
      }
      setTurn(1);
      setLocked(false);
    }, 450);
    return () => clearTimeout(timeout);
  }, [turn, finished, board]);

  // Score on finish
  useEffect(() => {
    if (!finished) return;
    setScores((s) => {
      if (win?.player === 1) return { ...s, you: s.you + 1 };
      if (win?.player === 2) return { ...s, ai: s.ai + 1 };
      return { ...s, draw: s.draw + 1 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const play = useCallback(
    (col: number) => {
      if (finished || locked || turn !== 1) return;
      const row = dropRow(board, col);
      if (row < 0) return;
      setBoard((prev) => {
        const next = [...prev];
        next[row * COLS + col] = 1;
        return next;
      });
      setTurn(2);
    },
    [board, finished, locked, turn]
  );

  const reset = () => {
    setBoard(emptyBoard());
    setTurn(1);
    setLocked(false);
  };

  const status = win
    ? win.player === 1
      ? "You win! Four in a row!"
      : "AI wins this round."
    : full
      ? "It's a draw!"
      : turn === 1
        ? "Your turn (red)"
        : "AI is thinking...";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center gap-6 text-sm font-semibold">
        <span className="flex items-center gap-1.5 text-red-500"><User className="w-4 h-4" /> You: {scores.you}</span>
        <span className="text-slate-400">Draw: {scores.draw}</span>
        <span className="flex items-center gap-1.5 text-yellow-500 dark:text-yellow-400"><Bot className="w-4 h-4" /> AI: {scores.ai}</span>
      </div>

      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 min-h-5">{status}</p>

      {/* Column hover targets */}
      <div className="p-2.5 bg-blue-600 dark:bg-blue-800 rounded-xl">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const col = i % COLS;
            const cell = board[i];
            const isWinning = win?.cells.includes(i);
            return (
              <button
                key={i}
                onClick={() => play(col)}
                disabled={finished || locked || turn !== 1}
                className={`w-10 h-10 md:w-11 md:h-11 rounded-full transition-all ${
                  cell === 1
                    ? isWinning
                      ? "bg-red-400 ring-2 ring-white"
                      : "bg-red-500"
                    : cell === 2
                      ? isWinning
                        ? "bg-yellow-300 ring-2 ring-white"
                        : "bg-yellow-400"
                      : "bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-700"
                } ${!cell && !finished && turn === 1 && !locked ? "cursor-pointer" : "cursor-default"}`}
                aria-label={`Column ${col + 1}`}
              />
            );
          })}
        </div>
      </div>

      {finished && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">Click a column to drop your disc — connect 4 to win</p>
    </div>
  );
};
