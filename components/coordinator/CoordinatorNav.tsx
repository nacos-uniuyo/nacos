"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Building2,
  ChevronRight,
  FilePlus,
  FolderCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Department Overview",
    href: "/admin/departments",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Project Review Queue",
    href: "/admin/departments/projects",
    icon: FolderCheck,
  },
  {
    title: "Student Roster",
    href: "/admin/departments/roster",
    icon: Users,
  },
  {
    title: "Department Notices",
    href: "/admin/departments/notices",
    icon: Bell,
    exact: true,
  },
  {
    title: "Publish Notice",
    href: "/admin/departments/notices/new",
    icon: FilePlus,
  },
];

interface CoordinatorNavProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
  };
  departmentSlug?: string | null;
}

export function CoordinatorNav({ user }: CoordinatorNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  }

  const NavContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      <div className="space-y-6">
        {/* Workspace Brand Header */}
        <div className="border-b border-[var(--rule)] pb-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded bg-[var(--gold)]/20 px-2 py-0.5 text-[0.68rem] font-bold tracking-wider text-[var(--forest)] uppercase">
              <ShieldAlert className="size-3" />
              Coordinator Workspace
            </span>
            <button
              type="button"
              className="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--sand)] lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>
          <h2 className="serif mt-2 text-xl font-bold tracking-tight text-[var(--ink)]">
            Department Console
          </h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Academic moderation and roster controls
          </p>
        </div>

        {/* Links Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--forest)] text-[var(--paper)] font-semibold shadow-xs"
                    : "text-[var(--ink)] hover:bg-[var(--sand)] hover:text-[var(--forest)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active
                        ? "text-[var(--gold)]"
                        : "text-[var(--muted)] group-hover:text-[var(--forest)]"
                    )}
                  />
                  <span>{item.title}</span>
                </div>
                {active && <ChevronRight className="size-3 text-[var(--gold)]" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Coordinator User Details & Logout */}
      <div className="border-t border-[var(--rule)] pt-4">
        <div className="mb-3 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-3">
          <div className="flex items-center gap-2.5">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-full object-cover border border-[var(--gold)]/40"
              />
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--forest)] text-xs font-bold text-[var(--gold)]">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[var(--ink)]">
                {user.name}
              </p>
              <p className="truncate text-[0.7rem] text-[var(--forest)] capitalize">
                {user.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-xs text-[var(--muted)] hover:text-[var(--ink)]"
          >
            <Link href="/dashboard">
              <Building2 className="size-3.5" />
              Switch to Member Dashboard
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 text-xs font-medium text-[var(--ink)] hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="size-3.5" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--rule)] bg-[var(--paper)]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-[var(--rule)] bg-white p-2 text-[var(--ink)] shadow-xs"
            onClick={() => setMobileOpen(true)}
            aria-label="Open coordinator navigation"
          >
            <Menu className="size-5" />
          </button>
          <span className="serif text-lg font-bold text-[var(--ink)]">
            Department Coordinator
          </span>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-[var(--paper)] shadow-2xl transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {NavContent}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden h-screen w-68 shrink-0 border-r border-[var(--rule)] bg-[var(--paper)] lg:sticky lg:top-0 lg:block">
        {NavContent}
      </aside>
    </>
  );
}
