import { env } from "@/env";

export const SITE_URL = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

export const site = {
  name: "NACOS UNIUYO",
  legalName: "Nigeria Association of Computing Students, University of Uyo Chapter",
  shortDescription:
    "The Nigeria Association of Computing Students at the University of Uyo. Hackathons, tech trainings, SIWES support and a student body that shows its work in public.",
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
  siteName: site.name,
  locale: "en_NG",
  type: "website" as const,
};
