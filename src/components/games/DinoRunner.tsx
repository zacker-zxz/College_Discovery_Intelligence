"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";

const W = 600;
const H = 200;
const GROUND_Y = H - 34;
const GRAVITY = 0.55;
const JUMP_V = -10.5;

type Obstacle = { x: number; w: number; h: number };

export const DinoRunner = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const stateRef = useRef({
    dinoY: GROUND_Y - 36,
    vel: 0,
    obstacles: [] as Obstacle[],
    speed: 5,
    dist: 0,
    nextSpawn: 60,
  });

  const reset = useCallback(() => {
    stateRef.current = {
      dinoY: GROUND_Y - 36,
      vel: 0,
      obstacles: [{ x: W + 40, w: 14, h: 30 }],
      speed: 5,
      dist: 0,
      nextSpawn: 60,
    };
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dinoY >= GROUND_Y - 36 - 0.1) s.vel = JUMP_V;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!running) reset();
        else jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, reset, jump]);

  useEffect(() => {
    if (!running) return;
    let raf: number;
    let frame = 0;

    const loop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const s = stateRef.current;
      frame++;

      // Physics
      s.vel += GRAVITY;
      s.dinoY += s.vel;
      if (s.dinoY > GROUND_Y - 36) {
        s.dinoY = GROUND_Y - 36;
        s.vel = 0;
      }

      // Speed ramp
      s.speed = 5 + Math.floor(s.dist / 1200) * 0.8;
      s.dist += s.speed;
      if (frame % 6 === 0) setScore(Math.floor(s.dist / 10));

      // Spawn obstacles
      s.nextSpawn -= s.speed;
      if (s.nextSpawn <= 0) {
        const h = 24 + Math.random() * 18;
        s.obstacles.push({ x: W + 20, w: 12 + Math.random() * 10, h });
        s.nextSpawn = 70 + Math.random() * 90;
      }

      // Move + collision
      const dinoBox = { x: 50, y: s.dinoY, w: 28, h: 36 };
      s.obstacles = s.obstacles.filter((o) => {
        o.x -= s.speed;
        return o.x + o.w > -10;
      });
      for (const o of s.obstacles) {
        const oy = GROUND_Y - o.h;
        if (
          dinoBox.x < o.x + o.w &&
          dinoBox.x + dinoBox.w > o.x &&
          dinoBox.y < oy + o.h &&
          dinoBox.y + dinoBox.h > oy
        ) {
          setRunning(false);
          setGameOver(true);
          setHighScore((h) => Math.max(h, Math.floor(s.dist / 10)));
          return;
        }
      }

      // Render
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 2);
      ctx.lineTo(W, GROUND_Y + 2);
      ctx.stroke();

      // Ground dashes
      ctx.fillStyle = "#e2e8f0";
      for (let i = 0; i < 8; i++) {
        const gx = (i * 90 - (s.dist % 90) + W) % (W + 90);
        ctx.fillRect(gx, GROUND_Y + 10, 24, 2);
      }

      // Dino
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.roundRect(50, s.dinoY, 28, 36, 6);
      ctx.fill();
      // Eye
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(66, s.dinoY + 6, 5, 5);
      // Leg (running bob)
      ctx.fillStyle = "#334155";
      const legUp = s.dinoY < GROUND_Y - 36 - 0.1 ? 0 : Math.sin(frame * 0.4) * 3;
      ctx.fillRect(56, s.dinoY + 34, 6, 6 + legUp);
      ctx.fillRect(66, s.dinoY + 34, 6, 6 - legUp);

      // Obstacles (cacti)
      ctx.fillStyle = "#16a34a";
      for (const o of s.obstacles) {
        const oy = GROUND_Y - o.h;
        ctx.beginPath();
        ctx.roundRect(o.x, oy, o.w, o.h, 3);
        ctx.fill();
        ctx.fillRect(o.x - 5, oy + o.h * 0.4, 5, 4);
        ctx.fillRect(o.x + o.w, oy + o.h * 0.55, 5, 4);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // Idle paint
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 2);
    ctx.lineTo(W, GROUND_Y + 2);
    ctx.stroke();
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.roundRect(50, GROUND_Y - 36, 28, 36, 6);
    ctx.fill();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-md text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="text-slate-500 dark:text-slate-400">Best: {Math.max(highScore, score)}</span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={() => (running ? jump() : reset())}
          className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-full h-auto cursor-pointer"
        />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/60 dark:bg-slate-900/70 backdrop-blur-sm rounded-xl">
            <p className="text-slate-900 dark:text-white font-bold text-lg">
              {gameOver ? "Game Over" : "Dino Runner"}
            </p>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {gameOver ? "Play Again" : "Start Game"}
            </button>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Space, ↑ or click to jump</p>
          </div>
        )}
      </div>
    </div>
  );
};
