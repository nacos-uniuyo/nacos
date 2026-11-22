"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { projectCategories, type ProjectCategory } from "@/lib/enums";
import { trpc } from "@/lib/trpc/client";
import type { DepartmentSummary, ProjectSummary } from "@/server/contracts";

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  cybersecurity: "Cybersecurity",
  embedded_systems_hardware: "Embedded Systems",
  software_engineering: "Software Engineering",
  artificial_intelligence_data: "AI & Data Science",
  information_systems_networking: "Information Systems",
  theoretical_computing_research: "Academic Research",
  interdisciplinary: "Interdisciplinary",
};

export interface ProjectsGalleryProps {
  initialProjects: ProjectSummary[];
  departments: DepartmentSummary[];
}

export function ProjectsGallery({ initialProjects, departments }: ProjectsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">("all");

  const queryInput =
    selectedCategory === "all"
      ? undefined
      : {
          category: selectedCategory,
        };

  const { data: fetchedProjects = initialProjects } = trpc.project.list.useQuery(queryInput, {
    initialData: queryInput === undefined ? initialProjects : undefined,
  });

  const departmentMap = useMemo(
    () => new Map(departments.map((d) => [d.slug, d])),
    [departments]
  );

  // Determine categories that actually have projects
  const availableCategories = useMemo(() => {
    const present = new Set(initialProjects.map((p) => p.category));
    return projectCategories.filter((cat) => present.has(cat));
  }, [initialProjects]);

  return (
    <div className="flex flex-col gap-12">
      {/* Centered Segmented Pill Bar */}
      <div className="flex justify-center w-full">
        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="segmented-filter-bar"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
            className={`segmented-filter-btn ${selectedCategory === "all" ? "active" : ""}`}
          >
            All Projects
          </button>
          {availableCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat)}
                className={`segmented-filter-btn ${isActive ? "active" : ""}`}
              >
                {PROJECT_CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Clean Enclosed Card Grid */}
      {fetchedProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full text-left">
          {fetchedProjects.map((project, idx) => {
            const dept = departmentMap.get(project.departmentSlug);
            const initials = (project.teamDisplayName ?? "NACOS")
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase())
              .join("");

            return (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group flex flex-col no-underline text-inherit bg-white rounded-[20px] border border-[rgba(15,26,19,0.12)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Visual Cover Container */}
                <div className="w-full aspect-[16/10] bg-[var(--forest)] overflow-hidden relative flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="caps text-[10px] font-semibold tracking-wider text-[var(--gold)]">
                      {PROJECT_CATEGORY_LABELS[project.category] ?? project.category}
                    </span>
                    {project.courseCode ? (
                      <span className="caps text-[10px] text-[var(--mint-2)]">
                        {project.courseCode}
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <span className="serif text-4xl sm:text-5xl text-[var(--mint)] leading-none block">
                      {project.courseCode ?? `0${idx + 1}`}
                    </span>
                    <span className="caps text-[10px] text-[var(--mint-2)] mt-1.5 block">
                      Department of {dept ? dept.name : project.departmentSlug}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-col flex-1 justify-between p-6 gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="serif text-xl sm:text-2xl text-[var(--ink)] group-hover:text-[var(--green)] transition-colors line-clamp-2 leading-snug m-0">
                      {project.title}
                    </h3>

                    <p className="text-sm text-[var(--muted)] line-clamp-2 leading-relaxed m-0">
                      {project.tagline}
                    </p>
                  </div>

                  {/* Metadata Row: Avatar + Contributor, Session */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-[rgba(15,26,19,0.08)]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--forest)] text-[var(--mint)] text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {initials || "N"}
                      </div>
                      <span className="text-xs font-medium text-[var(--ink)] line-clamp-1">
                        {project.teamDisplayName ?? "NACOS Project Team"}
                      </span>
                    </div>

                    <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                      2024/2025
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="dept-empty-state">
          <h3 className="serif text-2xl">No Projects Found</h3>
          <p>There are no projects currently available in this category.</p>
          <button
            type="button"
            className="btn btn-dark btn-sm mt-2"
            onClick={() => setSelectedCategory("all")}
          >
            Show All Projects
          </button>
        </div>
      )}
    </div>
  );
}
