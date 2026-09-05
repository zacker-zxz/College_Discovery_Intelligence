import { NextRequest, NextResponse } from "next/server";
import { DiscussionService } from "@/services/discussion.service";
import { getSessionUser } from "@/lib/auth";
import { discussionSchema } from "@/validators/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const collegeId = searchParams.get("collegeId") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const data = await DiscussionService.getDiscussions({ search, collegeId, page, limit });
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
