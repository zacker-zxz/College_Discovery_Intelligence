import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  try {
    const { collegeId } = await req.json();
    if (!collegeId) {
      return NextResponse.json({ error: "collegeId is required" }, { status: 400 });
    }

    const existing = await prisma.savedCollege.findUnique({
      where: {
        userId_collegeId: {
          userId: user.userId,
          collegeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "College already saved", savedItem: existing });
    }

    const savedItem = await prisma.savedCollege.create({
      data: {
        userId: user.userId,
        collegeId,
      },
      include: { college: true },
    });

    return NextResponse.json({ savedItem }, { status: 201 });
  } catch (error) {
    console.error("Save college error:", error);
    return NextResponse.json({ error: "Failed to save college" }, { status: 500 });
  }
}
