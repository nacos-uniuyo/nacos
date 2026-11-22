import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DepartmentHubTabs } from "@/components/DepartmentHubTabs";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const list = await caller.department.list();
  return list.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });
  const dept = await caller.department.bySlug({ slug });

  if (!dept) {
    return { title: "Department Not Found" };
  }

  const title = `Department of ${dept.name}`;
  const description = `${dept.summary} Explore executive officers, staff, student projects, alumni spotlights, and notices for ${dept.name} at the University of Uyo.`;

  return {
    title,
    description,
    alternates: { canonical: `/departments/${dept.slug}` },
    openGraph: {
      ...ogDefaults,
      url: `/departments/${dept.slug}`,
      title: `${title} · NACOS UNIUYO`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · NACOS UNIUYO`,
      description,
    },
  };
}

export default async function DepartmentHubPage({ params }: Props) {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });

  const [department, _allDepartments, allSessions, currentSession, deptProjects, allOpportunities, posts] =
    await Promise.all([
      caller.department.bySlug({ slug }),
      caller.department.list(),
      caller.session.list(),
      caller.session.current(),
      caller.project.list({ departmentSlug: slug }),
      caller.opportunity.list(),
      caller.post.list(),
    ]);

  if (!department) {
    notFound();
  }

  const rostersBySession = await Promise.all(
    allSessions.map((s) => caller.roster.bySession({ sessionSlug: s.slug })),
  );
  const allRosterEntries = rostersBySession.flat();

  const activeSessionSlug = currentSession?.slug ?? allSessions[0]?.slug ?? "2024-2025";

  const initialOfficers = allRosterEntries.filter(
    (person) =>
      person.sessionSlug === activeSessionSlug &&
      person.departmentSlug === department.slug &&
      person.tier !== "alumni" &&
      person.tier !== "staff",
  );

  const initialAlumni = allRosterEntries.filter(
    (person) => person.departmentSlug === department.slug && person.tier === "alumni",
  );

  const scopedOpportunities = allOpportunities.filter(
    (opp) => !opp.departmentSlug || opp.departmentSlug === department.slug,
  );

  return (
    <>
      {/* Department Hero */}
      <section className="relative bg-[var(--forest)] text-white overflow-hidden py-[clamp(64px,8vw,92px)] flex items-center" aria-labelledby="dept-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label={`{ ${department.name} · UNIUYO }`} />

        <div className="wrap relative flex flex-col gap-6 w-full">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol className="list-none flex flex-wrap gap-2 m-0 p-0 text-[13px] text-[var(--mint)]">
              <li>
                <Link href="/" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Home</Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-white/30">/</span>
                <Link href="/departments" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Departments</Link>
              </li>
              <li className="flex items-center gap-2" aria-current="page">
                <span className="text-white/30">/</span>
                <span className="text-white">{department.name}</span>
              </li>
            </ol>
          </nav>

          <h1 id="dept-hero-title" className="serif m-0 text-[clamp(52px,8vw,112px)] leading-[0.95] tracking-[-0.02em]">
            Department of <span className="it gold">{department.name}</span>
          </h1>

          <div className="max-w-[680px]">
            <RichTextRenderer
              doc={department.summary}
              className="text-[clamp(17px,1.7vw,19.5px)] leading-relaxed text-[var(--mint-2)]"
            />
          </div>

          {/* Key Department Stats */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-12 pt-9 border-t border-white/12">
            <div className="flex flex-col-reverse justify-end gap-1.5">
              <dt className="caps text-[10.5px] text-[var(--mint)]">Head of Department</dt>
              <dd className="serif m-0 text-[clamp(26px,3vw,40px)] leading-none text-white">{department.hodName ?? "Faculty Leadership"}</dd>
            </div>
            <div className="flex flex-col-reverse justify-end gap-1.5">
              <dt className="caps text-[10.5px] text-[var(--mint)]">Active Session Officers</dt>
              <dd className="serif m-0 text-[clamp(26px,3vw,40px)] leading-none text-white">{initialOfficers.length}</dd>
            </div>
            <div className="flex flex-col-reverse justify-end gap-1.5">
              <dt className="caps text-[10.5px] text-[var(--mint)]">
                {deptProjects.length === 1 ? "Showcased Project" : "Showcased Projects"}
              </dt>
              <dd className="serif m-0 text-[clamp(26px,3vw,40px)] leading-none text-white">{deptProjects.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Tabbed Sections */}
      <section className="pb-[var(--section-y)]" aria-label={`${department.name} Department Hub`}>
        <DepartmentHubTabs
          department={department}
          currentSession={currentSession}
          allSessions={allSessions}
          initialOfficers={initialOfficers}
          initialAlumni={initialAlumni}
          initialProjects={deptProjects}
          initialOpportunities={scopedOpportunities}
          initialPosts={posts}
        />
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Departments", path: "/departments" },
          { name: department.name, path: `/departments/${department.slug}` },
        ])}
      />
    </>
  );
}
