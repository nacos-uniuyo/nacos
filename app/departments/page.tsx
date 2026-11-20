import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UniuyoCrest } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

export const metadata: Metadata = {
  title: "Computing Departments",
  description:
    "Explore the five academic departments of the Faculty of Computing, University of Uyo: Computer Science, Cybersecurity, Information Systems, Data Analytics, and Software Engineering.",
  alternates: { canonical: "/departments" },
  openGraph: {
    ...ogDefaults,
    url: "/departments",
    title: "Computing Departments · NACOS UNIUYO",
    description:
      "Explore the five academic departments of the Faculty of Computing, University of Uyo.",
  },
};

export default async function DepartmentsIndexPage() {
  const caller = appRouter.createCaller({ session: null });
  const departments = await caller.department.list();

  return (
    <>
      <section className="page-hero" aria-labelledby="depts-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ 5 DEPARTMENTS }" />
        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Departments</li>
            </ol>
          </nav>

          <div className="hero-cobrand-pill">
            <UniuyoCrest size={20} />
            <span className="caps">Faculty of Computing · University of Uyo</span>
          </div>

          <h1 id="depts-title" className="serif">
            Five Autonomous <span className="it gold">Department Hubs</span>
          </h1>
          <p>
            Each department in the Faculty of Computing maintains its own dedicated hub featuring its Head of
            Department, academic staff directory, student executive officers, coursework projects, and alumni.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="All Computing Departments">
        <div className="wrap">
          <div className="dept-hubs-grid">
            {departments.map((dept, index) => (
              <Link
                key={dept.slug}
                href={`/departments/${dept.slug}`}
                className="dept-hub-card card reveal"
              >
                <div className="dept-hub-top">
                  <span className="caps dept-code-badge">{dept.shortName}</span>
                  <span className="caps dept-num">0{index + 1}</span>
                </div>
                <div className="dept-hub-body">
                  <h2 className="serif dept-hub-name">{dept.name}</h2>
                  <p className="dept-hub-summary">{dept.summary}</p>
                </div>
                <div className="dept-hub-foot">
                  <div className="dept-hod">
                    <span className="caps text-[10px] text-[var(--muted)]">Head of Department</span>
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      {dept.hodName ?? "Faculty Leadership"}
                    </span>
                  </div>
                  <span className="dept-hub-arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Departments", path: "/departments" },
        ])}
      />
    </>
  );
}
