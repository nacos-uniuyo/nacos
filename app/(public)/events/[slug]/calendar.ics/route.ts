import { events, getEvent, toIcs } from "@/lib/events";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const e = getEvent((await params).slug);
  if (!e) return new Response("Not found", { status: 404 });

  return new Response(toIcs(e, absoluteUrl(`/events/${e.slug}`)), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="nacos-uniuyo-${e.slug}.ics"`,
    },
  });
}
