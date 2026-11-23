import { featuredEvent } from "@/lib/events";
import { eventCard, OG_SIZE, OG_TYPE } from "@/lib/og";

export const alt = `Events at NACOS UNIUYO. Up next: ${featuredEvent.title}.`;
export const size = OG_SIZE;
export const contentType = OG_TYPE;

export default function Image() {
  return eventCard(featuredEvent, { kicker: "NACOS UNIUYO EVENTS · UP NEXT", title: featuredEvent.title });
}
