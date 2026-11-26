import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/EventParts";
import { notFound } from "next/navigation";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Layers,
  Users,
} from "lucide-react";
import { ArrowRight, ArrowUpRight, GithubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { ProjectCard } from "@/components/ProjectCard";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import type { ProjectCategory } from "@/lib/enums";
import { breadcrumbSchema, projectSchema } from "@/lib/schema";
import { ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";
import { PROJECT_ARTICLES } from "./project-articles";

const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  cybersecurity: "Cybersecurity",
  embedded_systems_hardware: "Embedded Systems",
  software_engineering: "Software Engineering",
  artificial_intelligence_data: "AI & Data Science",
  information_systems_networking: "Information Systems",
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
  const [project, departments] = await Promise.all([
    caller.project.bySlug({ slug }),
    caller.department.list(),
  ]);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const dept = departments.find((d) => d.slug === project.departmentSlug);
  const title = `${project.title} · Project Showcase`;
  const description = project.tagline;
  const deptName = dept ? dept.name : "Computing";

  return {
    title,
    description,
    keywords: [
      project.title,
      project.courseCode ?? "Coursework Project",
      deptName,
      `Department of ${deptName}`,
      "NACOS UNIUYO",
      "University of Uyo",
      "Student Engineering",
      "Faculty of Computing",
    ],
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

  const deptNameNormalized = dept?.name.toLowerCase().replace(/[^a-z]/g, "") ?? "";
  const categoryNormalized = categoryLabel.toLowerCase().replace(/[^a-z]/g, "");
  const isRedundantCategory =
    deptNameNormalized.length > 0 &&
    (deptNameNormalized.includes(categoryNormalized) || categoryNormalized.includes(deptNameNormalized));

  const relatedProjects = allProjects
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3);

  const articleDoc =
    project.descriptionJson ??
    PROJECT_ARTICLES[project.slug] ??
    `${project.tagline}\n\nDeveloped within the Department of ${
      dept ? dept.name : project.departmentSlug
    } at the Faculty of Computing, University of Uyo${
      project.courseCode ? ` as part of ${project.courseCode} coursework and laboratory evaluation` : ""
    }.\n\nAttributed to ${project.teamDisplayName ?? "the NACOS UNIUYO project team"} during the ${
      currentSession?.name ?? "2024/2025 Academic Session"
    }.`;

  return (
    <>
      {/* 1. Hero Header */}
      <section className="relative flex min-h-[min(780px,calc(100svh-80px))] items-center overflow-hidden bg-[var(--deep)] py-[clamp(64px,8vw,100px)] text-white" aria-labelledby="project-detail-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label={`{ ${project.courseCode ?? "PROJECT"} }`} />

        <div className="wrap relative flex w-full flex-col gap-6">
          <Breadcrumbs
            items={[
              { name: "NACOS UNIUYO", path: "/" },
              { name: "Projects", path: "/projects" },
              { name: project.title },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--mint-2)]">
            {dept ? (
              <Link
                href={`/departments/${dept.slug}`}
                className="caps no-underline text-[var(--gold)] hover:text-white font-medium transition-colors"
              >
                Department of {dept.name}
              </Link>
            ) : null}
            {!isRedundantCategory ? (
              <>
                {dept ? <span className="opacity-40" aria-hidden="true">·</span> : null}
                <span className="caps text-[var(--mint-2)]">
                  {categoryLabel}
                </span>
              </>
            ) : null}
            {project.courseCode ? (
              <>
                <span className="opacity-40" aria-hidden="true">·</span>
                <span className="caps text-white font-medium">
                  {project.courseCode}
                </span>
              </>
            ) : null}
            {project.featured ? (
              <>
                <span className="opacity-40" aria-hidden="true">·</span>
                <span className="caps text-[var(--gold)]">
                  Featured Project
                </span>
              </>
            ) : null}
          </div>

          <h1 id="project-detail-title" className="serif">
            {project.title}
          </h1>

          <p className="max-w-[680px] text-[clamp(17px,1.8vw,21px)] leading-relaxed text-[var(--mint-2)]">
            {project.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            {project.demoUrl ? (
              <Button asChild variant="solid" size="sm">
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  <span>Access Project</span>
                  <ArrowUpRight size={14} />
                </a>
              </Button>
            ) : null}
            {project.repoUrl ? (
              <Button asChild variant="ghost" size="sm">
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-1.5"
                >
                  <GithubIcon size={16} />
                  <span>Source Code</span>
                </a>
              </Button>
            ) : null}
            {dept ? (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/departments/${dept.slug}`}>
                  <span>Visit {dept.name} Hub</span>
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {/* 2. Editorial Case Study Layout */}
      <section className="py-[var(--section-y)]" aria-label="Project Case Study and Technical Specifications">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left 8-Column Article Canvas */}
            <article className="lg:col-span-8 flex flex-col gap-8">
              {/* Cover Banner Frame */}
              <div className="w-full min-h-[220px] sm:aspect-[16/9] rounded-xl bg-[var(--forest)] border border-[rgba(15,26,19,0.14)] overflow-hidden relative flex flex-col justify-between p-6 sm:p-10 shadow-sm text-white">
                <div className="flex items-center justify-between gap-4">
                  <span className="caps text-xs text-[var(--gold)] font-medium">
                    Department of {dept ? dept.name : project.departmentSlug}
                  </span>
                  <span className="caps text-xs text-[var(--mint-2)]">
                    {project.courseCode ?? "Faculty Showcase"}
                  </span>
                </div>

                <div className="flex flex-col gap-2 my-auto py-4">
                  <span className="serif text-4xl sm:text-7xl text-[var(--mint)] leading-none">
                    {project.courseCode ?? "01"}
                  </span>
                  <h2 className="serif text-xl sm:text-4xl text-white m-0">
                    {project.title}
                  </h2>
                  <p className="text-xs sm:text-base text-[var(--mint-2)] max-w-[560px] m-0 leading-relaxed">
                    {project.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.1)] text-xs text-[var(--mint-2)]">
                  <span>{project.teamDisplayName ?? "NACOS Project Team"}</span>
                  <span>{currentSession?.name ?? "2024/2025 Session"}</span>
                </div>
              </div>

              {/* Natural Editorial Article Body */}
              <div className="bg-[var(--sand)] rounded-xl border border-[var(--rule)] p-6 sm:p-12 md:p-14 shadow-sm">
                <RichTextRenderer
                  doc={articleDoc}
                  className="project-prose"
                />
              </div>
            </article>

            {/* Right 4-Column Sticky Specifications Panel */}
            <aside className="lg:col-span-4 flex flex-col gap-4 lg:sticky lg:top-24" aria-label="Project Specifications">
              <div className="bg-[var(--sand)] border border-[var(--rule)] rounded-xl p-6 shadow-sm flex flex-col gap-5">
                <div className="border-b border-[rgba(15,26,19,0.08)] pb-3">
                  <span className="caps eyebrow accent">Attribution</span>
                  <h3 className="serif text-2xl text-[var(--ink)] m-0 mt-0.5">Specifications</h3>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Department */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center text-[var(--green)] shrink-0">
                      <GraduationCap size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="caps text-[10px] text-[var(--muted)] font-medium">Department</span>
                      {dept ? (
                        <Link href={`/departments/${dept.slug}`} className="text-sm font-semibold text-[var(--green)] no-underline hover:underline">
                          Department of {dept.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-[var(--ink)]">{project.departmentSlug}</span>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center text-[var(--green)] shrink-0">
                      <Layers size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="caps text-[10px] text-[var(--muted)] font-medium">Category</span>
                      <span className="text-sm font-medium text-[var(--ink)]">{categoryLabel}</span>
                    </div>
                  </div>

                  {/* Course Code */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center text-[var(--green)] shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="caps text-[10px] text-[var(--muted)] font-medium">Course Code</span>
                      <span className="text-sm font-medium text-[var(--ink)]">
                        {project.courseCode ?? "Faculty Innovation"}
                      </span>
                    </div>
                  </div>

                  {/* Contributors */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center text-[var(--green)] shrink-0">
                      <Users size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="caps text-[10px] text-[var(--muted)] font-medium">Team or Authors</span>
                      <span className="text-sm font-semibold text-[var(--ink)]">
                        {project.teamDisplayName ?? "NACOS Project Team"}
                      </span>
                    </div>
                  </div>

                  {/* Session */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-center text-[var(--green)] shrink-0">
                      <Calendar size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="caps text-[10px] text-[var(--muted)] font-medium">Academic Session</span>
                      <span className="text-sm font-medium text-[var(--ink)]">
                        {currentSession?.name ?? "2024/2025 Academic Session"}
                      </span>
                    </div>
                  </div>

                  {/* Moderation Status */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--paper)] border border-[rgba(15,26,19,0.08)] flex items-center justify-center text-[var(--green)] shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="caps text-[10px] text-[var(--muted)] font-medium">Verification</span>
                      <span className="text-xs font-semibold text-[var(--green)]">
                        Approved by Faculty Committee
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 pt-3 border-t border-[rgba(15,26,19,0.08)]">
                  {project.demoUrl ? (
                    <Button asChild variant="solid" className="w-full">
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>Access Project</span>
                        <ArrowUpRight size={15} />
                      </a>
                    </Button>
                  ) : null}
                  {project.repoUrl ? (
                    <Button asChild variant="dark" className="w-full">
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GithubIcon size={16} />
                        <span>Source Repository</span>
                      </a>
                    </Button>
                  ) : null}
                  <Button asChild variant="line" className="w-full text-center">
                    <Link href="/projects">
                      Back to All Projects
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>

          {/* 3. Related Projects Grid */}
          {relatedProjects.length > 0 ? (
            <div className="mt-20 pt-16 border-t border-[rgba(15,26,19,0.12)]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="caps eyebrow accent">Explore More</span>
                  <h2 className="serif text-2xl sm:text-4xl text-[var(--ink)] m-0 mt-1">
                    Other Student Projects
                  </h2>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--green)] no-underline hover:no-underline shrink-0"
                >
                  <span>View All Projects</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full text-left">
                {relatedProjects.map((rel, idx) => {
                  const relDept = departments.find((d) => d.slug === rel.departmentSlug);
                  return (
                    <ProjectCard
                      key={rel.slug}
                      slug={rel.slug}
                      title={rel.title}
                      tagline={rel.tagline}
                      categoryLabel={PROJECT_CATEGORY_LABELS[rel.category] ?? rel.category}
                      courseCode={rel.courseCode}
                      teamDisplayName={rel.teamDisplayName ?? "NACOS Team"}
                      coverSubtitle={`Department of ${relDept ? relDept.name : rel.departmentSlug}`}
                      index={idx}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "NACOS UNIUYO", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: project.title, path: `/projects/${project.slug}` },
          ]),
          projectSchema({
            title: project.title,
            tagline: project.tagline,
            slug: project.slug,
            category: categoryLabel,
            courseCode: project.courseCode,
            teamDisplayName: project.teamDisplayName,
            repoUrl: project.repoUrl,
            demoUrl: project.demoUrl,
            departmentName: dept?.name,
          }),
        ]}
      />
    </>
  );
}
