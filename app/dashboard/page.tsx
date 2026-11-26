"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  AlertCircle,
  Bookmark,
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  FolderGit2,
  Plus,
} from "lucide-react";
import { ActivityFeed, type ActivityFeedItem } from "@/components/dashboard/ActivityFeed";
import { AttentionBanner } from "@/components/dashboard/AttentionBanner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState } from "@/components/dashboard/DashboardStates";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, opportunityTypeLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

const TIME_ZONE = "Africa/Lagos";

function greeting(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: TIME_ZONE,
    }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntilLabel(deadline: Date | string | null | undefined) {
  if (!deadline) return null;
  const diffDays = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (diffDays < 0) return "Closed";
  if (diffDays === 0) return "Today";
  return `${diffDays}d left`;
}

export default function DashboardOverviewPage() {
  const utils = trpc.useUtils();
  const { data: profile, isLoading: profileLoading } = trpc.user.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.user.getDashboardStats.useQuery();
  const { data: projects, isLoading: projectsLoading } = trpc.project.mySubmissions.useQuery();
  const { data: opportunities, isLoading: opportunitiesLoading } =
    trpc.opportunity.mySubmissions.useQuery();
  const { data: bookmarks, isLoading: bookmarksLoading } =
    trpc.opportunity.myBookmarks.useQuery();

  const now = new Date();
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: TIME_ZONE,
  }).format(now);
  const firstName = profile?.name.split(" ")[0];
  const isProfileIncomplete = Boolean(profile && (!profile.regNumber || !profile.departmentId));
  const rejectedCount = (projects ?? []).filter((p) => p.status === "rejected").length;

  const activities = useMemo<ActivityFeedItem[]>(() => {
    const projItems = (projects ?? []).map((p) => ({
      at: new Date(p.createdAt).getTime(),
      item: {
        id: `proj-${p.id}`,
        title: p.title,
        meta: `Project · ${p.departmentName ?? "Computing"}`,
        date: formatDate(p.createdAt),
        icon: FolderGit2,
        tone: p.status === "rejected" ? ("rose" as const) : ("emerald" as const),
        status: p.status,
        href:
          p.status === "draft" || p.status === "rejected"
            ? `/dashboard/projects/submit?edit=${p.id}`
            : p.status === "approved"
              ? `/projects/${p.slug}`
              : "/dashboard/projects",
        actionLabel:
          p.status === "draft" || p.status === "rejected"
            ? "Edit"
            : p.status === "approved"
              ? "Live"
              : "View",
      } satisfies ActivityFeedItem,
    }));

    const oppItems = (opportunities ?? []).map((o) => ({
      at: new Date(o.createdAt).getTime(),
      item: {
        id: `opp-${o.id}`,
        title: o.title,
        meta: `${o.orgName} · ${opportunityTypeLabels[o.type]}`,
        date: formatDate(o.createdAt),
        icon: Briefcase,
        tone: "sky" as const,
        status: o.status,
        href: "/dashboard/opportunities",
        actionLabel: "View",
      } satisfies ActivityFeedItem,
    }));

    return [...projItems, ...oppItems]
      .sort((a, b) => b.at - a.at)
      .slice(0, 6)
      .map((entry) => entry.item);
  }, [projects, opportunities]);

  const savedPreview = (bookmarks ?? []).slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      {!profileLoading && rejectedCount > 0 ? (
        <AttentionBanner
          icon={AlertCircle}
          tone="rose"
          title={`${rejectedCount} project${rejectedCount === 1 ? "" : "s"} returned for changes`}
          subtitle="Review coordinator feedback and resubmit."
          ctaLabel="Review Feedback"
          ctaHref="/dashboard/projects"
        />
      ) : !profileLoading && isProfileIncomplete ? (
        <AttentionBanner
          icon={AlertCircle}
          tone="amber"
          title="Complete your profile"
          subtitle="Add your department and registration number."
          ctaLabel="Update Profile"
          ctaHref="/dashboard/profile"
        />
      ) : null}

      <DashboardHeader
        title={firstName ? `${greeting(now)}, ${firstName}` : greeting(now)}
        description={
          [today, profile?.departmentName, profile?.regNumber].filter(Boolean).join(" · ")
        }
        action={
          <>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-xl px-3.5 text-xs">
              <Link
                href="/dashboard/opportunities/submit"
                onMouseEnter={() => void utils.department.list.prefetch()}
                onFocus={() => void utils.department.list.prefetch()}
              >
                <Plus className="size-3.5" />
                Opportunity
              </Link>
            </Button>
            <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
              <Link
                href="/dashboard/projects/submit"
                onMouseEnter={() => {
                  void utils.department.list.prefetch();
                  void utils.session.list.prefetch();
                }}
                onFocus={() => {
                  void utils.department.list.prefetch();
                  void utils.session.list.prefetch();
                }}
              >
                <Plus className="size-3.5" />
                Submit Project
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={stats?.submittedProjectsCount}
          icon={FolderGit2}
          tone="emerald"
          pill={`${stats?.approvedProjectsCount ?? 0} live`}
          loading={statsLoading}
        />
        <StatCard
          label="In Review"
          value={stats?.pendingProjectsCount}
          icon={Clock}
          tone="amber"
          pill="Pending"
          loading={statsLoading}
        />
        <StatCard
          label="Opportunities"
          value={stats?.submittedOpportunitiesCount}
          icon={Briefcase}
          tone="sky"
          pill="Posted"
          loading={statsLoading}
        />
        <StatCard
          label="Saved"
          value={stats?.savedBookmarksCount}
          icon={Bookmark}
          tone="violet"
          pill="Bookmarks"
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed
            title="Recent Activity"
            seeAllHref="/dashboard/projects"
            items={activities}
            loading={projectsLoading || opportunitiesLoading}
            emptyTitle="No submissions yet"
            emptyAction={
              <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
                <Link href="/dashboard/projects/submit">Submit first project</Link>
              </Button>
            }
            onItemIntent={(item) => {
              if (item.href?.startsWith("/dashboard/projects/submit?edit=")) {
                const id = item.href.split("edit=")[1];
                if (id) void utils.project.getMySubmission.prefetch({ id });
                void utils.department.list.prefetch();
                void utils.session.list.prefetch();
                return;
              }
              if (item.href === "/dashboard/projects") {
                void utils.project.mySubmissions.prefetch();
                return;
              }
              if (item.href === "/dashboard/opportunities") {
                void utils.opportunity.mySubmissions.prefetch();
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-2xs sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground">Saved Openings</h2>
            {savedPreview.length > 0 ? (
              <Link
                href="/dashboard/opportunities/saved"
                className="text-xs font-medium text-primary hover:underline"
              >
                See all
              </Link>
            ) : null}
          </div>

          {bookmarksLoading ? (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : savedPreview.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="size-5" />}
              title="No saved openings"
              bordered={false}
              action={
                <Button asChild size="sm" variant="outline" className="h-9 rounded-xl px-4 text-xs">
                  <Link href="/opportunities">Explore board</Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col gap-2.5">
              {savedPreview.map(({ bookmarkId, opportunity: opp }) => {
                const badge = daysUntilLabel(opp.deadline);
                return (
                  <li
                    key={bookmarkId}
                    className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                        {opp.orgName.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {opp.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="truncate">{opp.orgName}</span>
                          {badge ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/12 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                              <Calendar className="size-2.5" />
                              {badge}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <Button
                      asChild
                      size="icon-sm"
                      variant="outline"
                      className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                    >
                      <a
                        href={opp.applyUrl ?? `/opportunities/${opp.slug}`}
                        target={opp.applyUrl ? "_blank" : undefined}
                        rel={opp.applyUrl ? "noopener noreferrer" : undefined}
                        aria-label={opp.applyUrl ? `Apply to ${opp.title}` : `View ${opp.title}`}
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
