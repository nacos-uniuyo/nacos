import type { Metadata } from "next";
import { ogDefaults, brandImage } from "@/lib/site";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/EventParts";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { events, formatEventTime } from "@/lib/events";
import { breadcrumbSchema, eventSchema } from "@/lib/schema";

const description =
  "Inaugurations, hackathons, trainings and socials from NACOS, University of Uyo Chapter. Dates, venues and full programmes.";

export const metadata: Metadata = {
  title: "Events",
  description,
  alternates: { canonical: "/events" },
  openGraph: { ...ogDefaults, title: "Events | NACOS UNIUYO", description, url: "/events" },
  twitter: { card: "summary_large_image", images: [brandImage.url], title: "Events | NACOS UNIUYO", description },
};

const day = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "2-digit" }).format(new Date(iso));
const monthYear = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

export default function EventsPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="events-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ EVENTS }" className="hero-orbits fade" />
        <div className="wrap">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Events" }]} />
          <h1 id="events-title" className="serif">
            <span className="line">
              <span className="rise d1">What&rsquo;s on at</span>
            </span>
            <span className="line">
              <span className="rise d2 it gold">NACOS UNIUYO</span>
            </span>
          </h1>
          <p className="fade d3">{description}</p>
        </div>
      </section>

      <section className="glance" aria-label="Event list">
        <div className="wrap">
          <ul className="event-list">
            {events.map((e) => (
              <li key={e.slug} className="reveal">
                <Link className="event-row card" href={`/events/${e.slug}`}>
                  <span className="event-date">
                    <span className="d serif">{day(e.start)}</span>
                    <span className="m caps">{monthYear(e.start)}</span>
                  </span>
                  <span className="copy">
                    <span className="meta caps">
                      {formatEventTime(e.start)} · {e.venue.name}, {e.venue.area}
                    </span>
                    <h2 className="serif" style={{ fontWeight: 400 }}>
                      {e.title}
                    </h2>
                    <p>{e.summary}</p>
                    <span className="text-link">
                      Programme and details <ArrowRight />
                    </span>
                  </span>
                  <Image
                    src={e.flyer.src}
                    alt={e.flyer.alt}
                    width={e.flyer.width}
                    height={e.flyer.height}
                    sizes="(max-width: 1100px) 100vw, 420px"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <p className="lead" style={{ fontSize: 15 }}>
            More events will be listed here as the session gets going.
          </p>
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
          ]),
          ...events.map(eventSchema),
        ]}
      />
    </>
  );
}
