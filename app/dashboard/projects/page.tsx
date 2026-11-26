"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  FolderGit2,
  FolderPlus,
  Pencil,
  Search,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/dashboard/DashboardStates";
import { PillTabs } from "@/components/dashboard/PillTabs";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OpportunityStatus } from "@/lib/enums";
import { formatDate, projectCategoryLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

type FilterKey = "all" | OpportunityStatus;

export default function MyProjectsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const utils = trpc.useUtils();

  const { data: projects, isLoading, error } = trpc.project.mySubmissions.useQuery();

  const counts = useMemo(() => {
    const list = projects ?? [];
    return {
      all: list.length,
      submitted: list.filter((p) => p.status === "submitted").length,
      approved: list.filter((p) => p.status === "approved").length,
      rejected: list.filter((p) => p.status === "rejected").length,
      draft: list.filter((p) => p.status === "draft").length,
    };
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (projects ?? []).filter((proj) => {
      if (filter !== "all" && proj.status !== filter) return false;
      if (!q) return true;
      return (
        proj.title.toLowerCase().includes(q) ||
        proj.tagline.toLowerCase().includes(q) ||
        (proj.departmentName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [projects, filter, search]);

  const tabs = [
    { value: "all", label: "All", count: counts.all },
    { value: "submitted", label: "In Review", count: counts.submitted },
    { value: "approved", label: "Approved", count: counts.approved },
    { value: "rejected", label: "Changes", count: counts.rejected },
    { value: "draft", label: "Drafts", count: counts.draft },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Projects"
        action={
          <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
            <Link
              href="/dashboard/projects/submit"
              onMouseEnter={() => {
                void utils.department.list.prefetch();
                void utils.session.list.prefetch();
              }}
              onFocus={() => {
                void utils.department.list.prefetch();
                void utils.session.list.prefetch();
              }}
            >
              <FolderPlus className="size-3.5" />
              Submit Project
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs
          label="Filter projects by status"
          value={filter}
          onValueChange={setFilter}
          tabs={tabs}
        />

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl bg-card pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState title="Could not load projects" message={error.message} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="size-5" />}
          title={projects?.length ? "No matching projects" : "No projects yet"}
          action={
            <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
              <Link href="/dashboard/projects/submit">Submit a project</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((proj) => {
            const canEdit = proj.status === "draft" || proj.status === "rejected";
            return (
              <article
                key={proj.id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-2xs transition-colors hover:border-primary/30"
              >
                <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-[#062a14] via-[#0f4a26] to-[#163d25]">
                  {proj.bannerUrl ? (
                    <Image
                      src={proj.bannerUrl}
                      alt={proj.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col justify-between p-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d8b45c]">
                        {projectCategoryLabels[proj.category]}
                      </span>
                      <FolderGit2 className="size-8 text-white/25" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <StatusBadge status={proj.status} className="bg-card/95 backdrop-blur-xs" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                      <span className="truncate">{proj.departmentName ?? "Computing"}</span>
                      <span>·</span>
                      <span className="shrink-0">{formatDate(proj.createdAt)}</span>
                    </div>
                    <h2 className="line-clamp-1 text-base font-semibold text-foreground">
                      {proj.title}
                    </h2>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{proj.tagline}</p>
                  </div>

                  {proj.status === "rejected" && proj.rejectionReason ? (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/8 p-3 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                      <p className="line-clamp-2">{proj.rejectionReason}</p>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between gap-2 border-t pt-3">
                    <span className="truncate text-[11px] text-muted-foreground">
                      {projectCategoryLabels[proj.category]}
                    </span>
                    {proj.status === "approved" ? (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-xl px-3 text-xs"
                      >
                        <Link href={`/projects/${proj.slug}`} target="_blank">
                          <ExternalLink className="size-3" />
                          Live
                        </Link>
                      </Button>
                    ) : canEdit ? (
                      <Button asChild size="sm" className="h-8 rounded-xl px-3 text-xs">
                        <Link
                          href={`/dashboard/projects/submit?edit=${proj.id}`}
                          onMouseEnter={() => {
                            void utils.project.getMySubmission.prefetch({ id: proj.id });
                            void utils.department.list.prefetch();
                            void utils.session.list.prefetch();
                          }}
                          onFocus={() => {
                            void utils.project.getMySubmission.prefetch({ id: proj.id });
                            void utils.department.list.prefetch();
                            void utils.session.list.prefetch();
                          }}
                        >
                          <Pencil className="size-3" />
                          {proj.status === "rejected" ? "Fix & Resubmit" : "Edit"}
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
