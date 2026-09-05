import { NextRequest, NextResponse } from "next/server";
import { ComparisonService } from "@/services/comparison.service";
import { comparisonSchema } from "@/validators/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = comparisonSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid comparison selection", details: validated.error.format() },
        { status: 400 }
      );
    }

    const matrix = await ComparisonService.compareColleges(validated.data.collegeIds);
    return NextResponse.json({ comparison: matrix });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to compute comparison";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
