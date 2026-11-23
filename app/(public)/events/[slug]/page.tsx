import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { Breadcrumbs, EventSubnav, Timeline } from "@/components/EventParts";
import { ExecCard } from "@/components/ExecCard";
import { ArrowRight, Calendar, Clock, Pin } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { Button } from "@/components/ui/button";
import {
  events,
  formatEventDate,
  formatEventTime,
  getEvent,
  googleCalendarUrl,
  directionsUrl,
  formatCoords,
  startOf,
} from "@/lib/events";
import { executives } from "@/lib/executives";
import { breadcrumbSchema, eventSchema } from "@/lib/schema";
import { absoluteUrl, ogDefaults } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getEvent((await params).slug);
  if (!e) return {};
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

export default async function EventPage({ params }: Props) {
  const e = getEvent((await params).slug);
  if (!e) notFound();

  const url = absoluteUrl(`/events/${e.slug}`);
  const highlights = e.programme.filter((p) => /Processional|Oath|Inaugural Address|Vision/.test(p.title));

  return (
    <>
      <section className="relative bg-[var(--forest)] text-white overflow-hidden py-[clamp(56px,8vw,96px)] pb-[clamp(72px,9vw,120px)]" aria-labelledby="event-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <div className="wrap relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-14 items-center">
          <div className="flex flex-col gap-7">
            <Breadcrumbs
              items={[
                { name: "NACOS UNIUYO", path: "/" },
                { name: "Events", path: "/events" },
                { name: e.shortTitle ?? e.title },
              ]}
            />
            <span className="eyebrow on-dark caps fade d1">{e.kicker}</span>
            <h1 id="event-title" className="serif m-0 text-[clamp(56px,8.6vw,124px)] leading-[0.92] tracking-[-0.02em]">
              <span className="line">
                <span className="rise d1">Inauguration</span>
              </span>
              <span className="line">
                <span className="rise d2 it gold">Ceremony</span>
              </span>
              <span className="sr-only"> of the 4th Executive Council, NACOS UNIUYO</span>
            </h1>
            <p className="fade d3 m-0 max-w-[540px] text-[clamp(17px,1.7vw,19px)] leading-relaxed text-[var(--mint-2)]">
              {e.summary} {e.description}
            </p>
            <ul className="fade d3 flex flex-wrap gap-x-7 gap-y-2.5 m-0 p-0 list-none text-[15px] text-white">
              <li className="inline-flex items-center gap-2.5">
                <span className="text-[var(--gold)] shrink-0"><Calendar /></span>
                <time dateTime={e.start}>{formatEventDate(e.start)}</time>
              </li>
              <li className="inline-flex items-center gap-2.5">
                <span className="text-[var(--gold)] shrink-0"><Clock /></span>
                {formatEventTime(e.start)} prompt
              </li>
              <li className="inline-flex items-center gap-2.5">
                <span className="text-[var(--gold)] shrink-0"><Pin /></span>
                {e.venue.name}, {e.venue.institution} {e.venue.area}
              </li>
            </ul>
            <div className="fade d4">
              <Countdown start={e.start} end={e.end} />
            </div>
            <div className="fade d5 flex flex-wrap items-center gap-3.5">
              <Button asChild variant="solid">
                <Link href={`/events/${e.slug}/programme`}>
                  See the programme
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <a href={googleCalendarUrl(e, url)} target="_blank" rel="noopener noreferrer">
                  Add to Google Calendar
                </a>
              </Button>
            </div>
          </div>

          <figure className="relative m-0 fade d3 max-w-[640px]">
            <a href={e.flyer.src} target="_blank" rel="noopener">
              <Image
                src={e.flyer.src}
                alt={e.flyer.alt}
                width={e.flyer.width}
                height={e.flyer.height}
                priority
                sizes="(max-width: 960px) 92vw, 560px"
                className="w-full h-auto rounded-2xl shadow-[0_40px_90px_rgba(0,0,0,0.45)] rotate-1.5 transition-transform duration-600 hover:rotate-0 hover:scale-101"
              />
            </a>
            <figcaption className="mt-5.5 text-xs text-[var(--mint)] text-right">Official flyer · tap to open full size</figcaption>
          </figure>
        </div>
      </section>

      <EventSubnav e={e} active="overview" />

      <section className="py-[var(--section-y)]" aria-labelledby="glance-title">
        <div className="wrap flex flex-col gap-14">
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
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 m-0">
            <div className="reveal flex flex-col-reverse justify-end gap-3 border-t border-[rgba(15,26,19,0.16)] pt-6">
              <dt className="text-[15px] text-[var(--muted)] leading-normal">October 2026, Friday</dt>
              <dd className="serif m-0 text-[clamp(44px,5vw,68px)] leading-none">09</dd>
            </div>
            <div className="reveal flex flex-col-reverse justify-end gap-3 border-t border-[rgba(15,26,19,0.16)] pt-6">
              <dt className="text-[15px] text-[var(--muted)] leading-normal">Noon, West Africa Time. We start on time.</dt>
              <dd className="serif m-0 text-[clamp(44px,5vw,68px)] leading-none">
                12:00<small className="text-[0.42em] ml-1.5 text-[var(--muted)]">PM</small>
              </dd>
            </div>
            <div className="reveal flex flex-col-reverse justify-end gap-3 border-t border-[rgba(15,26,19,0.16)] pt-6">
              <dt className="text-[15px] text-[var(--muted)] leading-normal">Officers taking the oath of office</dt>
              <dd className="serif m-0 text-[clamp(44px,5vw,68px)] leading-none">{executives.length}</dd>
            </div>
            <div className="reveal flex flex-col-reverse justify-end gap-3 border-t border-[rgba(15,26,19,0.16)] pt-6">
              <dt className="text-[15px] text-[var(--muted)] leading-normal">Executive council in the chapter&rsquo;s history</dt>
              <dd className="serif m-0 text-[clamp(44px,5vw,68px)] leading-none">
                4<small className="text-[0.42em] ml-1.5 text-[var(--muted)]">th</small>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="council" className="bg-[var(--sand)] py-[var(--section-y)]" aria-labelledby="council-title">
        <div className="wrap flex flex-col gap-14">
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
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none m-0 p-0">
            {executives.map((x, i) => (
              <li key={x.slug} className="reveal">
                <ExecCard exec={x} index={i} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[var(--forest)] text-white py-[var(--section-y)]" aria-labelledby="prog-title">
        <div className="wrap grid grid-cols-1 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-[120px] flex flex-col gap-5.5">
            <span className="eyebrow on-dark caps">Order of events</span>
            <h2 id="prog-title" className="h2 serif text-white">
              The big <span className="it gold">moments</span>
            </h2>
            <p className="m-0 text-[var(--mint-2)] leading-relaxed text-[17px]">
              Guests arrive from 12:00 PM. The processional of the new executives follows at {startOf(e, /Processional/)}.
            </p>
            <div>
              <Button asChild variant="solid">
                <Link href={`/events/${e.slug}/programme`}>
                  Full programme
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <Timeline items={highlights} />
        </div>
      </section>

      <section id="venue" className="py-[var(--section-y)]" aria-labelledby="venue-title">
        <div className="wrap">
          <div className="reveal grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] bg-white rounded-3xl overflow-hidden shadow-[0_30px_70px_rgba(6,42,20,0.1)]">
            <div className="p-[clamp(32px,5vw,64px)] flex flex-col gap-5.5">
              <span className="eyebrow caps accent">Venue</span>
              <h2 id="venue-title" className="serif m-0 text-[clamp(44px,5.4vw,72px)] leading-none tracking-[-0.02em]">
                {e.venue.name}
              </h2>
              <address className="not-italic text-[17px] leading-relaxed text-[var(--muted)]">
                {e.venue.institution} {e.venue.area}
                <br />
                {e.venue.locality}, {e.venue.region} State
                <br />
                <a className="inline-block mt-1.5 text-sm font-semibold tabular-nums text-[var(--green)] hover:underline" href={e.venue.mapLink} target="_blank" rel="noopener noreferrer">
                  Exact pin: {formatCoords(e.venue.geo)}
                </a>
              </address>
              <ul className="list-none m-0 p-0 flex flex-col gap-2.5 text-[15px] text-[var(--ink)]">
                <li className="flex gap-2.5 items-baseline before:content-[''] before:size-1.5 before:rounded-full before:bg-[var(--gold)] before:shrink-0 before:-translate-y-0.5">Arrival and registration open at {formatEventTime(e.start)}.</li>
                <li className="flex gap-2.5 items-baseline before:content-[''] before:size-1.5 before:rounded-full before:bg-[var(--gold)] before:shrink-0 before:-translate-y-0.5">The processional begins at {startOf(e, /Processional/)}.</li>
                <li className="flex gap-2.5 items-baseline before:content-[''] before:size-1.5 before:rounded-full before:bg-[var(--gold)] before:shrink-0 before:-translate-y-0.5">Refreshments and networking follow the official group photograph.</li>
              </ul>
              <div className="flex flex-wrap items-center gap-3.5">
                <Button asChild variant="dark">
                  <a href={directionsUrl(e)} target="_blank" rel="noopener noreferrer">
                    <Pin />
                    Get directions
                  </a>
                </Button>
                <Button asChild variant="line">
                  <a href={`/events/${e.slug}/calendar.ics`} download>
                    <Calendar />
                    Download .ics
                  </a>
                </Button>
              </div>
            </div>
            <div className="relative bg-[var(--forest)] min-h-[260px] lg:min-h-[360px] overflow-hidden" aria-hidden="true">
              <svg className="absolute inset-0 size-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" fill="none">
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
              </svg>
            </div>
          </div>
        </div>
      </section>

      <JsonLd data={[eventSchema(e), breadcrumbSchema([{ name: "NACOS UNIUYO", path: "/" }, { name: "Events", path: "/events" }, { name: e.title, path: `/events/${e.slug}` }])]} />
    </>
  );
}
