import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, EventSubnav, Timeline } from "@/components/EventParts";
import { ArrowRight } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { HeroOrbits } from "@/components/Orbits";
import { events, formatEventDate, formatEventTime, getEvent, googleCalendarUrl, startOf } from "@/lib/events";
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
  const title = `Programme of Events, ${e.shortTitle}`;
  const description = `Full order of events for the ${e.title.toLowerCase()} of NACOS UNIUYO on ${formatEventDate(e.start)}, starting ${formatEventTime(e.start)} at ${e.venue.name}, ${e.venue.institution} ${e.venue.area}.`;
  return {
    title,
    description,
    alternates: { canonical: `/events/${e.slug}/programme` },
    openGraph: { ...ogDefaults, title, description, url: `/events/${e.slug}/programme` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProgrammePage({ params }: Props) {
  const e = getEvent((await params).slug);
  if (!e) notFound();

  const path = `/events/${e.slug}/programme`;

  return (
    <>
      <section className="page-hero" aria-labelledby="prog-title">
        <div className="grid-bg drift" aria-hidden="true" />
        <HeroOrbits label="{ 09 · 10 · 26 }" className="hero-orbits fade" />
        <div className="wrap">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Events", path: "/events" },
              { name: "Inauguration", path: `/events/${e.slug}` },
              { name: "Programme" },
            ]}
          />
          <span className="eyebrow on-dark caps fade d1">{e.kicker}</span>
          <h1 id="prog-title" className="serif">
            <span className="line">
              <span className="rise d1">Programme</span>
            </span>
            <span className="line">
              <span className="rise d2 it gold">of Events</span>
            </span>
          </h1>
          <p className="fade d3">
            The ceremony holds on {formatEventDate(e.start)} at {e.venue.name}, {e.venue.institution} {e.venue.area}.
            Arrival starts at {formatEventTime(e.start)} prompt. This is the official order of events.
          </p>
        </div>
      </section>

      <EventSubnav e={e} active="programme" />

      <section className="programme" aria-labelledby="order-title">
        <div className="wrap">
          <div className="aside">
            <span className="eyebrow caps accent">Order of the ceremony</span>
            <h2 id="order-title" className="h2 serif">
              Arrive by <span className="it accent">noon.</span>
            </h2>
            <p className="lead">
              Dignitaries are seated from {startOf(e, /Dignitaries/)} and the new executives process in at{" "}
              {startOf(e, /Processional/)}.
            </p>
            <div className="cta-row">
              <a
                className="btn btn-dark"
                href={googleCalendarUrl(e, absoluteUrl(`/events/${e.slug}`))}
                target="_blank"
                rel="noopener noreferrer"
              >
                Add to calendar
              </a>
              <Link className="text-link" href={`/events/${e.slug}#venue`}>
                Directions
                <ArrowRight />
              </Link>
            </div>
          </div>
          <Timeline items={e.programme} />
        </div>
      </section>

      <JsonLd
        data={[
          eventSchema(e),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Events", path: "/events" },
            { name: e.shortTitle, path: `/events/${e.slug}` },
            { name: "Programme", path },
          ]),
        ]}
      />
    </>
  );
}
