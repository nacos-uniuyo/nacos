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
  title: "Living Digital Yearbook",
  description:
    "Annual graduating cohort archives and session rosters organized by academic session (2024/2025, 2022/2023) and department at the Faculty of Computing, University of Uyo.",
  alternates: { canonical: "/yearbook" },
  openGraph: {
    ...ogDefaults,
    url: "/yearbook",
    title: "Living Digital Yearbook · NACOS UNIUYO",
    description:
      "Graduating cohort archives, honours, personal quotes, and session rosters at the Faculty of Computing, University of Uyo.",
  },
};

export default async function YearbookPage() {
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
              <Link href="/yearbook" aria-current="page">
                Living Digital Yearbook
              </Link>
            </li>
            <li>
              <Link href="/alumni">Faculty Alumni Directory</Link>
            </li>
          </ul>
        </div>
      </nav>

      <section className="page-hero" aria-labelledby="yearbook-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ YEARBOOK }" />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Digital Yearbook</li>
            </ol>
          </nav>

          <div className="hero-cobrand-pill">
            <UniuyoCrest size={20} />
            <span className="caps">Institutional Memory &amp; Graduating Cohorts · UNIUYO</span>
          </div>

          <h1 id="yearbook-hero-title" className="serif">
            Living Digital <span className="it gold">Yearbook</span>
          </h1>
          <p>
            Preserving the records, honours, personal quotes, and leadership appointments of every graduating cohort
            and academic session across the Faculty of Computing, University of Uyo.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Yearbook Cohort Browser">
        <div className="wrap">
          <YearbookView
            mode="yearbook"
            sessions={sessions}
            departments={departments}
            initialRosterBySession={initialRosterBySession}
          />
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Yearbook", path: "/yearbook" },
        ])}
      />
    </>
  );
}
