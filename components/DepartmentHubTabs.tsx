"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import hodPlaceholder from "@/assets/images/hod-placeholder.webp";
import { ArrowRight, ArrowUpRight, Calendar, GithubIcon, QuoteMark } from "@/components/icons";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { AlumniCard } from "@/components/AlumniCard";
import { CouncilPersonCard } from "@/components/CouncilPersonCard";
import { NoticeCard } from "@/components/NoticeCard";
import { ProjectCard } from "@/components/ProjectCard";
import { initials } from "@/lib/executives";
import { trpc } from "@/lib/trpc/client";
import type {
  DepartmentSummary,
  OpportunitySummary,
  PersonSummary,
  PostSummary,
  ProjectSummary,
  SchoolSessionSummary,
} from "@/server/contracts";

const categoryLabels: Record<string, string> = {
  cybersecurity: "Cybersecurity",
  embedded_systems_hardware: "Embedded Systems & Hardware",
  software_engineering: "Software Engineering",
  artificial_intelligence_data: "AI & Data Science",
  information_systems_networking: "Information Systems & Networking",
  theoretical_computing_research: "Theoretical Computing & Research",
  interdisciplinary: "Interdisciplinary",
};

const tierLabels: Record<string, string> = {
  elected_exco: "Elected Executive",
  aide: "Executive Aide",
  dev_team: "Software & Dev Team",
  alumni: "Graduating Alumnus",
};

const opportunityTypeLabels: Record<string, string> = {
  siwes_it: "SIWES / Industrial Training",
  scholarship: "Scholarship & Grant",
  sponsorship: "Sponsorship",
  partnership: "Industry Partnership",
  job: "Graduate Placement",
};

function formatReadableDate(iso: string | null) {
  if (!iso) return "Ongoing";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export interface DepartmentHubTabsProps {
  department: DepartmentSummary;
  currentSession: SchoolSessionSummary | null;
  allSessions: SchoolSessionSummary[];
  initialOfficers: PersonSummary[];
  initialAlumni: PersonSummary[];
  initialProjects: ProjectSummary[];
  initialOpportunities: OpportunitySummary[];
  initialPosts: PostSummary[];
}

export function DepartmentHubTabs({
  department,
  currentSession,
  allSessions,
  initialOfficers,
  initialAlumni,
  initialProjects,
  initialOpportunities,
  initialPosts,
}: DepartmentHubTabsProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>("overview");

  const { data: deptProjects = initialProjects } = trpc.project.list.useQuery(
    { departmentSlug: department.slug },
    { initialData: initialProjects },
  );

  const { data: posts = initialPosts } = trpc.post.list.useQuery(undefined, {
    initialData: initialPosts,
  });

  const sessionMap = new Map(allSessions.map((s) => [s.slug, s]));

  const HOD_EMAILS: Record<string, string> = {
    "computer-science": "u.e.umoren@uniuyo.edu.ng",
    cybersecurity: "a.e.essien@uniuyo.edu.ng",
    "information-systems": "i.j.akpan@uniuyo.edu.ng",
    "data-analytics": "m.b.okon@uniuyo.edu.ng",
    "software-engineering": "g.a.etuk@uniuyo.edu.ng",
  };

  const hodEmail =
    HOD_EMAILS[department.slug] ??
    `hod.${department.slug}@uniuyo.edu.ng`;

  const totalNotices = initialOpportunities.length + posts.length;

  const candidateSections: { id: string; label: string; count?: number; hasContent: boolean }[] = [
    { id: "overview", label: "Overview", hasContent: true },
    { id: "officers", label: "Executive Officers", count: initialOfficers.length, hasContent: initialOfficers.length > 0 },
    { id: "projects", label: "Projects", count: deptProjects.length, hasContent: deptProjects.length > 0 },
    { id: "alumni", label: "Alumni", count: initialAlumni.length, hasContent: initialAlumni.length > 0 },
    { id: "notices", label: "Notices", count: totalNotices, hasContent: totalNotices > 0 },
  ];

  const activeSections = candidateSections.filter((s) => s.hasContent);
  const showNav = activeSections.length > 1;

  useEffect(() => {
    if (!showNav) return;

    const sectionIdsKey = activeSections.map((s) => s.id).join(",");
    const ids = sectionIdsKey.split(",");
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSectionId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.2, 0.5, 0.8, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [showNav, activeSections.length]);

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 90;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: "smooth",
    });
  };

  return (
    <div>
      {/* In-Page Jump Navigation Bar */}
      {showNav && (
        <nav
          className="sticky top-[60px] sm:top-[72px] z-20 bg-[var(--paper)] border-b border-[var(--rule)]"
          aria-label={`${department.name} sections`}
        >
          <div className="wrap">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-3">
              {activeSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`inline-flex items-center gap-2 px-4.5 py-2.5 rounded-full border border-transparent font-sans text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeSectionId === sec.id
                      ? "bg-transparent border-[var(--gold)] text-[var(--ink)]"
                      : "bg-transparent text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--ink)]"
                  }`}
                  onClick={() => scrollToSection(sec.id)}
                >
                  <span>{sec.label}</span>
                  {typeof sec.count === "number" ? (
                    <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-[11px] bg-[rgba(15,26,19,0.08)] text-inherit">
                      {sec.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Appended Content Sections */}
      <div className="wrap pt-[clamp(44px,6vw,72px)] flex flex-col gap-24 pb-[clamp(88px,11vw,140px)]">
        {/* 1. Overview */}
        <section
          id="overview"
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(300px,5fr)] gap-7 items-start scroll-mt-24"
          aria-labelledby="heading-overview"
        >
          <div className="flex flex-col gap-6">
            <h2 id="heading-overview" className="serif m-0 mt-2 text-[clamp(27.9px,3.6vw,45.9px)] leading-[1.02] text-[var(--ink)]">
              Department of {department.name}
            </h2>

            <div className="pl-4.5 border-l-[3px] border-[var(--green)]">
              <RichTextRenderer
                doc={department.summary}
                className="text-[18px] leading-relaxed text-[var(--ink)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-[var(--paper)] rounded-[10px] p-5 flex flex-col gap-2">
                <span className="caps text-[10px] text-[var(--green)]">Academic Rigour</span>
                <h3 className="serif text-2xl mt-1 m-0">Coursework &amp; Labs</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)] mt-2 m-0">
                  Structured undergraduate practicals, group engineering milestones, and final-year research
                  supervision within the department.
                </p>
              </div>
              <div className="bg-[var(--paper)] rounded-[10px] p-5 flex flex-col gap-2">
                <span className="caps text-[10px] text-[var(--green)]">Industry Readiness</span>
                <h3 className="serif text-2xl mt-1 m-0">SIWES &amp; Career Pathways</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)] mt-2 m-0">
                  Verified six-month industrial training placements, technical mentorship, and public project
                  portfolios.
                </p>
              </div>
            </div>
          </div>

          {/* Highlighted Card for the Head of Department */}
          <aside className="bg-[var(--forest)] text-white rounded-xl overflow-hidden flex flex-col" aria-label="Head of Department">
            <div className="relative min-h-[280px] bg-[var(--forest-2)] flex items-center justify-center overflow-hidden">
              <Image
                src={hodPlaceholder}
                alt={department.hodName ?? `Head of Department, Department of ${department.name}`}
                fill
                sizes="(max-width: 960px) 100vw, 400px"
                className="object-cover"
              />
            </div>

            <div className="p-[clamp(24px,3.2vw,36px)] flex flex-col gap-3">
              <span className="caps text-[11px] text-[var(--gold)] tracking-[0.08em]">Head of Department</span>
              <h3 className="serif m-0 text-[32px] leading-[1.06] text-white">
                {department.hodName ?? `Office of the HOD`}
              </h3>
              <p className="m-0 text-sm text-[var(--mint-2)]">
                Department of {department.name}, Faculty of Computing, University of Uyo
              </p>

              <div className="mt-1.5 p-4 rounded-lg bg-white/5 flex flex-col gap-2">
                <QuoteMark size={20} className="text-[var(--gold)]" />
                <p className="m-0 text-sm leading-[1.55] text-[var(--mint-3)]">
                  Advancing academic excellence, laboratory innovation, and industry collaboration in{" "}
                  {department.name}.
                </p>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3 pt-3.5 border-t border-white/10">
                <a
                  href={`mailto:${hodEmail}`}
                  className="text-[13px] text-[var(--mint-2)] no-underline hover:text-white hover:underline transition-colors"
                >
                  {hodEmail}
                </a>
              </div>
            </div>
          </aside>
        </section>

        {/* 2. Executive Officers */}
        {initialOfficers.length > 0 && (
          <section
            id="officers"
            aria-labelledby="heading-officers"
            className="flex flex-col gap-9 scroll-mt-24"
          >
            <div className="flex items-end justify-between flex-wrap gap-5">
              <div>
                <span className="caps eyebrow accent">
                  {currentSession ? currentSession.name : "Active Academic Session"} · Department of {department.name}
                </span>
                <h2 id="heading-officers" className="serif m-0 mt-2 text-[clamp(27.9px,3.6vw,45.9px)] leading-[1.02] text-[var(--ink)]">
                  Executive Officers &amp; Representatives
                </h2>
              </div>
            </div>

            <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {initialOfficers.map((officer, idx) => (
                <li key={`${officer.slug}-${idx}`} className="h-full">
                  <CouncilPersonCard
                    person={officer}
                    index={idx}
                    departmentName={department.name}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 4. Projects */}
        {deptProjects.length > 0 && (
          <section
            id="projects"
            aria-labelledby="heading-projects"
            className="flex flex-col gap-9 scroll-mt-24"
          >
            <div className="flex items-end justify-between flex-wrap gap-5">
              <div>
                <span className="caps eyebrow accent">
                  Coursework, Hardware &amp; Research
                </span>
                <h2 id="heading-projects" className="serif m-0 mt-2 text-[clamp(27.9px,3.6vw,45.9px)] leading-[1.02] text-[var(--ink)]">
                  Student Projects
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {deptProjects.map((proj, idx) => (
                <ProjectCard
                  key={proj.slug}
                  slug={proj.slug}
                  title={proj.title}
                  tagline={proj.tagline}
                  categoryLabel={categoryLabels[proj.category] ?? proj.category}
                  courseCode={proj.courseCode}
                  teamDisplayName={proj.teamDisplayName}
                  index={idx}
                  surfaceClassName="bg-[var(--sand)]"
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Alumni */}
        {initialAlumni.length > 0 && (
          <section
            id="alumni"
            aria-labelledby="heading-alumni"
            className="flex flex-col gap-9 scroll-mt-24"
          >
            <div className="flex items-end justify-between flex-wrap gap-5">
              <div>
                <span className="caps eyebrow accent">Graduating Cohorts &amp; Industry Mentors</span>
                <h2 id="heading-alumni" className="serif m-0 mt-2 text-[clamp(27.9px,3.6vw,45.9px)] leading-[1.02] text-[var(--ink)]">
                  {department.name} Alumni Spotlight
                </h2>
              </div>
            </div>

            <ul className="list-none m-0 p-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {initialAlumni.map((alum) => {
                const sess = sessionMap.get(alum.sessionSlug);
                return (
                  <li key={alum.slug} className="h-full">
                    <AlumniCard
                      alum={alum}
                      deptName={department.name}
                      sessionName={sess ? sess.name : `${alum.sessionSlug} Academic Session`}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* 6. Notices */}
        {totalNotices > 0 && (
          <section
            id="notices"
            aria-labelledby="heading-notices"
            className="flex flex-col gap-9 scroll-mt-24"
          >
            <div className="flex items-end justify-between flex-wrap gap-5">
              <div>
                <span className="caps eyebrow accent">
                  Announcements &amp; Updates
                </span>
                <h2 id="heading-notices" className="serif m-0 mt-2 text-[clamp(27.9px,3.6vw,45.9px)] leading-[1.02] text-[var(--ink)]">
                  Notices &amp; Bulletins
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {initialOpportunities.map((opp) => {
                const typeLabel = opportunityTypeLabels[opp.type] ?? opp.type;
                const hasInternal = opp.hasInternalDetails || !opp.applyUrl;
                const isExternal =
                  Boolean(opp.applyUrl) &&
                  (opp.applyUrl!.startsWith("http://") || opp.applyUrl!.startsWith("https://"));

                const targetHref = hasInternal ? `/opportunities/${opp.slug}` : (opp.applyUrl ?? "#");

                return (
                  <NoticeCard
                    key={opp.slug}
                    href={targetHref}
                    isExternal={!hasInternal && isExternal}
                    dateLabel={formatReadableDate(opp.deadline)}
                    badgeLabel={typeLabel}
                    secondaryBadge={
                      opp.departmentSlug === department.slug
                        ? { label: department.name }
                        : { label: "Faculty", highlight: true }
                    }
                    eyebrow={`${opp.orgName} · ${opp.location}`}
                    title={opp.title}
                    excerpt={opp.excerpt}
                    imageUrl={opp.imageUrl}
                  />
                );
              })}

              {posts.map((post, idx) => {
                const bulletinImages = [
                  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
                  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
                ];
                const bgUrl = bulletinImages[idx % bulletinImages.length];

                return (
                  <NoticeCard
                    key={post.slug}
                    href={`/opportunities/${post.slug}`}
                    dateLabel={formatReadableDate(post.publishedAt)}
                    badgeLabel="Official Bulletin"
                    eyebrow="NACOS UNIUYO"
                    title={post.title}
                    excerpt={post.excerpt}
                    imageUrl={bgUrl}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
