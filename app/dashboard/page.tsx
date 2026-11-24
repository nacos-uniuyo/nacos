"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Briefcase,
  Clock,
  FolderGit2,
  FolderPlus,
  PlusCircle,
  User,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc/client";

export default function DashboardOverviewPage() {
  const { data: profile, isLoading: profileLoading } =
    trpc.user.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } =
    trpc.user.getDashboardStats.useQuery();
  const { data: projects, isLoading: projectsLoading } =
    trpc.project.mySubmissions.useQuery();
  const { data: opportunities, isLoading: opportunitiesLoading } =
    trpc.opportunity.mySubmissions.useQuery();

  const isProfileIncomplete =
    profile && (!profile.regNumber || !profile.departmentId);

  return (
    <div className="space-y-8">
      <DashboardHeader
        title={`Welcome back, ${profile?.name?.split(" ")[0] ?? "Member"}!`}
        description="Here is what is happening across your projects, submissions, and bookmarks."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className="gap-1.5 bg-[var(--forest)] text-[var(--paper)] hover:bg-[var(--forest-2)]">
              <Link href="/dashboard/projects/submit">
                <FolderPlus className="size-4" />
                Submit Project
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5 border-[var(--rule)]">
              <Link href="/dashboard/opportunities/submit">
                <PlusCircle className="size-4" />
                Submit Opportunity
              </Link>
            </Button>
          </div>
        }
      />

      {/* Profile Incompletion Alert */}
      {!profileLoading && isProfileIncomplete && (
        <div className="relative flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50/80 p-5 shadow-xs sm:flex-row sm:items-center dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-start gap-3.5">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              <AlertCircle className="size-5 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
                Complete your NACOS member profile
              </h3>
              <p className="mt-0.5 text-xs text-amber-800/90 dark:text-amber-300/80">
                Link your department and enter your UNIUYO registration number
                (e.g., 22/SC/CO/1199) to verify student submissions and departmental eligibility.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0 bg-amber-700 text-white hover:bg-amber-800">
            <Link href="/dashboard/profile">
              Complete Profile
              <ArrowRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Projects */}
        <Card className="border-[var(--rule)] bg-white/70 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="caps text-[0.68rem] tracking-[0.2em] text-[var(--muted)]">
                Projects Submitted
              </p>
              <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--sand)] text-[var(--forest)]">
                <FolderGit2 className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="serif text-3xl font-bold text-[var(--ink)]">
                {statsLoading ? "—" : stats?.submittedProjectsCount ?? 0}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {stats?.approvedProjectsCount ?? 0} approved for public showcase
            </p>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="border-[var(--rule)] bg-white/70 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="caps text-[0.68rem] tracking-[0.2em] text-[var(--muted)]">
                Under Review
              </p>
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="serif text-3xl font-bold text-amber-800 dark:text-amber-400">
                {statsLoading ? "—" : stats?.pendingProjectsCount ?? 0}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Awaiting departmental coordinator review
            </p>
          </CardContent>
        </Card>

        {/* Opportunities Submitted */}
        <Card className="border-[var(--rule)] bg-white/70 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="caps text-[0.68rem] tracking-[0.2em] text-[var(--muted)]">
                Shared Opportunities
              </p>
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                <Briefcase className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="serif text-3xl font-bold text-[var(--ink)]">
                {statsLoading ? "—" : stats?.submittedOpportunitiesCount ?? 0}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              SIWES, internships & scholarships
            </p>
          </CardContent>
        </Card>

        {/* Saved Bookmarks */}
        <Card className="border-[var(--rule)] bg-white/70 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="caps text-[0.68rem] tracking-[0.2em] text-[var(--muted)]">
                Bookmarked
              </p>
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Bookmark className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="serif text-3xl font-bold text-[var(--green)]">
                {statsLoading ? "—" : stats?.savedBookmarksCount ?? 0}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Saved for deadlines & applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/projects/submit"
          className="group block rounded-xl border border-[var(--rule)] bg-white/80 p-5 shadow-xs transition-all hover:border-[var(--forest)] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--forest)] text-[var(--gold)]">
              <FolderPlus className="size-5" />
            </span>
            <ArrowRight className="size-4 text-[var(--muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--forest)]" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
            Submit a Coursework or Personal Project
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Showcase coursework projects (Group 1 - 10) or personal software builds to coordinators and prospective employers.
          </p>
        </Link>

        <Link
          href="/dashboard/opportunities/submit"
          className="group block rounded-xl border border-[var(--rule)] bg-white/80 p-5 shadow-xs transition-all hover:border-[var(--forest)] hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--forest)] text-[var(--gold)]">
              <PlusCircle className="size-5" />
            </span>
            <ArrowRight className="size-4 text-[var(--muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--forest)]" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
            Post an Opportunity or SIWES Opening
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Share SIWES placement openings, student tech scholarships, and entry-level IT roles with faculty peers.
          </p>
        </Link>

        <Link
          href="/dashboard/profile"
          className="group block rounded-xl border border-[var(--rule)] bg-white/80 p-5 shadow-xs transition-all hover:border-[var(--forest)] hover:shadow-md sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--forest)] text-[var(--gold)]">
              <User className="size-5" />
            </span>
            <ArrowRight className="size-4 text-[var(--muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--forest)]" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
            Manage Member Profile
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            Update your registered department, UNIUYO matriculation number, and yearbook identity link.
          </p>
        </Link>
      </div>

      {/* Recent Submissions Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card className="border-[var(--rule)] bg-white/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--rule)] px-5 py-4">
            <div>
              <CardTitle className="text-base font-semibold text-[var(--ink)]">
                Recent Projects
              </CardTitle>
              <CardDescription className="text-xs">
                Your submitted coursework & showcase projects
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-[var(--green)]">
              <Link href="/dashboard/projects">
                View All
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {projectsLoading ? (
              <div className="p-6 text-center text-xs text-[var(--muted)]">
                Loading projects…
              </div>
            ) : !projects || projects.length === 0 ? (
              <div className="p-8 text-center">
                <FolderGit2 className="mx-auto size-8 text-[var(--muted)]/50" />
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                  No projects submitted yet
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Submit your coursework or personal software projects to showcase them.
                </p>
                <Button asChild size="sm" className="mt-4 bg-[var(--forest)] text-xs text-[var(--paper)]">
                  <Link href="/dashboard/projects/submit">Submit a Project</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--rule)]">
                {projects.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-[var(--sand)]/30"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {item.departmentName ?? "Computing"} · {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Opportunities */}
        <Card className="border-[var(--rule)] bg-white/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--rule)] px-5 py-4">
            <div>
              <CardTitle className="text-base font-semibold text-[var(--ink)]">
                Shared Opportunities
              </CardTitle>
              <CardDescription className="text-xs">
                Listings you contributed for student discovery
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-[var(--green)]">
              <Link href="/dashboard/opportunities">
                View All
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {opportunitiesLoading ? (
              <div className="p-6 text-center text-xs text-[var(--muted)]">
                Loading opportunities…
              </div>
            ) : !opportunities || opportunities.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="mx-auto size-8 text-[var(--muted)]/50" />
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                  No opportunities submitted yet
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Post scholarships, internships or SIWES leads to help other NACOSites.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4 border-[var(--rule)] text-xs">
                  <Link href="/dashboard/opportunities/submit">Post an Opportunity</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-[var(--rule)]">
                {opportunities.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 transition-colors hover:bg-[var(--sand)]/30"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {item.orgName} · {item.type.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
