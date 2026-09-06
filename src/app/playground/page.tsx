"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  Brain,
  Worm as SnakeIcon,
  Grid3x3,
  Zap,
  Trophy,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Rabbit,
  Hash,
  Blocks,
  Bomb,
  Bird,
  Volleyball,
  MousePointerClick,
  Palette,
  Keyboard,
  Target,
  Columns3,
  SpellCheck,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import { Snake } from "@/components/games/Snake";
import { MemoryMatch } from "@/components/games/MemoryMatch";
import { TicTacToe } from "@/components/games/TicTacToe";
import { ReactionTest } from "@/components/games/ReactionTest";
import { DinoRunner } from "@/components/games/DinoRunner";
import { Game2048 } from "@/components/games/Game2048";
import { Tetris } from "@/components/games/Tetris";
import { Minesweeper } from "@/components/games/Minesweeper";
import { FlappyBird } from "@/components/games/FlappyBird";
import { Breakout } from "@/components/games/Breakout";
import { Pong } from "@/components/games/Pong";
import { WhackAMole } from "@/components/games/WhackAMole";
import { SimonSays } from "@/components/games/SimonSays";
import { TypingTest } from "@/components/games/TypingTest";
import { AimTrainer } from "@/components/games/AimTrainer";
import { ConnectFour } from "@/components/games/ConnectFour";
import { Hangman } from "@/components/games/Hangman";
import { WordScramble } from "@/components/games/WordScramble";
import { LightsOut } from "@/components/games/LightsOut";

type GameId =
  | "snake" | "memory" | "tictactoe" | "reaction"
  | "dino" | "tetris" | "flappy" | "breakout" | "pong"
  | "g2048" | "minesweeper" | "lightsout" | "connect4"
  | "simon" | "hangman" | "scramble"
  | "typing" | "aim" | "whack";

type Category = "Arcade" | "Puzzle" | "Brain" | "Skill";

type GameDef = {
  id: GameId;
  title: string;
  tagline: string;
  icon: React.ElementType;
  category: Category;
};

const games: GameDef[] = [
  { id: "dino", title: "Dino Runner", tagline: "The offline classic — jump the cacti", icon: Rabbit, category: "Arcade" },
  { id: "flappy", title: "Flappy Bird", tagline: "Tap to flap through endless pipes", icon: Bird, category: "Arcade" },
  { id: "tetris", title: "Tetris", tagline: "Stack, rotate, and clear lines", icon: Blocks, category: "Arcade" },
  { id: "breakout", title: "Breakout", tagline: "Bounce the ball, smash every brick", icon: Volleyball, category: "Arcade" },
  { id: "pong", title: "Pong", tagline: "The original — beat the AI paddle", icon: Zap, category: "Arcade" },
  { id: "snake", title: "Neon Snake", tagline: "Classic arcade snake with a modern twist", icon: SnakeIcon, category: "Arcade" },
  { id: "g2048", title: "2048", tagline: "Merge tiles and chase the big number", icon: Hash, category: "Puzzle" },
  { id: "minesweeper", title: "Minesweeper", tagline: "Flag the mines without going boom", icon: Bomb, category: "Puzzle" },
  { id: "lightsout", title: "Lights Out", tagline: "Switch off every light on the board", icon: Lightbulb, category: "Puzzle" },
  { id: "connect4", title: "Connect Four", tagline: "Drop discs, line up four to win", icon: Columns3, category: "Puzzle" },
  { id: "memory", title: "Memory Match", tagline: "Flip cards and train your recall", icon: Brain, category: "Puzzle" },
  { id: "tictactoe", title: "Tic-Tac-Toe", tagline: "Outsmart the minimax AI — it's unbeatable", icon: Grid3x3, category: "Brain" },
  { id: "simon", title: "Simon Says", tagline: "Repeat the growing color sequence", icon: Palette, category: "Brain" },
  { id: "hangman", title: "Hangman", tagline: "Guess the word before the figure completes", icon: SpellCheck, category: "Brain" },
  { id: "scramble", title: "Word Scramble", tagline: "Unscramble words against the clock", icon: Shuffle, category: "Brain" },
  { id: "reaction", title: "Reaction Test", tagline: "How fast are your reflexes in milliseconds?", icon: Zap, category: "Skill" },
  { id: "typing", title: "Typing Speed", tagline: "Measure your WPM and accuracy", icon: Keyboard, category: "Skill" },
  { id: "aim", title: "Aim Trainer", tagline: "Click targets with speed and precision", icon: Target, category: "Skill" },
  { id: "whack", title: "Whack-a-Mole", tagline: "Bonk moles before they hide again", icon: MousePointerClick, category: "Skill" },
];

const GAME_COMPONENTS: Record<GameId, React.ComponentType> = {
  snake: Snake,
  memory: MemoryMatch,
  tictactoe: TicTacToe,
  reaction: ReactionTest,
  dino: DinoRunner,
  g2048: Game2048,
  tetris: Tetris,
  minesweeper: Minesweeper,
  flappy: FlappyBird,
  breakout: Breakout,
  pong: Pong,
  whack: WhackAMole,
  simon: SimonSays,
  typing: TypingTest,
  aim: AimTrainer,
  connect4: ConnectFour,
  hangman: Hangman,
  scramble: WordScramble,
  lightsout: LightsOut,
};

const CATEGORY_ORDER: Category[] = ["Arcade", "Puzzle", "Brain", "Skill"];

const CATEGORY_BADGE: Record<Category, string> = {
  Arcade: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900",
  Puzzle: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900",
  Brain: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900",
  Skill: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900",
};

export default function PlaygroundPage() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [filter, setFilter] = useState<Category | "All">("All");

  const visibleGames = filter === "All" ? games : games.filter((g) => g.category === filter);
  const activeDef = games.find((g) => g.id === activeGame);
  const ActiveComponent = activeGame ? GAME_COMPONENTS[activeGame] : null;

  return (
    <div className="app-frame py-12 md:py-16">
      {/* Header */}
      <div className="max-w-2xl mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CampusLens
        </Link>
        <div className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold uppercase tracking-wider mb-3">
          <Gamepad2 className="w-4 h-4" /> CampusLens Playground
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-3">
          Take a study break.
        </h1>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
          19 lightweight games built right into the platform — arcade classics, puzzles, brain teasers, and
          skill challenges. Keyboard and mouse ready, no downloads.
        </p>
      </div>

      {/* Game Grid or Active Game */}
      <AnimatePresence mode="wait">
        {activeGame === null ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Category filter */}
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {(["All", ...CATEGORY_ORDER] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    filter === cat
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat}
                  {cat !== "All" && (
                    <span className="ml-1.5 opacity-60">{games.filter((g) => g.category === cat).length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleGames.map((game) => {
                const Icon = game.icon;
                return (
                  <button
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className="group glass-card glass-card-hover rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-5 text-left"
                  >
                    <div className="flex items-start justify-between mb-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${CATEGORY_BADGE[game.category]}`}>
                        {game.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-0.5">{game.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{game.tagline}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeGame}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  {(() => {
                    const GameIcon = activeDef?.icon ?? Gamepad2;
                    return <GameIcon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-xl leading-tight">
                    {activeDef?.title}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activeDef?.tagline}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGame(null)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> All Games
              </button>
            </div>

            <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 md:p-8">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer note */}
      <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Sparkles className="w-3.5 h-3.5" />
        {activeGame === null ? "19 games · keyboard + mouse · zero installs" : "Scores are session-only. Best of luck!"}
        <Trophy className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
