import type { Metadata } from "next";
import { ogDefaults } from "@/lib/site";
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
  twitter: { card: "summary_large_image", title: "Events | NACOS UNIUYO", description },
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
      <section className="relative bg-[var(--forest)] text-white overflow-hidden min-h-[min(780px,calc(100svh-80px))] flex items-center py-[clamp(64px,8vw,100px)]" aria-labelledby="events-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ EVENTS }" className="hero-orbits fade" />
        <div className="wrap relative flex flex-col gap-6 w-full">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Events" }]} />
          <h1 id="events-title" className="serif m-0 text-[clamp(52px,8vw,112px)] leading-[0.95] tracking-[-0.02em]">
            <span className="line">
              <span className="rise d1">What&rsquo;s on at</span>
            </span>
            <span className="line">
              <span className="rise d2 it gold">NACOS UNIUYO</span>
            </span>
          </h1>
          <p className="fade d3 m-0 max-w-[620px] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-[var(--mint-2)]">{description}</p>
        </div>
      </section>

      <section className="py-[var(--section-y)]" aria-label="Event list">
        <div className="wrap flex flex-col gap-14">
          <ul className="list-none m-0 p-0 flex flex-col gap-5">
            {events.map((e) => (
              <li key={e.slug} className="reveal">
                <Link
                  className="group grid grid-cols-1 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,420px)] gap-6 md:gap-10 items-center bg-white rounded-[22px] p-7 text-[var(--ink)] no-underline transition-all duration-450 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_rgba(6,42,20,0.14)]"
                  href={`/events/${e.slug}`}
                >
                  <span className="flex flex-row md:flex-col items-baseline md:items-start gap-3 md:gap-1.5 pl-1 md:pl-3">
                    <span className="d serif text-[64px] md:text-[88px] leading-[0.85] text-[var(--green)]">{day(e.start)}</span>
                    <span className="m caps text-xs text-[var(--muted)]">{monthYear(e.start)}</span>
                  </span>
                  <span className="flex flex-col gap-3">
                    <span className="caps text-[11px] text-[var(--green)]">
                      {formatEventTime(e.start)} · {e.venue.name}, {e.venue.area}
                    </span>
                    <h2 className="serif m-0 font-normal text-[clamp(30px,3.4vw,44px)] leading-[1.05] text-[var(--ink)]">
                      {e.title}
                    </h2>
                    <p className="m-0 text-[var(--muted)] leading-relaxed">{e.summary}</p>
                    <span className="text-link">
                      Programme and details <ArrowRight />
                    </span>
                  </span>
                  <Image
                    src={e.flyer.src}
                    alt={e.flyer.alt}
                    width={e.flyer.width}
                    height={e.flyer.height}
                    className="w-full h-auto rounded-[14px]"
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
