import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/EventParts";
import { JsonLd } from "@/components/JsonLd";
import { OpportunitiesFeed } from "@/components/OpportunitiesFeed";
import { HeroOrbits } from "@/components/Orbits";
import { breadcrumbSchema, opportunityCollectionSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

export const metadata: Metadata = {
  title: "Opportunities and Career Hub",
  description:
    "Curated directory of student internships, SIWES industrial training placements, undergraduate research grants, tech scholarships, and graduate career programmes at the Faculty of Computing, University of Uyo.",
  keywords: [
    "NACOS UNIUYO opportunities",
    "University of Uyo computing jobs",
    "SIWES placements Uyo",
    "computing scholarships Nigeria",
    "student internships Akwa Ibom",
    "graduate trainee programmes",
    "Faculty of Computing career hub",
  ],
  alternates: { canonical: "/opportunities" },
  openGraph: {
    ...ogDefaults,
    url: "/opportunities",
    title: "Opportunities and Career Hub · NACOS UNIUYO",
    description:
      "Explore SIWES placements, scholarships, internships, and verified computing career opportunities across the University of Uyo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Opportunities and Career Hub · NACOS UNIUYO",
    description:
      "Explore SIWES placements, scholarships, internships, and verified computing career opportunities across the University of Uyo.",
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
      <section className="relative bg-[var(--forest)] text-white overflow-hidden min-h-[min(780px,calc(100svh-80px))] flex items-center py-[clamp(64px,8vw,100px)]" aria-labelledby="opportunities-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ CAREERS }" />

        <div className="wrap relative flex flex-col gap-6 w-full">
          <Breadcrumbs items={[{ name: "NACOS UNIUYO", path: "/" }, { name: "Opportunities" }]} />

          <h1 id="opportunities-hero-title" className="serif m-0 text-[clamp(42.6px,6.6vw,91.8px)] leading-[0.95] tracking-[-0.02em]">
            Student <span className="gold">Opportunities &amp; Careers</span>
          </h1>
          <p className="m-0 max-w-[620px] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-[var(--mint-2)]">
            Industrial training slots, faculty research grants, scholarships, and verified technical
            employment openings curated for computing students and graduates of the University of Uyo.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Opportunities Feed">
        <div className="wrap">
          <OpportunitiesFeed
            initialOpportunities={opportunities}
            departments={departments}
          />
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Opportunities", path: "/opportunities" },
          ]),
          opportunityCollectionSchema(opportunities),
        ]}
      />
    </>
  );
}
