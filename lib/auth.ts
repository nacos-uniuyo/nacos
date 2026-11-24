import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { env } from "@/env";

/**
 * The single Better Auth instance. Google is the only provider: the portal is
 * for NACOSites and faculty, not the general public.
 *
 * `role`, `departmentId` and `regNumber` are server-owned. `input: false` stops
 * a Google profile, or anyone calling the auth API directly, from writing them;
 * only an admin or a database update can.
 */
export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["localhost:3000", "localhost:3001", "127.0.0.1:3000", "nnacos.vercel.app"],
    fallback: env.BETTER_AUTH_URL,
  },
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["user", "department_editor", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
      departmentId: { type: "string", required: false, input: false },
      regNumber: { type: "string", required: false, input: false },
    },
  },
  advanced: {
    database: { generateId: "uuid" },
  },
  // Server actions cannot set cookies themselves, so this plugin has to be last.
  plugins: [nextCookies()],
});
