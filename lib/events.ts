export type ProgrammeItem = {
  time: string; // 24h, WAT
  title: string;
  detail: string;
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
    mapsQuery: string;
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
      mapsQuery: "5 Arms, University of Uyo Permanent Site, Uyo",
    },
    flyer: {
      src: "/images/inauguration-flyer.jpg",
      width: 1080,
      height: 720,
      alt: "Official flyer for the inauguration of the 4th Executive Council, NACOS UNIUYO, showing all twelve officers-elect",
    },
    hashtags: ["#TheRevolution", "#4thExco", "#NACOSUNIUYO"],
    programme: [
      {
        time: "11:30",
        title: "Arrival and Registration",
        detail: "Ushers receive students, staff, alumni and invited guests and show everyone to their seats.",
      },
      {
        time: "11:45",
        title: "Arrival of Dignitaries",
        detail: "Invited dignitaries are received and seated at the high table.",
      },
      {
        time: "12:00",
        title: "Opening Processional",
        detail: "The executives-elect walk in together to open the ceremony. Proceedings start on time.",
      },
      { time: "12:05", title: "National Anthem", detail: "Everyone stands for the National Anthem." },
      { time: "12:08", title: "University Anthem", detail: "Everyone remains standing for the University of Uyo Anthem." },
      { time: "12:12", title: "Opening Prayer", detail: "A short prayer for the ceremony and for the incoming council." },
      {
        time: "12:15",
        title: "Welcome Address",
        detail: "A welcome to guests, staff and students on behalf of the transition committee.",
      },
      {
        time: "12:25",
        title: "Introduction of Dignitaries",
        detail: "The dignitaries in attendance are introduced to the audience.",
      },
      {
        time: "12:35",
        title: "Presentation of the Executives-Elect",
        detail: "All twelve officers-elect are presented to the students who voted them in.",
      },
      {
        time: "12:50",
        title: "Oath of Office",
        detail:
          "The President-elect, Banny Confidence Jack, takes the oath of office, followed by the collective oath of the council.",
      },
      {
        time: "13:05",
        title: "Official Inauguration of the 4th Executive Council",
        detail: "The council is declared inaugurated and the mandate formally changes hands.",
      },
      {
        time: "13:15",
        title: "Decoration of the President",
        detail: "The new President is decorated, the visible handover of office.",
      },
      {
        time: "13:25",
        title: "Inaugural Address",
        detail: "President Banny Confidence Jack delivers the first address of the new administration.",
      },
      {
        time: "13:45",
        title: "The Revolution: Vision and Agenda",
        detail:
          "The council walks through its priorities for the session, from Open-Track and Guide-U to hackathons and SIWES placements.",
      },
      {
        time: "14:05",
        title: "Goodwill Messages",
        detail: "Messages from sister associations, past executives, alumni and friends of the chapter.",
      },
      {
        time: "14:20",
        title: "Remarks by the Dean, Faculty of Computing",
        detail: "The Dean or a representative gives remarks and a charge to the new officers.",
      },
      {
        time: "14:35",
        title: "Remarks by the Special Guest",
        detail: "The special guest of honour addresses the audience.",
      },
      {
        time: "14:55",
        title: "Recognition of Special Guests",
        detail: "Special guests are acknowledged for their presence and support.",
      },
      {
        time: "15:05",
        title: "Vote of Thanks",
        detail: "Thanks to everyone who came out and everyone who made the day possible.",
      },
      { time: "15:15", title: "Closing Prayer", detail: "The ceremony closes with prayer." },
      {
        time: "15:20",
        title: "Group Photographs",
        detail: "Official photographs of the council with dignitaries, staff and guests.",
      },
      {
        time: "15:35",
        title: "Refreshments and Networking",
        detail: "Food, music and time to meet the new council.",
      },
    ],
  },
];

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}

export const featuredEvent = events[0];

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

export function mapsUrl(e: NacosEvent) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.venue.mapsQuery)}`;
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
