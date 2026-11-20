import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { Breadcrumbs, EventSubnav, Timeline } from "@/components/EventParts";
import { ExecCard } from "@/components/ExecCard";
import { ArrowRight, Calendar, Clock, Pin } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { CornerOrbit } from "@/components/Orbits";
import { RichTextRenderer } from "@/components/RichTextRenderer";
import {
  directionsUrl,
  events,
  formatCoords,
  formatEventDate,
  formatEventTime,
  getEvent,
  googleCalendarUrl,
  startOf,
} from "@/lib/events";
import { executives } from "@/lib/executives";
import { breadcrumbSchema, eventSchema } from "@/lib/schema";
import { absoluteUrl, ogDefaults } from "@/lib/site";
import { appRouter } from "@/server/routers";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const trpcEvents = await caller.event.list();
  const slugs = new Set([...events.map((e) => e.slug), ...trpcEvents.map((e) => e.slug)]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = getEvent(slug);
  if (e) {
    const title = `${e.title}, ${formatEventDate(e.start)}`;
    const description = `${e.summary} ${formatEventTime(e.start)} at ${e.venue.name}, ${e.venue.institution} ${e.venue.area}.`;
    return {
      title,
      description,
      keywords: [
        "NACOS UNIUYO inauguration",
        "4th Executive Council",
        "The Revolution NACOS",
        "Banny Confidence Jack",
        "University of Uyo",
        "5 Arms Permanent Site",
      ],
      alternates: { canonical: `/events/${e.slug}` },
      openGraph: { ...ogDefaults, title, description, url: `/events/${e.slug}` },
      twitter: { card: "summary_large_image", title, description },
    };
  }

  const caller = appRouter.createCaller({ session: null });
  const trpcEvent = await caller.event.bySlug({ slug });
  if (!trpcEvent) return {};

  const title = `${trpcEvent.title}, ${formatEventDate(trpcEvent.startDate)}`;
  const description = `${trpcEvent.tagline ?? trpcEvent.title} at ${trpcEvent.venueName}, University of Uyo.`;
  return {
    title,
    description,
    alternates: { canonical: `/events/${trpcEvent.slug}` },
    openGraph: { ...ogDefaults, title, description, url: `/events/${trpcEvent.slug}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const e = getEvent(slug);

  if (e) {
    const url = absoluteUrl(`/events/${e.slug}`);
    const highlights = e.programme.filter((p) => /Processional|Oath|Inaugural Address|Vision/.test(p.title));

    return (
      <>
        <section className="event-hero" aria-labelledby="event-title">
          <div className="grid-bg drift" aria-hidden="true" />
          <div className="wrap">
            <div className="copy">
              <Breadcrumbs
                items={[{ name: "Home", path: "/" }, { name: "Events", path: "/events" }, { name: "Inauguration" }]}
              />
              <span className="eyebrow on-dark caps fade d1">{e.kicker}</span>
              <h1 id="event-title" className="serif">
                <span className="line">
                  <span className="rise d1">Inauguration</span>
                </span>
                <span className="line">
                  <span className="rise d2 it gold">Ceremony</span>
                </span>
                <span className="sr-only"> of the 4th Executive Council, NACOS UNIUYO</span>
              </h1>
              <p className="intro fade d3">
                {e.summary} {e.description}
              </p>
              <ul className="facts fade d3">
                <li>
                  <Calendar />
                  <time dateTime={e.start}>{formatEventDate(e.start)}</time>
                </li>
                <li>
                  <Clock />
                  {formatEventTime(e.start)} prompt
                </li>
                <li>
                  <Pin />
                  {e.venue.name}, {e.venue.institution} {e.venue.area}
                </li>
              </ul>
              <div className="fade d4">
                <Countdown start={e.start} end={e.end} />
              </div>
              <div className="cta-row fade d5">
                <Link className="btn btn-solid" href={`/events/${e.slug}/programme`}>
                  See the programme
                  <ArrowRight />
                </Link>
                <a className="btn btn-ghost" href={googleCalendarUrl(e, url)} target="_blank" rel="noopener noreferrer">
                  Add to Google Calendar
                </a>
                <a className="btn btn-ghost" href={`/events/${e.slug}/calendar.ics`} download>
                  Download .ics
                </a>
              </div>
            </div>

            <figure className="flyer fade d3">
              <a href={e.flyer.src} target="_blank" rel="noopener">
                <Image
                  src={e.flyer.src}
                  alt={e.flyer.alt}
                  width={e.flyer.width}
                  height={e.flyer.height}
                  priority
                  sizes="(max-width: 960px) 92vw, 560px"
                />
              </a>
              <figcaption>Official flyer · tap to open full size</figcaption>
            </figure>
          </div>
        </section>

        <EventSubnav e={e} active="overview" />

        <section className="glance" aria-labelledby="glance-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow caps">At a glance</span>
                <h2 id="glance-title" className="h2 serif reveal-x">
                  The Occasion
                </h2>
              </div>
              <p className="lead" style={{ maxWidth: 440 }}>
                Students, lecturers, alumni and friends of the chapter are all welcome. Entry is free.
              </p>
            </div>
            <dl className="glance-grid">
              <div className="reveal">
                <dt>October 2026, Friday</dt>
                <dd className="serif">09</dd>
              </div>
              <div className="reveal">
                <dt>Noon, West Africa Time. We start on time.</dt>
                <dd className="serif">
                  12:00<small>PM</small>
                </dd>
              </div>
              <div className="reveal">
                <dt>Officers taking the oath of office</dt>
                <dd className="serif">{executives.length}</dd>
              </div>
              <div className="reveal">
                <dt>Executive council in the chapter&rsquo;s history</dt>
                <dd className="serif">
                  4<small>th</small>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section id="council" className="execs" aria-labelledby="council-title">
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="eyebrow caps">The incoming council</span>
                <h2 id="council-title" className="h2 serif reveal-x">
                  Faces of <span className="it accent">The Revolution</span>
                </h2>
              </div>
              <p className="lead" style={{ maxWidth: 440 }}>
                Twelve officers, each with a portfolio, all answerable to the students who elected them.
              </p>
            </div>
            <ul className="exec-grid">
              {executives.map((x, i) => (
                <li key={x.slug} className="reveal">
                  <ExecCard exec={x} index={i} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="programme dark" aria-labelledby="prog-title">
          <div className="wrap">
            <div className="aside">
              <span className="eyebrow on-dark caps">Order of events</span>
              <h2 id="prog-title" className="h2 serif">
                The big <span className="it gold">moments</span>
              </h2>
              <p style={{ margin: 0, color: "var(--mint-2)", lineHeight: 1.6, fontSize: 17 }}>
                Guests arrive from 12:00 PM. The processional of the new executives follows at{" "}
                {startOf(e, /Processional/)}.
              </p>
              <div>
                <Link className="btn btn-solid" href={`/events/${e.slug}/programme`}>
                  Full programme
                  <ArrowRight />
                </Link>
              </div>
            </div>
            <Timeline items={highlights} />
          </div>
        </section>

        <section id="venue" className="venue" aria-labelledby="venue-title">
          <div className="wrap">
            <div className="venue-card reveal">
              <div className="copy">
                <span className="eyebrow caps accent">Venue</span>
                <h2 id="venue-title" className="serif">
                  {e.venue.name}
                </h2>
                <address>
                  {e.venue.institution} {e.venue.area}
                  <br />
                  {e.venue.locality}, {e.venue.region} State
                  <br />
                  <a className="pin-link" href={e.venue.mapLink} target="_blank" rel="noopener noreferrer">
                    Exact pin: {formatCoords(e.venue.geo)}
                  </a>
                </address>
                <ul className="notes">
                  <li>Arrival and registration open at {formatEventTime(e.start)}.</li>
                  <li>The processional begins at {startOf(e, /Processional/)}.</li>
                  <li>Refreshments and networking follow the official group photograph.</li>
                </ul>
                <div className="cta-row">
                  <a className="btn btn-dark" href={directionsUrl(e)} target="_blank" rel="noopener noreferrer">
                    <Pin />
                    Get directions
                  </a>
                  <a className="btn btn-line" href={`/events/${e.slug}/calendar.ics`} download>
                    <Calendar />
                    Download .ics
                  </a>
                </div>
              </div>
              <div className="venue-art" aria-hidden="true">
                <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" fill="none">
                  <defs>
                    <pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse">
                      <path d="M32 0H0V32" stroke="rgba(0,148,36,.18)" />
                    </pattern>
                  </defs>
                  <rect width="400" height="400" fill="url(#g)" />
                  <g stroke="rgba(255,255,255,.22)" strokeWidth="14" strokeLinecap="round">
                    <path d="M200 200 200 -20" />
                    <path d="M200 200 420 130" />
                    <path d="M200 200 340 420" />
                    <path d="M200 200 60 420" />
                    <path d="M200 200 -20 130" />
                  </g>
                  <g stroke="rgba(216,180,92,.5)" strokeWidth="1.5" strokeDasharray="6 8">
                    <path d="M200 200 200 -20" />
                    <path d="M200 200 420 130" />
                    <path d="M200 200 340 420" />
                    <path d="M200 200 60 420" />
                    <path d="M200 200 -20 130" />
                  </g>
                  <circle cx="200" cy="200" r="46" fill="#062A14" stroke="rgba(216,180,92,.6)" />
                  <circle cx="200" cy="200" r="74" stroke="rgba(255,255,255,.12)" strokeDasharray="3 7" />
                  <circle cx="200" cy="200" r="8" fill="#D8B45C" />
                  <text
                    x="200"
                    y="292"
                    textAnchor="middle"
                    fill="rgba(255,255,255,.55)"
                    fontSize="12"
                    letterSpacing="3"
                    fontFamily="var(--font-instrument-sans), sans-serif"
                  >
                    5 ARMS · UNIUYO
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-band" aria-labelledby="cta-title">
          <div className="wrap">
            <div className="inner reveal">
              <CornerOrbit />
              <h2 id="cta-title" className="serif">
                Come witness the start of <span className="it gold">The Revolution.</span>
              </h2>
              <p>
                {formatEventDate(e.start)}, {formatEventTime(e.start)} at {e.venue.name}. Bring a friend from your
                department.
              </p>
              <div className="cta-row">
                <a className="btn btn-solid" href={googleCalendarUrl(e, url)} target="_blank" rel="noopener noreferrer">
                  Save the date
                </a>
                <Link className="btn btn-ghost" href="/executives">
                  Meet the executives
                </Link>
              </div>
              <div className="hashtags caps">
                {e.hashtags.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <JsonLd
          data={[
            eventSchema(e),
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Events", path: "/events" },
              { name: e.shortTitle, path: `/events/${e.slug}` },
            ]),
          ]}
        />
      </>
    );
  }

  // Fallback for dynamic tRPC events (e.g., faculty-hackathon-2027)
  const caller = appRouter.createCaller({ session: null });
  const trpcEvent = await caller.event.bySlug({ slug });
  if (!trpcEvent) notFound();

  const pageUrl = absoluteUrl(`/events/${trpcEvent.slug}`);
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const gcalUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: "TEMPLATE",
    text: `${trpcEvent.title}, NACOS UNIUYO`,
    dates: `${stamp(trpcEvent.startDate)}/${stamp(trpcEvent.endDate)}`,
    details: `${trpcEvent.tagline ?? trpcEvent.title}\n\n${pageUrl}`,
    location: `${trpcEvent.venueName}, University of Uyo`,
  }).toString()}`;

  const defaultAgenda = [
    { time: "08:00", title: "Team Check-in, Hardware Inspection & Problem Statement Briefing" },
    { time: "10:00", title: "Opening Ceremony & Keynote by the Dean, Faculty of Computing" },
    { time: "12:00", title: "Hacking Begins Across All Five Departmental Tracks" },
    { time: "16:00", title: "Technical Mentorship & Architecture Reviews with Alumni & Staff" },
    { time: "18:00", title: "Final Prototype Demos, Jury Evaluation & Prize Presentation" },
  ];

  const eventDescriptionDoc = `${trpcEvent.tagline ?? trpcEvent.title}\n\nHosted at ${trpcEvent.venueName}, University of Uyo. Open to interdisciplinary and departmental teams across Computer Science, Cybersecurity, Information Systems, Data Analytics, and Software Engineering.`;

  return (
    <>
      <section className="event-hero" aria-labelledby="trpc-event-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <div className="wrap">
          <div className="copy">
            <Breadcrumbs
              items={[{ name: "Home", path: "/" }, { name: "Events", path: "/events" }, { name: trpcEvent.title }]}
            />
            <span className="eyebrow on-dark caps fade d1">Faculty of Computing Programme · NACOS UNIUYO</span>
            <h1 id="trpc-event-title" className="serif">
              {trpcEvent.title}
            </h1>
            {trpcEvent.tagline ? <p className="intro fade d3">{trpcEvent.tagline}</p> : null}
            <ul className="facts fade d3">
              <li>
                <Calendar />
                <time dateTime={trpcEvent.startDate}>{formatEventDate(trpcEvent.startDate)}</time>
              </li>
              <li>
                <Clock />
                {formatEventTime(trpcEvent.startDate)} – {formatEventTime(trpcEvent.endDate)}
              </li>
              <li>
                <Pin />
                {trpcEvent.venueName}, University of Uyo
              </li>
            </ul>
            <div className="fade d4">
              <Countdown start={trpcEvent.startDate} end={trpcEvent.endDate} />
            </div>
            <div className="cta-row fade d5">
              <a className="btn btn-solid" href={gcalUrl} target="_blank" rel="noopener noreferrer">
                <Calendar size={16} />
                <span>Add to Google Calendar</span>
              </a>
              <a className="btn btn-ghost" href={`/events/${trpcEvent.slug}/calendar.ics`} download>
                Download .ics File
              </a>
            </div>
          </div>

          <div className="dept-overview-card bg-[var(--forest-2)] text-white" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
            <span className="caps text-[10px] text-[var(--gold)]">Programme Overview</span>
            <h2 className="serif text-3xl text-white">About This Event</h2>
            <RichTextRenderer
              doc={eventDescriptionDoc}
              className="text-[16px] leading-relaxed text-[var(--mint-2)]"
            />
            <div className="pt-2">
              <a
                href="https://maps.app.goo.gl/Xsw46j3imr8MkfNk8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link text-[var(--gold)]"
              >
                <Pin size={15} />
                <span>Open {trpcEvent.venueName} in Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="programme dark" aria-labelledby="trpc-prog-title">
        <div className="wrap">
          <div className="aside">
            <span className="eyebrow on-dark caps">Programme Schedule</span>
            <h2 id="trpc-prog-title" className="h2 serif">
              Timetable &amp; <span className="it gold">Agenda</span>
            </h2>
            <p style={{ margin: 0, color: "var(--mint-2)", lineHeight: 1.6, fontSize: 17 }}>
              Sync this schedule to your phone or laptop calendar with 1-click Google Calendar integration or universal
              <code> .ics</code> export.
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="btn btn-solid" href={gcalUrl} target="_blank" rel="noopener noreferrer">
                Sync to Google Calendar
              </a>
              <a className="btn btn-ghost" href={`/events/${trpcEvent.slug}/calendar.ics`} download>
                Download .ics
              </a>
            </div>
          </div>
          <Timeline items={defaultAgenda} />
        </div>
      </section>

      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
            { name: trpcEvent.title, path: `/events/${trpcEvent.slug}` },
          ]),
        ]}
      />
    </>
  );
}
