"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  hue: number;
}

export const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Track mouse gently for subtle interaction
    let mouseX = -1000;
    let mouseY = -1000;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Particle pool: mix of subtle dark, slate, and glowing accent particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isAccent = Math.random() < 0.25;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.8 + 1,
        // Very slow, organic drift
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35 - 0.1, // subtle upward drift
        opacity: Math.random() * 0.3 + 0.15,
        baseOpacity: Math.random() * 0.3 + 0.15,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2,
        // Accents between slate (220), indigo (240), and blue (210)
        hue: isAccent ? 215 + Math.random() * 30 : 220,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic oscillation
        p.x += p.speedX + Math.sin(time * 0.6 + p.pulseOffset) * 0.15;
        p.y += p.speedY + Math.cos(time * 0.5 + p.pulseOffset) * 0.15;

        // Interactive mouse gentle repulsion
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 1.5;
          p.y += (dy / dist) * force * 1.5;
        }

        // Screen wrap-around
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Breathing opacity
        const currentOpacity = Math.max(
          0.05,
          p.baseOpacity + Math.sin(time * 1.5 + p.pulseOffset) * 0.1
        );

        // Draw particle with soft glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size * 2.5
        );
        gradient.addColorStop(0, `hsla(${p.hue}, 65%, 45%, ${currentOpacity * 1.5})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 50%, 35%, ${currentOpacity * 0.6})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 50%, 30%, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with subtle ethereal lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < 90) {
            const lineOpacity = (1 - cdist / 90) * 0.12 * currentOpacity;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(220, 60%, 40%, ${lineOpacity})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
      style={{ willChange: "transform" }}
    />
  );
};
