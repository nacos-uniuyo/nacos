"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Clock, FolderOpen, Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

type ProjectStatus = "draft" | "submitted" | "approved" | "rejected";

const STATUS_TABS: { label: string; value: ProjectStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending Review", value: "submitted" },
  { label: "Approved", value: "approved" },
  { label: "Changes Requested", value: "rejected" },
  { label: "Draft", value: "draft" },
];

export default function CoordinatorProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    const id = setTimeout(() => setDebouncedSearch(value), 350);
    debounceRef[1](id);
  }

  const { data, isLoading, error } = trpc.coordinator.listProjects.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch.trim() || undefined,
  });

  const projects = data?.projects ?? [];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Project Review Queue"
        description="Review and moderate project proposals submitted by students in your department."
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, team, course code…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : error ? (
        <ErrorState title="Failed to load projects" message={error.message} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="size-5" />}
          title="No proposals found"
          description={
            debouncedSearch
              ? "Try adjusting your search terms."
              : statusFilter !== "all"
                ? `No ${statusFilter} proposals in this department.`
                : "No project proposals have been submitted yet."
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {projects.length} proposal{projects.length !== 1 ? "s" : ""} found
          </p>
          <Card className="divide-y overflow-hidden py-0">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/dashboard/departments/projects/${proj.slug}`}
                className="group flex items-start justify-between gap-4 p-5 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={proj.status as ProjectStatus} />
                    {proj.status === "submitted" && (
                      <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-600 dark:text-amber-400">
                        <Clock className="size-3" />
                        Needs Review
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary line-clamp-1">
                    {proj.title}
                  </h3>
                  {proj.tagline && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{proj.tagline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {proj.author?.name && (
                      <span className="font-medium text-foreground">{proj.author.name}</span>
                    )}
                    {proj.author?.regNumber && <span>{proj.author.regNumber}</span>}
                    {proj.courseCode && (
                      <Badge variant="secondary" className="font-mono text-[0.7rem]">
                        {proj.courseCode}
                      </Badge>
                    )}
                    {proj.session?.name && <span>{proj.session.name}</span>}
                    {proj.teamDisplayName && (
                      <span className="font-medium text-primary">{proj.teamDisplayName}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
              </Link>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
