"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Light corporate hero surface with live cursor effects:
 *  - A dark-tinted spotlight that follows the pointer (clearly visible)
 *  - A spring-lagged glow orb trailing the cursor for tactile motion
 * All effects respect prefers-reduced-motion and are transform/opacity only.
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

  // Trailing glow orb — spring physics give it a smooth, weighty follow
  const glowX = useMotionValue(-400);
  const glowY = useMotionValue(-400);
  const springX = useSpring(glowX, { stiffness: 260, damping: 26, mass: 0.7 });
  const springY = useSpring(glowY, { stiffness: 260, damping: 26, mass: 0.7 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMouse({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
    glowX.set(x);
    glowY.set(y);
  };

  const onPointerLeave = () => {
    // Park the orb off-screen so it glides out naturally
    glowX.set(-400);
    glowY.set(-400);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
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

      {/* Dark cursor spotlight — layered slate + blue tints for a visible,
          professional lighting effect that tracks the pointer */}
      {!reduced && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              `radial-gradient(600px circle at ${mouse.x}% ${mouse.y}%, rgba(15,23,42,0.09), transparent 46%)`,
              `radial-gradient(360px circle at ${mouse.x}% ${mouse.y}%, rgba(37,99,235,0.10), transparent 42%)`,
            ].join(","),
          }}
        />
      )}

      {/* Trailing glow orb — spring-lagged halo that follows movement */}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="absolute top-0 left-0 pointer-events-none hidden md:block"
          style={{
            x: springX,
            y: springY,
            width: 160,
            height: 160,
            marginLeft: -80,
            marginTop: -80,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.16) 0%, rgba(37,99,235,0.07) 45%, transparent 70%)",
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
