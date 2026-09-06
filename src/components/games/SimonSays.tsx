"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";

type PadId = 0 | 1 | 2 | 3;

const PADS = [
  { on: "bg-emerald-400", off: "bg-emerald-700 hover:bg-emerald-600" },
  { on: "bg-red-400", off: "bg-red-700 hover:bg-red-600" },
  { on: "bg-yellow-300", off: "bg-yellow-600 hover:bg-yellow-500" },
  { on: "bg-blue-400", off: "bg-blue-700 hover:bg-blue-600" },
];

export const SimonSays = () => {
  const [sequence, setSequence] = useState<PadId[]>([]);
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "over">("idle");
  const [activePad, setActivePad] = useState<PadId | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [best, setBest] = useState(0);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAll = () => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  };

  useEffect(() => () => clearAll(), []);

  const showSequence = useCallback((seq: PadId[]) => {
    setPhase("showing");
    clearAll();
    seq.forEach((pad, i) => {
      timeouts.current.push(
        setTimeout(() => setActivePad(pad), 600 + i * 650)
      );
      timeouts.current.push(
        setTimeout(() => setActivePad(null), 600 + i * 650 + 380)
      );
    });
    timeouts.current.push(
      setTimeout(() => {
        setPhase("input");
        setInputIndex(0);
      }, 600 + seq.length * 650)
    );
  }, []);

  const addStep = useCallback((seq: PadId[]) => {
    const next = [...seq, Math.floor(Math.random() * 4) as PadId];
    setSequence(next);
    showSequence(next);
  }, [showSequence]);

  const start = () => {
    setSequence([]);
    addStep([]);
  };

  const press = (pad: PadId) => {
    if (phase !== "input") return;
    setActivePad(pad);
    setTimeout(() => setActivePad(null), 180);

    if (sequence[inputIndex] === pad) {
      if (inputIndex + 1 === sequence.length) {
        // Round complete
        const newBest = Math.max(best, sequence.length);
        setBest(newBest);
        setTimeout(() => addStep(sequence), 600);
      } else {
        setInputIndex((i) => i + 1);
      }
    } else {
      setPhase("over");
      setBest((b) => Math.max(b, sequence.length - 1));
    }
  };

  const level = phase === "idle" ? 0 : sequence.length;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-xs text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Level: {level}</span>
        <span className="text-slate-500 dark:text-slate-400">Best: {best}</span>
      </div>

      <div className="relative grid grid-cols-2 gap-3 p-4 bg-slate-800 dark:bg-slate-900 rounded-3xl">
        {PADS.map((pad, i) => (
          <button
            key={i}
            onClick={() => press(i as PadId)}
            disabled={phase !== "input"}
            className={`w-24 h-24 md:w-28 md:h-28 rounded-2xl transition-all duration-100 ${
              activePad === i ? `${pad.on} scale-105 shadow-lg` : pad.off
            } ${phase === "input" ? "cursor-pointer" : "cursor-default"}`}
            aria-label={`Pad ${i + 1}`}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-slate-800 dark:bg-slate-950 border-4 border-slate-700 flex items-center justify-center text-xs font-extrabold text-slate-200">
            {phase === "showing" ? "Watch" : phase === "input" ? "Go!" : phase === "over" ? "✕" : "▶"}
          </div>
        </div>
      </div>

      {phase === "idle" && (
        <button
          onClick={start}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Play className="w-4 h-4" /> Start Game
        </button>
      )}

      {phase === "over" && (
        <div className="flex flex-col items-center gap-2">
          <p className="font-extrabold text-lg text-red-500 dark:text-red-400">
            Wrong pad! You reached level {sequence.length - 1}
          </p>
          <button
            onClick={start}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}

      {phase === "showing" && <p className="text-xs text-slate-500 dark:text-slate-400">Memorize the sequence...</p>}
      {phase === "input" && <p className="text-xs text-slate-500 dark:text-slate-400">Repeat the sequence ({inputIndex}/{sequence.length})</p>}
    </div>
  );
};
