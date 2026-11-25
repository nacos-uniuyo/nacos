import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/EventParts";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { ProjectsGallery } from "@/components/ProjectsGallery";
import { breadcrumbSchema, projectCollectionSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

export const metadata: Metadata = {
  title: "Student and Faculty Project Showcase",
  description:
    "Searchable gallery of student innovations, coursework group projects, embedded systems, cybersecurity tools, and academic research across the five departments of the Faculty of Computing, University of Uyo.",
  keywords: [
    "NACOS UNIUYO projects",
    "University of Uyo computing projects",
    "Faculty of Computing student showcase",
    "CYB 411",
    "CSC 415",
    "INS 412",
    "embedded systems",
    "cybersecurity",
    "software engineering",
    "student research",
  ],
  alternates: { canonical: "/projects" },
  openGraph: {
    ...ogDefaults,
    url: "/projects",
    title: "Student and Faculty Project Showcase · NACOS UNIUYO",
    description:
      "Discover student innovations, embedded hardware, cybersecurity tools, and software systems built at the Faculty of Computing, University of Uyo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Student and Faculty Project Showcase · NACOS UNIUYO",
    description:
      "Discover student innovations, embedded hardware, cybersecurity tools, and software systems built at the Faculty of Computing, University of Uyo.",
  },
};

export default async function ProjectsPage() {
  const caller = appRouter.createCaller({ session: null });
  const [projects, departments] = await Promise.all([
    caller.project.list(),
    caller.department.list(),
  ]);

  return (
    <>
      <section className="relative bg-[var(--forest)] text-white overflow-hidden min-h-[min(780px,calc(100svh-80px))] flex items-center py-[clamp(64px,8vw,100px)]" aria-labelledby="projects-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ PROJECTS }" />

        <div className="wrap relative flex flex-col gap-6 w-full">
          <Breadcrumbs items={[{ name: "NACOS UNIUYO", path: "/" }, { name: "Projects" }]} />

          <h1 id="projects-hero-title" className="serif m-0 text-[clamp(42.6px,6.6vw,91.8px)] leading-[0.95] tracking-[-0.02em]">
            What We <span className="gold">Build &amp; Ship</span>
          </h1>
          <p className="m-0 max-w-[620px] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-[var(--mint-2)]">
            Verified software platforms, passive threat monitors, ESP32 hardware rigs, and coursework group
            engineering built by computing students and faculty teams at the University of Uyo.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Project Showcase Directory">
        <div className="wrap">
          <Suspense fallback={null}>
            <ProjectsGallery initialProjects={projects} departments={departments} />
          </Suspense>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Projects", path: "/projects" },
          ]),
          projectCollectionSchema(projects),
        ]}
      />
    </>
  );
}
