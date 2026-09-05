import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { name, collegeIds } = await req.json();
    if (!name || !Array.isArray(collegeIds) || collegeIds.length < 2) {
      return NextResponse.json({ error: "Name and at least 2 college IDs required" }, { status: 400 });
    }

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
