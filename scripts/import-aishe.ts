/**
 * AISHE College Directory Importer
 * ---------------------------------
 * Ingests the two official AISHE Excel exports:
 *   - College-Affiliated College.xlsx        (~49,600 rows)
 *   - College-Constituent _ University College.xlsx (~2,500 rows)
 *
 * Strategy:
 *   1. Parse & normalize every row (slug, ownership, type mapping).
 *   2. Match against existing curated colleges by normalized name —
 *      enriches them with AISHE metadata instead of duplicating.
 *   3. Batch-insert new colleges via createMany (fast for 50k+ rows).
 *
 * Run: npm run data:aishe
 * Requires: the two .xlsx files in scripts/data/
 */
import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

const FILES = [
  { file: "College-Affiliated College.xlsx", type: "AFFILIATED_COLLEGE", label: "Affiliated College" },
  { file: "College-Constituent _ University College.xlsx", type: "CONSTITUENT_COLLEGE", label: "Constituent / University College" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mapOwnership(management: string): string {
  if (/government|local body/i.test(management)) return "PUBLIC";
  if (/aided/i.test(management)) return "GOVT_AIDED";
  return "PRIVATE";
}

interface AisheRow {
  aisheCode: string;
  name: string;
  state: string;
  district: string;
  website: string | null;
  establishmentYear: number | null;
  location: string | null;
  collegeType: string;
  management: string | null;
  universityName: string | null;
  universityType: string | null;
}

async function main() {
  console.log("==================================================");
  console.log("     AISHE COLLEGE DIRECTORY IMPORT PIPELINE      ");
  console.log("==================================================\n");

  const dataSource = await prisma.dataSource.upsert({
    where: { sourceName: "AISHE College Directory 2026" },
    update: { retrievedAt: new Date() },
    create: {
      sourceName: "AISHE College Directory 2026",
      sourceUrl: "https://aishe.gov.in/",
      datasetVersion: "2026.1.0",
    },
  });

  // Existing curated colleges by normalized name — enrich, don't duplicate
  const existing = await prisma.college.findMany({
    select: { id: true, name: true, slug: true },
  });
  const existingByName = new Map(existing.map((c) => [normalizeName(c.name), c]));
  const existingSlugs = new Set(existing.map((c) => c.slug));
  const seenAisheCodes = new Set<string>();

  const rows: AisheRow[] = [];
  let enriched = 0;
  let skippedDupe = 0;
  let rejected = 0;

  for (const { file, type } of FILES) {
    const filePath = path.join(process.cwd(), "scripts", "data", file);
    console.log(`[Parser] Reading ${file} ...`);
    const wb = XLSX.readFile(filePath);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const raw: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    // Header row is index 2; data starts at index 3
    for (let i = 3; i < raw.length; i++) {
      const r = raw[i];
      const aisheCode = String(r[0] ?? "").trim();
      let name = String(r[1] ?? "").trim();
      const state = String(r[2] ?? "").trim();
      const district = String(r[3] ?? "").trim();
      const website = String(r[4] ?? "").trim();
      const yearRaw = String(r[5] ?? "").trim();
      const location = String(r[6] ?? "").trim();
      const management = String(r[8] ?? "").trim();
      const universityName = String(r[10] ?? "").trim();
      const universityType = String(r[11] ?? "").trim();

      // Validation: AISHE code, name, state are mandatory
      if (!aisheCode || !name || !state || aisheCode === "-") {
        rejected++;
        continue;
      }

      // Strip numeric code prefix embedded in affiliated college names ("061-NAME")
      name = name.replace(/^\d+-/, "").trim();

      // Deduplicate by AISHE code
      if (seenAisheCodes.has(aisheCode)) {
        skippedDupe++;
        continue;
      }
      seenAisheCodes.add(aisheCode);

      const year = /^\d{4}$/.test(yearRaw) ? parseInt(yearRaw, 10) : null;

      rows.push({
        aisheCode,
        name,
        state,
        district,
        website: website && website !== "-" ? website : null,
        establishmentYear: year,
        location: location && location !== "-" ? location : null,
        collegeType: type,
        management: management && management !== "-" ? management : null,
        universityName: universityName && universityName !== "-" ? universityName : null,
        universityType: universityType && universityType !== "-" ? universityType : null,
      });
    }
    console.log(`[Parser] Parsed ${rows.length} cumulative valid rows from ${file}`);
  }

  console.log(`\n[Validator] Total valid AISHE rows: ${rows.length} (rejected: ${rejected}, dupes: ${skippedDupe})`);

  // Pass 1: enrich existing curated colleges that match by normalized name
  console.log("[Matcher] Enriching existing curated colleges with AISHE metadata...");
  const matchedIds = new Set<string>();
  for (const row of rows) {
    const match = existingByName.get(normalizeName(row.name));
    if (match && !matchedIds.has(match.id)) {
      matchedIds.add(match.id);
      await prisma.college.update({
        where: { id: match.id },
        data: {
          aisheCode: row.aisheCode,
          website: row.website,
          district: row.district,
          location: row.location,
          management: row.management,
          universityName: row.universityName,
          universityType: row.universityType,
          dataSourceId: dataSource.id,
        },
      });
      enriched++;
    }
  }
  console.log(`[Matcher] Enriched ${enriched} existing colleges.`);

  // Pass 2: build insert payload for NEW colleges with unique slugs
  console.log("[Normalizer] Generating slugs and building insert payload...");
  const seenNewNames = new Set<string>();
  const payload: {
    slug: string;
    name: string;
    description: string;
    institutionType: string;
    ownership: string;
    city: string;
    state: string;
    district: string;
    aisheCode: string;
    website: string | null;
    establishmentYear: number | null;
    location: string | null;
    management: string | null;
    universityName: string | null;
    universityType: string | null;
    dataSourceId: string;
  }[] = [];

  for (const row of rows) {
    if (existingByName.has(normalizeName(row.name))) continue; // already enriched
    if (seenNewNames.has(normalizeName(row.name))) continue; // internal dupe
    seenNewNames.add(normalizeName(row.name));

    const baseSlug = slugify(row.name) || slugify(`${row.aisheCode}-${row.name}`);
    let slug = baseSlug;
    if (existingSlugs.has(slug)) slug = `${baseSlug}-${slugify(row.district)}`;
    if (existingSlugs.has(slug)) slug = `${baseSlug}-${row.aisheCode.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (existingSlugs.has(slug)) continue; // extremely unlikely
    existingSlugs.add(slug);

    const yearPart = row.establishmentYear ? ` Established in ${row.establishmentYear}.` : "";
    const univPart = row.universityName ? ` Affiliated to ${row.universityName}.` : "";
    const description = `${row.name} is an ${row.collegeType.replace(/_/g, " ").toLowerCase()} located in ${row.district}, ${row.state}.${yearPart}${univPart} Source: AISHE (All India Survey on Higher Education).`;

    payload.push({
      slug,
      name: row.name,
      description,
      institutionType: row.collegeType,
      ownership: mapOwnership(row.management ?? ""),
      city: row.district || row.state,
      state: row.state,
      district: row.district,
      aisheCode: row.aisheCode,
      website: row.website,
      establishmentYear: row.establishmentYear,
      location: row.location,
      management: row.management,
      universityName: row.universityName,
      universityType: row.universityType,
      dataSourceId: dataSource.id,
    });
  }

  console.log(`[Normalizer] ${payload.length} new colleges to insert.`);

  // Pass 3: batch insert
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < payload.length; i += BATCH) {
    const batch = payload.slice(i, i + BATCH);
    const res = await prisma.college.createMany({ data: batch, skipDuplicates: true });
    inserted += res.count;
    if ((i / BATCH) % 10 === 0) {
      console.log(`[Loader] Progress: ${Math.min(i + BATCH, payload.length)}/${payload.length} batches processed...`);
    }
  }

  console.log("\n==================================================");
  console.log("          AISHE IMPORT SUMMARY REPORT             ");
  console.log("==================================================");
  console.log(` AISHE Rows Parsed      : ${rows.length}`);
  console.log(` Existing Enriched      : ${enriched}`);
  console.log(` New Colleges Inserted  : ${inserted}`);
  console.log(` Rejected (malformed)   : ${rejected}`);
  console.log(` Skipped (duplicates)   : ${skippedDupe}`);
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("AISHE Import Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
