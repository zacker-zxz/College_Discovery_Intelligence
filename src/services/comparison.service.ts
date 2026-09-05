import { prisma } from "@/lib/prisma";

export interface ComparisonMatrixItem {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  institutionType: string;
  ownership: string;
  city: string;
  state: string;
  establishmentYear: number | null;
  nirfRank: number | null;
  overallRating: number;
  minFee: number | null;
  maxFee: number | null;
  avgPackage: number | null;
  highestPackage: number | null;
  placementRate: number | null;
  courses: {
    code: string;
    name: string;
    degree: string;
    annualTuition: number | null;
  }[];
  highlights: {
    isLowestFee?: boolean;
    isHighestAvgPackage?: boolean;
    isTopRated?: boolean;
    isBestRanked?: boolean;
  };
}

export class ComparisonService {
  static async compareColleges(collegeIds: string[]): Promise<ComparisonMatrixItem[]> {
    if (collegeIds.length < 2 || collegeIds.length > 3) {
      throw new Error("Comparison requires between 2 and 3 colleges.");
    }

    const colleges = await prisma.college.findMany({
      where: {
        id: { in: collegeIds },
      },
      include: {
        courses: {
          include: { course: true },
        },
      },
    });

    if (colleges.length !== collegeIds.length) {
      throw new Error("One or more selected colleges were not found.");
    }

    // Determine comparative highlights
    let minFeeVal = Infinity;
    let maxAvgPkgVal = -1;
    let maxRatingVal = -1;
    let minNirfVal = Infinity;

    colleges.forEach((c) => {
      if (c.minFee && c.minFee < minFeeVal) minFeeVal = c.minFee;
      if (c.avgPackage && c.avgPackage > maxAvgPkgVal) maxAvgPkgVal = c.avgPackage;
      if (c.overallRating && c.overallRating > maxRatingVal) maxRatingVal = c.overallRating;
      if (c.nirfRank && c.nirfRank < minNirfVal) minNirfVal = c.nirfRank;
    });

    return colleges.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      shortName: c.shortName,
      institutionType: c.institutionType,
      ownership: c.ownership,
      city: c.city,
      state: c.state,
      establishmentYear: c.establishmentYear,
      nirfRank: c.nirfRank,
      overallRating: c.overallRating,
      minFee: c.minFee,
      maxFee: c.maxFee,
      avgPackage: c.avgPackage,
      highestPackage: c.highestPackage,
      placementRate: c.placementRate,
      courses: c.courses.map((cc) => ({
        code: cc.course.code,
        name: cc.course.name,
        degree: cc.course.degree,
        annualTuition: cc.annualTuition,
      })),
      highlights: {
        isLowestFee: Boolean(c.minFee && c.minFee === minFeeVal),
        isHighestAvgPackage: Boolean(c.avgPackage && c.avgPackage === maxAvgPkgVal),
        isTopRated: Boolean(c.overallRating && c.overallRating === maxRatingVal),
        isBestRanked: Boolean(c.nirfRank && c.nirfRank === minNirfVal),
      },
    }));
  }
}
