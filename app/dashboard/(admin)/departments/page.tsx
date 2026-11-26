"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bell,
  Clock,
  FilePlus,
  FolderCheck,
  FolderGit2,
  Users,
} from "lucide-react";
import { ActivityFeed, type ActivityFeedItem } from "@/components/dashboard/ActivityFeed";
import { AttentionBanner } from "@/components/dashboard/AttentionBanner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorState } from "@/components/dashboard/DashboardStates";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OpportunityStatus } from "@/lib/enums";
import { formatDate } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

export default function CoordinatorOverviewPage() {
  const utils = trpc.useUtils();
  const overviewQuery = trpc.coordinator.getDepartmentOverview.useQuery();
  const projectsQuery = trpc.coordinator.listProjects.useQuery({});
  const noticesQuery = trpc.coordinator.listNotices.useQuery();

  const data = overviewQuery.data;
  const error = overviewQuery.error;
  const projectsData = projectsQuery.data;
  const noticesData = noticesQuery.data;

  const isLoading = overviewQuery.isLoading;
  const projectsLoading = projectsQuery.isLoading;
  const noticesLoading = noticesQuery.isLoading;

  const department = data?.department;
  const stats = data?.stats;

  const recentProposals = useMemo<ActivityFeedItem[]>(() => {
    return (projectsData?.projects ?? []).slice(0, 5).map((p) => ({
      id: p.id,
      title: p.title,
      meta: `${p.author?.name ?? "Student"}${p.courseCode ? ` · ${p.courseCode}` : ""}`,
      date: formatDate(p.createdAt),
      icon: FolderGit2,
      tone: p.status === "submitted" ? "amber" : "emerald",
      status: p.status as OpportunityStatus,
      href: `/dashboard/departments/projects/${p.slug}`,
      actionLabel: p.status === "submitted" ? "Review" : "View",
    }));
  }, [projectsData]);

  const recentNotices = useMemo<ActivityFeedItem[]>(() => {
    return (noticesData?.notices ?? []).slice(0, 5).map((n) => ({
      id: n.id,
      title: n.title,
      meta: n.authorName ?? "Coordinator",
      date: formatDate(n.createdAt),
      icon: Bell,
      tone: "sky",
      status: (n.published ? "approved" : "draft") as OpportunityStatus,
      href: "/dashboard/departments/notices",
      actionLabel: "Manage",
    }));
  }, [noticesData]);

  if (error) {
    return <ErrorState title="Could not load department overview" message={error.message} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {!isLoading && stats && stats.pendingProjects > 0 ? (
        <AttentionBanner
          icon={Clock}
          tone="rose"
          title={`${stats.pendingProjects} Pending Proposal${stats.pendingProjects === 1 ? "" : "s"}`}
          subtitle="Awaiting coordinator review before showcase publication."
          ctaLabel="Review Now"
          ctaHref="/dashboard/departments/projects?status=submitted"
        />
      ) : null}

      <DashboardHeader
        title={department ? department.name : "Coordinator Console"}
        badge={
          department?.shortName ? (
            <Badge variant="outline" className="rounded-full text-[11px] font-semibold">
              {department.shortName}
            </Badge>
          ) : null
        }
        action={
          <>
            <Button asChild size="sm" variant="outline" className="h-9 rounded-xl px-3.5 text-xs">
              <Link href="/dashboard/departments/notices/new">
                <FilePlus className="size-3.5" />
                Publish Notice
              </Link>
            </Button>
            <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
              <Link href="/dashboard/departments/projects">
                <FolderCheck className="size-3.5" />
                Review Queue
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Students"
          value={stats?.totalStudents}
          icon={Users}
          tone="sky"
          pill="Roster"
          loading={isLoading}
        />
        <StatCard
          label="Pending Review"
          value={stats?.pendingProjects}
          icon={Clock}
          tone="amber"
          pill={`${stats?.rejectedProjects ?? 0} returned`}
          loading={isLoading}
        />
        <StatCard
          label="Approved Projects"
          value={stats?.approvedProjects}
          icon={FolderGit2}
          tone="emerald"
          pill={`${stats?.totalProjects ?? 0} total`}
          loading={isLoading}
        />
        <StatCard
          label="Notices"
          value={stats?.publishedNotices}
          icon={Bell}
          tone="violet"
          pill="Live"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ActivityFeed
          title="Recent Proposals"
          seeAllHref="/dashboard/departments/projects"
          items={recentProposals}
          loading={projectsLoading}
          emptyTitle="No proposals yet"
          onItemIntent={(item) => {
            if (item.href?.startsWith("/dashboard/departments/projects/")) {
              const slug = item.href.split("/").pop();
              if (slug) void utils.coordinator.getProject.prefetch({ slug });
            }
          }}
        />
        <ActivityFeed
          title="Department Notices"
          seeAllHref="/dashboard/departments/notices"
          items={recentNotices}
          loading={noticesLoading}
          emptyTitle="No notices yet"
          emptyAction={
            <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
              <Link href="/dashboard/departments/notices/new">Publish notice</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}
