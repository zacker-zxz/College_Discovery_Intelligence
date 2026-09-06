"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Timer } from "lucide-react";

const HOLES = 9;
const GAME_SECONDS = 30;

export const WhackAMole = () => {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [moleAt, setMoleAt] = useState<number | null>(null);
  const [bonked, setBonked] = useState<number | null>(null);
  const scoreRef = useRef(0);

  // Countdown
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  // End of game
  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      setMoleAt(null);
      setBest((b) => Math.max(b, scoreRef.current));
    }
  }, [running, timeLeft]);

  // Mole popping loop: wait -> show -> hide -> repeat. Difficulty ramps with rounds.
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    let rounds = 0;

    const loop = () => {
      if (cancelled) return;
      rounds++;
      const urgency = Math.min(0.55, rounds * 0.02); // ramps up over ~28 rounds
      const gap = 180 + Math.random() * 380 * (1 - urgency);
      const showTime = 850 + Math.random() * 450 * (1 - urgency);

      showTimer = setTimeout(() => {
        if (cancelled) return;
        setMoleAt((prev) => {
          let next = Math.floor(Math.random() * HOLES);
          if (next === prev) next = (next + 1 + Math.floor(Math.random() * (HOLES - 1))) % HOLES;
          return next;
        });
        hideTimer = setTimeout(() => {
          if (!cancelled) setMoleAt(null);
          loop();
        }, showTime);
      }, gap);
    };

    loop();
    return () => {
      cancelled = true;
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [running]);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setMoleAt(null);
    setRunning(true);
  };

  const whack = (i: number) => {
    if (!running || i !== moleAt) return;
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setMoleAt(null);
    setBonked(i);
    setTimeout(() => setBonked(null), 200);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-sm text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Timer className="w-4 h-4" /> {timeLeft}s
        </span>
        <span className="text-slate-500 dark:text-slate-400">Best: {best}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: HOLES }, (_, i) => {
          const isMole = moleAt === i;
          const isBonked = bonked === i;
          return (
            <button
              key={i}
              onClick={() => whack(i)}
              disabled={!running}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-end justify-center overflow-hidden transition-all select-none ${
                isBonked
                  ? "bg-amber-300 dark:bg-amber-600 scale-95"
                  : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
              } border-4 border-slate-300 dark:border-slate-700`}
            >
              <span
                className={`text-4xl mb-1 transition-transform duration-150 ${
                  isMole ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                } ${isBonked ? "rotate-12" : ""}`}
              >
                🐹
              </span>
            </button>
          );
        })}
      </div>

      {!running ? (
        <div className="flex flex-col items-center gap-2">
          {timeLeft === 0 ? (
            <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
              Time! You whacked {score} moles
            </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Click moles as they pop up — 30 seconds</p>
          )}
          <button
            onClick={start}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {timeLeft === 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {timeLeft === 0 ? "Play Again" : "Start Game"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">It speeds up — stay sharp!</p>
      )}
    </div>
  );
};
