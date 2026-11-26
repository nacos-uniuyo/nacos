"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bell,
  BellOff,
  Bookmark,
  Briefcase,
  ChevronRight,
  Clock,
  FolderGit2,
  Globe,
  LogOut,
  Search,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { DashboardBreadcrumbs } from "@/components/dashboard/DashboardBreadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient, useDashboardSession } from "@/lib/auth-client";
import type { RoleName } from "@/lib/enums";
import { roleLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  meta: string;
  href: string;
  kind: "project" | "opportunity" | "saved" | "queue";
}

function SearchBox({
  isAuthenticated,
  isCoordinator,
}: {
  isAuthenticated: boolean;
  isCoordinator: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const prefetchSearchData = () => {
    if (!isAuthenticated) return;
    void utils.project.mySubmissions.prefetch();
    void utils.opportunity.mySubmissions.prefetch();
    void utils.opportunity.myBookmarks.prefetch();
    if (isCoordinator) {
      void utils.coordinator.listProjects.prefetch({});
    }
  };

  const { data: projects } = trpc.project.mySubmissions.useQuery(undefined, {
    enabled: isAuthenticated && open,
  });
  const { data: opportunities } = trpc.opportunity.mySubmissions.useQuery(undefined, {
    enabled: isAuthenticated && open,
  });
  const { data: bookmarks } = trpc.opportunity.myBookmarks.useQuery(undefined, {
    enabled: isAuthenticated && open,
  });
  const { data: deptProjects } = trpc.coordinator.listProjects.useQuery(
    {},
    { enabled: open && isCoordinator },
  );

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: SearchResult[] = [];

    for (const p of projects ?? []) {
      if (p.title.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q)) {
        matches.push({
          id: `p-${p.id}`,
          title: p.title,
          meta: `Project · ${p.departmentName ?? "Computing"}`,
          href: "/dashboard/projects",
          kind: "project",
        });
      }
    }

    for (const o of opportunities ?? []) {
      if (o.title.toLowerCase().includes(q) || o.orgName.toLowerCase().includes(q)) {
        matches.push({
          id: `o-${o.id}`,
          title: o.title,
          meta: `Opportunity · ${o.orgName}`,
          href: "/dashboard/opportunities",
          kind: "opportunity",
        });
      }
    }

    for (const b of bookmarks ?? []) {
      if (
        b.opportunity.title.toLowerCase().includes(q) ||
        b.opportunity.orgName.toLowerCase().includes(q)
      ) {
        matches.push({
          id: `b-${b.bookmarkId}`,
          title: b.opportunity.title,
          meta: `Saved · ${b.opportunity.orgName}`,
          href: "/dashboard/opportunities/saved",
          kind: "saved",
        });
      }
    }

    if (isCoordinator) {
      for (const dp of deptProjects?.projects ?? []) {
        if (
          dp.title.toLowerCase().includes(q) ||
          (dp.courseCode?.toLowerCase().includes(q) ?? false) ||
          (dp.author?.name.toLowerCase().includes(q) ?? false)
        ) {
          matches.push({
            id: `q-${dp.id}`,
            title: dp.title,
            meta: `Queue · ${dp.author?.name ?? "Student"}`,
            href: `/dashboard/departments/projects/${dp.slug}`,
            kind: "queue",
          });
        }
      }
    }

    return matches.slice(0, 8);
  }, [query, projects, opportunities, bookmarks, deptProjects, isCoordinator]);

  const kindIcon = (kind: SearchResult["kind"]) => {
    switch (kind) {
      case "project":
        return <FolderGit2 className="size-4 text-emerald-600 dark:text-emerald-400" />;
      case "opportunity":
        return <Briefcase className="size-4 text-sky-600 dark:text-sky-400" />;
      case "saved":
        return <Bookmark className="size-4 text-violet-600 dark:text-violet-400" />;
      case "queue":
        return <Clock className="size-4 text-amber-600 dark:text-amber-300" />;
    }
  };

  return (
    <div
      className="relative hidden w-full max-w-xs md:block lg:max-w-sm"
      onMouseEnter={prefetchSearchData}
      onFocusCapture={prefetchSearchData}
    >
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl border bg-background px-3 transition-colors",
          open ? "border-primary ring-2 ring-primary/15" : "border-border",
        )}
      >
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          aria-label="Search dashboard"
          placeholder="Search projects, openings..."
          value={query}
          disabled={!isAuthenticated}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery("")}
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {open && query.trim() ? (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-72 rounded-2xl border bg-popover p-2 shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No matches for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              {results.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors hover:bg-muted"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                      {kindIcon(item.kind)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-foreground">
                        {item.title}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {item.meta}
                      </span>
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

function NotificationsPopover({
  isAuthenticated,
  isCoordinator,
}: {
  isAuthenticated: boolean;
  isCoordinator: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { data: profile } = trpc.user.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: projects } = trpc.project.mySubmissions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: overview } = trpc.coordinator.getDepartmentOverview.useQuery(undefined, {
    enabled: isCoordinator,
  });

  const alerts = useMemo(() => {
    const items: {
      id: string;
      title: string;
      meta: string;
      href: string;
      tone: "amber" | "rose";
    }[] = [];

    if (profile && (!profile.regNumber || !profile.departmentId)) {
      items.push({
        id: "incomplete-profile",
        title: "Profile incomplete",
        meta: "Add department & reg. number",
        href: "/dashboard/profile",
        tone: "amber",
      });
    }

    const rejectedCount = (projects ?? []).filter((p) => p.status === "rejected").length;
    if (rejectedCount > 0) {
      items.push({
        id: "rejected-projects",
        title: `${rejectedCount} project${rejectedCount === 1 ? "" : "s"} need changes`,
        meta: "Coordinator feedback waiting",
        href: "/dashboard/projects",
        tone: "rose",
      });
    }

    const pendingQueue = overview?.stats.pendingProjects ?? 0;
    if (isCoordinator && pendingQueue > 0) {
      items.push({
        id: "pending-queue",
        title: `${pendingQueue} proposal${pendingQueue === 1 ? "" : "s"} to review`,
        meta: overview?.department.shortName ?? "Department queue",
        href: "/dashboard/departments/projects",
        tone: "amber",
      });
    }

    return items;
  }, [profile, projects, overview, isCoordinator]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={alerts.length > 0 ? `Alerts, ${alerts.length}` : "Alerts"}
          className="relative size-9 rounded-xl bg-background shadow-none"
        >
          <Bell className="size-4 text-muted-foreground" />
          {alerts.length > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-card">
              {alerts.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Alerts</p>
          <button
            type="button"
            aria-label="Close alerts"
            onClick={() => setOpen(false)}
            className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BellOff className="size-4" />
            </span>
            <p className="text-xs font-medium text-foreground">All caught up</p>
          </div>
        ) : (
          <ul className="divide-y">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <Link
                  href={alert.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      alert.tone === "rose"
                        ? "bg-rose-500/12 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/12 text-amber-600 dark:text-amber-300",
                    )}
                  >
                    <AlertCircle className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {alert.title}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {alert.meta}
                    </span>
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

const compactRoleLabels: Record<RoleName, string> = {
  user: "Member",
  department_editor: "Coordinator",
  admin: "Admin",
};

export function DashboardNavbar() {
  const router = useRouter();
  const { user, role, isAuthenticated, isCoordinator, isPending } = useDashboardSession();
  const roleTag = compactRoleLabels[role] ?? roleLabels[role] ?? "Member";

  const initials =
    (user?.name ?? "")
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SidebarTrigger variant="outline" className="size-9 shrink-0 rounded-xl bg-background shadow-none" />
        <Separator orientation="vertical" className="hidden h-4! sm:block" />
        <div className="hidden sm:block">
          <DashboardBreadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SearchBox isAuthenticated={isAuthenticated} isCoordinator={isCoordinator} />
        <NotificationsPopover isAuthenticated={isAuthenticated} isCoordinator={isCoordinator} />

        {isPending || !user ? (
          <div className="flex items-center gap-2.5 p-1 pr-2">
            <Skeleton className="size-9 rounded-full" />
            <div className="hidden flex-col gap-1 sm:flex">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-14" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2.5 rounded-xl p-1 pr-2 text-left transition-colors hover:bg-muted/70"
              >
                <span className="relative">
                  <Avatar className="size-9">
                    {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                    <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                </span>
                <span className="hidden flex-col sm:flex">
                  <span className="max-w-36 truncate text-xs font-semibold leading-tight text-foreground">
                    {user.name}
                  </span>
                  <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {roleTag}
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1.5">
              <div className="flex items-center gap-2.5 px-2.5 py-2">
                <Avatar className="size-9">
                  {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                  <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
                className="cursor-pointer rounded-xl py-2 text-xs"
              >
                <UserRound className="size-3.5" />
                Account
              </DropdownMenuItem>
              {isCoordinator ? (
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/departments")}
                  className="cursor-pointer rounded-xl py-2 text-xs"
                >
                  <Shield className="size-3.5" />
                  Coordinator Console
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                onClick={() => router.push("/")}
                className="cursor-pointer rounded-xl py-2 text-xs"
              >
                <Globe className="size-3.5" />
                Public Portal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleSignOut}
                className="cursor-pointer rounded-xl py-2 text-xs"
              >
                <LogOut className="size-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
