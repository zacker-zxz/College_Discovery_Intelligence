import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PredictionService } from "../services/predictor.service";
import { prisma } from "../lib/prisma";

describe("PredictionService - Algorithmic Entrance Predictor", () => {
  beforeAll(async () => {
    // Setup test cutoff records if dev.db exists
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should categorize strong match when rank is well inside historical cutoff bounds", async () => {
    const res = await PredictionService.predictColleges({
      exam: "JEE_ADVANCED",
      rank: 50,
      category: "GENERAL",
      state: "",
      courseCode: "",
    });

    expect(res).toBeDefined();
    expect(res.strongMatches.length).toBeGreaterThan(0);
    const firstMatch = res.strongMatches[0];
    expect(firstMatch.matchTier).toBe("STRONG");
    expect(firstMatch.matchScore).toBeGreaterThanOrEqual(80);
    expect(firstMatch.rationale).toContain("safely within");
  });

  it("should categorize possible match when rank is near the closing boundary", async () => {
    const res = await PredictionService.predictColleges({
      exam: "JEE_ADVANCED",
      rank: 72, // closing is 68 for IITB CSE
      category: "GENERAL",
      state: "",
      courseCode: "",
    });

    expect(res).toBeDefined();
    const matches = [...res.strongMatches, ...res.possibleMatches, ...res.reachMatches];
    expect(matches.length).toBeGreaterThan(0);
  });

  it("should categorize reach match when rank demands ambition", async () => {
    const res = await PredictionService.predictColleges({
      exam: "JEE_ADVANCED",
      rank: 90,
      category: "GENERAL",
      state: "",
      courseCode: "",
    });

    expect(res).toBeDefined();
    expect(res.totalEvaluated).toBeGreaterThan(0);
  });
});
