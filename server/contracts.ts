import { z } from "zod";
import { opportunityTypes, projectCategories, roleTiers } from "@/lib/enums";

/**
 * Read contracts for the public portal. These describe what a page receives,
 * not the storage shape. The Drizzle tables in docs/rfc-cms-architecture.md
 * are the source of truth; each contract here maps onto one of them.
 */

export const roleTier = z.enum(roleTiers);

export const projectCategory = z.enum(projectCategories);

export const opportunityType = z.enum(opportunityTypes);

export const departmentSummary = z.object({
  slug: z.string(),
  name: z.string(),
  shortName: z.string(),
  summary: z.string(),
  hodName: z.string().nullable(),
});

export const schoolSessionSummary = z.object({
  slug: z.string(),
  name: z.string(),
  theme: z.string().nullable(),
  isCurrent: z.boolean(),
});

export const personSummary = z.object({
  slug: z.string(),
  fullName: z.string(),
  roleTitle: z.string(),
  tier: roleTier,
  sessionSlug: z.string(),
  departmentSlug: z.string().nullable(),
  photoUrl: z.string().nullable(),
  isFeaturedHomepage: z.boolean(),
});

export const projectSummary = z.object({
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  category: projectCategory,
  departmentSlug: z.string(),
  courseCode: z.string().nullable(),
  teamDisplayName: z.string().nullable(),
  repoUrl: z.string().nullable(),
  demoUrl: z.string().nullable(),
  featured: z.boolean(),
});

export const opportunitySummary = z.object({
  slug: z.string(),
  title: z.string(),
  orgName: z.string(),
  type: opportunityType,
  departmentSlug: z.string().nullable(),
  location: z.string(),
  deadline: z.string().nullable(),
  applyUrl: z.string(),
});

export const eventSummary = z.object({
  slug: z.string(),
  title: z.string(),
  tagline: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  venueName: z.string(),
  flyerUrl: z.string().nullable(),
});

export const postSummary = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  publishedAt: z.string().nullable(),
  coverUrl: z.string().nullable(),
  featured: z.boolean(),
});

export const goodwillSummary = z.object({
  authorName: z.string(),
  authorTitle: z.string(),
  message: z.string(),
});

export type DepartmentSummary = z.infer<typeof departmentSummary>;
export type SchoolSessionSummary = z.infer<typeof schoolSessionSummary>;
export type PersonSummary = z.infer<typeof personSummary>;
export type ProjectSummary = z.infer<typeof projectSummary>;
export type OpportunitySummary = z.infer<typeof opportunitySummary>;
export type EventSummary = z.infer<typeof eventSummary>;
export type PostSummary = z.infer<typeof postSummary>;
export type GoodwillSummary = z.infer<typeof goodwillSummary>;
