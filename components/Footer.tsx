import Image from "next/image";
import Link from "next/link";
import { featuredEvent } from "@/lib/events";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Image src="/images/nacos-logo.png" alt="NACOS logo" width={88} height={88} />
            <p className="serif motto">
              Building Capacity.
              <br />
              <span className="it gold">Fostering Innovation.</span>
            </p>
            <p>
              {site.legalName}. Faculty of Computing, University of Uyo, Uyo, Akwa Ibom State.
            </p>
          </div>

          <nav className="footer-col" aria-labelledby="f-explore">
            <h2 id="f-explore" className="caps">
              Explore
            </h2>
            <Link href="/#about">About</Link>
            <Link href="/#priorities">Priorities</Link>
            <Link href="/executives">Executives</Link>
            <Link href="/events">Events</Link>
          </nav>

          <nav className="footer-col" aria-labelledby="f-members">
            <h2 id="f-members" className="caps">
              Members
            </h2>
            <Link href="/#portal">Portal</Link>
            <Link href="/#open-track">Open-Track</Link>
            <Link href={`/events/${featuredEvent.slug}`}>Inauguration</Link>
            <Link href={`/events/${featuredEvent.slug}/programme`}>Programme</Link>
          </nav>

          <nav className="footer-col" aria-labelledby="f-connect">
            <h2 id="f-connect" className="caps">
              Connect
            </h2>
            <a href={site.social.x} target="_blank" rel="noopener noreferrer">
              X / Twitter
            </a>
            <a href={site.social.national} target="_blank" rel="noopener noreferrer">
              NACOS National
            </a>
          </nav>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} NACOS UNIUYO. All rights reserved.</span>
          <span>Built by the NACOS UNIUYO Software Directorate</span>
        </div>
      </div>
    </footer>
  );
}
