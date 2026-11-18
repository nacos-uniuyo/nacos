"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "./icons";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#priorities", label: "Priorities" },
  { href: "/executives", label: "Executives" },
  { href: "/events", label: "Events" },
  { href: "/#news", label: "News" },
  { href: "/login", label: "Sign in" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const current = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`)) ? "page" : undefined;

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

        <nav aria-label="Main" className="main-nav">
          {links.map((l) => (
            <Link key={l.href} className="navlink" href={l.href} aria-current={current(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <Menu open={open} />
        </button>
      </div>

      <nav id="mobile-nav" className="mobile-nav" data-open={open} aria-label="Mobile">
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <Link className="serif" href={l.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
