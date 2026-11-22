import Image from "next/image";
import Link from "next/link";
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
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo-pair" aria-label="NACOS UNIUYO and University of Uyo affiliation">
              <Image
                src={uniuyoLogo}
                alt="University of Uyo logo"
                width={60}
                height={60}
                className="footer-logo-base footer-logo-uniuyo"
              />
              <Image
                src="/images/nacos-logo.png"
                alt="NACOS UNIUYO logo"
                width={60}
                height={60}
                className="footer-logo-base footer-logo-nacos"
              />
            </div>
            <p className="serif motto">
              Building Capacity.
              <br />
              <span className="it gold">Fostering Innovation.</span>
            </p>
            <p>
              {site.legalName}. University of Uyo, Akwa Ibom State, Nigeria.
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
            <Link href="/staff">Staff Directory</Link>
            <Link href="/events">Events &amp; Calendar</Link>
            <Link href="/blog">Faculty Newsroom</Link>
            <Link href="/executives">Executive Council</Link>
          </nav>

          <nav className="footer-col" aria-labelledby="f-connect">
            <h2 id="f-connect" className="caps">
              Connect
            </h2>
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
            © {new Date().getFullYear()} NACOS UNIUYO. All rights reserved.
          </span>
          <span>Built by NACOS UNIUYO</span>
        </div>
      </div>
    </footer>
  );
}
