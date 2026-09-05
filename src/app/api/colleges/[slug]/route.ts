import { NextRequest, NextResponse } from "next/server";
import { CollegeService } from "@/services/college.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const college = await CollegeService.getCollegeBySlug(slug);

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const similar = await CollegeService.getSimilarColleges(college.id, college.state, college.institutionType);

    return NextResponse.json({ college, similar });
  } catch (error) {
    console.error("GET /api/colleges/[slug] error:", error);
    return NextResponse.json({ error: "Failed to retrieve college details" }, { status: 500 });
  }
}
