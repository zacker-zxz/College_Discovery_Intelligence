"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RotateCcw, Zap, Trophy } from "lucide-react";

type Card = { id: number; symbol: string; flipped: boolean; matched: boolean };

const SYMBOLS = ["🎓", "🔬", "📚", "🧪", "🎯", "🚀", "💡", "🏆"];

const createDeck = (): Card[] => {
  const deck = [...SYMBOLS, ...SYMBOLS]
    .map((symbol, i) => ({ id: i, symbol, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
};

export const MemoryMatch = () => {
  const [deck, setDeck] = useState<Card[]>(createDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(null);

  const matchedCount = useMemo(() => deck.filter((c) => c.matched).length, [deck]);

  useEffect(() => {
    if (matchedCount === deck.length && deck.length > 0) {
      setWon(true);
      setBestMoves((b) => (b === null ? moves : Math.min(b, moves)));
    }
  }, [matchedCount, deck.length, moves]);

  useEffect(() => {
    if (selected.length !== 2) return;
    const [first, second] = selected;
    const timeout = setTimeout(() => {
      setDeck((prev) => {
        const isMatch = prev[first].symbol === prev[second].symbol;
        return prev.map((card, i) =>
          i === first || i === second
            ? { ...card, matched: isMatch, flipped: isMatch }
            : card
        );
      });
      setSelected([]);
    }, 700);
    return () => clearTimeout(timeout);
  }, [selected]);

  const handleFlip = (index: number) => {
    if (selected.length === 2 || deck[index].flipped || deck[index].matched) return;

    setDeck((prev) => prev.map((c, i) => (i === index ? { ...c, flipped: true } : c)));
    setSelected((prev) => {
      const next = [...prev, index];
      if (next.length === 2) setMoves((m) => m + 1);
      return next;
    });
  };

  const reset = () => {
    setDeck(createDeck());
    setSelected([]);
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-md text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Moves: {moves}</span>
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" /> Best: {bestMoves ?? "—"}
        </span>
        <span className="text-emerald-600 dark:text-emerald-400">{matchedCount / 2}/{SYMBOLS.length} pairs</span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 max-w-md w-full">
        {deck.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleFlip(i)}
            disabled={card.flipped || card.matched}
            className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-300 font-bold select-none ${
              card.matched
                ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900 scale-95 opacity-80"
                : card.flipped
                  ? "bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 shadow-sm"
                  : "bg-slate-900 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-900 dark:border-slate-700 text-transparent"
            }`}
          >
            {card.flipped || card.matched ? card.symbol : "?"}
          </button>
        ))}
      </div>

      {won && (
        <div className="flex flex-col items-center gap-2 p-5 bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-900 rounded-xl w-full max-w-md">
          <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-lg">Cleared in {moves} moves!</p>
          {bestMoves === moves && <p className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> New personal best</p>}
          <button
            onClick={reset}
            className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}

      {!won && moves > 0 && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart
        </button>
      )}
    </div>
  );
};
