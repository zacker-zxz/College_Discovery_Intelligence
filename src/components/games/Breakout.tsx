"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";

const W = 480;
const H = 360;
const PADDLE_W = 78;
const PADDLE_H = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_H = 18;
const BRICK_GAP = 4;
const BRICK_TOP = 40;
const BRICK_W = (W - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;

const ROW_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];

type Brick = { x: number; y: number; alive: boolean; row: number };

const createBricks = (): Brick[] => {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_GAP + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        alive: true,
        row: r,
      });
    }
  }
  return bricks;
};

export const Breakout = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const stateRef = useRef({
    paddleX: W / 2 - PADDLE_W / 2,
    ballX: W / 2,
    ballY: H - 60,
    dx: 3,
    dy: -3.5,
    bricks: createBricks(),
    keys: { left: false, right: false },
  });

  const resetBall = useCallback(() => {
    const s = stateRef.current;
    s.ballX = W / 2;
    s.ballY = H - 60;
    s.dx = Math.random() > 0.5 ? 3 : -3;
    s.dy = -3.5;
  }, []);

  const start = useCallback(() => {
    stateRef.current.bricks = createBricks();
    stateRef.current.paddleX = W / 2 - PADDLE_W / 2;
    resetBall();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setRunning(true);
  }, [resetBall]);

  // Keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") stateRef.current.keys.left = true;
      if (e.key === "ArrowRight" || e.key === "d") stateRef.current.keys.right = true;
      if (e.code === "Space" && !running) {
        e.preventDefault();
        start();
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") stateRef.current.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d") stateRef.current.keys.right = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [running, start]);

  // Mouse control
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !running) return;
    const rect = canvas.getBoundingClientRect();
    const scale = W / rect.width;
    const x = (e.clientX - rect.left) * scale;
    stateRef.current.paddleX = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
  };

  useEffect(() => {
    if (!running) return;
    let raf: number;

    const loop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const s = stateRef.current;

      // Paddle
      if (s.keys.left) s.paddleX = Math.max(0, s.paddleX - 6);
      if (s.keys.right) s.paddleX = Math.min(W - PADDLE_W, s.paddleX + 6);

      // Ball
      s.ballX += s.dx;
      s.ballY += s.dy;

      // Walls
      if (s.ballX < 7) { s.ballX = 7; s.dx = Math.abs(s.dx); }
      if (s.ballX > W - 7) { s.ballX = W - 7; s.dx = -Math.abs(s.dx); }
      if (s.ballY < 7) { s.ballY = 7; s.dy = Math.abs(s.dy); }

      // Paddle
      const py = H - 26;
      if (
        s.ballY + 7 >= py &&
        s.ballY + 7 <= py + PADDLE_H + 4 &&
        s.ballX >= s.paddleX - 7 &&
        s.ballX <= s.paddleX + PADDLE_W + 7
      ) {
        s.ballY = py - 7;
        const hitPos = (s.ballX - (s.paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
        const speed = Math.min(6, Math.hypot(s.dx, s.dy) * 1.02);
        const angle = hitPos * (Math.PI / 3); // max 60 degrees
        s.dx = Math.sin(angle) * speed;
        s.dy = -Math.abs(Math.cos(angle) * speed);
      }

      // Bricks
      let alive = 0;
      for (const b of s.bricks) {
        if (!b.alive) continue;
        alive++;
        if (
          s.ballX + 7 > b.x &&
          s.ballX - 7 < b.x + BRICK_W &&
          s.ballY + 7 > b.y &&
          s.ballY - 7 < b.y + BRICK_H
        ) {
          b.alive = false;
          alive--;
          setScore((sc) => sc + (BRICK_ROWS - b.row) * 10);
          // Bounce: determine side
          const overlapX = Math.min(s.ballX + 7 - b.x, b.x + BRICK_W - (s.ballX - 7));
          const overlapY = Math.min(s.ballY + 7 - b.y, b.y + BRICK_H - (s.ballY - 7));
          if (overlapX < overlapY) s.dx = -s.dx;
          else s.dy = -s.dy;
          break;
        }
      }

      if (alive === 0) {
        setRunning(false);
        setWon(true);
        return;
      }

      // Fall
      if (s.ballY > H + 10) {
        const remaining = lives - 1;
        setLives(remaining);
        if (remaining <= 0) {
          setRunning(false);
          setGameOver(true);
          return;
        }
        resetBall();
      }

      // Render
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);

      for (const b of s.bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = ROW_COLORS[b.row];
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4);
        ctx.fill();
      }

      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.roundRect(s.paddleX, py, PADDLE_W, PADDLE_H, 5);
      ctx.fill();

      ctx.fillStyle = "#60a5fa";
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, lives, resetBall]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-md text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="text-red-500">{"♥".repeat(Math.max(0, lives))}</span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onMouseMove={handleMouseMove}
          className="rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-full h-auto"
        />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 backdrop-blur-sm rounded-xl">
            <p className="text-white font-extrabold text-lg">
              {won ? "You cleared it!" : gameOver ? "Game Over" : "Breakout"}
            </p>
            {(won || gameOver) && <p className="text-slate-300 text-sm">Score: {score}</p>}
            <button
              onClick={start}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {won || gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {won || gameOver ? "Play Again" : "Start Game"}
            </button>
            <p className="text-slate-400 text-xs">Mouse or ← → to move the paddle</p>
          </div>
        )}
      </div>
    </div>
  );
};
