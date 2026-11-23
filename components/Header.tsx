"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";
import nacosLogoImg from "@/assets/images/nacos-logo.png";
import {
  ChevronDown,
  Code2,
  Cpu,
  Database,
  Network,
  ShieldAlert,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Menu } from "./icons";

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
                  className="inline-flex items-center justify-center gap-2 min-h-10 px-4.5 rounded-full border-[1.5px] border-[var(--gold)] bg-[rgba(216,180,92,0.08)] text-white text-[13.5px] font-semibold no-underline cursor-pointer whitespace-nowrap transition-all hover:bg-[var(--gold)] hover:text-[var(--forest)] hover:-translate-y-0.5"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                >
                  <span className="size-6 rounded-full bg-[var(--gold)] text-[var(--forest)] text-[11px] font-bold inline-flex items-center justify-center" aria-hidden="true">
                    {userInitials}
                  </span>
                  <span>{user.name.split(" ")[0]}</span>
                </button>

                {userMenuOpen ? (
                  <div className="absolute right-0 top-[calc(100%+10px)] w-[250px] bg-white text-[var(--ink)] rounded-2xl border border-[var(--rule)] shadow-[0_24px_48px_rgba(6,42,20,0.24)] overflow-hidden z-60" role="menu">
                    <div className="p-4 bg-[var(--paper)] border-b border-[var(--rule)]">
                      <p className="caps m-0 text-[10px] text-[var(--green)]">Signed in member</p>
                      <p className="m-0 mt-1 text-sm font-semibold text-[var(--ink)]">{user.name}</p>
                      <p className="m-0 mt-0.5 text-xs text-[var(--muted)] break-all">{user.email}</p>
                    </div>
                    <div className="flex flex-col p-1.5">
                      <Link
                        href="/login"
                        role="menuitem"
                        className="flex items-center w-full p-2.5 rounded-lg bg-transparent text-[13px] font-semibold text-[var(--ink)] hover:bg-[var(--sand)] no-underline transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Account &amp; Session
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex items-center w-full p-2.5 rounded-lg bg-transparent border-0 text-[13px] font-semibold text-destructive hover:bg-destructive/10 cursor-pointer text-left transition-colors"
                        onClick={handleSignOut}
                      >
                        Sign Out
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
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left py-2 text-base font-semibold text-destructive bg-transparent border-0 cursor-pointer"
                >
                  Sign Out ({user.name.split(" ")[0]})
                </button>
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
