import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { fuzzySearchColleges } from "@/lib/fuzzy-search";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  // Autocomplete is high-frequency: generous per-IP limit
  const ip = getClientIp(req);
  const limit = rateLimit(`suggest:${ip}`, { windowMs: 60 * 1000, maxRequests: 120 });
  if (!limit.allowed) {
    return NextResponse.json(
      { suggestions: [] },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const suggestions = await fuzzySearchColleges(q, 8);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggest API error:", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
