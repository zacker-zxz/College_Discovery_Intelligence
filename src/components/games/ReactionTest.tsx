"use client";

import React, { useState, useRef, useEffect } from "react";
import { Zap, RotateCcw } from "lucide-react";

type Phase = "idle" | "waiting" | "ready" | "result" | "tooSoon";

const getRandomDelay = () => 1200 + Math.random() * 2500;

export const ReactionTest = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const start = () => {
    setPhase("waiting");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase("ready");
    }, getRandomDelay());
  };

  const handleClick = () => {
    if (phase === "idle" || phase === "result" || phase === "tooSoon") {
      start();
    } else if (phase === "waiting") {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPhase("tooSoon");
    } else if (phase === "ready") {
      const ms = Math.round(performance.now() - startTimeRef.current);
      setReactionMs(ms);
      setAttempts((a) => [...a, ms].slice(-5));
      setBestMs((b) => (b === null ? ms : Math.min(b, ms)));
      setPhase("result");
    }
  };

  const average = attempts.length
    ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : null;

  const getRating = (ms: number) => {
    if (ms < 200) return { label: "Inhuman reflexes", color: "text-emerald-600 dark:text-emerald-400" };
    if (ms < 280) return { label: "Very fast — esports material", color: "text-emerald-600 dark:text-emerald-400" };
    if (ms < 380) return { label: "Solid average human", color: "text-blue-600 dark:text-blue-400" };
    if (ms < 500) return { label: "A bit sleepy — hydrated today?", color: "text-amber-600 dark:text-amber-400" };
    return { label: "Were you tabbed out?", color: "text-red-500 dark:text-red-400" };
  };

  const bg =
    phase === "ready"
      ? "bg-emerald-500 hover:bg-emerald-500"
      : phase === "waiting"
        ? "bg-slate-800 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-700"
        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700";

  const label =
    phase === "idle"
      ? "Click to start"
      : phase === "waiting"
        ? "Wait for green..."
        : phase === "ready"
          ? "CLICK NOW!"
          : phase === "tooSoon"
            ? "Too soon! Click to retry"
            : `${reactionMs} ms — click to retry`;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-md text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Best: {bestMs !== null ? `${bestMs} ms` : "—"}</span>
        <span className="text-slate-500 dark:text-slate-400">Avg (last 5): {average !== null ? `${average} ms` : "—"}</span>
      </div>

      <button
        onClick={handleClick}
        className={`w-full max-w-md h-52 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors select-none ${bg}`}
      >
        <Zap className={`w-8 h-8 ${phase === "ready" ? "text-white" : "text-slate-400"}`} />
        <span
          className={`font-extrabold text-xl ${
            phase === "ready" ? "text-white" : phase === "waiting" ? "text-slate-300" : "text-slate-700 dark:text-slate-200"
          }`}
        >
          {label}
        </span>
        {phase === "result" && reactionMs !== null && (
          <span className={`text-sm font-semibold ${getRating(reactionMs).color}`}>
            {getRating(reactionMs).label}
          </span>
        )}
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {attempts.map((ms, i) => (
          <span
            key={i}
            className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300"
          >
            {ms} ms
          </span>
        ))}
      </div>

      {attempts.length > 0 && (
        <button
          onClick={() => {
            setAttempts([]);
            setBestMs(null);
            setReactionMs(null);
            setPhase("idle");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Stats
        </button>
      )}
    </div>
  );
};
