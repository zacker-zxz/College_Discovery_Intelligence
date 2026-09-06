"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

const GRID_SIZE = 20;
const CELL = 20;
const BOARD = GRID_SIZE * CELL;

type Point = { x: number; y: number };

const getRandomFood = (snake: Point[]): Point => {
  while (true) {
    const p = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
};

export const Snake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>(getRandomFood([{ x: 10, y: 10 }]));

  const reset = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { x: 1, y: 0 };
    foodRef.current = getRandomFood(snakeRef.current);
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const dir = dirRef.current;
    switch (e.key) {
      case "ArrowUp":
      case "w":
        if (dir.y === 0) dirRef.current = { x: 0, y: -1 };
        break;
      case "ArrowDown":
      case "s":
        if (dir.y === 0) dirRef.current = { x: 0, y: 1 };
        break;
      case "ArrowLeft":
      case "a":
        if (dir.x === 0) dirRef.current = { x: -1, y: 0 };
        break;
      case "ArrowRight":
      case "d":
        if (dir.x === 0) dirRef.current = { x: 1, y: 0 };
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const snake = snakeRef.current;
      const dir = dirRef.current;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

      // Wall or self collision
      if (
        head.x < 0 || head.y < 0 || head.x >= GRID_SIZE || head.y >= GRID_SIZE ||
        snake.some((s) => s.x === head.x && s.y === head.y)
      ) {
        setRunning(false);
        setGameOver(true);
        setHighScore((h) => Math.max(h, score));
        return;
      }

      const next = [head, ...snake];
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore((s) => s + 1);
        foodRef.current = getRandomFood(next);
      } else {
        next.pop();
      }
      snakeRef.current = next;

      // Render
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, BOARD, BOARD);

      // Grid dots
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          ctx.fillRect(i * CELL + CELL / 2 - 1, j * CELL + CELL / 2 - 1, 2, 2);
        }
      }

      // Food
      ctx.fillStyle = "#34d399";
      ctx.beginPath();
      ctx.arc(foodRef.current.x * CELL + CELL / 2, foodRef.current.y * CELL + CELL / 2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Snake
      snakeRef.current.forEach((seg, i) => {
        const t = i / Math.max(snakeRef.current.length - 1, 1);
        ctx.fillStyle = i === 0 ? "#60a5fa" : `rgba(96, 165, 250, ${1 - t * 0.6})`;
        ctx.beginPath();
        ctx.roundRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4, 5);
        ctx.fill();
      });
    }, 120);

    return () => clearInterval(interval);
  }, [running, score]);

  // Initial paint
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, BOARD, BOARD);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
          Best: {Math.max(highScore, score)}
        </span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={BOARD}
          height={BOARD}
          className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-full h-auto"
        />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 rounded-xl backdrop-blur-sm">
            <p className="text-white font-bold text-lg">{gameOver ? "Game Over" : "Neon Snake"}</p>
            {gameOver && <p className="text-slate-300 text-sm">You scored {score} points</p>}
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {gameOver ? "Play Again" : "Start Game"}
            </button>
            <p className="text-slate-400 text-xs">Use arrow keys or WASD to steer</p>
          </div>
        )}
      </div>

      {running && (
        <button
          onClick={() => setRunning(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Pause className="w-3.5 h-3.5" /> Pause
        </button>
      )}

      {/* Mobile touch controls */}
      <div className="grid grid-cols-3 gap-1.5 sm:hidden w-40">
        <div />
        <button onClick={() => dirRef.current.y === 0 && (dirRef.current = { x: 0, y: -1 })} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold">↑</button>
        <div />
        <button onClick={() => dirRef.current.x === 0 && (dirRef.current = { x: -1, y: 0 })} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold">←</button>
        <button onClick={() => dirRef.current.y === 0 && (dirRef.current = { x: 0, y: 1 })} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold">↓</button>
        <button onClick={() => dirRef.current.x === 0 && (dirRef.current = { x: 1, y: 0 })} className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-bold">→</button>
      </div>
    </div>
  );
};
