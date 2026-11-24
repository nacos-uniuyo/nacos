"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import hodPlaceholder from "@/assets/images/hod-placeholder.webp";
import { ArrowRight, ArrowUpRight, Calendar, GithubIcon, QuoteMark } from "@/components/icons";
import { RichTextRenderer } from "@/components/RichTextRenderer";
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
    // { id: "staff", label: "Staff", count: staffList.length, hasContent: staffList.length > 0 },
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
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.2, 0.5],
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
    <div className="dept-tabs-container">
      {/* In-Page Jump Navigation Bar */}
      {showNav && (
        <nav className="dept-tablist-bar" aria-label={`${department.name} sections`}>
          <div className="wrap">
            <div className="dept-tablist">
              {activeSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={`dept-tab-btn ${activeSectionId === sec.id ? "active" : ""}`}
                  onClick={() => scrollToSection(sec.id)}
                >
                  <span>{sec.label}</span>
                  {typeof sec.count === "number" ? (
                    <span className="dept-tab-count">{sec.count}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Appended Content Sections */}
      <div className="wrap dept-tabpanel-wrap flex flex-col gap-24">
        {/* 1. Overview */}
        <section id="overview" className="dept-overview-grid scroll-mt-24" aria-labelledby="heading-overview">
          <div className="dept-overview-main flex flex-col gap-6">
            <h2 id="heading-overview" className="serif dept-section-heading">
              Department of {department.name}
            </h2>

            <div className="dept-overview-prose">
              <RichTextRenderer
                doc={department.summary}
                className="text-[18px] leading-relaxed text-[var(--ink)]"
              />
            </div>

            <div className="dept-pillar-grid">
              <div>
                <span className="caps text-[10px] text-[var(--green)]">Academic Rigour</span>
                <h3 className="serif text-2xl mt-1">Coursework &amp; Labs</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)] mt-2">
                  Structured undergraduate practicals, group engineering milestones, and final-year research
                  supervision within the department.
                </p>
              </div>
              <div>
                <span className="caps text-[10px] text-[var(--green)]">Industry Readiness</span>
                <h3 className="serif text-2xl mt-1">SIWES &amp; Career Pathways</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)] mt-2">
                  Verified six-month industrial training placements, technical mentorship, and public project
                  portfolios.
                </p>
              </div>
            </div>
          </div>

          {/* Highlighted Card for the Head of Department */}
          <aside className="dept-hod-highlight-card" aria-label="Head of Department">
            <div className="dept-hod-visual">
              <Image
                src={hodPlaceholder}
                alt={department.hodName ?? `Head of Department, Department of ${department.name}`}
                fill
                sizes="(max-width: 960px) 100vw, 400px"
                className="object-cover"
              />
            </div>

            <div className="dept-hod-details">
              <span className="caps dept-hod-label">Head of Department</span>
              <h3 className="serif dept-hod-name">
                {department.hodName ?? `Office of the HOD`}
              </h3>
              <p className="dept-hod-role">
                Department of {department.name}, Faculty of Computing, University of Uyo
              </p>

              <div className="dept-hod-quote">
                <QuoteMark size={20} className="text-[var(--gold)]" />
                <p>
                  Advancing academic excellence, laboratory innovation, and industry collaboration in{" "}
                  {department.name}.
                </p>
              </div>

              <div className="dept-hod-contact">
                <a href={`mailto:${hodEmail}`} className="dept-hod-email">
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
            className="dept-panel-stack scroll-mt-24"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">
                  {currentSession ? currentSession.name : "Active Academic Session"} · Department of {department.name}
                </span>
                <h2 id="heading-officers" className="serif dept-section-heading">
                  Executive Officers &amp; Representatives
                </h2>
              </div>
            </div>

            <ul className="dept-person-grid">
              {initialOfficers.map((officer, idx) => (
                <li key={`${officer.slug}-${idx}`} className="dept-person-card">
                  <div className="dept-person-media">
                    {officer.photoUrl ? (
                      <Image
                        src={officer.photoUrl}
                        alt={`${officer.fullName}, ${officer.roleTitle}`}
                        fill
                        sizes="(max-width: 680px) 100vw, 320px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="dept-person-monogram" aria-hidden="true">
                        <span className="serif">{initials(officer.fullName)}</span>
                      </div>
                    )}
                    <span className="caps dept-person-tier-tag">
                      {tierLabels[officer.tier] ?? officer.tier}
                    </span>
                  </div>

                  <div className="dept-person-body">
                    <span className="caps dept-person-role">{officer.roleTitle}</span>
                    <h3 className="serif dept-person-name">{officer.fullName}</h3>
                    <p className="dept-person-dept">
                      Department of {department.name}
                    </p>

                    <div className="dept-person-socials">
                      <span className="caps text-[10px] text-[var(--muted)]">
                        Session {officer.sessionSlug}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 3. Staff Directory - Commented out while lecturers remain shared across departments */}
        {/*
        {staffList.length > 0 && (
          <section
            id="staff"
            aria-labelledby="heading-staff"
            className="dept-panel-stack scroll-mt-24"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">Directory</span>
                <h2 id="heading-staff" className="serif dept-section-heading">
                  Staff
                </h2>
              </div>
              <p className="m-0 max-w-[420px] text-sm text-[var(--muted)]">
                Faculty staff records for the Department of {department.name}, led by the Head of
                Department.
              </p>
            </div>

            <div className="dept-staff-list">
              {staffList.map((staff) => (
                <article key={staff.slug} className="dept-staff-card">
                  <div className="dept-staff-avatar" aria-hidden="true">
                    <span className="serif">{initials(staff.fullName)}</span>
                  </div>

                  <div className="dept-staff-info">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="caps dept-staff-tag">{staff.roleTag}</span>
                      <a href={`mailto:${staff.email}`} className="dept-staff-email">
                        {staff.email}
                      </a>
                    </div>

                    <h3 className="serif dept-staff-name">{staff.fullName}</h3>
                    <p className="dept-staff-designation">{staff.designation}</p>

                    <div className="dept-staff-bio">
                      <RichTextRenderer
                        doc={staff.bio}
                        className="text-[15px] leading-relaxed text-[var(--muted)]"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        */}

        {/* 4. Projects */}
        {deptProjects.length > 0 && (
          <section
            id="projects"
            aria-labelledby="heading-projects"
            className="dept-panel-stack scroll-mt-24"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">
                  Coursework, Hardware &amp; Research
                </span>
                <h2 id="heading-projects" className="serif dept-section-heading">
                  Student Projects
                </h2>
              </div>
            </div>

            <div className="project-preview-grid">
              {deptProjects.map((proj) => (
                <article key={proj.slug} className="project-preview-card">
                  <div className="project-preview-top">
                    <span className="caps project-cat-tag">
                      {categoryLabels[proj.category] ?? proj.category}
                    </span>
                    {proj.courseCode ? (
                      <span className="caps project-dept-tag">
                        {proj.courseCode}
                      </span>
                    ) : null}
                  </div>

                  <div className="project-preview-body">
                    <h3 className="serif project-preview-title">
                      <Link href={`/projects/${proj.slug}`}>{proj.title}</Link>
                    </h3>
                    <p className="project-preview-tagline">{proj.tagline}</p>
                  </div>

                  <footer className="project-preview-foot">
                    <div className="project-team-meta">
                      <span className="caps text-[10px] text-[var(--muted)]">Attributed Team</span>
                      <span className="text-xs font-semibold text-[var(--ink)]">
                        {proj.teamDisplayName ?? `Department Project Team`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {proj.repoUrl ? (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-icon-link"
                          aria-label={`${proj.title} repository`}
                        >
                          <GithubIcon size={16} />
                        </a>
                      ) : null}
                      <Link href={`/projects/${proj.slug}`} className="project-detail-link">
                        <span>View Project</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 5. Alumni */}
        {initialAlumni.length > 0 && (
          <section
            id="alumni"
            aria-labelledby="heading-alumni"
            className="dept-panel-stack scroll-mt-24"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">Graduating Cohorts &amp; Industry Mentors</span>
                <h2 id="heading-alumni" className="serif dept-section-heading">
                  {department.name} Alumni Spotlight
                </h2>
              </div>
            </div>

            <ul className="dept-person-grid">
              {initialAlumni.map((alum) => {
                const sess = sessionMap.get(alum.sessionSlug);
                return (
                  <li key={alum.slug} className="dept-person-card group relative">
                    <div className="dept-person-media">
                      {alum.photoUrl ? (
                        <Image
                          src={alum.photoUrl}
                          alt={alum.fullName}
                          fill
                          sizes="(max-width: 680px) 100vw, 320px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="dept-person-monogram" aria-hidden="true">
                          <span className="serif">{initials(alum.fullName)}</span>
                        </div>
                      )}
                      <span className="caps dept-person-tier-tag">
                        Cohort {alum.sessionSlug}
                      </span>
                    </div>

                    <div className="dept-person-body">
                      <span className="caps dept-person-role">
                        {alum.roleTitle}
                      </span>
                      <h3 className="serif dept-person-name">
                        <Link
                          href={`/yearbook/${alum.slug}`}
                          className="before:absolute before:inset-0 before:z-10 no-underline text-inherit group-hover:text-[var(--green)] transition-colors"
                        >
                          {alum.fullName}
                        </Link>
                      </h3>
                      <p className="dept-person-dept">
                        {sess ? sess.name : `${alum.sessionSlug} Academic Session`}
                      </p>
                    </div>
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
            className="dept-panel-stack scroll-mt-24"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">
                  Announcements &amp; Updates
                </span>
                <h2 id="heading-notices" className="serif dept-section-heading">
                  Notices &amp; Bulletins
                </h2>
              </div>
            </div>

            <div className="dept-notices-grid">
              {initialOpportunities.map((opp) => (
                <article key={opp.slug} className="dept-notice-card">
                  <div className="dept-notice-meta">
                    <span className="caps dept-notice-tag">
                      {opp.departmentSlug === department.slug
                        ? "Department Circular"
                        : "Faculty Circular"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <Calendar size={13} />
                      <span>Deadline: {formatReadableDate(opp.deadline)}</span>
                    </span>
                  </div>

                  <h3 className="serif dept-notice-title">{opp.title}</h3>
                  <p className="dept-notice-excerpt">
                    {opportunityTypeLabels[opp.type] ?? opp.type} with <strong>{opp.orgName}</strong> ({opp.location}).
                    Open to eligible {department.name} students.
                  </p>

                  <footer className="dept-notice-foot">
                    <span className="caps text-[10px] text-[var(--green)]">
                      {opportunityTypeLabels[opp.type] ?? opp.type}
                    </span>
                    <Link
                      href={opp.applyUrl ? opp.applyUrl : `/opportunities/${opp.slug}`}
                      target={opp.applyUrl ? "_blank" : undefined}
                      rel={opp.applyUrl ? "noopener noreferrer" : undefined}
                      className="text-link text-sm"
                    >
                      View
                      <ArrowUpRight size={15} />
                    </Link>
                  </footer>
                </article>
              ))}

              {posts.map((post) => (
                <article key={post.slug} className="dept-notice-card">
                  <div className="dept-notice-meta">
                    <span className="caps dept-notice-tag">Official Bulletin</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <Calendar size={13} />
                      <span>Published {formatReadableDate(post.publishedAt)}</span>
                    </span>
                  </div>

                  <h3 className="serif dept-notice-title">{post.title}</h3>
                  <p className="dept-notice-excerpt">{post.excerpt}</p>

                  <footer className="dept-notice-foot">
                    <span className="caps text-[10px] text-[var(--muted)]">
                      NACOS UNIUYO
                    </span>
                    <span className="text-sm text-[var(--forest)] font-medium">
                      Notice
                    </span>
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
