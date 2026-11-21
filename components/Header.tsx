"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Binary,
  Code2,
  Cpu,
  Database,
  Network,
  ShieldAlert,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Menu } from "./icons";

const departmentItems = [
  { slug: "computer-science", name: "Computer Science", icon: Cpu },
  { slug: "cybersecurity", name: "Cybersecurity", icon: ShieldAlert },
  { slug: "information-systems", name: "Information Systems", icon: Network },
  { slug: "data-analytics", name: "Data Analytics", icon: Database },
  { slug: "software-engineering", name: "Software Engineering", icon: Code2 },
] as const;

const navLinks = [
  { href: "/", label: "Home", matchPrefix: "/" },
  { href: "/projects", label: "Projects", matchPrefix: "/projects" },
  { href: "/opportunities", label: "Opportunities", matchPrefix: "/opportunities" },
  { href: "/yearbook", label: "Yearbook", matchPrefix: "/yearbook" },
  { href: "/events", label: "Events", matchPrefix: "/events" },
  { href: "/blog", label: "Blog", matchPrefix: "/blog" },
] as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [mobileDeptsOpen, setMobileDeptsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

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
    setDeptDropdownOpen(true);
  };

  const handleDeptMouseLeave = () => {
    deptTimeoutRef.current = window.setTimeout(() => {
      setDeptDropdownOpen(false);
    }, 150);
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
    <header className="site-header">
      <div className="wrap bar">
        <Link href="/" className="brand" aria-label="NACOS UNIUYO home">
          <Image src="/images/nacos-logo.png" alt="" width={52} height={52} priority />
          <span className="brand-text">
            <span className="caps brand-name">NACOS</span>
            <span className="brand-sub">University of Uyo</span>
          </span>
        </Link>

        {/* Right Navigation Bar */}
        <div className="flex items-center gap-6">
          <nav aria-label="Main" className="main-nav">
            <Link
              className="navlink"
              href="/"
              aria-current={isCurrentRoute("/")}
            >
              Home
            </Link>

            {/* Departments Dropdown */}
            <div
              className="relative inline-flex items-center"
              ref={deptMenuRef}
              onMouseEnter={handleDeptMouseEnter}
              onMouseLeave={handleDeptMouseLeave}
            >
              <button
                type="button"
                className={`navlink inline-flex items-center cursor-pointer bg-transparent border-0 font-inherit p-0 ${
                  isDeptActive ? "text-white" : ""
                }`}
                aria-expanded={deptDropdownOpen}
                aria-haspopup="menu"
                onClick={() => setDeptDropdownOpen((prev) => !prev)}
              >
                <span>Departments</span>
              </button>

              {deptDropdownOpen && (
                <div
                  className="absolute left-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  role="menu"
                  aria-label="Departments"
                >
                  <div className="w-64 p-2 rounded-2xl bg-white shadow-2xl border border-[var(--rule)] flex flex-col gap-1">
                    <div className="px-3 py-1.5 border-b border-[var(--rule)] text-[11px] font-semibold tracking-wider uppercase text-[var(--muted)]">
                      Faculty Departments
                    </div>
                    {departmentItems.map((dept) => {
                      const Icon = dept.icon;
                      const isActive = pathname === `/departments/${dept.slug}`;
                      return (
                        <Link
                          key={dept.slug}
                          href={`/departments/${dept.slug}`}
                          role="menuitem"
                          onClick={() => setDeptDropdownOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline text-xs transition-colors ${
                            isActive
                              ? "bg-[var(--forest)] text-white font-medium"
                              : "text-[var(--ink)] hover:bg-[var(--sand)] hover:text-[var(--forest)]"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isActive
                                ? "bg-white/15 text-[var(--gold)]"
                                : "bg-[var(--paper)] text-[var(--forest)]"
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className={isActive ? "text-white font-semibold" : "text-[var(--ink)] font-medium"}>
                              {dept.name}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                className="navlink"
                href={link.href}
                aria-current={isCurrentRoute(link.matchPrefix)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            {user ? (
              <div className="session-menu-wrap" ref={menuRef}>
                <button
                  type="button"
                  className="portal-login-btn session-trigger"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                >
                  <span className="session-avatar" aria-hidden="true">
                    {userInitials}
                  </span>
                  <span className="session-name">{user.name.split(" ")[0]}</span>
                </button>

                {userMenuOpen ? (
                  <div className="session-dropdown" role="menu">
                    <div className="session-dropdown-head">
                      <p className="caps session-kicker">Signed in member</p>
                      <p className="session-user-name">{user.name}</p>
                      <p className="session-user-email">{user.email}</p>
                    </div>
                    <div className="session-dropdown-links">
                      <Link
                        href="/login"
                        role="menuitem"
                        className="session-dropdown-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Account &amp; Session
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className="session-dropdown-item session-signout"
                        onClick={handleSignOut}
                        disabled={signingOut}
                      >
                        {signingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link href="/login" className="portal-login-btn max-lg:hidden">
                <span>Portal Login</span>
                <ArrowRight size={15} stroke={2.2} />
              </Link>
            )}

            <button
              type="button"
              className="menu-btn"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <Menu open={open} />
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <nav id="mobile-nav" className="mobile-nav" data-open={open} aria-label="Mobile">
        <div className="mobile-nav-inner">
          <ul className="mobile-nav-links">
            <li>
              <Link
                className="serif"
                href="/"
                aria-current={isCurrentRoute("/")}
                style={isCurrentRoute("/") ? { color: "var(--gold)" } : undefined}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
              >
                <span>Home</span>
              </Link>
            </li>

            {/* Mobile Departments Expandable Group */}
            <li>
              <div className="flex flex-col">
                <button
                  type="button"
                  className="mobile-nav-link-btn serif flex items-center justify-between w-full bg-transparent border-0 border-b border-[rgba(255,255,255,0.08)] text-left cursor-pointer transition-colors"
                  style={isDeptActive ? { color: "var(--gold)" } : undefined}
                  onClick={() => setMobileDeptsOpen((prev) => !prev)}
                  tabIndex={open ? 0 : -1}
                >
                  <span>Departments</span>
                </button>

                {mobileDeptsOpen && (
                  <div className="py-2 pl-3 flex flex-col gap-1 border-b border-[rgba(255,255,255,0.08)] bg-black/10 rounded-lg my-1">
                    {departmentItems.map((dept) => {
                      const isActive = pathname === `/departments/${dept.slug}`;
                      const Icon = dept.icon;
                      return (
                        <Link
                          key={dept.slug}
                          href={`/departments/${dept.slug}`}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors no-underline ${
                            isActive
                              ? "bg-white/10 text-[var(--gold)] font-medium"
                              : "text-[var(--mint-2)] hover:text-white hover:bg-white/5"
                          }`}
                          tabIndex={open ? 0 : -1}
                          onClick={() => setOpen(false)}
                        >
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                              isActive
                                ? "bg-[var(--gold)] text-[var(--forest)]"
                                : "bg-white/10 text-[var(--mint)]"
                            }`}
                          >
                            <Icon size={13} />
                          </div>
                          <span className="text-sm font-sans tracking-normal">{dept.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </li>

            {navLinks.slice(1).map((link) => {
              const active = isCurrentRoute(link.matchPrefix);
              return (
                <li key={link.href}>
                  <Link
                    className="serif"
                    href={link.href}
                    aria-current={active}
                    style={active ? { color: "var(--gold)" } : undefined}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}

            {user ? (
              <li>
                <Link
                  className="serif"
                  href="/login"
                  aria-current={isCurrentRoute("/login")}
                  style={isCurrentRoute("/login") ? { color: "var(--gold)" } : undefined}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                >
                  <span>Account ({user.name.split(" ")[0]})</span>
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  className="serif"
                  href="/login"
                  aria-current={isCurrentRoute("/login")}
                  style={isCurrentRoute("/login") ? { color: "var(--gold)" } : undefined}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                >
                  <span>Portal Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
