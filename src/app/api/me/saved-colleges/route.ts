import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savedCollegeSchema } from "@/validators/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const saved = await prisma.savedCollege.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
    include: {
      college: {
        include: {
          courses: {
            take: 2,
            include: { course: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ savedColleges: saved });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Per-user limit: prevents bookmark-spam flooding
  const limit = rateLimit(`save-college:${user.userId}`, { windowMs: 60 * 1000, maxRequests: 30 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const validated = savedCollegeSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid request", details: validated.error.format() }, { status: 400 });
    }

    const college = await prisma.college.findUnique({
      where: { id: validated.data.collegeId },
      select: { id: true },
    });
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: user.userId,
          collegeId: validated.data.collegeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "College already saved", savedItem: existing });
    }

    const savedItem = await prisma.savedCollege.create({
      data: {
        userId: user.userId,
        collegeId: validated.data.collegeId,
      },
      include: { college: true },
    });

    return NextResponse.json({ savedItem }, { status: 201 });
  } catch (error) {
    console.error("Save college error:", error);
    return NextResponse.json({ error: "Failed to save college" }, { status: 500 });
  }
}
