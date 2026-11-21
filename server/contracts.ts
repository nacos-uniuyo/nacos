import { z } from "zod";
import {
  opportunityStatuses,
  opportunityTypes,
  projectCategories,
  roleNames,
  roleTiers,
} from "@/lib/enums";

/**
 * Read contracts for the public portal and member dashboard. These describe
 * what pages receive, not the storage shape. The Drizzle tables in
 * docs/rfc-cms-architecture.md are the source of truth; each contract here
 * maps onto one of them.
 */

export const roleTier = z.enum(roleTiers);
export const roleName = z.enum(roleNames);
export const projectCategory = z.enum(projectCategories);
export const opportunityType = z.enum(opportunityTypes);
export const opportunityStatus = z.enum(opportunityStatuses);

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

/* -------------------------------------------------------------------------- */
/* Phase 4: Member Dashboard Contracts                                       */
/* -------------------------------------------------------------------------- */

export const userProfile = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  role: roleName,
  departmentId: z.string().uuid().nullable(),
  departmentName: z.string().nullable(),
  departmentSlug: z.string().nullable(),
  regNumber: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  claimedPerson: z
    .object({
      id: z.string().uuid(),
      slug: z.string(),
      fullName: z.string(),
      photoUrl: z.string().nullable(),
      currentRole: z.string().nullable(),
    })
    .nullable(),
});

export const dashboardStats = z.object({
  submittedProjectsCount: z.number(),
  approvedProjectsCount: z.number(),
  pendingProjectsCount: z.number(),
  submittedOpportunitiesCount: z.number(),
  savedBookmarksCount: z.number(),
  hasCompletedProfile: z.boolean(),
});

export const memberProjectSubmission = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  category: projectCategory,
  departmentId: z.string().uuid(),
  departmentName: z.string().nullable(),
  departmentSlug: z.string().nullable(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]),
  rejectionReason: z.string().nullable(),
  bannerUrl: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const memberOpportunitySubmission = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  orgName: z.string(),
  type: opportunityType,
  status: opportunityStatus,
  rejectionReason: z.string().nullable(),
  location: z.string(),
  deadline: z.date().or(z.string()).nullable(),
  applyUrl: z.string(),
  createdAt: z.date().or(z.string()),
});

export const bookmarkedOpportunity = z.object({
  bookmarkId: z.string().uuid(),
  bookmarkedAt: z.date().or(z.string()),
  opportunity: z.object({
    id: z.string().uuid(),
    slug: z.string(),
    title: z.string(),
    orgName: z.string(),
    orgLogoUrl: z.string().nullable(),
    type: opportunityType,
    location: z.string(),
    deadline: z.date().or(z.string()).nullable(),
    applyUrl: z.string(),
    status: opportunityStatus,
  }),
});

export type DepartmentSummary = z.infer<typeof departmentSummary>;
export type SchoolSessionSummary = z.infer<typeof schoolSessionSummary>;
export type PersonSummary = z.infer<typeof personSummary>;
export type ProjectSummary = z.infer<typeof projectSummary>;
export type OpportunitySummary = z.infer<typeof opportunitySummary>;
export type EventSummary = z.infer<typeof eventSummary>;
export type PostSummary = z.infer<typeof postSummary>;
export type GoodwillSummary = z.infer<typeof goodwillSummary>;
export type UserProfile = z.infer<typeof userProfile>;
export type DashboardStats = z.infer<typeof dashboardStats>;
export type MemberProjectSubmission = z.infer<typeof memberProjectSubmission>;
export type MemberOpportunitySubmission = z.infer<typeof memberOpportunitySubmission>;
export type BookmarkedOpportunity = z.infer<typeof bookmarkedOpportunity>;
