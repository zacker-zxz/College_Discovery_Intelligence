// Vitest bootstrap: loads project .env (vitest does not auto-load it like
// Next.js does), then falls back to safe CI placeholders. Real environment
// variables always take precedence over .env values.
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\r\n]*)"?\s*$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2];
    }
  }
}

// CI overrides DATABASE_URL via workflow env; the placeholder only applies
// when neither the environment nor .env provided a value.
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/campuslens_test";
process.env.AUTH_SECRET ??= "test_secret_key_for_vitest_at_least_32_chars_long";
