// Lightweight in-memory sliding window rate limiter for serverless environments.
// Note: On Vercel serverless, each instance maintains its own counters, which
// provides best-effort protection per warm instance. For strict global limits,
// use Upstash Redis or a similar external store (see DEPLOYMENT.md).

import type { NextRequest } from "next/server";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface TrackedRequest {
  timestamps: number[];
}

const globalForRateLimit = globalThis as unknown as {
  __rateLimitStore: Map<string, TrackedRequest> | undefined;
};

const store: Map<string, TrackedRequest> =
  globalForRateLimit.__rateLimitStore ?? new Map<string, TrackedRequest>();
globalForRateLimit.__rateLimitStore = store;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier) ?? { timestamps: [] };

  // Prune timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < options.windowMs);

  if (entry.timestamps.length >= options.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((options.windowMs - (now - oldest)) / 1000));
    store.set(identifier, entry);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  store.set(identifier, entry);

  // Opportunistic cleanup of stale keys to bound memory usage
  if (store.size > 5000) {
    for (const [key, value] of store) {
      if (value.timestamps.every((t) => now - t >= options.windowMs)) {
        store.delete(key);
      }
    }
  }

  return {
    allowed: true,
    remaining: options.maxRequests - entry.timestamps.length,
    retryAfterSeconds: 0,
  };
}

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
