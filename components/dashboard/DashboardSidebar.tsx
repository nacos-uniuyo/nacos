"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useSyncExternalStore } from "react";
import {
  IconBell,
  IconBookmark,
  IconBriefcase,
  IconBriefcase2,
  IconExternalLink,
  IconFolder,
  IconFolderCheck,
  IconLayoutDashboard,
  IconMoon,
  IconShield,
  IconSun,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import nacosLogoImg from "@/assets/images/nacos-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

interface SidebarLinkItem {
  title: string;
  url: string;
  icon: typeof IconLayoutDashboard;
  exact: boolean;
  badge?: number;
}

const mainLinks: SidebarLinkItem[] = [
  { title: "Overview", url: "/dashboard", icon: IconLayoutDashboard, exact: true },
  { title: "Projects", url: "/dashboard/projects", icon: IconFolder, exact: false },
  { title: "Opportunities", url: "/dashboard/opportunities", icon: IconBriefcase, exact: true },
  { title: "Saved", url: "/dashboard/opportunities/saved", icon: IconBookmark, exact: false },
  { title: "Account", url: "/dashboard/profile", icon: IconUser, exact: false },
];

export function DashboardSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isLight = mounted && resolvedTheme === "light";
  const isDark = mounted && resolvedTheme === "dark";

  const { user, isCoordinator, isPending } = useDashboardSession();
  const utils = trpc.useUtils();
  const { data: overview } = trpc.coordinator.getDepartmentOverview.useQuery(undefined, {
    enabled: isCoordinator,
  });
  const pendingCount = overview?.stats.pendingProjects ?? 0;
  const pendingOpportunities = overview?.stats.pendingOpportunities ?? 0;

  const prefetchRoute = useCallback(
    (url: string) => {
      if (isPending || !user) return;

      if (url === "/dashboard") {
        void utils.user.getProfile.prefetch();
        void utils.user.getDashboardStats.prefetch();
        void utils.project.mySubmissions.prefetch();
        void utils.opportunity.mySubmissions.prefetch();
        void utils.opportunity.myBookmarks.prefetch();
        return;
      }
      if (url === "/dashboard/projects") {
        void utils.project.mySubmissions.prefetch();
        return;
      }
      if (url === "/dashboard/projects/submit") {
        void utils.department.list.prefetch();
        void utils.session.list.prefetch();
        return;
      }
      if (url === "/dashboard/opportunities") {
        void utils.opportunity.mySubmissions.prefetch();
        return;
      }
      if (url === "/dashboard/opportunities/saved") {
        void utils.opportunity.myBookmarks.prefetch();
        return;
      }
      if (url === "/dashboard/opportunities/submit") {
        void utils.department.list.prefetch();
        return;
      }
      if (url === "/dashboard/profile") {
        void utils.user.getProfile.prefetch();
        void utils.department.list.prefetch();
        return;
      }
      if (!isCoordinator) return;
      if (url === "/dashboard/departments") {
        void utils.coordinator.getDepartmentOverview.prefetch();
        void utils.coordinator.listProjects.prefetch({});
        void utils.coordinator.listNotices.prefetch();
        return;
      }
      if (url === "/dashboard/departments/projects") {
        void utils.coordinator.listProjects.prefetch({});
        return;
      }
      if (url === "/dashboard/departments/roster") {
        void utils.coordinator.getRoster.prefetch({ filter: "all", page: 1, limit: 25 });
        void utils.department.list.prefetch();
        return;
      }
      if (url === "/dashboard/departments/opportunities") {
        void utils.coordinator.listOpportunities.prefetch({});
        return;
      }
      if (url === "/dashboard/departments/notices") {
        void utils.coordinator.listNotices.prefetch();
      }
    },
    [isPending, user, isCoordinator, utils],
  );

  const adminLinks: SidebarLinkItem[] = isCoordinator
    ? [
        { title: "Console", url: "/dashboard/departments", icon: IconShield, exact: true },
        {
          title: "Review Queue",
          url: "/dashboard/departments/projects",
          icon: IconFolderCheck,
          exact: false,
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
        {
          title: "Opportunities",
          url: "/dashboard/departments/opportunities",
          icon: IconBriefcase2,
          exact: false,
          badge: pendingOpportunities > 0 ? pendingOpportunities : undefined,
        },
        { title: "Roster", url: "/dashboard/departments/roster", icon: IconUsers, exact: false },
        { title: "Notices", url: "/dashboard/departments/notices", icon: IconBell, exact: false },
      ]
    : [];

  const isActive = (url: string, exact: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

  const renderLinks = (links: SidebarLinkItem[]) => (
    <SidebarMenu className="gap-1">
      {links.map((item) => {
        const active = isActive(item.url, item.exact);
        return (
          <SidebarMenuItem key={item.url} className="relative">
            {active ? (
              <span
                aria-hidden="true"
                className="absolute -left-2 top-1/2 z-10 h-6 w-1 -translate-y-1/2 rounded-r-md bg-sidebar-primary"
              />
            ) : null}
            <SidebarMenuButton
              asChild
              size="default"
              isActive={active}
              tooltip={item.title}
              className={cn(
                "h-10 rounded-xl px-3 transition-colors",
                active
                  ? "data-[active=true]:bg-sidebar-primary data-[active=true]:font-medium data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm hover:data-[active=true]:bg-sidebar-primary/95"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
              )}
              onClick={() => {
                if (isMobile) setOpenMobile(false);
              }}
              onMouseEnter={() => prefetchRoute(item.url)}
              onFocus={() => prefetchRoute(item.url)}
            >
              <Link href={item.url} prefetch>
                <item.icon className="size-4.5 shrink-0" />
                <span className="flex-1 truncate">{item.title}</span>
                {item.badge !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-sidebar-primary/25 text-white",
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="px-3 pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="rounded-xl hover:bg-sidebar-accent/60">
              <Link href="/">
                <Image src={nacosLogoImg} alt="" width={32} height={32} className="size-8 shrink-0" />
                <span className="grid text-left leading-tight">
                  <span className="truncate font-semibold tracking-tight text-sidebar-foreground">
                    NACOS
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/70">
                    UNIUYO Portal
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {isPending || !user ? (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
              Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5" aria-busy="true" aria-label="Loading navigation">
                {Array.from({ length: 5 }, (_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="flex h-10 items-center gap-3 px-3">
                      <Skeleton className="size-4.5 shrink-0 rounded bg-sidebar-accent/70" />
                      <Skeleton className="h-3.5 w-24 rounded bg-sidebar-accent/70" />
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
                Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>{renderLinks(mainLinks)}</SidebarGroupContent>
            </SidebarGroup>

            {adminLinks.length > 0 ? (
              <SidebarGroup>
                <SidebarGroupLabel className="px-3 text-[10px] font-semibold tracking-wider text-sidebar-foreground/50 uppercase">
                  Coordinator
                </SidebarGroupLabel>
                <SidebarGroupContent>{renderLinks(adminLinks)}</SidebarGroupContent>
              </SidebarGroup>
            ) : null}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="gap-2.5 p-3">
        <Link
          href="/"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-sidebar-accent/55 text-xs font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <span>Public Portal</span>
          <IconExternalLink className="size-3.5 opacity-80" />
        </Link>

        <div className="flex items-center rounded-xl bg-sidebar-accent/45 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all",
              isLight
                ? "bg-white text-[#062a14] shadow-2xs"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
            )}
          >
            <IconSun className="size-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all",
              isDark
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-2xs"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
            )}
          >
            <IconMoon className="size-3.5" />
            Dark
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
