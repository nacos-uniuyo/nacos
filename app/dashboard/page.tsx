"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState } from "@/components/dashboard/DashboardStates";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { OpportunityStatus } from "@/lib/enums";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

// Members are in Uyo, so the greeting and date follow Lagos time on both server and client.
const TIME_ZONE = "Africa/Lagos";

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: TIME_ZONE }).format(now));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Stat({ label, value, note, loading }: { label: string; value: number | undefined; note: string; loading: boolean }) {
  return (
    <div className="px-6 py-5 sm:py-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-9 w-10" />
      ) : (
        <p className="mt-1 text-4xl tabular-nums">{value ?? 0}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function RecentList({
  title,
  description,
  href,
  loading,
  items,
  empty,
}: {
  title: string;
  description: string;
  href: string;
  loading: boolean;
  items: { id: string; title: string; meta: string; status: OpportunityStatus }[];
  empty: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-normal">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {items.length > 0 ? (
          <CardAction>
            <Button asChild variant="link" size="sm" className="px-0">
              <Link href={href}>See all</Link>
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : items.length === 0 ? (
          empty
        ) : (
          <ul className="divide-y">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.user.getDashboardStats.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.project.mySubmissions.useQuery();
  const { data: opportunities, isLoading: opportunitiesLoading } =
    trpc.opportunity.mySubmissions.useQuery();

  const now = new Date();
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TIME_ZONE,
  }).format(now);
  const firstName = profile?.name.split(" ")[0];
  const isProfileIncomplete = profile && (!profile.regNumber || !profile.departmentId);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{today}</p>
        <DashboardHeader
          title={firstName ? `${greeting(now)}, ${firstName}` : greeting(now)}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild size="sm">
                <Link href="/dashboard/projects/submit">Submit a project</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/opportunities/submit">Post an opportunity</Link>
              </Button>
            </div>
          }
        />
      </div>

      {!profileLoading && isProfileIncomplete ? (
        <Alert>
          <AlertCircle />
          <AlertTitle>Your profile is missing a few details</AlertTitle>
          <AlertDescription>
            <p>
              Add your department and registration number. Coordinators use them to confirm that the work you submit is
              yours.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/dashboard/profile">Finish your profile</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="py-0 sm:py-5">
        <div className="grid divide-y sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x">
          <Stat
            label="Projects submitted"
            value={stats?.submittedProjectsCount}
            note={`${stats?.approvedProjectsCount ?? 0} on the public showcase`}
            loading={statsLoading}
          />
          <Stat
            label="Waiting for review"
            value={stats?.pendingProjectsCount}
            note="With your department coordinator"
            loading={statsLoading}
          />
          <Stat
            label="Opportunities posted"
            value={stats?.submittedOpportunitiesCount}
            note="Shared with other students"
            loading={statsLoading}
          />
          <Stat
            label="Saved for later"
            value={stats?.savedBookmarksCount}
            note="Openings you bookmarked"
            loading={statsLoading}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentList
          title="Your projects"
          description="The last few things you sent in"
          href="/dashboard/projects"
          loading={projectsLoading}
          items={(projects ?? []).slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            meta: `${item.departmentName ?? "Computing"} · ${formatDate(item.createdAt)}`,
            status: item.status,
          }))}
          empty={
            <EmptyState
              title="No projects yet"
              description="Coursework, a final year project or something you built on your own all count."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/projects/submit">Submit your first project</Link>
                </Button>
              }
            />
          }
        />
        <RecentList
          title="Opportunities you posted"
          description="Openings you shared with other students"
          href="/dashboard/opportunities"
          loading={opportunitiesLoading}
          items={(opportunities ?? []).slice(0, 3).map((item) => ({
            id: item.id,
            title: item.title,
            meta: `${item.orgName} · ${opportunityTypeLabels[item.type]}`,
            status: item.status,
          }))}
          empty={
            <EmptyState
              title="Nothing posted yet"
              description="If you hear about a SIWES slot, internship or scholarship, post it so others can apply in time."
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/opportunities/submit">Post an opportunity</Link>
                </Button>
              }
            />
          }
        />
      </div>
    </div>
  );
}
