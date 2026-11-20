"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Calendar, Clock, Pin } from "@/components/icons";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import { opportunityTypes, type OpportunityType } from "@/lib/enums";
import { initials } from "@/lib/executives";
import { trpc } from "@/lib/trpc/client";
import type { DepartmentSummary, OpportunitySummary } from "@/server/contracts";

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  siwes_it: "SIWES / Industrial Training",
  scholarship: "Scholarship & Research Grant",
  sponsorship: "Sponsorship & Mentorship",
  partnership: "Industry Partnership",
  job: "Graduate Placement / Job",
};

type ScopeFilter = "all" | "faculty" | "department";
type DeadlineFilter = "all" | "upcoming" | "rolling";

function getDeadlineStatus(deadlineIso: string | null) {
  if (!deadlineIso) {
    return {
      label: "Rolling Application · Open",
      formatted: "No fixed deadline",
      isOpen: true,
      urgent: false,
    };
  }

  const deadlineDate = new Date(deadlineIso);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(deadlineDate);

  if (diffDays < 0) {
    return {
      label: "Window Closed",
      formatted,
      isOpen: false,
      urgent: false,
    };
  }

  if (diffDays <= 14) {
    return {
      label: `${diffDays} day${diffDays === 1 ? "" : "s"} remaining · Closing soon`,
      formatted,
      isOpen: true,
      urgent: true,
    };
  }

  return {
    label: `${diffDays} days remaining`,
    formatted,
    isOpen: true,
    urgent: false,
  };
}

export interface OpportunitiesFeedProps {
  initialOpportunities: OpportunitySummary[];
  departments: DepartmentSummary[];
}

export function OpportunitiesFeed({ initialOpportunities, departments }: OpportunitiesFeedProps) {
  const [selectedType, setSelectedType] = useState<OpportunityType | "all">("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedScope, setSelectedScope] = useState<ScopeFilter>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryInput =
    selectedType === "all" && selectedDept === "all"
      ? undefined
      : {
          type: selectedType === "all" ? undefined : selectedType,
          departmentSlug: selectedDept === "all" ? undefined : selectedDept,
        };

  const { data: fetchedOpportunities = initialOpportunities } = trpc.opportunity.list.useQuery(
    queryInput,
    {
      initialData: queryInput === undefined ? initialOpportunities : undefined,
    },
  );

  const departmentMap = new Map(departments.map((d) => [d.slug, d]));
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = fetchedOpportunities.filter((opp) => {
    if (selectedScope === "faculty" && opp.departmentSlug !== null) return false;
    if (selectedScope === "department" && opp.departmentSlug === null) return false;

    if (deadlineFilter === "upcoming" && !opp.deadline) return false;
    if (deadlineFilter === "rolling" && opp.deadline !== null) return false;

    if (normalizedQuery) {
      const dept = opp.departmentSlug ? departmentMap.get(opp.departmentSlug) : null;
      const haystack = [
        opp.title,
        opp.orgName,
        opp.location,
        OPPORTUNITY_TYPE_LABELS[opp.type] ?? opp.type,
        dept?.name ?? "Faculty-wide",
        dept?.shortName ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(normalizedQuery)) return false;
    }

    return true;
  });

  const hasFilters =
    selectedType !== "all" ||
    selectedDept !== "all" ||
    selectedScope !== "all" ||
    deadlineFilter !== "all" ||
    normalizedQuery.length > 0;

  function resetFilters() {
    setSelectedType("all");
    setSelectedDept("all");
    setSelectedScope("all");
    setDeadlineFilter("all");
    setSearchQuery("");
  }

  return (
    <div className="portal-explorer-stack">
      {/* Filter Panel */}
      <div className="portal-filter-panel">
        <div className="portal-search-row">
          <div className="portal-search-field">
            <label htmlFor="opp-search" className="sr-only">
              Search SIWES placements, scholarships, and opportunities
            </label>
            <input
              id="opp-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, organization (e.g. Sterling Bank, Multinational ICT), or location…"
              className="portal-search-input"
            />
          </div>

          <div className="portal-filter-summary">
            <span className="caps text-xs text-[var(--muted)]">
              {filtered.length} Verified Listing{filtered.length === 1 ? "" : "s"}
            </span>
            {hasFilters ? (
              <button type="button" className="portal-reset-btn" onClick={resetFilters}>
                Clear filters
              </button>
            ) : null}
          </div>
        </div>

        {/* Opportunity Type Pills */}
        <div className="portal-filter-group">
          <span className="caps portal-filter-label">Opportunity Type</span>
          <div className="portal-pill-row" role="group" aria-label="Filter by opportunity type">
            <button
              type="button"
              className={`portal-filter-pill${selectedType === "all" ? " active" : ""}`}
              onClick={() => setSelectedType("all")}
            >
              All Types
            </button>
            {opportunityTypes.map((t) => (
              <button
                key={t}
                type="button"
                className={`portal-filter-pill${selectedType === t ? " active" : ""}`}
                onClick={() => setSelectedType(t)}
              >
                {OPPORTUNITY_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="portal-filter-group">
          <span className="caps portal-filter-label">Target Department</span>
          <div className="portal-pill-row" role="group" aria-label="Filter by target department">
            <button
              type="button"
              className={`portal-filter-pill${selectedDept === "all" ? " active" : ""}`}
              onClick={() => setSelectedDept("all")}
            >
              All Departments &amp; Faculty-Wide
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

        {/* Scope & Deadline Filters */}
        <div className="flex flex-wrap gap-6 pt-1">
          <div className="portal-filter-group">
            <span className="caps portal-filter-label">Scope</span>
            <div className="portal-pill-row" role="group" aria-label="Filter by scope">
              <button
                type="button"
                className={`portal-filter-pill${selectedScope === "all" ? " active" : ""}`}
                onClick={() => setSelectedScope("all")}
              >
                All Scopes
              </button>
              <button
                type="button"
                className={`portal-filter-pill${selectedScope === "faculty" ? " active" : ""}`}
                onClick={() => setSelectedScope("faculty")}
              >
                Faculty-Wide
              </button>
              <button
                type="button"
                className={`portal-filter-pill${selectedScope === "department" ? " active" : ""}`}
                onClick={() => setSelectedScope("department")}
              >
                Department-Scoped
              </button>
            </div>
          </div>

          <div className="portal-filter-group">
            <span className="caps portal-filter-label">Application Window</span>
            <div className="portal-pill-row" role="group" aria-label="Filter by deadline window">
              <button
                type="button"
                className={`portal-filter-pill${deadlineFilter === "all" ? " active" : ""}`}
                onClick={() => setDeadlineFilter("all")}
              >
                All Deadlines
              </button>
              <button
                type="button"
                className={`portal-filter-pill${deadlineFilter === "upcoming" ? " active" : ""}`}
                onClick={() => setDeadlineFilter("upcoming")}
              >
                Scheduled Deadline
              </button>
              <button
                type="button"
                className={`portal-filter-pill${deadlineFilter === "rolling" ? " active" : ""}`}
                onClick={() => setDeadlineFilter("rolling")}
              >
                Rolling / Ongoing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunity Listings Feed */}
      {filtered.length > 0 ? (
        <div className="opp-feed-list">
          {filtered.map((opp) => {
            const dept = opp.departmentSlug ? departmentMap.get(opp.departmentSlug) : null;
            const deadlineInfo = getDeadlineStatus(opp.deadline);
            const descriptionDoc = `${opp.title} hosted by ${opp.orgName} (${opp.location}). Verified ${OPPORTUNITY_TYPE_LABELS[opp.type] ?? opp.type} listing open to ${dept ? `students in the Department of ${dept.name} (${dept.shortName})` : "undergraduates and graduates across all five computing departments at the University of Uyo"}.`;

            return (
              <article key={opp.slug} className="opp-card card reveal">
                <div className="opp-org-logo" aria-hidden="true">
                  <span className="serif">{initials(opp.orgName)}</span>
                </div>

                <div className="opp-card-main">
                  <div className="opp-card-badges">
                    <span className="caps project-cat-pill">
                      {OPPORTUNITY_TYPE_LABELS[opp.type] ?? opp.type}
                    </span>
                    <span className="caps opp-scope-pill">
                      {dept ? `Dept: ${dept.shortName} · ${dept.name}` : "Scope: Faculty-Wide (All 5 Depts)"}
                    </span>
                    <span
                      className={`caps opp-deadline-pill${deadlineInfo.urgent ? " urgent" : ""}`}
                    >
                      <Clock size={12} />
                      <span>{deadlineInfo.label}</span>
                    </span>
                  </div>

                  <div className="opp-card-header">
                    <h2 className="serif opp-card-title">{opp.title}</h2>
                    <div className="opp-card-submeta">
                      <span className="font-semibold text-[var(--ink)]">{opp.orgName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                        <Pin size={14} />
                        <span>{opp.location}</span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-[var(--muted)]">
                        <Calendar size={14} />
                        <span>Closes: {deadlineInfo.formatted}</span>
                      </span>
                    </div>
                  </div>

                  <div className="opp-card-desc">
                    <RichTextRenderer
                      doc={descriptionDoc}
                      className="text-[15px] leading-relaxed text-[var(--muted)]"
                    />
                  </div>
                </div>

                <div className="opp-card-actions">
                  <a
                    href={opp.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-solid btn-sm w-full"
                  >
                    <span>Apply Now</span>
                    <ArrowRight size={15} />
                  </a>
                  {dept ? (
                    <Link
                      href={`/departments/${dept.slug}`}
                      className="text-center text-xs font-semibold text-[var(--green)] no-underline hover:underline"
                    >
                      {dept.shortName} Department Hub
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dept-empty-state">
          <h3 className="serif text-2xl">No Opportunities Match Your Filters</h3>
          <p>
            Reset your filters to view all verified SIWES placements, scholarships, sponsorships, and graduate
            programmes across the Faculty of Computing.
          </p>
          <button type="button" className="btn btn-dark btn-sm mt-2" onClick={resetFilters}>
            Show All Opportunities
          </button>
        </div>
      )}

      {/* Partner / Student Opportunity Submission Callout */}
      <div className="portal-submit-callout">
        <div>
          <span className="caps eyebrow accent">Industry Partners, Alumni &amp; Members</span>
          <h2 className="serif text-3xl sm:text-4xl">Have a verified SIWES slot or scholarship?</h2>
          <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-[var(--muted)]">
            Every opportunity listing passes faculty moderation (`draft` → `submitted` → `approved`) to protect
            UNIUYO students from unvetted postings. Sign in to submit an opening.
          </p>
        </div>
        <div>
          <Link href="/login" className="btn btn-dark">
            Submit Opportunity Listing
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
