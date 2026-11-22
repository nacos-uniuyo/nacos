import { deansMessage } from "@/mocks/portal";
import { deansMessageSummary } from "@/server/contracts";

/**
 * Shared public reader for the Dean's message.
 * Isolates data fetching and validates outputs via Zod.
 */
export function getDeansMessage() {
  return deansMessage === null ? null : deansMessageSummary.parse(deansMessage);
}
