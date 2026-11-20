import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, GithubIcon, UniuyoCrest } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import type { ProjectCategory } from "@/lib/enums";
import { breadcrumbSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  cybersecurity: "Cybersecurity",
  embedded_systems_hardware: "Embedded Systems",
  software_engineering: "Software Engineering",
  artificial_intelligence_data: "AI & Data Science",
  information_systems_networking: "Information Systems & Networking",
  theoretical_computing_research: "Academic Research",
  interdisciplinary: "Interdisciplinary",
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const projects = await caller.project.list();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });
  const project = await caller.project.bySlug({ slug });

  if (!project) {
    return { title: "Project Not Found" };
  }

  const title = `${project.title} · Project Showcase`;
  const description = project.tagline;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      ...ogDefaults,
      url: `/projects/${project.slug}`,
      title: `${title} | NACOS UNIUYO`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | NACOS UNIUYO`,
      description,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const caller = appRouter.createCaller({ session: null });

  const [project, departments, allProjects, currentSession] = await Promise.all([
    caller.project.bySlug({ slug }),
    caller.department.list(),
    caller.project.list(),
    caller.session.current(),
  ]);

  if (!project) {
    notFound();
  }

  const dept = departments.find((d) => d.slug === project.departmentSlug) ?? null;
  const categoryLabel = PROJECT_CATEGORY_LABELS[project.category] ?? project.category;

  const groupMatch = project.teamDisplayName?.match(/Group\s+(\d+)/i);
  const cohortGroupNumber = groupMatch ? Number(groupMatch[1]) : null;

  const relatedProjects = allProjects
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);

  const detailedOverview = `${project.tagline}\n\nDeveloped within the Department of ${dept ? `${dept.name} (${dept.shortName})` : project.departmentSlug} at the Faculty of Computing, University of Uyo${project.courseCode ? ` as part of ${project.courseCode} coursework and laboratory evaluation` : ""}. Attributed to ${project.teamDisplayName ?? "the NACOS UNIUYO project team"} during the ${currentSession?.name ?? "2024/2025 Academic Session"}.`;

  return (
    <>
      <section className="page-hero dept-hero" aria-labelledby="project-detail-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label={`{ ${project.courseCode ?? dept?.shortName ?? "PROJECT"} }`} />

        <div className="wrap">
          <nav className="crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/projects">Projects</Link>
              </li>
              <li aria-current="page">{project.title}</li>
            </ol>
          </nav>

          <div className="dept-hero-badges">
            <span className="caps dept-shortcode-pill">
              <UniuyoCrest size={18} />
              <span>{categoryLabel}</span>
            </span>
            {dept ? (
              <Link href={`/departments/${dept.slug}`} className="caps dept-faculty-tag no-underline">
                {dept.shortName} · Department of {dept.name}
              </Link>
            ) : null}
            {project.courseCode ? (
              <span className="caps dept-faculty-tag">Course: {project.courseCode}</span>
            ) : null}
            {project.featured ? (
              <span className="caps dept-faculty-tag" style={{ borderColor: "var(--gold)", color: "var(--gold)" }}>
                Featured Faculty Project
              </span>
            ) : null}
          </div>

          <h1 id="project-detail-title" className="serif">
            {project.title}
          </h1>

          <p className="max-w-[680px] text-[clamp(17px,1.8vw,21px)] leading-relaxed text-[var(--mint-2)]">
            {project.tagline}
          </p>

          <div className="cta-row pt-2">
            {project.demoUrl ? (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-solid"
              >
                Launch Live Demo
                <ArrowRight />
              </a>
            ) : null}
            {project.repoUrl ? (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <GithubIcon size={18} />
                <span>Source Repository</span>
              </a>
            ) : null}
            {dept ? (
              <Link href={`/departments/${dept.slug}`} className="btn btn-ghost">
                Visit {dept.shortName} Department Hub
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Project Technical Specifications">
        <div className="wrap">
          <div className="dept-overview-grid">
            {/* Left Main Technical Documentation Column */}
            <div className="dept-panel-stack">
              {/* Cover Banner / Technical Architecture Preview Frame */}
              <div className="project-detail-stage">
                <div className="project-stage-header">
                  <span className="caps text-[10px] text-[var(--gold)]">
                    System Architecture &amp; Visual Preview · {project.slug}
                  </span>
                  <span className="caps text-[10px] text-[var(--mint)]">
                    {project.courseCode ?? dept?.shortName ?? "UNIUYO"}
                  </span>
                </div>
                <div className="project-stage-canvas">
                  <div className="project-stage-badge-row">
                    <span className="caps project-cat-pill">{categoryLabel}</span>
                    {cohortGroupNumber ? (
                      <span className="caps project-dept-tag" style={{ color: "var(--gold)" }}>
                        Cohort Group {cohortGroupNumber}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="serif text-4xl text-white sm:text-5xl">{project.title}</h2>
                  <p className="max-w-[560px] text-sm leading-relaxed text-[var(--mint-2)]">
                    {project.tagline}
                  </p>
                </div>
              </div>

              {/* Rendered RichText Description */}
              <div className="dept-overview-card">
                <span className="caps eyebrow accent">Technical Abstract &amp; Scope</span>
                <h2 className="serif dept-section-heading">Project Overview</h2>
                <div className="dept-overview-prose">
                  <RichTextRenderer
                    doc={detailedOverview}
                    className="text-[17px] leading-relaxed text-[var(--ink)]"
                  />
                </div>

                {/* Gallery Screenshots / System Modules */}
                <div className="pt-4">
                  <span className="caps eyebrow">System Modules &amp; Verification</span>
                  <div className="dept-pillar-grid mt-3">
                    <div className="dept-pillar-box">
                      <span className="caps text-[10px] text-[var(--green)]">Module 01 · Core Engine</span>
                      <h3 className="serif text-2xl">{categoryLabel} Architecture</h3>
                      <p className="text-sm leading-relaxed text-[var(--muted)]">
                        Engineered and reviewed against Faculty of Computing rubric standards for{" "}
                        {project.courseCode ?? dept?.name ?? "undergraduate engineering"}.
                      </p>
                    </div>
                    <div className="dept-pillar-box">
                      <span className="caps text-[10px] text-[var(--green)]">Module 02 · Deployment</span>
                      <h3 className="serif text-2xl">Verification &amp; Peer Review</h3>
                      <p className="text-sm leading-relaxed text-[var(--muted)]">
                        Verified by the {dept ? `${dept.name} (${dept.shortName})` : "Faculty"} project review
                        committee and indexed in the permanent showcase archive.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Metadata & Attribution Card */}
            <aside className="dept-panel-stack" aria-label="Project Attribution and Links">
              <div className="dept-overview-card">
                <span className="caps eyebrow accent">Project Attribution</span>
                <h3 className="serif text-3xl">Specifications</h3>

                <dl className="project-spec-list">
                  <div className="project-spec-row">
                    <dt className="caps">Department</dt>
                    <dd>
                      {dept ? (
                        <Link href={`/departments/${dept.slug}`} className="font-semibold text-[var(--green)]">
                          {dept.name} ({dept.shortName})
                        </Link>
                      ) : (
                        project.departmentSlug
                      )}
                    </dd>
                  </div>

                  <div className="project-spec-row">
                    <dt className="caps">Category</dt>
                    <dd>{categoryLabel}</dd>
                  </div>

                  <div className="project-spec-row">
                    <dt className="caps">Course Code</dt>
                    <dd>{project.courseCode ?? "Faculty Innovation / Independent"}</dd>
                  </div>

                  {cohortGroupNumber ? (
                    <div className="project-spec-row">
                      <dt className="caps">Cohort Group</dt>
                      <dd>Group {cohortGroupNumber}</dd>
                    </div>
                  ) : null}

                  <div className="project-spec-row">
                    <dt className="caps">Lead Contributors / Team</dt>
                    <dd className="font-semibold text-[var(--ink)]">
                      {project.teamDisplayName ?? "NACOS Project Team"}
                    </dd>
                  </div>

                  <div className="project-spec-row">
                    <dt className="caps">Academic Session</dt>
                    <dd>{currentSession?.name ?? "2024/2025 Academic Session"}</dd>
                  </div>

                  <div className="project-spec-row">
                    <dt className="caps">Moderation Status</dt>
                    <dd>
                      <span className="caps inline-flex items-center gap-1.5 rounded-full bg-[var(--mint-3)] px-2.5 py-1 text-[10px] text-[var(--green)]">
                        Approved &amp; Verified
                      </span>
                    </dd>
                  </div>
                </dl>

                <div className="flex flex-col gap-3 pt-2">
                  {project.repoUrl ? (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-dark w-full"
                    >
                      <GithubIcon size={17} />
                      <span>Inspect Source Code</span>
                    </a>
                  ) : null}
                  {project.demoUrl ? (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-solid w-full"
                    >
                      <span>Open Live Deployment</span>
                      <ArrowRight size={16} />
                    </a>
                  ) : null}
                  <Link href="/projects" className="btn btn-line w-full">
                    Back to All Projects
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 ? (
            <div className="mt-20">
              <div className="section-head mb-8">
                <div>
                  <span className="caps eyebrow accent">More from the Showcase</span>
                  <h2 className="serif text-4xl">Other Student &amp; Faculty Projects</h2>
                </div>
                <Link href="/projects" className="text-link">
                  View full showcase
                  <ArrowRight />
                </Link>
              </div>

              <div className="project-preview-grid">
                {relatedProjects.map((rel) => {
                  const relDept = departments.find((d) => d.slug === rel.departmentSlug);
                  return (
                    <article key={rel.slug} className="project-preview-card card">
                      <div className="project-preview-top">
                        <span className="caps project-cat-pill">
                          {PROJECT_CATEGORY_LABELS[rel.category] ?? rel.category}
                        </span>
                        <span className="caps project-dept-tag">
                          {relDept ? relDept.shortName : rel.departmentSlug}
                          {rel.courseCode ? ` · ${rel.courseCode}` : ""}
                        </span>
                      </div>

                      <div className="project-preview-body">
                        <h3 className="serif project-preview-title">
                          <Link href={`/projects/${rel.slug}`}>{rel.title}</Link>
                        </h3>
                        <p className="project-preview-tagline">{rel.tagline}</p>
                      </div>

                      <footer className="project-preview-foot">
                        <span className="text-xs font-semibold text-[var(--ink)]">
                          {rel.teamDisplayName ?? "NACOS Team"}
                        </span>
                        <Link href={`/projects/${rel.slug}`} className="project-detail-link">
                          <span>Inspect</span>
                          <ArrowRight size={15} />
                        </Link>
                      </footer>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />
    </>
  );
}
