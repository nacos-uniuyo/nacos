"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calendar, GithubIcon, QuoteMark, UniuyoCrest } from "@/components/icons";
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

type TabId = "overview" | "officers" | "staff" | "projects" | "alumni" | "notices";

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
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { data: deptProjects = initialProjects } = trpc.project.list.useQuery(
    { departmentSlug: department.slug },
    { initialData: initialProjects },
  );

  const { data: posts = initialPosts } = trpc.post.list.useQuery(undefined, {
    initialData: initialPosts,
  });

  const sessionMap = new Map(allSessions.map((s) => [s.slug, s]));

  const hodEmail = department.hodName
    ? `${department.hodName
        .toLowerCase()
        .replace(/^(dr\.|prof\.)\s*/i, "")
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.+|\.+$/g, "")}@uniuyo.edu.ng`
    : `hod.${department.slug}@uniuyo.edu.ng`;

  const staffList = department.hodName
    ? [
        {
          slug: `hod-${department.slug}`,
          fullName: department.hodName,
          designation: `Head of Department, ${department.name}`,
          roleTag: "Head of Department (HOD)",
          email: hodEmail,
          bio: `${department.hodName} leads academic administration, curriculum standards, and undergraduate research supervision across the Department of ${department.name} (${department.shortName}) at the Faculty of Computing, University of Uyo. ${department.summary}`,
        },
      ]
    : [];

  const totalNotices = initialOpportunities.length + posts.length;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview & HOD" },
    { id: "officers", label: "Executive Officers", count: initialOfficers.length },
    { id: "staff", label: "Faculty Staff", count: staffList.length },
    { id: "projects", label: "Featured Projects", count: deptProjects.length },
    { id: "alumni", label: "Alumni Spotlight", count: initialAlumni.length },
    { id: "notices", label: "Notices", count: totalNotices },
  ];

  return (
    <div className="dept-tabs-container">
      {/* Tab Navigation Bar */}
      <div className="dept-tablist-bar">
        <div className="wrap">
          <div className="dept-tablist" role="tablist" aria-label={`${department.name} sections`}>
            {tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`panel-${tab.id}`}
                  className={`dept-tab-btn${selected ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === "number" ? (
                    <span className="dept-tab-count">{tab.count}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content Panels */}
      <div className="wrap dept-tabpanel-wrap">
        {/* 1. Overview & HOD Highlight */}
        {activeTab === "overview" ? (
          <div
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            className="dept-overview-grid"
          >
            <div className="dept-overview-main">
              <div className="dept-overview-card">
                <span className="caps eyebrow accent">
                  Department Mandate · {department.shortName}
                </span>
                <h2 className="serif dept-section-heading">
                  Department of {department.name}
                </h2>
                <div className="dept-overview-prose">
                  <RichTextRenderer
                    doc={department.summary}
                    className="text-[18px] leading-relaxed text-[var(--ink)]"
                  />
                </div>

                <div className="dept-pillar-grid">
                  <div className="dept-pillar-box">
                    <span className="caps text-[10px] text-[var(--green)]">Academic Rigour</span>
                    <h3 className="serif text-2xl">Coursework &amp; Labs</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">
                      Structured undergraduate practicals, group engineering milestones, and final-year research
                      supervision within {department.shortName}.
                    </p>
                  </div>
                  <div className="dept-pillar-box">
                    <span className="caps text-[10px] text-[var(--green)]">Industry Readiness</span>
                    <h3 className="serif text-2xl">SIWES &amp; Career Pathways</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted)]">
                      Verified six-month industrial training placements, technical mentorship, and public project
                      portfolios.
                    </p>
                  </div>
                </div>

                <div className="dept-overview-jump-row">
                  <button
                    type="button"
                    className="btn btn-dark btn-sm"
                    onClick={() => setActiveTab("projects")}
                  >
                    Explore {department.shortName} Projects ({deptProjects.length})
                    <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-line btn-sm"
                    onClick={() => setActiveTab("officers")}
                  >
                    Meet {department.shortName} Officers ({initialOfficers.length})
                  </button>
                  <button
                    type="button"
                    className="btn btn-line btn-sm"
                    onClick={() => setActiveTab("notices")}
                  >
                    Department Notices ({totalNotices})
                  </button>
                </div>
              </div>
            </div>

            {/* Highlighted Card for the Head of Department (hodStaffId) */}
            <aside className="dept-hod-highlight-card" aria-label="Head of Department Highlight">
              <div className="dept-hod-visual">
                <svg viewBox="0 0 280 280" fill="none" className="dept-hod-rings" aria-hidden="true">
                  <circle cx="140" cy="140" r="118" stroke="rgba(216,180,92,0.32)" />
                  <circle
                    cx="140"
                    cy="140"
                    r="86"
                    stroke="rgba(255,255,255,0.12)"
                    strokeDasharray="3 8"
                  />
                </svg>
                <div className="dept-hod-crest">
                  <UniuyoCrest size={42} />
                </div>
                <span className="serif dept-hod-monogram">
                  {department.hodName ? initials(department.hodName) : department.shortName}
                </span>
              </div>

              <div className="dept-hod-details">
                <span className="caps dept-hod-pill">Head of Department · {department.shortName}</span>
                <h3 className="serif dept-hod-name">
                  {department.hodName ?? `Office of the HOD, ${department.shortName}`}
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
                  <button
                    type="button"
                    className="text-link text-xs text-[var(--gold)]"
                    onClick={() => setActiveTab("staff")}
                  >
                    View Staff Directory
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        ) : null}

        {/* 2. Executive Officers */}
        {activeTab === "officers" ? (
          <div
            id="panel-officers"
            role="tabpanel"
            aria-labelledby="tab-officers"
            className="dept-panel-stack"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">
                  {currentSession ? currentSession.name : "Active Academic Session"} · {department.shortName}
                </span>
                <h2 className="serif dept-section-heading">
                  Departmental Executive Officers &amp; Representatives
                </h2>
              </div>
              <Link href="/executives" className="text-link">
                View Full Faculty Council
                <ArrowRight size={16} />
              </Link>
            </div>

            {initialOfficers.length > 0 ? (
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
                      <span className="caps dept-person-tier-badge">
                        {tierLabels[officer.tier] ?? officer.tier}
                      </span>
                    </div>

                    <div className="dept-person-body">
                      <span className="caps dept-person-role">{officer.roleTitle}</span>
                      <h3 className="serif dept-person-name">{officer.fullName}</h3>
                      <p className="dept-person-dept">
                        Department of {department.name} ({department.shortName})
                      </p>

                      <div className="dept-person-socials">
                        <span className="caps text-[10px] text-[var(--muted)]">
                          Session {officer.sessionSlug}
                        </span>
                        <Link href={`/executives#${officer.slug}`} className="text-link text-xs">
                          Officer Profile
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dept-empty-state">
                <h3 className="serif text-2xl">No Departmental Officers Listed Yet</h3>
                <p>
                  Officer records for {department.name} ({department.shortName}) in the active session will appear
                  here once published by the department coordinator.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* 3. Faculty Staff Directory */}
        {activeTab === "staff" ? (
          <div
            id="panel-staff"
            role="tabpanel"
            aria-labelledby="tab-staff"
            className="dept-panel-stack"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">Permanent Institutional Directory</span>
                <h2 className="serif dept-section-heading">
                  Academic &amp; Non-Teaching Staff · {department.shortName}
                </h2>
              </div>
              <p className="m-0 max-w-[420px] text-sm text-[var(--muted)]">
                Permanent faculty staff records for the Department of {department.name}, led by the Head of
                Department.
              </p>
            </div>

            {staffList.length > 0 ? (
              <div className="dept-staff-list">
                {staffList.map((staff) => (
                  <article key={staff.slug} className="dept-staff-card">
                    <div className="dept-staff-avatar" aria-hidden="true">
                      <span className="serif">{initials(staff.fullName)}</span>
                    </div>

                    <div className="dept-staff-info">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="caps dept-staff-badge">{staff.roleTag}</span>
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
            ) : (
              <div className="dept-empty-state">
                <h3 className="serif text-2xl">Staff Directory Updating</h3>
                <p>
                  Permanent staff profiles for the Department of {department.name} are being updated for the
                  current session.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* 4. Featured Projects */}
        {activeTab === "projects" ? (
          <div
            id="panel-projects"
            role="tabpanel"
            aria-labelledby="tab-projects"
            className="dept-panel-stack"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">
                  Coursework, Hardware &amp; Research · {department.shortName}
                </span>
                <h2 className="serif dept-section-heading">
                  Departmental Student &amp; Faculty Projects
                </h2>
              </div>
              <Link href="/projects" className="text-link">
                Browse All Faculty Projects
                <ArrowRight size={16} />
              </Link>
            </div>

            {deptProjects.length > 0 ? (
              <div className="project-preview-grid">
                {deptProjects.map((proj) => (
                  <article key={proj.slug} className="project-preview-card">
                    <div className="project-preview-top">
                      <span className="caps project-cat-pill">
                        {categoryLabels[proj.category] ?? proj.category}
                      </span>
                      <span className="caps project-dept-tag">
                        {department.shortName}
                        {proj.courseCode ? ` · ${proj.courseCode}` : ""}
                      </span>
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
                          {proj.teamDisplayName ?? `${department.shortName} Project Team`}
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
                          <span>Inspect Project</span>
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dept-empty-state">
                <h3 className="serif text-2xl">No Published Projects in {department.shortName} Yet</h3>
                <p>
                  Have you built a coursework group assignment, embedded system, or research project in{" "}
                  {department.name}? Submit your proposal through the member portal for department review.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/login" className="btn btn-dark btn-sm">
                    Sign in to Submit a Project
                    <ArrowRight size={15} />
                  </Link>
                  <Link href="/projects" className="btn btn-line btn-sm">
                    Explore Projects from Other Departments
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 5. Alumni Spotlight */}
        {activeTab === "alumni" ? (
          <div
            id="panel-alumni"
            role="tabpanel"
            aria-labelledby="tab-alumni"
            className="dept-panel-stack"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">Graduating Cohorts &amp; Industry Mentors</span>
                <h2 className="serif dept-section-heading">
                  {department.name} Alumni Spotlight
                </h2>
              </div>
              <Link href="/yearbook" className="text-link">
                Open Living Digital Yearbook
                <ArrowRight size={16} />
              </Link>
            </div>

            {initialAlumni.length > 0 ? (
              <ul className="dept-person-grid">
                {initialAlumni.map((alum) => {
                  const sess = sessionMap.get(alum.sessionSlug);
                  return (
                    <li key={alum.slug} className="dept-person-card">
                      <div className="dept-person-media">
                        {alum.photoUrl ? (
                          <Image
                            src={alum.photoUrl}
                            alt={alum.fullName}
                            fill
                            sizes="(max-width: 680px) 100vw, 320px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="dept-person-monogram" aria-hidden="true">
                            <span className="serif">{initials(alum.fullName)}</span>
                          </div>
                        )}
                        <span className="caps dept-person-tier-badge">
                          Cohort {alum.sessionSlug}
                        </span>
                      </div>

                      <div className="dept-person-body">
                        <span className="caps dept-person-role">
                          {alum.roleTitle} · {department.shortName}
                        </span>
                        <h3 className="serif dept-person-name">{alum.fullName}</h3>
                        <p className="dept-person-dept">
                          {sess ? sess.name : `${alum.sessionSlug} Academic Session`}
                        </p>

                        <div className="dept-person-socials">
                          <span className="caps text-[10px] text-[var(--green)]">Verified Graduate</span>
                          <Link href="/yearbook" className="text-link text-xs">
                            Yearbook Record
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="dept-empty-state">
                <h3 className="serif text-2xl">
                  {department.shortName} Graduating Cohort Archive
                </h3>
                <p>
                  No alumni spotlight records are currently indexed under {department.name} ({department.shortName}).
                  Graduates can sign in with Google to claim and verify their yearbook profile.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/yearbook" className="btn btn-dark btn-sm">
                    Browse Full Faculty Yearbook
                    <ArrowRight size={15} />
                  </Link>
                  <Link href="/login" className="btn btn-line btn-sm">
                    Claim Alumni Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* 6. Notices */}
        {activeTab === "notices" ? (
          <div
            id="panel-notices"
            role="tabpanel"
            aria-labelledby="tab-notices"
            className="dept-panel-stack"
          >
            <div className="dept-panel-header">
              <div>
                <span className="caps eyebrow accent">
                  Announcements, SIWES Circulars &amp; Updates · {department.shortName}
                </span>
                <h2 className="serif dept-section-heading">
                  Departmental Notices &amp; Bulletins
                </h2>
              </div>
              <Link href="/blog" className="text-link">
                Faculty Newsroom
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="dept-notices-grid">
              {initialOpportunities.map((opp) => (
                <article key={opp.slug} className="dept-notice-card">
                  <div className="dept-notice-meta">
                    <span className="caps dept-notice-badge">
                      {opp.departmentSlug === department.slug
                        ? `${department.shortName} Direct Notice`
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
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link text-sm"
                    >
                      Application Details
                      <ArrowRight size={15} />
                    </a>
                  </footer>
                </article>
              ))}

              {posts.map((post) => (
                <article key={post.slug} className="dept-notice-card">
                  <div className="dept-notice-meta">
                    <span className="caps dept-notice-badge">Official Bulletin</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <Calendar size={13} />
                      <span>Published {formatReadableDate(post.publishedAt)}</span>
                    </span>
                  </div>

                  <h3 className="serif dept-notice-title">{post.title}</h3>
                  <p className="dept-notice-excerpt">{post.excerpt}</p>

                  <footer className="dept-notice-foot">
                    <span className="caps text-[10px] text-[var(--muted)]">
                      NACOS UNIUYO &amp; {department.shortName}
                    </span>
                    <Link href={`/blog/${post.slug}`} className="text-link text-sm">
                      Read Dispatch
                      <ArrowRight size={15} />
                    </Link>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
