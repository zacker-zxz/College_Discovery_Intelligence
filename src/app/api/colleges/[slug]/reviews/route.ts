import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/validators/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Per-user limit: prevents review spamming
    const limit = rateLimit(`review:${user.userId}`, { windowMs: 60 * 60 * 1000, maxRequests: 10 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "You have submitted too many reviews recently. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const { slug } = await params;
    const college = await prisma.college.findUnique({ where: { slug } });
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = reviewSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid review input", details: validated.error.format() }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        collegeId: college.id,
        userId: user.userId,
        rating: validated.data.rating,
        title: validated.data.title,
        comment: validated.data.comment,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    // Recalculate college overall rating
    const aggregate = await prisma.review.aggregate({
      where: { collegeId: college.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.college.update({
      where: { id: college.id },
      data: {
        overallRating: Number((aggregate._avg.rating || 4.5).toFixed(1)),
        reviewCount: aggregate._count.rating,
      },
    });

    return NextResponse.json({ review: newReview }, { status: 201 });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}
