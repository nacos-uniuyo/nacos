"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ChevronRight,
  Clock,
  FolderOpen,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
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
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          Department Console
        </p>
        <h1 className="serif mt-1 text-3xl font-bold tracking-tight text-[var(--ink)]">
          Project Review Queue
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Review and moderate project proposals submitted by students.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
        <Input
          placeholder="Search title, team, course code…"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              statusFilter === tab.value
                ? "border-[var(--forest)] bg-[var(--forest)] text-white"
                : "border-[var(--rule)] bg-white text-[var(--muted)] hover:border-[var(--forest)] hover:text-[var(--forest)]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-[var(--muted)]" />
        </div>
      ) : error ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
          <AlertCircle className="size-7 text-destructive" />
          <p className="text-sm font-medium text-[var(--ink)]">Failed to load projects</p>
          <p className="text-xs text-[var(--muted)]">{error.message}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--rule)] bg-[var(--sand)]/30 text-center">
          <FolderOpen className="size-8 text-[var(--muted)]" />
          <div>
            <p className="font-medium text-[var(--ink)]">No proposals found</p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {debouncedSearch
                ? "Try adjusting your search terms."
                : statusFilter !== "all"
                  ? `No ${statusFilter} proposals in this department.`
                  : "No project proposals have been submitted yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--muted)]">
            {projects.length} proposal{projects.length !== 1 ? "s" : ""} found
          </p>
          <div className="divide-y divide-[var(--rule)] overflow-hidden rounded-xl border border-[var(--rule)] bg-white shadow-xs">
            {projects.map((proj) => (
              <Link
                key={proj.id}
                href={`/admin/departments/projects/${proj.slug}`}
                className="group flex items-start justify-between gap-4 p-5 transition-colors hover:bg-[var(--sand)]/30"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={proj.status as "draft" | "submitted" | "approved" | "rejected"} />
                    {proj.status === "submitted" && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                        <Clock className="size-3" />
                        Needs Review
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[var(--ink)] group-hover:text-[var(--forest)] transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                  {proj.tagline && (
                    <p className="text-sm text-[var(--muted)] line-clamp-1">{proj.tagline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                    {proj.author?.name && (
                      <span className="font-medium text-[var(--ink)]">{proj.author.name}</span>
                    )}
                    {proj.author?.regNumber && <span>{proj.author.regNumber}</span>}
                    {proj.courseCode && (
                      <span className="rounded bg-[var(--sand)] px-1.5 py-0.5 font-mono text-[0.7rem]">
                        {proj.courseCode}
                      </span>
                    )}
                    {proj.session?.name && <span>{proj.session.name}</span>}
                    {proj.teamDisplayName && (
                      <span className="text-[var(--forest)]">{proj.teamDisplayName}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--forest)]" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
