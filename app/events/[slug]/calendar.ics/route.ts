import { events, getEvent, toIcs } from "@/lib/events";
import { absoluteUrl } from "@/lib/site";
import { appRouter } from "@/server/routers";

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const caller = appRouter.createCaller({ session: null });
  const trpcEvents = await caller.event.list();
  const slugs = new Set([...events.map((e) => e.slug), ...trpcEvents.map((e) => e.slug)]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

function icsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = getEvent(slug);
  if (e) {
    return new Response(toIcs(e, absoluteUrl(`/events/${e.slug}`)), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="nacos-uniuyo-${e.slug}.ics"`,
      },
    });
  }

  const caller = appRouter.createCaller({ session: null });
  const trpcEvent = await caller.event.bySlug({ slug });
  if (!trpcEvent) {
    return new Response("Not found", { status: 404 });
  }

  const pageUrl = absoluteUrl(`/events/${trpcEvent.slug}`);
  const icsBody = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NACOS UNIUYO//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${trpcEvent.slug}@nacos-uniuyo`,
    `DTSTAMP:${icsStamp(trpcEvent.startDate)}`,
    `DTSTART:${icsStamp(trpcEvent.startDate)}`,
    `DTEND:${icsStamp(trpcEvent.endDate)}`,
    `SUMMARY:${icsEscape(`${trpcEvent.title}, NACOS UNIUYO`)}`,
    `DESCRIPTION:${icsEscape(`${trpcEvent.tagline ?? trpcEvent.title}\n\n${pageUrl}`)}`,
    `LOCATION:${icsEscape(`${trpcEvent.venueName}, University of Uyo`)}`,
    `URL:${pageUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(icsBody, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="nacos-uniuyo-${trpcEvent.slug}.ics"`,
    },
  });
}
