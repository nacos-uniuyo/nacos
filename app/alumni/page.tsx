import type { Metadata } from "next";
import Link from "next/link";
import { UniuyoCrest } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { YearbookView } from "@/components/YearbookView";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import type { PersonSummary } from "@/server/contracts";
import { appRouter } from "@/server/routers";

export const metadata: Metadata = {
  title: "Faculty Alumni Directory",
  description:
    "Searchable directory of University of Uyo Faculty of Computing alumni and past cohort leaders connecting graduates with current undergraduates for career networking and mentorship.",
  alternates: { canonical: "/alumni" },
  openGraph: {
    ...ogDefaults,
    url: "/alumni",
    title: "Faculty Alumni Directory · NACOS UNIUYO",
    description:
      "Connect with University of Uyo Faculty of Computing alumni for industry mentorship and career networking.",
  },
};

export default async function AlumniDirectoryPage() {
  const caller = appRouter.createCaller({ session: null });
  const [sessions, departments] = await Promise.all([
    caller.session.list(),
    caller.department.list(),
  ]);

  const rosterEntries = await Promise.all(
    sessions.map(async (s) => [s.slug, await caller.roster.bySession({ sessionSlug: s.slug })] as const),
  );
  const initialRosterBySession: Record<string, PersonSummary[]> = Object.fromEntries(rosterEntries);

  return (
    <>
      <nav className="subnav" aria-label="Alumni and Yearbook Navigation">
        <div className="wrap">
          <ul>
            <li>
              <Link href="/yearbook">Living Digital Yearbook</Link>
            </li>
            <li>
              <Link href="/alumni" aria-current="page">
                Faculty Alumni Directory
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <section className="page-hero" aria-labelledby="alumni-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ ALUMNI }" />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Alumni Directory</li>
            </ol>
          </nav>

          <div className="hero-cobrand-pill">
            <UniuyoCrest size={20} />
            <span className="caps">Mentorship, Industry Network &amp; Graduate Archive</span>
          </div>

          <h1 id="alumni-hero-title" className="serif">
            Faculty <span className="it gold">Alumni Directory</span>
          </h1>
          <p>
            Connecting past graduates and cohort pioneers across Computer Science, Cybersecurity, Information
            Systems, Data Analytics, and Software Engineering with current UNIUYO undergraduates.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Alumni Directory Search">
        <div className="wrap">
          <YearbookView
            mode="alumni"
            sessions={sessions}
            departments={departments}
            initialRosterBySession={initialRosterBySession}
          />
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Alumni Directory", path: "/alumni" },
        ])}
      />
    </>
  );
}
