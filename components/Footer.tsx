import Image from "next/image";
import Link from "next/link";
import nacosLogoImg from "@/assets/images/nacos-logo.png";
import uniuyoLogo from "@/assets/images/uniuyo-circle.png";
import { site } from "@/lib/site";

const computingDepartments = [
  { slug: "computer-science", name: "Computer Science" },
  { slug: "cybersecurity", name: "Cybersecurity" },
  { slug: "information-systems", name: "Information Systems" },
  { slug: "data-analytics", name: "Data Analytics" },
  { slug: "software-engineering", name: "Software Engineering" },
] as const;

export function Footer() {
  return (
    <footer className="bg-[var(--deep)] text-[var(--mint)] pt-[90px] pb-10">
      <div className="wrap flex flex-col gap-[70px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10">
          <div className="lg:col-span-5 flex flex-col gap-4.5">
            <div className="flex items-center -space-x-3" aria-label="NACOS UNIUYO and University of Uyo affiliation">
              <Image
                src={uniuyoLogo}
                alt="University of Uyo logo"
                width={60}
                height={60}
                className="size-15 rounded-full ring-2 ring-white/90 bg-white object-contain p-1"
              />
              <Image
                src={nacosLogoImg}
                alt="NACOS UNIUYO logo"
                width={60}
                height={60}
                className="size-15 rounded-full ring-2 ring-white/90 bg-white object-contain p-1"
              />
            </div>
            <p className="serif m-0 text-[clamp(34px,3.4vw,44px)] leading-[1.05] text-white">
              Building Capacity.
              <br />
              <span className="it gold">Fostering Innovation.</span>
            </p>
            <p className="m-0 text-sm leading-relaxed max-w-[420px] text-[var(--mint)]">
              {site.legalName}. University of Uyo, Akwa Ibom State, Nigeria.
            </p>
          </div>

          <nav className="lg:col-start-7 lg:col-span-2 flex flex-col gap-3.5 text-sm" aria-labelledby="f-departments">
            <h2 id="f-departments" className="caps text-[11px] text-white m-0">
              Departments
            </h2>
            {computingDepartments.map((dept) => (
              <Link key={dept.slug} href={`/departments/${dept.slug}`} className="text-[var(--mint)] hover:text-white no-underline transition-colors">
                {dept.name}
              </Link>
            ))}
          </nav>

          <nav className="lg:col-span-2 flex flex-col gap-3.5 text-sm" aria-labelledby="f-portal">
            <h2 id="f-portal" className="caps text-[11px] text-white m-0">
              Portal Hubs
            </h2>
            <Link href="/projects" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Project Showcase</Link>
            <Link href="/opportunities" className="text-[var(--mint)] hover:text-white no-underline transition-colors">SIWES &amp; Opportunities</Link>
            <Link href="/yearbook" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Digital Yearbook</Link>
            <Link href="/staff" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Staff Directory</Link>
            <Link href="/events" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Events &amp; Calendar</Link>
            <Link href="/executives" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Executive Council</Link>
          </nav>

          <nav className="lg:col-span-2 flex flex-col gap-3.5 text-sm" aria-labelledby="f-connect">
            <h2 id="f-connect" className="caps text-[11px] text-white m-0">
              Connect
            </h2>
            <Link href="/login" className="text-[var(--mint)] hover:text-white no-underline transition-colors">Portal Login</Link>
            <a href={site.social.uniuyo} target="_blank" rel="noopener noreferrer" className="text-[var(--mint)] hover:text-white no-underline transition-colors">
              University of Uyo
            </a>
            <a href={site.social.national} target="_blank" rel="noopener noreferrer" className="text-[var(--mint)] hover:text-white no-underline transition-colors">
              NACOS National
            </a>
            <a href={site.social.x} target="_blank" rel="noopener noreferrer" className="text-[var(--mint)] hover:text-white no-underline transition-colors">
              X / Twitter
            </a>
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6 pt-7 border-t border-white/10 text-[13px] text-[var(--mint)]">
          <span>
            © {new Date().getFullYear()} NACOS UNIUYO. All rights reserved.
          </span>
          <span>Built by NACOS UNIUYO</span>
        </div>
      </div>
    </footer>
  );
}
