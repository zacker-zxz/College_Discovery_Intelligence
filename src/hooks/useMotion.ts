"use client";

import { useEffect, useState } from "react";

// Returns the viewport scrollY, throttled via requestAnimationFrame,
// for parallax and scroll-linked motion.
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return scrollY;
}

// Tracks pointer position relative to an element (0..1 normalized),
// powering magnetic spotlight and 3D tilt effects.
export function usePointerRelative(ref: React.RefObject<HTMLElement | null>) {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [ref]);

  return pos;
}
