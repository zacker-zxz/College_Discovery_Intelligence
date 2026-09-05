import { describe, it, expect, afterAll } from "vitest";
import { ComparisonService } from "../services/comparison.service";
import { prisma } from "../lib/prisma";

describe("ComparisonService - Matrix Computation", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should throw error when less than 2 colleges are selected", async () => {
    await expect(ComparisonService.compareColleges(["single-id"])).rejects.toThrow(
      "Comparison requires between 2 and 3 colleges."
    );
  });

  it("should throw error when more than 3 colleges are selected", async () => {
    await expect(
      ComparisonService.compareColleges(["id1", "id2", "id3", "id4"])
    ).rejects.toThrow("Comparison requires between 2 and 3 colleges.");
  });

  it("should calculate comparative highlights for valid colleges", async () => {
    // Select NIRF-ranked colleges so the comparison actually has metrics
    // (fees / packages / rank) to compute highlights from.
    const colleges = await prisma.college.findMany({
      where: { nirfRank: { not: null } },
      orderBy: { nirfRank: "asc" },
      take: 2,
    });
    if (colleges.length < 2) return;

    const matrix = await ComparisonService.compareColleges([colleges[0].id, colleges[1].id]);

    expect(matrix).toHaveLength(2);
    expect(matrix[0].highlights).toBeDefined();
    expect(matrix[1].highlights).toBeDefined();

    // At least one college should have isLowestFee or isHighestAvgPackage set if metrics exist
    const hasHighlight = matrix.some(
      (m) =>
        m.highlights.isLowestFee ||
        m.highlights.isHighestAvgPackage ||
        m.highlights.isTopRated ||
        m.highlights.isBestRanked
    );
    expect(hasHighlight).toBe(true);
  });
});
