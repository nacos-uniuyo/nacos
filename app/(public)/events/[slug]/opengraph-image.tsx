import { notFound } from "next/navigation";
import { events, getEvent } from "@/lib/events";
import { eventCard, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = `${events[0].title}, NACOS UNIUYO. Official flyer with date, time and venue.`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEvent((await params).slug);
  if (!e) notFound();
  return eventCard(e, { kicker: `${e.theme.toUpperCase()} · 4TH EXECUTIVE COUNCIL`, title: e.title });
}
