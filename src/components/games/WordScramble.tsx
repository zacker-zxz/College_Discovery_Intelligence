"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Play, RotateCcw, SkipForward, Timer } from "lucide-react";

const WORDS: { word: string; hint: string }[] = [
  { word: "CAMPUS", hint: "Place of learning" },
  { word: "SCIENCE", hint: "Subject with labs" },
  { word: "LECTURE", hint: "Class session" },
  { word: "PROJECT", hint: "Semester deliverable" },
  { word: "CIRCUIT", hint: "Electronics basics" },
  { word: "CALCULUS", hint: "Math branch" },
  { word: "DESIGN", hint: "Creative planning" },
  { word: "NETWORK", hint: "Connected systems" },
  { word: "PHYSICS", hint: "Forces and energy" },
  { word: "CODING", hint: "Writing software" },
  { word: "DEGREE", hint: "Graduation prize" },
  { word: "MENTOR", hint: "Guide and teacher" },
  { word: "QUIZ", hint: "Quick test" },
  { word: "THEORY", hint: "Not practice" },
  { word: "MEMORY", hint: "What you recall with" },
];

const GAME_SECONDS = 90;

const scramble = (word: string): string => {
  const letters = word.split("");
  let out = letters.join("");
  while (out === word) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    out = letters.join("");
  }
  return out;
};

export const WordScramble = () => {
  const [target, setTarget] = useState(WORDS[0]);
  const [scrambled, setScrambled] = useState(() => scramble(WORDS[0].word));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [feedback, setFeedback] = useState<"none" | "good" | "bad">("none");

  const nextWord = useCallback(() => {
    const t = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTarget(t);
    setScrambled(scramble(t.word));
    setInput("");
  }, []);

  const start = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_SECONDS);
    setPhase("running");
    setFeedback("none");
    nextWord();
  };

  useEffect(() => {
    if (phase !== "running") return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "running" && timeLeft === 0) {
      setPhase("done");
    }
  }, [phase, timeLeft]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phase !== "running") return;
    if (input.trim().toUpperCase() === target.word) {
      const points = 10 + streak * 2;
      setScore((s) => s + points);
      setStreak((s) => s + 1);
      setFeedback("good");
      setTimeout(() => setFeedback("none"), 400);
      nextWord();
    } else {
      setStreak(0);
      setFeedback("bad");
      setTimeout(() => setFeedback("none"), 400);
    }
  };

  const skip = () => {
    if (phase !== "running") return;
    setStreak(0);
    nextWord();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-md text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="text-orange-500 dark:text-orange-400">Streak: {streak}</span>
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Timer className="w-4 h-4" /> {timeLeft}s
        </span>
      </div>

      {phase !== "running" ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
            {phase === "done" ? `Time! Final score: ${score}` : "Word Scramble"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center">
            Unscramble as many words as you can in {GAME_SECONDS} seconds. Streaks give bonus points!
          </p>
          <button
            onClick={start}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {phase === "done" ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {phase === "done" ? "Play Again" : "Start Game"}
          </button>
        </div>
      ) : (
        <>
          <div
            className={`flex gap-2 p-4 rounded-xl transition-colors ${
              feedback === "good"
                ? "bg-emerald-50 dark:bg-emerald-950/50"
                : feedback === "bad"
                  ? "bg-red-50 dark:bg-red-950/50"
                  : "bg-slate-100 dark:bg-slate-800/60"
            }`}
          >
            {scrambled.split("").map((ch, i) => (
              <span
                key={i}
                className="w-9 h-11 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-extrabold text-xl text-slate-900 dark:text-slate-100"
              >
                {ch}
              </span>
            ))}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">Hint: {target.hint}</p>

          <form onSubmit={submit} className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              placeholder="Your answer..."
              autoFocus
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 px-4 py-2.5 rounded-xl text-sm font-semibold tracking-widest focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all w-56 text-center"
            />
            <button
              type="button"
              onClick={skip}
              className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <SkipForward className="w-4 h-4" /> Skip
            </button>
          </form>
          <p className="text-xs text-slate-500 dark:text-slate-400">Press Enter to submit</p>
        </>
      )}
    </div>
  );
};
