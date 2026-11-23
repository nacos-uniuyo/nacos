"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import nacosLogoImg from "@/assets/images/nacos-logo.png";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Network,
  Shield,
  ShieldAlert,
  Moon,
  Sun,
  Monitor,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { Menu } from "./icons";
import { cn } from "@/lib/utils";

const departmentItems = [
  {
    slug: "computer-science",
    name: "Computer Science",
    shortName: "CSC",
    summary: "Algorithms, software construction, and computational theory.",
    icon: Cpu,
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    shortName: "CYB",
    summary: "Defensive and offensive security, digital forensics, and network protection.",
    icon: ShieldAlert,
  },
  {
    slug: "information-systems",
    name: "Information Systems",
    shortName: "INS",
    summary: "Enterprise data architectures, institutional systems, and data flow.",
    icon: Network,
  },
  {
    slug: "data-analytics",
    name: "Data Analytics",
    shortName: "DAN",
    summary: "Statistical intelligence, machine learning, and decision-science pipelines.",
    icon: Database,
  },
  {
    slug: "software-engineering",
    name: "Software Engineering",
    shortName: "SWE",
    summary: "Production system architecture, testing standards, and software delivery.",
    icon: Code2,
  },
] as const;

const navLinks = [
  { href: "/", label: "Home", matchPrefix: "/" },
  { href: "/projects", label: "Projects", matchPrefix: "/projects" },
  { href: "/opportunities", label: "Opportunities", matchPrefix: "/opportunities" },
  { href: "/yearbook", label: "Yearbook", matchPrefix: "/yearbook" },
  { href: "/staff", label: "Staff", matchPrefix: "/staff" },
  { href: "/events", label: "Events", matchPrefix: "/events" },
] as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [mobileDeptsOpen, setMobileDeptsOpen] = useState(false);
  const [_signingOut, setSigningOut] = useState(false);
  const { theme, setTheme } = useTheme();

  const menuRef = useRef<HTMLDivElement>(null);
  const deptMenuRef = useRef<HTMLDivElement>(null);
  const deptTimeoutRef = useRef<number | null>(null);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
    setDeptDropdownOpen(false);
    setMobileDeptsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open && !userMenuOpen && !deptDropdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setUserMenuOpen(false);
        setDeptDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, userMenuOpen, deptDropdownOpen]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuOpen && menuRef.current && !menuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (deptDropdownOpen && deptMenuRef.current && !deptMenuRef.current.contains(target)) {
        setDeptDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen, deptDropdownOpen]);

  const handleDeptMouseEnter = () => {
    if (deptTimeoutRef.current) {
      window.clearTimeout(deptTimeoutRef.current);
    }
    deptTimeoutRef.current = window.setTimeout(() => {
      setDeptDropdownOpen(true);
    }, 180);
  };

  const handleDeptMouseLeave = () => {
    if (deptTimeoutRef.current) {
      window.clearTimeout(deptTimeoutRef.current);
    }
    deptTimeoutRef.current = window.setTimeout(() => {
      setDeptDropdownOpen(false);
    }, 220);
  };

  const isCurrentRoute = (matchPrefix: string) => {
    if (matchPrefix === "/") {
      return pathname === "/" ? "page" : undefined;
    }
    if (matchPrefix === "/yearbook" && pathname.startsWith("/alumni")) {
      return "page";
    }
    return pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`) ? "page" : undefined;
  };

  const isDeptActive = pathname.startsWith("/departments");

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    setSigningOut(false);
    setUserMenuOpen(false);
    router.refresh();
  }

  const userInitials = user?.name
    ? user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("")
    : "NU";

  return (
    <header
      className="sticky top-0 z-30 bg-[rgba(6,42,20,0.92)] backdrop-blur-md border-b border-white/10"
      ref={deptMenuRef}
      onMouseLeave={handleDeptMouseLeave}
    >
      <div className="wrap h-20 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3.5 no-underline" aria-label="NACOS UNIUYO home">
          <Image src={nacosLogoImg} alt="" width={52} height={52} priority className="size-[52px] rounded-full ring-2 ring-white/90" />
          <span className="flex flex-col gap-0.5">
            <span className="caps text-white text-[15px] tracking-[0.18em]">NACOS</span>
            <span className="text-[var(--mint)] text-xs tracking-[0.04em]">University of Uyo</span>
          </span>
        </Link>

        {/* Right Navigation Bar */}
        <div className="flex items-center gap-6">
          <nav aria-label="Main" className="hidden lg:flex items-center gap-[clamp(20px,2.6vw,36px)]">
            <Link
              className="text-[#e7eaf3] hover:text-white no-underline text-[15px] font-medium py-2.5 px-0.5 border-b-2 border-transparent transition-colors aria-[current=page]:text-white aria-[current=page]:border-b-[var(--gold)]"
              href="/"
              aria-current={isCurrentRoute("/")}
            >
              Home
            </Link>

            {/* Departments Toggle Button */}
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-0 font-inherit p-0 text-[#e7eaf3] hover:text-white text-[15px] font-medium py-2.5 px-0.5 border-b-2 border-transparent transition-colors ${
                isDeptActive || deptDropdownOpen ? "text-white border-b-[var(--gold)]" : ""
              }`}
              aria-expanded={deptDropdownOpen}
              aria-haspopup="menu"
              onMouseEnter={handleDeptMouseEnter}
              onMouseLeave={handleDeptMouseLeave}
              onClick={() => {
                if (deptTimeoutRef.current) {
                  window.clearTimeout(deptTimeoutRef.current);
                }
                setDeptDropdownOpen((prev) => !prev);
              }}
            >
              <span>Departments</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ease-out text-[var(--mint-2)] ${
                  deptDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                className="text-[#e7eaf3] hover:text-white no-underline text-[15px] font-medium py-2.5 px-0.5 border-b-2 border-transparent transition-colors aria-[current=page]:text-white aria-[current=page]:border-b-[var(--gold)]"
                href={link.href}
                aria-current={isCurrentRoute(link.matchPrefix)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="group relative flex size-10 items-center justify-center rounded-full p-0.5 border border-white/20 transition-all hover:border-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] cursor-pointer bg-transparent"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label="User account menu"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                >
                  <span className="relative flex size-full items-center justify-center overflow-hidden rounded-full bg-[var(--forest-2)]">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={48}
                        height={48}
                        unoptimized
                        className="size-full object-cover scale-[1.38] transition-transform duration-200 group-hover:scale-[1.46]"
                      />
                    ) : (
                      <span
                        className="flex size-full items-center justify-center text-white text-sm font-semibold"
                        aria-hidden="true"
                      >
                        {userInitials}
                      </span>
                    )}
                  </span>
                </button>

                {userMenuOpen ? (
                  <div
                    className="absolute right-0 top-[calc(100%+12px)] w-[320px] rounded-2xl border border-[var(--rule)] bg-[var(--card-surface)] text-[var(--ink)] shadow-[0_24px_60px_-15px_rgba(6,42,20,0.35)] overflow-hidden z-60 animate-in fade-in zoom-in-95 duration-150"
                    role="menu"
                  >
                    {/* Header info card */}
                    <div className="flex flex-col items-center border-b border-[var(--rule)] bg-[var(--paper)] px-4 py-3 text-center">
                      <div className="relative mb-2 flex size-12 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-[var(--forest-2)] shadow-xs">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={48}
                            height={48}
                            unoptimized
                            className="size-full object-cover scale-[1.38]"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[var(--gold)] text-base font-bold">
                            {userInitials}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold leading-tight text-[var(--ink)]">
                        {user.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)] truncate max-w-[260px]">
                        {user.email}
                      </p>
                    </div>

                    {/* Quick Action Navigation */}
                    <div className="p-2 space-y-0.5">
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--sand)]/70 transition-colors no-underline"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--forest)]/10 text-[var(--forest)] group-hover:bg-[var(--forest)] group-hover:text-white transition-colors">
                            <LayoutDashboard className="size-4" />
                          </div>
                          <span>Member Dashboard</span>
                        </div>
                        <ChevronRight className="size-4 text-[var(--muted)] group-hover:text-[var(--forest)] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        href="/dashboard/profile"
                        role="menuitem"
                        className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--sand)]/70 transition-colors no-underline"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--forest)]/10 text-[var(--forest)] group-hover:bg-[var(--forest)] group-hover:text-white transition-colors">
                            <User className="size-4" />
                          </div>
                          <span>My Profile</span>
                        </div>
                        <ChevronRight className="size-4 text-[var(--muted)] group-hover:text-[var(--forest)] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        href="/dashboard/projects"
                        role="menuitem"
                        className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--sand)]/70 transition-colors no-underline"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--forest)]/10 text-[var(--forest)] group-hover:bg-[var(--forest)] group-hover:text-white transition-colors">
                            <FolderGit2 className="size-4" />
                          </div>
                          <span>My Projects</span>
                        </div>
                        <ChevronRight className="size-4 text-[var(--muted)] group-hover:text-[var(--forest)] group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      {((user as { role?: string }).role === "department_editor" ||
                        (user as { role?: string }).role === "admin") && (
                        <Link
                          href="/admin/departments"
                          role="menuitem"
                          className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--sand)]/70 transition-colors no-underline"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                              <Shield className="size-4" />
                            </div>
                            <span>Coordinator Console</span>
                          </div>
                          <ChevronRight className="size-4 text-[var(--muted)] group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      )}
                    </div>

                    {/* Theme switcher */}
                    <div className="border-t border-[var(--rule)] px-3 py-2.5 bg-[var(--paper)]/30">
                      <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)] mb-2">
                        <span>Appearance</span>
                        <span className="capitalize text-[var(--ink)] font-semibold">{theme ?? "system"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--sand)]/60 p-1 border border-[var(--rule)]">
                        <button
                          type="button"
                          onClick={() => setTheme("light")}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0",
                            theme === "light"
                              ? "bg-[var(--card-surface)] text-[var(--ink)] shadow-xs"
                              : "bg-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                          )}
                        >
                          <Sun className="size-3.5" />
                          <span>Light</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0",
                            theme === "dark"
                              ? "bg-[var(--card-surface)] text-[var(--ink)] shadow-xs"
                              : "bg-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                          )}
                        >
                          <Moon className="size-3.5" />
                          <span>Dark</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTheme("system")}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer border-0",
                            theme === "system"
                              ? "bg-[var(--card-surface)] text-[var(--ink)] shadow-xs"
                              : "bg-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                          )}
                        >
                          <Monitor className="size-3.5" />
                          <span>System</span>
                        </button>
                      </div>
                    </div>

                    {/* Footer sign out */}
                    <div className="border-t border-[var(--rule)] bg-[var(--paper)]/50 p-2">
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer border-0 bg-transparent"
                        onClick={handleSignOut}
                      >
                        <LogOut className="size-3.5" />
                        <span>Sign out of account</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 min-h-10 px-4.5 rounded-full border-[1.5px] border-[var(--gold)] bg-[rgba(216,180,92,0.08)] text-white text-[13.5px] font-semibold no-underline cursor-pointer whitespace-nowrap transition-all hover:bg-[var(--gold)] hover:text-[var(--forest)] hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            type="button"
            className="lg:hidden size-11.5 rounded-full border border-white/30 bg-transparent text-white inline-flex items-center justify-center cursor-pointer"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((prev) => !prev)}
          >
            <Menu open={open} />
          </button>
        </div>
      </div>

      {/* Departments Hover/Click Mega Panel for Desktop */}
      {deptDropdownOpen && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full bg-[rgba(6,42,20,0.98)] backdrop-blur-xl border-b border-[var(--gold)]/30 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-20 py-8"
          onMouseEnter={handleDeptMouseEnter}
          onMouseLeave={handleDeptMouseLeave}
        >
          <div className="wrap grid grid-cols-5 gap-6">
            {departmentItems.map((dept) => {
              const Icon = dept.icon;
              return (
                <Link
                  key={dept.slug}
                  href={`/departments/${dept.slug}`}
                  className="group flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--gold)]/50 transition-all no-underline"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-[var(--gold)]/10 text-[var(--gold)] group-hover:bg-[var(--gold)] group-hover:text-[var(--forest)] transition-colors">
                      <Icon size={18} />
                    </span>
                    <span className="caps text-[10px] text-[var(--mint-2)]">{dept.shortName}</span>
                  </div>
                  <div>
                    <h3 className="serif text-lg text-white m-0 group-hover:text-[var(--gold)] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-[var(--mint)] leading-relaxed m-0 mt-1 line-clamp-2">
                      {dept.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[var(--forest)] px-6 py-6 overflow-y-auto max-h-[85vh]">
          <ul className="flex flex-col list-none m-0 p-0 divide-y divide-white/10">
            <li>
              <Link href="/" className="block py-3 text-xl text-white no-underline">
                Home
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="w-full flex items-center justify-between py-3 text-xl text-white bg-transparent border-0 cursor-pointer"
                onClick={() => setMobileDeptsOpen((p) => !p)}
              >
                <span>Departments</span>
                <ChevronDown size={18} className={`transition-transform ${mobileDeptsOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileDeptsOpen && (
                <div className="pl-4 pb-3 flex flex-col gap-2">
                  {departmentItems.map((d) => (
                    <Link
                      key={d.slug}
                      href={`/departments/${d.slug}`}
                      className="text-sm text-[var(--mint-2)] hover:text-white py-1 no-underline"
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
            {navLinks.slice(1).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-3 text-xl text-white no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[var(--forest-2)]">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          width={36}
                          height={36}
                          unoptimized
                          className="size-full object-cover scale-[1.38]"
                        />
                      ) : (
                        <span className="text-[var(--gold)] text-xs font-bold">
                          {userInitials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="m-0 text-xs text-[var(--mint-2)] truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-[var(--gold)] text-[var(--forest)] text-sm font-semibold no-underline"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full text-left py-2 text-sm font-semibold text-destructive bg-transparent border-0 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 rounded-full border border-[var(--gold)] text-white text-sm font-semibold no-underline"
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
