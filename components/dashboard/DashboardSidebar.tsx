"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowLeft,
  IconBookmark,
  IconBriefcase,
  IconDotsVertical,
  IconFolder,
  IconLayoutDashboard,
  IconLogout,
  IconSettings,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import nacosLogoImg from "@/assets/images/nacos-logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const mainLinks = [
  { title: "Overview", url: "/dashboard", icon: IconLayoutDashboard, exact: true },
  { title: "Projects", url: "/dashboard/projects", icon: IconFolder, exact: false },
  { title: "Opportunities", url: "/dashboard/opportunities", icon: IconBriefcase, exact: true },
  { title: "Saved", url: "/dashboard/opportunities/saved", icon: IconBookmark, exact: false },
];

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const initials =
    user.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  const isCoordinator = user.role === "department_editor" || user.role === "admin";

  const accountLinks = [
    ...(isCoordinator
      ? [{ title: "Coordinator console", url: "/admin/departments", icon: IconShield, exact: false }]
      : []),
    { title: "Profile", url: "/dashboard/profile", icon: IconSettings, exact: false },
    { title: "Back to the website", url: "/", icon: IconArrowLeft, exact: true },
  ];

  const isActive = (url: string, exact: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

  async function handleSignOut() {
    await authClient.signOut();
    window.location.href = "/login";
  }

  const renderLinks = (links: typeof mainLinks) => (
    <SidebarMenu>
      {links.map((item) => (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.url, item.exact)}
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
      ))}
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
          <SidebarGroupLabel>Your space</SidebarGroupLabel>
          <SidebarGroupContent>{renderLinks(mainLinks)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>{renderLinks(accountLinks)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {userAvatar}
                  <span className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-sidebar-foreground">{user.email}</span>
                  </span>
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
                    {userAvatar}
                    <div className="grid min-w-0 flex-1 leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <IconUser />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/projects">
                      <IconFolder />
                      My Projects
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/opportunities/saved">
                      <IconBookmark />
                      Saved
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
