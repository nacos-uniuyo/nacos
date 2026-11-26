"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  ExternalLink,
  MapPin,
  PlusCircle,
  Search,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/dashboard/DashboardStates";
import { PillTabs } from "@/components/dashboard/PillTabs";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OpportunityStatus } from "@/lib/enums";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

type FilterKey = "all" | OpportunityStatus;

export default function MyOpportunitiesPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const { data: opportunities, isLoading, error } = trpc.opportunity.mySubmissions.useQuery();

  const counts = useMemo(() => {
    const list = opportunities ?? [];
    return {
      all: list.length,
      submitted: list.filter((o) => o.status === "submitted").length,
      approved: list.filter((o) => o.status === "approved").length,
      rejected: list.filter((o) => o.status === "rejected").length,
      draft: list.filter((o) => o.status === "draft").length,
    };
  }, [opportunities]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (opportunities ?? []).filter((opp) => {
      if (filter !== "all" && opp.status !== filter) return false;
      if (!q) return true;
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.orgName.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q)
      );
    });
  }, [opportunities, filter, search]);

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
        title="Opportunities"
        action={
          <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
            <Link href="/dashboard/opportunities/submit">
              <PlusCircle className="size-3.5" />
              Post Opportunity
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs
          label="Filter opportunities by status"
          value={filter}
          onValueChange={setFilter}
          tabs={tabs}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl bg-card pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={2} />
      ) : error ? (
        <ErrorState title="Could not load opportunities" message={error.message} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-5" />}
          title={opportunities?.length ? "No matching openings" : "No opportunities posted"}
          action={
            <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
              <Link href="/dashboard/opportunities/submit">Post an opportunity</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((opp) => (
            <article
              key={opp.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-2xs transition-colors hover:border-primary/25"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-xs font-semibold text-sky-600 dark:text-sky-400">
                      {opp.orgName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        {opp.orgName}
                      </p>
                      <h2 className="line-clamp-1 text-sm font-semibold text-foreground">
                        {opp.title}
                      </h2>
                    </div>
                  </div>
                  <StatusBadge status={opp.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="rounded-full text-[11px] font-normal">
                    {opportunityTypeLabels[opp.type]}
                  </Badge>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3" />
                    {opp.location}
                  </span>
                  {opp.deadline ? (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(opp.deadline)}
                    </span>
                  ) : null}
                </div>

                {opp.status === "rejected" && opp.rejectionReason ? (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/8 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                    <p className="line-clamp-2">{opp.rejectionReason}</p>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-[11px] text-muted-foreground">
                  Posted {formatDate(opp.createdAt)}
                </span>
                <Button asChild variant="outline" size="sm" className="h-8 rounded-xl px-3 text-xs">
                  <a
                    href={opp.applyUrl ?? `/opportunities/${opp.slug}`}
                    target={opp.applyUrl ? "_blank" : undefined}
                    rel={opp.applyUrl ? "noopener noreferrer" : undefined}
                  >
                    <ExternalLink className="size-3" />
                    {opp.applyUrl ? "Link" : "View"}
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
