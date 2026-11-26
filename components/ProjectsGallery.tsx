"use client";

import { useMemo, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category");
  const initialCategory =
    initialCategoryParam && initialCategoryParam in PROJECT_CATEGORY_LABELS
      ? (initialCategoryParam as ProjectCategory)
      : "all";

  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | "all">(initialCategory);

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

  const availableCategories = useMemo(() => {
    const present = new Set(initialProjects.map((p) => p.category));
    return projectCategories.filter((cat) => present.has(cat));
  }, [initialProjects]);

  return (
    <div className="flex flex-col gap-12">
      {/* Centered Responsive Pill Bar */}
      <div className="flex justify-center w-full">
        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full max-w-4xl"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "all"}
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-sm dark:bg-[var(--mint)] dark:text-[#062a14] dark:border-[var(--mint)]"
                : "bg-[var(--sand)] text-[var(--muted)] border-[var(--rule)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30"
            }`}
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
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                  isActive
                    ? "bg-[var(--forest)] text-white border-[var(--forest)] shadow-sm dark:bg-[var(--mint)] dark:text-[#062a14] dark:border-[var(--mint)]"
                    : "bg-[var(--sand)] text-[var(--muted)] border-[var(--rule)] hover:text-[var(--ink)] hover:border-[var(--ink)]/30"
                }`}
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
          {fetchedProjects.map((project, idx) => (
            <ProjectCard
              key={project.slug}
              slug={project.slug}
              title={project.title}
              tagline={project.tagline}
              categoryLabel={PROJECT_CATEGORY_LABELS[project.category] ?? project.category}
              courseCode={project.courseCode}
              teamDisplayName={project.teamDisplayName}
              bannerUrl={project.bannerUrl}
              index={idx}
            />
          ))}
        </div>
      ) : (
        <div className="w-full py-16 text-center text-[var(--muted)]">
          <p className="text-base">No projects found in this category.</p>
        </div>
      )}
    </div>
  );
}
