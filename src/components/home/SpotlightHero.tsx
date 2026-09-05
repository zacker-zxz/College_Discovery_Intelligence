"use client";

import React, { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Light corporate hero surface: clean white base, soft professional
 * accent tints, a subtle cursor spotlight, and a faint blueprint grid.
 * All motion is transform/opacity only and respects prefers-reduced-motion.
 */
export function SpotlightHero({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 30 });
  const reduced = useReducedMotion();

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={`hero-light relative overflow-hidden ${className}`}
    >
      {/* Soft drifting accent tints */}
      <motion.div
        aria-hidden="true"
        className="absolute -top-40 left-[12%] w-[520px] h-[520px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08), transparent 65%)" }}
        animate={{ x: [0, 50, 0], y: [0, 25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.06), transparent 65%)" }}
        animate={{ x: [0, -40, 0], y: [0, 35, 0] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cursor spotlight — very subtle on white */}
      {!reduced && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(560px circle at ${mouse.x}% ${mouse.y}%, rgba(59,130,246,0.06), transparent 45%)`,
          }}
        />
      )}

      {/* Faint blueprint grid for structure */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 25%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 25%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative z-10 h-full flex flex-col">{children}</div>
    </div>
  );
}
