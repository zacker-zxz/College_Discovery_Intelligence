import { NextRequest, NextResponse } from "next/server";
import { DiscussionService } from "@/services/discussion.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const discussion = await DiscussionService.getDiscussionById(id);
    if (!discussion) {
      return NextResponse.json({ error: "Discussion thread not found" }, { status: 404 });
    }
    return NextResponse.json({ discussion });
  } catch (error) {
    console.error("GET discussion thread error:", error);
    return NextResponse.json({ error: "Failed to fetch discussion thread" }, { status: 500 });
  }
}
