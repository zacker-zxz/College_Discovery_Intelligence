import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { predictorSchema } from "@/validators/schemas";

export type PredictorInput = z.infer<typeof predictorSchema>;

export interface PredictionMatch {
  matchTier: "STRONG" | "POSSIBLE" | "REACH";
  matchScore: number; // 0 to 100 confidence
  rationale: string;
  college: {
    id: string;
    slug: string;
    name: string;
    shortName: string | null;
    city: string;
    state: string;
    institutionType: string;
    overallRating: number;
    avgPackage: number | null;
    minFee: number | null;
  };
  course?: {
    code: string;
    name: string;
    degree: string;
  };
  cutoffInfo: {
    examName: string;
    category: string;
    openingRank: number;
    closingRank: number;
    year: number;
    quota: string;
  };
}

export class PredictionService {
  static async predictColleges(input: PredictorInput): Promise<{
    strongMatches: PredictionMatch[];
    possibleMatches: PredictionMatch[];
    reachMatches: PredictionMatch[];
    totalEvaluated: number;
  }> {
    const { exam, rank, category, state } = input;

    // Fetch cutoffs matching exam and category (or General as fallback)
    const cutoffs = await prisma.examCutoff.findMany({
      where: {
        examName: exam,
        category: category || "GENERAL",
        ...(state && state.trim() !== "" ? { college: { state: state.trim() } } : {}),
      },
      include: {
        college: true,
        collegeCourse: {
          include: { course: true },
        },
      },
      orderBy: { closingRank: "asc" },
    });

    const strongMatches: PredictionMatch[] = [];
    const possibleMatches: PredictionMatch[] = [];
    const reachMatches: PredictionMatch[] = [];

    for (const cutoff of cutoffs) {
      const { closingRank, openingRank, college, collegeCourse, examName, year, quota } = cutoff;

      let tier: "STRONG" | "POSSIBLE" | "REACH" | null = null;
      let matchScore = 50;
      let rationale = "";

      // Tiering algorithm
      if (rank <= Math.round(closingRank * 0.90)) {
        tier = "STRONG";
        matchScore = Math.min(98, Math.round(100 - (rank / closingRank) * 20));
        rationale = `Your ${examName.replace("_", " ")} rank of ${rank.toLocaleString()} is safely within the historical cutoff window (${openingRank.toLocaleString()} – ${closingRank.toLocaleString()}) for ${college.shortName || college.name}. High admission probability.`;
      } else if (rank > Math.round(closingRank * 0.90) && rank <= Math.round(closingRank * 1.15)) {
        tier = "POSSIBLE";
        matchScore = Math.round(75 - Math.abs(rank - closingRank) / 200);
        rationale = `Your rank of ${rank.toLocaleString()} is close to the historical closing rank boundary of ${closingRank.toLocaleString()}. Favorable outcome in spot rounds or later JoSAA/State counseling rounds.`;
      } else if (rank > Math.round(closingRank * 1.15) && rank <= Math.round(closingRank * 1.45)) {
        tier = "REACH";
        matchScore = Math.max(20, Math.round(45 - (rank - closingRank) / 500));
        rationale = `Target / Reach match. Historical closing rank is ${closingRank.toLocaleString()}. May require category fluctuations or upgraded seats in final counseling rounds.`;
      }

      if (!tier) continue;

      const item: PredictionMatch = {
        matchTier: tier,
        matchScore,
        rationale,
        college: {
          id: college.id,
          slug: college.slug,
          name: college.name,
          shortName: college.shortName,
          city: college.city,
          state: college.state,
          institutionType: college.institutionType,
          overallRating: college.overallRating,
          avgPackage: college.avgPackage,
          minFee: college.minFee,
        },
        course: collegeCourse?.course
          ? {
              code: collegeCourse.course.code,
              name: collegeCourse.course.name,
              degree: collegeCourse.course.degree,
            }
          : undefined,
        cutoffInfo: {
          examName,
          category: cutoff.category,
          openingRank,
          closingRank,
          year,
          quota,
        },
      };

      if (tier === "STRONG") strongMatches.push(item);
      else if (tier === "POSSIBLE") possibleMatches.push(item);
      else if (tier === "REACH") reachMatches.push(item);
    }

    return {
      strongMatches,
      possibleMatches,
      reachMatches,
      totalEvaluated: cutoffs.length,
    };
  }
}
