import { db } from "../db";
import type { PlatformSettingValue } from "../db/json";
import { platformSetting } from "../db/schema";
import { DEANS_MESSAGE_KEY } from "../server/queries/leadership";

/**
 * Inserts the Dean's message the homepage launched with. It only inserts when no message
 * exists yet, so it is safe to run against production and never overwrites an admin's edit.
 *
 * Run once per database with: bun scripts/seed-deans-message.ts
 */
const initialMessage = {
  kind: "deans_message",
  heading: "Welcome to the Faculty of Computing",
  body: "On behalf of the faculty and leadership of the University of Uyo, I welcome both returning students and fresh minds stepping into the world of computing. Our commitment is to foster genuine technical capacity, ethical leadership, and impactful innovation. Engage deeply with your studies, collaborate across departments, and build tools that solve tangible problems for our society.",
  authorName: "Prof. Uduak A. Umoh",
  authorTitle: "Dean, Faculty of Computing",
} satisfies PlatformSettingValue;

async function main() {
  const inserted = await db
    .insert(platformSetting)
    .values({ key: DEANS_MESSAGE_KEY, valueJson: initialMessage })
    .onConflictDoNothing({ target: platformSetting.key })
    .returning({ key: platformSetting.key });

  console.log(
    inserted.length > 0
      ? "Dean's message inserted."
      : "A Dean's message already exists, so nothing was changed.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
