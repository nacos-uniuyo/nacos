"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowLeft,
  IconBookmark,
  IconBriefcase,
  IconCirclePlusFilled,
  IconDotsVertical,
  IconFolder,
  IconFolderPlus,
  IconInnerShadowTop,
  IconLayoutDashboard,
  IconLogout,
  IconPlus,
  IconSettings,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const userInitials = user.name
    ? user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("")
    : "U";

  const isCoordinator =
    user.role === "department_editor" || user.role === "admin";

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconLayoutDashboard,
      exact: true,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconFolder,
      exact: true,
    },
    {
      title: "Opportunities",
      url: "/dashboard/opportunities",
      icon: IconBriefcase,
      exact: true,
    },
    {
      title: "Bookmarks",
      url: "/dashboard/opportunities/saved",
      icon: IconBookmark,
    },
  ];

  const documents = [
    {
      name: "Submit Project",
      url: "/dashboard/projects/submit",
      icon: IconFolderPlus,
    },
    {
      name: "Post Opportunity",
      url: "/dashboard/opportunities/submit",
      icon: IconPlus,
    },
  ];

  const navSecondary = [
    ...(isCoordinator
      ? [
          {
            title: "Coordinator Console",
            url: "/admin/departments",
            icon: IconShield,
          },
        ]
      : []),
    {
      title: "Settings",
      url: "/dashboard/profile",
      icon: IconSettings,
    },
    {
      title: "Back to Website",
      url: "/",
      icon: IconArrowLeft,
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/" className="flex items-center gap-2">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">NACOS UNIUYO</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* NavMain with Quick Create and Action button */}
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  asChild
                  tooltip="Quick Submit Project"
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground font-medium"
                >
                  <Link href="/dashboard/projects/submit">
                    <IconCirclePlusFilled />
                    <span>Quick Create</span>
                  </Link>
                </SidebarMenuButton>
                <Button
                  size="icon-sm"
                  variant="outline"
                  asChild
                  className="size-8 rounded-md group-data-[collapsible=icon]:opacity-0 border-sidebar-border bg-sidebar hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
                >
                  <Link href="/dashboard/opportunities/submit" title="Post Opportunity">
                    <IconPlus className="size-4" />
                    <span className="sr-only">Post Opportunity</span>
                  </Link>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarMenu>
              {navMain.map((item) => {
                const active = isActive(item.url, item.exact);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Documents / Quick Action Links */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel className="text-sidebar-foreground/70">Actions</SidebarGroupLabel>
          <SidebarMenu>
            {documents.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {navSecondary.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url, item.url === "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <Link href={item.url}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* NavUser Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    {user.image ? (
                      <AvatarImage
                        src={user.image}
                        alt={user.name}
                        className="object-cover scale-[1.38]"
                      />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <IconDotsVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      {user.image ? (
                        <AvatarImage
                          src={user.image}
                          alt={user.name}
                          className="object-cover scale-[1.38]"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-lg bg-neutral-800 text-neutral-200 text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                      <IconUser className="size-4" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/projects" className="flex items-center gap-2 cursor-pointer">
                      <IconFolder className="size-4" />
                      <span>My Projects</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/opportunities/saved" className="flex items-center gap-2 cursor-pointer">
                      <IconBookmark className="size-4" />
                      <span>Saved Bookmarks</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <IconLogout className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
