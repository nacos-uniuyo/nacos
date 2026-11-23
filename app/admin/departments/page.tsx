"use client";

import Link from "next/link";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  FolderCheck,
  Loader2,
  Plus,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--rule)] bg-white p-5 shadow-xs">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${accent}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-[var(--ink)]">{value}</p>
        <p className="text-xs text-[var(--muted)]">{label}</p>
      </div>
    </div>
  );
}

export default function CoordinatorOverviewPage() {
  const { data, isLoading, error } = trpc.coordinator.getDepartmentOverview.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm font-medium text-[var(--ink)]">Failed to load department overview</p>
        <p className="max-w-sm text-xs text-[var(--muted)]">{error.message}</p>
      </div>
    );
  }

  if (!data) return null;

  const { department, stats } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--forest)]/10 px-2.5 py-1 text-[0.7rem] font-bold tracking-widest text-[var(--forest)] uppercase">
          Coordinator Console
        </div>
        <h1 className="serif mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
          {department.name}
        </h1>
        {department.shortName && (
          <p className="mt-1 text-sm font-medium text-[var(--muted)]">
            {department.shortName}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
          Department at a Glance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Registered Students"
            value={stats.totalStudents}
            icon={Users}
            accent="bg-[var(--forest)]/10 text-[var(--forest)]"
          />
          <StatCard
            label="Total Project Proposals"
            value={stats.totalProjects}
            icon={FolderCheck}
            accent="bg-blue-50 text-blue-700"
          />
          <StatCard
            label="Pending Review"
            value={stats.pendingProjects}
            icon={Clock}
            accent="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Approved Projects"
            value={stats.approvedProjects}
            icon={CheckCircle2}
            accent="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Changes Requested"
            value={stats.rejectedProjects}
            icon={XCircle}
            accent="bg-red-50 text-red-700"
          />
          <StatCard
            label="Dept. Notices Published"
            value={stats.publishedNotices}
            icon={Bell}
            accent="bg-[var(--gold)]/20 text-[var(--forest)]"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-[var(--forest)] hover:bg-[var(--forest)]/90 text-white gap-2">
            <Link href="/admin/departments/projects?status=submitted">
              <Clock className="size-4" />
              Review Pending ({stats.pendingProjects})
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 border-[var(--rule)]">
            <Link href="/admin/departments/roster">
              <Users className="size-4" />
              Student Roster
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2 border-[var(--rule)]">
            <Link href="/admin/departments/notices/new">
              <Plus className="size-4" />
              Post a Notice
            </Link>
          </Button>
        </div>
      </div>

      {/* Pending Review Alert */}
      {stats.pendingProjects > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-900">
                {stats.pendingProjects} proposal{stats.pendingProjects !== 1 ? "s" : ""} awaiting review
              </p>
              <p className="mt-0.5 text-sm text-amber-700">
                Students are waiting for feedback on their project proposals.
              </p>
              <Button asChild size="sm" className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
                <Link href="/admin/departments/projects?status=submitted">
                  Open Review Queue
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
