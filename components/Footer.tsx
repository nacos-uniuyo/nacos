import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { GithubIcon, UniuyoCrest } from "./icons";

const computingDepartments = [
  { slug: "computer-science", name: "Computer Science", code: "CSC" },
  { slug: "cybersecurity", name: "Cybersecurity", code: "CYB" },
  { slug: "information-systems", name: "Information Systems", code: "INS" },
  { slug: "data-analytics", name: "Data Analytics", code: "DAN" },
  { slug: "software-engineering", name: "Software Engineering", code: "SWE" },
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-cobrand-lockup">
              <div className="footer-insignia-pair">
                <UniuyoCrest size={56} className="footer-uniuyo-crest" />
                <span className="footer-insignia-divider" aria-hidden="true" />
                <Image
                  src="/images/nacos-logo.png"
                  alt="NACOS UNIUYO logo"
                  width={56}
                  height={56}
                  className="footer-nacos-logo"
                />
              </div>
              <div className="footer-cobrand-label">
                <span className="caps text-[11px] tracking-[0.16em] text-[var(--gold)]">
                  {site.coBrandLabel}
                </span>
                <span className="text-xs text-[var(--mint-2)]">
                  Faculty of Computing · Permanent Site, Uyo
                </span>
              </div>
            </div>

            <p className="serif motto">
              Building Capacity.
              <br />
              <span className="it gold">Fostering Innovation.</span>
            </p>
            <p>
              {site.legalName}. Official academic, innovation, and student portal for the Faculty of Computing,
              University of Uyo, Akwa Ibom State, Nigeria.
            </p>
          </div>

          <nav className="footer-col" aria-labelledby="f-departments">
            <h2 id="f-departments" className="caps">
              Departments
            </h2>
            {computingDepartments.map((dept) => (
              <Link key={dept.slug} href={`/departments/${dept.slug}`}>
                {dept.name}
              </Link>
            ))}
          </nav>

          <nav className="footer-col" aria-labelledby="f-portal">
            <h2 id="f-portal" className="caps">
              Portal Hubs
            </h2>
            <Link href="/projects">Project Showcase</Link>
            <Link href="/opportunities">SIWES &amp; Opportunities</Link>
            <Link href="/yearbook">Digital Yearbook</Link>
            <Link href="/events">Events &amp; Calendar</Link>
            <Link href="/blog">Faculty Newsroom</Link>
            <Link href="/executives">Executive Council</Link>
          </nav>

          <nav className="footer-col" aria-labelledby="f-connect">
            <h2 id="f-connect" className="caps">
              Connect &amp; Source
            </h2>
            <a
              href={site.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <GithubIcon size={15} />
              <span>GitHub Repository</span>
            </a>
            <Link href="/login">Portal Login</Link>
            <a href={site.social.uniuyo} target="_blank" rel="noopener noreferrer">
              University of Uyo
            </a>
            <a href={site.social.national} target="_blank" rel="noopener noreferrer">
              NACOS National
            </a>
            <a href={site.social.x} target="_blank" rel="noopener noreferrer">
              X / Twitter
            </a>
          </nav>
        </div>

        <div className="footer-base">
          <span>
            © {new Date().getFullYear()} University of Uyo &amp; NACOS UNIUYO Chapter. All rights reserved.
          </span>
          <span className="flex flex-wrap items-center gap-4">
            <span>Built by the NACOS UNIUYO Software Directorate</span>
            <a
              href={site.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--gold)] no-underline hover:underline"
            >
              <GithubIcon size={14} />
              <span>Open Source on GitHub</span>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
