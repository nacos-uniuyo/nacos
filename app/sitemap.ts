import type { MetadataRoute } from "next";
import { events } from "@/lib/events";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/executives"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/events"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...events.flatMap((e) => [
      {
        url: absoluteUrl(`/events/${e.slug}`),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.9,
        images: [absoluteUrl(e.flyer.src)],
      },
      {
        url: absoluteUrl(`/events/${e.slug}/programme`),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      },
    ]),
  ];
}
