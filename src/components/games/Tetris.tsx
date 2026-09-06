"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw, Play, Pause } from "lucide-react";

const COLS = 10;
const ROWS = 20;

// Each piece: array of rotations, each rotation is array of [x, y] offsets
const SHAPES: Record<string, { rotations: [number, number][][]; color: string }> = {
  I: { color: "bg-cyan-500", rotations: [[[0, 1], [1, 1], [2, 1], [3, 1]], [[2, 0], [2, 1], [2, 2], [2, 3]]] },
  O: { color: "bg-yellow-500", rotations: [[[1, 0], [2, 0], [1, 1], [2, 1]]] },
  T: { color: "bg-purple-500", rotations: [
    [[1, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 1]],
    [[0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [1, 2]],
  ] },
  S: { color: "bg-green-500", rotations: [[[1, 1], [2, 1], [0, 2], [1, 2]], [[1, 0], [1, 1], [2, 1], [2, 2]]] },
  Z: { color: "bg-red-500", rotations: [[[0, 1], [1, 1], [1, 2], [2, 2]], [[2, 0], [1, 1], [2, 1], [1, 2]]] },
  J: { color: "bg-blue-500", rotations: [
    [[0, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [1, 1], [0, 2], [1, 2]],
  ] },
  L: { color: "bg-orange-500", rotations: [
    [[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]], [[0, 0], [1, 0], [1, 1], [1, 2]],
  ] },
};

const PIECE_KEYS = Object.keys(SHAPES);

type Piece = { key: string; rot: number; x: number; y: number };
type Grid = (string | null)[][];

const createGrid = (): Grid =>
  Array.from({ length: ROWS }, () => Array<string | null>(COLS).fill(null));

const randomPiece = (): Piece => ({
  key: PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)],
  rot: 0,
  x: 3,
  y: 0,
});

const blocksOf = (p: Piece): [number, number][] =>
  SHAPES[p.key].rotations[p.rot % SHAPES[p.key].rotations.length].map(([bx, by]) => [p.x + bx, p.y + by]);

const collides = (grid: Grid, p: Piece): boolean =>
  blocksOf(p).some(([x, y]) => x < 0 || x >= COLS || y >= ROWS || (y >= 0 && grid[y][x] !== null));

const mergePiece = (grid: Grid, p: Piece): Grid => {
  const next = grid.map((r) => [...r]);
  for (const [x, y] of blocksOf(p)) {
    if (y >= 0) next[y][x] = SHAPES[p.key].color;
  }
  return next;
};

const clearLines = (grid: Grid): { grid: Grid; cleared: number } => {
  const kept = grid.filter((row) => row.some((c) => c === null));
  const cleared = ROWS - kept.length;
  const newGrid = [...Array.from({ length: cleared }, () => Array<string | null>(COLS).fill(null)), ...kept];
  return { grid: newGrid, cleared };
};

export const Tetris = () => {
  const [grid, setGrid] = useState<Grid>(createGrid);
  const [piece, setPiece] = useState<Piece>(randomPiece);
  const [nextPiece, setNextPiece] = useState<Piece>(randomPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const gridRef = useRef(grid);
  const pieceRef = useRef(piece);
  gridRef.current = grid;
  pieceRef.current = piece;

  const level = Math.floor(lines / 10) + 1;
  const speed = Math.max(120, 600 - (level - 1) * 55);

  const spawn = useCallback(
    (grid: Grid) => {
      const p = nextPiece;
      setPiece(p);
      setNextPiece(randomPiece());
      if (collides(grid, p)) {
        setRunning(false);
        setGameOver(true);
      }
    },
    [nextPiece]
  );

  const lockPiece = useCallback(() => {
    const merged = mergePiece(gridRef.current, pieceRef.current);
    const { grid: clearedGrid, cleared } = clearLines(merged);
    setGrid(clearedGrid);
    setLines((l) => l + cleared);
    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] * level;
      setScore((s) => s + points);
    }
    spawn(clearedGrid);
  }, [level, spawn]);

  const stepDown = useCallback(() => {
    const moved = { ...pieceRef.current, y: pieceRef.current.y + 1 };
    if (collides(gridRef.current, moved)) lockPiece();
    else setPiece(moved);
  }, [lockPiece]);

  // Gravity
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(stepDown, speed);
    return () => clearInterval(interval);
  }, [running, speed, stepDown]);

  const tryMove = useCallback((dx: number, dy: number) => {
    const p = pieceRef.current;
    const moved = { ...p, x: p.x + dx, y: p.y + dy };
    if (!collides(gridRef.current, moved)) setPiece(moved);
    else if (dy > 0) lockPiece();
  }, [lockPiece]);

  const tryRotate = useCallback(() => {
    const p = pieceRef.current;
    const rotated = { ...p, rot: p.rot + 1 };
    // Simple wall kicks
    for (const kick of [0, -1, 1, -2, 2]) {
      const kicked = { ...rotated, x: rotated.x + kick };
      if (!collides(gridRef.current, kicked)) {
        setPiece(kicked);
        return;
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    const p = pieceRef.current;
    let moved = p;
    while (!collides(gridRef.current, { ...moved, y: moved.y + 1 })) {
      moved = { ...moved, y: moved.y + 1 };
    }
    setPiece(moved);
    setScore((s) => s + (moved.y - p.y) * 2);
    setTimeout(lockPiece, 0);
  }, [lockPiece]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!running) {
        if (e.code === "Space") {
          e.preventDefault();
          if (gameOver) return;
          setRunning(true);
        }
        return;
      }
      switch (e.key) {
        case "ArrowLeft": e.preventDefault(); tryMove(-1, 0); break;
        case "ArrowRight": e.preventDefault(); tryMove(1, 0); break;
        case "ArrowDown": e.preventDefault(); tryMove(0, 1); break;
        case "ArrowUp": e.preventDefault(); tryRotate(); break;
        case " ": e.preventDefault(); hardDrop(); break;
        case "p": case "P": setRunning((r) => !r); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, gameOver, tryMove, tryRotate, hardDrop]);

  const reset = () => {
    setGrid(createGrid());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0);
    setLines(0);
    setGameOver(false);
    setRunning(true);
  };

  // Render grid + current piece
  const displayGrid = grid.map((r) => [...r]);
  if (!gameOver) {
    for (const [x, y] of blocksOf(piece)) {
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) displayGrid[y][x] = SHAPES[piece.key].color;
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6 text-sm font-semibold">
        <span className="text-slate-900 dark:text-slate-100">Score: {score}</span>
        <span className="text-slate-500 dark:text-slate-400">Lines: {lines}</span>
        <span className="text-blue-600 dark:text-blue-400">Level {level}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative">
          <div
            className="grid p-1.5 bg-slate-200 dark:bg-slate-800 rounded-xl"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          >
            {displayGrid.flatMap((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`w-4 h-4 md:w-[1.15rem] md:h-[1.15rem] rounded-[3px] ${
                    cell ?? "bg-slate-100 dark:bg-slate-900/70"
                  }`}
                />
              ))
            )}
          </div>

          {!running && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/70 backdrop-blur-sm rounded-xl">
              <p className="text-white font-extrabold text-lg">{gameOver ? "Game Over" : "Tetris"}</p>
              {gameOver && <p className="text-slate-300 text-sm">Score: {score}</p>}
              <button
                onClick={gameOver ? reset : () => setRunning(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {gameOver ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {gameOver ? "Play Again" : "Start"}
              </button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-3">
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Next</p>
            <div className="grid grid-cols-4 gap-0.5 w-[5.5rem]">
              {(() => {
                const cells: string[] = Array(16).fill("");
                for (const [bx, by] of blocksOf({ ...nextPiece, x: 0, y: 0 })) {
                  if (by < 4 && bx < 4) cells[by * 4 + bx] = SHAPES[nextPiece.key].color;
                }
                return cells.map((c, i) => (
                  <div key={i} className={`w-5 h-5 rounded-[3px] ${c || "bg-slate-200 dark:bg-slate-900/70"}`} />
                ));
              })()}
            </div>
          </div>
          {running && (
            <button
              onClick={() => setRunning(false)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Pause className="w-3.5 h-3.5" /> Pause
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        ← → move · ↑ rotate · ↓ soft drop · Space hard drop · P pause
      </p>
    </div>
  );
};
