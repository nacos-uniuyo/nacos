"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, GithubIcon, QuoteMark } from "@/components/icons";
import type { RoleTier } from "@/lib/enums";
import { initials } from "@/lib/executives";
import { trpc } from "@/lib/trpc/client";
import type { DepartmentSummary, PersonSummary, SchoolSessionSummary } from "@/server/contracts";

export const TIER_DISPLAY_LABELS: Record<RoleTier, string> = {
  alumni: "Graduating Class · Alumni",
  elected_exco: "Elected Executive Council",
  dev_team: "Software & Dev Team",
  aide: "Executive Aide",
};

export function getMemberQuote(person: PersonSummary, deptName?: string) {
  if (person.tier === "alumni") {
    return `Graduating from the Department of ${deptName ?? "Computing"} at the University of Uyo with a commitment to rigorous engineering and mentorship for rising cohorts.`;
  }
  if (person.tier === "elected_exco") {
    return `Serving the Nigeria Association of Computing Students (NACOS UNIUYO) as ${person.roleTitle}, advancing transparency, academic excellence, and student innovation.`;
  }
  if (person.tier === "dev_team") {
    return `Engineering permanent digital infrastructure for the Faculty of Computing as ${person.roleTitle} during the ${person.sessionSlug} session.`;
  }
  return `Supporting chapter administration and student documentation as ${person.roleTitle} in the ${person.sessionSlug} academic session.`;
}

export function getMemberHonours(person: PersonSummary) {
  if (person.tier === "alumni") {
    return "B.Sc. Honours · Graduating Cohort Fellow";
  }
  if (person.tier === "elected_exco") {
    return "4th Executive Council · Meritorious Service";
  }
  if (person.tier === "dev_team") {
    return "Software Directorate · Core Systems Engineer";
  }
  return "Executive Secretariat · Chapter Citation";
}

export interface YearbookViewProps {
  mode: "yearbook" | "alumni";
  sessions: SchoolSessionSummary[];
  departments: DepartmentSummary[];
  initialRosterBySession: Record<string, PersonSummary[]>;
}

export function YearbookView({
  mode,
  sessions,
  departments,
  initialRosterBySession,
}: YearbookViewProps) {
  const defaultSessionSlug =
    mode === "alumni"
      ? "all"
      : (sessions.find((s) => !s.isCurrent)?.slug ?? sessions[0]?.slug ?? "2022-2023");

  const [selectedSession, setSelectedSession] = useState<string>(defaultSessionSlug);
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<RoleTier | "all">(
    mode === "alumni" ? "all" : "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const activeSingleSession =
    selectedSession === "all" ? (sessions[0]?.slug ?? "2024-2025") : selectedSession;

  const { data: liveSessionRoster } = trpc.roster.bySession.useQuery(
    { sessionSlug: activeSingleSession },
    {
      initialData: initialRosterBySession[activeSingleSession],
      enabled: selectedSession !== "all",
    },
  );

  const allCombined = Object.values(initialRosterBySession).flat();
  const baseList =
    selectedSession === "all"
      ? allCombined
      : (liveSessionRoster ?? initialRosterBySession[selectedSession] ?? []);

  const departmentMap = new Map(departments.map((d) => [d.slug, d]));
  const sessionMap = new Map(sessions.map((s) => [s.slug, s]));
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = baseList.filter((person) => {
    if (selectedDept !== "all" && person.departmentSlug !== selectedDept) return false;
    if (selectedTier !== "all" && person.tier !== selectedTier) return false;

    if (normalizedQuery) {
      const dept = person.departmentSlug ? departmentMap.get(person.departmentSlug) : null;
      const haystack = [
        person.fullName,
        person.roleTitle,
        person.sessionSlug,
        TIER_DISPLAY_LABELS[person.tier] ?? person.tier,
        dept?.name ?? "",
        dept?.shortName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  });

  const activeSessionObj = selectedSession !== "all" ? sessionMap.get(selectedSession) : null;

  function resetFilters() {
    setSelectedSession(defaultSessionSlug);
    setSelectedDept("all");
    setSelectedTier("all");
    setSearchQuery("");
  }

  return (
    <div className="portal-explorer-stack">
      {/* Filter Toolbar */}
      <div className="portal-filter-panel">
        <div className="portal-search-row">
          <div className="portal-search-field">
            <label htmlFor="yearbook-search" className="sr-only">
              Search graduates, alumni, and cohort members
            </label>
            <input
              id="yearbook-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name, role, honours, or department…"
              className="portal-search-input"
            />
          </div>

          <div className="portal-filter-summary">
            <span className="caps text-xs text-[var(--muted)]">
              {filtered.length} Cohort Record{filtered.length === 1 ? "" : "s"}
            </span>
            <button type="button" className="portal-reset-btn" onClick={resetFilters}>
              Reset view
            </button>
          </div>
        </div>

        {/* Academic Session Selector */}
        <div className="portal-filter-group">
          <span className="caps portal-filter-label">Academic Session Cohort</span>
          <div className="portal-pill-row" role="group" aria-label="Select academic session">
            <button
              type="button"
              className={`portal-filter-pill${selectedSession === "all" ? " active" : ""}`}
              onClick={() => setSelectedSession("all")}
            >
              All Sessions (2022–2025)
            </button>
            {sessions.map((sess) => (
              <button
                key={sess.slug}
                type="button"
                className={`portal-filter-pill${selectedSession === sess.slug ? " active" : ""}`}
                onClick={() => setSelectedSession(sess.slug)}
              >
                <span>{sess.name}</span>
                {sess.theme ? (
                  <span className="ml-1.5 text-xs opacity-75">· &ldquo;{sess.theme}&rdquo;</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Department Selector */}
        <div className="portal-filter-group">
          <span className="caps portal-filter-label">Department</span>
          <div className="portal-pill-row" role="group" aria-label="Filter by department">
            <button
              type="button"
              className={`portal-filter-pill${selectedDept === "all" ? " active" : ""}`}
              onClick={() => setSelectedDept("all")}
            >
              All 5 Departments
            </button>
            {departments.map((dept) => (
              <button
                key={dept.slug}
                type="button"
                className={`portal-filter-pill${selectedDept === dept.slug ? " active" : ""}`}
                onClick={() => setSelectedDept(dept.slug)}
              >
                <span className="caps mr-1.5 text-[10px] opacity-75">{dept.shortName}</span>
                <span>{dept.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cohort Tier Filter */}
        <div className="portal-filter-group">
          <span className="caps portal-filter-label">Cohort Roll / Tier</span>
          <div className="portal-pill-row" role="group" aria-label="Filter by cohort role tier">
            <button
              type="button"
              className={`portal-filter-pill${selectedTier === "all" ? " active" : ""}`}
              onClick={() => setSelectedTier("all")}
            >
              Complete Cohort &amp; Alumni Roll
            </button>
            <button
              type="button"
              className={`portal-filter-pill${selectedTier === "alumni" ? " active" : ""}`}
              onClick={() => setSelectedTier("alumni")}
            >
              Graduating Seniors &amp; Alumni
            </button>
            <button
              type="button"
              className={`portal-filter-pill${selectedTier === "elected_exco" ? " active" : ""}`}
              onClick={() => setSelectedTier("elected_exco")}
            >
              Elected Executives
            </button>
            <button
              type="button"
              className={`portal-filter-pill${selectedTier === "dev_team" ? " active" : ""}`}
              onClick={() => setSelectedTier("dev_team")}
            >
              Software &amp; Dev Team
            </button>
            <button
              type="button"
              className={`portal-filter-pill${selectedTier === "aide" ? " active" : ""}`}
              onClick={() => setSelectedTier("aide")}
            >
              Executive Aides
            </button>
          </div>
        </div>
      </div>

      {/* Active Session Theme Banner */}
      {activeSessionObj ? (
        <div className="yearbook-session-banner">
          <div>
            <span className="caps text-[10.5px] text-[var(--gold)]">
              Official Session Archive · {activeSessionObj.slug}
            </span>
            <h2 className="serif text-3xl text-white sm:text-4xl">
              {activeSessionObj.name}
              {activeSessionObj.theme ? (
                <span className="it gold ml-2">({activeSessionObj.theme})</span>
              ) : null}
            </h2>
          </div>
          <span className="caps rounded-full border border-white/20 px-3.5 py-1.5 text-[10.5px] text-[var(--mint-2)]">
            {activeSessionObj.isCurrent ? "Current Session" : "Archived Cohort Set"}
          </span>
        </div>
      ) : null}

      {/* Yearbook & Alumni Grid */}
      {filtered.length > 0 ? (
        <ul className="yearbook-grid">
          {filtered.map((person, index) => {
            const dept = person.departmentSlug ? departmentMap.get(person.departmentSlug) : null;
            const quote = getMemberQuote(person, dept?.name);
            const honours = getMemberHonours(person);

            return (
              <li key={`${person.slug}-${person.sessionSlug}-${index}`} className="yearbook-card card reveal">
                <Link href={`/alumni/${person.slug}`} className="yearbook-portrait-link">
                  <div className="yearbook-portrait">
                    {person.photoUrl ? (
                      <Image
                        src={person.photoUrl}
                        alt={person.fullName}
                        fill
                        sizes="(max-width: 680px) 100vw, 340px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="yearbook-monogram" aria-hidden="true">
                        <span className="serif">{initials(person.fullName)}</span>
                      </div>
                    )}
                    <div className="yearbook-portrait-badges">
                      <span className="caps yearbook-session-chip">{person.sessionSlug}</span>
                      {dept ? <span className="caps yearbook-dept-chip">{dept.shortName}</span> : null}
                    </div>
                  </div>
                </Link>

                <div className="yearbook-card-body">
                  <div className="yearbook-card-head">
                    <span className="caps yearbook-role-tag">
                      {person.roleTitle} · {TIER_DISPLAY_LABELS[person.tier]}
                    </span>
                    <h3 className="serif yearbook-person-name">
                      <Link href={`/alumni/${person.slug}`}>{person.fullName}</Link>
                    </h3>
                    <span className="yearbook-honours-badge">{honours}</span>
                  </div>

                  <blockquote className="yearbook-quote">
                    <QuoteMark size={16} className="shrink-0 text-[var(--gold)]" />
                    <p>&ldquo;{quote}&rdquo;</p>
                  </blockquote>

                  <footer className="yearbook-card-foot">
                    <div className="flex items-center gap-2">
                      <span
                        className="project-icon-link"
                        title="Verified Profile"
                        aria-hidden="true"
                      >
                        <GithubIcon size={14} />
                      </span>
                      <span className="text-xs text-[var(--muted)]">
                        {dept ? dept.name : "Faculty of Computing"}
                      </span>
                    </div>

                    <Link href={`/alumni/${person.slug}`} className="project-detail-link">
                      <span>Profile</span>
                      <ArrowRight size={14} />
                    </Link>
                  </footer>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="dept-empty-state">
          <h3 className="serif text-2xl">No Cohort Records Found for This Selection</h3>
          <p>
            Switch academic sessions or clear your department filter to view all graduating seniors, alumni, and
            session officers.
          </p>
          <button type="button" className="btn btn-dark btn-sm mt-2" onClick={resetFilters}>
            Show All Cohort Records
          </button>
        </div>
      )}

      {/* Claim Alumni Profile Callout */}
      <div className="portal-submit-callout">
        <div>
          <span className="caps eyebrow accent">Graduates &amp; Double-Batch Cohort (22/23 &amp; 24/25)</span>
          <h2 className="serif text-3xl sm:text-4xl">Claim your UNIUYO Yearbook Profile</h2>
          <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-[var(--muted)]">
            Sign in with your Google account and link your University of Uyo registration number (e.g.{" "}
            <code>22/SC/CO/1199</code>) to update your yearbook quote, current company, and verified LinkedIn,
            GitHub, and portfolio links.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-dark">
            Claim Alumni Profile
            <ArrowRight size={16} />
          </Link>
          {mode === "yearbook" ? (
            <Link href="/alumni" className="btn btn-line">
              Open Alumni Directory
            </Link>
          ) : (
            <Link href="/yearbook" className="btn btn-line">
              Open Session Yearbook
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
