"use client";

import Link from "next/link";
import { AlertCircle, Bell, Clock, FolderGit2, Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState } from "@/components/dashboard/DashboardStates";
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
import { richTextDocToText } from "@/lib/richtext";
import { trpc } from "@/lib/trpc/client";

function Stat({
  label,
  value,
  note,
  loading,
}: {
  label: string;
  value: number | undefined;
  note: string;
  loading: boolean;
}) {
  return (
    <div className="px-6 py-5 sm:py-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-9 w-12" />
      ) : (
        <p className="mt-1 text-4xl tabular-nums">{value ?? 0}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

export default function CoordinatorOverviewPage() {
  const { data, isLoading, error } = trpc.coordinator.getDepartmentOverview.useQuery();
  const { data: projectsData, isLoading: projectsLoading } = trpc.coordinator.listProjects.useQuery({});
  const { data: noticesData, isLoading: noticesLoading } = trpc.coordinator.listNotices.useQuery();

  if (error) {
    return <ErrorState title="Could not load department overview" message={error.message} />;
  }

  const department = data?.department;
  const stats = data?.stats;
  const recentProjects = (projectsData?.projects ?? []).slice(0, 4);
  const recentNotices = (noticesData?.notices ?? []).slice(0, 4);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={department ? department.name : "Coordinator Console"}
        description={
          department?.shortName
            ? `${department.shortName} · Academic moderation, student roster, and departmental notices.`
            : "Academic moderation, student roster, and departmental notices."
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm">
              <Link href="/dashboard/departments/projects?status=submitted">
                Review pending{stats?.pendingProjects ? ` (${stats.pendingProjects})` : ""}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/departments/notices/new">Publish notice</Link>
            </Button>
          </div>
        }
      />

      {!isLoading && stats && stats.pendingProjects > 0 ? (
        <Alert>
          <Clock />
          <AlertTitle>
            {stats.pendingProjects} {stats.pendingProjects === 1 ? "project" : "projects"} waiting for review
          </AlertTitle>
          <AlertDescription>
            <p>
              Student proposals stay hidden from the public showcase until a department coordinator approves them.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-2">
              <Link href="/dashboard/departments/projects?status=submitted">Open review queue</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="py-0 sm:py-5">
        <div className="grid divide-y sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4 xl:divide-x">
          <Stat
            label="Registered students"
            value={stats?.totalStudents}
            note="Affiliated with department"
            loading={isLoading}
          />
          <Stat
            label="Pending review"
            value={stats?.pendingProjects}
            note={`${stats?.rejectedProjects ?? 0} returned for changes`}
            loading={isLoading}
          />
          <Stat
            label="Approved projects"
            value={stats?.approvedProjects}
            note={`Out of ${stats?.totalProjects ?? 0} total proposals`}
            loading={isLoading}
          />
          <Stat
            label="Published notices"
            value={stats?.publishedNotices}
            note="Visible on department hub"
            loading={isLoading}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent project proposals</CardTitle>
            <CardDescription>Latest student submissions in your review queue</CardDescription>
            {recentProjects.length > 0 ? (
              <CardAction>
                <Button asChild variant="link" size="sm" className="px-0">
                  <Link href="/dashboard/departments/projects">See all</Link>
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentProjects.length === 0 ? (
              <EmptyState
                icon={<FolderGit2 className="size-5" />}
                title="No project proposals yet"
                description="Student project submissions for this department will appear here for review."
              />
            ) : (
              <ul className="divide-y">
                {recentProjects.map((proj) => (
                  <li key={proj.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/dashboard/departments/projects/${proj.slug}`}
                      className="min-w-0 flex-1 group no-underline text-foreground"
                    >
                      <p className="truncate text-sm font-medium text-foreground group-hover:underline">
                        {proj.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {proj.author?.name ?? "Student"}
                        {proj.courseCode ? ` · ${proj.courseCode}` : ""}
                      </p>
                    </Link>
                    <StatusBadge status={proj.status as "draft" | "submitted" | "approved" | "rejected"} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Department notices</CardTitle>
            <CardDescription>Circulars and academic updates you have published</CardDescription>
            {recentNotices.length > 0 ? (
              <CardAction>
                <Button asChild variant="link" size="sm" className="px-0">
                  <Link href="/dashboard/departments/notices">See all</Link>
                </Button>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardContent>
            {noticesLoading ? (
              <div className="space-y-4" aria-busy="true" aria-label="Loading">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : recentNotices.length === 0 ? (
              <EmptyState
                icon={<Bell className="size-5" />}
                title="No notices published yet"
                description="Publish announcements and academic circulars for students in your department."
                action={
                  <Button asChild size="sm">
                    <Link href="/dashboard/departments/notices/new">Publish notice</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y">
                {recentNotices.map((notice) => {
                  const preview = notice.contentJson
                    ? richTextDocToText(notice.contentJson as Parameters<typeof richTextDocToText>[0])
                    : "";
                  return (
                    <li key={notice.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{notice.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {preview || "Department circular"}
                        </p>
                      </div>
                      <StatusBadge status={notice.published ? "approved" : "draft"} />
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick access</CardTitle>
          <CardDescription>Jump directly to department management tools</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/departments/roster">
              <Users className="size-4" />
              View student roster
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/departments/projects">
              <FolderGit2 className="size-4" />
              All project proposals
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/departments/notices">
              <Bell className="size-4" />
              Manage notices
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
