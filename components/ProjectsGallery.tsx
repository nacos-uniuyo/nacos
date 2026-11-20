"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, GithubIcon } from "@/components/icons";
import { projectCategories, type ProjectCategory } from "@/lib/enums";
import { trpc } from "@/lib/trpc/client";
import type { DepartmentSummary, ProjectSummary } from "@/server/contracts";

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  cybersecurity: "Cybersecurity",
  embedded_systems_hardware: "Embedded Systems",
  software_engineering: "Software Engineering",
  artificial_intelligence_data: "AI & Data Science",
  information_systems_networking: "Information Systems & Networking",
  theoretical_computing_research: "Academic Research",
  interdisciplinary: "Interdisciplinary",
};

export interface ProjectsGalleryProps {
  initialProjects: ProjectSummary[];
  departments: DepartmentSummary[];
}

export function ProjectsGallery({ initialProjects, departments }: ProjectsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryInput =
    selectedCategory === "all" && selectedDept === "all"
      ? undefined
      : {
          category: selectedCategory === "all" ? undefined : selectedCategory,
          departmentSlug: selectedDept === "all" ? undefined : selectedDept,
        };

  const { data: fetchedProjects = initialProjects } = trpc.project.list.useQuery(queryInput, {
    initialData: queryInput === undefined ? initialProjects : undefined,
  });

  const departmentMap = new Map(departments.map((d) => [d.slug, d]));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProjects = fetchedProjects.filter((proj) => {
    if (!normalizedQuery) return true;
    const dept = departmentMap.get(proj.departmentSlug);
    const haystack = [
      proj.title,
      proj.tagline,
      proj.courseCode ?? "",
      proj.teamDisplayName ?? "",
      dept?.name ?? "",
      dept?.shortName ?? "",
      PROJECT_CATEGORY_LABELS[proj.category] ?? proj.category,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const hasActiveFilters =
    selectedCategory !== "all" || selectedDept !== "all" || normalizedQuery.length > 0;

  function resetFilters() {
    setSelectedCategory("all");
    setSelectedDept("all");
    setSearchQuery("");
  }

  return (
    <div className="portal-explorer-stack">
      {/* Filter & Search Toolbar */}
      <div className="portal-filter-panel">
        <div className="portal-search-row">
          <div className="portal-search-field">
            <label htmlFor="project-search" className="sr-only">
              Search student and faculty projects
            </label>
            <input
              id="project-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project title, course code (e.g. CYB 411, CSC 415), team, or keyword…"
              className="portal-search-input"
            />
          </div>

          <div className="portal-filter-summary">
            <span className="caps text-xs text-[var(--muted)]">
              Showing {filteredProjects.length} of {initialProjects.length} Approved Projects
            </span>
            {hasActiveFilters ? (
              <button type="button" className="portal-reset-btn" onClick={resetFilters}>
                Reset filters
              </button>
            ) : null}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="portal-filter-group">
          <span className="caps portal-filter-label">Category</span>
          <div className="portal-pill-row" role="group" aria-label="Filter by computing category">
            <button
              type="button"
              className={`portal-filter-pill${selectedCategory === "all" ? " active" : ""}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </button>
            {projectCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`portal-filter-pill${selectedCategory === cat ? " active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {PROJECT_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filter Pills */}
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
      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length > 0 ? (
        <div className="project-showcase-grid">
          {filteredProjects.map((proj, idx) => {
            const dept = departmentMap.get(proj.departmentSlug);
            return (
              <article
                key={proj.slug}
                className={`project-showcase-card card reveal${proj.featured ? " featured" : ""}`}
              >
                <div className="project-showcase-banner" aria-hidden="true">
                  <div className="project-banner-top">
                    <span className="caps project-cat-pill">
                      {PROJECT_CATEGORY_LABELS[proj.category] ?? proj.category}
                    </span>
                    {proj.featured ? (
                      <span className="caps project-featured-badge">Featured Showcase</span>
                    ) : null}
                  </div>

                  <div className="project-banner-art">
                    <span className="serif project-banner-code">
                      {proj.courseCode ?? dept?.shortName ?? `0${idx + 1}`}
                    </span>
                    <span className="caps project-banner-dept">
                      {dept ? `Department of ${dept.name}` : proj.departmentSlug}
                    </span>
                  </div>
                </div>

                <div className="project-showcase-content">
                  <div className="project-showcase-meta">
                    <Link
                      href={`/departments/${proj.departmentSlug}`}
                      className="caps project-dept-link"
                    >
                      {dept ? `${dept.shortName} · ${dept.name}` : proj.departmentSlug}
                    </Link>
                    {proj.courseCode ? (
                      <span className="caps project-course-chip">{proj.courseCode}</span>
                    ) : null}
                  </div>

                  <h2 className="serif project-showcase-title">
                    <Link href={`/projects/${proj.slug}`}>{proj.title}</Link>
                  </h2>

                  <p className="project-showcase-tagline">{proj.tagline}</p>

                  <footer className="project-showcase-foot">
                    <div className="project-team-meta">
                      <span className="caps text-[10px] text-[var(--muted)]">Team / Cohort Group</span>
                      <span className="text-xs font-semibold text-[var(--ink)]">
                        {proj.teamDisplayName ?? (dept ? `${dept.shortName} Research Team` : "NACOS Team")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {proj.repoUrl ? (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-icon-link"
                          aria-label={`${proj.title} source repository`}
                        >
                          <GithubIcon size={16} />
                        </a>
                      ) : null}
                      {proj.demoUrl ? (
                        <a
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-line btn-sm"
                        >
                          Live Demo
                        </a>
                      ) : null}
                      <Link href={`/projects/${proj.slug}`} className="project-detail-link">
                        <span>Inspect</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dept-empty-state">
          <h3 className="serif text-2xl">No Projects Match Your Current Filter</h3>
          <p>
            Try clearing your search query or switching department and category filters to view all approved
            student and faculty innovations.
          </p>
          <button type="button" className="btn btn-dark btn-sm mt-2" onClick={resetFilters}>
            Show All Projects
          </button>
        </div>
      )}

      {/* Submission Callout Banner */}
      <div className="portal-submit-callout">
        <div>
          <span className="caps eyebrow accent">Student &amp; Coursework Submissions</span>
          <h2 className="serif text-3xl sm:text-4xl">Built a project in your department?</h2>
          <p className="mt-2 max-w-[540px] text-sm leading-relaxed text-[var(--muted)]">
            Sign in with your Google account to submit final-year research, class group assignments (Groups 1–10),
            cybersecurity tools, or embedded hardware rigs for departmental coordinator approval.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-dark">
            Submit Project Proposal
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
