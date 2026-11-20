"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { site } from "@/lib/site";
import { ArrowRight, Menu, UniuyoCrest } from "./icons";

const navLinks = [
  { href: "/", label: "Home", matchPrefix: "/" },
  { href: "/departments/computer-science", label: "Departments", matchPrefix: "/departments" },
  { href: "/projects", label: "Projects", matchPrefix: "/projects" },
  { href: "/opportunities", label: "Opportunities", matchPrefix: "/opportunities" },
  { href: "/yearbook", label: "Yearbook", matchPrefix: "/yearbook" },
  { href: "/events", label: "Events", matchPrefix: "/events" },
  { href: "/blog", label: "Blog", matchPrefix: "/blog" },
] as const;

const departmentQuickLinks = [
  { slug: "computer-science", shortName: "CSC", name: "Computer Science" },
  { slug: "cybersecurity", shortName: "CYB", name: "Cybersecurity" },
  { slug: "information-systems", shortName: "INS", name: "Information Systems" },
  { slug: "data-analytics", shortName: "DAN", name: "Data Analytics" },
  { slug: "software-engineering", shortName: "SWE", name: "Software Engineering" },
] as const;

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user;

  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open && !userMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, userMenuOpen]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen]);

  const isCurrentRoute = (matchPrefix: string) => {
    if (matchPrefix === "/") {
      return pathname === "/" ? "page" : undefined;
    }
    if (matchPrefix === "/yearbook" && pathname.startsWith("/alumni")) {
      return "page";
    }
    return pathname === matchPrefix || pathname.startsWith(`${matchPrefix}/`) ? "page" : undefined;
  };

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
      <div className="cobrand-shell">
        {/* Left Angled Tab (White Surface) */}
        <div className="cobrand-tab">
          <Link
            href="/"
            className="cobrand-link"
            aria-label="University of Uyo & NACOS UNIUYO Chapter Home"
          >
            <div className="cobrand-insignia" aria-hidden="true">
              <UniuyoCrest size={42} className="uniuyo-crest" />
              <span className="insignia-divider" />
              <Image
                src="/images/nacos-logo.png"
                alt=""
                width={42}
                height={42}
                priority
                className="nacos-crest"
              />
            </div>
            <div className="cobrand-copy">
              <span className="caps cobrand-title">{site.coBrandLabel}</span>
              <span className="cobrand-subtitle">Faculty of Computing · Official Portal</span>
            </div>
          </Link>
        </div>

        {/* Right Navigation Bar (Deep Emerald Green Surface) */}
        <div className="cobrand-nav-bar">
          <nav aria-label="Main" className="main-nav">
            {navLinks.map((link) => (
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
              <Link href="/login" className="portal-login-btn">
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
            {navLinks.map((link) => {
              const active = isCurrentRoute(link.matchPrefix);
              return (
                <li key={link.href}>
                  <Link
                    className="serif"
                    href={link.href}
                    aria-current={active}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                  >
                    <span>{link.label}</span>
                    {active ? <span className="caps mobile-active-pill">Current</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mobile-dept-strip">
            <p className="caps mobile-dept-label">5 Computing Departments</p>
            <div className="mobile-dept-pills">
              {departmentQuickLinks.map((dept) => (
                <Link
                  key={dept.slug}
                  href={`/departments/${dept.slug}`}
                  tabIndex={open ? 0 : -1}
                  className="mobile-dept-pill"
                  onClick={() => setOpen(false)}
                >
                  <span className="caps">{dept.shortName}</span>
                  <span>{dept.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mobile-auth-row">
            {user ? (
              <div className="mobile-session-box">
                <div>
                  <p className="caps text-[10px] text-[var(--gold)]">Signed in as</p>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-[var(--mint)]">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    tabIndex={open ? 0 : -1}
                    className="portal-login-btn"
                    onClick={() => setOpen(false)}
                  >
                    Account
                  </Link>
                  <button
                    type="button"
                    tabIndex={open ? 0 : -1}
                    className="portal-login-btn"
                    onClick={handleSignOut}
                    disabled={signingOut}
                  >
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                tabIndex={open ? 0 : -1}
                className="portal-login-btn mobile-login-cta"
                onClick={() => setOpen(false)}
              >
                <span>Portal Login</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
