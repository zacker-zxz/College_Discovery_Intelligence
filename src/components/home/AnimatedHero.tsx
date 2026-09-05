"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* ── Word-by-word reveal with natural line wrapping ──
   Words are inline-block spans separated by REAL spaces (not &nbsp;),
   so the browser wraps lines normally at any viewport width. */
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AnimatedHeadline({
  text,
  className = "",
  highlightWords = [],
  highlightClass = "",
}: {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClass?: string;
}) {
  const words = text.split(" ");

  return (
    <motion.h1
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={className}
    >
      {words.map((w, i) => {
        const isHighlight = highlightWords.some((h) =>
          w.toLowerCase().includes(h.toLowerCase())
        );
        return (
          <React.Fragment key={`${w}-${i}`}>
            <motion.span
              variants={word}
              className={`inline-block ${isHighlight ? highlightClass : ""}`}
            >
              {w}
            </motion.span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </motion.h1>
  );
}

/* ── Typewriter that drives the input's native placeholder ──
   Because the animated text IS the placeholder attribute, it can
   never overlap or break layout — it inherits native truncation. */
export function useTypewriterPlaceholder(
  phrases: string[],
  opts?: { typeSpeed?: number; deleteSpeed?: number; holdMs?: number }
) {
  const reduced = useReducedMotion();
  const { typeSpeed = 55, deleteSpeed = 26, holdMs = 2100 } = opts ?? {};
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = phrases[index % phrases.length];

    if (reduced) {
      setText(target);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && text === target) {
      timer = setTimeout(() => setDeleting(true), holdMs);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
    } else {
      timer = setTimeout(
        () => {
          setText((prev) =>
            deleting ? target.slice(0, prev.length - 1) : target.slice(0, prev.length + 1)
          );
        },
        deleting ? deleteSpeed : typeSpeed
      );
    }

    return () => clearTimeout(timer);
  }, [text, deleting, index, phrases, reduced, typeSpeed, deleteSpeed, holdMs]);

  return reduced ? phrases[0] ?? "" : text;
}
