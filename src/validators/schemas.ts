import { z } from "zod";

export const collegeQuerySchema = z.object({
  search: z.string().optional().default(""),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  type: z.string().optional().default(""),
  ownership: z.string().optional().default(""),
  // Comma-separated college UUIDs for direct lookup (comparison workspace)
  ids: z.string().max(250).optional().default(""),
  minFee: z.coerce.number().optional(),
  maxFee: z.coerce.number().optional(),
  minRating: z.coerce.number().optional(),
  minPlacement: z.coerce.number().optional(),
  course: z.string().optional().default(""),
  sort: z.enum(["relevance", "rating", "fee_asc", "fee_desc", "placement", "nirf"]).optional().default("relevance"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address format").toLowerCase().trim(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must be at most 100 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be at most 128 characters long")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required").max(128),
});

export const predictorSchema = z.object({
  exam: z.enum(["JEE_MAIN", "JEE_ADVANCED", "NEET", "GATE", "MHT_CET", "WBJEE"], {
    errorMap: () => ({ message: "Please select a valid entrance examination" }),
  }),
  rank: z.coerce.number().int().positive("Rank must be a positive integer"),
  category: z.enum(["GENERAL", "OBC", "SC", "ST", "EWS"]).optional().default("GENERAL"),
  state: z.string().optional().default(""),
  courseCode: z.string().optional().default(""),
});

export const comparisonSchema = z.object({
  collegeIds: z.array(z.string().uuid("Invalid college ID")).min(2, "Please select at least 2 colleges to compare").max(3, "You can compare up to 3 colleges at a time"),
});

export const discussionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").max(200, "Title must be at most 200 characters"),
  body: z.string().min(10, "Question details must be at least 10 characters long").max(10000, "Body must be at most 10000 characters"),
  collegeId: z.string().uuid("Invalid college reference").optional(),
});

export const answerSchema = z.object({
  body: z.string().min(5, "Answer content must be at least 5 characters long").max(10000, "Answer must be at most 10000 characters"),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(3, "Title must be at least 3 characters").max(150, "Title must be at most 150 characters"),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(5000, "Comment must be at most 5000 characters"),
});

export const savedCollegeSchema = z.object({
  collegeId: z.string().uuid("Invalid college reference"),
});

export const savedComparisonSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  collegeIds: z
    .array(z.string().uuid("Invalid college ID"))
    .min(2, "A comparison needs at least 2 colleges")
    .max(3, "You can compare up to 3 colleges at a time"),
});

export const discussionQuerySchema = z.object({
  search: z.string().max(200, "Search query is too long").optional().default(""),
  collegeId: z.string().uuid("Invalid college reference").optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
