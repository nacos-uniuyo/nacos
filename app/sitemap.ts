import type { MetadataRoute } from "next";
import { events } from "@/lib/events";
import { absoluteUrl } from "@/lib/site";
import {
  departments,
  opportunities,
  projects,
  roster,
  schoolSessions,
} from "@/mocks/portal";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const alumniPeople = roster.filter((p) => p.tier === "alumni");
  const staffPeople = roster.filter((p) => p.tier === "staff");

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/departments"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    ...departments.map((d) => ({
      url: absoluteUrl(`/departments/${d.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    { url: absoluteUrl("/projects"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...projects.map((p) => ({
      url: absoluteUrl(`/projects/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/opportunities"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...opportunities.map((o) => ({
      url: absoluteUrl(`/opportunities/${o.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/yearbook"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...schoolSessions.map((s) => ({
      url: absoluteUrl(`/yearbook/session/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...alumniPeople.map((a) => ({
      url: absoluteUrl(`/yearbook/${a.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    { url: absoluteUrl("/staff"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    ...staffPeople.map((st) => ({
      url: absoluteUrl(`/staff/${st.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/executives"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
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
