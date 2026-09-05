import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface RawCourse {
  code: string;
  name: string;
  degree: string;
  durationYears?: number;
  annualTuition?: number;
  otherFees?: number;
  seatsAvailable?: number;
  eligibility?: string;
}

interface RawPlacement {
  year: number;
  avgPackage: number;
  highestPackage: number;
  medianPackage?: number;
  placementRate: number;
  topRecruiters: string[];
}

interface RawCollege {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  establishmentYear?: number;
  institutionType: string;
  ownership: string;
  affiliation?: string;
  accreditation?: string;
  city: string;
  state: string;
  address?: string;
  pincode?: string;
  nirfRank?: number;
  overallRating?: number;
  reviewCount?: number;
  minFee?: number;
  maxFee?: number;
  avgPackage?: number;
  highestPackage?: number;
  medianPackage?: number;
  placementRate?: number;
  courses: RawCourse[];
  placements: RawPlacement[];
}

interface RawCutoff {
  collegeSlug: string;
  courseCode?: string;
  examName: string;
  year: number;
  category: string;
  quota?: string;
  openingRank: number;
  closingRank: number;
}

export async function runIngestionPipeline() {
  console.log("==================================================");
  console.log("   CAMPUSLENS DATA INGESTION & PIPELINE ENGINE   ");
  console.log("==================================================\n");

  const collegesFilePath = path.join(process.cwd(), "scripts", "data", "colleges.json");
  const cutoffsFilePath = path.join(process.cwd(), "scripts", "data", "cutoffs.json");

  let insertedCount = 0;
  let updatedCount = 0;
  let duplicateCount = 0;
  let rejectedCount = 0;

  // 1. Ensure DataSource linear metadata
  const dataSource = await prisma.dataSource.upsert({
    where: { sourceName: "AISHE & NIRF Public Education Dataset 2024" },
    update: { retrievedAt: new Date() },
    create: {
      sourceName: "AISHE & NIRF Public Education Dataset 2024",
      sourceUrl: "https://www.nirfindia.org/",
      datasetVersion: "2024.2.0",
    },
  });

  // 2. Load & Validate Raw College Data
  const rawCollegesText = fs.readFileSync(collegesFilePath, "utf-8");
  const rawColleges: RawCollege[] = JSON.parse(rawCollegesText);

  console.log(`[Parser] Loaded ${rawColleges.length} raw college records.`);

  const processedSlugs = new Set<string>();

  for (const raw of rawColleges) {
    // Validation Stage
    if (!raw.slug || !raw.name || !raw.city || !raw.state || !raw.institutionType) {
      console.warn(`[Validator] Rejecting invalid college record: ${raw.name || "Unknown"}`);
      rejectedCount++;
      continue;
    }

    // Deduplication Stage
    const normalizedSlug = raw.slug.trim().toLowerCase();
    if (processedSlugs.has(normalizedSlug)) {
      console.warn(`[Deduplicator] Duplicate detected in current payload for slug: ${normalizedSlug}`);
      duplicateCount++;
      continue;
    }
    processedSlugs.add(normalizedSlug);

    // Normalization Stage
    const normalizedCity = raw.city.trim();
    const normalizedState = raw.state.trim();
    const normalizedType = raw.institutionType.toUpperCase();
    const normalizedOwnership = (raw.ownership || "PUBLIC").toUpperCase();

    const existingCollege = await prisma.college.findUnique({
      where: { slug: normalizedSlug },
    });

    const collegeData = {
      name: raw.name.trim(),
      shortName: raw.shortName ? raw.shortName.trim() : null,
      description: raw.description.trim(),
      establishmentYear: raw.establishmentYear || null,
      institutionType: normalizedType,
      ownership: normalizedOwnership,
      affiliation: raw.affiliation || null,
      accreditation: raw.accreditation || null,
      city: normalizedCity,
      state: normalizedState,
      address: raw.address || null,
      pincode: raw.pincode || null,
      nirfRank: raw.nirfRank || null,
      overallRating: raw.overallRating || 4.5,
      reviewCount: raw.reviewCount || 10,
      minFee: raw.minFee || null,
      maxFee: raw.maxFee || null,
      avgPackage: raw.avgPackage || null,
      highestPackage: raw.highestPackage || null,
      medianPackage: raw.medianPackage || null,
      placementRate: raw.placementRate || null,
      dataSourceId: dataSource.id,
    };

    let collegeId = "";

    if (existingCollege) {
      const updated = await prisma.college.update({
        where: { id: existingCollege.id },
        data: collegeData,
      });
      collegeId = updated.id;
      updatedCount++;
      console.log(`[Normalizer/Upsert] Updated college: ${raw.name}`);
    } else {
      const created = await prisma.college.create({
        data: {
          slug: normalizedSlug,
          ...collegeData,
        },
      });
      collegeId = created.id;
      insertedCount++;
      console.log(`[Normalizer/Upsert] Inserted college: ${raw.name}`);
    }

    // Courses Processing
    if (raw.courses && raw.courses.length > 0) {
      for (const courseItem of raw.courses) {
        const normalizedCode = courseItem.code.trim().toUpperCase();
        const course = await prisma.course.upsert({
          where: { code: normalizedCode },
          update: {
            name: courseItem.name.trim(),
            degree: courseItem.degree.toUpperCase(),
          },
          create: {
            code: normalizedCode,
            name: courseItem.name.trim(),
            degree: courseItem.degree.toUpperCase(),
            durationYears: courseItem.durationYears || 4,
          },
        });

        await prisma.collegeCourse.upsert({
          where: {
            collegeId_courseId: {
              collegeId: collegeId,
              courseId: course.id,
            },
          },
          update: {
            annualTuition: courseItem.annualTuition || null,
            otherFees: courseItem.otherFees || null,
            seatsAvailable: courseItem.seatsAvailable || null,
            eligibility: courseItem.eligibility || null,
          },
          create: {
            collegeId: collegeId,
            courseId: course.id,
            annualTuition: courseItem.annualTuition || null,
            otherFees: courseItem.otherFees || null,
            seatsAvailable: courseItem.seatsAvailable || null,
            eligibility: courseItem.eligibility || null,
          },
        });
      }
    }

    // Placements Processing (delete-then-insert keeps re-runs idempotent)
    if (raw.placements && raw.placements.length > 0) {
      for (const p of raw.placements) {
        const existing = await prisma.placementRecord.findFirst({
          where: { collegeId: collegeId, year: p.year },
        });
        if (existing) {
          await prisma.placementRecord.update({
            where: { id: existing.id },
            data: {
              avgPackage: p.avgPackage,
              highestPackage: p.highestPackage,
              medianPackage: p.medianPackage || null,
              placementRate: p.placementRate,
              topRecruiters: JSON.stringify(p.topRecruiters || []),
            },
          });
        } else {
          await prisma.placementRecord.create({
            data: {
              collegeId: collegeId,
              year: p.year,
              avgPackage: p.avgPackage,
              highestPackage: p.highestPackage,
              medianPackage: p.medianPackage || null,
              placementRate: p.placementRate,
              topRecruiters: JSON.stringify(p.topRecruiters || []),
            },
          });
        }
      }
    }
  }

  // 3. Load & Ingest Cutoffs Data
  if (fs.existsSync(cutoffsFilePath)) {
    const rawCutoffsText = fs.readFileSync(cutoffsFilePath, "utf-8");
    const rawCutoffs: RawCutoff[] = JSON.parse(rawCutoffsText);

    console.log(`\n[Cutoffs Ingestion] Processing ${rawCutoffs.length} exam cutoffs...`);

    for (const cutoff of rawCutoffs) {
      const college = await prisma.college.findUnique({
        where: { slug: cutoff.collegeSlug },
      });

      if (!college) {
        console.warn(`[Cutoffs Ingestion] College slug ${cutoff.collegeSlug} not found. Skipping.`);
        continue;
      }

      let collegeCourseId: string | undefined = undefined;
      if (cutoff.courseCode) {
        const course = await prisma.course.findUnique({
          where: { code: cutoff.courseCode.toUpperCase() },
        });
        if (course) {
          const cc = await prisma.collegeCourse.findUnique({
            where: {
              collegeId_courseId: {
                collegeId: college.id,
                courseId: course.id,
              },
            },
          });
          if (cc) collegeCourseId = cc.id;
        }
      }

      // Idempotent: skip if an identical cutoff row already exists
      const existingCutoff = await prisma.examCutoff.findFirst({
        where: {
          collegeId: college.id,
          collegeCourseId: collegeCourseId ?? null,
          examName: cutoff.examName,
          year: cutoff.year,
          category: cutoff.category,
          quota: cutoff.quota || "AI",
        },
      });
      if (existingCutoff) continue;

      await prisma.examCutoff.create({
        data: {
          collegeId: college.id,
          collegeCourseId: collegeCourseId,
          examName: cutoff.examName,
          year: cutoff.year,
          category: cutoff.category,
          quota: cutoff.quota || "AI",
          openingRank: cutoff.openingRank,
          closingRank: cutoff.closingRank,
          dataSourceId: dataSource.id,
        },
      });
    }
  }

  console.log("\n==================================================");
  console.log("            DATA INGESTION SUMMARY REPORT         ");
  console.log("==================================================");
  console.log(` Total Payload Processed : ${rawColleges.length}`);
  console.log(` Records Inserted       : ${insertedCount}`);
  console.log(` Records Updated        : ${updatedCount}`);
  console.log(` Duplicates Handling    : ${duplicateCount}`);
  console.log(` Rejected Malformed     : ${rejectedCount}`);
  console.log("==================================================\n");
}

// Execute when run directly (not when imported as a module)
if (require.main === module) {
  runIngestionPipeline()
    .catch((e) => {
      console.error("Data Ingestion Pipeline Error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
