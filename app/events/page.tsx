import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/EventParts";
import { ArrowRight, Calendar, Pin } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { events, formatEventDate, formatEventTime, googleCalendarUrl } from "@/lib/events";
import { breadcrumbSchema, eventSchema } from "@/lib/schema";
import { absoluteUrl, ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

const description =
  "Inaugurations, hackathons, trainings and socials from NACOS, University of Uyo Chapter. Dates, venues, calendar sync and full programmes.";

export const metadata: Metadata = {
  title: "Events & Programme Hub",
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

function buildTrpcGoogleCalendarUrl(ev: {
  slug: string;
  title: string;
  tagline: string | null;
  startDate: string;
  endDate: string;
  venueName: string;
}) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const pageUrl = absoluteUrl(`/events/${ev.slug}`);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${ev.title}, NACOS UNIUYO`,
    dates: `${stamp(ev.startDate)}/${stamp(ev.endDate)}`,
    details: `${ev.tagline ?? ev.title}\n\n${pageUrl}`,
    location: `${ev.venueName}, University of Uyo`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function EventsPage() {
  const caller = appRouter.createCaller({ session: null });
  const trpcEvents = await caller.event.list();
  const richSlugs = new Set(events.map((e) => e.slug));
  const additionalEvents = trpcEvents.filter((e) => !richSlugs.has(e.slug));

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
            {events.map((e) => {
              const pageUrl = absoluteUrl(`/events/${e.slug}`);
              return (
                <li key={e.slug} className="reveal">
                  <div className="event-row card">
                    <span className="event-date">
                      <span className="d serif">{day(e.start)}</span>
                      <span className="m caps">{monthYear(e.start)}</span>
                    </span>
                    <span className="copy">
                      <span className="meta caps">
                        {formatEventDate(e.start)} · {formatEventTime(e.start)} · {e.venue.name}, {e.venue.area}
                      </span>
                      <h2 className="serif" style={{ fontWeight: 400 }}>
                        <Link href={`/events/${e.slug}`} className="text-[var(--ink)] no-underline hover:text-[var(--green)]">
                          {e.title}
                        </Link>
                      </h2>
                      <p>{e.summary}</p>
                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <Link className="text-link" href={`/events/${e.slug}`}>
                          Programme and details <ArrowRight />
                        </Link>
                        <a
                          href={googleCalendarUrl(e, pageUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-line btn-sm"
                        >
                          <Calendar size={15} />
                          <span>Google Calendar</span>
                        </a>
                        <a href={`/events/${e.slug}/calendar.ics`} download className="btn btn-line btn-sm">
                          <span>Download .ics</span>
                        </a>
                      </div>
                    </span>
                    <Link href={`/events/${e.slug}`}>
                      <Image
                        src={e.flyer.src}
                        alt={e.flyer.alt}
                        width={e.flyer.width}
                        height={e.flyer.height}
                        sizes="(max-width: 1100px) 100vw, 420px"
                      />
                    </Link>
                  </div>
                </li>
              );
            })}

            {additionalEvents.map((ev) => (
              <li key={ev.slug} className="reveal">
                <div className="event-row card">
                  <span className="event-date">
                    <span className="d serif">{day(ev.startDate)}</span>
                    <span className="m caps">{monthYear(ev.startDate)}</span>
                  </span>
                  <span className="copy">
                    <span className="meta caps">
                      {formatEventDate(ev.startDate)} · {formatEventTime(ev.startDate)} · {ev.venueName}
                    </span>
                    <h2 className="serif" style={{ fontWeight: 400 }}>
                      <Link href={`/events/${ev.slug}`} className="text-[var(--ink)] no-underline hover:text-[var(--green)]">
                        {ev.title}
                      </Link>
                    </h2>
                    <p>{ev.tagline ?? "Official Faculty of Computing and NACOS UNIUYO programme."}</p>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Link className="text-link" href={`/events/${ev.slug}`}>
                        Programme and details <ArrowRight />
                      </Link>
                      <a
                        href={buildTrpcGoogleCalendarUrl(ev)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-line btn-sm"
                      >
                        <Calendar size={15} />
                        <span>Google Calendar</span>
                      </a>
                      <a href={`/events/${ev.slug}/calendar.ics`} download className="btn btn-line btn-sm">
                        <span>Download .ics</span>
                      </a>
                    </div>
                  </span>
                  {ev.flyerUrl ? (
                    <Link href={`/events/${ev.slug}`}>
                      <Image
                        src={ev.flyerUrl}
                        alt={ev.title}
                        width={640}
                        height={420}
                        sizes="(max-width: 1100px) 100vw, 420px"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`/events/${ev.slug}`}
                      className="flex min-h-[220px] flex-col justify-between rounded-2xl bg-[var(--forest)] p-6 text-white no-underline"
                    >
                      <span className="caps text-[10px] text-[var(--gold)]">Faculty Programme</span>
                      <span className="serif text-3xl text-white">{ev.title}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--mint-2)]">
                        <Pin size={14} />
                        <span>{ev.venueName} · University of Uyo</span>
                      </span>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="lead" style={{ fontSize: 15 }}>
            Sync any event directly to Google Calendar or download the universal <code>.ics</code> file for Apple and
            Outlook calendars.
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
