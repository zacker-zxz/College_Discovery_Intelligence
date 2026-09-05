import Fuse from "fuse.js";
import { prisma } from "@/lib/prisma";

/**
 * Two-tier fuzzy college search:
 *
 *  1. Candidate fetch (SQL): for every query token, fetch colleges whose
 *     name/shortName/city/state CONTAINS the token OR whose name STARTS WITH
 *     the token's first two characters. The prefix rule is what makes
 *     typo-tolerance possible ("bombey" -> prefix "bo" -> matches "Bombay").
 *
 *  2. Relevance ranking (Fuse.js): approximate-string scoring across the
 *     candidate pool handles misspellings, partial names, and multi-word
 *     queries, ordering results by similarity.
 */

export interface FuzzyCollege {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  city: string;
  state: string;
  institutionType: string;
  ownership: string;
  nirfRank: number | null;
}

const CANDIDATE_SELECT = {
  id: true,
  slug: true,
  name: true,
  shortName: true,
  city: true,
  state: true,
  institutionType: true,
  ownership: true,
  nirfRank: true,
} as const;

const MAX_CANDIDATES = 1500;

function buildCandidateConditions(query: string) {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 4);

  // Fallback: treat the whole query as one token (e.g. single long word)
  if (tokens.length === 0) {
    const single = query.trim();
    if (!single) return [];
    return [
      { name: { contains: single } },
      { shortName: { contains: single } },
      { city: { contains: single } },
      { state: { contains: single } },
    ];
  }

  const conditions: Record<string, unknown>[] = [];
  for (const token of tokens) {
    conditions.push(
      { name: { contains: token } },
      { name: { startsWith: token.slice(0, 2) } },
      { shortName: { contains: token } },
      { city: { contains: token } },
      { state: { contains: token } }
    );
  }
  return conditions;
}

export async function fuzzySearchColleges(query: string, limit = 8): Promise<FuzzyCollege[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Exact substring matches first — they are always the strongest signals
  const [exactMatches, candidates] = await Promise.all([
    prisma.college.findMany({
      where: {
        OR: [
          { name: { contains: trimmed, mode: "insensitive" } },
          { shortName: { contains: trimmed, mode: "insensitive" } },
          { city: { contains: trimmed, mode: "insensitive" } },
          { state: { contains: trimmed, mode: "insensitive" } },
        ],
      },
      select: CANDIDATE_SELECT,
      orderBy: [{ nirfRank: "asc" }, { overallRating: "desc" }],
      take: MAX_CANDIDATES,
    }),
    prisma.college.findMany({
      where: { OR: buildCandidateConditions(trimmed) },
      select: CANDIDATE_SELECT,
      take: MAX_CANDIDATES,
    }),
  ]);

  // Merge & dedupe candidates (exact matches already ranked well by DB order)
  const seen = new Set<string>();
  const pool: FuzzyCollege[] = [];
  for (const c of [...exactMatches, ...candidates]) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      pool.push(c);
    }
  }

  if (pool.length === 0) return [];

  const fuse = new Fuse(pool, {
    keys: [
      { name: "name", weight: 0.55 },
      { name: "shortName", weight: 0.25 },
      { name: "city", weight: 0.12 },
      { name: "state", weight: 0.08 },
    ],
    threshold: 0.45,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  return fuse
    .search(trimmed, { limit })
    .map((r) => r.item);
}
