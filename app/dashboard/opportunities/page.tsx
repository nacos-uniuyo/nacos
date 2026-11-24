"use client";

import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  PlusCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

export default function MyOpportunitiesPage() {
  const { data: opportunities, isLoading, error } = trpc.opportunity.mySubmissions.useQuery();

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Opportunities"
        description="SIWES openings, internships, scholarships and jobs you shared with NACOS."
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/opportunities/submit">
              <PlusCircle />
              Post Opportunity
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState title="Could not load your opportunities" message={error.message} />
      ) : !opportunities?.length ? (
        <EmptyState
          title="You haven't posted anything yet"
          description="Heard about a SIWES slot, internship or scholarship? Post it here so other students can apply before it closes."
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/opportunities/submit">Post an opportunity</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp) => (
            <Card key={opp.id}>
              <CardContent className="space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={opp.status} />
                      <Badge variant="outline">{opportunityTypeLabels[opp.type]}</Badge>
                    </div>
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
                  <Button asChild variant="outline" size="sm">
                    <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink />
                      Application link
                    </a>
                  </Button>
                </div>
                {opp.status === "rejected" && opp.rejectionReason ? (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Review feedback</AlertTitle>
                    <AlertDescription>{opp.rejectionReason}</AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
