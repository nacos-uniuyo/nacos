import { eq } from "drizzle-orm";
import { db } from "@/db";
import { platformSetting } from "@/db/schema";
import { deansMessageSummary } from "@/server/contracts";

/** The platform_setting key that holds the Dean's message. */
export const DEANS_MESSAGE_KEY = "deans_message";

/**
 * Shared reader for the Dean's message saved by faculty admins. Returns null until a valid one
 * has been saved, so the homepage leaves the section out and the editor opens empty, ready to
 * overwrite a malformed row instead of failing on it.
 */
export async function getDeansMessage() {
  const [row] = await db
    .select({ value: platformSetting.valueJson })
    .from(platformSetting)
    .where(eq(platformSetting.key, DEANS_MESSAGE_KEY))
    .limit(1);

  if (!row || row.value.kind !== "deans_message") return null;
  const parsed = deansMessageSummary.safeParse(row.value);
  return parsed.success ? parsed.data : null;
}
