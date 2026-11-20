import { deansMessage, goodwill } from "@/mocks/portal";
import { deansMessageSummary, goodwillSummary } from "@/server/contracts";

/**
 * Shared public reads for the homepage and tRPC. Replace the fixture reads here
 * with Drizzle queries in F13; the display components need no database knowledge.
 * These mock reads deliberately do not initialize auth or a database connection.
 */
export function getDeansMessage() {
  return deansMessage === null ? null : deansMessageSummary.parse(deansMessage);
}

export function getGoodwillMessages() {
  return goodwill
    .filter((message) => message.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
    .map((message) => goodwillSummary.parse(message));
}
