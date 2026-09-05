// Vitest bootstrap: ensures required environment variables exist even when
// .env is absent (e.g. CI). Uses a placeholder Postgres URL; CI overrides it
// with the real service connection string via DATABASE_URL env var.
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/campuslens_test";
process.env.AUTH_SECRET ??= "test_secret_key_for_vitest_at_least_32_chars_long";
