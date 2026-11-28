"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Briefcase, Check, ChevronRight, Loader2, Search, X } from "lucide-react";
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
import type { OpportunityStatus } from "@/lib/enums";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

type FilterKey = OpportunityStatus | "all";

interface RejectTarget {
  id: string;
  title: string;
}

function CoordinatorOpportunitiesContent() {
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
  // Follow ?status= when a notification or banner link changes it while the page is open.
  const [syncedStatus, setSyncedStatus] = useState(initialStatus);
  if (initialStatus !== syncedStatus) {
    setSyncedStatus(initialStatus);
    setStatusFilter(validInitial);
  }
  const [searchInput, setSearchInput] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);

  const utils = trpc.useUtils();
  const { data, isLoading, error } = trpc.coordinator.listOpportunities.useQuery({});

  const reviewMutation = trpc.coordinator.reviewOpportunity.useMutation({
    onSuccess: async (updated) => {
      await utils.coordinator.listOpportunities.invalidate();
      await utils.coordinator.getOpportunity.invalidate();
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

  const allOpportunities = useMemo(() => data?.opportunities ?? [], [data]);

  const counts = useMemo(
    () => ({
      all: allOpportunities.length,
      submitted: allOpportunities.filter((o) => o.status === "submitted").length,
      approved: allOpportunities.filter((o) => o.status === "approved").length,
      rejected: allOpportunities.filter((o) => o.status === "rejected").length,
      draft: allOpportunities.filter((o) => o.status === "draft").length,
    }),
    [allOpportunities],
  );

  const opportunities = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return allOpportunities.filter((opp) => {
      if (statusFilter !== "all" && opp.status !== statusFilter) return false;
      if (!q) return true;
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.orgName.toLowerCase().includes(q) ||
        (opp.submitter?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allOpportunities, statusFilter, searchInput]);

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
        title="Opportunity Review"
        description="Approve listings before they go live on the opportunities board."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs
          label="Filter opportunities by status"
          value={statusFilter}
          onValueChange={setStatusFilter}
          tabs={tabs}
        />

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title, organisation, member..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 rounded-xl bg-card pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : error ? (
        <ErrorState title="Failed to load opportunities" message={error.message} />
      ) : opportunities.length === 0 ? (
        <EmptyState icon={<Briefcase className="size-5" />} title="No opportunities found" />
      ) : (
        <Card className="divide-y overflow-hidden rounded-2xl py-0 shadow-2xs">
          {opportunities.map((opp) => {
            const isApproving = approvingId === opp.id && reviewMutation.isPending;
            const href = `/dashboard/departments/opportunities/${opp.slug}`;
            const prefetch = () => void utils.coordinator.getOpportunity.prefetch({ slug: opp.slug });
            return (
              <div
                key={opp.id}
                className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-center sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={opp.status} />
                    <Badge variant="secondary" className="rounded-full text-[11px]">
                      {opportunityTypeLabels[opp.type]}
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-[11px]">
                      {opp.departmentShortName ?? "Faculty-wide"}
                    </Badge>
                  </div>

                  <Link
                    href={href}
                    className="mt-1.5 block truncate text-sm font-semibold text-foreground no-underline hover:text-primary"
                    onMouseEnter={prefetch}
                    onFocus={prefetch}
                  >
                    {opp.title}
                  </Link>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
                    <span>{opp.orgName}</span>
                    <span>·</span>
                    <span>{opp.submitter?.name ?? "Member"}</span>
                    {opp.submitter?.regNumber ? (
                      <span className="font-mono text-[11px]">{opp.submitter.regNumber}</span>
                    ) : null}
                    <span>·</span>
                    <span>{formatDate(opp.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {opp.status === "submitted" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={reviewMutation.isPending}
                        onClick={() => setRejectTarget({ id: opp.id, title: opp.title })}
                        className="h-8 rounded-xl border-rose-500/30 bg-rose-500/8 px-3 text-xs text-rose-600 hover:bg-rose-500/15 hover:text-rose-700 dark:text-rose-400"
                      >
                        <X className="size-3.5" />
                        Reject
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={reviewMutation.isPending}
                        onClick={() => {
                          setApprovingId(opp.id);
                          reviewMutation.mutate({ id: opp.id, status: "approved" });
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

                  <Button asChild variant="outline" size="sm" className="h-8 rounded-xl px-3 text-xs">
                    <Link href={href} onMouseEnter={prefetch} onFocus={prefetch}>
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

export default function CoordinatorOpportunitiesPage() {
  return (
    <Suspense fallback={<ListSkeleton count={4} />}>
      <CoordinatorOpportunitiesContent />
    </Suspense>
  );
}
