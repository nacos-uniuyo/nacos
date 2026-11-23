import { notFound } from "next/navigation";
import { events, getEvent } from "@/lib/events";
import { eventCard, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = `Programme of events for the ${events[0].title.toLowerCase()}, NACOS UNIUYO.`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEvent((await params).slug);
  if (!e) notFound();
  return eventCard(e, { kicker: "OFFICIAL ORDER OF EVENTS", title: `Programme: ${e.shortTitle}` });
}
