import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { YearbookGallery } from "@/components/YearbookGallery";
import { breadcrumbSchema, yearbookCollectionSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

export const metadata: Metadata = {
  title: "Faculty Alumni Archive & Digital Yearbook",
  description:
    "Permanent living yearbook and alumni directory honoring graduating cohorts, valedictorians, and student innovators across the Faculty of Computing, University of Uyo.",
  keywords: [
    "NACOS UNIUYO alumni",
    "Faculty of Computing yearbook",
    "University of Uyo computing graduates",
    "Computer Science alumni Uyo",
    "living yearbook UNIUYO",
    "computing valedictorians",
    "alumni mentorship network",
  ],
  alternates: { canonical: "/yearbook" },
  openGraph: {
    ...ogDefaults,
    url: "/yearbook",
    title: "Alumni Archive & Digital Yearbook · NACOS UNIUYO",
    description:
      "Permanent living yearbook and alumni directory honoring graduating cohorts and student innovators across the Faculty of Computing, University of Uyo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alumni Archive & Digital Yearbook · NACOS UNIUYO",
    description:
      "Permanent living yearbook and alumni directory honoring graduating cohorts and student innovators across the Faculty of Computing, University of Uyo.",
  },
};

export default async function YearbookPage() {
  const caller = appRouter.createCaller({ session: null });
  const [alumni, departments, sessions] = await Promise.all([
    caller.roster.alumni(),
    caller.department.list(),
    caller.session.list(),
  ]);

  const deptMap = new Map(departments.map((d) => [d.slug, d.name]));

  return (
    <>
      <section className="page-hero" aria-labelledby="yearbook-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ YEARBOOK }" />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">NACOS UNIUYO</Link>
              </li>
              <li aria-current="page">Yearbook &amp; Alumni</li>
            </ol>
          </nav>

          <h1 id="yearbook-hero-title" className="serif">
            Living <span className="it gold">Digital Yearbook</span>
          </h1>
          <p>
            Permanent institutional record and directory of graduating computing cohorts, departmental
            honours, valedictorians, and alumni across the University of Uyo.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Alumni and Yearbook Gallery">
        <div className="wrap">
          <Suspense fallback={null}>
            <YearbookGallery
              initialAlumni={alumni}
              departments={departments}
              sessions={sessions}
            />
          </Suspense>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Yearbook & Alumni", path: "/yearbook" },
          ]),
          yearbookCollectionSchema(
            alumni.map((a) => ({
              fullName: a.fullName,
              slug: a.slug,
              roleTitle: a.roleTitle,
              departmentName: a.departmentSlug ? deptMap.get(a.departmentSlug) : null,
            })),
          ),
        ]}
      />
    </>
  );
}
