import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { runIngestionPipeline } from "../scripts/import-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CampusLens Database Seed Process...");

  // 1. Run Data Ingestion pipeline directly (no subprocess — Vercel build compatible)
  console.log("📦 Ingesting core college and cutoff dataset...");
  await runIngestionPipeline();

  // 2. Create Demo Users
  console.log("👤 Creating seed users...");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const demoUser = await prisma.user.upsert({
    where: { email: "student@campuslens.edu" },
    update: {},
    create: {
      email: "student@campuslens.edu",
      name: "Aarav Sharma",
      passwordHash: hashedPassword,
      role: "STUDENT",
    },
  });

  const demoAdmin = await prisma.user.upsert({
    where: { email: "admin@campuslens.edu" },
    update: {},
    create: {
      email: "admin@campuslens.edu",
      name: "Dr. Meera Kulkarni",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Created users: ${demoUser.email}, ${demoAdmin.email}`);

  // 3. Create Seed Reviews for IIT Bombay and BITS Pilani
  const iitBombay = await prisma.college.findUnique({ where: { slug: "iit-bombay" } });
  const bitsPilani = await prisma.college.findUnique({ where: { slug: "bits-pilani" } });

  if (iitBombay) {
    await prisma.review.create({
      data: {
        collegeId: iitBombay.id,
        userId: demoUser.id,
        rating: 5,
        title: "Unmatched Academic Atmosphere & Peer Group",
        comment: "The coding culture, tech fests (Techfest), and research infrastructure at IIT Bombay are second to none in India. Professor quality is stellar and campus life at Powai Lake is unforgettable.",
      },
    });
  }

  if (bitsPilani) {
    await prisma.review.create({
      data: {
        collegeId: bitsPilani.id,
        userId: demoUser.id,
        rating: 5,
        title: "Practice School Program Is Game Changing",
        comment: "The zero attendance rule gives huge freedom to pursue open source and research. Practice School II guaranteed a 6-month full-time internship with top product MNCs.",
      },
    });
  }

  // 4. Create Seed Discussions & Answers
  console.log("💬 Creating seed discussion forum posts...");

  const discussion1 = await prisma.discussion.create({
    data: {
      title: "IIT Bombay CSE vs IIIT Hyderabad CSE for pure AI/ML research?",
      body: "I have qualified both and am interested in machine learning & deep learning research. Does IIIT Hyderabad's research center output give it an edge over IIT Bombay's overall legacy brand?",
      userId: demoUser.id,
      collegeId: iitBombay ? iitBombay.id : null,
      views: 142,
    },
  });

  await prisma.answer.create({
    data: {
      discussionId: discussion1.id,
      userId: demoAdmin.id,
      body: "Both are tier-1 choices! If your sole goal is undergraduate research papers in CVPR/ACL, IIIT Hyderabad starts core CS coursework from 1st semester without unnecessary non-CS subjects. However, IIT Bombay offers broader peer networking, alumni reach, and startup incubator access. Choose IIIT for specialized research speed, IITB for overall ecosystem.",
      helpfulCount: 28,
    },
  });

  const discussion2 = await prisma.discussion.create({
    data: {
      title: "What is the actual realistic JEE Main rank needed for NIT Trichy CSE?",
      body: "I am expecting around 99.6 percentile in JEE Main (approx 4500 rank). What are the chances under All India Quota for Open Category?",
      userId: demoUser.id,
      views: 89,
    },
  });

  await prisma.answer.create({
    data: {
      discussionId: discussion2.id,
      userId: demoAdmin.id,
      body: "For General AI quota, NIT Trichy CSE closing rank historically sits around 4800. At 4500 rank, you have a solid 'Strong Match' chance in JoSAA rounds 1 to 5. Keep ECE at NIT Trichy or CSE at NIT Surathkal as safe backups!",
      helpfulCount: 19,
    },
  });

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Script Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
