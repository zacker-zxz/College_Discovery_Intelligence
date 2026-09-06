"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { RotateCcw, Play } from "lucide-react";

const WORDS = [
  "college", "campus", "library", "science", "physics", "chemistry", "biology",
  "student", "lecture", "semester", "exam", "grade", "professor", "research",
  "engineering", "knowledge", "wisdom", "future", "career", "dream",
  "algorithm", "database", "network", "software", "hardware", "keyboard",
  "placement", "internship", "project", "thesis", "scholarship",
  "discovery", "curiosity", "focus", "discipline", "practice", "progress",
];

const buildText = (): string => {
  const picked: string[] = [];
  for (let i = 0; i < 28; i++) {
    picked.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return picked.join(" ");
};

const DURATION = 60;

export const TypingTest = () => {
  const [text, setText] = useState(buildText);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const start = useCallback(() => {
    setText(buildText());
    setTyped("");
    setTimeLeft(DURATION);
    setPhase("running");
    rootRef.current?.focus();
  }, []);

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

  // Finished typing everything
  useEffect(() => {
    if (phase === "running" && typed.length >= text.length) setPhase("done");
  }, [typed, text, phase]);

  const stats = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === text[i]) correct++;
    }
    const minutes = (DURATION - timeLeft) / 60 || 1 / 60;
    const wpm = Math.round((correct / 5) / minutes);
    const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 100;
    return { correct, wpm, accuracy };
  }, [typed, text, timeLeft]);

  const onKey = (e: React.KeyboardEvent) => {
    if (phase === "idle" && e.key.length === 1) setPhase("running");
    if (phase !== "running") return;

    if (e.key === "Backspace") {
      setTyped((t) => t.slice(0, -1));
      return;
    }
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setTyped((t) => (t.length < text.length ? t + e.key : t));
    }
  };

  const current = typed.length;

  return (
    <div ref={rootRef} className="flex flex-col items-center gap-5 outline-none" tabIndex={0} onKeyDown={onKey}>
      <div className="flex items-center justify-between w-full max-w-lg text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">WPM: {phase !== "idle" ? stats.wpm : "—"}</span>
        <span className="text-slate-500 dark:text-slate-400">Accuracy: {phase !== "idle" ? `${stats.accuracy}%` : "—"}</span>
        <span className={`font-mono ${timeLeft <= 10 ? "text-red-500" : "text-slate-500 dark:text-slate-400"}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="w-full max-w-lg p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-lg leading-relaxed font-mono select-none focus:outline-none cursor-text">
        {text.split("").map((ch, i) => {
          const state =
            i < current ? (typed[i] === ch ? "correct" : "wrong") : i === current ? "current" : "pending";
          return (
            <span
              key={i}
              className={
                state === "correct"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : state === "wrong"
                    ? "text-red-500 bg-red-100 dark:bg-red-950/60 rounded-sm"
                    : state === "current"
                      ? "text-slate-900 dark:text-slate-100 underline decoration-blue-500 decoration-2 underline-offset-4"
                      : "text-slate-400 dark:text-slate-600"
              }
            >
              {ch}
            </span>
          );
        })}
      </div>

      {phase !== "running" ? (
        <div className="flex flex-col items-center gap-2">
          {phase === "done" && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{stats.wpm} WPM</span>
              {" "}with {stats.accuracy}% accuracy
            </p>
          )}
          <button
            onClick={start}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            {phase === "done" ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {phase === "done" ? "Try Again" : "Start Typing"}
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Just type — the timer starts on your first keystroke
        </p>
      )}
    </div>
  );
};
