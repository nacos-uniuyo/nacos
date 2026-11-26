"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import {
  IconArrowLeft,
  IconBell,
  IconBookmark,
  IconBriefcase,
  IconFilePlus,
  IconFolder,
  IconFolderCheck,
  IconLayoutDashboard,
  IconLogout,
  IconMoon,
  IconShield,
  IconSun,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import nacosLogoImg from "@/assets/images/nacos-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { authClient } from "@/lib/auth-client";

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string;
  };
}

const mainLinks = [
  { title: "Overview", url: "/dashboard", icon: IconLayoutDashboard, exact: true },
  { title: "Projects", url: "/dashboard/projects", icon: IconFolder, exact: false },
  { title: "Opportunities", url: "/dashboard/opportunities", icon: IconBriefcase, exact: true },
  { title: "Saved", url: "/dashboard/opportunities/saved", icon: IconBookmark, exact: false },
  { title: "Account", url: "/dashboard/profile", icon: IconUser, exact: false },
];

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
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

  const initials =
    user.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  const isCoordinator = user.role === "department_editor" || user.role === "admin";

  const adminLinks = isCoordinator
    ? [
        { title: "Department Overview", url: "/dashboard/departments", icon: IconShield, exact: true },
        { title: "Project Queue", url: "/dashboard/departments/projects", icon: IconFolderCheck, exact: false },
        { title: "Student Roster", url: "/dashboard/departments/roster", icon: IconUsers, exact: false },
        { title: "Notices", url: "/dashboard/departments/notices", icon: IconBell, exact: true },
        { title: "Publish Notice", url: "/dashboard/departments/notices/new", icon: IconFilePlus, exact: false },
      ]
    : [];

  const isActive = (url: string, exact: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  const renderLinks = (links: typeof mainLinks) => (
    <SidebarMenu className="gap-1">
      {links.map((item) => {
        const active = isActive(item.url, item.exact);
        return (
          <SidebarMenuItem key={item.url} className="relative">
            {active ? (
              <span
                aria-hidden="true"
                className="absolute -left-2 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-md bg-sidebar-primary z-10"
              />
            ) : null}
            <SidebarMenuButton
              asChild
              size="default"
              isActive={active}
              tooltip={item.title}
              onClick={() => {
                if (isMobile) setOpenMobile(false);
              }}
            >
              <Link href={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  const userAvatar = (
    <Avatar className="size-8 rounded-lg">
      {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
      <AvatarFallback className="rounded-lg text-xs font-semibold text-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <Image src={nacosLogoImg} alt="" width={32} height={32} className="size-8" />
                <span className="grid text-left leading-tight">
                  <span className="truncate font-semibold">NACOS</span>
                  <span className="truncate text-xs text-sidebar-foreground">University of Uyo</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium tracking-wider uppercase">
            Main menu
          </SidebarGroupLabel>
          <SidebarGroupContent>{renderLinks(mainLinks)}</SidebarGroupContent>
        </SidebarGroup>

        {adminLinks.length > 0 ? (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-medium tracking-wider uppercase">
              Coordinator
            </SidebarGroupLabel>
            <SidebarGroupContent>{renderLinks(adminLinks)}</SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="gap-3">
        <Link
          href="/"
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
          className="flex w-full items-center justify-center rounded-lg bg-sidebar-accent/20 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/35"
        >
          Browse
        </Link>
        <div className="flex items-center rounded-xl bg-sidebar-accent/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer ${
              isLight
                ? "bg-background text-foreground shadow-2xs"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
            }`}
          >
            <IconSun className="size-3.5" />
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium transition-all cursor-pointer ${
              isDark
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-2xs"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
            }`}
          >
            <IconMoon className="size-3.5" />
            Dark
          </button>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Log out"
              onClick={handleSignOut}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <IconLogout />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
              {userAvatar}
              <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
