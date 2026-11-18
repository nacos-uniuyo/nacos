import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/env";
import * as schema from "./schema";

/**
 * The pooled Neon endpoint over the HTTP driver. HTTP is the right transport on
 * Vercel: no connection pool to exhaust, no cold-start TCP handshake, and each
 * query is a single fetch. Migrations go through DATABASE_URL_UNPOOLED instead,
 * because DDL on a pooled connection is unreliable.
 */
const sql = neon(env.DATABASE_URL);

export const db = drizzle({ client: sql, schema });
