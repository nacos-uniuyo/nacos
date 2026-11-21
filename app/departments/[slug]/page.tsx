import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import uniuyoLogo from "@/assets/images/uniuyo-circle.png";
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

  const [department, allDepartments, allSessions, currentSession, deptProjects, allOpportunities, posts] =
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
      person.tier !== "alumni",
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
      <section className="page-hero dept-hero" aria-labelledby="dept-hero-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label={`{ ${department.name} · UNIUYO }`} />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/departments">Departments</Link>
              </li>
              <li aria-current="page">{department.name}</li>
            </ol>
          </nav>

          <h1 id="dept-hero-title" className="serif">
            Department of <span className="it gold">{department.name}</span>
          </h1>

          <div className="dept-hero-overview">
            <RichTextRenderer
              doc={department.summary}
              className="text-[clamp(17px,1.7vw,19.5px)] leading-relaxed text-[var(--mint-2)]"
            />
          </div>

          {/* Key Department Stats */}
          <dl className="dept-hero-stats">
            <div className="dept-hero-stat">
              <dt className="caps">Head of Department</dt>
              <dd className="serif">{department.hodName ?? "Faculty Leadership"}</dd>
            </div>
            <div className="dept-hero-stat">
              <dt className="caps">Active Session Officers</dt>
              <dd className="serif">{initialOfficers.length}</dd>
            </div>
            <div className="dept-hero-stat">
              <dt className="caps">
                {deptProjects.length === 1 ? "Showcased Project" : "Showcased Projects"}
              </dt>
              <dd className="serif">{deptProjects.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Tabbed Sections */}
      <section className="dept-hub-body-section" aria-label={`${department.name} Department Hub`}>
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
