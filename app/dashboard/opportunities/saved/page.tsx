"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkX,
  Calendar,
  ExternalLink,
  MapPin,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CardGridSkeleton, EmptyState, ErrorState } from "@/components/dashboard/DashboardStates";
import { PillTabs } from "@/components/dashboard/PillTabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { opportunityTypes, type OpportunityType } from "@/lib/enums";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

type TypeFilter = "all" | OpportunityType;

export default function SavedOpportunitiesPage() {
  const utils = trpc.useUtils();
  const { data: bookmarks, isLoading, error } = trpc.opportunity.myBookmarks.useQuery();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const toggleMutation = trpc.opportunity.toggleBookmark.useMutation({
    onMutate: ({ opportunityId }) => setTogglingId(opportunityId),
    onError: (err) => toast.error(err.message),
    onSettled: () => {
      setTogglingId(null);
      utils.opportunity.myBookmarks.invalidate();
      utils.user.getDashboardStats.invalidate();
    },
  });

  const tabs = useMemo(() => {
    const list = bookmarks ?? [];
    return [
      { value: "all" as const, label: "All", count: list.length },
      ...opportunityTypes
        .map((type) => ({
          value: type,
          label: opportunityTypeLabels[type],
          count: list.filter((b) => b.opportunity.type === type).length,
        }))
        .filter((tab) => tab.count > 0),
    ];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (bookmarks ?? []).filter(({ opportunity: opp }) => {
      if (typeFilter !== "all" && opp.type !== typeFilter) return false;
      if (!q) return true;
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.orgName.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q)
      );
    });
  }, [bookmarks, typeFilter, search]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Saved"
        action={
          <Button asChild size="sm" variant="outline" className="h-9 rounded-xl px-4 text-xs">
            <Link href="/opportunities">Browse Board</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs
          label="Filter saved by type"
          value={typeFilter}
          onValueChange={setTypeFilter}
          tabs={tabs}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search saved..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl bg-card pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={2} />
      ) : error ? (
        <ErrorState title="Could not load saved opportunities" message={error.message} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="size-5" />}
          title={bookmarks?.length ? "No matching bookmarks" : "Nothing saved yet"}
          action={
            <Button asChild size="sm" variant="outline" className="h-9 rounded-xl px-4 text-xs">
              <Link href="/opportunities">Browse opportunities</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(({ bookmarkId, opportunity: opp }) => (
            <article
              key={bookmarkId}
              className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-2xs transition-colors hover:border-primary/25"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-xs font-semibold text-violet-600 dark:text-violet-400">
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
                  <Badge variant="outline" className="shrink-0 rounded-full text-[11px] font-normal">
                    {opportunityTypeLabels[opp.type]}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
              </div>

              <div className="flex items-center justify-end gap-2 border-t pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={togglingId === opp.id}
                  onClick={() => toggleMutation.mutate({ opportunityId: opp.id })}
                  className="h-8 rounded-xl px-3 text-xs"
                >
                  <BookmarkX className="size-3.5" />
                  {togglingId === opp.id ? "Removing..." : "Remove"}
                </Button>
                <Button asChild size="sm" className="h-8 rounded-xl px-3.5 text-xs">
                  <a
                    href={opp.applyUrl ?? `/opportunities/${opp.slug}`}
                    target={opp.applyUrl ? "_blank" : undefined}
                    rel={opp.applyUrl ? "noopener noreferrer" : undefined}
                  >
                    <ExternalLink className="size-3" />
                    {opp.applyUrl ? "Apply" : "View"}
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
