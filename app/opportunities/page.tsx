import type { Metadata } from "next";
import Link from "next/link";
import { UniuyoCrest } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { OpportunitiesFeed } from "@/components/OpportunitiesFeed";
import { HeroOrbits } from "@/components/Orbits";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

export const metadata: Metadata = {
  title: "Opportunities & SIWES / IT Hub",
  description:
    "Curated industrial training (SIWES/IT) placements, scholarships, student sponsorships, research grants, and graduate jobs for computing students at the University of Uyo.",
  alternates: { canonical: "/opportunities" },
  openGraph: {
    ...ogDefaults,
    url: "/opportunities",
    title: "Opportunities & SIWES / IT Hub · NACOS UNIUYO",
    description:
      "Verified SIWES placements, scholarships, grants, and career opportunities for UNIUYO computing students.",
  },
};

export default async function OpportunitiesPage() {
  const caller = appRouter.createCaller({ session: null });
  const [opportunities, departments] = await Promise.all([
    caller.opportunity.list(),
    caller.department.list(),
  ]);

  return (
    <>
      <section className="page-hero" aria-labelledby="opp-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ SIWES · CAREERS }" />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Opportunities &amp; SIWES</li>
            </ol>
          </nav>

          <div className="hero-cobrand-pill">
            <UniuyoCrest size={20} />
            <span className="caps">Industrial Training, Scholarships &amp; Career Hub</span>
          </div>

          <h1 id="opp-hero-title" className="serif">
            SIWES, Grants &amp; <span className="it gold">Career Doors</span>
          </h1>
          <p>
            Verified six-month industrial training (SIWES/IT) placements, undergraduate research grants, hackathon
            sponsorships, and graduate trainee openings vetted for Faculty of Computing students.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Opportunities Directory">
        <div className="wrap">
          <OpportunitiesFeed initialOpportunities={opportunities} departments={departments} />
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Opportunities", path: "/opportunities" },
        ])}
      />
    </>
  );
}
