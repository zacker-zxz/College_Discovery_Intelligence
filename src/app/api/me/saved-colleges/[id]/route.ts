import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.savedCollege.deleteMany({
      where: {
        id,
        userId: user.userId,
      },
    });

    return NextResponse.json({ message: "Removed from saved colleges" });
  } catch (error) {
    console.error("Delete saved college error:", error);
    return NextResponse.json({ error: "Failed to remove saved college" }, { status: 500 });
  }
}
