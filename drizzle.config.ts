import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit runs through Bun, which loads .env for us. DDL goes over the
 * unpooled Neon host because migrations on a PgBouncer pool are unreliable.
 */
const url = process.env.DATABASE_URL_UNPOOLED;

if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED is missing. Add it to .env before running Drizzle Kit.");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
