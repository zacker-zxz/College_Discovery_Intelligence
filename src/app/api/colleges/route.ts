import { NextRequest, NextResponse } from "next/server";
import { CollegeService } from "@/services/college.service";
import { collegeQuerySchema } from "@/validators/schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const validated = collegeQuerySchema.safeParse(queryObj);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid search query parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const result = await CollegeService.getColleges(validated.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/colleges error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while fetching colleges" },
      { status: 500 }
    );
  }
}
