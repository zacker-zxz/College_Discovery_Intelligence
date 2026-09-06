"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";

const W = 400;
const H = 480;
const GRAVITY = 0.45;
const FLAP = -7.5;
const PIPE_W = 56;
const GAP = 150;
const PIPE_SPACING = 210;

type Pipe = { x: number; gapY: number; passed: boolean };

export const FlappyBird = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const stateRef = useRef({
    birdY: H / 2,
    vel: 0,
    pipes: [] as Pipe[],
    frame: 0,
  });
  const scoreRef = useRef(0);

  const reset = useCallback(() => {
    stateRef.current = {
      birdY: H / 2,
      vel: 0,
      pipes: [
        { x: W + 60, gapY: 120 + Math.random() * (H - 260), passed: false },
        { x: W + 60 + PIPE_SPACING, gapY: 120 + Math.random() * (H - 260), passed: false },
      ],
      frame: 0,
    };
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setRunning(true);
  }, []);

  const flap = useCallback(() => {
    stateRef.current.vel = FLAP;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!running) reset();
        else flap();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, reset, flap]);

  useEffect(() => {
    if (!running) return;
    let raf: number;

    const loop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const s = stateRef.current;
      s.frame++;

      // Physics
      s.vel += GRAVITY;
      s.birdY += s.vel;

      // Pipes
      for (const p of s.pipes) p.x -= 2.4;
      if (s.pipes[0].x + PIPE_W < -10) {
        s.pipes.shift();
        s.pipes.push({ x: s.pipes[s.pipes.length - 1].x + PIPE_SPACING, gapY: 120 + Math.random() * (H - 260), passed: false });
      }

      // Score
      for (const p of s.pipes) {
        if (!p.passed && p.x + PIPE_W < 80) {
          p.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      }

      // Collision
      const birdR = 14;
      const birdX = 80;
      const hitGround = s.birdY + birdR >= H - 40;
      const hitCeiling = s.birdY - birdR <= 0;
      let hitPipe = false;
      for (const p of s.pipes) {
        if (
          birdX + birdR > p.x &&
          birdX - birdR < p.x + PIPE_W &&
          (s.birdY - birdR < p.gapY || s.birdY + birdR > p.gapY + GAP)
        ) {
          hitPipe = true;
          break;
        }
      }

      if (hitGround || hitCeiling || hitPipe) {
        setRunning(false);
        setGameOver(true);
        setBest((b) => Math.max(b, scoreRef.current));
        return;
      }

      // Render
      ctx.clearRect(0, 0, W, H);
      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#e0f2fe");
      grad.addColorStop(1, "#f0f9ff");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let i = 0; i < 3; i++) {
        const cx = ((i * 160 - s.frame * 0.3) % (W + 100) + W + 100) % (W + 100) - 50;
        ctx.beginPath();
        ctx.arc(cx, 70 + i * 40, 22, 0, Math.PI * 2);
        ctx.arc(cx + 22, 70 + i * 40, 16, 0, Math.PI * 2);
        ctx.arc(cx - 22, 70 + i * 40, 15, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = "#d97706";
      ctx.fillRect(0, H - 40, W, 40);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(0, H - 40, W, 8);

      // Pipes
      for (const p of s.pipes) {
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.roundRect(p.x, 0, PIPE_W, p.gapY, [0, 0, 6, 6]);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(p.x, p.gapY + GAP, PIPE_W, H - 40 - p.gapY - GAP, [6, 6, 0, 0]);
        ctx.fill();
        ctx.fillStyle = "#15803d";
        ctx.fillRect(p.x + 4, p.gapY - 18, PIPE_W - 8, 18);
        ctx.fillRect(p.x + 4, p.gapY + GAP, PIPE_W - 8, 18);
      }

      // Bird
      ctx.save();
      ctx.translate(birdX, s.birdY);
      ctx.rotate(Math.max(-0.5, Math.min(0.9, s.vel * 0.06)));
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(0, 0, birdR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(-2, -birdR);
      ctx.lineTo(4, -birdR - 7);
      ctx.lineTo(8, -birdR + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(5, -4, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(6.5, -4, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.moveTo(birdR - 2, 0);
      ctx.lineTo(birdR + 10, 3);
      ctx.lineTo(birdR - 2, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="text-slate-500 dark:text-slate-400">Best: {Math.max(best, score)}</span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onClick={() => (running ? flap() : reset())}
          className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-full h-auto cursor-pointer"
        />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/50 backdrop-blur-sm rounded-xl">
            <p className="text-white font-extrabold text-xl">
              {gameOver ? "Game Over" : "Flappy Bird"}
            </p>
            {gameOver && <p className="text-slate-200 text-sm">You scored {score}</p>}
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {gameOver ? "Play Again" : "Start Game"}
            </button>
            <p className="text-slate-300 text-xs">Space, ↑ or click to flap</p>
          </div>
        )}
      </div>
    </div>
  );
};
