"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, RotateCcw } from "lucide-react";

const W = 480;
const H = 320;
const PADDLE_H = 70;
const PADDLE_W = 10;
const WIN_SCORE = 7;
const AI_SPEED = 4.1;

export const Pong = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);

  const stateRef = useRef({
    playerY: H / 2 - PADDLE_H / 2,
    aiY: H / 2 - PADDLE_H / 2,
    ballX: W / 2,
    ballY: H / 2,
    dx: 4,
    dy: 2.5,
    keys: { up: false, down: false },
  });
  const playerScoreRef = useRef(0);
  const aiScoreRef = useRef(0);

  const resetBall = useCallback((toPlayer: boolean) => {
    const s = stateRef.current;
    s.ballX = W / 2;
    s.ballY = H / 2;
    s.dx = toPlayer ? -4 : 4;
    s.dy = (Math.random() - 0.5) * 5;
  }, []);

  const start = useCallback(() => {
    playerScoreRef.current = 0;
    aiScoreRef.current = 0;
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    stateRef.current.playerY = H / 2 - PADDLE_H / 2;
    stateRef.current.aiY = H / 2 - PADDLE_H / 2;
    resetBall(false);
    setRunning(true);
  }, [resetBall]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); stateRef.current.keys.up = true; }
      if (e.key === "ArrowDown" || e.key === "s") { e.preventDefault(); stateRef.current.keys.down = true; }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") stateRef.current.keys.up = false;
      if (e.key === "ArrowDown" || e.key === "s") stateRef.current.keys.down = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !running) return;
    const rect = canvas.getBoundingClientRect();
    const scale = H / rect.height;
    const y = (e.clientY - rect.top) * scale;
    stateRef.current.playerY = Math.max(0, Math.min(H - PADDLE_H, y - PADDLE_H / 2));
  };

  useEffect(() => {
    if (!running) return;
    let raf: number;

    const loop = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const s = stateRef.current;

      // Player paddle
      if (s.keys.up) s.playerY = Math.max(0, s.playerY - 5.5);
      if (s.keys.down) s.playerY = Math.min(H - PADDLE_H, s.playerY + 5.5);

      // AI paddle (tracks ball with capped speed)
      const aiTarget = s.ballY - PADDLE_H / 2;
      const diff = aiTarget - s.aiY;
      s.aiY += Math.max(-AI_SPEED, Math.min(AI_SPEED, diff * 0.35));
      s.aiY = Math.max(0, Math.min(H - PADDLE_H, s.aiY));

      // Ball
      s.ballX += s.dx;
      s.ballY += s.dy;

      if (s.ballY < 7) { s.ballY = 7; s.dy = Math.abs(s.dy); }
      if (s.ballY > H - 7) { s.ballY = H - 7; s.dy = -Math.abs(s.dy); }

      // Player paddle (left, x=16)
      if (s.ballX - 7 < 16 + PADDLE_W && s.ballX - 7 > 16 && s.ballY > s.playerY && s.ballY < s.playerY + PADDLE_H) {
        s.ballX = 16 + PADDLE_W + 7;
        s.dx = Math.abs(s.dx) * 1.04;
        s.dy += ((s.ballY - (s.playerY + PADDLE_H / 2)) / PADDLE_H) * 3;
      }

      // AI paddle (right, x=W-16-PADDLE_W)
      const aiX = W - 16 - PADDLE_W;
      if (s.ballX + 7 > aiX && s.ballX + 7 < aiX + PADDLE_W + 7 && s.ballY > s.aiY && s.ballY < s.aiY + PADDLE_H) {
        s.ballX = aiX - 7;
        s.dx = -Math.abs(s.dx) * 1.04;
        s.dy += ((s.ballY - (s.aiY + PADDLE_H / 2)) / PADDLE_H) * 3;
      }

      // Cap speed
      const speed = Math.hypot(s.dx, s.dy);
      if (speed > 9) {
        s.dx = (s.dx / speed) * 9;
        s.dy = (s.dy / speed) * 9;
      }

      // Scoring
      if (s.ballX < -10) {
        aiScoreRef.current += 1;
        setAiScore(aiScoreRef.current);
        if (aiScoreRef.current >= WIN_SCORE) {
          setRunning(false);
          setWinner("ai");
        } else {
          resetBall(true);
        }
      }
      if (s.ballX > W + 10) {
        playerScoreRef.current += 1;
        setPlayerScore(playerScoreRef.current);
        if (playerScoreRef.current >= WIN_SCORE) {
          setRunning(false);
          setWinner("player");
        } else {
          resetBall(false);
        }
      }

      // Render
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, W, H);

      // Center line
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#60a5fa";
      ctx.beginPath();
      ctx.roundRect(16, s.playerY, PADDLE_W, PADDLE_H, 4);
      ctx.fill();

      ctx.fillStyle = "#f87171";
      ctx.beginPath();
      ctx.roundRect(W - 16 - PADDLE_W, s.aiY, PADDLE_W, PADDLE_H, 4);
      ctx.fill();

      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, 7, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, resetBall]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-8 text-sm font-bold">
        <span className="text-blue-600 dark:text-blue-400">You: {playerScore}</span>
        <span className="text-slate-400">—</span>
        <span className="text-red-500 dark:text-red-400">AI: {aiScore}</span>
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
              {winner === "player" ? "You win!" : winner === "ai" ? "AI wins!" : "Pong"}
            </p>
            <p className="text-slate-400 text-xs">First to {WIN_SCORE} points</p>
            <button
              onClick={start}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {winner ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {winner ? "Play Again" : "Start Game"}
            </button>
            <p className="text-slate-400 text-xs">Mouse or ↑ ↓ / W S to move</p>
          </div>
        )}
      </div>
    </div>
  );
};
