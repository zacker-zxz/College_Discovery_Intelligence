import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { collegeQuerySchema } from "@/validators/schemas";
import { fuzzySearchColleges } from "@/lib/fuzzy-search";

export type CollegeQueryParams = z.infer<typeof collegeQuerySchema>;

export class CollegeService {
  static async getColleges(params: CollegeQueryParams) {
    const { search, state, city, type, ownership, minFee, maxFee, minRating, minPlacement, course, sort, page, limit } = params;

    const skip = (page - 1) * limit;

    // Build Prisma Where Clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Fuzzy search: rank matches via Fuse.js, then constrain the DB query to
    // the matched IDs so all other filters still apply server-side.
    let relevanceOrder: string[] | null = null;
    if (search && search.trim() !== "") {
      const matched = await fuzzySearchColleges(search, 500);
      if (matched.length === 0) {
        return {
          colleges: [],
          pagination: { total: 0, page, limit, totalPages: 0, hasMore: false },
        };
      }
      relevanceOrder = matched.map((m) => m.id);
      where.id = { in: relevanceOrder };
    }

    if (state && state.trim() !== "") {
      where.state = { equals: state.trim() };
    }

    if (city && city.trim() !== "") {
      where.city = { equals: city.trim() };
    }

    if (type && type.trim() !== "") {
      where.institutionType = { equals: type.trim().toUpperCase() };
    }

    if (ownership && ownership.trim() !== "") {
      where.ownership = { equals: ownership.trim().toUpperCase() };
    }

    if (minRating) {
      where.overallRating = { gte: minRating };
    }

    if (minPlacement) {
      where.avgPackage = { gte: minPlacement };
    }

    if (minFee || maxFee) {
      where.minFee = {};
      if (minFee) where.minFee.gte = minFee;
      if (maxFee) where.minFee.lte = maxFee;
    }

    if (course && course.trim() !== "") {
      where.courses = {
        some: {
          course: {
            code: { equals: course.trim().toUpperCase() },
          },
        },
      };
    }

    // Build Prisma OrderBy Clause
    // Unranked colleges (nirfRank = null, the bulk of the AISHE directory)
    // sort after curated ranked institutions in the default view.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = [{ nirfRank: { sort: "asc", nulls: "last" } }, { overallRating: "desc" }, { name: "asc" }];

    if (sort === "rating") {
      orderBy = [{ overallRating: "desc" }];
    } else if (sort === "fee_asc") {
      orderBy = [{ minFee: { sort: "asc", nulls: "last" } }];
    } else if (sort === "fee_desc") {
      orderBy = [{ minFee: { sort: "desc", nulls: "last" } }];
    } else if (sort === "placement") {
      orderBy = [{ avgPackage: { sort: "desc", nulls: "last" } }];
    } else if (sort === "nirf") {
      orderBy = [{ nirfRank: { sort: "asc", nulls: "last" } }];
    }

    // ── Fuzzy search path ──
    // Fetch every filter-matching row (bounded at 500 by the fuzzy cap),
    // rank by relevance, then paginate the ranked list in memory.
    if (relevanceOrder) {
      const filtered = await prisma.college.findMany({
        where,
        include: {
          courses: { include: { course: true } },
        },
        take: 500,
      });
      const rank = new Map(relevanceOrder.map((id, i) => [id, i]));
      filtered.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));

      const total = filtered.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      return {
        colleges: filtered.slice(skip, skip + limit),
        pagination: { total, page, limit, totalPages, hasMore: page < totalPages },
      };
    }

    // ── Standard browse/filter path ──
    const [colleges, total] = await Promise.all([
      prisma.college.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          courses: {
            include: {
              course: true,
            },
          },
        },
      }),
      prisma.college.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      colleges,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  static async getCollegeBySlug(slug: string) {
    const college = await prisma.college.findUnique({
      where: { slug },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
        placements: {
          orderBy: { year: "desc" },
        },
        reviews: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        cutoffs: {
          take: 10,
          orderBy: { closingRank: "asc" },
        },
        dataSource: true,
      },
    });

    if (!college) return null;

    // Parse top recruiters JSON string
    const formattedPlacements = college.placements.map((p) => ({
      ...p,
      topRecruiters: typeof p.topRecruiters === "string" ? JSON.parse(p.topRecruiters) : p.topRecruiters,
    }));

    return {
      ...college,
      placements: formattedPlacements,
    };
  }

  static async getSimilarColleges(currentId: string, state: string, institutionType: string) {
    return await prisma.college.findMany({
      where: {
        id: { not: currentId },
        OR: [{ state }, { institutionType }],
      },
      take: 3,
      orderBy: { overallRating: "desc" },
      include: {
        courses: {
          include: { course: true },
        },
      },
    });
  }

  static async getFeaturedColleges() {
    return await prisma.college.findMany({
      take: 4,
      orderBy: [{ nirfRank: "asc" }, { overallRating: "desc" }],
      include: {
        courses: {
          take: 3,
          include: { course: true },
        },
      },
    });
  }
}
