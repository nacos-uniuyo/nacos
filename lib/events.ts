export type ProgrammeItem = {
  /** Start time, 24h, WAT. */
  time: string;
  title: string;
};

export type NacosEvent = {
  slug: string;
  title: string;
  shortTitle: string;
  kicker: string;
  theme: string;
  summary: string;
  description: string;
  /** ISO 8601 with the Lagos offset. */
  start: string;
  end: string;
  venue: {
    name: string;
    area: string;
    institution: string;
    locality: string;
    region: string;
    country: string;
    /** Exact pin shared by the organisers. */
    geo: { lat: number; lng: number };
    mapLink: string;
  };
  flyer: { src: string; width: number; height: number; alt: string };
  hashtags: string[];
  programme: ProgrammeItem[];
};

export const events: NacosEvent[] = [
  {
    slug: "inauguration-4th-executive-council",
    title: "Inauguration of the 4th Executive Council",
    shortTitle: "Inauguration Ceremony",
    kicker: "The Revolution · 4th Executive Council",
    theme: "The Revolution",
    summary:
      "The formal swearing-in of the 4th Executive Council of NACOS, University of Uyo Chapter, led by President Banny Confidence Jack.",
    description:
      "Twelve officers take the oath of office and the mandate passes to a new administration. Students, staff of the Faculty of Computing, alumni and guests are welcome to witness the start of The Revolution.",
    start: "2026-10-09T12:00:00+01:00",
    end: "2026-10-09T16:30:00+01:00",
    venue: {
      name: "5 Arms",
      area: "Permanent Site",
      institution: "University of Uyo",
      locality: "Uyo",
      region: "Akwa Ibom",
      country: "NG",
      geo: { lat: 5.042836, lng: 7.977232 },
      mapLink: "https://maps.app.goo.gl/Xsw46j3imr8MkfNk8",
    },
    flyer: {
      src: "/images/inauguration-flyer.jpg",
      width: 1080,
      height: 720,
      alt: "Official flyer for the inauguration of the 4th Executive Council, NACOS UNIUYO, showing all twelve officers-elect",
    },
    hashtags: ["#TheRevolution", "#4thExco", "#NACOSUNIUYO"],
    // Official order of events, as published by the organising committee.
    programme: [
      { time: "12:00", title: "Arrival and Registration of Guests" },
      { time: "12:15", title: "Seating and Reception of Dignitaries" },
      { time: "12:25", title: "Processional Entry of the Newly Elected Executives" },
      { time: "12:30", title: "National Anthem" },
      { time: "12:35", title: "University Anthem" },
      { time: "12:40", title: "Opening Prayer" },
      { time: "12:45", title: "Welcome Address" },
      { time: "12:55", title: "Introduction and Recognition of Dignitaries" },
      { time: "13:05", title: "Presentation of the Newly Elected NACOS Executives" },
      { time: "13:20", title: "Administration of the Oath of Office" },
      { time: "13:35", title: "Official Inauguration of the Executive Council" },
      { time: "13:45", title: "Inaugural Address by the NACOS President" },
      { time: "14:05", title: "Presentation of the Administration's Vision and Agenda" },
      { time: "14:20", title: "Goodwill Messages from Invited Guests and Sister Associations" },
      { time: "14:40", title: "Remarks by the Faculty Representative / Staff Adviser" },
      { time: "14:55", title: "Remarks by the Distinguished Guest / Keynote Speaker" },
      { time: "15:10", title: "Recognition and Appreciation of Special Guests" },
      { time: "15:20", title: "Vote of Thanks" },
      { time: "15:25", title: "Closing Prayer" },
      { time: "15:30", title: "Official Group Photograph" },
      { time: "15:40", title: "Refreshments, Networking and Entertainment" },
    ],
  },
];

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}

export const featuredEvent = events[0];

/** 12h start time of the first programme item whose title matches. */
export function startOf(e: NacosEvent, title: RegExp) {
  const item = e.programme.find((p) => title.test(p.title));
  return item ? to12h(item.time) : formatEventTime(e.start);
}

const lagos = { timeZone: "Africa/Lagos" } as const;

export function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    ...lagos,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatEventTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", { ...lagos, hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function to12h(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

function icsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function venueLine(e: NacosEvent) {
  return `${e.venue.name}, ${e.venue.institution} ${e.venue.area}, ${e.venue.locality}`;
}

export function googleCalendarUrl(e: NacosEvent, pageUrl: string) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.title}, NACOS UNIUYO`,
    dates: `${icsStamp(e.start)}/${icsStamp(e.end)}`,
    details: `${e.summary}\n\n${pageUrl}`,
    location: venueLine(e),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Turn-by-turn directions to the exact pin. */
export function directionsUrl(e: NacosEvent) {
  return `https://www.google.com/maps/dir/?api=1&destination=${e.venue.geo.lat},${e.venue.geo.lng}`;
}

export function formatCoords({ lat, lng }: { lat: number; lng: number }) {
  const f = (n: number, pos: string, neg: string) => `${Math.abs(n).toFixed(4)}° ${n >= 0 ? pos : neg}`;
  return `${f(lat, "N", "S")}, ${f(lng, "E", "W")}`;
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function toIcs(e: NacosEvent, pageUrl: string) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NACOS UNIUYO//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.slug}@nacos-uniuyo`,
    `DTSTAMP:${icsStamp(e.start)}`,
    `DTSTART:${icsStamp(e.start)}`,
    `DTEND:${icsStamp(e.end)}`,
    `SUMMARY:${icsEscape(`${e.title}, NACOS UNIUYO`)}`,
    `DESCRIPTION:${icsEscape(`${e.summary}\n\n${pageUrl}`)}`,
    `LOCATION:${icsEscape(venueLine(e))}`,
    `GEO:${e.venue.geo.lat};${e.venue.geo.lng}`,
    `URL:${pageUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(e.shortTitle)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
