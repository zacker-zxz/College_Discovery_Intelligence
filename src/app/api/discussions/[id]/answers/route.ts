import { NextRequest, NextResponse } from "next/server";
import { DiscussionService } from "@/services/discussion.service";
import { getSessionUser } from "@/lib/auth";
import { answerSchema } from "@/validators/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to post answers" }, { status: 401 });
    }

    // Per-user limit: prevents answer spamming
    const limit = rateLimit(`answer:${user.userId}`, { windowMs: 60 * 60 * 1000, maxRequests: 30 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "You are posting answers too quickly. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const validated = answerSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid answer body", details: validated.error.format() }, { status: 400 });
    }

    const answer = await DiscussionService.createAnswer(id, user.userId, validated.data.body);
    return NextResponse.json({ answer }, { status: 201 });
  } catch (error) {
    console.error("POST answer error:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
