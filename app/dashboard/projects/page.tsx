"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  FolderGit2,
  FolderPlus,
  Plus,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";

type FilterStatus = "all" | "draft" | "submitted" | "approved" | "rejected";

export default function MyProjectsPage() {
  const [filter, setFilter] = useState<FilterStatus>("all");

  const queryInput = filter === "all" ? undefined : { status: filter };
  const { data: projects, isLoading, error } =
    trpc.project.mySubmissions.useQuery(queryInput);

  return (
    <div className="space-y-6">
      <DashboardHeader
        breadcrumbs={[{ label: "Projects" }]}
        title="My Projects & Proposals"
        description="Track the moderation status of your coursework group proposals and showcase submissions."
        action={
          <Button asChild size="sm" className="gap-1.5 bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--forest-2)]">
            <Link href="/dashboard/projects/submit">
              <FolderPlus className="size-4" />
              Submit Proposal
            </Link>
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--rule)] pb-3">
        {(
          [
            { key: "all", label: "All Projects" },
            { key: "submitted", label: "Under Review" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Changes Requested" },
            { key: "draft", label: "Drafts" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-[var(--forest)] text-white font-semibold"
                : "bg-white text-[var(--muted)] hover:bg-[var(--sand)] hover:text-[var(--ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="rounded-xl border border-[var(--rule)] bg-white/70 p-12 text-center text-sm text-[var(--muted)]">
          Loading your submissions…
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>Error loading submissions: {error.message}</span>
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--rule)] bg-white/50 p-12 text-center">
          <FolderGit2 className="mx-auto size-12 text-[var(--muted)]/40" />
          <h3 className="mt-3 text-base font-semibold text-[var(--ink)]">
            {filter === "all"
              ? "No project proposals found"
              : `No projects with status "${filter}"`}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
            Submit coursework group builds (Group 1 - 10) or personal computing software to have them reviewed by your department coordinator.
          </p>
          <Button asChild size="sm" className="mt-5 bg-[var(--forest)] text-[var(--paper)]">
            <Link href="/dashboard/projects/submit">
              <Plus className="mr-1 size-4" />
              Submit Proposal
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((proj) => (
            <Card
              key={proj.id}
              className="border-[var(--rule)] bg-white/80 shadow-xs transition-all hover:shadow-md"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={proj.status} />
                      <span className="text-xs text-[var(--muted)]">
                        {proj.departmentName ?? "Faculty Central"} · Category:{" "}
                        <span className="font-medium text-[var(--ink)]">
                          {proj.category.replace(/_/g, " ")}
                        </span>
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-[var(--ink)]">
                      {proj.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
                      {proj.tagline}
                    </p>

                    <p className="mt-3 text-[0.72rem] text-[var(--muted)]/80">
                      Submitted on {new Date(proj.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    {proj.status === "approved" && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-[var(--rule)] text-xs font-medium"
                      >
                        <Link href={`/projects/${proj.slug}`} target="_blank">
                          <ExternalLink className="size-3.5" />
                          View Live
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Rejection / Changes Feedback Box */}
                {proj.status === "rejected" && proj.rejectionReason && (
                  <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive dark:bg-destructive/10">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Coordinator Feedback:</p>
                        <p className="mt-0.5 text-destructive/90">{proj.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
