# CampusLens — Production-Grade College Discovery & Decision Intelligence Platform

CampusLens is a commercial-grade, data-driven college discovery, side-by-side comparison, admission prediction, and decision intelligence platform engineered for higher education candidates in India.

Built with **Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, PostgreSQL, and Prisma ORM**.

---

## 🏛️ System Architecture

```
                                 ┌──────────────────────────────────────────────┐
                                 │              Next.js Frontend                │
                                 │  (App Router, React 19, Tailwind CSS UI)     │
                                 └──────────────────────┬───────────────────────┘
                                                        │ HTTP / JSON REST
                                 ┌──────────────────────▼───────────────────────┐
                                 │            API Layer (App Router)            │
                                 │     (Controllers, Zod Input Validation)     │
                                 └──────────────────────┬───────────────────────┘
                                                        │ Domain Calls
                                 ┌──────────────────────▼───────────────────────┐
                                 │             Service / Business Layer         │
                                 │   (SearchService, PredictionService, Auth)   │
                                 └──────────────────────┬───────────────────────┘
                                                        │ Queries
                                 ┌──────────────────────▼───────────────────────┐
                                 │           Data Access Layer (Prisma)         │
                                 └──────────────────────┬───────────────────────┘
                                                        │ SQL
                                  ┌──────────────────────▼───────────────────────┐
                                  │             PostgreSQL (Serverless)          │
                                  │         (Normalized Relational Data)         │
                                  └──────────────────────────────────────────────┘
```

---

## 🌟 Core Product Features

### 1. College Discovery & Search Engine (`/colleges`)
* **Database-Driven Filtering**: Filter by State, City, Institution Type (IIT, NIT, IIIT, State University, Private University), Ownership (Public, Private), Max Fee slider, Min Rating, Min Placement Average (LPA), and Specialization (CSE, EE, ECE, ME, AI).
* **URL Parameter Sync**: All searches and filter states sync directly to the URL query string (e.g. `/colleges?state=Maharashtra&course=CSE&maxFee=200000&sort=placement&page=1`), enabling instant shareability and bookmarking.
* **Server-Side Pagination**: Full offset pagination powered by Prisma database queries.
* **Multi-Factor Sorting**: Sort by NIRF Rank, Rating high-to-low, Fees low-to-high, Fees high-to-low, and Placement Average.

### 2. Side-by-Side Comparison Workspace (`/compare`)
* **Multi-Institution Comparison**: Compare 2 to 3 colleges simultaneously in a side-by-side decision matrix matching official assignment specifications.
* **Automated Highlights**: Highlights lowest tuition fees (*Best Value*), highest placement average (*Top Package*), top rating, and best NIRF ranking.
* **Save Configurations**: Logged-in users can save custom comparison configurations to their account profile.

### 3. Entrance Rank Predictor Engine (`/predictor`)
* **Deterministic Recommendation Logic**: Takes Entrance Exam (JEE Main, JEE Advanced, NEET, GATE, MHT-CET, WBJEE), Rank, Reservation Category, and State Quota as input.
* **Tiered Match Categorization**:
  * **Strong Match**: Rank is safely within the opening-closing cutoff window (`rank <= closingRank * 0.90`).
  * **Possible Match**: Rank is near historical closing boundary (`closingRank * 0.90 < rank <= closingRank * 1.15`).
  * **Target / Reach Match**: Ambitious match requiring category fluctuations (`closingRank * 1.15 < rank <= closingRank * 1.45`).
* **Explainable Rationale**: Every match provides clear text explaining historical admission cutoff bounds.

### 4. Student Discussion & Q&A Forum (`/discussions` and `/discussions/[id]`)
* **Interactive Community Board**: Ask and answer questions regarding admissions, campus life, professor quality, and branch preferences.
* **Official Educator Badges**: Admin and verified educator responses are highlighted with verified badges.

### 5. Authentication & Saved Items (`/login`, `/signup`, `/saved`)
* **Cookie JWT Sessions**: Secure cookie-based JWT authentication with `bcryptjs` password hashing.
* **Saved Colleges & Comparisons**: Save institutions to your personal profile dashboard with 1-click management.

---

## 🔄 Data Ingestion & Quality Pipeline

CampusLens runs two ingestion engines:

### 1. AISHE National Directory Import (`scripts/import-aishe.ts`)
Imports the **complete official AISHE college directory** (52,000+ institutions across 36 states/UTs) from the two Excel exports:
* Enriches curated NIRF-ranked profiles with AISHE metadata (no duplicates)
* Auto-generates descriptions, slugs, and ownership mappings
* Batch-inserts via `createMany` for fast bulk loads
```bash
npm run data:aishe   # requires the two .xlsx files in scripts/data/
```

### 2. Curated Enrichment Pipeline (`scripts/import-data.ts`)
Imports the hand-curated dataset (40 premier institutions with fees, placements, cutoffs, recruiters):
```
 Raw Payload (JSON) ──► Parser ──► Validator ──► Normalizer ──► Deduplicator ──► Prisma Upserts
```

### Pipeline Features:
1. **Validation Stage**: Rejects records with missing mandatory fields or invalid values.
2. **Deduplication Stage**: Detects and merges duplicate institutions based on normalized slugs and names.
3. **Normalization Stage**: Standardizes state names, course codes, degree titles, and currency amounts.
4. **Lineage Tracking**: Ingested records link to a `DataSource` table storing dataset version, source URL, and timestamp.
5. **Execution Summary Report**: Generates stats on inserted, updated, duplicate, and rejected records.

### 🔎 Fuzzy Search Engine
All college queries (autocomplete + directory search) use a two-tier fuzzy engine (`src/lib/fuzzy-search.ts`):
* **Tier 1 — SQL candidates**: token-based `contains` + two-character-prefix matching (makes typo tolerance possible: "bombey" → "bo" → "Bombay")
* **Tier 2 — Fuse.js ranking**: approximate-string scoring across the candidate pool orders results by relevance

---

## 🗄️ Relational Database Schema (Prisma)

* `User`: Student & Admin accounts, password hashes, roles.
* `DataSource`: Ingestion source metadata, versioning, data lineage.
* `College`: Institution metrics, NIRF rank, overall rating, fee ranges, placement stats.
* `Course`: Standardized degree programs (B.Tech, M.Tech, MBA, etc.).
* `CollegeCourse`: Junction table linking colleges to courses with annual tuition, seats, eligibility.
* `PlacementRecord`: Historical placement batches, avg/highest package, top recruiters list.
* `ExamCutoff`: Entrance exam opening & closing ranks by year, category, and quota.
* `Review`: Verified student ratings (1 to 5 stars) and comments.
* `Discussion` & `Answer`: Forum Q&A threads, views, helpful counters.
* `SavedCollege` & `SavedComparison`: User saved bookmarks and comparison matrices.

---

## 📡 API Architecture & Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/colleges` | Search, filter, and paginate colleges |
| `GET` | `/api/colleges/:slug` | Retrieve single detailed college profile |
| `POST` | `/api/colleges/:slug/reviews` | Submit student review & update rating |
| `POST` | `/api/comparisons` | Compute side-by-side matrix for 2–3 colleges |
| `POST` | `/api/predictor` | Run rank prediction algorithm |
| `POST` | `/api/auth/register` | Create user account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT cookie |
| `POST` | `/api/auth/logout` | Clear auth session |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET/POST` | `/api/me/saved-colleges` | List or save colleges to profile |
| `DELETE` | `/api/me/saved-colleges/:id` | Remove saved college |
| `GET/POST` | `/api/me/saved-comparisons` | List or save comparison setups |
| `GET/POST` | `/api/discussions` | List or post new discussion question |
| `GET` | `/api/discussions/:id` | Fetch single question and answers |
| `POST` | `/api/discussions/:id/answers` | Post answer to discussion thread |

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
* Node.js v18+ or v22+
* npm
* PostgreSQL 14+ (local Docker via included `docker-compose.yml`, or a Neon/Supabase cloud DB)
  > SQLite is no longer supported — the app targets serverless Postgres for Vercel compatibility.

### 1. Installation
```bash
git clone https://github.com/Zacker/College_Discovery_Intelligence.git
cd College_Discovery_Intelligence
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in values:
```bash
cp .env.example .env
```
Generate a strong `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

For a local database via Docker:
```bash
docker compose up -d
```

### 3. Sync Database Schema & Seed Data
Run database synchronization and trigger the dataset ingestion pipeline:
```bash
npx prisma db push
npm run db:seed
```

### 4. Launch Local Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

Run Vitest unit and integration tests covering the Predictor Engine, Search Builder, and Comparison Matrix:

```bash
npm run test
```

> Tests require a reachable `DATABASE_URL`. On push, GitHub Actions (`.github/workflows/ci.yml`) runs the full suite against an ephemeral Postgres service container — see the CI check on your PRs.

---

## 🔐 Security Hardening

* **No fallback JWT secret** — the app refuses to start without a strong (32+ char) `AUTH_SECRET`.
* **Rate limiting** on login, registration, and demo-login endpoints (sliding-window, per-IP).
* **Zod input validation** with strict length/UUID constraints on every API route.
* **bcryptjs** password hashing; minimum password policy of 8 chars with letters + numbers.
* **Security headers** (CSP, HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy) via `next.config.ts`.
* **PII protection** — reviewer emails are never exposed by API responses.
* **Demo credentials server-gated** — demo login buttons only appear when `ENABLE_DEMO_ACCOUNTS=true` and credentials never ship to the client bundle.

---

## 🚀 Deployment (Vercel)

CampusLens is production-ready for Vercel + serverless Postgres (Neon recommended). See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the complete step-by-step guide including:
* Required environment variables (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, optional `ENABLE_DEMO_ACCOUNTS`)
* Database provisioning and one-time schema push + seed instructions
* Custom domain setup and post-deploy verification checklist
