"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw, Timer } from "lucide-react";

const GAME_SECONDS = 30;

type Target = { x: number; y: number; size: number; born: number };

export const AimTrainer = () => {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [target, setTarget] = useState<Target | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);

  const spawn = useCallback(() => {
    const size = 30 + Math.random() * 26;
    setTarget({
      x: Math.random() * (100 - (size / 460) * 100) + 1,
      y: Math.random() * 80 + 5,
      size,
      born: performance.now(),
    });
  }, []);

  const start = () => {
    setHits(0);
    setMisses(0);
    setTimes([]);
    setTimeLeft(GAME_SECONDS);
    setRunning(true);
    spawn();
  };

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      setTarget(null);
    }
  }, [running, timeLeft]);

  useEffect(() => {
    if (!running && timeLeft === 0) {
      setBestScore((b) => Math.max(b, hits));
    }
  }, [running, timeLeft, hits]);

  const hit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!running || !target) return;
    setHits((h) => h + 1);
    setTimes((t) => [...t, Math.round(performance.now() - target.born)]);
    spawn();
  };

  const miss = () => {
    if (running) setMisses((m) => m + 1);
  };

  const total = hits + misses;
  const accuracy = total ? Math.round((hits / total) * 100) : 100;
  const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-lg text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Hits: {hits}</span>
        <span className="text-slate-500 dark:text-slate-400">Accuracy: {accuracy}%</span>
        <span className="text-slate-500 dark:text-slate-400">Avg: {avgTime !== null ? `${avgTime}ms` : "—"}</span>
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Timer className="w-4 h-4" /> {timeLeft}s
        </span>
      </div>

      <div
        ref={areaRef}
        onClick={miss}
        className="relative w-full max-w-lg h-72 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-crosshair select-none"
      >
        {running && target && (
          <button
            onClick={hit}
            style={{ left: `${target.x}%`, top: `${target.y}%`, width: target.size, height: target.size }}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 border-4 border-white dark:border-slate-900 shadow-lg hover:scale-105 transition-transform"
          >
            <span className="absolute inset-2 rounded-full border-2 border-white/70 dark:border-slate-900/70" />
          </button>
        )}

        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {timeLeft === 0 ? (
              <>
                <p className="font-extrabold text-lg text-slate-900 dark:text-slate-100">
                  {hits} targets · {accuracy}% accuracy
                </p>
                {bestScore > 0 && <p className="text-xs text-slate-500 dark:text-slate-400">Best: {bestScore} hits</p>}
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Click targets as fast as you can — 30 seconds</p>
            )}
            <button
              onClick={start}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {timeLeft === 0 ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {timeLeft === 0 ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Clicks outside the target count as misses — precision matters
      </p>
    </div>
  );
};
