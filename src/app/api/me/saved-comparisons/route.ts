import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savedComparisonSchema } from "@/validators/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedComparison.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  const formatted = saved.map((item) => ({
    ...item,
    collegeIds: JSON.parse(item.collegeIds),
  }));

  return NextResponse.json({ savedComparisons: formatted });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limit = rateLimit(`save-comparison:${user.userId}`, { windowMs: 60 * 1000, maxRequests: 20 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const validated = savedComparisonSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid comparison payload", details: validated.error.format() }, { status: 400 });
    }

    const { name, collegeIds } = validated.data;

    const saved = await prisma.savedComparison.create({
      data: {
        userId: user.userId,
        name,
        collegeIds: JSON.stringify(collegeIds),
      },
    });

    return NextResponse.json({ savedComparison: { ...saved, collegeIds } }, { status: 201 });
  } catch (error) {
    console.error("Save comparison error:", error);
    return NextResponse.json({ error: "Failed to save comparison" }, { status: 500 });
  }
}
