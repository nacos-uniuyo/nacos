"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Check, ChevronRight, FolderOpen, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { PillTabs } from "@/components/dashboard/PillTabs";
import { ReasonDialog } from "@/components/dashboard/ReasonDialog";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

type ProjectStatus = "draft" | "submitted" | "approved" | "rejected";
type FilterKey = ProjectStatus | "all";

interface RejectTarget {
  id: string;
  title: string;
}

function CoordinatorProjectsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status");
  const validInitial: FilterKey =
    initialStatus === "submitted" ||
    initialStatus === "approved" ||
    initialStatus === "rejected" ||
    initialStatus === "draft"
      ? initialStatus
      : "all";

  const [statusFilter, setStatusFilter] = useState<FilterKey>(validInitial);
  const [searchInput, setSearchInput] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.coordinator.listProjects.useQuery({});

  const reviewMutation = trpc.coordinator.reviewProject.useMutation({
    onSuccess: async (updated) => {
      await utils.coordinator.listProjects.invalidate();
      await utils.coordinator.getDepartmentOverview.invalidate();
      toast.success(
        updated.status === "approved"
          ? `"${updated.title}" approved.`
          : `Feedback sent for "${updated.title}".`,
      );
      setRejectTarget(null);
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setApprovingId(null),
  });

  const allProjects = useMemo(() => data?.projects ?? [], [data]);

  const counts = useMemo(
    () => ({
      all: allProjects.length,
      submitted: allProjects.filter((p) => p.status === "submitted").length,
      approved: allProjects.filter((p) => p.status === "approved").length,
      rejected: allProjects.filter((p) => p.status === "rejected").length,
      draft: allProjects.filter((p) => p.status === "draft").length,
    }),
    [allProjects],
  );

  const projects = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return allProjects.filter((proj) => {
      if (statusFilter !== "all" && proj.status !== statusFilter) return false;
      if (!q) return true;
      return (
        proj.title.toLowerCase().includes(q) ||
        (proj.tagline?.toLowerCase().includes(q) ?? false) ||
        (proj.courseCode?.toLowerCase().includes(q) ?? false) ||
        (proj.teamDisplayName?.toLowerCase().includes(q) ?? false) ||
        (proj.author?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allProjects, statusFilter, searchInput]);

  const tabs = [
    { value: "all", label: "All", count: counts.all },
    { value: "submitted", label: "Pending", count: counts.submitted },
    { value: "approved", label: "Approved", count: counts.approved },
    { value: "rejected", label: "Changes", count: counts.rejected },
    { value: "draft", label: "Drafts", count: counts.draft },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Review Queue"
        badge={
          data?.department.shortName ? (
            <Badge variant="outline" className="rounded-full text-[11px] font-semibold">
              {data.department.shortName}
            </Badge>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs
          label="Filter proposals by status"
          value={statusFilter}
          onValueChange={setStatusFilter}
          tabs={tabs}
        />

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, student, course..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 rounded-xl bg-card pl-9 text-xs"
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
        />
      ) : (
        <Card className="divide-y overflow-hidden rounded-2xl py-0 shadow-2xs">
          {projects.map((proj) => {
            const isApproving = approvingId === proj.id && reviewMutation.isPending;
            return (
              <div
                key={proj.id}
                className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-center sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={proj.status as ProjectStatus} />
                    {proj.courseCode ? (
                      <Badge variant="secondary" className="rounded-full font-mono text-[11px]">
                        {proj.courseCode}
                      </Badge>
                    ) : null}
                    {proj.teamDisplayName ? (
                      <Badge variant="outline" className="rounded-full text-[11px]">
                        {proj.teamDisplayName}
                      </Badge>
                    ) : null}
                  </div>

                  <Link
                    href={`/dashboard/departments/projects/${proj.slug}`}
                    className="mt-1.5 block truncate text-sm font-semibold text-foreground no-underline hover:text-primary"
                    onMouseEnter={() => void utils.coordinator.getProject.prefetch({ slug: proj.slug })}
                    onFocus={() => void utils.coordinator.getProject.prefetch({ slug: proj.slug })}
                  >
                    {proj.title}
                  </Link>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{proj.author?.name ?? "Student"}</span>
                    {proj.author?.regNumber ? (
                      <span className="font-mono text-[11px]">{proj.author.regNumber}</span>
                    ) : null}
                    <span>·</span>
                    <span>{formatDate(proj.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {proj.status === "submitted" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isApproving}
                        onClick={() => setRejectTarget({ id: proj.id, title: proj.title })}
                        className="h-8 rounded-xl border-rose-500/30 bg-rose-500/8 px-3 text-xs text-rose-600 hover:bg-rose-500/15 hover:text-rose-700 dark:text-rose-400"
                      >
                        <X className="size-3.5" />
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isApproving}
                        onClick={() => {
                          setApprovingId(proj.id);
                          reviewMutation.mutate({ id: proj.id, status: "approved" });
                        }}
                        className="h-8 rounded-xl px-3.5 text-xs"
                      >
                        {isApproving ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Check className="size-3.5" />
                        )}
                        Approve
                      </Button>
                    </>
                  ) : null}

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-xl px-3 text-xs"
                  >
                    <Link
                      href={`/dashboard/departments/projects/${proj.slug}`}
                      onMouseEnter={() => void utils.coordinator.getProject.prefetch({ slug: proj.slug })}
                      onFocus={() => void utils.coordinator.getProject.prefetch({ slug: proj.slug })}
                    >
                      Inspect
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <ReasonDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Request Changes"
        subject={rejectTarget?.title}
        buttonLabel="Send Feedback"
        isPending={reviewMutation.isPending}
        onConfirm={(reason) => {
          if (!rejectTarget) return;
          reviewMutation.mutate({
            id: rejectTarget.id,
            status: "rejected",
            rejectionReason: reason,
          });
        }}
      />
    </div>
  );
}

export default function CoordinatorProjectsPage() {
  return (
    <Suspense fallback={<ListSkeleton count={4} />}>
      <CoordinatorProjectsContent />
    </Suspense>
  );
}
