"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw } from "lucide-react";

const WORDS: { word: string; hint: string }[] = [
  { word: "ENGINEERING", hint: "A field of study" },
  { word: "LIBRARY", hint: "Where books live" },
  { word: "CAMPUS", hint: "Place of learning" },
  { word: "LECTURE", hint: "Professor talks here" },
  { word: "EXAMINATION", hint: "Student's nightmare" },
  { word: "SCHOLARSHIP", hint: "Money for studies" },
  { word: "GRADUATION", hint: "The final ceremony" },
  { word: "LABORATORY", hint: "Where experiments happen" },
  { word: "SEMESTER", hint: "Half a school year" },
  { word: "INTERNSHIP", hint: "Work experience for students" },
  { word: "PLACEMENT", hint: "College-to-job pipeline" },
  { word: "RESEARCH", hint: "Discovering new knowledge" },
  { word: "ALGORITHM", hint: "Step-by-step problem solver" },
  { word: "DATABASE", hint: "Structured data storage" },
  { word: "KEYBOARD", hint: "You're using it now" },
];

const MAX_WRONG = 6;
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Hangman SVG part visibility by wrong count
const HangmanFigure = ({ wrong }: { wrong: number }) => (
  <svg viewBox="0 0 120 140" className="w-28 h-32">
    {/* Gallows (always visible) */}
    <line x1="10" y1="130" x2="90" y2="130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="35" y1="130" x2="35" y2="15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="35" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <line x1="80" y1="15" x2="80" y2="30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    {wrong > 0 && <circle cx="80" cy="45" r="15" fill="none" stroke="currentColor" strokeWidth="4" />}
    {wrong > 1 && <line x1="80" y1="60" x2="80" y2="95" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
    {wrong > 2 && <line x1="80" y1="70" x2="62" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
    {wrong > 3 && <line x1="80" y1="70" x2="98" y2="85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
    {wrong > 4 && <line x1="80" y1="95" x2="63" y2="118" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
    {wrong > 5 && <line x1="80" y1="95" x2="97" y2="118" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />}
  </svg>
);

export const Hangman = () => {
  const [target, setTarget] = useState(WORDS[0]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  const wrong = [...guessed].filter((l) => !target.word.includes(l)).length;
  const won = target.word.split("").every((c) => guessed.has(c));
  const lost = wrong >= MAX_WRONG;
  const finished = won || lost;

  const newRound = useCallback(() => {
    setTarget(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessed(new Set());
  }, []);

  const guess = useCallback(
    (letter: string) => {
      if (finished || guessed.has(letter)) return;
      setGuessed((prev) => new Set(prev).add(letter));
    },
    [finished, guessed]
  );

  // Streak tracking on finish
  useEffect(() => {
    if (!finished) return;
    if (won) setStreak((s) => s + 1);
    else setStreak(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Physical keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const letter = e.key.toUpperCase();
      if (letter.length === 1 && LETTERS.includes(letter)) guess(letter);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guess]);

  const resetAll = () => {
    setStreak(0);
    newRound();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-md text-sm font-semibold">
        <span className="text-slate-500 dark:text-slate-400">Hint: {target.hint}</span>
        <span className="text-emerald-600 dark:text-emerald-400">Streak: {streak}</span>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-slate-700 dark:text-slate-300">
          <HangmanFigure wrong={wrong} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
            {target.word.split("").map((ch, i) => (
              <span
                key={i}
                className={`w-7 h-9 border-b-2 flex items-center justify-center font-extrabold text-lg ${
                  guessed.has(ch) || lost
                    ? guessed.has(ch)
                      ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-red-400 text-red-500"
                    : "border-slate-300 dark:border-slate-600 text-transparent"
                }`}
              >
                {(guessed.has(ch) || lost) ? ch : "•"}
              </span>
            ))}
          </div>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            {MAX_WRONG - wrong} wrong guesses left
          </p>
        </div>
      </div>

      {finished ? (
        <div className="flex flex-col items-center gap-2">
          <p className={`font-extrabold text-lg ${won ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
            {won ? "You got it!" : `The word was ${target.word}`}
          </p>
          <button
            onClick={newRound}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Next Word
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-9 gap-1.5 max-w-md">
          {LETTERS.map((letter) => {
            const used = guessed.has(letter);
            const inWord = target.word.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => guess(letter)}
                disabled={used}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  used
                    ? inWord
                      ? "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-950/60 text-red-500 line-through"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">Type or click letters to guess</p>
        <button
          onClick={resetAll}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset streak
        </button>
      </div>
    </div>
  );
};
