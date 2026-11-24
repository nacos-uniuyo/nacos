"use client";

import Link from "next/link";
import { useState } from "react";
import { BookmarkX, Building2, Calendar, ExternalLink, MapPin } from "lucide-react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

export default function SavedOpportunitiesPage() {
  const utils = trpc.useUtils();
  const { data: bookmarks, isLoading, error } = trpc.opportunity.myBookmarks.useQuery();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleMutation = trpc.opportunity.toggleBookmark.useMutation({
    onMutate: ({ opportunityId }) => setTogglingId(opportunityId),
    onError: (err) => toast.error(err.message),
    onSettled: () => {
      setTogglingId(null);
      utils.opportunity.myBookmarks.invalidate();
      utils.user.getDashboardStats.invalidate();
    },
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Saved Opportunities"
        description="Placements, scholarships and internships you bookmarked."
      />

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState title="Could not load saved opportunities" message={error.message} />
      ) : !bookmarks?.length ? (
        <EmptyState
          title="Nothing saved yet"
          description="When you bookmark an opening on the opportunities board, it shows up here with its deadline."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href="/opportunities">Browse opportunities</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {bookmarks.map(({ bookmarkId, opportunity: opp }) => (
            <Card key={bookmarkId}>
              <CardContent>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline">{opportunityTypeLabels[opp.type]}</Badge>
                    <h2 className="mt-2 text-base font-semibold">{opp.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="size-3.5" />
                        {opp.orgName}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {opp.location}
                      </span>
                      {opp.deadline ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          Deadline {formatDate(opp.deadline)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button asChild size="sm">
                      <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink />
                        Apply
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={togglingId === opp.id}
                      onClick={() => toggleMutation.mutate({ opportunityId: opp.id })}
                    >
                      <BookmarkX />
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
