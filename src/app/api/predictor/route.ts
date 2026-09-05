import { NextRequest, NextResponse } from "next/server";
import { PredictionService } from "@/services/predictor.service";
import { predictorSchema } from "@/validators/schemas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = predictorSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid predictor input parameters", details: validated.error.format() },
        { status: 400 }
      );
    }

    const predictions = await PredictionService.predictColleges(validated.data);
    return NextResponse.json({ ...predictions });
  } catch (error) {
    console.error("POST /api/predictor error:", error);
    return NextResponse.json({ error: "Predictor algorithm calculation error" }, { status: 500 });
  }
}
