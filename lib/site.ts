import { env } from "@/env";

export const SITE_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

export const site = {
  name: "NACOS UNIUYO",
  coBrandName: "University of Uyo & NACOS UNIUYO Chapter",
  coBrandLabel: "UNIVERSITY OF UYO & NACOS UNIUYO CHAPTER",
  universityName: "University of Uyo",
  facultyName: "Faculty of Computing, University of Uyo",
  legalName: "Nigeria Association of Computing Students, University of Uyo Chapter",
  shortDescription:
    "Official digital flagship of the Faculty of Computing, University of Uyo (UNIUYO) and the Nigeria Association of Computing Students (NACOS UNIUYO Chapter). Explore department hubs, student innovation projects, SIWES & career opportunities, digital yearbooks, and faculty events.",
  tagline: "Building Capacity. Fostering Innovation.",
  address: {
    street: "Faculty of Computing, University of Uyo",
    locality: "Uyo",
    region: "Akwa Ibom",
    country: "NG",
  },
  social: {
    x: "https://x.com/Nacosuniuyo",
    national: "https://nacos.org.ng",
    github: "https://github.com/nacos-uniuyo/nacos",
    uniuyo: "https://uniuyo.edu.ng",
  },
  xHandle: "@Nacosuniuyo",
} as const;

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Next.js replaces (not merges) openGraph per page, so every page spreads these in.
 * Share images come from the opengraph-image/twitter-image files in each route.
 */
export const ogDefaults = {
  siteName: `${site.name} · ${site.universityName}`,
  locale: "en_NG",
  type: "website" as const,
};
