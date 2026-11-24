"use client";

import Link from "next/link";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  PlusCircle,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";

export default function MyOpportunitiesPage() {
  const { data: opportunities, isLoading, error } =
    trpc.opportunity.mySubmissions.useQuery();

  return (
    <div className="space-y-6">
      <DashboardHeader
        breadcrumbs={[{ label: "Opportunities" }]}
        title="My Submitted Opportunities"
        description="SIWES openings, internships, tech scholarships and job placements you contributed to NACOS."
        action={
          <Button asChild size="sm" className="gap-1.5 bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--forest-2)]">
            <Link href="/dashboard/opportunities/submit">
              <PlusCircle className="size-4" />
              Post Opportunity
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-xl border border-[var(--rule)] bg-white/70 p-12 text-center text-sm text-[var(--muted)]">
          Loading your opportunity listings…
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>Error loading opportunities: {error.message}</span>
        </div>
      ) : !opportunities || opportunities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--rule)] bg-white/50 p-12 text-center">
          <Briefcase className="mx-auto size-12 text-[var(--muted)]/40" />
          <h3 className="mt-3 text-base font-semibold text-[var(--ink)]">
            No opportunity listings submitted yet
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[var(--muted)]">
            Help fellow computing students discover verified SIWES placements, scholarships, and junior software internships.
          </p>
          <Button asChild size="sm" className="mt-5 bg-[var(--forest)] text-[var(--paper)]">
            <Link href="/dashboard/opportunities/submit">
              <PlusCircle className="mr-1 size-4" />
              Submit Opportunity
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp) => (
            <Card
              key={opp.id}
              className="border-[var(--rule)] bg-white/80 shadow-xs transition-all hover:shadow-md"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={opp.status} />
                      <span className="rounded bg-[var(--sand)]/60 px-2 py-0.5 text-[0.68rem] font-semibold uppercase text-[var(--forest)]">
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

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-[var(--rule)] text-xs"
                    >
                      <a href={opp.applyUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-3.5" />
                        Application Link
                      </a>
                    </Button>
                  </div>
                </div>

                {opp.status === "rejected" && opp.rejectionReason && (
                  <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3.5 text-xs text-destructive">
                    <p className="font-semibold">Review Feedback:</p>
                    <p className="mt-0.5 text-destructive/90">{opp.rejectionReason}</p>
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
