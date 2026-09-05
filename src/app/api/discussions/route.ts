import { NextRequest, NextResponse } from "next/server";
import { DiscussionService } from "@/services/discussion.service";
import { getSessionUser } from "@/lib/auth";
import { discussionSchema, discussionQuerySchema } from "@/validators/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const validated = discussionQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const data = await DiscussionService.getDiscussions(validated.data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET discussions error:", error);
    return NextResponse.json({ error: "Failed to retrieve discussion forum threads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to ask questions" }, { status: 401 });
    }

    // Per-user limit: prevents authenticated thread spamming
    const limit = rateLimit(`discussion:${user.userId}`, { windowMs: 60 * 60 * 1000, maxRequests: 10 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "You are posting questions too quickly. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const validated = discussionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: "Invalid discussion payload", details: validated.error.format() }, { status: 400 });
    }

    const newDiscussion = await DiscussionService.createDiscussion(
      user.userId,
      validated.data.title,
      validated.data.body,
      validated.data.collegeId
    );

    return NextResponse.json({ discussion: newDiscussion }, { status: 201 });
  } catch (error) {
    console.error("POST discussion error:", error);
    return NextResponse.json({ error: "Failed to create discussion thread" }, { status: 500 });
  }
}
