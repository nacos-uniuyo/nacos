"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  Bookmark,
  BookmarkX,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";

export default function SavedOpportunitiesPage() {
  const utils = trpc.useUtils();
  const { data: bookmarks, isLoading, error } =
    trpc.opportunity.myBookmarks.useQuery();

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleMutation = trpc.opportunity.toggleBookmark.useMutation({
    onMutate: async ({ opportunityId }) => {
      setTogglingId(opportunityId);
    },
    onSettled: () => {
      setTogglingId(null);
      utils.opportunity.myBookmarks.invalidate();
      utils.user.getDashboardStats.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        breadcrumbs={[
          { label: "Opportunities", href: "/dashboard/opportunities" },
          { label: "Saved" },
        ]}
        title="Saved Opportunities"
        description="Bookmarked SIWES postings, scholarships and internships you saved for upcoming deadlines."
      />

      {isLoading ? (
        <div className="rounded-xl border border-[var(--rule)] bg-white/70 p-12 text-center text-sm text-[var(--muted)]">
          Loading saved opportunities…
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>Error loading saved items: {error.message}</span>
        </div>
      ) : !bookmarks || bookmarks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--rule)] bg-white/50 p-12 text-center">
          <Bookmark className="mx-auto size-12 text-[var(--muted)]/40" />
          <h3 className="mt-3 text-base font-semibold text-[var(--ink)]">
            No saved opportunities yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
            Bookmark internships, SIWES openings, or scholarships across the portal to easily track application deadlines here.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-5 border-[var(--rule)]">
            <Link href="/opportunities">Browse Public Opportunities</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map(({ bookmarkId, opportunity: opp }) => (
            <Card
              key={bookmarkId}
              className="border-[var(--rule)] bg-white/80 shadow-xs transition-all hover:shadow-md"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-[var(--sand)]/80 px-2 py-0.5 text-[0.68rem] font-semibold uppercase text-[var(--forest)]">
                        {opp.type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-[var(--ink)]">
                      {opp.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]">
                      <span className="flex items-center gap-1 font-medium text-[var(--ink)]">
                        <Building2 className="size-3.5 text-[var(--muted)]" />
                        {opp.orgName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-[var(--muted)]" />
                        {opp.location}
                      </span>
                      {opp.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5 text-[var(--muted)]" />
                          Deadline: {new Date(opp.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="gap-1.5 bg-[var(--forest)] text-[var(--paper)] text-xs hover:bg-[var(--forest-2)]"
                    >
                      <a href={opp.applyUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                        Apply Now
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={togglingId === opp.id}
                      onClick={() => toggleMutation.mutate({ opportunityId: opp.id })}
                      className="gap-1.5 border-[var(--rule)] text-xs text-destructive hover:bg-destructive/10"
                    >
                      <BookmarkX className="size-3.5" />
                      {togglingId === opp.id ? "Removing…" : "Remove"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
