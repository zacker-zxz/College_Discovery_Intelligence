import { prisma } from "@/lib/prisma";

export class DiscussionService {
  static async getDiscussions(params: { search?: string; collegeId?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (params.search && params.search.trim() !== "") {
      const q = params.search.trim();
      where.OR = [
        { title: { contains: q } },
        { body: { contains: q } },
      ];
    }

    if (params.collegeId) {
      where.collegeId = params.collegeId;
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true } },
          college: { select: { id: true, name: true, slug: true, shortName: true } },
          _count: { select: { answers: true } },
        },
      }),
      prisma.discussion.count({ where }),
    ]);

    return {
      discussions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getDiscussionById(id: string) {
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        college: { select: { id: true, name: true, slug: true, shortName: true } },
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (discussion) {
      // Increment view counter
      await prisma.discussion.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return discussion;
  }

  static async createDiscussion(userId: string, title: string, body: string, collegeId?: string) {
    return await prisma.discussion.create({
      data: {
        title,
        body,
        userId,
        collegeId: collegeId || null,
      },
      include: {
        user: { select: { name: true } },
      },
    });
  }

  static async createAnswer(discussionId: string, userId: string, body: string) {
    return await prisma.answer.create({
      data: {
        discussionId,
        userId,
        body,
      },
      include: {
        user: { select: { name: true, role: true } },
      },
    });
  }
}
