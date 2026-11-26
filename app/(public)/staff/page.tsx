import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/EventParts";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { StaffCard } from "@/components/StaffCard";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

const description =
  "Official directory of academic and administrative staff across the Faculty of Computing, University of Uyo: leadership, departmental heads, lecturers, and faculty technologists.";

export const metadata: Metadata = {
  title: "Staff Directory · Faculty of Computing, NACOS UNIUYO",
  description,
  alternates: { canonical: "/staff" },
  openGraph: {
    ...ogDefaults,
    title: "Staff Directory · Faculty of Computing, NACOS UNIUYO",
    description,
    url: "/staff",
  },
};

export default async function StaffPage() {
  const caller = appRouter.createCaller({ session: null });
  const [allStaff, departments] = await Promise.all([
    caller.roster.staff(),
    caller.department.list(),
  ]);

  const deptMap = new Map(departments.map((d) => [d.slug, d.name]));

  return (
    <>
      <section className="relative bg-[var(--forest)] text-white overflow-hidden min-h-[min(780px,calc(100svh-80px))] flex items-center py-[clamp(64px,8vw,100px)]" aria-labelledby="staff-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ FACULTY STAFF }" className="hero-orbits fade" />
        <div className="wrap relative flex flex-col gap-6 w-full">
          <Breadcrumbs items={[{ name: "NACOS UNIUYO", path: "/" }, { name: "Staff" }]} />
          <span className="eyebrow on-dark caps fade d1">Faculty Directory</span>
          <h1 id="staff-title" className="serif m-0 text-[clamp(42.6px,6.6vw,91.8px)] leading-[0.95] tracking-[-0.02em]">
            <span className="line">
              <span className="rise d1">Academic &amp; Administrative</span>
            </span>
            <span className="line">
              <span className="rise d2 gold">Staff</span>
            </span>
          </h1>
          <p className="fade d3 m-0 max-w-[640px] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-[var(--mint-2)]">
            Faculty leadership, departmental heads, research advisers, and technologists serving the computing
            community at the University of Uyo.
          </p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Staff directory">
        <div className="wrap">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {allStaff.map((person, index) => (
              <StaffCard
                key={person.slug}
                person={person}
                index={index}
                priority={index < 3}
                departmentName={person.departmentSlug ? deptMap.get(person.departmentSlug) : null}
              />
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Staff", path: "/staff" },
          ]),
        ]}
      />
    </>
  );
}
